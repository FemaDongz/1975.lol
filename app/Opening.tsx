"use client";

import { useEffect, useRef, useState } from "react";

// Opening: ANGKA gacha. Satu digit bergulir dari atas ke bawah (loop),
// berhenti bertahap tiap 1 detik dari kiri ke kanan sampai "1975".
// Background ripple tetap terlihat (overlay ini transparan). Tiap digit
// berhenti, laporkan warna kertas baru (putih <-> hitam) ke page lewat
// onPaper(). Final = hitam. Lalu onDone().

const TARGET = "1975";
const STOP_MS = 1000;
const DIGITS = "0123456789";
const PAPER = ["#f4f2ed", "#0a0a0c", "#f4f2ed", "#0a0a0c", "#0a0a0c"];

export default function Opening({
  onDone,
  onPaper,
}: {
  onDone: () => void;
  onPaper: (color: string) => void;
}) {
  const [paperIdx, setPaperIdx] = useState(0);
  const [locked, setLocked] = useState(0);
  const [spin, setSpin] = useState(0);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (locked >= TARGET.length) return;
    const id = setInterval(() => setSpin((s) => s + 1), 90);
    return () => clearInterval(id);
  }, [locked]);

  useEffect(() => {
    if (locked >= TARGET.length) return;
    const id = setTimeout(() => {
      const next = Math.min(paperIdx + 1, PAPER.length - 1);
      setPaperIdx(next);
      setLocked((l) => l + 1);
      onPaper(PAPER[next]);
    }, STOP_MS);
    return () => clearTimeout(id);
  }, [locked, paperIdx, onPaper]);

  useEffect(() => {
    if (locked < TARGET.length) return;
    const t1 = setTimeout(() => setFading(true), 700);
    const t2 = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    }, 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [locked, onDone]);

  const paper = PAPER[paperIdx];
  const digitColor = paper === "#f4f2ed" ? "#0a0a0c" : "#f4f2ed";

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
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease",
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
          color: digitColor,
          transition: "color 1s ease",
          filter: "blur(0.6px)",
          mixBlendMode: "difference",
        }}
      >
        {TARGET.split("").map((target, i) => {
          const stopped = i < locked;
          const digit = stopped ? target : DIGITS[(i * 3 + spin) % 10];
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: "0.62em",
                textAlign: "center",
                opacity: stopped ? 1 : 0.75,
                transform: stopped
                  ? "translateY(0)"
                  : `translateY(${((spin * 20) % 40) - 20}%)`,
                filter: stopped ? "blur(0)" : "blur(1.4px)",
                transition: "opacity 0.25s ease, filter 0.25s ease",
              }}
            >
              {digit}
            </span>
          );
        })}
      </div>
    </div>
  );
}
