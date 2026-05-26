"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Restaurant {
  id: string
  name: string
}

interface DinnerData {
  id?: string
  restaurantId: string
  title: string
  description: string | null
  startsAt: string
  timezone: string
  capacity: number
  rsvpDeadline: string | null
  priceCents: number
  currency: string
  priceDescription: string | null
  paymentRequired: boolean
  allowMaybe: boolean
  status: string
}

export function DinnerForm({
  restaurants,
  dinner,
}: {
  restaurants: Restaurant[]
  dinner?: DinnerData
}) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const isEdit = !!dinner

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const startsAtStr = formData.get("startsAt") as string
    const startsAt = new Date(startsAtStr).toISOString()

    const rsvpDeadlineStr = formData.get("rsvpDeadline") as string
    const rsvpDeadline = rsvpDeadlineStr ? new Date(rsvpDeadlineStr).toISOString() : null

    const priceDollars = parseFloat(formData.get("priceDollars") as string) || 0
    const priceCents = Math.round(priceDollars * 100)

    const payload = {
      restaurantId: formData.get("restaurantId"),
      title: formData.get("title"),
      description: formData.get("description") || null,
      startsAt,
      timezone: formData.get("timezone") || "America/New_York",
      capacity: parseInt(formData.get("capacity") as string, 10),
      rsvpDeadline,
      priceCents,
      currency: "usd",
      priceDescription: formData.get("priceDescription") || null,
      paymentRequired: formData.get("paymentRequired") === "true",
      allowMaybe: formData.get("allowMaybe") === "true",
    }

    const url = isEdit ? `/api/admin/dinners/${dinner.id}` : "/api/admin/dinners"
    const method = isEdit ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to save")
      setLoading(false)
      return
    }

    const result = await res.json()
    router.push(`/admin/dinners/${result.id}`)
    router.refresh()
  }

  const defaultDate = dinner?.startsAt
    ? new Date(dinner.startsAt).toISOString().slice(0, 16)
    : ""

  const defaultDeadline = dinner?.rsvpDeadline
    ? new Date(dinner.rsvpDeadline).toISOString().slice(0, 16)
    : ""

  const defaultPrice = dinner ? (dinner.priceCents / 100).toString() : "0"

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Restaurant *</label>
        <select
          name="restaurantId"
          required
          defaultValue={dinner?.restaurantId || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        >
          <option value="">Select a restaurant</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          name="title"
          required
          defaultValue={dinner?.title || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={dinner?.description || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date & Time *</label>
          <input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={defaultDate}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            name="timezone"
            defaultValue={dinner?.timezone || "America/New_York"}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card"
          >
            <option value="America/New_York">Eastern</option>
            <option value="America/Chicago">Central</option>
            <option value="America/Denver">Mountain</option>
            <option value="America/Los_Angeles">Pacific</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Capacity *</label>
          <input
            name="capacity"
            type="number"
            min={1}
            required
            defaultValue={dinner?.capacity || 10}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RSVP Deadline</label>
          <input
            name="rsvpDeadline"
            type="datetime-local"
            defaultValue={defaultDeadline}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            name="paymentRequired"
            type="checkbox"
            value="true"
            defaultChecked={dinner?.paymentRequired || false}
            className="rounded border-border"
          />
          <label className="text-sm font-medium">Payment required</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price per person ($)</label>
            <input
              name="priceDollars"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultPrice}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price covers</label>
            <input
              name="priceDescription"
              defaultValue={dinner?.priceDescription || ""}
              placeholder="e.g. Family-style dinner, tax & tip"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          name="allowMaybe"
          type="checkbox"
          value="true"
          defaultChecked={dinner?.allowMaybe || false}
          className="rounded border-border"
        />
        <label className="text-sm font-medium">Allow &quot;Maybe&quot; responses</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Dinner Party"}
      </button>
    </form>
  )
}
