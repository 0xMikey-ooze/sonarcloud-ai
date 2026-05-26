"use client"

import Link from "next/link"

interface NocturneHeaderProps {
  variant?: "light" | "dark"
}

export function NocturneHeader({ variant = "light" }: NocturneHeaderProps) {
  const isDark = variant === "dark"

  return (
    <header
      style={{
        position: "fixed",
        top: "var(--space-edge)",
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: "0 var(--space-edge)",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.5rem",
          fontWeight: 700,
          letterSpacing: "-0.05em",
          pointerEvents: "auto",
          textDecoration: "none",
          color: isDark ? "var(--col-white)" : "var(--col-text-main)",
          mixBlendMode: isDark ? "difference" : "normal",
        }}
      >
        n.
      </Link>
      <nav style={{ display: "flex", gap: "2vw", pointerEvents: "auto" }}>
        <NavLink href="/about" isDark={isDark}>About</NavLink>
        <NavLink href="/experiences" isDark={isDark}>Experiences</NavLink>
        <NavLink href="/reserve" isDark={isDark}>Reserve</NavLink>
      </nav>
    </header>
  )
}

function NavLink({
  href,
  children,
  isDark,
}: {
  href: string
  children: React.ReactNode
  isDark: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "9px",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        textDecoration: "none",
        color: isDark ? "var(--col-white)" : "var(--col-text-main)",
        mixBlendMode: isDark ? "difference" : "normal",
        transition: "opacity 0.3s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.5")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </Link>
  )
}
