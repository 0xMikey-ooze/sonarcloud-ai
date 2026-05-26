import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { formatCurrency, formatDate, isPast, isValidUrl } from "@/lib/utils"
import { RsvpForm } from "./RsvpForm"

export const dynamic = "force-dynamic"

export default async function EventPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const dinner = await db.dinnerParty.findUnique({
    where: { slug },
    include: {
      restaurant: true,
      rsvps: { where: { status: { in: ["confirmed", "pending_payment"] } } },
    },
  })

  if (!dinner || dinner.status === "draft") notFound()

  const confirmedCount = dinner.rsvps.filter((r) => r.status === "confirmed").length
  const pendingCount = dinner.rsvps.filter((r) => r.status === "pending_payment").length
  const takenSeats = confirmedCount + pendingCount
  const isSoldOut = takenSeats >= dinner.capacity
  const isClosed = dinner.status === "closed" || dinner.status === "completed"
  const isCanceled = dinner.status === "canceled"
  const isPastEvent = isPast(dinner.startsAt)
  const pastDeadline = dinner.rsvpDeadline ? isPast(dinner.rsvpDeadline) : false
  const canRsvp = !isSoldOut && !isClosed && !isCanceled && !isPastEvent && !pastDeadline

  let statusBanner = null
  if (isCanceled) statusBanner = { text: "This event has been canceled.", type: "error" }
  else if (isPastEvent) statusBanner = { text: "This event has already passed.", type: "muted" }
  else if (isClosed) statusBanner = { text: "RSVPs are closed.", type: "muted" }
  else if (isSoldOut) statusBanner = { text: "This event is sold out.", type: "error" }
  else if (pastDeadline) statusBanner = { text: "The RSVP deadline has passed.", type: "muted" }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {dinner.restaurant.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden aspect-video bg-gray-100">
            <img
              src={dinner.restaurant.imageUrl}
              alt={dinner.restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{dinner.title}</h1>
          <p className="text-lg text-muted">{formatDate(dinner.startsAt, dinner.timezone)}</p>
        </div>

        {statusBanner && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              statusBanner.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-gray-50 border border-gray-200 text-gray-700"
            }`}
          >
            {statusBanner.text}
          </div>
        )}

        {dinner.description && (
          <div className="mb-8">
            <p className="text-foreground/80 leading-relaxed">{dinner.description}</p>
          </div>
        )}

        <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold text-lg mb-3">{dinner.restaurant.name}</h2>
          {dinner.restaurant.addressLine && (
            <p className="text-sm text-muted mb-2">{dinner.restaurant.addressLine}</p>
          )}
          <div className="flex gap-3">
            {dinner.restaurant.websiteUrl && isValidUrl(dinner.restaurant.websiteUrl) && (
              <a
                href={dinner.restaurant.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                Restaurant Website
              </a>
            )}
            {dinner.restaurant.googleMapsUrl && isValidUrl(dinner.restaurant.googleMapsUrl) && (
              <a
                href={dinner.restaurant.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                Google Maps
              </a>
            )}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted">Price</p>
            <p className="text-xl font-bold">
              {dinner.priceCents === 0 ? "Free" : formatCurrency(dinner.priceCents, dinner.currency)}
            </p>
            {dinner.priceDescription && (
              <p className="text-xs text-muted mt-1">{dinner.priceDescription}</p>
            )}
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm text-muted">Availability</p>
            <p className="text-xl font-bold">
              {dinner.capacity - takenSeats} / {dinner.capacity}
            </p>
            <p className="text-xs text-muted mt-1">seats remaining</p>
          </div>
        </div>

        {dinner.paymentRequired && dinner.priceCents > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-accent-light border border-accent/20">
            <p className="text-sm font-medium">
              Payment of {formatCurrency(dinner.priceCents, dinner.currency)} is required to confirm your seat.
            </p>
          </div>
        )}

        {canRsvp && <RsvpForm dinnerId={dinner.id} paymentRequired={dinner.paymentRequired} allowMaybe={dinner.allowMaybe} priceCents={dinner.priceCents} currency={dinner.currency} />}
      </div>
    </div>
  )
}
