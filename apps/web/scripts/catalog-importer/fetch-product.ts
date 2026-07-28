const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (compatible; NendoDexCatalogImporter/0.1; development prototype)",
};

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1_000;

const RETRYABLE_STATUS_CODES = new Set([
  408,
  425,
  429,
  500,
  502,
  503,
  504,
]);

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

async function requestProductHtml(
  url: string,
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(
        `Good Smile request failed: ${response.status} ${response.statusText}`,
      );

      Object.assign(error, {
        status: response.status,
      });

      throw error;
    }

    const contentType =
      response.headers.get("content-type");

    if (!contentType?.includes("text/html")) {
      throw new Error(
        `Expected an HTML response but received: ${contentType ?? "unknown"}`,
      );
    }

    const html = await response.text();

    if (html.trim().length === 0) {
      throw new Error(
        "Good Smile returned an empty HTML document.",
      );
    }

    return html;
  } finally {
    clearTimeout(timeout);
  }
}

function getErrorStatus(
  error: unknown,
): number | undefined {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
}

function shouldRetry(error: unknown): boolean {
  if (isAbortError(error)) {
    return true;
  }

  const status = getErrorStatus(error);

  if (status !== undefined) {
    return RETRYABLE_STATUS_CODES.has(status);
  }

  return error instanceof TypeError;
}

export async function fetchProductHtml(
  url: string,
): Promise<string> {
  for (
    let attempt = 1;
    attempt <= DEFAULT_MAX_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await requestProductHtml(
        url,
        DEFAULT_TIMEOUT_MS,
      );
    } catch (error: unknown) {
      const isLastAttempt =
        attempt === DEFAULT_MAX_ATTEMPTS;

      if (
        isLastAttempt ||
        !shouldRetry(error)
      ) {
        if (isAbortError(error)) {
          throw new Error(
            `Good Smile request timed out after ${DEFAULT_TIMEOUT_MS} ms.`,
          );
        }

        throw error;
      }

      const retryDelay =
        DEFAULT_RETRY_DELAY_MS * attempt;

      console.warn(
        `Good Smile request failed. Retrying in ${retryDelay} ms (${attempt}/${DEFAULT_MAX_ATTEMPTS})...`,
      );

      await sleep(retryDelay);
    }
  }

  throw new Error(
    "Good Smile request failed after all retry attempts.",
  );
}