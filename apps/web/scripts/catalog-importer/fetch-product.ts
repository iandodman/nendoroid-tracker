const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (compatible; NendoDexCatalogImporter/0.1; development prototype)",
};

export async function fetchProductHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Good Smile request failed: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("text/html")) {
    throw new Error(
      `Expected an HTML response but received: ${contentType ?? "unknown"}`,
    );
  }

  const html = await response.text();

  if (html.trim().length === 0) {
    throw new Error("Good Smile returned an empty HTML document.");
  }

  return html;
}