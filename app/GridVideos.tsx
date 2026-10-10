"use client";

import { useEffect, useRef, useState } from "react";

// 2 video lokal tampil BERSAMAAN di sel grid background (7 kolom, baris genap
// terpusat seperti shader). Tiap slot fade-out → pindah sel (tidak sama /
// tidak berdampingan) + ganti file → fade-in, berulang terus tanpa henti.
// Saturasi 20%, muted autoplay, tepi radial blur.
//
// Ganti FILES dengan 5 video sample (taruh di public/videos/).

const FILES = ["v1.mp4", "v2.mp4", "v3.mp4", "v4.mp4", "v5.mp4"];

const COLS = 7;
const SLOTS = 2;
const SHOW_MS = 4500;
const FADE_MS = 800;

const rand = (n: number) => Math.floor(Math.random() * n);
type Cell = { c: number; r: number };

function pickCell(rows: number, used: Cell[]): Cell {
  for (let t = 0; t < 80; t++) {
    const c = rand(COLS);
    const r = rand(rows);
    const clash = used.some(
      (u) =>
        (u.c === c && u.r === r) ||
        Math.abs(u.c - c) + Math.abs(u.r - r) === 1
    );
    if (!clash) return { c, r };
  }
  return { c: rand(COLS), r: rand(rows) };
}

type Slot = { pos: Cell; file: string; vis: number };

export default function GridVideos() {
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [geo, setGeo] = useState({ H: 0, cell: 0, rows: 0 });
  const [slots, setSlots] = useState<Slot[]>([]);
  const geoRef = useRef(geo);
  geoRef.current = geo;

  // 1) ukur grid
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const cell = W / COLS;
      const rows = Math.max(2, 2 * Math.round(H / cell / 2));
      setGeo({ H, cell, rows });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 2) jalankan slot: init + loop sendiri-sendiri (fase beda), selalu 2 tampil
  useEffect(() => {
    const rows = geoRef.current.rows;
    if (!rows || slots.length) return;
    const init: Cell[] = [];
    const arr: Slot[] = [];
    for (let i = 0; i < SLOTS; i++) {
      const p = pickCell(rows, init);
      init.push(p);
      arr.push({ pos: p, file: FILES[rand(FILES.length)], vis: 0 });
    }
    setSlots(arr);
  }, [geo.rows, slots.length]);

  // 3) tiap slot: siklus independen, mulai dengan delay berbeda
  useEffect(() => {
    if (slots.length !== SLOTS) return;
    const start = performance.now();
    let raf = 0;
    const offset = [0, Math.floor(SHOW_MS / 2)];

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = performance.now() - start;
      setSlots((prev) => {
        if (prev.length !== SLOTS) return prev;
        let changed = false;
        const next = prev.map((s, i) => {
          const phase = ((t + offset[i]) % SHOW_MS) / SHOW_MS;
          const vis = phase < 0.8 ? 1 : 0; // 20% terakhir fade-out
          // saat mulai siklus baru (fase lewat 0), pindah sel + ganti file
          const cycleIndex = Math.floor((t + offset[i]) / SHOW_MS);
          const seen = (s as Slot & { cyc?: number }).cyc ?? -1;
          if (cycleIndex !== seen) {
            const others = prev.filter((_, k) => k !== i).map((x) => x.pos);
            const np = pickCell(geoRef.current.rows, others);
            changed = true;
            return { pos: np, file: FILES[rand(FILES.length)], vis, cyc: cycleIndex } as Slot;
          }
          if (s.vis !== vis) {
            changed = true;
            return { ...s, vis };
          }
          return s;
        });
        return changed ? next : prev;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [slots.length]);

  // play video tiap kali vis jadi 1
  useEffect(() => {
    slots.forEach((s, i) => {
      if (s.vis > 0.5) refs.current[i]?.play().catch(() => {});
    });
  }, [slots]);

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
              top:
                geo.H / 2 -
                (geo.rows * geo.cell) / 2 +
                s.pos.r * geo.cell,
              width: geo.cell,
              height: geo.cell,
              opacity: s.vis,
              transition: `opacity ${FADE_MS}ms ease`,
              filter: "saturate(0.2)",
              pointerEvents: "none",
            }}
          >
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
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
                  "radial-gradient(120% 120% at 50% 50%, transparent 42%, rgba(0,0,0,.28) 72%, rgba(0,0,0,.7) 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow:
                  "inset 2px 2px 3px rgba(255,255,255,.18), inset -3px -3px 6px rgba(0,0,0,.5)",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
    </div>
  );
}
