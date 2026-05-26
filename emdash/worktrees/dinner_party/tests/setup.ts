import { afterEach, afterAll } from "vitest"

afterEach(async () => {
  const { db } = await import("@/lib/db")
  await db.payment.deleteMany()
  await db.adminAuditLog.deleteMany()
  await db.rsvp.deleteMany()
  await db.dinnerParty.deleteMany()
  await db.restaurant.deleteMany()
  await db.providerEvent.deleteMany()
  await db.adminUser.deleteMany()
})

afterAll(async () => {
  const { db } = await import("@/lib/db")
  await db.$disconnect()
})
