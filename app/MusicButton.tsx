"use client";

import * as React from "react";

// Tombol musik bergaya AntiMetalButton, fungsional PLAY/STOP audio.
// - Lebar mengikuti panjang teks.
// - Teks di TENGAH.
// - Slab aksen: diam = kecil di kiri, hover = melebar (transisi).
// - PLAY = putih glow ; STOP (nyala) = merah glow.
// - Hover pakai CSS :hover (media hover) supaya tidak nyangkut di HP.
//   Saat tap di HP, animasi langsung balik (reset) — tidak nyangkut.

const CDN_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
const LOCAL_SRC = "/audio/about-you.mp3";

function DotGroup({ index, dotColor }: { index: number; dotColor: string }) {
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
  const [useLocal, setUseLocal] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

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

  // PLAY = putih glow ; nyala = merah glow
  const accentFrom = playing ? "#ff4d4d" : "#ffffff";
  const accentTo = playing ? "#e01b1b" : "#d9d9d9";
  const label = playing ? "Stop" : "Play";

  return (
    <>
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
        /* slab: diam kecil di kiri; hover (perangkat mouse) melebar */
        .mb-slab {
          width: 30px;
          transition: width 0.28s cubic-bezier(0.65,0,0.35,1), background 0.35s ease, box-shadow 0.35s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .mb-root:hover .mb-slab { width: calc(100% - 8px); }
        }
        .mb-root:active { transform: scale(0.98); }
        @media (prefers-reduced-motion: reduce) {
          .mb-dot { animation: none; opacity: 1; }
        }
      `}</style>

      <button
        type="button"
        onClick={toggle}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        aria-label={playing ? "Stop music" : "Play music"}
        className="mb-root"
        style={{
          position: "fixed",
          right: "calc(clamp(6px, 6px, 10px) + env(safe-area-inset-right, 0px))",
          bottom:
            "max(calc(clamp(6px, 6px, 10px) + env(safe-area-inset-bottom, 0px)), 18px)",
          zIndex: 60,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 44,
          // lebar mengikuti panjang teks + padding
          width: "auto",
          minWidth: 92,
          padding: "0 28px",
          overflow: "hidden",
          borderRadius: "clamp(16px, 16px, 22px)",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",
          boxShadow: playing
            ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px 2px rgba(255,60,60,0.55), 0 4px 12px rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 14px 1px rgba(255,255,255,0.28), 0 4px 12px rgba(0,0,0,0.18)",
          transform: pressed ? "scale(0.98)" : "scale(1)",
          transition: "box-shadow 0.35s ease, transform 0.12s ease",
        }}
      >
        {/* slab aksen di kiri (tidak menutupi teks saat melebar karena teks z lebih tinggi) */}
        <span
          aria-hidden="true"
          className="mb-slab"
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: pressed ? "calc(100% - 34px)" : 4,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 6,
            overflow: "hidden",
            borderRadius: "clamp(12px, 12px, 18px)",
            paddingLeft: 6,
            paddingRight: 6,
            background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
            boxShadow: playing
              ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 12px rgba(255,60,60,0.7)"
              : "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.5)",
          }}
        >
          <DotGroup index={0} dotColor="#0f0f0f" />
          <DotGroup index={1} dotColor="#0f0f0f" />
          <DotGroup index={2} dotColor="#0f0f0f" />
          <DotGroup index={3} dotColor="#0f0f0f" />
          <DotGroup index={4} dotColor="#0f0f0f" />
        </span>

        <span
          style={{
            position: "relative",
            zIndex: 20,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#ffffff",
            textShadow: "0 1px 2px rgba(0,0,0,.5)",
          }}
        >
          {label}
        </span>
      </button>
    </>
  );
}
