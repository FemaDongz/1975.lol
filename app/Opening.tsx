"use client";

import { useEffect, useRef, useState } from "react";

// Opening: angka 1975 muncul bergulir dari atas ke bawah (gacha/slot),
// berhenti bertahap tiap 0.5s. Tiap angka berhenti, tema warna berganti.
// Warna terakhir = hitam. Setelah selesai, onDone() dipanggil.

type Theme = {
  name: "dark" | "light";
  bg: string; // warna frame/paper
  digit: string; // warna angka
};

const THEMES: Theme[] = [
  { name: "dark", bg: "#f4f2ed", digit: "#0a0a0c" }, // putih
  { name: "light", bg: "#00f0ff", digit: "#0a0a0c" }, // cyan
  { name: "dark", bg: "#ff0077", digit: "#ffffff" }, // pink
  { name: "light", bg: "#ffe600", digit: "#0a0a0c" }, // kuning
  { name: "dark", bg: "#0a0a0c", digit: "#f4f2ed" }, // hitam (final)
];

const TARGET = "1975";
const STOP_MS = 500; // tiap angka berhenti 0.5s
const SPIN_MS = 120; // interval gulir cepat
const DIGITS = "0123456789";

export default function Opening({ onDone }: { onDone: () => void }) {
  const [theme, setTheme] = useState(0);
  const [locked, setLocked] = useState(0); // jumlah digit yang sudah berhenti
  const [scrolling, setScrolling] = useState(true);
  const [reels, setReels] = useState<string[]>(["0", "0", "0", "0"]);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);

  // Gulir cepat: angka acak selama masih scrolling
  useEffect(() => {
    if (!scrolling) return;
    const id = setInterval(() => {
      setReels((prev) =>
        prev.map((d, i) =>
          i >= locked ? DIGITS[Math.floor(Math.random() * 10)] : d
        )
      );
    }, SPIN_MS);
    return () => clearInterval(id);
  }, [scrolling, locked]);

  // Berhenti bertahap tiap 0.5s
  useEffect(() => {
    if (locked >= TARGET.length) {
      setScrolling(false);
      return;
    }
    const id = setTimeout(() => {
      const nextLocked = locked + 1;
      setReels((prev) =>
        prev.map((d, i) => (i === nextLocked - 1 ? TARGET[i] : d))
      );
      setLocked(nextLocked);
      // Tiap angka berhenti -> ganti tema warna
      setTheme((t) => Math.min(t + 1, THEMES.length - 1));
    }, STOP_MS);
    return () => clearTimeout(id);
  }, [locked]);

  // Selesai semua -> fade out -> panggil onDone
  useEffect(() => {
    if (locked < TARGET.length) return;
    const t1 = setTimeout(() => setFading(true), 600);
    const t2 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [locked, onDone]);

  const th = THEMES[theme];

  return (
    <div
      aria-hidden={fading}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: th.bg,
        transition: "background 0.5s ease, opacity 0.8s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: "clamp(72px, 20vw, 260px)",
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontFamily: "var(--font-serif)",
          color: th.digit,
          transition: "color 0.5s ease",
          filter: "blur(0.6px)",
          textShadow: "0 0 28px rgba(0,0,0,0.06)",
          mixBlendMode: "difference",
        }}
      >
        {reels.map((d, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: "0.62em",
              textAlign: "center",
              // digit yang belum berhenti rada blur + turun (efek gulir)
              opacity: i < locked ? 1 : 0.72,
              transform: i < locked ? "translateY(0)" : "translateY(0.04em)",
              filter: i < locked ? "blur(0)" : "blur(1.4px)",
              transition:
                "opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease",
            }}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
