import * as cheerio from "cheerio";

const GOOD_SMILE_ORIGIN =
  "https://www.goodsmile.com";

const PRODUCT_PATH_PATTERN =
  /^\/en\/product\/([a-zA-Z0-9]+)(?:\/.*)?$/;

export function discoverProductIds(
  html: string,
): string[] {
  const $ = cheerio.load(html);
  const productIds = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href")?.trim();

    if (!href) {
      return;
    }

    let url: URL;

    try {
      url = new URL(href, GOOD_SMILE_ORIGIN);
    } catch {
      return;
    }

    if (url.origin !== GOOD_SMILE_ORIGIN) {
      return;
    }

    const match = url.pathname.match(
      PRODUCT_PATH_PATTERN,
    );

    const productId = match?.[1];

    if (productId) {
      productIds.add(productId);
    }
  });

  return [...productIds];
}