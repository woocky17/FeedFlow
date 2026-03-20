import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeedFlow",
  description: "Agregador de noticias personalizado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Theme accentColor="blue" radius="medium">
          {children}
        </Theme>
      </body>
    </html>
  );
}
