"use client";

import * as React from "react";
import ContributionSkyline from "../ContributionSkyline";
import AntiMetalButton from "../AntiMetalButton";

// Beberapa komponen 21st yang sudah direkonstruksi dari bundle publik CDN.
// Tombol "Next" di kanan bawah buat ganti tampilan komponen.

const ROUTES = ["/test3", "/test", "/test2", "/debug"];

export default function Test3Page() {
  const [idx, setIdx] = React.useState(0);

  const next = () => {
    const n = (idx + 1) % ROUTES.length;
    setIdx(n);
    window.location.href = ROUTES[n];
  };

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        background: "#f4f2ed",
        padding: 40,
      }}
    >
      <div style={{ width: "100%", maxWidth: 980 }}>
        <ContributionSkyline endDate="2017-11-08" />
      </div>

      <AntiMetalButton label="Book a demo" />

      {/* Tombol Next kanan bawah buat pindah component terfetch */}
      <button
        type="button"
        onClick={next}
        aria-label="Next component"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 18px",
          borderRadius: 999,
          border: "1px solid #0a0a0c",
          background: "#0a0a0c",
          color: "#f4f2ed",
          fontFamily: "var(--font-geist, system-ui, sans-serif)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: "pointer",
        }}
      >
        Next
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </button>
    </main>
  );
}
