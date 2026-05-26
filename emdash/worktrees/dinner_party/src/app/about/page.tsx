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
              An intimate venue for culinary exploration.
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
              Nocturne was conceived as a reaction against the modern dining experience. We believe
              that true connection happens when distractions are removed and focus is returned to the
              essential elements: food, atmosphere, and the people beside you.
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
              Our space is intentionally small, seating only twelve guests per evening. This allows
              us to curate an environment where every detail is considered, and where the line
              between guest and participant begins to blur.
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
              The Philosophy
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
              We source obsessively, looking for ingredients that tell a story of their environment.
              The menu is a living document, changing not just with the seasons, but with the
              micro-seasons of our local purveyors. There are no substitutions, as each menu is
              designed as a complete, cohesive narrative.
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
                  Disclosed upon booking
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
                  12 Guests Maximum
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
                  Schedule
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  Thursday — Saturday
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
                  Policy
                </h4>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
                  No Phones Permitted
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
                ESTABLISHED 2023 · AN EPHEMERAL CULINARY EXPERIENCE
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
            alt="Intimate dimly lit dining room with a long table"
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
            The Dining Room
          </div>
        </div>
      </div>
    </>
  )
}
