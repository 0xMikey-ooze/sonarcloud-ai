"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Dinner {
  id: string
  status: string
}

export function DinnerDetailActions({ dinner }: { dinner: Dinner }) {
  const router = useRouter()
  const [loading, setLoading] = useState("")

  async function changeStatus(status: string) {
    setLoading(status)
    await fetch(`/api/admin/dinners/${dinner.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: { "Content-Type": "application/json" },
    })
    setLoading("")
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {dinner.status === "draft" && (
        <button
          onClick={() => changeStatus("published")}
          disabled={!!loading}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading === "published" ? "Publishing..." : "Publish"}
        </button>
      )}
      {dinner.status === "published" && (
        <>
          <button
            onClick={() => changeStatus("closed")}
            disabled={!!loading}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-card transition-colors"
          >
            {loading === "closed" ? "Closing..." : "Close RSVPs"}
          </button>
          <button
            onClick={() => changeStatus("canceled")}
            disabled={!!loading}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm hover:bg-red-50 transition-colors"
          >
            {loading === "canceled" ? "Canceling..." : "Cancel Event"}
          </button>
        </>
      )}
      {dinner.status === "closed" && (
        <button
          onClick={() => changeStatus("completed")}
          disabled={!!loading}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading === "completed" ? "Completing..." : "Mark Completed"}
        </button>
      )}
    </div>
  )
}
