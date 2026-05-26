import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { logAudit } from "@/lib/audit"

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json()

  if (!body.rsvpId || !body.paymentId) {
    return NextResponse.json({ error: "rsvpId and paymentId required" }, { status: 400 })
  }

  const payment = await db.payment.findFirst({
    where: {
      id: body.paymentId,
      rsvpId: body.rsvpId,
      status: "paid",
    },
    include: { rsvp: true },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found or not refundable" }, { status: 404 })
  }

  if (!payment.stripePaymentIntentId) {
    return NextResponse.json({ error: "No Stripe payment to refund" }, { status: 400 })
  }

  try {
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    })
  } catch {
    return NextResponse.json({ error: "Stripe refund failed" }, { status: 500 })
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "refunded", refundedAt: new Date() },
  })

  await db.rsvp.update({
    where: { id: body.rsvpId },
    data: { status: "refunded" },
  })

  await logAudit({
    adminUserId: session.user.id!,
    action: "payment_refund",
    targetType: "Payment",
    targetId: payment.id,
    metadata: { amountCents: payment.amountCents, dinnerPartyId: id },
  })

  return NextResponse.json({ success: true })
}
