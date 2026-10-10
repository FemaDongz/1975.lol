"use client";

import * as React from "react";

// Tombol musik — struktur persis AntiMetalButton:
//   teks di KANAN, grup titik (chevron) di slab kiri.
// Perilaku:
//   - lebar menyesuaikan panjang teks
//   - normal: slab putih glow (dot hitam)
//   - saat klik (play): slab GESER melebar ke kanan, lalu BALIK sendiri
//     (tanpa klik) -> baru mode STOP (merah) + teks "Stop"
//   - klik lagi: kembali ke normal (play) dengan animasi geser
//   - rounded mengikuti sudut frame + gap dari bawah & sisi

const CDN_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";
const LOCAL_SRC = "/audio/about-you.mp3";

const SLIDE_MS = 420; // durasi animasi geser

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
  const [slideOpen, setSlideOpen] = React.useState(false); // slab melebar
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
    if (a.paused) {
      a.play().catch(() => {});
      // geser melebar -> balik sendiri
      setSlideOpen(true);
      timers.current.push(setTimeout(() => setSlideOpen(false), SLIDE_MS));
    } else {
      a.pause();
      setSlideOpen(true);
      timers.current.push(setTimeout(() => setSlideOpen(false), SLIDE_MS));
    }
  };

  const accentFrom = playing ? "#ff4d4d" : "#ffffff";
  const accentTo = playing ? "#e01b1b" : "#e6e6e6";
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
          right: "calc(clamp(6px, 6px, 10px) + env(safe-area-inset-right, 0px))",
          bottom:
            "max(calc(clamp(6px, 6px, 10px) + env(safe-area-inset-bottom, 0px)), 18px)",
          zIndex: 60,
          display: "inline-flex",
          alignItems: "center",
          height: 44,
          width: "auto",
          minWidth: 108,
          padding: "0 18px",
          overflow: "hidden",
          borderRadius: "clamp(16px, 16px, 22px)",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",
          boxShadow: playing
            ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 18px 2px rgba(255,60,60,0.55), 0 4px 12px rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 14px 1px rgba(255,255,255,0.28), 0 4px 12px rgba(0,0,0,0.18)",
          transition: "box-shadow 0.35s ease",
        }}
      >
        {/* teks di KANAN (nempel dot slab) */}
        <span
          style={{
            position: "relative",
            zIndex: 20,
            marginLeft: "auto",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#ffffff",
            textShadow: "0 1px 2px rgba(0,0,0,.5)",
            paddingLeft: 10,
          }}
        >
          {label}
        </span>

        {/* slab + titik: diam = kecil di kiri ; klik = geser melebar lalu balik */}
        <span
          aria-hidden="true"
          className="mb-slab"
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: 4,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 6,
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
          <DotGroup index={0} dotColor="#0f0f0f" />
          <DotGroup index={1} dotColor="#0f0f0f" />
          <DotGroup index={2} dotColor="#0f0f0f" />
        </span>
      </button>
    </>
  );
}
