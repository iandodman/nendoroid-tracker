import { fetchProductHtml } from "./fetch-product";
import { extractGoodSmileProductData } from "./parser";

async function main(): Promise<void> {
  const productId = process.argv[2];

  if (!productId) {
    throw new Error("Missing product id.");
  }

  const url = `https://www.goodsmile.com/en/product/${productId}`;

  const html = await fetchProductHtml(url);

  const product = extractGoodSmileProductData(
    html,
    productId,
    url,
  );

  console.dir(product, {
    depth: null,
  });
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(`Unable to inspect product: ${message}`);
  process.exitCode = 1;
});