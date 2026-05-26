"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Restaurant {
  id: string
  name: string
  websiteUrl: string | null
  googleMapsUrl: string | null
  addressLine: string | null
  phone: string | null
  notes: string | null
  imageUrl: string | null
  active: boolean
}

export function RestaurantEditForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const res = await fetch(`/api/admin/restaurants/${restaurant.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: formData.get("name"),
        websiteUrl: formData.get("websiteUrl") || null,
        googleMapsUrl: formData.get("googleMapsUrl") || null,
        addressLine: formData.get("addressLine") || null,
        phone: formData.get("phone") || null,
        notes: formData.get("notes") || null,
        imageUrl: formData.get("imageUrl") || null,
        active: formData.get("active") === "true",
      }),
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to update")
      setLoading(false)
      return
    }

    router.push("/admin/restaurants")
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          name="name"
          required
          defaultValue={restaurant.name}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Website URL</label>
        <input
          name="websiteUrl"
          type="url"
          defaultValue={restaurant.websiteUrl || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Google Maps URL</label>
        <input
          name="googleMapsUrl"
          type="url"
          defaultValue={restaurant.googleMapsUrl || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          name="addressLine"
          defaultValue={restaurant.addressLine || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          name="phone"
          defaultValue={restaurant.phone || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          name="imageUrl"
          type="url"
          defaultValue={restaurant.imageUrl || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={restaurant.notes || ""}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          name="active"
          type="checkbox"
          value="true"
          defaultChecked={restaurant.active}
          className="rounded border-border"
        />
        <label className="text-sm font-medium">Active</label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  )
}
