import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeedFlow",
  description: "Agregador de noticias personalizado",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <Theme accentColor="blue" radius="medium">
              {children}
            </Theme>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
