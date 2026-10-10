"use client";

import PrismCometPreloader from "../PrismCometPreloader";

export default function TestPage() {
  return (
    <PrismCometPreloader
      word="Prisma"
      caption="Five passes · One light"
      durationMs={6500}
      onComplete={() => {
        // demo: setelah selesai, tinggal di halaman
      }}
    />
  );
}
