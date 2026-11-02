import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppProviders from "@/src/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Air India Assistant",
  description: "A conversational assistant for Air India travel questions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
