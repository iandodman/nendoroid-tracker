import { fetchProductHtml } from "./fetch-product";
import { normalizeGoodSmileProduct } from "./normalizer";
import { parseGoodSmileProduct } from "./parser";
import { persistCatalogProduct } from "./persistence";
import {
  writeJsonFile,
  writeTextFile,
} from "./write-json";

export type ProductImportOperation =
  | "created"
  | "updated"
  | "adopted";

export type ProductArtifactMode =
  | "all"
  | "failed"
  | "none";

export interface ImportProductOptions {
  artifactMode?: ProductArtifactMode;
}

export interface ProductImportResult {
  productId: string;
  number: string;
  name: string;
  operation: ProductImportOperation;
}

function buildProductUrl(productId: string): string {
  return `https://www.goodsmile.com/en/product/${productId}`;
}

export async function importProduct(
  productId: string,
  options: ImportProductOptions = {},
): Promise<ProductImportResult> {
  const artifactMode =
    options.artifactMode ?? "all";

  const productUrl = buildProductUrl(productId);

  let html: string | undefined;

  try {
    html = await fetchProductHtml(productUrl);

    const product = parseGoodSmileProduct(
      html,
      productId,
      productUrl,
    );

    const normalizedProduct =
      normalizeGoodSmileProduct(product);

    if (artifactMode === "all") {
      await writeTextFile(
        `data/catalog/products/${productId}.html`,
        html,
      );

      await writeJsonFile(
        `data/catalog/products/${productId}.raw.json`,
        product,
      );

      await writeJsonFile(
        `data/catalog/products/${productId}.normalized.json`,
        normalizedProduct,
      );
    }

    const {
      nendoroid,
      operation,
    } = await persistCatalogProduct(
      normalizedProduct,
    );

    return {
      productId,
      number: nendoroid.number,
      name: nendoroid.name,
      operation,
    };
  } catch (error: unknown) {
    if (
      artifactMode === "failed" &&
      html
    ) {
      await writeTextFile(
        `data/catalog/failed/${productId}.html`,
        html,
      );
    }

    throw error;
  }
}