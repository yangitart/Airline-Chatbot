export const faqEmbeddingModel = "gemini-embedding-001:1536";
export const faqEmbeddingModelId = "gemini-embedding-001";
export const faqEmbeddingDimensions = 1536;

export class FaqEmbeddingError extends Error {
  constructor(status, code, retryAfterMs = undefined) {
    super(`faq_embedding_${code}`);
    this.name = "FaqEmbeddingError";
    this.status = status;
    this.code = code;
    this.retryAfterMs = retryAfterMs;
  }
}

function retryAfterMilliseconds(value) {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : undefined;
}

/**
 * Uses Google's retrieval-specific task types and returns unit-normalized vectors.
 * @param {string} text
 * @param {{ apiKey: string, taskType: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT", title?: string, signal?: AbortSignal, timeoutMs?: number }} options
 * @returns {Promise<number[]>}
 */
export async function embedFaqText(text, { apiKey, taskType, title, signal, timeoutMs = 8_000 }) {
  const key = apiKey?.trim();
  const content = text?.trim();
  if (!key) throw new FaqEmbeddingError(0, "missing_api_key");
  if (!content) throw new FaqEmbeddingError(0, "empty_input");
  if (taskType !== "RETRIEVAL_QUERY" && taskType !== "RETRIEVAL_DOCUMENT") {
    throw new FaqEmbeddingError(0, "invalid_task_type");
  }

  const requestSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);
  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${faqEmbeddingModelId}:embedContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        content: { parts: [{ text: content }] },
        taskType,
        outputDimensionality: faqEmbeddingDimensions,
        ...(taskType === "RETRIEVAL_DOCUMENT" && title?.trim() ? { title: title.trim() } : {}),
      }),
      signal: requestSignal,
      cache: "no-store",
      redirect: "error",
    });
  } catch (error) {
    signal?.throwIfAborted();
    throw new FaqEmbeddingError(0, error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network_error");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const providerCode = typeof payload?.error?.status === "string"
      ? payload.error.status.toLowerCase()
      : `http_${response.status}`;
    throw new FaqEmbeddingError(response.status, providerCode, retryAfterMilliseconds(response.headers.get("retry-after")));
  }

  const values = payload?.embedding?.values;
  if (!Array.isArray(values) || values.length !== faqEmbeddingDimensions
    || values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    throw new FaqEmbeddingError(502, "invalid_vector");
  }

  const norm = Math.hypot(...values);
  if (!Number.isFinite(norm) || norm === 0) throw new FaqEmbeddingError(502, "invalid_vector");
  return values.map((value) => value / norm);
}

export function toFaqVectorLiteral(values) {
  if (!Array.isArray(values) || values.length !== faqEmbeddingDimensions
    || values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    throw new FaqEmbeddingError(0, "invalid_vector");
  }
  return `[${values.map((value) => value.toFixed(8)).join(",")}]`;
}
