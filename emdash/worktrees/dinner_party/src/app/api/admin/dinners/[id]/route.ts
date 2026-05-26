import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params

  const dinner = await db.dinnerParty.findUnique({
    where: { id },
    include: {
      restaurant: true,
      rsvps: {
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!dinner) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(dinner)
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title.trim()
  if (body.restaurantId !== undefined) data.restaurantId = body.restaurantId
  if (body.description !== undefined) data.description = body.description
  if (body.startsAt !== undefined) data.startsAt = new Date(body.startsAt)
  if (body.timezone !== undefined) data.timezone = body.timezone
  if (body.capacity !== undefined) data.capacity = body.capacity
  if (body.rsvpDeadline !== undefined) data.rsvpDeadline = body.rsvpDeadline ? new Date(body.rsvpDeadline) : null
  if (body.priceCents !== undefined) data.priceCents = body.priceCents
  if (body.priceDescription !== undefined) data.priceDescription = body.priceDescription
  if (body.paymentRequired !== undefined) data.paymentRequired = body.paymentRequired
  if (body.allowMaybe !== undefined) data.allowMaybe = body.allowMaybe
  if (body.status !== undefined) data.status = body.status

  const dinner = await db.dinnerParty.update({ where: { id }, data })

  if (body.status) {
    await logAudit({
      adminUserId: session.user.id!,
      action: `dinner_status_change`,
      targetType: "DinnerParty",
      targetId: id,
      metadata: { newStatus: body.status },
    })
  }

  return NextResponse.json(dinner)
}
