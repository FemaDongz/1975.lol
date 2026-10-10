"use client";

import { useEffect, useState } from "react";
import RawSketchBackground from "../RawSketchBackground";
import PixelIntro from "../PixelIntro";

export default function Home() {
  const [dark, setDark] = useState(false);
  const [intro, setIntro] = useState(true);

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

  // Teks putih + mix-blend-difference: otomatis kontras di area kertas maupun
  // ink (di terang jadi gelap, di gelap jadi terang) sambil tetap "nyatu".
  const ink = "#ffffff";
  // Ripple selalu tampil (intro & halaman). Saat intro dipaksa gelap supaya
  // pixel putih glow kontras; setelah intro kembali ke tema asli (transisi
  // di shader via lerp uTheme, jadi mulus).
  const shaderDark = intro ? true : dark;
  // Warna area di LUAR frame (yang membuat rounded kelihatan).
  // Saat intro: putih. Setelahnya: hitam di light, putih di dark.
  const outerBg = intro ? "#f4f2ed" : dark ? "#f4f2ed" : "#0a0a0c";
  // Isi dasar frame. Saat intro: hitam (biar pixel putih glow kontras).
  const frameFill = intro ? "#0a0a0c" : outerBg;

  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: outerBg,
        transition: "background 1s ease",
      }}
    >
      {/* Container ripple: ber-gap dari sisi + rounded. Intro pixel masuk di sini
          biar nyatu (kena rounded + garis) dan ripple muncul halus setelahnya. */}
      <div className="frame" style={{ background: frameFill }}>
        {/* Ripple: selalu ada. Saat intro kertas dibuat tembus (paperAlpha 0)
            supaya angka 1975 di belakangnya tembus & tertimpa garis ink. */}
        <RawSketchBackground dark={shaderDark} paperAlpha={intro ? 0 : 1} />

        {intro && (
          <PixelIntro
            onDone={() => {
              setTimeout(() => setIntro(false), 60);
            }}
          />
        )}

          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
              padding:
                "clamp(24px, 4vw, 64px) clamp(24px, 4vw, 64px) max(clamp(24px, 4vw, 64px), calc(env(safe-area-inset-bottom, 0px) + 24px))",
              color: ink,
              mixBlendMode: "difference",
              opacity: intro ? 0 : 1,
              transition: "color 1s ease, opacity 1.2s ease",
              pointerEvents: intro ? "none" : "auto",
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
      </div>
    </main>
  );
}
