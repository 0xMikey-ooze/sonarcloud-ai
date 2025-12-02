import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { createLogger } from '@/lib/logger';
import { createPaymentIntentSchema, parseWithErrors } from '@/lib/validations';

const log = createLogger('payment-intent');

// Lazy initialization of Stripe
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  // Rate Limiting (stricter for payment)
  const clientId = getClientIdentifier(request);
  const { success } = await rateLimiters.payment.limit(clientId);
  if (!success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = parseWithErrors(createPaymentIntentSchema, body);
    if (!validation.success) {
      log.warn('Payment intent validation failed', { errors: validation.errors });
      return NextResponse.json(
        { success: false, error: 'Validation failed', code: 'VALIDATION_ERROR', details: validation.errors },
        { status: 400 }
      );
    }

    const { tourId, adultPax, childPax, couponCode, currency } = validation.data;

    // 1. Fetch Tour Price from Firestore (using admin SDK)
    const adminDb = getAdminDb();
    const tourRef = adminDb.collection('tours').doc(tourId);
    const tourSnap = await tourRef.get();

    let tourData: { name: string; price: number; childPrice?: number };
    if (!tourSnap.exists) {
      // Use default tour pricing if tour not found
      tourData = {
        name: 'Sugar City Express Food Tour',
        price: 85,
        childPrice: 45
      };
    } else {
      const data = tourSnap.data()!;
      tourData = {
        name: data.name || 'Sugar City Express Food Tour',
        price: data.price || 85,
        childPrice: data.childPrice
      };
    }

    // Base price per person
    const price = tourData.price;
    const childPrice = tourData.childPrice || tourData.price;

    if (!price || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid tour price', code: 'INVALID_PRICE' },
        { status: 500 }
      );
    }

    const adultCount = typeof adultPax === 'number' ? adultPax : parseInt(String(adultPax || 0));
    const childCount = typeof childPax === 'number' ? childPax : parseInt(String(childPax || 0));
    const pax = adultCount + childCount;

    // Calculate subtotal
    const subtotal = (price * adultCount) + (childPrice * childCount);
    let discount = 0;
    let couponDetails = null;

    // 2. Apply Coupon if provided
    if (couponCode) {
      const couponQuery = adminDb.collection('coupons')
        .where('code', '==', couponCode.toUpperCase())
        .limit(1);
      const couponSnap = await couponQuery.get();

      if (!couponSnap.empty) {
        const couponDoc = couponSnap.docs[0];
        const coupon = couponDoc.data();

        // Validate coupon
        if (!coupon.used && new Date(coupon.expiresAt) > new Date()) {
          couponDetails = {
            id: couponDoc.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            label: coupon.label
          };

          switch (coupon.type) {
            case 'percentage':
              discount = Math.round((subtotal * coupon.value) / 100 * 100) / 100;
              break;
            case 'fixed':
              discount = Math.min(coupon.value, subtotal);
              break;
            case 'free_ride':
              discount = subtotal;
              break;
            case 'free_item':
              // Free drink - no price discount
              discount = 0;
              break;
          }
        }
      }
    }

    // 3. Calculate Final Amount
    const finalTotal = Math.max(0, subtotal - discount);
    const amountInCents = Math.round(finalTotal * 100);

    // 4. If free ride, return without creating payment intent
    if (amountInCents === 0) {
      return NextResponse.json({
        success: true,
        data: {
          clientSecret: null,
          isFreeRide: true,
          pricing: {
            pricePerPerson: price, // Deprecated
            adultPrice: price,
            childPrice: childPrice,
            pax,
            adultPax: adultCount,
            childPax: childCount,
            subtotal,
            discount,
            finalTotal: 0,
            coupon: couponDetails
          }
        }
      });
    }

    // 5. Create PaymentIntent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInCents,
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        tourId,
        tourName: tourData.name,
        pax: pax.toString(),
        couponCode: couponCode || '',
        discount: discount.toString(),
        subtotal: subtotal.toString()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        isFreeRide: false,
        pricing: {
        pricePerPerson: price, // Deprecated
        adultPrice: price,
        childPrice: childPrice,
        pax,
        adultPax: adultCount,
        childPax: childCount,
        subtotal,
        discount,
        finalTotal,
        coupon: couponDetails
        }
      }
    });

  } catch (error) {
    // Scrub PII from logs - don't log sensitive data
    log.error('POST /api/create-payment-intent error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
