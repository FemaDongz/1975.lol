"use client";

import * as React from "react";

// Tombol musik bergaya AntiMetalButton.
// - Lebar button diukur dari panjang teks (PLAY/STOP) + ruang dot.
// - Klik: slab GESER melebar penuh, lalu BALIK OTOMATIS (tanpa klik/hover),
//   dan saat sudah balik barulah warna berganti.
// - PLAY = slab putih glow ; STOP = slab merah glow.
// - Putih glow juga di border button saat mode PLAY.

const CDN_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
const LOCAL_SRC = "/audio/about-you.mp3";

const SLIDE_MS = 420;

function DotGroup({ dotColor }: { dotColor: string }) {
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
      focusable="false"
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
            style={{ animationDelay: `${o.d}s` }}
          />
        ))}
      </g>
    </svg>
  );
}

// ukur lebar teks (px) agar button pas dengan panjang teks
function measureText(text: string): number {
  if (typeof document === "undefined") return 60;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) return 60;
  ctx.font = "500 14px system-ui, sans-serif";
  return Math.ceil(ctx.measureText(text).width);
}

export default function PlayButton() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [slideOpen, setSlideOpen] = React.useState(false);
  const [useLocal, setUseLocal] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

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
      timers.current.forEach(clearTimeout);
    };
  }, [useLocal]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    clearTimers();
    const willPlay = a.paused;
    if (willPlay) a.play().catch(() => {});
    else a.pause();
    // slab geser penuh -> balik otomatis -> warna berganti mengikuti audio
    setSlideOpen(true);
    timers.current.push(setTimeout(() => setSlideOpen(false), SLIDE_MS));
  };

  const label = playing ? "STOP" : "PLAY";
  const accentFrom = playing ? "#ff4d4d" : "#ffffff";
  const accentTo = playing ? "#e01b1b" : "#e6e6e6";
  // lebar button = teks terpanjang + ruang dot (34) + padding (rapat)
  const btnWidth =
    Math.max(measureText("PLAY"), measureText("STOP")) + 34 + 12 + 8;

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
        .mb-slab {
          transition: width ${SLIDE_MS}ms cubic-bezier(0.65,0,0.35,1), background 0.35s ease, box-shadow 0.35s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .mb-dot { animation: none; opacity: 1; }
          .mb-slab { transition: background 0.3s ease; }
        }
      `}</style>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Stop music" : "Play music"}
        style={{
          position: "fixed",
          right: "calc(clamp(6px,6px,10px) + 12px + env(safe-area-inset-right, 0px))",
          bottom:
            "max(calc(clamp(6px,6px,10px) + 12px + env(safe-area-inset-bottom, 0px)), 30px)",
          zIndex: 60,
          display: "inline-flex",
          alignItems: "center",
          height: 44,
          width: btnWidth,
          overflow: "hidden",
          borderRadius: "clamp(16px, 16px, 22px)",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",
          boxShadow: playing
            ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px 2px rgba(255,60,60,0.55), 0 4px 12px rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 14px 1px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.18)",
          transition: "box-shadow 0.35s ease",
        }}
      >
        {/* slab: diam kecil di kiri, klik = geser penuh lalu balik otomatis */}
        <span
          aria-hidden="true"
          className="mb-slab"
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: 4,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: slideOpen ? "flex-start" : "center",
            width: slideOpen ? "calc(100% - 8px)" : 34,
            overflow: "hidden",
            borderRadius: "clamp(11px, 11px, 18px)",
            paddingLeft: 8,
            paddingRight: 8,
            background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
            boxShadow: playing
              ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 12px rgba(255,60,60,0.7)"
              : "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.6)",
          }}
        >
          <DotGroup dotColor="#0f0f0f" />
        </span>

        {/* teks KAPITAL di kanan; z di BAWAH slab supaya tertutup saat slab penuh */}
        <span
          style={{
            position: "relative",
            zIndex: 5,
            marginLeft: "auto",
            paddingRight: 14,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: playing ? "#ff4d4d" : "#ffffff",
            textShadow: playing
              ? "0 0 8px rgba(255,60,60,0.9), 0 0 3px rgba(255,60,60,0.7)"
              : "0 1px 2px rgba(0,0,0,.5)",
            transition: "color 0.35s ease, text-shadow 0.35s ease",
          }}
        >
          {label}
        </span>
      </button>
    </>
  );
}
