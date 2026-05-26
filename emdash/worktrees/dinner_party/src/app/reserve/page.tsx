"use client"

import { useState } from "react"
import { NoiseCanvas } from "@/components/NoiseCanvas"
import { NocturneHeader } from "@/components/NocturneHeader"

export default function ReservePage() {
  const [selectedDay, setSelectedDay] = useState(15)

  // August 2026 starts on Saturday (index 6)
  const daysInMonth = 31
  const firstDayOfWeek = 6

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const availableDays = [15]

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

          <div style={{ marginBottom: "3vh" }}>
            <label
              style={{
                display: "block",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1vh",
                opacity: 0.6,
              }}
            >
              Party Size
            </label>
            <select
              style={{
                width: "100%",
                maxWidth: "300px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--col-text-main)",
                borderRadius: 0,
                padding: "10px 0",
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                color: "var(--col-text-main)",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
              <option>4 Guests</option>
            </select>
          </div>

          <div style={{ marginBottom: "3vh" }}>
            <label
              style={{
                display: "block",
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1vh",
                opacity: 0.6,
              }}
            >
              Select Month
            </label>
            <select
              style={{
                width: "100%",
                maxWidth: "300px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--col-text-main)",
                borderRadius: 0,
                padding: "10px 0",
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                color: "var(--col-text-main)",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option>August 2026</option>
            </select>
          </div>

          <div style={{ marginBottom: "4vh" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "10px",
                maxWidth: "300px",
              }}
            >
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    opacity: 0.5,
                    textAlign: "center",
                    paddingBottom: "10px",
                  }}
                >
                  {day}
                </div>
              ))}

              {days.map((day, i) => {
                if (day === null) {
                  return <div key={i} />
                }

                const isAvailable = availableDays.includes(day)
                const isSelected = selectedDay === day

                return (
                  <button
                    key={i}
                    onClick={() => isAvailable && setSelectedDay(day)}
                    disabled={!isAvailable}
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.1rem",
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      borderRadius: "50%",
                      transition: "all 0.3s ease",
                      opacity: isAvailable ? 1 : 0.2,
                      border: "none",
                      backgroundColor: isSelected ? "var(--col-text-main)" : "transparent",
                      color: isSelected ? "var(--col-bg-main)" : "var(--col-text-main)",
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

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
              <span>15 AUG 2026</span>
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

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.2rem",
                lineHeight: 1.5,
                marginBottom: "4vh",
              }}
            >
              The inaugural Be My Guest experience. A sunset-inspired evening featuring a 3-course
              dinner, curated cocktails, beautiful people, and unforgettable vibes. Space is
              intentionally limited.
            </p>

            <div
              style={{
                borderTop: "1px solid rgba(10,10,10,0.2)",
                paddingTop: "2vh",
                marginBottom: "4vh",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "2vh",
                }}
              >
                The Evening
              </div>
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
                <span>Cocktail Hour</span>
                <span>5:00 PM</span>
              </div>
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
                <span>3-Course Dinner</span>
                <span>6:15 PM Sharp</span>
              </div>
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
                <span>Music & Conversation</span>
                <span>All Evening</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontFamily: "var(--font-sans)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--col-text-main)",
                  position: "relative",
                  display: "inline-block",
                  paddingBottom: "4px",
                  cursor: "pointer",
                }}
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
