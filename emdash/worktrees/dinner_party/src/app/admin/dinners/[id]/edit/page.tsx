import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { DinnerForm } from "@/app/admin/dinners/new/DinnerForm"

export const dynamic = "force-dynamic"

export default async function EditDinnerPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const [dinner, restaurants] = await Promise.all([
    db.dinnerParty.findUnique({ where: { id } }),
    db.restaurant.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ])

  if (!dinner) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Dinner Party</h1>
      <DinnerForm
        restaurants={restaurants}
        dinner={{
          id: dinner.id,
          restaurantId: dinner.restaurantId,
          title: dinner.title,
          description: dinner.description,
          startsAt: dinner.startsAt.toISOString(),
          timezone: dinner.timezone,
          capacity: dinner.capacity,
          rsvpDeadline: dinner.rsvpDeadline?.toISOString() || null,
          priceCents: dinner.priceCents,
          currency: dinner.currency,
          priceDescription: dinner.priceDescription,
          paymentRequired: dinner.paymentRequired,
          allowMaybe: dinner.allowMaybe,
          status: dinner.status,
        }}
      />
    </div>
  )
}
