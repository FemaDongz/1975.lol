"use client";

import * as React from "react";

// Tombol PLAY/STOP musik — struktur AntiMetalButton (teks kanan, slab+dot kiri),
// tapi fungsional:
//   - PLAY: slab putih glow, teks putih glow, tombol putih glow, lebar ikut teks
//   - STOP: slab merah, teks merah glow, tombol merah glow
//   - noise overlay (dari gaya background) di seluruh tombol
//   - klik PLAY: slab geser penuh -> AUTO balik sendiri -> baru ganti MERAH
//   - klik STOP: sama, balik lalu kembali putih

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

export default function MusicButton() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [slide, setSlide] = React.useState(false);
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
    if (a.paused) a.play().catch(() => {});
    else a.pause();
    // slab geser penuh lalu AUTO balik (tanpa hover/klik luar)
    setSlide(true);
    timers.current.push(setTimeout(() => setSlide(false), SLIDE_MS));
  };

  const red = playing;
  const accentFrom = red ? "#ff4d4d" : "#ffffff";
  const accentTo = red ? "#e01b1b" : "#e2e2e2";
  const textGlow = red
    ? "0 0 10px rgba(255,60,60,0.9), 0 0 22px rgba(255,60,60,0.6)"
    : "0 0 10px rgba(255,255,255,0.9), 0 0 22px rgba(255,255,255,0.6)";
  const temp = red ? "#ff4d4d" : "#ffffff";
  const label = playing ? "STOP" : "PLAY";

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
        .mb-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.16;
          mix-blend-mode: screen;
          background-image:
            radial-gradient(rgba(255,255,255,.9) 0.5px, transparent 0.6px),
            radial-gradient(rgba(255,255,255,.5) 0.5px, transparent 0.6px);
          background-size: 3px 3px, 5px 5px;
          background-position: 0 0, 1px 2px;
          animation: mb-noise 0.5s steps(3) infinite;
          border-radius: inherit;
        }
        @keyframes mb-noise {
          0% { transform: translate(0,0); }
          33% { transform: translate(-1px,1px); }
          66% { transform: translate(1px,-1px); }
          100% { transform: translate(0,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mb-dot { animation: none; opacity: 1; }
          .mb-noise { animation: none; }
          .mb-slab { transition: background 0.3s ease; }
        }
      `}</style>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Stop music" : "Play music"}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          height: 44,
          width: "auto",
          padding: "4px",
          overflow: "hidden",
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(180deg,#1a1a1a 0%,#0a0a0a 100%)",
          boxShadow: red
            ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px 3px rgba(255,60,60,0.65), 0 4px 12px rgba(0,0,0,0.3)"
            : "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px 3px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.18)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* slab + 1 pack dot (diam) / melebar saat klik */}
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
            justifyContent: slide ? "flex-start" : "center",
            gap: 6,
            width: slide ? "calc(100% - 8px)" : 34,
            overflow: "hidden",
            borderRadius: 8,
            paddingLeft: 8,
            paddingRight: 8,
            background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
            boxShadow: red
              ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 0 12px rgba(255,60,60,0.75)"
              : "inset 0 1px 0 rgba(255,255,255,0.6), 0 0 12px rgba(255,255,255,0.6)",
          }}
        >
          <DotGroup dotColor="#0f0f0f" />
          {[1, 2, 3].map((k) => (
            <span
              key={k}
              style={{
                display: "inline-flex",
                opacity: slide ? 1 : 0,
                transform: slide ? "scale(1)" : "scale(0.6)",
                transition: `opacity 0.3s ease ${slide ? k * 60 : 0}ms, transform 0.3s ease ${slide ? k * 60 : 0}ms`,
              }}
            >
              <DotGroup dotColor="#0f0f0f" />
            </span>
          ))}
        </span>

        {/* teks kanan (di atas slab), glow warna tema */}
        <span
          style={{
            position: "relative",
            zIndex: 30,
            marginLeft: "auto",
            padding: "0 16px 0 54px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: temp,
            textShadow: textGlow,
            transition: "color 0.4s ease, text-shadow 0.4s ease",
          }}
        >
          {label}
        </span>

        {/* noise overlay seluruh tombol */}
        <span className="mb-noise" aria-hidden="true" />
      </button>
    </>
  );
}
