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

  console.log("Seed complete: admin@dinnerparty.local / admin123")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
