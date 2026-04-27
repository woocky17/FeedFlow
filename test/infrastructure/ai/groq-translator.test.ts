import { afterEach, describe, expect, it, vi } from "vitest";
import { GroqTranslationService } from "@/infrastructure/ai/groq-translator";

const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

function mockGroqOnce(payload: unknown, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => payload,
  }) as unknown as typeof fetch;
}

function makeTranslator() {
  return new GroqTranslationService("test-api-key");
}

describe("GroqTranslationService", () => {
  it("translates titles via Groq and returns the parsed text", async () => {
    mockGroqOnce({
      choices: [{ message: { content: '{"text":"Hola mundo"}' } }],
    });
    const translator = makeTranslator();

    const result = await translator.translateTitle("Hello world", "en", "es");

    expect(result).toBe("Hola mundo");
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("returns the original text when source and target language are equal", async () => {
    const translator = makeTranslator();
    const result = await translator.translateTitle("same", "es", "es");
    expect(result).toBe("same");
  });

  it("falls back to regex extraction when JSON is malformed but recoverable", async () => {
    mockGroqOnce({
      choices: [
        {
          message: {
            content: 'noise before {"text":"Hola mundo"} noise after',
          },
        },
      ],
    });
    const translator = makeTranslator();

    const result = await translator.translateTitle("Hello world", "en", "es");

    expect(result).toBe("Hola mundo");
  });

  it("throws when content is missing", async () => {
    mockGroqOnce({ choices: [{ message: { content: "" } }] });
    const translator = makeTranslator();

    await expect(translator.translateTitle("hi", "en", "es")).rejects.toThrow(/empty/);
  });

  it("throws when no api key is configured", async () => {
    const translator = new GroqTranslationService("");
    await expect(translator.translateTitle("hi", "en", "es")).rejects.toThrow(/API key/);
  });

  it("trims overly long descriptions before sending", async () => {
    mockGroqOnce({
      choices: [{ message: { content: '{"text":"trad"}' } }],
    });
    const translator = makeTranslator();
    const longText = "a".repeat(5000);

    await translator.translateDescription(longText, "en", "es");

    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((callArgs[1] as { body: string }).body);
    const userMessage = body.messages[1].content as string;
    expect(userMessage.length).toBeLessThanOrEqual(3000);
  });
});
