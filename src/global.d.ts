import type messages from "../messages/es.json";

declare global {
  interface IntlMessages extends Omit<typeof messages, "_"> {}
}

export {};
