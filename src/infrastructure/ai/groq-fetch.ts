interface GroqRequestBody {
  model: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}

interface FetchOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

export async function fetchGroqChat(
  apiKey: string,
  body: GroqRequestBody,
  options: FetchOptions = {},
): Promise<unknown> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 3000;

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return res.json();
    }

    if (res.status !== 429 && res.status < 500) {
      lastError = `Groq error ${res.status}`;
      throw new Error(lastError);
    }

    if (attempt === maxRetries) {
      lastError = `Groq rate-limit/error ${res.status} after ${maxRetries + 1} attempts`;
      break;
    }

    const retryAfterHeader = res.headers.get("retry-after");
    const retryAfterMs = retryAfterHeader
      ? parseRetryAfter(retryAfterHeader)
      : null;
    const backoff = retryAfterMs ?? baseDelayMs * Math.pow(2, attempt);
    const capped = Math.min(backoff, 60_000);
    await sleep(capped);
  }

  throw new Error(lastError ?? "Groq request failed");
}

function parseRetryAfter(header: string): number | null {
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
