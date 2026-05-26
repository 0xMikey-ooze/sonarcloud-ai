import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [dinners, restaurants] = await Promise.all([
    db.dinnerParty.findMany({
      include: {
        restaurant: true,
        rsvps: {
          include: { payments: true },
        },
      },
      orderBy: { startsAt: "desc" },
      take: 10,
    }),
    db.restaurant.count({ where: { active: true } }),
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/restaurants/new"
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-card transition-colors"
          >
            New Restaurant
          </Link>
          <Link
            href="/admin/dinners/new"
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:opacity-90 transition-opacity"
          >
            New Dinner Party
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Active Restaurants</p>
          <p className="text-2xl font-bold">{restaurants}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Total Dinners</p>
          <p className="text-2xl font-bold">{dinners.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Total Collected</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              dinners.flatMap((d) => d.rsvps.flatMap((r) => r.payments)).filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountCents, 0)
            )}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Dinner Parties</h2>
      {dinners.length === 0 ? (
        <p className="text-muted">No dinner parties yet. Create your first one!</p>
      ) : (
        <div className="space-y-3">
          {dinners.map((dinner) => {
            const confirmed = dinner.rsvps.filter((r) => r.status === "confirmed").length
            const paid = dinner.rsvps.flatMap((r) => r.payments).filter((p) => p.status === "paid")
            const totalCollected = paid.reduce((sum, p) => sum + p.amountCents, 0)

            return (
              <Link
                key={dinner.id}
                href={`/admin/dinners/${dinner.id}`}
                className="block p-4 rounded-xl border border-border bg-card hover:border-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{dinner.title}</h3>
                    <p className="text-sm text-muted">
                      {dinner.restaurant.name} &middot;{" "}
                      {new Date(dinner.startsAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      dinner.status === "published"
                        ? "bg-green-100 text-green-800"
                        : dinner.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {dinner.status}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-sm text-muted">
                  <span>
                    {confirmed}/{dinner.capacity} seats
                  </span>
                  {dinner.paymentRequired && <span>{formatCurrency(totalCollected)} collected</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
