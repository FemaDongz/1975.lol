"use client";

import { useEffect, useRef, useState } from "react";

// 5 video muncul BERSAMAAN (statis, pas di sel grid background). Tidak
// ganti-ganti sel/file — cukup fade-in sekali. Saturasi 0, vignette per-sel,
// muted autoplay. Ringan: tanpa interval, tanpa re-render berkala.
//
// Ganti/isi FILES dengan video di public/videos/.

const FILES = [
  "s1.mp4", "s2.mp4", "s3.mp4", "s4.mp4", "s5.mp4",
  "s6.mp4", "s7.mp4", "s8.mp4", "s9.mp4", "s10.mp4",
];

const COLS_DESKTOP = 7;
const COLS_MOBILE = 5;
const MOBILE_MAX = 640;
const SLOTS = 5;

const rand = (n: number) => Math.floor(Math.random() * n);
type Cell = { c: number; r: number };

export default function GridVideos() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ H: 0, cell: 0, rows: 0, cols: COLS_DESKTOP });
  const [visible, setVisible] = useState(false);
  const [cells, setCells] = useState<{ pos: Cell; file: string }[]>([]);

  // ukur grid
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const cols = W < MOBILE_MAX ? COLS_MOBILE : COLS_DESKTOP;
      const cell = W / cols;
      const rows = Math.max(2, 2 * Math.round(H / cell / 2));
      setGeo({ H, cell, rows, cols });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // pilih 5 sel sekali (tidak berdampingan) + file acak, lalu fade-in
  useEffect(() => {
    if (!geo.rows) return;
    const used: Cell[] = [];
    const arr: { pos: Cell; file: string }[] = [];
    for (let i = 0; i < SLOTS; i++) {
      let pos: Cell | null = null;
      for (let t = 0; t < 80; t++) {
        const c = rand(geo.cols);
        const r = rand(geo.rows);
        const clash = used.some(
          (u) =>
            (u.c === c && u.r === r) ||
            Math.abs(u.c - c) + Math.abs(u.r - r) === 1
        );
        if (!clash) {
          pos = { c, r };
          break;
        }
      }
      const p = pos ?? { c: rand(geo.cols), r: rand(geo.rows) };
      used.push(p);
      arr.push({ pos: p, file: FILES[(i * 2) % FILES.length] });
    }
    setCells(arr);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [geo.rows, geo.cols]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
    >
      {geo.cell > 0 &&
        cells.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.pos.c * geo.cell,
              top: geo.H / 2 - (geo.rows * geo.cell) / 2 + s.pos.r * geo.cell,
              width: geo.cell,
              height: geo.cell,
              opacity: visible ? 1 : 0,
              transition: "opacity 900ms ease",
              filter: "saturate(0)",
              pointerEvents: "none",
            }}
          >
            <video
              src={`/videos/${s.file}`}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(130% 130% at 50% 50%, transparent 45%, rgba(0,0,0,.35) 78%, rgba(0,0,0,.85) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
    </div>
  );
}
