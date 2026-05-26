import { describe, it, expect } from "vitest"
import { db } from "@/lib/db"

async function createTestSetup() {
  const restaurant = await db.restaurant.create({
    data: { name: "Test Restaurant", active: true },
  })

  const dinner = await db.dinnerParty.create({
    data: {
      restaurantId: restaurant.id,
      title: "Paid Dinner",
      slug: `paid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      capacity: 10,
      status: "published",
      paymentRequired: true,
      priceCents: 5000,
      currency: "usd",
    },
  })

  return { restaurant, dinner }
}

describe("Admin Payment Summary", () => {
  it("calculates total collected from paid payments", async () => {
    const { dinner } = await createTestSetup()

    const rsvp1 = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
        priceCentsSnapshot: 5000,
        currencySnapshot: "usd",
      },
    })

    await db.payment.create({
      data: {
        rsvpId: rsvp1.id,
        amountCents: 5000,
        currency: "usd",
        status: "paid",
        paidAt: new Date(),
      },
    })

    const rsvp2 = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Bob",
        guestEmail: "bob@example.com",
        status: "confirmed",
        priceCentsSnapshot: 5000,
        currencySnapshot: "usd",
      },
    })

    await db.payment.create({
      data: {
        rsvpId: rsvp2.id,
        amountCents: 5000,
        currency: "usd",
        status: "paid",
        paidAt: new Date(),
      },
    })

    const dinnerWithRsvps = await db.dinnerParty.findUnique({
      where: { id: dinner.id },
      include: { rsvps: { include: { payments: true } } },
    })

    const paidPayments = dinnerWithRsvps!.rsvps
      .flatMap((r) => r.payments)
      .filter((p) => p.status === "paid")

    const totalCollected = paidPayments.reduce((sum, p) => sum + p.amountCents, 0)
    expect(totalCollected).toBe(10000)
  })

  it("excludes refunded payments from total", async () => {
    const { dinner } = await createTestSetup()

    const rsvp1 = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
        priceCentsSnapshot: 5000,
        currencySnapshot: "usd",
      },
    })

    await db.payment.create({
      data: {
        rsvpId: rsvp1.id,
        amountCents: 5000,
        currency: "usd",
        status: "paid",
        paidAt: new Date(),
      },
    })

    const rsvp2 = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Bob",
        guestEmail: "bob@example.com",
        status: "refunded",
        priceCentsSnapshot: 5000,
        currencySnapshot: "usd",
      },
    })

    await db.payment.create({
      data: {
        rsvpId: rsvp2.id,
        amountCents: 5000,
        currency: "usd",
        status: "refunded",
        paidAt: new Date(),
        refundedAt: new Date(),
      },
    })

    const dinnerWithRsvps = await db.dinnerParty.findUnique({
      where: { id: dinner.id },
      include: { rsvps: { include: { payments: true } } },
    })

    const paidPayments = dinnerWithRsvps!.rsvps
      .flatMap((r) => r.payments)
      .filter((p) => p.status === "paid")

    const totalCollected = paidPayments.reduce((sum, p) => sum + p.amountCents, 0)
    expect(totalCollected).toBe(5000)
  })
})

describe("Webhook Idempotency", () => {
  it("prevents duplicate webhook processing via unique constraint", async () => {
    await db.providerEvent.create({
      data: {
        provider: "stripe",
        providerEventId: "evt_test_123",
        eventType: "checkout.session.completed",
        processedAt: new Date(),
      },
    })

    await expect(
      db.providerEvent.create({
        data: {
          provider: "stripe",
          providerEventId: "evt_test_123",
          eventType: "checkout.session.completed",
          processedAt: new Date(),
        },
      })
    ).rejects.toThrow()
  })

  it("allows different event IDs from same provider", async () => {
    await db.providerEvent.create({
      data: {
        provider: "stripe",
        providerEventId: "evt_test_123",
        eventType: "checkout.session.completed",
        processedAt: new Date(),
      },
    })

    const second = await db.providerEvent.create({
      data: {
        provider: "stripe",
        providerEventId: "evt_test_456",
        eventType: "checkout.session.completed",
        processedAt: new Date(),
      },
    })

    expect(second.providerEventId).toBe("evt_test_456")
  })
})

describe("Audit Logging", () => {
  it("records admin actions", async () => {
    const admin = await db.adminUser.create({
      data: {
        email: "admin@test.com",
        passwordHash: "hashed",
        name: "Test Admin",
      },
    })

    await db.adminAuditLog.create({
      data: {
        adminUserId: admin.id,
        action: "payment_refund",
        targetType: "Payment",
        targetId: "pay_123",
        metadata: JSON.stringify({ amountCents: 5000 }),
      },
    })

    const logs = await db.adminAuditLog.findMany({
      where: { adminUserId: admin.id },
    })

    expect(logs).toHaveLength(1)
    expect(logs[0].action).toBe("payment_refund")
    expect(JSON.parse(logs[0].metadata!)).toEqual({ amountCents: 5000 })
  })
})
