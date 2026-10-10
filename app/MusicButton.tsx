"use client";

import * as React from "react";

// Tombol musik bergaya AntiMetalButton (slab aksen melebar + dot-wave),
// fungsional: PLAY / STOP audio. Saat STOP (sedang main) warna jadi merah +
// glow. Taruh di pojok kanan bawah.

const CDN_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
const LOCAL_SRC = "/audio/about-you.mp3";

function DotGroup({
  index,
  dotColor,
}: {
  index: number;
  dotColor: string;
}) {
  const base = index * 0.12;
  const dots = [
    { cx: 2, cy: 2, d: 0 },
    { cx: 5, cy: 5, d: 0.05 },
    { cx: 8, cy: 8, d: 0.1 },
    { cx: 5, cy: 11, d: 0.15 },
    { cx: 2, cy: 14, d: 0.2 },
    { cx: 6, cy: 2, d: 0.05 },
    { cx: 9, cy: 5, d: 0.1 },
    { cx: 12, cy: 8, d: 0.15 },
    { cx: 9, cy: 11, d: 0.2 },
    { cx: 6, cy: 14, d: 0.25 },
  ];
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      aria-hidden="true"
      style={{ flexShrink: 0, overflow: "visible" }}
    >
      <g fill={dotColor}>
        {dots.map((o, i) => (
          <circle
            key={i}
            cx={o.cx}
            cy={o.cy}
            r="1"
            className="mb-dot"
            style={{ animationDelay: `${base + o.d}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

export default function MusicButton() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [useLocal, setUseLocal] = React.useState(false);

  React.useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.src = useLocal ? LOCAL_SRC : CDN_SRC;
    audio.addEventListener("error", () => setUseLocal(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("play", () => setPlaying(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [useLocal]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  // warna: PLAY = kuning-hijau (asli), STOP/nyala = merah + glow
  const accentFrom = playing ? "#ff4d4d" : "#d6f54a";
  const accentTo = playing ? "#e01b1b" : "#c5ea2c";
  const dotColor = "#0f0f0f";

  return (
    <button
      type="button"
      onClick={toggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={playing ? "Stop music" : "Play music"}
      style={{
        position: "fixed",
        right: "calc(18px + env(safe-area-inset-right, 0px))",
        bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
        zIndex: 60,
        display: "inline-flex",
        height: 44,
        width: 144,
        overflow: "hidden",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        padding: 0,
        background: "linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",
        boxShadow: playing
          ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px 2px rgba(255,60,60,0.55), 0 4px 12px rgba(0,0,0,0.3)"
          : "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.18)",
        transition: "box-shadow 0.3s ease, transform 0.15s ease",
      }}
    >
      <style>{`
        @keyframes mb-dot-wave {
          0%, 70%, 100% { opacity: 0.25; transform: scale(0.85); }
          35% { opacity: 1; transform: scale(1); }
        }
        .mb-dot {
          transform-box: fill-box;
          transform-origin: center;
          animation: mb-dot-wave 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mb-dot { animation: none; opacity: 1; }
        }
      `}</style>
      <span
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 16,
          display: "flex",
          alignItems: "center",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "#ffffff",
          whiteSpace: "nowrap",
        }}
      >
        {playing ? "Stop" : "Play"}
      </span>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 10,
          width: hover ? "calc(100% - 8px)" : 36,
          overflow: "hidden",
          borderRadius: 8,
          paddingLeft: 12,
          paddingRight: 10,
          background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
          boxShadow: playing
            ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 12px rgba(255,60,60,0.7)"
            : "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
          transition:
            "width 0.2s cubic-bezier(0.65,0,0.35,1), background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <DotGroup index={0} dotColor={dotColor} />
        <DotGroup index={1} dotColor={dotColor} />
        <DotGroup index={2} dotColor={dotColor} />
        <DotGroup index={3} dotColor={dotColor} />
        <DotGroup index={4} dotColor={dotColor} />
      </span>
    </button>
  );
}
