import type { Metadata } from "next"
import HomeClient from "@/components/HomeClient"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bemyguestrsvp.com"

export const metadata: Metadata = {
  title: "Be My Guest | Curated Dinner Experiences",
  description:
    "Intimate, elevated dinner experiences bringing amazing people together over incredible food, cocktails, music, and conversation. Join the inaugural Summer Sunset dinner — August 15, 2026.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Be My Guest — Curated Dinner Experiences",
    description:
      "The best evenings are the ones you didn't plan. Intimate, curated dinner experiences in New Jersey. Reserve your seat for Summer Sunset.",
    url: SITE_URL,
    type: "website",
  },
}

export default function HomePage() {
  return <HomeClient />
}
