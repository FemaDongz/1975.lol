"use client";

import * as React from "react";

// PlayStopButton — dari kode yang dikasih (styled-components) dikonversi ke
// TSX mandiri (tanpa styled-components). Fungsional: PLAY/STOP audio.
// - PLAY = putih, STOP = merah (glow + border + text ikut)
// - klik: slab penuh otomatis lalu balik, warna berganti setelah retract
// - noise overlay di tepi + background
// - teks animasi letter-glow, ikon play/stop
//
// Prop opsional: src (audio), onToggle.

const DEFAULT_SRC =
  "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/audio/about-you.mp3";

export default function PlayStopButton({
  src = DEFAULT_SRC,
  onToggle,
}: {
  src?: string;
  onToggle?: (playing: boolean) => void;
}) {
  const [isStop, setIsStop] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [useLocal, setUseLocal] = React.useState(false);

  React.useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.src = useLocal
      ? "/audio/about-you.mp3"
      : src;
    audio.addEventListener("error", () => setUseLocal(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src, useLocal]);

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // bunyikan/matikan lagu
    const a = audioRef.current;
    if (a) {
      if (a.paused) a.play().catch(() => {});
      else a.pause();
    }
    const next = !isStop;
    onToggle?.(next ? false : true);

    // saat slab mulai balik (retract) warnanya ganti
    window.setTimeout(() => setIsStop(next), 450);
    window.setTimeout(() => setIsAnimating(false), 900);
  };

  const currentText = isStop ? "STOP" : "PLAY";
  const themeColor = isStop ? "#ff3344" : "#ffffff";
  const themeGlow = isStop
    ? "rgba(255,51,68,0.7)"
    : "rgba(255,255,255,0.75)";
  const themeBorder = isStop
    ? "rgba(255,51,68,0.5)"
    : "rgba(255,255,255,0.35)";
  const themeBgInset = isStop
    ? "rgba(255,20,40,0.15)"
    : "rgba(255,255,255,0.08)";

  return (
    <div style={{ display: "inline-block" }}>
      <style>{`
        .psb-btn {
          --border-radius: 24px;
          --padding: 5px;
          --transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: auto;
          padding: 0.55em 1.25em 0.55em 1em;
          font-family: "Poppins","Inter",system-ui,sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          background-color: #0d0d0d;
          border: 1px solid ${themeBorder};
          border-radius: var(--border-radius);
          cursor: pointer;
          overflow: hidden;
          color: ${themeColor};
          box-shadow:
            inset 0px 1px 1px ${themeBorder},
            inset 0px 4px 8px ${themeBgInset},
            0px 0px 12px ${themeGlow},
            0px 4px 15px rgba(0,0,0,0.5);
          transition: border var(--transition), box-shadow var(--transition), background-color var(--transition);
        }
        .psb-noise {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0.28;
          mix-blend-mode: overlay;
          z-index: 2;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .psb-btn::before {
          content: "";
          position: absolute;
          inset: calc(-1 * var(--padding));
          border-radius: calc(var(--border-radius) + var(--padding));
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.6));
          box-shadow: 0 0 16px ${themeBgInset}, inset 0 1px 1px ${themeBorder};
          z-index: -1;
          transition: box-shadow var(--transition);
        }
        .psb-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: linear-gradient(0deg, ${themeGlow} 0%, transparent 70%);
          opacity: 0.15;
          transition: opacity var(--transition), filter var(--transition);
          z-index: 1;
        }
        .psb-txt { position: relative; display: inline-flex; align-items: center; z-index: 3; }
        .psb-letter {
          position: relative; display: inline-block;
          color: ${themeColor};
          text-shadow: 0 0 8px ${themeGlow};
          animation: psb-letter-glow 2.4s ease-in-out infinite;
          transition: color var(--transition), text-shadow var(--transition);
        }
        @keyframes psb-letter-glow {
          0%,100% { opacity: 0.85; text-shadow: 0 0 4px ${themeGlow}; }
          50% { opacity: 1; text-shadow: 0 0 12px ${themeColor}, 0 0 18px ${themeGlow}; }
        }
        .psb-svg {
          width: 17px; height: 17px; margin-right: 0.55rem;
          color: ${themeColor};
          filter: drop-shadow(0 0 6px ${themeGlow});
          z-index: 3;
          transition: color var(--transition), filter var(--transition), transform 0.25s ease;
        }
        .psb-btn:hover {
          box-shadow: inset 0px 1px 2px ${themeColor}, inset 0px 4px 10px ${themeBgInset}, 0px 0px 20px ${themeGlow};
        }
        .psb-btn:hover::after { opacity: 0.35; }
        .psb-btn:hover .psb-svg { transform: scale(1.1); }
        .psb-btn.psb-anim::after { animation: psb-slab 0.9s cubic-bezier(0.25,1,0.5,1) forwards; }
        .psb-btn.psb-anim .psb-letter { animation: psb-pulse 0.9s ease-in-out forwards; }
        .psb-btn.psb-anim .psb-svg { transform: scale(1.25); }
        @keyframes psb-slab {
          0% { opacity: 0.2; }
          45% { opacity: 0.9; background: radial-gradient(circle at center, ${themeColor} 0%, ${themeGlow} 70%, transparent 100%); filter: brightness(220%); }
          100% { opacity: 0.15; background: linear-gradient(0deg, ${themeGlow} 0%, transparent 70%); filter: brightness(100%); }
        }
        @keyframes psb-pulse {
          0%,100% { transform: scale(1); }
          45% { transform: scale(1.15); color: #fff; text-shadow: 0 0 16px #fff, 0 0 24px ${themeGlow}; }
        }
        @media (prefers-reduced-motion: reduce) {
          .psb-letter, .psb-btn.psb-anim::after, .psb-btn.psb-anim .psb-letter { animation: none; }
        }
      `}</style>

      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          type="button"
          className={`psb-btn${isAnimating ? " psb-anim" : ""}`}
          onClick={handleClick}
          aria-label={isStop ? "Stop music" : "Play music"}
        >
          <svg className="psb-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {isStop ? (
              <rect x="6" y="6" width="12" height="12" rx="2" />
            ) : (
              <polygon points="7,5 19,12 7,19" />
            )}
          </svg>

          <div className="psb-txt">
            {currentText.split("").map((letter, index) => (
              <span
                key={`${currentText}-${index}`}
                className="psb-letter"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {letter}
              </span>
            ))}
          </div>

          <div className="psb-noise" />
        </button>
      </div>
    </div>
  );
}
