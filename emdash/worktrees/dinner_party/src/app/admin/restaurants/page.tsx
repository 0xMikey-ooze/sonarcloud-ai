import Link from "next/link"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function RestaurantsPage() {
  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { dinnerParties: true } } },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <Link
          href="/admin/restaurants/new"
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:opacity-90 transition-opacity"
        >
          Add Restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-muted">No restaurants yet.</p>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-xl border border-border bg-card ${!r.active ? "opacity-60" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {r.name}
                    {!r.active && <span className="ml-2 text-xs text-muted">(archived)</span>}
                  </h3>
                  {r.addressLine && <p className="text-sm text-muted">{r.addressLine}</p>}
                  {r.websiteUrl && (
                    <a
                      href={r.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline"
                    >
                      Website
                    </a>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted">{r._count.dinnerParties} dinners</span>
                  <Link
                    href={`/admin/restaurants/${r.id}/edit`}
                    className="text-sm text-accent hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
