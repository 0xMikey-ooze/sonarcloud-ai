"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface Payment {
  id: string
  amountCents: number
  currency: string
  status: string
}

interface Rsvp {
  id: string
  guestName: string
  guestEmail: string
  status: string
  priceCentsSnapshot: number | null
  createdAt: string | Date
  payments: Payment[]
}

export function GuestList({
  rsvps,
  dinnerId,
  paymentRequired,
}: {
  rsvps: Rsvp[]
  dinnerId: string
  paymentRequired: boolean
}) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleRefund(rsvpId: string, paymentId: string) {
    if (!confirm("Issue a refund for this guest?")) return
    setActionLoading(rsvpId)

    await fetch(`/api/admin/dinners/${dinnerId}/refund`, {
      method: "POST",
      body: JSON.stringify({ rsvpId, paymentId }),
      headers: { "Content-Type": "application/json" },
    })

    setActionLoading(null)
    router.refresh()
  }

  async function handleCancelRsvp(rsvpId: string) {
    if (!confirm("Cancel this RSVP?")) return
    setActionLoading(rsvpId)

    await fetch(`/api/admin/dinners/${dinnerId}/rsvps`, {
      method: "PATCH",
      body: JSON.stringify({ rsvpId, status: "canceled" }),
      headers: { "Content-Type": "application/json" },
    })

    setActionLoading(null)
    router.refresh()
  }

  if (rsvps.length === 0) {
    return <p className="text-muted text-sm">No RSVPs yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-2 font-medium">Guest</th>
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Status</th>
            {paymentRequired && <th className="pb-2 font-medium">Payment</th>}
            <th className="pb-2 font-medium">Date</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((rsvp) => {
            const payment = rsvp.payments[0]
            return (
              <tr key={rsvp.id} className="border-b border-border/50">
                <td className="py-2">{rsvp.guestName}</td>
                <td className="py-2 text-muted">{rsvp.guestEmail}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rsvp.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : rsvp.status === "pending_payment"
                          ? "bg-yellow-100 text-yellow-800"
                          : rsvp.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : rsvp.status === "canceled"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {rsvp.status.replace("_", " ")}
                  </span>
                </td>
                {paymentRequired && (
                  <td className="py-2">
                    {payment ? (
                      <span
                        className={`text-xs ${
                          payment.status === "paid"
                            ? "text-green-700"
                            : payment.status === "refunded"
                              ? "text-red-700"
                              : "text-yellow-700"
                        }`}
                      >
                        {formatCurrency(payment.amountCents, payment.currency)} ({payment.status})
                      </span>
                    ) : (
                      <span className="text-xs text-muted">--</span>
                    )}
                  </td>
                )}
                <td className="py-2 text-muted">
                  {new Date(rsvp.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    {rsvp.status !== "canceled" && rsvp.status !== "declined" && (
                      <button
                        onClick={() => handleCancelRsvp(rsvp.id)}
                        disabled={actionLoading === rsvp.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {payment?.status === "paid" && (
                      <button
                        onClick={() => handleRefund(rsvp.id, payment.id)}
                        disabled={actionLoading === rsvp.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
