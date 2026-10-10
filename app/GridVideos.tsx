"use client";

import { useEffect, useRef, useState } from "react";

// 2 video lokal tampil BERSAMAAN di sel grid background (7 kolom, baris genap
// terpusat seperti shader). Tiap slot fade-out → pindah sel random (dijamin
// tidak sama / tidak berdampingan dengan slot lain) + ganti file → fade-in,
// berulang terus. Saturasi 20%, muted autoplay, tepi radial blur lembut.
//
// Ganti FILES dengan 5 video sample (taruh di public/videos/).

const FILES = ["v1.mp4", "v2.mp4", "v3.mp4", "v4.mp4", "v5.mp4"];
const CDN = "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/videos";

const COLS = 7;
const SLOTS = 2;
const SHOW_MS = 5000;
const FADE_MS = 900;

const rand = (n: number) => Math.floor(Math.random() * n);
type Cell = { c: number; r: number };

// pilih sel: tidak sama & tidak bersebelahan (ortogonal) dengan `used`
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

function VideoSlot({
  pos,
  file,
  vis,
  cell,
  rows,
  H,
  setVid,
}: {
  pos: Cell;
  file: string;
  vis: number;
  cell: number;
  rows: number;
  H: number;
  setVid: (el: HTMLVideoElement | null) => void;
}) {
  const src = `/videos/${file}`;
  return (
    <div
      style={{
        position: "absolute",
        left: pos.c * cell,
        top: H / 2 - (rows * cell) / 2 + pos.r * cell,
        width: cell,
        height: cell,
        opacity: vis,
        transition: `opacity ${FADE_MS}ms ease`,
        filter: "saturate(0.2)",
        pointerEvents: "none",
      }}
    >
      <video
        ref={setVid}
        src={src}
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
      {/* radial blur: tepi lembut merata (tidak miring) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 42%, rgba(0,0,0,.28) 72%, rgba(0,0,0,.7) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* bevel tipis biar terasa menonjol dari grid */}
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
  );
}

export default function GridVideos() {
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLVideoElement | null)[]>([null, null]);
  const [geo, setGeo] = useState({ H: 0, cell: 0, rows: 0 });
  const [slots, setSlots] = useState<{ pos: Cell; file: string; vis: number }[]>(
    []
  );
  const cellsRef = useRef<Cell[]>([]);

  // ukur grid
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

  // inisialisasi 2 slot begitu ukuran grid diketahui
  useEffect(() => {
    if (!geo.cell || slots.length) return;
    const init: Cell[] = [];
    const arr = Array.from({ length: SLOTS }).map(() => {
      const cellPos = pickCell(geo.rows, init);
      init.push(cellPos);
      return { pos: cellPos, file: FILES[rand(FILES.length)], vis: 0 };
    });
    cellsRef.current = init;
    setSlots(arr);
  }, [geo.cell, geo.rows, slots.length]);

  // siklus: fade-out → pindah + ganti → fade-in, tiap slot, terus-menerus
  useEffect(() => {
    if (!slots.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = () =>
      slots.forEach((_, i) => {
        const out = setTimeout(() => {
          setSlots((prev) => {
            const next = [...prev];
            const others = next.filter((_, k) => k !== i).map((s) => s.pos);
            const np = pickCell(geo.rows, others);
            cellsRef.current[i] = np;
            next[i] = {
              pos: np,
              file: FILES[rand(FILES.length)],
              vis: 0,
            };
            return next;
          });
        }, SHOW_MS * i);
        const back = setTimeout(() => {
          setSlots((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], vis: 1 };
            return next;
          });
          refs.current[i]?.play().catch(() => {});
        }, SHOW_MS * i + FADE_MS);
        timers.push(out, back);
      });
    const in0 = setTimeout(() => {
      setSlots((prev) => prev.map((s) => ({ ...s, vis: 1 })));
      refs.current.forEach((v) => v?.play().catch(() => {}));
    }, 60);
    timers.push(in0);
    const loop = setInterval(tick, SHOW_MS + FADE_MS);
    tick();
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [slots.length, geo.rows]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
    >
      {geo.cell > 0 &&
        slots.map((s, i) => (
          <VideoSlot
            key={i}
            pos={s.pos}
            file={s.file}
            vis={s.vis}
            cell={geo.cell}
            rows={geo.rows}
            H={geo.H}
            setVid={(el) => {
              refs.current[i] = el;
            }}
          />
        ))}
    </div>
  );
}
