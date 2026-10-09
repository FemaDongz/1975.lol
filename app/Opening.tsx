"use client";

import { useEffect, useRef, useState } from "react";

// Opening: satu angka besar muncul satu per satu (gacha loop) sampai "1975".
// Ditempatkan DI BELAKANG ripple, jadi garis ink menutupinya. Tiap angka
// berhenti tiap 1 detik; warna kertas container ganti (putih<->hitam) via
// onPaper(). Ukuran font disamakan dgn heading utama. Final = hitam.

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
  // index digit yang sedang ditampilkan (0..3). Satu digit saja sekaligus.
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(0); // angka acak yang bergulir
  const [locked, setLocked] = useState(0); // sudah berapa digit berhenti
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);

  const done = locked >= TARGET.length;

  // Gacha loop: angka acak berganti cepat sampai semua terkunci.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setFlip((f) => (f + 1) % 10), 80);
    return () => clearInterval(id);
  }, [done]);

  // Tiap 1 detik: kunci digit sekarang, maju ke digit berikutnya + ganti kertas.
  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => {
      const next = Math.min(locked + 1, TARGET.length);
      setLocked(next);
      setIndex(next); // tampilkan digit berikutnya (kalau belum habis)
      setPaperIdxSafe(next);
    }, STOP_MS);
    return () => clearTimeout(id);
  }, [locked, done]);

  const setPaperIdxSafe = (step: number) => {
    const p = Math.min(step, PAPER.length - 1);
    onPaper(PAPER[p]);
  };

  // Selesai -> fade -> onDone
  useEffect(() => {
    if (!done) return;
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
  }, [done, onDone]);

  // Digit yang ditampilkan: kalau digit ini masih "aktif" -> angka gacha.
  const active = locked < TARGET.length ? index : TARGET.length - 1;
  const isRolling = active >= locked;
  const shown = isRolling ? DIGITS[flip] : TARGET[active];

  return (
    <div
      aria-hidden={fading}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1, // di belakang ripple (ripple z=2), di atas warna frame
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <span
        style={{
          fontSize: "clamp(56px, 12vw, 180px)",
          lineHeight: 0.8,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          fontFamily: "var(--font-serif)",
          color: "#808080",
          filter: "blur(0.6px)",
        }}
      >
        {shown}
      </span>
    </div>
  );
}
