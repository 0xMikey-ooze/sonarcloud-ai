"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface Props {
  dinnerId: string
  paymentRequired: boolean
  allowMaybe: boolean
  priceCents: number
  currency: string
}

export function RsvpForm({ dinnerId, paymentRequired, allowMaybe, priceCents, currency }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("attending")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/rsvps", {
      method: "POST",
      body: JSON.stringify({
        dinnerPartyId: dinnerId,
        guestName: name.trim(),
        guestEmail: email.trim(),
        rsvpStatus: status,
      }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
      return
    }

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl
      return
    }

    router.push(`/events/${window.location.pathname.split("/").pop()}/success`)
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <h2 className="text-lg font-semibold mb-4">RSVP</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Response</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="attending"
                checked={status === "attending"}
                onChange={() => setStatus("attending")}
                className="accent-accent"
              />
              <span className="text-sm">Attending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="declined"
                checked={status === "declined"}
                onChange={() => setStatus("declined")}
                className="accent-accent"
              />
              <span className="text-sm">Not Attending</span>
            </label>
            {allowMaybe && !paymentRequired && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="maybe"
                  checked={status === "maybe"}
                  onChange={() => setStatus("maybe")}
                  className="accent-accent"
                />
                <span className="text-sm">Maybe</span>
              </label>
            )}
          </div>
        </div>

        {paymentRequired && status === "attending" && priceCents > 0 && (
          <div className="p-3 rounded-lg bg-accent-light text-sm">
            You&apos;ll be redirected to Stripe to pay {formatCurrency(priceCents, currency)} to confirm your seat.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading
            ? "Processing..."
            : paymentRequired && status === "attending" && priceCents > 0
              ? "RSVP & Pay"
              : "Submit RSVP"}
        </button>
      </form>
    </div>
  )
}
