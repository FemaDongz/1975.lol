"use client";

import { useEffect, useRef, useState } from "react";

// 5 video lokal (repo + CDN jsDelivr) tampil BERSAMAAN di sel grid background
// (7 kolom, baris genap terpusat seperti shader): tiap slot fade-out →
// pindah sel random + ganti file → fade-in, terus-menerus. Saturasi 20%,
// muted autoplay. Bevel + shadow di sisi video biar terlihat 3D.
//
// Nanti ganti FILES dengan 5 video sample (taruh di public/videos/).

const FILES = ["v1.mp4", "v2.mp4", "v3.mp4", "v4.mp4", "v5.mp4"];
const CDN = "https://cdn.jsdelivr.net/gh/FemaDongz/1975.lol@main/public/videos";

const COLS = 7;
const COUNT = 5;
const SHOW_MS = 5000;
const FADE_MS = 900;

const rand = (n: number) => Math.floor(Math.random() * n);

function Slot({
  cell,
  rows,
  W,
  H,
}: {
  cell: number;
  rows: number;
  W: number;
  H: number;
}) {
  const vref = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState(() => ({ c: rand(COLS), r: rand(rows) }));
  const [file, setFile] = useState(() => FILES[rand(FILES.length)]);
  const [local, setLocal] = useState(false);
  const [vis, setVis] = useState(0);
  const [delay] = useState(() => Math.random() * 1500);

  useEffect(() => {
    const tIn = setTimeout(() => {
      setVis(1);
      vref.current?.play().catch(() => {});
    }, 120 + delay);
    const tOut = setTimeout(() => setVis(0), SHOW_MS - FADE_MS + delay);
    const tNext = setTimeout(() => {
      setPos({ c: rand(COLS), r: rand(rows) });
      setFile(FILES[rand(FILES.length)]);
    }, SHOW_MS + delay);
    return () => {
      clearTimeout(tIn);
      clearTimeout(tOut);
      clearTimeout(tNext);
    };
  }, [file, cell, rows, W, H, delay]);

  const src = local ? `/videos/${file}` : `${CDN}/${file}`;
  const tilt = pos.c % 2 === 0 ? "rotateY(-5deg)" : "rotateY(5deg)";

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
        pointerEvents: "none",
        filter: "saturate(0.2)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `perspective(500px) ${tilt} rotateX(3deg)`,
        }}
      >
        {/* bayangan ekstrusi di bawah */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "translate(7px, 9px)",
            background: "#000",
            filter: "blur(7px)",
            opacity: 0.55,
            borderRadius: 4,
          }}
        />
        <video
          ref={vref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onError={() => setLocal(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: 4,
          }}
        />
        {/* bevel kiri-kanan */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 4,
            background:
              "linear-gradient(90deg, rgba(0,0,0,.5), transparent 18%, transparent 82%, rgba(255,255,255,.28))",
            pointerEvents: "none",
          }}
        />
        {/* bevel atas-bawah */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 4,
            background:
              "linear-gradient(0deg, rgba(0,0,0,.45), transparent 22%, transparent 78%, rgba(255,255,255,.22))",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export default function GridVideos() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ W: 0, H: 0, cell: 0, rows: 0 });

  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      if (!W || !H) return;
      const cell = W / COLS;
      // baris GENAP supaya tepi sel jatuh tepat di garis shader
      const rows = Math.max(2, 2 * Math.round(H / cell / 2));
      setGeo({ W, H, cell, rows });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {geo.cell > 0 &&
        [0, 1, 2, 3, 4].map((i) => (
          <Slot
            key={i}
            cell={geo.cell}
            rows={geo.rows}
            W={geo.W}
            H={geo.H}
          />
        ))}
    </div>
  );
}
