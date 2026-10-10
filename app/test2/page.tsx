"use client";

import AetherHero from "../AetherHero";
import PixelIntro from "../PixelIntro";

export default function Test2Page() {
  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "#f4f2ed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Container shader: ber-gap dari sisi + rounded, seperti halaman utama */}
      <div
        style={{
          position: "absolute",
          top: "calc(6px + env(safe-area-inset-top, 0px))",
          right: "calc(6px + env(safe-area-inset-right, 0px))",
          bottom: "max(calc(6px + env(safe-area-inset-bottom, 0px)), 18px)",
          left: "calc(6px + env(safe-area-inset-left, 0px))",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Shader grid + noise di belakang */}
        <AetherHero
          title=""
          subtitle=""
          ctaLabel=""
          overlayGradient="linear-gradient(180deg, #00000055, transparent 45%, transparent)"
          height="100%"
        />
        {/* Animasi pixel 1975 dari laman utama, loop di tengah (glow + noise) */}
        <PixelIntro loop onDone={() => {}} />
        {/* Teks tengah di bawah, font Space Grotesk tersimpan */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "9%",
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "0 24px",
            textAlign: "center",
            color: "#ffffff",
            fontFamily:
              "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
              lineHeight: 1.6,
              opacity: 0.9,
              textShadow: "0 4px 24px rgba(0,0,0,0.5)",
              maxWidth: 640,
            }}
          >
            A minimal hero with a living shader background.
          </p>
          <span
            style={{
              padding: "12px 22px",
              borderRadius: 12,
              background:
                "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06))",
              fontWeight: 600,
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,.28), 0 10px 30px rgba(0,0,0,.2)",
              pointerEvents: "auto",
            }}
          >
            Get Started
          </span>
        </div>
      </div>
    </main>
  );
}
