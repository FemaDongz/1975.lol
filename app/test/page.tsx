"use client";

import PrismCometPreloader from "../PrismCometPreloader";

export default function TestPage() {
  return (
    <PrismCometPreloader
      instant
      word=""
      caption=""
      hud={false}
      grid={false}
      height="100svh"
    />
  );
}
