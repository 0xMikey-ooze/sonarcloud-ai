import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizeEmail } from "@/lib/utils"
import { findExistingRsvp, getAvailableCapacity, expirePendingRsvps } from "@/lib/rsvp"
import { getStripe } from "@/lib/stripe"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { dinnerPartyId, guestName, guestEmail, rsvpStatus } = body

  if (!dinnerPartyId || !guestName || !guestEmail) {
    return NextResponse.json({ error: "Name, email, and event are required" }, { status: 400 })
  }

  const email = normalizeEmail(guestEmail)

  const dinner = await db.dinnerParty.findUnique({
    where: { id: dinnerPartyId },
    include: { restaurant: true },
  })

  if (!dinner) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  if (dinner.status !== "published") return NextResponse.json({ error: "Event is not accepting RSVPs" }, { status: 400 })
  if (dinner.rsvpDeadline && dinner.rsvpDeadline < new Date()) {
    return NextResponse.json({ error: "RSVP deadline has passed" }, { status: 400 })
  }

  await expirePendingRsvps()

  const existing = await findExistingRsvp(dinnerPartyId, email)

  if (existing) {
    if (rsvpStatus === "declined") {
      const updated = await db.rsvp.update({
        where: { id: existing.id },
        data: { status: "declined" },
      })
      return NextResponse.json({ rsvp: updated })
    }

    if (existing.status === "confirmed" || existing.status === "pending_payment") {
      return NextResponse.json({ error: "You have already RSVP'd to this event" }, { status: 409 })
    }

    if (existing.status === "declined") {
      const available = await getAvailableCapacity(dinnerPartyId)
      if (available <= 0) return NextResponse.json({ error: "Event is sold out" }, { status: 400 })

      if (dinner.paymentRequired && dinner.priceCents > 0) {
        return await createPaidRsvp(dinner, existing.id, guestName, email)
      }

      const updated = await db.rsvp.update({
        where: { id: existing.id },
        data: { status: "confirmed", guestName, priceCentsSnapshot: dinner.priceCents, currencySnapshot: dinner.currency },
      })
      return NextResponse.json({ rsvp: updated })
    }
  }

  if (rsvpStatus === "declined") {
    const rsvp = await db.rsvp.create({
      data: {
        dinnerPartyId,
        guestName: guestName.trim(),
        guestEmail: email,
        status: "declined",
        priceCentsSnapshot: dinner.priceCents,
        currencySnapshot: dinner.currency,
      },
    })
    return NextResponse.json({ rsvp }, { status: 201 })
  }

  if (rsvpStatus === "maybe" && dinner.allowMaybe && !dinner.paymentRequired) {
    const rsvp = await db.rsvp.create({
      data: {
        dinnerPartyId,
        guestName: guestName.trim(),
        guestEmail: email,
        status: "maybe",
        priceCentsSnapshot: dinner.priceCents,
        currencySnapshot: dinner.currency,
      },
    })
    return NextResponse.json({ rsvp }, { status: 201 })
  }

  const available = await getAvailableCapacity(dinnerPartyId)
  if (available <= 0) return NextResponse.json({ error: "Event is sold out" }, { status: 400 })

  if (dinner.paymentRequired && dinner.priceCents > 0) {
    return await createPaidRsvp(dinner, existing?.id, guestName, email)
  }

  const rsvp = await db.rsvp.create({
    data: {
      dinnerPartyId,
      guestName: guestName.trim(),
      guestEmail: email,
      status: "confirmed",
      priceCentsSnapshot: dinner.priceCents,
      currencySnapshot: dinner.currency,
    },
  })

  return NextResponse.json({ rsvp }, { status: 201 })
}

async function createPaidRsvp(
  dinner: { id: string; slug: string; title: string; priceCents: number; currency: string; restaurant: { name: string } },
  existingRsvpId: string | undefined,
  guestName: string,
  email: string
) {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  let rsvp
  if (existingRsvpId) {
    rsvp = await db.rsvp.update({
      where: { id: existingRsvpId },
      data: {
        status: "pending_payment",
        guestName: guestName.trim(),
        priceCentsSnapshot: dinner.priceCents,
        currencySnapshot: dinner.currency,
        expiresAt,
      },
    })
  } else {
    rsvp = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: guestName.trim(),
        guestEmail: email,
        status: "pending_payment",
        priceCentsSnapshot: dinner.priceCents,
        currencySnapshot: dinner.currency,
        expiresAt,
      },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL!
  const idempotencyKey = uuidv4()

  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: dinner.currency,
            product_data: {
              name: `${dinner.title} — ${dinner.restaurant.name}`,
              description: "Dinner party seat",
            },
            unit_amount: dinner.priceCents,
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${baseUrl}/events/${dinner.slug}/success`,
      cancel_url: `${baseUrl}/events/${dinner.slug}/cancel`,
      metadata: {
        rsvpId: rsvp.id,
        dinnerPartyId: dinner.id,
      },
      payment_intent_data: {
        metadata: {
          rsvpId: rsvp.id,
          dinnerPartyId: dinner.id,
        },
      },
    },
    { idempotencyKey }
  )

  await db.payment.create({
    data: {
      rsvpId: rsvp.id,
      stripeCheckoutSessionId: session.id,
      amountCents: dinner.priceCents,
      currency: dinner.currency,
      status: "checkout_open",
    },
  })

  return NextResponse.json({ checkoutUrl: session.url }, { status: 201 })
}
