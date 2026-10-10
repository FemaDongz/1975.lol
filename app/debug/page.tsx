"use client";

import AetherHero from "../AetherHero";
import PixelIntro, { type TextEntry } from "../PixelIntro";
import GridVideos from "../GridVideos";
import useGridCols from "../useGridCols";

const TEXT_1975 = ["1", "9", "7", "5"];
const TEXT_CS = ["C", "O", "M", "I", "N", "G", " ", "S", "O", "O", "N"];
const TEXT_IG_SINGLE = [
  "[",
  "I",
  "G",
  "]",
  " ",
  "F",
  "e",
  "m",
  "a",
  "a",
  "n",
  "d",
  "a",
  "r",
  "a",
];

const SEQ: TextEntry[] = [
  { single: TEXT_1975 },
  {
    single: TEXT_CS,
    stacked: [
      ["C", "O", "M", "I", "N", "G"],
      ["S", "O", "O", "N"],
    ],
  },
  {
    single: TEXT_IG_SINGLE,
    stacked: [
      ["[", "I", "G", "]"],
      ["F", "e", "m", "a", "a", "n", "d", "a", "r", "a"],
    ],
  },
];

export default function Test2Page() {
  const cols = useGridCols();
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
          cols={cols}
        />
        {/* Video YouTube random di area grid, ganti tiap 5 detik */}
        <GridVideos cols={cols} />
        {/* Vignette rounded halus (mengikuti lengkung container) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            borderRadius: 16,
            boxShadow: "inset 0 0 140px 30px rgba(0,0,0,0.38)",
            pointerEvents: "none",
            transition: "box-shadow 1s ease",
          }}
        />
        {/* Sekuens pixel: 1975 -> COMING SOON -> [IG] Femaandara, loop */}
        <PixelIntro loop onDone={() => {}} texts={SEQ} cols={cols} />
      </div>
    </main>
  );
}
