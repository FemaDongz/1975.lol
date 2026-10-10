"use client";

import AetherHero from "../AetherHero";

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
        <AetherHero height="100%" />
      </div>
    </main>
  );
}
