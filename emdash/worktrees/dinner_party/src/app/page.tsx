"use client"

import Link from "next/link"
import { NoiseCanvas } from "@/components/NoiseCanvas"
import { NocturneHeader } from "@/components/NocturneHeader"

export default function HomePage() {
  return (
    <>
      <NocturneHeader variant="dark" />

      <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
        <div
          style={{
            position: "relative",
            width: "48%",
            height: "100%",
            backgroundColor: "var(--col-bg-left)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <NoiseCanvas />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "80%",
              maxWidth: "600px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(4rem, 7vw, 8rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                fontWeight: 300,
                color: "rgba(255, 255, 255, 0.9)",
                filter: "blur(6px)",
                whiteSpace: "nowrap",
                zIndex: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              in the dark
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(3rem, 5vw, 6rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                fontWeight: 300,
                color: "var(--col-text-main)",
                position: "relative",
                zIndex: 2,
              }}
            >
              Dining is not merely <br />
              consumption. It is, <br />
              profoundly, a <em style={{ fontStyle: "italic", fontWeight: 400 }}>communion</em> <br />
              with the unseen.
            </h1>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "var(--space-edge)",
              left: "var(--space-edge)",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              zIndex: 10,
            }}
          >
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1 }}>
              ↓
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                opacity: 0.6,
              }}
            >
              AN EPHEMERAL CULINARY EXPERIENCE · NO SUBSTITUTIONS · NO PHONES
            </span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: "52%",
            height: "100%",
            backgroundColor: "#000",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1576867757603-05b134ebc379?q=80&w=2000&auto=format&fit=crop"
            alt="Chef preparing food in a dark kitchen"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.2) brightness(0.8)",
              zIndex: 0,
            }}
          />

          <Link
            href="/reserve"
            style={{
              position: "absolute",
              top: "50%",
              left: "-15%",
              transform: "translateY(-50%)",
              width: "32vw",
              height: "48vw",
              maxWidth: "450px",
              maxHeight: "650px",
              backgroundColor: "var(--col-red-accent)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "2vw",
              transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "pointer",
              textDecoration: "none",
              color: "var(--col-text-main)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(0.98)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(-50%)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-sans)",
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--col-text-main)",
              }}
            >
              <span>CHAP. VII</span>
              <span>24 NOV 2024</span>
            </div>

            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-sans)",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--col-text-main)",
                marginTop: "auto",
                marginBottom: "4vh",
              }}
            >
              <span>&quot;HEARTH &amp; SHADOW&quot;</span>
              <br />
              <span style={{ opacity: 0.5, marginTop: "4px", display: "inline-block" }}>
                BY CHEF ELIAS VANE
              </span>
            </div>

            <div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(3rem, 4.5vw, 5rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.04em",
                  color: "var(--col-text-main)",
                  textAlign: "center",
                  marginBottom: "2vh",
                }}
              >
                The Fall
                <br />
                Harvest
              </h2>
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--col-text-main)",
                    position: "relative",
                    display: "inline-block",
                    paddingBottom: "4px",
                  }}
                >
                  Secure a Seat
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}
