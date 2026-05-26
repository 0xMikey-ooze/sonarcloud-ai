import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  if (!body.title || !body.restaurantId || !body.startsAt || !body.capacity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const slug = nanoid(10)

  const dinner = await db.dinnerParty.create({
    data: {
      restaurantId: body.restaurantId,
      title: body.title.trim(),
      slug,
      description: body.description || null,
      startsAt: new Date(body.startsAt),
      timezone: body.timezone || "America/New_York",
      capacity: body.capacity,
      rsvpDeadline: body.rsvpDeadline ? new Date(body.rsvpDeadline) : null,
      priceCents: body.priceCents || 0,
      currency: body.currency || "usd",
      priceDescription: body.priceDescription || null,
      paymentRequired: body.paymentRequired || false,
      allowMaybe: body.allowMaybe || false,
      status: "draft",
    },
  })

  return NextResponse.json(dinner, { status: 201 })
}
