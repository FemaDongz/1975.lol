"use client";

import { useEffect, useState } from "react";
import RawSketchBackground from "./RawSketchBackground";

export default function Home() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);

  const toggle = () => {
    setDark((d) => {
      const next = !d;
      window.localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const ink = dark ? "#141517" : "#e8e6e1";
  const pageBg = dark ? "#0a0a0c" : "#f4f2ed";

  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: pageBg,
        color: dark ? "#e8e6e1" : "#000",
        transition: "background 1s ease, color 1s ease",
      }}
    >
      <RawSketchBackground dark={dark} />

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
          mixBlendMode: dark ? "screen" : "exclusion",
          color: ink,
          transition: "color 1s ease",
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
            <p>Portofolio Web Fema Andara Haqi</p>
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
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pill"
              style={{ border: "1px solid currentColor", color: "inherit" }}
            >
              Listen
            </a>
            <button
              type="button"
              onClick={toggle}
              className="pill"
              style={{ border: "1px solid currentColor", color: "inherit" }}
              aria-label="Toggle dark mode"
            >
              {dark ? "Light" : "Dark"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ cursor: "pointer" }}>Instagram</span>
            <span style={{ cursor: "pointer" }}>Twitter</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
