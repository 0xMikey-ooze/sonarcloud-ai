import type { Metadata } from "next"
import ReserveClient from "@/components/ReserveClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bemyguestrsvp.com"

export const metadata: Metadata = {
  title: "Reserve Your Seat",
  description:
    "Reserve your seat at the next Be My Guest dinner experience. Space is intentionally limited to keep the evening intimate and curated.",
  alternates: {
    canonical: `${SITE_URL}/reserve`,
  },
  openGraph: {
    title: "Reserve Your Seat — Be My Guest",
    description:
      "Reserve your seat at a Be My Guest curated dinner experience. Limited seating, elevated evenings in New Jersey.",
    url: `${SITE_URL}/reserve`,
    type: "website",
  },
}

export default function ReservePage() {
  return <ReserveClient />
}
