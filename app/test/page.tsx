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
        background: "#000",
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
          intensity={1.35}
          palette={{
            background: "#050300",
            blue: "#3a2600",
            violet: "#b87400",
            magenta: "#ffb020",
            cyan: "#ffe08a",
            gold: "#fff3c4",
          }}
        />
      </div>
    </div>
  );
}
