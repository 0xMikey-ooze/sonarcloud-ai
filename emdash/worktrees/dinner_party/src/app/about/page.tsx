import { NoiseCanvas } from "@/components/NoiseCanvas"
import { NocturneHeader } from "@/components/NocturneHeader"

export default function AboutPage() {
  return (
    <>
      <NocturneHeader variant="dark" />

      <div style={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
        <div
          style={{
            position: "relative",
            width: "48%",
            minHeight: "100vh",
            backgroundColor: "var(--col-bg-left)",
            display: "flex",
            flexDirection: "column",
            padding: "calc(var(--space-edge) * 3) var(--space-edge)",
            zIndex: 2,
          }}
        >
          <NoiseCanvas
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "48%",
              height: "100%",
              zIndex: -1,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "500px",
              margin: "auto",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.5rem, 4vw, 5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                fontWeight: 300,
                color: "var(--col-text-main)",
                marginBottom: "40px",
              }}
            >
              Not a restaurant. Not a party. Something in between.
            </h1>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: 1.6,
                marginBottom: "30px",
                color: "rgba(10, 10, 10, 0.8)",
              }}
            >
              Be My Guest is a curated dinner experience designed to bring amazing people together
              over incredible food, cocktails, music, conversation, and vibes. The kind of night
              that feels like walking into someone&apos;s best dinner party — except every detail has
              been intentional.
            </p>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: 1.6,
                marginBottom: "30px",
                color: "rgba(10, 10, 10, 0.8)",
              }}
            >
              Each edition features a different theme and culinary experience. We handle the menu,
              the cocktails, the ambiance, the music, even the dress code. You show up, settle in,
              and let the evening unfold.
            </p>

            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                fontWeight: 400,
                fontStyle: "italic",
                marginBottom: "20px",
                marginTop: "50px",
              }}
            >
              Why This Exists
            </h2>

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: 1.6,
                marginBottom: "30px",
                color: "rgba(10, 10, 10, 0.8)",
              }}
            >
              The best nights out aren&apos;t at clubs or crowded restaurants. They&apos;the
              evenings where the food is memorable, the conversation flows, the music is right,
              and you look around and think — this is it. That&apos;s the energy we&apos;re building.
              Intimate, elevated, and always worth showing up for.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "40px",
                borderTop: "1px solid rgba(10, 10, 10, 0.2)",
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
                  Seating
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  Very Limited
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
                  Experience
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  3-Course Dinner + Cocktails
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
                  Vibes
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  Music, Energy, Connection
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginTop: "40px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  opacity: 0.6,
                }}
              >
                EDITION I · CURATED DINNER EXPERIENCES · SUMMER 2026
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            width: "52%",
            height: "100vh",
            backgroundColor: "#000",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000&auto=format&fit=crop"
            alt="Intimate dinner gathering with candlelight"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(100%) contrast(1.1) brightness(0.7)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "var(--space-edge)",
              right: "var(--space-edge)",
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              color: "var(--col-white)",
              fontStyle: "italic",
              zIndex: 10,
            }}
          >
            The Table
          </div>
        </div>
      </div>
    </>
  )
}
