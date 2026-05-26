import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json()

  if (!body.rsvpId || !body.status) {
    return NextResponse.json({ error: "rsvpId and status required" }, { status: 400 })
  }

  const rsvp = await db.rsvp.update({
    where: { id: body.rsvpId, dinnerPartyId: id },
    data: { status: body.status },
  })

  await logAudit({
    adminUserId: session.user.id!,
    action: "rsvp_status_change",
    targetType: "Rsvp",
    targetId: body.rsvpId,
    metadata: { newStatus: body.status, dinnerPartyId: id },
  })

  return NextResponse.json(rsvp)
}
