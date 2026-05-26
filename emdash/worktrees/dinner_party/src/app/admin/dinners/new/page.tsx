import { db } from "@/lib/db"
import { DinnerForm } from "./DinnerForm"

export const dynamic = "force-dynamic"

export default async function NewDinnerPage() {
  const restaurants = await db.restaurant.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">New Dinner Party</h1>
      <DinnerForm restaurants={restaurants} />
    </div>
  )
}
