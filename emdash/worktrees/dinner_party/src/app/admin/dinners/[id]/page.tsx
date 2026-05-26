import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DinnerDetailActions } from "./DinnerDetailActions"
import { GuestList } from "./GuestList"

export const dynamic = "force-dynamic"

export default async function DinnerDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const dinner = await db.dinnerParty.findUnique({
    where: { id },
    include: {
      restaurant: true,
      rsvps: {
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!dinner) notFound()

  const confirmed = dinner.rsvps.filter((r) => r.status === "confirmed")
  const pending = dinner.rsvps.filter((r) => r.status === "pending_payment")
  const declined = dinner.rsvps.filter((r) => r.status === "declined")
  const paidPayments = dinner.rsvps.flatMap((r) => r.payments).filter((p) => p.status === "paid")
  const totalCollected = paidPayments.reduce((sum, p) => sum + p.amountCents, 0)
  const refundedPayments = dinner.rsvps.flatMap((r) => r.payments).filter((p) => p.status === "refunded")
  const totalRefunded = refundedPayments.reduce((sum, p) => sum + p.amountCents, 0)

  const eventUrl = `${process.env.NEXTAUTH_URL}/events/${dinner.slug}`

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{dinner.title}</h1>
            <p className="text-muted">
              {dinner.restaurant.name} &middot; {formatDate(dinner.startsAt, dinner.timezone)}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              dinner.status === "published"
                ? "bg-green-100 text-green-800"
                : dinner.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : dinner.status === "canceled"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {dinner.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Capacity</p>
          <p className="text-xl font-bold">
            {confirmed.length}/{dinner.capacity}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Pending</p>
          <p className="text-xl font-bold">{pending.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Declined</p>
          <p className="text-xl font-bold">{declined.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted">Collected</p>
          <p className="text-xl font-bold">{formatCurrency(totalCollected, dinner.currency)}</p>
          {totalRefunded > 0 && (
            <p className="text-xs text-red-600">-{formatCurrency(totalRefunded, dinner.currency)} refunded</p>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-border bg-card">
        <h2 className="font-semibold mb-2">Event Link</h2>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={eventUrl}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
          />
          <button
            onClick={() => navigator.clipboard.writeText(eventUrl)}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-background transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      <DinnerDetailActions dinner={dinner} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Guest List</h2>
        <GuestList rsvps={dinner.rsvps} dinnerId={dinner.id} paymentRequired={dinner.paymentRequired} />
      </div>
    </div>
  )
}
