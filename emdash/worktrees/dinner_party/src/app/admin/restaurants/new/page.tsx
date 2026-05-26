"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewRestaurantPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/restaurants", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        websiteUrl: formData.get("websiteUrl") || null,
        googleMapsUrl: formData.get("googleMapsUrl") || null,
        addressLine: formData.get("addressLine") || null,
        phone: formData.get("phone") || null,
        notes: formData.get("notes") || null,
        imageUrl: formData.get("imageUrl") || null,
      }),
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Failed to create restaurant")
      setLoading(false)
      return
    }

    router.push("/admin/restaurants")
    router.refresh()
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">New Restaurant</h1>
      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input name="name" required className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input name="websiteUrl" type="url" className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Google Maps URL</label>
          <input name="googleMapsUrl" type="url" className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input name="addressLine" className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input name="imageUrl" type="url" className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Creating..." : "Create Restaurant"}
        </button>
      </form>
    </div>
  )
}
