import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatShortDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DinnersPage() {
  const dinners = await db.dinnerParty.findMany({
    include: {
      restaurant: true,
      _count: { select: { rsvps: true } },
    },
    orderBy: { startsAt: "desc" },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dinner Parties</h1>
        <Link
          href="/admin/dinners/new"
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:opacity-90 transition-opacity"
        >
          New Dinner Party
        </Link>
      </div>

      {dinners.length === 0 ? (
        <p className="text-muted">No dinner parties yet.</p>
      ) : (
        <div className="space-y-3">
          {dinners.map((d) => (
            <Link
              key={d.id}
              href={`/admin/dinners/${d.id}`}
              className="block p-4 rounded-xl border border-border bg-card hover:border-accent transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{d.title}</h3>
                  <p className="text-sm text-muted">
                    {d.restaurant.name} &middot; {formatShortDate(d.startsAt, d.timezone)}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    d.status === "published"
                      ? "bg-green-100 text-green-800"
                      : d.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : d.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {d.status}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-muted">
                <span>{d._count.rsvps} RSVPs</span>
                <span>{d.capacity} capacity</span>
                {d.paymentRequired && <span>{formatCurrency(d.priceCents, d.currency)} / person</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
