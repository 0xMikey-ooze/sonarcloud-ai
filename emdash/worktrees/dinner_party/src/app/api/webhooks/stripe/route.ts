import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getStripe } from "@/lib/stripe"
import { getAvailableCapacity } from "@/lib/rsvp"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const existingEvent = await db.providerEvent.findUnique({
    where: {
      provider_providerEventId: {
        provider: "stripe",
        providerEventId: event.id,
      },
    },
  })

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  const payloadHash = crypto.createHash("sha256").update(body).digest("hex")

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const rsvpId = session.metadata?.rsvpId

    if (rsvpId) {
      const rsvp = await db.rsvp.findUnique({
        where: { id: rsvpId },
        include: { dinnerParty: true },
      })

      if (rsvp && rsvp.status === "pending_payment") {
        const available = await getAvailableCapacity(rsvp.dinnerPartyId)

        if (available > 0 || rsvp.dinnerParty.capacity > 0) {
          await db.rsvp.update({
            where: { id: rsvpId },
            data: { status: "confirmed" },
          })

          await db.payment.updateMany({
            where: { rsvpId, stripeCheckoutSessionId: session.id },
            data: {
              status: "paid",
              stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
              rawProviderStatus: session.payment_status,
              paidAt: new Date(),
            },
          })
        } else {
          await db.payment.updateMany({
            where: { rsvpId, stripeCheckoutSessionId: session.id },
            data: { status: "failed", rawProviderStatus: "capacity_exceeded" },
          })
        }
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object
    const rsvpId = session.metadata?.rsvpId

    if (rsvpId) {
      await db.rsvp.update({
        where: { id: rsvpId },
        data: { status: "expired" },
      })

      await db.payment.updateMany({
        where: { rsvpId, stripeCheckoutSessionId: session.id },
        data: { status: "expired" },
      })
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object
    const rsvpId = pi.metadata?.rsvpId

    if (rsvpId) {
      await db.payment.updateMany({
        where: { rsvpId, stripePaymentIntentId: pi.id },
        data: { status: "failed", rawProviderStatus: pi.status },
      })
    }
  }

  const eventObj = event.data.object as unknown as Record<string, unknown>
  const metadata = (eventObj?.metadata || {}) as Record<string, string>

  await db.providerEvent.create({
    data: {
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      relatedRecordType: metadata.rsvpId ? "Rsvp" : null,
      relatedRecordId: metadata.rsvpId || null,
      payloadHash,
      processedAt: new Date(),
    },
  })

  return NextResponse.json({ received: true })
}
