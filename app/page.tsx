"use client";

import RawSketchBackground from "./RawSketchBackground";

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#f4f2ed",
        color: "#000",
      }}
    >
      {/* Background ink: Domain Warping + FBM noise */}
      <RawSketchBackground />

      {/* Konten di atas background, blend exclusion biar kontras ikut ink */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "clamp(24px, 4vw, 64px)",
          mixBlendMode: "exclusion",
          color: "#e8e6e1",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            textTransform: "uppercase",
            letterSpacing: "-0.05em",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>1975 • OGL</span>
            <span style={{ opacity: 0.5 }}>Creative Developer</span>
          </div>
          <div style={{ textAlign: "right", opacity: 0.5 }}>
            Based in Indonesia
            <br />
            {new Date().getFullYear()} ©
          </div>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <h1
              style={{
                fontSize: "clamp(56px, 12vw, 180px)",
                lineHeight: 0.8,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                fontFamily: "var(--font-serif)",
              }}
            >
              RAW <br />
              <span
                style={{
                  marginLeft: "10vw",
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                Sketch
              </span>
            </h1>
          </div>
          <div
            style={{
              marginTop: 32,
              maxWidth: 448,
              fontSize: 18,
              lineHeight: 1.1,
              opacity: 0.8,
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            <p>
              Simulating fluid dynamics and graphite textures using Domain
              Warping and FBM noise. Interact to disturb the ink.
            </p>
          </div>
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: 12,
          }}
        >
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: "1px solid currentColor",
              padding: "8px 24px",
              borderRadius: 999,
              color: "inherit",
              textDecoration: "none",
              transition: "background 0.3s, color 0.3s",
            }}
          >
            Listen
          </a>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ cursor: "pointer" }}>Instagram</span>
            <span style={{ cursor: "pointer" }}>Twitter</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
