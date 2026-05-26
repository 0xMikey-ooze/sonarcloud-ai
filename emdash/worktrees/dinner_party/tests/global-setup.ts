import { execSync } from "child_process"
import { unlinkSync, existsSync } from "fs"
import { join } from "path"

export default async function setup() {
  process.env.DATABASE_URL = "file:./test.db?connection_limit=1"
  process.env.NEXTAUTH_SECRET = "test-secret"
  process.env.NEXTAUTH_URL = "http://localhost:3000"
  process.env.STRIPE_SECRET_KEY = "sk_test_fake"
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_fake"

  const testDbPath = join(process.cwd(), "prisma", "test.db")
  if (existsSync(testDbPath)) unlinkSync(testDbPath)

  execSync("npx prisma db push --skip-generate", {
    env: { ...process.env },
    stdio: "pipe",
  })
}
