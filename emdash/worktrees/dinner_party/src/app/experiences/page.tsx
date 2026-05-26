"use client"

import Link from "next/link"
import { NoiseCanvas } from "@/components/NoiseCanvas"
import { NocturneHeader } from "@/components/NocturneHeader"

const experiences = [
  {
    chapter: "CHAP. VII",
    date: "NOV 2024",
    title: ["The Fall", "Harvest"],
    chef: "By Chef Elias Vane",
    description:
      "An exploration of root and ember. Chef Vane returns to his origins, presenting a menu that honors the stark beauty of late autumn. Expect smoke-kissed preserves, game from the northern woods, and forgotten tubers brought to the fore.",
    status: "Booking Open",
    action: "Reserve a Seat",
    actionHref: "/reserve",
    featured: true,
  },
  {
    chapter: "CHAP. VIII",
    date: "JAN 2025",
    title: ["Winter's", "Respite"],
    chef: "By Chef Amara Lin",
    description:
      "Finding warmth in the depths of winter. A meditation on preservation and slow cooking. Broths that take days, ferments that take months, and the surprising vibrancy of cold-water catches.",
    status: "Preview",
    action: "Notify Me",
    actionHref: "#",
    featured: false,
  },
  {
    chapter: "CHAP. IX",
    date: "MAR 2025",
    title: ["The First", "Thaw"],
    chef: "Guest Chef Julian Rossi",
    description:
      "Capturing the ephemeral nature of early spring. A highly restricted menu focusing entirely on shoots, buds, and the immediate bounty that follows the melting snows of the high valleys.",
    status: "Announced",
    action: "Read Journal",
    actionHref: "#",
    featured: false,
  },
  {
    chapter: "CHAP. X",
    date: "MAY 2025",
    title: ["Coastal", "Foraging"],
    chef: "To Be Announced",
    description:
      "Turning our attention to the tidal zones. A celebration of brine, kelp forests, and the obscure bivalves found only in our local coves. Menu details to be revealed.",
    status: "Concept Phase",
    action: "Notify Me",
    actionHref: "#",
    featured: false,
  },
]

export default function ExperiencesPage() {
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
          flexDirection: "column",
          minHeight: "100vh",
          padding: "120px var(--space-edge) 4vw var(--space-edge)",
        }}
      >
        <div
          style={{
            marginBottom: "6vh",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderBottom: "1px solid var(--col-border)",
            paddingBottom: "4vh",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3rem, 5vw, 6rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              fontWeight: 300,
            }}
          >
            Upcoming
            <br />
            Experiences
          </h1>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              opacity: 0.8,
              maxWidth: "400px",
            }}
          >
            A preview of seasons to come. Discover our forthcoming chapters, guest chefs, and the
            culinary explorations defining the months ahead.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "4vw",
          }}
        >
          {experiences.map((exp, i) => (
            <ExperienceCard key={i} {...exp} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ExperienceCard({
  chapter,
  date,
  title,
  chef,
  description,
  status,
  action,
  actionHref,
  featured,
}: {
  chapter: string
  date: string
  title: string[]
  chef: string
  description: string
  status: string
  action: string
  actionHref: string
  featured: boolean
}) {
  return (
    <div
      style={{
        border: "1px solid var(--col-border)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.3s ease, border-color 0.3s ease",
        backgroundColor: featured ? "var(--col-red-accent)" : "transparent",
        borderColor: featured ? "var(--col-red-accent)" : "var(--col-border)",
        color: "var(--col-text-main)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--col-text-main)"
        e.currentTarget.style.transform = "translateY(-5px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = featured ? "var(--col-red-accent)" : "var(--col-border)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <div
        style={{
          padding: "2vw",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: `1px solid ${featured ? "rgba(10, 10, 10, 0.2)" : "var(--col-border)"}`,
        }}
      >
        <span style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {chapter}
        </span>
        <span style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {date}
        </span>
      </div>

      <div style={{ padding: "3vw 2vw", flexGrow: 1 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 3vw, 3.5rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            marginBottom: "2vh",
          }}
        >
          {title[0]}
          <br />
          {title[1]}
        </h2>
        <span
          style={{
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "3vh",
            display: "block",
          }}
        >
          {chef}
        </span>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            lineHeight: 1.5,
            marginBottom: "3vh",
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          padding: "2vw",
          borderTop: `1px solid ${featured ? "rgba(10, 10, 10, 0.2)" : "var(--col-border)"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "4px 8px",
            border: "1px solid currentColor",
            borderRadius: "20px",
          }}
        >
          {status}
        </span>
        <Link
          href={actionHref}
          style={{
            background: "transparent",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "inherit",
            position: "relative",
            display: "inline-block",
            paddingBottom: "4px",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          {action}
        </Link>
      </div>
    </div>
  )
}
