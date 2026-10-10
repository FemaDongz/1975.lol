"use client";

import { useEffect, useState } from "react";

// Jumlah kolom grid: 5 di mobile (layar sempit), 7 di desktop.
// Dipakai bersama oleh shader, video, dan animasi pixel supaya sejajar.
export default function useGridCols(): number {
  const [cols, setCols] = useState(7);
  useEffect(() => {
    const compute = () =>
      setCols(window.innerWidth < 640 ? 5 : 7);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return cols;
}
