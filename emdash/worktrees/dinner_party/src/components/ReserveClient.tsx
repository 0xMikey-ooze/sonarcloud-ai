"use client"

import { useState, useEffect } from "react"
import { NoiseCanvas } from "@/components/NoiseCanvas"
import { NocturneHeader } from "@/components/NocturneHeader"

interface DinnerEvent {
  id: string
  title: string
  slug: string
  description: string | null
  startsAt: string
  timezone: string
  capacity: number
  priceCents: number
  currency: string
  priceDescription: string | null
  paymentRequired: boolean
  _count: { rsvps: number }
}

function formatCurrency(cents: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatDate(dateStr: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  }).format(new Date(dateStr))
}

export default function ReserveClient() {
  const [dinner, setDinner] = useState<DinnerEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [partySize, setPartySize] = useState(1)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/rsvps?slug=summer-sunset")
      .then((r) => r.json())
      .then((data) => {
        if (data.dinner) setDinner(data.dinner)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dinnerPartyId: dinner!.id,
          guestName: name.trim(),
          guestEmail: email.trim(),
          rsvpStatus: "attending",
          partySize,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setSubmitting(false)
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      window.location.href = `/events/summer-sunset/success`
    } catch {
      setError("Network error. Please try again.")
      setSubmitting(false)
    }
  }

  const totalPrice = dinner ? dinner.priceCents * partySize : 0

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--col-bg-main)" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.8,
        }}
      >
        <NoiseCanvas style={{ position: "absolute", width: "100%", height: "100%" }} />
      </div>

      <NocturneHeader variant="light" />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          minHeight: "100vh",
          paddingTop: "100px",
        }}
      >
        {/* Left: Event details */}
        <div
          style={{
            width: "50%",
            padding: "4vw 6vw 4vw var(--space-edge)",
            borderRight: "1px solid var(--col-border)",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3rem, 5vw, 6rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontWeight: 300,
              marginBottom: "4vh",
            }}
          >
            Reserve
            <br />Your Seat
          </h1>

          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              opacity: 0.8,
              maxWidth: "400px",
              marginBottom: "6vh",
            }}
          >
            Space is intentionally limited to keep the experience intimate and curated. Once seats
            are gone, they&apos;re gone. Secure your spot for the inaugural edition.
          </p>

          {loading && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", opacity: 0.5 }}>
              Loading event details...
            </p>
          )}

          {dinner && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "2vh",
                borderTop: "1px solid var(--col-border)",
                paddingTop: "20px",
              }}
            >
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "5px",
                  }}
                >
                  Date
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  {formatDate(dinner.startsAt, dinner.timezone)}
                </p>
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "5px",
                  }}
                >
                  Price Per Guest
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  {formatCurrency(dinner.priceCents, dinner.currency)}
                </p>
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "5px",
                  }}
                >
                  Location
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  Private Residence, NJ
                </p>
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "5px",
                  }}
                >
                  Availability
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  {dinner.capacity - (dinner._count?.rsvps || 0)} / {dinner.capacity} seats
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking form */}
        <div style={{ width: "50%", padding: "4vw var(--space-edge) 4vw 6vw" }}>
          <div
            style={{
              backgroundColor: "var(--col-red-accent)",
              padding: "3vw",
              color: "var(--col-text-main)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4vh",
              }}
            >
              <span>EDITION I</span>
              <span>SATURDAY, AUG 15 2026</span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.5rem, 4vw, 4rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                marginBottom: "2vh",
              }}
            >
              Summer
              <br />
              Sunset
            </h2>

            <span
              style={{
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4vh",
                display: "block",
              }}
            >
              Private Residence, New Jersey
            </span>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: "2.5vh" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Full name"
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(10,10,10,0.4)",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.1rem",
                    color: "var(--col-text-main)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "2.5vh" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(10,10,10,0.4)",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.1rem",
                    color: "var(--col-text-main)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Party Size */}
              <div style={{ marginBottom: "3vh" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  Number of Guests
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(10,10,10,0.4)",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.1rem",
                    color: "var(--col-text-main)",
                    outline: "none",
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n} style={{ color: "#0a0a0a" }}>
                      {n} {n === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price summary */}
              <div
                style={{
                  borderTop: "1px solid rgba(10,10,10,0.2)",
                  paddingTop: "2vh",
                  marginBottom: "3vh",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1rem",
                    marginBottom: "1vh",
                    borderBottom: "1px dotted rgba(10,10,10,0.3)",
                    paddingBottom: "5px",
                  }}
                >
                  <span>{partySize} {partySize === 1 ? "guest" : "guests"} &times; $75</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {error && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    color: "rgba(10,10,10,0.8)",
                    marginBottom: "2vh",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !dinner}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "var(--col-text-main)",
                  border: "none",
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--col-bg-main)",
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting || !dinner ? 0.5 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {submitting ? "Processing..." : `Reserve & Pay ${formatCurrency(totalPrice)}`}
              </button>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "9px",
                  textAlign: "center",
                  marginTop: "12px",
                  opacity: 0.6,
                  letterSpacing: "0.05em",
                }}
              >
                You&apos;ll be redirected to Stripe to complete payment
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
