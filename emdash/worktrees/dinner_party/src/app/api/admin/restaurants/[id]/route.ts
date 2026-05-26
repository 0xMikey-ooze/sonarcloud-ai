import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json()

  const restaurant = await db.restaurant.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name.trim() }),
      websiteUrl: body.websiteUrl,
      googleMapsUrl: body.googleMapsUrl,
      addressLine: body.addressLine,
      phone: body.phone,
      notes: body.notes,
      imageUrl: body.imageUrl,
      ...(body.active !== undefined && { active: body.active }),
    },
  })

  return NextResponse.json(restaurant)
}
