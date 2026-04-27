import React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "../messages/es.json";
import enMessages from "../messages/en.json";
import "../src/app/globals.css";

const messagesByLocale: Record<string, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "slate",
      values: [
        { name: "slate", value: "#f8fafc" },
        { name: "white", value: "#ffffff" },
      ],
    },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    locale: {
      name: "Locale",
      description: "Internationalization locale",
      defaultValue: "es",
      toolbar: {
        icon: "globe",
        items: [
          { value: "es", title: "Español" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = (context.globals.locale as string) || "es";
      const messages = messagesByLocale[locale] ?? esMessages;
      return (
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Story />
        </NextIntlClientProvider>
      );
    },
  ],
};

export default preview;
