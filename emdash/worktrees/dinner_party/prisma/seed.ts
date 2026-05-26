import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)

  await db.adminUser.upsert({
    where: { email: "admin@dinnerparty.local" },
    update: {},
    create: {
      email: "admin@dinnerparty.local",
      passwordHash,
      name: "Admin",
    },
  })

  const restaurant = await db.restaurant.upsert({
    where: { id: "bmg-venue-01" },
    update: {},
    create: {
      id: "bmg-venue-01",
      name: "Be My Guest",
      addressLine: "Private Residence, New Jersey",
      active: true,
    },
  })

  const august15 = new Date("2026-08-15T17:00:00.000-04:00")
  const rsvpDeadline = new Date("2026-08-12T23:59:00.000-04:00")

  await db.dinnerParty.upsert({
    where: { slug: "summer-sunset" },
    update: {},
    create: {
      restaurantId: restaurant.id,
      title: "Be My Guest: Summer Sunset",
      slug: "summer-sunset",
      description:
        "The inaugural Be My Guest experience. A sunset-inspired evening featuring a 3-course dinner, curated cocktails, beautiful people, and unforgettable vibes. Cocktail hour begins at 5pm. Dinner served promptly at 6:15pm.",
      startsAt: august15,
      timezone: "America/New_York",
      capacity: 20,
      rsvpDeadline,
      priceCents: 7500,
      currency: "usd",
      priceDescription: "per guest — includes 3-course dinner and cocktails",
      paymentRequired: true,
      allowMaybe: false,
      status: "published",
    },
  })

  console.log("Seed complete")
  console.log("  Admin: admin@dinnerparty.local / admin123")
  console.log("  Event: summer-sunset — $75/guest — Aug 15, 2026")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
