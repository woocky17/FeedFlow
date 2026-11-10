import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GROQ_MODEL, fetchGroqChat } from "@/infrastructure/ai/groq-fetch";

const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function mockFetchOk() {
  const fetchMock = vi.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => ({ choices: [] }),
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function sentBody(fetchMock: ReturnType<typeof vi.fn>) {
  return JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
}

const messages = [{ role: "user" as const, content: "hi" }];

describe("fetchGroqChat", () => {
  it("uses GROQ_MODEL when it is defined", async () => {
    vi.stubEnv("GROQ_MODEL", "custom/model");
    const fetchMock = mockFetchOk();

    await fetchGroqChat("key", { messages });

    expect(sentBody(fetchMock).model).toBe("custom/model");
  });

  it("falls back to the default model when GROQ_MODEL is not defined", async () => {
    vi.stubEnv("GROQ_MODEL", undefined);
    const fetchMock = mockFetchOk();

    await fetchGroqChat("key", { messages });

    expect(DEFAULT_GROQ_MODEL).toBe("openai/gpt-oss-120b");
    expect(sentBody(fetchMock).model).toBe(DEFAULT_GROQ_MODEL);
  });

  it("sends low reasoning effort without reasoning by default", async () => {
    const fetchMock = mockFetchOk();

    await fetchGroqChat("key", { messages });

    const body = sentBody(fetchMock);
    expect(body.reasoning_effort).toBe("low");
    expect(body.include_reasoning).toBe(false);
  });

  it("lets the caller override the defaults", async () => {
    const fetchMock = mockFetchOk();

    await fetchGroqChat("key", { model: "other/model", reasoning_effort: "high", messages });

    const body = sentBody(fetchMock);
    expect(body.model).toBe("other/model");
    expect(body.reasoning_effort).toBe("high");
  });
});
