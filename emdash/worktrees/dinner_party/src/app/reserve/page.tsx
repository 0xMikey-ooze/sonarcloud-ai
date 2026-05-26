"use client"

import { useState } from "react"
import { NoiseCanvas } from "@/components/NoiseCanvas"
import { NocturneHeader } from "@/components/NocturneHeader"

export default function ReservePage() {
  const [selectedDay, setSelectedDay] = useState(24)

  const daysInMonth = 30
  const firstDayOfWeek = 3

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const availableDays = [17, 24]

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
            <br />a Seat
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
            Select your desired date and party size. Due to the intimate nature of our gatherings,
            space is highly limited. No substitutions can be accommodated.
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
              <option>2 Guests</option>
              <option>4 Guests</option>
              <option>6 Guests (Private Table)</option>
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
              <option>November 2024</option>
              <option>December 2024</option>
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
              <span>CHAP. VII</span>
              <span>24 NOV 2024</span>
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
              The Fall
              <br />
              Harvest
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
              By Chef Elias Vane
            </span>

            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.2rem",
                lineHeight: 1.5,
                marginBottom: "4vh",
              }}
            >
              An exploration of root and ember. Chef Vane returns to his origins, presenting a menu
              that honors the stark beauty of late autumn. Expect smoke-kissed preserves, game from
              the northern woods, and forgotten tubers brought to the fore.
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
                Tasting Preview
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
                <span>Charred Salsify</span>
                <span>Marrow &amp; Pine</span>
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
                <span>Venison Loin</span>
                <span>Blackberry &amp; Ash</span>
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
                <span>Smoked Chestnut</span>
                <span>Brown Butter</span>
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
