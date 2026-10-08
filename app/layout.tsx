import type { Metadata } from "next";
import { Silkscreen } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "1975",
  description: "1975.lol — coming soon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={silkscreen.className}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
