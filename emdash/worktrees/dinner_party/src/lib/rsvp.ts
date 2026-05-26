import { db } from "@/lib/db"

const PENDING_PAYMENT_MINUTES = 30

export async function expirePendingRsvps() {
  const cutoff = new Date(Date.now() - PENDING_PAYMENT_MINUTES * 60 * 1000)

  const expired = await db.rsvp.updateMany({
    where: {
      status: "pending_payment",
      expiresAt: { lt: cutoff },
    },
    data: { status: "expired" },
  })

  return expired.count
}

export async function getAvailableCapacity(dinnerPartyId: string): Promise<number> {
  const party = await db.dinnerParty.findUniqueOrThrow({
    where: { id: dinnerPartyId },
    select: { capacity: true },
  })

  const confirmedCount = await db.rsvp.count({
    where: {
      dinnerPartyId,
      status: { in: ["confirmed", "pending_payment"] },
    },
  })

  return party.capacity - confirmedCount
}

export async function findExistingRsvp(dinnerPartyId: string, email: string) {
  const normalized = email.trim().toLowerCase()
  return db.rsvp.findFirst({
    where: {
      dinnerPartyId,
      guestEmail: normalized,
    },
  })
}
