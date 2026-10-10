"use client";

// ContributionSkyline — direkonstruksi dari bundle publik 21st.dev.
// Komponen kanvas: "skyline" 3D (atau heat-map 2D) dari data kontribusi
// harian. Versi ini mandiri (tanpa Tailwind): styling via inline style +
// satu <style> scoped untuk kelas sr-only. Logika matematika/proyeksi
// disalin apa adanya dari bundle asli.

import * as React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/* Tipe longgar (dari bundle minified)                                 */
/* ------------------------------------------------------------------ */

export type Cell = {
  date: string;
  count: number;
  level: number;
  week: number;
  day: number;
};

export type ContributionInput = { date: any; count: any };

export type StatsRange = { days: number; start: string | null; end: string | null };

export type Stats = {
  total: number;
  first: string | null;
  last: string | null;
  busiest: { count: number; date: string | null };
  longest: StatsRange;
  current: StatsRange;
};

export type Model = {
  cells: Cell[];
  weeks: number;
  max: number;
  stats: Stats;
  months: { week: number; label: string }[];
};

export interface ContributionSkylineProps {
  data?: ContributionInput[];
  endDate?: any;
  view?: "2d" | "3d";
  defaultView?: "2d" | "3d";
  onViewChange?: (v: "2d" | "3d") => void;
  palette?: any;
  title?: React.ReactNode;
  unit?: string;
  unitPlural?: string;
  heightScale?: number;
  duration?: number;
  weekStart?: number;
  orbit?: boolean;
  showStats?: boolean;
  showLegend?: boolean;
  showToggle?: boolean;
  footer?: React.ReactNode;
  locale?: string;
  seed?: number;
  onCellClick?: (c: { date: string; count: number }) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Helper — konstanta                                                  */
/* ------------------------------------------------------------------ */

const on = 864e5; // satu hari dalam ms

/* ------------------------------------------------------------------ */
/* Helper — easing / matematika                                        */
/* ------------------------------------------------------------------ */

function clamp01(h: number): number {
  return h > 0 ? (h < 1 ? h : 1) : 0;
}

function lerp(h: number, S: number, M: number): number {
  return h + (S - h) * M;
}

function easeInOutCubic(h: number): number {
  const S = clamp01(h);
  return S < 0.5 ? 4 * S * S * S : 1 - Math.pow(-2 * S + 2, 3) / 2;
}

function easeOutCubic(h: number): number {
  return 1 - Math.pow(1 - clamp01(h), 3);
}

function smoothstep(h: number, S: number, M: number): number {
  const d = clamp01((M - h) / (S - h));
  return d * d * (3 - 2 * d);
}

/* ------------------------------------------------------------------ */
/* Helper — tanggal                                                    */
/* ------------------------------------------------------------------ */

function toKey(h: number | string | Date): string {
  return new Date(h as any).toISOString().slice(0, 10);
}

function dayMs(h: number | string | Date): number {
  if (typeof h == "number") return Math.floor(h / on) * on;
  if (typeof h == "string") {
    const S = /^(\d{4})-(\d{2})-(\d{2})/.exec(h);
    if (S) return Date.UTC(+S[1], +S[2] - 1, +S[3]);
    h = new Date(h);
  }
  return Date.UTC((h as Date).getFullYear(), (h as Date).getMonth(), (h as Date).getDate());
}

/* ------------------------------------------------------------------ */
/* Helper — RNG (mulberry-ish)                                         */
/* ------------------------------------------------------------------ */

function rng(h: number): () => number {
  let S = h >>> 0;
  return () => {
    S = (S + 1831565813) >>> 0;
    let M = S;
    M = Math.imul(M ^ (M >>> 15), M | 1);
    M ^= M + Math.imul(M ^ (M >>> 7), M | 61);
    return ((M ^ (M >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Helper — generator data contoh                                      */
/* ------------------------------------------------------------------ */

function generateContributions(h: number, S = 7, M = 371): { date: string; count: number }[] {
  const d = rng(S),
    _ = Array.from({ length: 4 }, () => ({
      at: d(),
      width: 0.035 + d() * 0.07,
      gain: 0.6 + d() * 1.1,
    })),
    R: { date: string; count: number }[] = [];
  let j = 0.5;
  for (let F = 0; F < M; F++) {
    const D = h - (M - 1 - F) * on,
      T = F / Math.max(1, M - 1),
      q = new Date(D).getUTCDay(),
      I = q === 0 || q === 6;
    let st = 0.2;
    for (const rl of _) st += rl.gain * Math.exp(-((T - rl.at) ** 2) / (2 * rl.width ** 2));
    (j = j * 0.85 + d() * 0.15), (st *= 0.55 + j * 0.9);
    const Qt = Math.min(0.94, (I ? 0.22 : 0.5) + st * 0.4);
    let Kt = 0;
    d() < Qt && (Kt = 1 + Math.floor(-Math.log(1 - d()) * (1.2 + st * 7) * (I ? 0.5 : 1)));
    d() < 0.01 && (Kt += 18 + Math.floor(d() * 24));
    R.push({ date: toKey(D), count: Kt });
  }
  return R;
}

/* ------------------------------------------------------------------ */
/* Helper — grid & level                                               */
/* ------------------------------------------------------------------ */

function buildGrid(
  h: ContributionInput[],
  S: number,
  M = 0
): { cells: Cell[]; weeks: number; max: number } {
  const d = new Map<string, number>();
  for (const D of h) {
    if (!D || typeof D.date != "string") continue;
    const T = dayMs(D.date),
      q = Number(D.count);
    if (!Number.isFinite(T) || !(q > 0) || !Number.isFinite(q)) continue;
    const I = toKey(T);
    d.set(I, (d.get(I) ?? 0) + q);
  }
  let _ = S - 364 * on;
  _ -= (((new Date(_).getUTCDay() - M + 7) % 7) * on);
  const R: Cell[] = [];
  for (let D = _, T = 0; D <= S; D += on, T++) {
    const q = toKey(D);
    R.push({ date: q, count: d.get(q) ?? 0, level: 0, week: Math.floor(T / 7), day: T % 7 });
  }
  const j = R.map((D) => D.count)
      .filter((D) => D > 0)
      .sort((D, T) => D - T),
    F = j.length ? j[Math.floor(0.95 * (j.length - 1))] : 0;
  for (const D of R) D.level = levelOf(D.count, F);
  return { cells: R, weeks: R.length ? R[R.length - 1].week + 1 : 0, max: j.length ? j[j.length - 1] : 0 };
}

function levelOf(h: number, S: number): number {
  return h <= 0 ? 0 : S <= 0 ? 4 : 1 + Math.min(3, Math.floor((h / S) * 4));
}

/* ------------------------------------------------------------------ */
/* Helper — statistik                                                  */
/* ------------------------------------------------------------------ */

function computeStats(h: Cell[]): Stats {
  let S = 0,
    M = 0,
    d: string | null = null,
    _ = 0,
    R: string | null = null,
    j: StatsRange = { days: 0, start: null, end: null };
  for (const I of h)
    (S += I.count),
      I.count > M && ((M = I.count), (d = I.date)),
      I.count > 0
        ? (_ === 0 && (R = I.date), _++, _ > j.days && (j = { days: _, start: R, end: I.date }))
        : (_ = 0);
  let F = h.length - 1;
  F >= 0 && h[F].count === 0 && F--;
  const D = F;
  for (; F >= 0 && h[F].count > 0; ) F--;
  const T = D - F,
    q = T > 0 ? { days: T, start: h[F + 1].date, end: h[D].date } : { days: 0, start: null, end: null };
  return {
    total: S,
    first: h.length ? h[0].date : null,
    last: h.length ? h[h.length - 1].date : null,
    busiest: { count: M, date: d },
    longest: j,
    current: q,
  };
}

/* ------------------------------------------------------------------ */
/* Helper — label bulan                                                */
/* ------------------------------------------------------------------ */

function monthLabels(h: Cell[], S: number, M = "en-US"): { week: number; label: string }[] {
  const d = new Intl.DateTimeFormat(M, { month: "short", timeZone: "UTC" }),
    _: { week: number; label: string }[] = [];
  let R = -1;
  for (let j = 0; j < S; j++) {
    const F = h[j * 7];
    if (!F) break;
    const D = +F.date.slice(5, 7);
    D !== R && _.push({ week: j, label: d.format(dayMs(F.date)) }), (R = D);
  }
  return _.length > 1 && _[1].week - _[0].week < 3 && _.shift(), _;
}

/* ------------------------------------------------------------------ */
/* Helper — tinggi bar & rise                                          */
/* ------------------------------------------------------------------ */

function barHeight(h: number, S: number, M = 1): number {
  return h > 0 && S > 0 ? 0.4 + Math.pow(h / S, 0.85) * 7.2 * M : 0.2;
}

const Bh = 0.42;

function riseAt(h: number, S: number, M: number, d: number): number {
  const _ = (M > 1 ? S / (M - 1) : 0) * 0.36 + (d / 6) * 0.06;
  return easeOutCubic((h - _) / (1 - Bh));
}

/* ------------------------------------------------------------------ */
/* Helper — kamera & proyeksi 3D                                       */
/* ------------------------------------------------------------------ */

const Ds = Math.PI / 4,
  Os = (34 * Math.PI) / 180,
  Rs: [number, number] = [(8 * Math.PI) / 180, (82 * Math.PI) / 180],
  Ai: [number, number] = [(18 * Math.PI) / 180, (62 * Math.PI) / 180];

function camera(h: number, S = 0, M = 0): { cs: number; sn: number; se: number; ce: number } {
  const d = Math.min(Rs[1], Math.max(0, lerp(0, Ds + S, h))),
    _ = lerp(Math.PI / 2, Math.min(Ai[1], Math.max(Ai[0], Os + M)), h);
  return { cs: Math.cos(d), sn: Math.sin(d), se: Math.sin(_), ce: Math.cos(_) };
}

function project(
  h: { cs: number; sn: number; se: number; ce: number },
  S: number,
  M: number,
  d: number
): [number, number] {
  return [S * h.cs - M * h.sn, (S * h.sn + M * h.cs) * h.se - d * h.ce];
}

function mixRGB(h: number[], S: number[], M: number): number[] {
  return [h[0] + (S[0] - h[0]) * M, h[1] + (S[1] - h[1]) * M, h[2] + (S[2] - h[2]) * M];
}

function luminance(h: number[]): number {
  return (0.2126 * h[0] + 0.7152 * h[1] + 0.0722 * h[2]) / 255;
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const PALETTES: Record<string, { light: string[]; dark: string[] }> = {
  github: {
    light: ["#c6e48b", "#7bc96f", "#239a3b", "#196127"],
    dark: ["#0e4429", "#006d32", "#26a641", "#39d353"],
  },
  halloween: {
    light: ["#ffee4a", "#ffc501", "#fe9600", "#b33c00"],
    dark: ["#631c03", "#bd561d", "#fa7a18", "#fddf68"],
  },
  ocean: {
    light: ["#b8e3f5", "#6ec3eb", "#2a8fd1", "#0b4f8a"],
    dark: ["#0c2d4a", "#12508a", "#2a88d8", "#7cc7ff"],
  },
  ember: {
    light: ["#fde2c4", "#fbad6e", "#f06b3a", "#b3261e"],
    dark: ["#4a1a10", "#8f2f16", "#e0572a", "#ffa46b"],
  },
  grape: {
    light: ["#e4d4fb", "#b794f4", "#805ad5", "#44337a"],
    dark: ["#2d1f4f", "#553c9a", "#8b5cf6", "#c4b5fd"],
  },
  mono: {
    light: ["#d4d4d4", "#a3a3a3", "#525252", "#171717"],
    dark: ["#333333", "#5c5c5c", "#a3a3a3", "#fafafa"],
  },
};

function resolvePalette(h: any, S: boolean): string[] {
  const M = Array.isArray(h)
      ? h
      : typeof h == "object" && h
        ? S
          ? h.dark
          : h.light
        : PALETTES[h ?? "github"]
          ? PALETTES[h][S ? "dark" : "light"]
          : PALETTES.github[S ? "dark" : "light"],
    d = PALETTES.github[S ? "dark" : "light"];
  return [0, 1, 2, 3].map((_) => M[_] ?? M[M.length - 1] ?? d[_]);
}

const oc = [23, 23, 23],
  hd = [255, 255, 255];

let Za: CanvasRenderingContext2D | null = null;

function toRGB(h: string, S: number[] | null): number[] | null {
  if (!Za) {
    const d = document.createElement("canvas");
    (d.width = d.height = 1), (Za = d.getContext("2d", { willReadFrequently: true }));
  }
  if (!Za) return S;
  Za.clearRect(0, 0, 1, 1), (Za.fillStyle = "rgba(0,0,0,0)"), (Za.fillStyle = h), Za.fillRect(0, 0, 1, 1);
  const M = Za.getImageData(0, 0, 1, 1).data;
  return M[3] < 8 ? S : [M[0], M[1], M[2]];
}

function rgbString(h: number, S: number, M: number): string {
  return "rgb(" + Math.round(h) + "," + Math.round(S) + "," + Math.round(M) + ")";
}

/* ------------------------------------------------------------------ */
/* Helper — geometri quad                                              */
/* ------------------------------------------------------------------ */

function pointInQuad(h: Float32Array, S: number, M: number, d: number): boolean {
  let _ = 0;
  for (let R = 0; R < 4; R++) {
    const j = h[S + R * 2],
      F = h[S + R * 2 + 1],
      D = h[S + ((R + 1) % 4) * 2],
      T = h[S + ((R + 1) % 4) * 2 + 1],
      q = (D - j) * (d - F) - (T - F) * (M - j);
    if (Math.abs(q) < 1e-9) continue;
    const I = q > 0 ? 1 : -1;
    if (_ === 0) _ = I;
    else if (I !== _) return false;
  }
  return _ !== 0;
}

function quadPath(h: CanvasRenderingContext2D, S: Float32Array, M: number, d: number): void {
  if (d < 0.3) {
    h.moveTo(S[M], S[M + 1]),
      h.lineTo(S[M + 2], S[M + 3]),
      h.lineTo(S[M + 4], S[M + 5]),
      h.lineTo(S[M + 6], S[M + 7]),
      h.closePath();
    return;
  }
  h.moveTo((S[M + 6] + S[M]) / 2, (S[M + 7] + S[M + 1]) / 2);
  for (let _ = 0; _ < 4; _++) {
    const R = (_ + 1) % 4;
    h.arcTo(S[M + _ * 2], S[M + _ * 2 + 1], S[M + R * 2], S[M + R * 2 + 1], d);
  }
  h.closePath();
}

/* ------------------------------------------------------------------ */
/* Ikon                                                                */
/* ------------------------------------------------------------------ */

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ maxWidth: "none" }}>
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ maxWidth: "none" }}>
      <path
        d="M8 1.2 14.2 4.6v6.8L8 14.8 1.8 11.4V4.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M1.8 4.6 8 8l6.2-3.4M8 8v6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Stat                                                                */
/* ------------------------------------------------------------------ */

const mu = "var(--color-muted-foreground, #737373)";

type StatProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  unit: React.ReactNode;
  sub: React.ReactNode;
  accent: string;
  size: number;
  align?: "stack" | "start" | "end";
};

function Stat({ label: h, value: S, unit: M, sub: d, accent: _, size: R, align: j }: StatProps) {
  if (j === "stack")
    return (
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: "tight", color: mu } as any}>{h}</div>
        <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            style={{
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              transition: "color 500ms",
              color: _,
              fontSize: R,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {S}
          </span>
          <span style={{ fontSize: 14 }}>{M}</span>
        </div>
        <div style={{ marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, color: mu }}>
          {d}
        </div>
      </div>
    );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        alignItems: "end",
        columnGap: 8,
        justifyContent: j,
      }}
    >
      {j === "end" ? (
        <>
          <div style={{ textAlign: "right", fontSize: 13, lineHeight: "tight", color: mu } as any}>{h}</div>
          <div />
        </>
      ) : (
        <div style={{ gridColumn: "span 2", fontSize: 13, lineHeight: "tight", color: mu } as any}>{h}</div>
      )}
      <div
        style={{
          textAlign: "right",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          transition: "color 500ms",
          color: _,
          fontSize: R,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
        }}
      >
        {S}
      </div>
      <div style={{ paddingBottom: "0.15em", lineHeight: "tight" } as any}>
        <div style={{ fontSize: 15 }}>{M}</div>
        <div style={{ whiteSpace: "nowrap", fontSize: 13, color: mu }}>{d}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Komponen utama                                                      */
/* ------------------------------------------------------------------ */

export function ContributionSkyline({
  data: h,
  endDate: S,
  view: M,
  defaultView: d = "3d",
  onViewChange: _,
  palette: R = "github",
  title: j,
  unit: F = "contribution",
  unitPlural: D,
  heightScale: T = 1,
  duration: q = 1300,
  weekStart: I = 0,
  orbit: st = true,
  showStats: Qt = true,
  showLegend: Kt = true,
  showToggle: rl = true,
  footer: dl,
  locale: $t = "en-US",
  seed: Il = 7,
  onCellClick: ll,
  className: Xl = "",
}: ContributionSkylineProps) {
  const rt = S == null ? null : dayMs(S),
    Ht = React.useMemo(() => {
      const w = (h ?? []).map((L) => dayMs(L.date)).filter(Number.isFinite),
        ot = rt ?? (w.length ? Math.max(...w) : dayMs(new Date())),
        K = (h ?? generateContributions(ot, Il)) as ContributionInput[],
        Ft = buildGrid(K, ot, I);
      return {
        ...Ft,
        stats: computeStats(Ft.cells),
        months: monthLabels(Ft.cells, Ft.weeks, $t),
      };
    }, [h, rt, Il, I, $t]);

  const [pl, xl] = React.useState<"2d" | "3d">(d as any),
    hl = M ?? pl,
    ya = (w: "2d" | "3d") => {
      M === undefined && xl(w), _ == null || _(w);
    },
    [Tl, el] = React.useState<{ dark: boolean; swatches: string[]; accent: string }>(() => {
      const w = resolvePalette(R, false);
      return { dark: false, swatches: ["#ebedf0", ...w], accent: w[3] };
    }),
    [De, Oe] = React.useState(0),
    [_t, E] = React.useState(-1),
    [N, Q] = React.useState(-1),
    [St, o] = React.useState(""),
    x = React.useRef<any>(null),
    Y = React.useRef<any>(null),
    H = React.useRef<any>(null),
    Z = React.useRef<any>(null),
    lt = React.useRef<any>(null),
    W = D ?? F + "s",
    Zt = React.useMemo(() => new Intl.NumberFormat($t), [$t]),
    Dt = React.useMemo(
      () => new Intl.DateTimeFormat($t, { month: "short", day: "numeric", timeZone: "UTC" }),
      [$t]
    ),
    he = React.useMemo(
      () =>
        new Intl.DateTimeFormat($t, {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
      [$t]
    ),
    rn = React.useMemo(
      () =>
        new Intl.DateTimeFormat($t, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
      [$t]
    ),
    ye = (w: number) => (w === 1 ? F : W),
    vu = (w: number) => {
      const ot = Ht.cells[w];
      return ot
        ? (ot.count ? Zt.format(ot.count) + " " + ye(ot.count) : "No " + W) +
            " on " +
            rn.format(dayMs(ot.date))
        : "";
    },
    qt = React.useRef<any>({
      model: Ht,
      duration: q,
      heightScale: T,
      orbit: st,
      palette: R,
      legendLevel: N,
      onCellClick: ll,
      target: hl === "3d" ? 1 : 0,
      setActive: E,
      setWidth: Oe,
      setTheme: el,
      setAnnounce: o,
      describe: vu,
    });

  qt.current = {
    model: Ht,
    duration: q,
    heightScale: T,
    orbit: st,
    palette: R,
    legendLevel: N,
    onCellClick: ll,
    target: hl === "3d" ? 1 : 0,
    setActive: E,
    setWidth: Oe,
    setTheme: el,
    setAnnounce: o,
    describe: vu,
  };

  React.useEffect(() => {
    const w = x.current,
      ot = Y.current,
      K = H.current,
      Ft = Z.current;
    if (!w || !ot || !K || !Ft) return;
    const L = K.getContext("2d");
    if (!L) return;
    const Tu = window.matchMedia("(prefers-reduced-motion: reduce)"),
      yc = window.matchMedia("(prefers-color-scheme: dark)");
    let Re = Tu.matches,
      Zl = 0,
      _l = 0,
      me = false,
      Ue = 0,
      ve = 0,
      Ke = 0,
      Ne = 0,
      il = 0,
      La = 0,
      Je = 0,
      Eu = 0,
      Au = -1,
      va = 1,
      ga = 30,
      Mu = 30,
      zu = "10px sans-serif";
    const Pl = new Float32Array(15),
      Ll = new Float32Array(15);
    let al = false,
      Mt = oc,
      ge = hd,
      ke = false,
      bt = 0,
      hn = 0,
      Dl = new Float32Array(0),
      ml = new Float32Array(0),
      ba = new Uint8Array(0),
      be = new Float32Array(0),
      te = new Float32Array(0),
      le = new Float32Array(0),
      Se = new Float32Array(0),
      G = new Float32Array(0),
      Va = new Uint8Array(0),
      wa: number[] = [],
      Te: { week: number; label: string }[] = [],
      Ee: { day: number; label: string }[] = [],
      Vl = -1,
      Yl = -1,
      ee = -1,
      mc = 0,
      Ae = 0,
      Sa = 0;

    const ae = () => {
      const O = qt.current.model;
      (bt = O.cells.length), (hn = O.weeks);
      Dl.length !== bt &&
        ((Dl = new Float32Array(bt)),
        (ml = new Float32Array(bt)),
        (ba = new Uint8Array(bt)),
        (be = new Float32Array(bt)),
        (te = new Float32Array(bt)),
        (le = new Float32Array(bt)),
        (Se = new Float32Array(bt)),
        (G = new Float32Array(bt * 24)),
        (Va = new Uint8Array(bt)),
        (wa = Array.from({ length: bt }, (C, J) => J)));
      for (let C = 0; C < bt; C++) {
        const J = O.cells[C];
        (Dl[C] = J.week),
          (ml[C] = J.day),
          (ba[C] = J.level),
          (be[C] = barHeight(J.count, O.max, qt.current.heightScale));
      }
      Te = O.months;
      const P = new Intl.DateTimeFormat($t, { weekday: "short", timeZone: "UTC" });
      Ee = [];
      for (let C = 0; C < 7 && C < bt; C++) {
        const J = new Date(dayMs(O.cells[C].date)).getUTCDay();
        (J === 1 || J === 3 || J === 5) && Ee.push({ day: C, label: P.format(dayMs(O.cells[C].date)) });
      }
      Vl >= bt && (Vl = -1), Yl >= bt && (Yl = -1);
    };

    const He = () => {
      const O = getComputedStyle(w);
      (Mt = (toRGB(O.color, oc) ?? oc) as number[]),
        (ge =
          (toRGB(O.backgroundColor, null) ?? (luminance(Mt) > 0.5 ? [10, 10, 10] : hd)) as number[]),
        (ke = luminance(ge) < 0.45),
        (zu = "400 10px " + (O.fontFamily || "sans-serif"));
      const C = resolvePalette(qt.current.palette, ke),
        yt = [mixRGB(ge, Mt, ke ? 0.11 : 0.075), ...C.map((mt) => toRGB(mt, oc) ?? oc)];
      for (let mt = 0; mt < 5; mt++) for (let jt = 0; jt < 3; jt++) Ll[mt * 3 + jt] = yt[mt][jt];
      (!al || Re) && (Pl.set(Ll), (al = true)), (L.font = zu);
      Mu = Math.ceil(Math.max(20, ...Ee.map((mt) => L.measureText(mt.label).width))) + 8;
      const Yt = yt.map((mt) => rgbString(mt[0], mt[1], mt[2]));
      qt.current.setTheme((mt: any) =>
        mt.dark === ke && mt.swatches.join() === Yt.join() ? mt : { dark: ke, swatches: Yt, accent: Yt[4] }
      ),
        We();
    };

    const pu = (O: any, P: number, C: boolean) => {
      const J = lerp(0.78, 0.9, P),
        yt = (1 - J) / 2;
      let Yt = Infinity,
        mt = -Infinity,
        jt = Infinity,
        ht = -Infinity;
      const Lt = (It: number, Ot: number, Jt: number) => {
        const Bt = project(O, It, Ot, Jt);
        Bt[0] < Yt && (Yt = Bt[0]),
          Bt[0] > mt && (mt = Bt[0]),
          Bt[1] < jt && (jt = Bt[1]),
          Bt[1] > ht && (ht = Bt[1]);
      };
      for (let It = 0; It < bt; It++) {
        const Ot = Dl[It] + yt,
          Jt = ml[It] + yt,
          Bt = C ? be[It] * P : te[It];
        Lt(Ot, Jt, Bt),
          Lt(Ot + J, Jt, Bt),
          Lt(Ot, Jt + J, Bt),
          Lt(Ot + J, Jt + J, 0),
          Lt(Ot, Jt + J, 0),
          Lt(Ot + J, Jt, 0);
      }
      return Lt(0, 7 + 1.5 * P, 0), Lt(hn, 7 + 1.5 * P, 0), { minx: Yt, maxx: mt, miny: jt, maxy: ht };
    };

    const qe = () => {
      const O = Math.round(ot.clientWidth);
      if (!O || !bt) return;
      (il = O), (ga = il < 520 ? 0 : Mu), (va = Math.min(2, window.devicePixelRatio || 1));
      const P = pu(camera(0), 0, true);
      La = 24 + ((P.maxy - P.miny) / (P.maxx - P.minx)) * (il - ga - 4);
      const C = pu(camera(1), 1, true),
        J = ((C.maxy - C.miny) / (C.maxx - C.minx)) * (il - 40) + 40;
      (Je = Math.max(Math.min(J, il * 0.72, 620), Math.min(J, 240))),
        (Eu = Math.ceil(Math.max(La, Je))),
        (K.width = Math.round(il * va)),
        (K.height = Math.round(Eu * va)),
        (K.style.width = il + "px"),
        (K.style.height = Eu + "px"),
        (Au = -1),
        qt.current.setWidth(il),
        Ka();
    };

    const Ka = () => {
      if (!il || !bt) return;
      const O = easeInOutCubic(Zl),
        P = camera(O, Ue, ve),
        C = lerp(La, Je, O);
      Math.abs(C - Au) > 0.2 && ((ot.style.height = C.toFixed(1) + "px"), (Au = C));
      for (let et = 0; et < bt; et++)
        te[et] = riseAt(Zl, Dl[et], hn, ml[et]) * be[et];
      const J = pu(P, O, false),
        yt = lerp(2, 20, O),
        Yt = yt + ga * (1 - O),
        mt = yt + 20 * (1 - O),
        jt = il - Yt - yt,
        ht = C - mt - yt,
        Lt = Math.max(1e-6, J.maxx - J.minx),
        It = Math.max(1e-6, J.maxy - J.miny),
        Ot = Math.min(jt / Lt, ht / It),
        Jt = Yt + (jt - Lt * Ot) / 2 - J.minx * Ot,
        Bt = mt + (ht - It * Ot) / 2 - J.miny * Ot,
        { cs: Ie, sn: ze, se: je, ce: Ou } = P,
        El = (et: number, nt: number) => Jt + (et * Ie - nt * ze) * Ot,
        Al = (et: number, nt: number, Gt: number) => Bt + ((et * ze + nt * Ie) * je - Gt * Ou) * Ot;

      L.setTransform(va, 0, 0, va, 0, 0), L.clearRect(0, 0, il, Eu);
      wa.sort(
        (et, nt) =>
          (Dl[et] + 0.5) * ze +
          (ml[et] + 0.5) * Ie -
          ((Dl[nt] + 0.5) * ze + (ml[nt] + 0.5) * Ie)
      );
      const ue = lerp(0.78, 0.9, O),
        Ul = (1 - ue) / 2,
        bc = lerp(0.17, 0.03, O) * Ot,
        vl = (1 - O) * 0.07,
        Be = 0.7 * O,
        Ru = Pl[0],
        Wa = Pl[1],
        Mi = Pl[2];
      for (let et = 0; et < bt; et++) {
        const nt = wa[et],
          Gt = Dl[nt] + Ul,
          jl = ml[nt] + Ul,
          Nl = Gt + ue,
          Hl = jl + ue,
          $a = te[nt] + le[nt] * Be,
          at = nt * 24;
        (G[at] = El(Gt, jl)),
          (G[at + 1] = Al(Gt, jl, $a)),
          (G[at + 2] = El(Nl, jl)),
          (G[at + 3] = Al(Nl, jl, $a)),
          (G[at + 4] = El(Nl, Hl)),
          (G[at + 5] = Al(Nl, Hl, $a)),
          (G[at + 6] = El(Gt, Hl)),
          (G[at + 7] = Al(Gt, Hl, $a)),
          (G[at + 8] = El(Gt, Hl)),
          (G[at + 9] = Al(Gt, Hl, 0)),
          (G[at + 10] = El(Nl, Hl)),
          (G[at + 11] = Al(Nl, Hl, 0)),
          (G[at + 12] = G[at + 4]),
          (G[at + 13] = G[at + 5]),
          (G[at + 14] = G[at + 6]),
          (G[at + 15] = G[at + 7]),
          (G[at + 16] = El(Nl, jl)),
          (G[at + 17] = Al(Nl, jl, 0)),
          (G[at + 18] = G[at + 10]),
          (G[at + 19] = G[at + 11]),
          (G[at + 20] = G[at + 4]),
          (G[at + 21] = G[at + 5]),
          (G[at + 22] = G[at + 2]),
          (G[at + 23] = G[at + 3]);
        const Sc = $a * Ou * Ot;
        let Fa = 0;
        Sc > 0.35 && ue * Ie * Ot > 0.35 && (Fa |= 1),
          Sc > 0.35 && ue * ze * Ot > 0.35 && (Fa |= 2),
          (Va[nt] = Fa);
        const Sn = ba[nt] * 3;
        let Ce = Pl[Sn],
          Pe = Pl[Sn + 1],
          ta = Pl[Sn + 2];
        const Nu = Se[nt];
        Nu > 0.002 &&
          ((Ce += (Ru - Ce) * 0.72 * Nu), (Pe += (Wa - Pe) * 0.72 * Nu), (ta += (Mi - ta) * 0.72 * Nu));
        const Hu = le[nt];
        if (Hu > 0.002) {
          const Ia = 0.16 * Hu;
          (Ce += (Mt[0] - Ce) * Ia), (Pe += (Mt[1] - Pe) * Ia), (ta += (Mt[2] - ta) * Ia);
        }
        Fa & 1 &&
          (L.beginPath(),
          quadPath(L, G, at + 8, 0),
          (L.fillStyle = rgbString(Ce * 0.84, Pe * 0.84, ta * 0.84)),
          L.fill()),
          Fa & 2 &&
            (L.beginPath(),
            quadPath(L, G, at + 16, 0),
            (L.fillStyle = rgbString(Ce * 0.68, Pe * 0.68, ta * 0.68)),
            L.fill()),
          L.beginPath(),
          quadPath(L, G, at, bc),
          (L.fillStyle = rgbString(Ce, Pe, ta)),
          L.fill(),
          vl > 0.004 &&
            ((L.strokeStyle =
              "rgba(" + Mt[0] + "," + Mt[1] + "," + Mt[2] + "," + vl.toFixed(3) + ")"),
            (L.lineWidth = 1),
            L.stroke()),
          Hu > 0.02 &&
            ((L.strokeStyle =
              "rgba(" + Mt[0] + "," + Mt[1] + "," + Mt[2] + "," + (0.85 * Hu).toFixed(3) + ")"),
            (L.lineWidth = 1.5),
            L.stroke());
      }
      const Ge = mixRGB(ge, Mt, 0.55);
      L.font = zu;
      const Uu = 1 - smoothstep(0, 0.4, O),
        Ta = smoothstep(0.62, 1, O);
      if (Uu > 0.004) {
        (L.fillStyle =
          "rgba(" +
          Math.round(Ge[0]) +
          "," +
          Math.round(Ge[1]) +
          "," +
          Math.round(Ge[2]) +
          "," +
          Uu.toFixed(3) +
          ")"),
          (L.textAlign = "left"),
          (L.textBaseline = "bottom");
        let et = -Infinity;
        for (const nt of Te) {
          const Gt = El(nt.week + Ul, -0.3),
            jl = L.measureText(nt.label).width;
          Gt < et ||
            Gt + jl > il ||
            (L.fillText(nt.label, Gt, Al(nt.week + Ul, -0.3, 0) - 3), (et = Gt + jl + 6));
        }
        if (((L.textAlign = "right"), (L.textBaseline = "middle"), ga > 0))
          for (const nt of Ee) L.fillText(nt.label, El(0, nt.day + 0.5) - 6, Al(0, nt.day + 0.5, 0));
      }
      if (Ta > 0.004) {
        (L.fillStyle =
          "rgba(" +
          Math.round(Ge[0]) +
          "," +
          Math.round(Ge[1]) +
          "," +
          Math.round(Ge[2]) +
          "," +
          Ta.toFixed(3) +
          ")"),
          (L.textAlign = "left"),
          (L.textBaseline = "top");
        let et = -Infinity;
        for (const nt of Te) {
          const Gt = El(nt.week + 0.5, 7.3);
          Gt < et ||
            Gt + L.measureText(nt.label).width > il ||
            (L.fillText(nt.label, Gt, Al(nt.week + 0.5, 7.3, 0) + 2),
            (et = Gt + L.measureText(nt.label).width + 10));
        }
      }
      if (ee >= 0 && ee < bt) {
        const et = ee,
          nt = te[et] + le[et] * Be,
          Gt = El(Dl[et] + 0.5, ml[et] + 0.5),
          jl = Math.min(
            Al(Dl[et] + Ul, ml[et] + Ul, nt),
            Al(Dl[et] + Ul + ue, ml[et] + Ul, nt),
            Al(Dl[et] + Ul, ml[et] + Ul + ue, nt)
          ),
          Nl = mc / 2,
          Hl = Math.min(il - Nl - 2, Math.max(Nl + 2, Gt));
        (Ft.style.transform =
          "translate(" +
          (Hl - Nl).toFixed(1) +
          "px," +
          (jl - 8).toFixed(1) +
          "px) translateY(-100%)"),
          Ft.style.setProperty("--arrow", (Gt - Hl + Nl).toFixed(1) + "px");
      }
    };

    const xu = (O: number) => {
      Ae = 0;
      const P = Math.min(0.05, Math.max(0, (O - Sa) / 1e3));
      Sa = O;
      let C = false;
      if (Zl !== _l) {
        const ht = Re ? 1 : (P * 1e3) / Math.max(1, qt.current.duration);
        (Zl = _l > Zl ? Math.min(_l, Zl + ht) : Math.max(_l, Zl - ht)), (C = true);
      }
      const J = Re ? 1 : 1 - Math.exp(-P * 12);
      (Ue += (Ke - Ue) * J),
        (ve += (Ne - ve) * J),
        Math.abs(Ke - Ue) > 1e-4 || Math.abs(Ne - ve) > 1e-4 ? (C = true) : ((Ue = Ke), (ve = Ne));
      const yt = Re ? 1 : 1 - Math.exp(-P * 7);
      for (let ht = 0; ht < 15; ht++) {
        const Lt = Ll[ht] - Pl[ht];
        Math.abs(Lt) > 0.4 ? ((Pl[ht] += Lt * yt), (C = true)) : (Pl[ht] = Ll[ht]);
      }
      const Yt = Re ? 1 : 1 - Math.exp(-P * 16),
        mt = Re ? 1 : 1 - Math.exp(-P * 10),
        jt = qt.current.legendLevel;
      for (let ht = 0; ht < bt; ht++) {
        const Lt = ht === ee ? 1 : 0,
          It = jt >= 0 && ba[ht] !== jt ? 1 : 0,
          Ot = le[ht],
          Jt = Se[ht];
        Ot !== Lt &&
          ((le[ht] = Math.abs(Lt - Ot) < 0.003 ? Lt : Ot + (Lt - Ot) * Yt), (C = true)),
          Jt !== It &&
            ((Se[ht] = Math.abs(It - Jt) < 0.003 ? It : Jt + (It - Jt) * mt), (C = true));
      }
      Ka(), C && (Ae = requestAnimationFrame(xu));
    };

    const We = () => {
      Ae || ((Sa = performance.now()), (Ae = requestAnimationFrame(xu)));
    };

    const Ye = () => {
      const O = Vl >= 0 ? Vl : Yl;
      O !== ee && ((ee = O), qt.current.setActive(O), We());
    };

    const Ol = (O: number, P: number) => {
      for (let C = bt - 1; C >= 0; C--) {
        const J = wa[C],
          yt = J * 24;
        if (
          pointInQuad(G, yt, O, P) ||
          (Va[J] & 1 && pointInQuad(G, yt + 8, O, P)) ||
          (Va[J] & 2 && pointInQuad(G, yt + 16, O, P))
        )
          return J;
      }
      return -1;
    };

    const yn = (O: PointerEvent) => {
      const P = K.getBoundingClientRect();
      return [O.clientX - P.left, O.clientY - P.top];
    };

    let ul: any = null;

    const Ja = (O: PointerEvent) => {
      if (O.button !== 0) return;
      const P = qt.current.orbit && _l === 1;
      ul = {
        id: O.pointerId,
        x: O.clientX,
        y: O.clientY,
        yaw: Ke,
        elev: Ne,
        moved: false,
        orbit: P,
        mouse: O.pointerType === "mouse",
      };
      if (P)
        try {
          K.setPointerCapture(O.pointerId);
        } catch {}
    };

    const mn = (O: PointerEvent) => {
      if (ul && ul.orbit && O.pointerId === ul.id) {
        const yt = O.clientX - ul.x,
          Yt = O.clientY - ul.y;
        if (ul.moved || Math.hypot(yt, Yt) > 4) {
          (ul.moved = true),
            (Ke = Math.min(Rs[1] - Ds, Math.max(Rs[0] - Ds, ul.yaw + yt * 0.006))),
            ul.mouse && (Ne = Math.min(Ai[1] - Os, Math.max(Ai[0] - Os, ul.elev + Yt * 0.004))),
            (K.style.cursor = "grabbing"),
            (Vl = -1),
            Ye(),
            We();
          return;
        }
      }
      if (O.pointerType !== "mouse") return;
      const [P, C] = yn(O),
        J = Ol(P, C);
      J !== Vl && ((Vl = J), Ye()),
        (K.style.cursor = qt.current.orbit && _l === 1 ? "grab" : J >= 0 ? "pointer" : "default");
    };

    const ka = (O: PointerEvent) => {
      if (!ul || O.pointerId !== ul.id) return;
      const P = ul.moved;
      if (
        ((ul = null),
        K.hasPointerCapture(O.pointerId) && K.releasePointerCapture(O.pointerId),
        (K.style.cursor = qt.current.orbit && _l === 1 ? "grab" : "default"),
        P)
      )
        return;
      const [C, J] = yn(O),
        yt = Ol(C, J);
      if (((Yl = yt === Yl ? -1 : yt), O.pointerType !== "mouse" && (Vl = -1), Ye(), yt >= 0)) {
        const jt = qt.current.model.cells[yt];
        qt.current.onCellClick?.({ date: jt.date, count: jt.count });
      }
    };

    const vc = () => {
      ul = null;
    };

    const Rl = () => {
      ul || ((Vl = -1), Ye());
    };

    const _u = () => {
      (Ke = 0), (Ne = 0), We();
    };

    const vn = (O: KeyboardEvent) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape", "Enter", " "].includes(
          O.key
        ) ||
        !bt
      )
        return;
      if ((O.preventDefault(), O.key === "Escape")) {
        (Yl = -1), (Vl = -1), Ye();
        return;
      }
      let C = Yl >= 0 ? Yl : ee >= 0 ? ee : bt - 1;
      if (O.key === "Enter" || O.key === " ") {
        const Yt = qt.current.model.cells[C];
        qt.current.onCellClick?.({ date: Yt.date, count: Yt.count });
        return;
      }
      (Yl >= 0 || ee >= 0) &&
        (O.key === "ArrowLeft" && (C -= 7),
        O.key === "ArrowRight" && (C += 7),
        O.key === "ArrowUp" && (C -= 1),
        O.key === "ArrowDown" && (C += 1),
        O.key === "Home" && (C = 0),
        O.key === "End" && (C = bt - 1)),
        (C = Math.max(0, Math.min(bt - 1, C))),
        (Yl = C),
        (Vl = -1),
        Ye(),
        qt.current.setAnnounce(qt.current.describe(C));
    };

    const Du = () => {
      (Yl = -1), Ye();
    };

    const $e = () => {
      const O = qt.current.target;
      me &&
        O !== _l &&
        ((_l = O),
        O === 0 && ((Ke = 0), (Ne = 0)),
        (K.style.cursor = qt.current.orbit && _l === 1 ? "grab" : "default"),
        We());
    };

    ae(), He(), qe();

    const gn = () => {
      me || ((me = true), Re && (Zl = qt.current.target), $e());
    };

    let Me: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      Me = new IntersectionObserver(
        (O) => {
          O.some((P) => P.isIntersecting) && (gn(), Me?.disconnect());
        },
        { threshold: 0.35 }
      );
      Me.observe(ot);
    } else gn();

    const Fe = new ResizeObserver(() => {
      Math.round(ot.clientWidth) !== il && qe();
    });
    Fe.observe(ot);

    const gc = new MutationObserver(He);
    gc.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    const bn = () => {
      (Re = Tu.matches), We();
    };

    Tu.addEventListener("change", bn);
    yc.addEventListener("change", He);
    K.addEventListener("pointerdown", Ja);
    K.addEventListener("pointermove", mn);
    K.addEventListener("pointerup", ka);
    K.addEventListener("pointercancel", vc);
    K.addEventListener("pointerleave", Rl);
    K.addEventListener("dblclick", _u);
    K.addEventListener("keydown", vn);
    K.addEventListener("blur", Du);
    lt.current = {
      kick: () => {
        $e(), We();
      },
      load: () => {
        ae(), He(), qe();
      },
      retheme: He,
      tipWidth: (O: number) => {
        (mc = O), Ka();
      },
    };
    return () => {
      Ae && cancelAnimationFrame(Ae),
        Me?.disconnect(),
        Fe.disconnect(),
        gc.disconnect(),
        Tu.removeEventListener("change", bn),
        yc.removeEventListener("change", He),
        K.removeEventListener("pointerdown", Ja),
        K.removeEventListener("pointermove", mn),
        K.removeEventListener("pointerup", ka),
        K.removeEventListener("pointercancel", vc),
        K.removeEventListener("pointerleave", Rl),
        K.removeEventListener("dblclick", _u),
        K.removeEventListener("keydown", vn),
        K.removeEventListener("blur", Du),
        (lt.current = null);
    };
  }, [$t]);

  React.useEffect(() => {
    lt.current?.kick();
  }, [hl, N]);

  React.useEffect(() => {
    lt.current?.load();
  }, [Ht, T]);

  React.useEffect(() => {
    lt.current?.retheme();
  }, [R]);

  React.useLayoutEffect(() => {
    const w = Z.current;
    w && _t >= 0 && lt.current?.tipWidth(w.offsetWidth);
  }, [_t, Ht]);

  const { stats: Ut } = Ht,
    gu = (w: any, ot: any, K = false) => {
      if (!w || !ot) return "—";
      const Ft = K ? he : Dt;
      return Ft.format(dayMs(w)) + " — " + Ft.format(dayMs(ot));
    },
    yl = hl === "3d",
    Ql = Qt && De >= 560,
    bu = Math.round(Math.max(30, Math.min(56, De * 0.058))),
    ma = [
      {
        label: "1 year total",
        value: Zt.format(Ut.total),
        unit: ye(Ut.total),
        sub: gu(Ut.first, Ut.last, true),
      },
      {
        label: "Busiest day",
        value: Zt.format(Ut.busiest.count),
        unit: ye(Ut.busiest.count),
        sub: Ut.busiest.date ? Dt.format(dayMs(Ut.busiest.date)) : "—",
      },
      {
        label: "Longest streak",
        value: Zt.format(Ut.longest.days),
        unit: Ut.longest.days === 1 ? "day" : "days",
        sub: gu(Ut.longest.start, Ut.longest.end),
      },
      {
        label: "Current streak",
        value: Zt.format(Ut.current.days),
        unit: Ut.current.days === 1 ? "day" : "days",
        sub: gu(Ut.current.start, Ut.current.end),
      },
    ],
    Su = Qt && !(yl && Ql),
    we = "cubic-bezier(0.65, 0, 0.35, 1)",
    dc = ["No " + W, "Light", "Moderate", "Heavy", "Heaviest"],
    dn = ["Hover a day for details · arrow keys to explore", "Drag to orbit · double-click to reset"],
    hc = dn[yl && st ? 1 : 0];

  return (
    <section
      ref={x}
      className={"relative w-full rounded-xl border p-4 font-sans sm:p-5 " + Xl}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 12,
        border: "1px solid var(--color-border, #e5e5e5)",
        padding: 16,
        fontFamily: "inherit",
        background: "var(--color-background, #ffffff)",
        color: "var(--color-foreground, #171717)",
        borderColor: "var(--color-border, #e5e5e5)",
      }}
    >
      <header
        style={{
          marginBottom: 12,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 16,
          rowGap: 8,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 400, lineHeight: 1.375 }}>
          {j ?? (
            <>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {Zt.format(Ut.total)}
              </span>{" "}
              {ye(Ut.total)} in the last year
            </>
          )}
        </h3>
        {rl && (
          <div
            role="group"
            aria-label="Chart view"
            style={{
              position: "relative",
              display: "inline-flex",
              borderRadius: 6,
              border: "1px solid var(--color-border, #e5e5e5)",
              padding: 2,
              borderColor: "var(--color-border, #e5e5e5)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 2,
                bottom: 2,
                left: 2,
                width: 32,
                borderRadius: 4,
                transition: "transform 500ms",
                background: "var(--color-foreground, #171717)",
                transform: yl ? "translateX(100%)" : "translateX(0)",
                transitionTimingFunction: we,
              }}
            />
            {(["2d", "3d"] as const).map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={hl === w}
                aria-label={w === "2d" ? "Flat heat map" : "3D skyline"}
                title={w === "2d" ? "Flat heat map" : "3D skyline"}
                onClick={() => ya(w)}
                style={{
                  position: "relative",
                  zIndex: 10,
                  display: "grid",
                  height: 28,
                  width: 32,
                  cursor: "pointer",
                  placeItems: "center",
                  borderRadius: 4,
                  border: 0,
                  background: "transparent",
                  padding: 0,
                  transition: "color 500ms",
                  color: hl === w ? "var(--color-background, #ffffff)" : mu,
                  outlineColor: "var(--color-foreground, #171717)",
                }}
              >
                {w === "2d" ? <GridIcon /> : <CubeIcon />}
              </button>
            ))}
          </div>
        )}
      </header>
      <div
        style={{
          position: "relative",
          borderRadius: 8,
          border: "1px solid var(--color-border, #e5e5e5)",
          borderColor: "var(--color-border, #e5e5e5)",
        }}
      >
        <div style={{ position: "relative", paddingLeft: 12, paddingRight: 12, paddingTop: 12 }}>
          <div
            ref={Y}
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
              borderRadius: 6,
              height: 150,
              outlineColor: "var(--color-foreground, #171717)",
            }}
          >
            <canvas
              ref={H}
              tabIndex={0}
              role="img"
              aria-label={
                Zt.format(Ut.total) +
                " " +
                ye(Ut.total) +
                " between " +
                gu(Ut.first, Ut.last, true) +
                ", shown as a " +
                (yl ? "3D skyline" : "heat map") +
                ". Use the arrow keys to read individual days."
              }
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: "block",
                outline: "none",
                maxWidth: "none",
                touchAction: yl && st ? "pan-y" : "auto",
              }}
            />
            {Qt && Ql && (
              <>
                <div
                  aria-hidden={!yl}
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    top: 4,
                    right: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 20,
                    opacity: yl ? 1 : 0,
                    transform: yl ? "translateY(0)" : "translateY(-10px)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: yl ? "600ms" : "300ms",
                    transitionDelay: yl ? Math.round(q * 0.55) + "ms" : "0ms",
                    transitionTimingFunction: we,
                  }}
                >
                  <Stat {...ma[0]} accent={Tl.accent} size={bu} align="end" />
                  <Stat {...ma[1]} accent={Tl.accent} size={bu} align="end" />
                </div>
                <div
                  aria-hidden={!yl}
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 20,
                    opacity: yl ? 1 : 0,
                    transform: yl ? "translateY(0)" : "translateY(10px)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: yl ? "600ms" : "300ms",
                    transitionDelay: yl ? Math.round(q * 0.65) + "ms" : "0ms",
                    transitionTimingFunction: we,
                  }}
                >
                  <Stat {...ma[2]} accent={Tl.accent} size={bu} align="start" />
                  <Stat {...ma[3]} accent={Tl.accent} size={bu} align="start" />
                </div>
              </>
            )}
          </div>
          <div
            ref={Z}
            role="tooltip"
            aria-hidden={_t < 0}
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 20,
              whiteSpace: "nowrap",
              borderRadius: 6,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: 12,
              lineHeight: 1,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
              transition: "opacity 150ms",
              opacity: _t >= 0 ? 1 : 0,
              background: "var(--color-foreground, #171717)",
              color: "var(--color-background, #ffffff)",
            }}
          >
            {_t >= 0 && Ht.cells[_t] ? (
              <>
                <strong style={{ fontWeight: 600 }}>
                  {Ht.cells[_t].count
                    ? Zt.format(Ht.cells[_t].count) + " " + ye(Ht.cells[_t].count)
                    : "No " + W}
                </strong>
                <span style={{ opacity: 0.75 }}> on {he.format(dayMs(Ht.cells[_t].date))}</span>
              </>
            ) : (
              " "
            )}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "100%",
                height: 0,
                width: 0,
                left: "var(--arrow, 50%)",
                marginLeft: -5,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid var(--color-foreground, #171717)",
              }}
            />
          </div>
        </div>
        {Qt && (
          <div
            aria-hidden={!Su}
            style={{
              display: "grid",
              gridTemplateRows: Su ? "1fr" : "0fr",
              opacity: Su ? 1 : 0,
              transitionProperty: "grid-template-rows, opacity",
              transitionDuration: q + "ms",
              transitionTimingFunction: we,
            }}
          >
            <div style={{ minHeight: 0, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  columnGap: 16,
                  rowGap: 16,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 16,
                  paddingBottom: 4,
                }}
              >
                {ma.map((w) => (
                  <Stat key={w.label} {...w} accent={Tl.accent} size={28} align="stack" />
                ))}
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            columnGap: 16,
            rowGap: 8,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 12,
            color: mu,
          }}
        >
          {dl === undefined ? (
            <span style={{ position: "relative", display: "grid", flex: 1 }}>
              {dn.map((w) => (
                <span
                  key={w}
                  aria-hidden={w !== hc}
                  style={{
                    gridArea: "1/1",
                    transition: "opacity 500ms",
                    opacity: w === hc ? 1 : 0,
                  }}
                >
                  {w}
                </span>
              ))}
            </span>
          ) : (
            <span style={{ flex: 1 }}>{dl}</span>
          )}
          {Kt && (
            <div
              style={{ display: "flex", alignItems: "center", gap: 6 }}
              onMouseLeave={() => Q(-1)}
            >
              <span style={{ marginRight: 2 }}>Less</span>
              {Tl.swatches.map((w, ot) => (
                <button
                  key={ot}
                  type="button"
                  aria-label={"Highlight " + dc[ot].toLowerCase() + " days"}
                  aria-pressed={N === ot}
                  title={dc[ot]}
                  onMouseEnter={() => Q(ot)}
                  onFocus={() => Q(ot)}
                  onBlur={() => Q(-1)}
                  onClick={() => Q((K) => (K === ot ? -1 : ot))}
                  style={{
                    height: 11,
                    width: 11,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: 0,
                    padding: 0,
                    transition: "background-color 500ms, transform 500ms",
                    background: w,
                    outlineColor: "var(--color-foreground, #171717)",
                    boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.12)",
                  }}
                />
              ))}
              <span style={{ marginLeft: 2 }}>More</span>
            </div>
          )}
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {St}
      </p>
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.relative{position:relative}.w-full{width:100%}.absolute{position:absolute}.overflow-hidden{overflow:hidden}`}</style>
    </section>
  );
}

ContributionSkyline.displayName = "ContributionSkyline";

export default ContributionSkyline;
