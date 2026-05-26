import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { RestaurantEditForm } from "./RestaurantEditForm"

export const dynamic = "force-dynamic"

export default async function EditRestaurantPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const restaurant = await db.restaurant.findUnique({ where: { id } })
  if (!restaurant) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Restaurant</h1>
      <RestaurantEditForm restaurant={restaurant} />
    </div>
  )
}
