import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(restaurants)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const restaurant = await db.restaurant.create({
    data: {
      name: body.name.trim(),
      websiteUrl: body.websiteUrl || null,
      googleMapsUrl: body.googleMapsUrl || null,
      addressLine: body.addressLine || null,
      phone: body.phone || null,
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
    },
  })

  return NextResponse.json(restaurant, { status: 201 })
}
