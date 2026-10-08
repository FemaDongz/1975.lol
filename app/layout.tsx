import type { Metadata, Viewport } from "next";
import { Silkscreen } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "1975 & COMING SOON - Responsive 3D Matrix",
  description: "1975.lol — coming soon",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <Analytics />
      </body>
    </html>
  );
}
