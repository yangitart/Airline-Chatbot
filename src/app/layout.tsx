import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppProviders from "@/src/components/providers/AppProviders";
import { TravelAppShell } from "@/src/components/layout/TravelAppShell";

export const metadata: Metadata = {
  title: "Veyra",
  description: "Find flights and explore practical travel guides.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-airline-canvas scroll-smooth motion-reduce:scroll-auto overscroll-y-none" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preload" as="image" href="/images/london-tower-bridge.webp" />
        <link rel="preload" as="image" href="/images/airport-terminal-hero.webp" />
      </head>
      <body className="min-h-dvh bg-airline-canvas overscroll-y-none">
        <AppProviders><TravelAppShell>{children}</TravelAppShell></AppProviders>
      </body>
    </html>
  );
}
