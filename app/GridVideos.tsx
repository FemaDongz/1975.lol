"use client";

import { useEffect, useRef, useState } from "react";

// 5 slot video di sel grid shader (7 kolom — HARUS sama supaya pas).
// Tiap slot BERJALAN SENDIRI (fase beda): fade-out → pindah sel + ganti file
// (dari 10 video random) → fade-in, berulang. Jadi hampir selalu terlihat
// 5 video sekaligus, tapi tidak muncul/hilang bersamaan. Saturasi 0 +
// vignette per-sel, muted autoplay.

const FILES = [
  "s1.mp4", "s2.mp4", "s3.mp4", "s4.mp4", "s5.mp4",
  "s6.mp4", "s7.mp4", "s8.mp4", "s9.mp4", "s10.mp4",
];

const SLOTS = 5;
const SHOW_MS = 5000;
const FADE_MS = 800;

const rand = (n: number) => Math.floor(Math.random() * n);
type Cell = { c: number; r: number };
type Slot = { pos: Cell; file: string; vis: number; born: number };

export default function GridVideos({ cols = 7 }: { cols?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ H: 0, cell: 0, rows: 0 });
  const geoRef = useRef(geo);
  geoRef.current = geo;
  const [slots, setSlots] = useState<Slot[]>([]);

  // ukur grid (kolom = cols, samain shader)
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const cell = W / cols;
      const rows = Math.max(2, 2 * Math.round(H / cell / 2));
      setGeo({ H, cell, rows });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cols]);

  const pickCell = (used: Cell[]): Cell => {
    const rows = geoRef.current.rows || 2;
    for (let t = 0; t < 80; t++) {
      const c = rand(cols);
      const r = rand(rows);
      const clash = used.some(
        (u) =>
          (u.c === c && u.r === r) || Math.abs(u.c - c) + Math.abs(u.r - r) === 1
      );
      if (!clash) return { c, r };
    }
    return { c: rand(cols), r: rand(rows) };
  };

  // init 5 slot dengan fase tersebar (born berbeda jauh)
  useEffect(() => {
    if (!geo.rows || slots.length) return;
    const used: Cell[] = [];
    const now = performance.now();
    const arr: Slot[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const p = pickCell(used);
      used.push(p);
      arr.push({
        pos: p,
        file: FILES[rand(FILES.length)],
        vis: 1,
        born: now - Math.floor((SHOW_MS / SLOTS) * i),
      });
    }
    setSlots(arr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.rows, slots.length]);

  // tiap slot siklus sendiri (interval ringan)
  useEffect(() => {
    if (slots.length !== SLOTS) return;
    const id = setInterval(() => {
      const now = performance.now();
      setSlots((prev) => {
        let changed = false;
        const next = prev.map((s, i) => {
          const age = now - s.born;
          const vis = age < SHOW_MS - FADE_MS ? 1 : age < SHOW_MS ? 0 : 0;
          if (age >= SHOW_MS) {
            const others = prev.filter((_, k) => k !== i).map((x) => x.pos);
            const np = pickCell(others);
            changed = true;
            return { pos: np, file: FILES[rand(FILES.length)], vis: 0, born: now };
          }
          if (s.vis !== vis) {
            changed = true;
            return { ...s, vis };
          }
          return s;
        });
        return changed ? next : prev;
      });
    }, 200);
    return () => clearInterval(id);
  }, [slots.length]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
    >
      {geo.cell > 0 &&
        slots.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.pos.c * geo.cell,
              top: geo.H / 2 - (geo.rows * geo.cell) / 2 + s.pos.r * geo.cell,
              width: geo.cell,
              height: geo.cell,
              opacity: s.vis,
              transition: `opacity ${FADE_MS}ms ease`,
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
