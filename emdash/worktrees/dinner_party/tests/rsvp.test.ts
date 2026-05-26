import { describe, it, expect } from "vitest"
import { db } from "@/lib/db"
import { getAvailableCapacity, findExistingRsvp, expirePendingRsvps } from "@/lib/rsvp"

async function createTestRestaurant() {
  return db.restaurant.create({
    data: { name: "Test Restaurant", active: true },
  })
}

async function createTestDinner(overrides: Record<string, unknown> = {}) {
  const restaurant = await createTestRestaurant()
  return db.dinnerParty.create({
    data: {
      restaurantId: restaurant.id,
      title: "Test Dinner",
      slug: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      capacity: 5,
      status: "published",
      ...overrides,
    },
  })
}

describe("RSVP Creation", () => {
  it("creates a confirmed RSVP for a free event", async () => {
    const dinner = await createTestDinner()

    const rsvp = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
        priceCentsSnapshot: 0,
        currencySnapshot: "usd",
      },
    })

    expect(rsvp.status).toBe("confirmed")
    expect(rsvp.guestName).toBe("Alice")
    expect(rsvp.guestEmail).toBe("alice@example.com")
  })

  it("creates a declined RSVP", async () => {
    const dinner = await createTestDinner()

    const rsvp = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Bob",
        guestEmail: "bob@example.com",
        status: "declined",
      },
    })

    expect(rsvp.status).toBe("declined")
  })
})

describe("Duplicate RSVP Handling", () => {
  it("finds existing RSVP by email", async () => {
    const dinner = await createTestDinner()

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
      },
    })

    const existing = await findExistingRsvp(dinner.id, "alice@example.com")
    expect(existing).not.toBeNull()
    expect(existing?.guestName).toBe("Alice")
  })

  it("normalizes email for duplicate detection", async () => {
    const dinner = await createTestDinner()

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
      },
    })

    const existing = await findExistingRsvp(dinner.id, "  ALICE@EXAMPLE.COM  ")
    expect(existing).not.toBeNull()
    expect(existing?.guestName).toBe("Alice")
  })

  it("prevents duplicate RSVPs via unique constraint", async () => {
    const dinner = await createTestDinner()

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
      },
    })

    await expect(
      db.rsvp.create({
        data: {
          dinnerPartyId: dinner.id,
          guestName: "Alice Again",
          guestEmail: "alice@example.com",
          status: "confirmed",
        },
      })
    ).rejects.toThrow()
  })
})

describe("Capacity Enforcement", () => {
  it("tracks available capacity correctly", async () => {
    const dinner = await createTestDinner({ capacity: 3 })

    const available = await getAvailableCapacity(dinner.id)
    expect(available).toBe(3)

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
      },
    })

    const after1 = await getAvailableCapacity(dinner.id)
    expect(after1).toBe(2)

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Bob",
        guestEmail: "bob@example.com",
        status: "confirmed",
      },
    })

    const after2 = await getAvailableCapacity(dinner.id)
    expect(after2).toBe(1)
  })

  it("counts pending_payment as taking a seat", async () => {
    const dinner = await createTestDinner({ capacity: 2 })

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "pending_payment",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    const available = await getAvailableCapacity(dinner.id)
    expect(available).toBe(1)
  })

  it("does not count declined RSVPs against capacity", async () => {
    const dinner = await createTestDinner({ capacity: 2 })

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Bob",
        guestEmail: "bob@example.com",
        status: "declined",
      },
    })

    const available = await getAvailableCapacity(dinner.id)
    expect(available).toBe(2)
  })
})

describe("Payment Expiration", () => {
  it("expires pending RSVPs past the timeout window", async () => {
    const dinner = await createTestDinner({ capacity: 5, paymentRequired: true, priceCents: 5000 })

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "pending_payment",
        expiresAt: new Date(Date.now() - 60 * 60 * 1000),
        priceCentsSnapshot: 5000,
        currencySnapshot: "usd",
      },
    })

    const count = await expirePendingRsvps()
    expect(count).toBe(1)

    const rsvp = await db.rsvp.findFirst({ where: { dinnerPartyId: dinner.id } })
    expect(rsvp?.status).toBe("expired")
  })

  it("does not expire pending RSVPs within the window", async () => {
    const dinner = await createTestDinner({ capacity: 5, paymentRequired: true, priceCents: 5000 })

    await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "pending_payment",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        priceCentsSnapshot: 5000,
        currencySnapshot: "usd",
      },
    })

    const count = await expirePendingRsvps()
    expect(count).toBe(0)
  })
})

describe("Price Snapshot", () => {
  it("preserves price snapshot on RSVP creation", async () => {
    const dinner = await createTestDinner({ priceCents: 7500, currency: "usd" })

    const rsvp = await db.rsvp.create({
      data: {
        dinnerPartyId: dinner.id,
        guestName: "Alice",
        guestEmail: "alice@example.com",
        status: "confirmed",
        priceCentsSnapshot: 7500,
        currencySnapshot: "usd",
      },
    })

    expect(rsvp.priceCentsSnapshot).toBe(7500)
    expect(rsvp.currencySnapshot).toBe("usd")

    await db.dinnerParty.update({
      where: { id: dinner.id },
      data: { priceCents: 9000 },
    })

    const unchanged = await db.rsvp.findUnique({ where: { id: rsvp.id } })
    expect(unchanged?.priceCentsSnapshot).toBe(7500)
  })
})
