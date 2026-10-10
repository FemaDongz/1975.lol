"use client";

import PrismCometPreloader from "../PrismCometPreloader";

export default function TestPage() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#03030b",
        padding: "clamp(24px, 8vh, 120px) 0",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1400 }}>
        <PrismCometPreloader
          instant
          word=""
          caption=""
          hud={false}
          grid={false}
          grain={false}
          height="70svh"
        />
      </div>
    </div>
  );
}
