import type messages from "../messages/es.json";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Omit<typeof messages, "_"> {}
}

export {};
