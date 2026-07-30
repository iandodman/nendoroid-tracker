import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { fetchProductHtml } from "../catalog-importer/fetch-product";
import {
  extractGoodSmileProductData,
  type ExtractedGoodSmileProductData,
} from "../catalog-importer/parser";

type AuditResult =
  | {
      productId: string;
      product: ExtractedGoodSmileProductData;
    }
  | {
      productId: string;
      error: string;
    };

function formatValue(
  value: string | number | undefined,
): string {
  if (value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|");
}

async function auditProduct(
  productId: string,
): Promise<AuditResult> {
  const officialUrl =
    `https://www.goodsmile.com/en/product/${productId}`;

  console.log(`Auditing product ${productId}...`);

  try {
    const html = await fetchProductHtml(officialUrl);

    const product =
      extractGoodSmileProductData(
        html,
        productId,
        officialUrl,
      );

    return {
      productId,
      product,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return {
      productId,
      error: message,
    };
  }
}

function createSummaryRow(
  result: AuditResult,
): string {
  if ("error" in result) {
    return [
      result.productId,
      "—",
      "—",
      "—",
      "Failed",
      result.error,
    ]
      .map((value) =>
        escapeMarkdown(String(value)),
      )
      .join(" | ");
  }

  const { product } = result;

  return [
    product.sourceId,
    product.name,
    formatValue(product.productType),
    formatValue(product.number),
    formatValue(product.series),
    "Pending",
  ]
    .map((value) =>
      escapeMarkdown(String(value)),
    )
    .join(" | ");
}

function createProductSection(
  result: AuditResult,
): string {
  if ("error" in result) {
    return [
      `## ${result.productId}`,
      "",
      "- **Status:** Failed",
      `- **Error:** ${result.error}`,
      "",
      "### Manual classification",
      "",
      "- **Category:** Pending",
      "- **Beta action:** Retry",
      "- **Notes:**",
    ].join("\n");
  }

  const { product } = result;

  return [
    `## ${product.sourceId} — ${product.name}`,
    "",
    `- **URL:** ${product.officialUrl}`,
    `- **Detected product type:** ${formatValue(product.productType)}`,
    `- **Official number:** ${formatValue(product.number)}`,
    `- **Unnumbered set:** ${product.isUnnumberedSet ? "Yes" : "No"}`,
    `- **Series:** ${formatValue(product.series)}`,
    `- **Manufacturer:** ${formatValue(product.manufacturer)}`,
    `- **Category:** ${formatValue(product.category)}`,
    `- **Secondary category:** ${formatValue(product.secondaryCategory)}`,
    `- **Analytics category:** ${formatValue(product.analyticsProductCategory)}`,
    `- **Specifications:** ${formatValue(product.specifications)}`,
    "",
    "### Manual classification",
    "",
    "- **Category:** Pending",
    "- **Official number verified:** Pending",
    "- **Beta action:** Pending",
    "- **Notes:**",
  ].join("\n");
}

function createMarkdownReport(
  results: AuditResult[],
): string {
  const summaryRows = results
    .map((result) =>
      `| ${createSummaryRow(result)} |`,
    )
    .join("\n");

  const productSections = results
    .map(createProductSection)
    .join("\n\n---\n\n");

  return [
    "# Remaining Good Smile Product Audit",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Product ID | Product | Detected type | Official number | Series | Classification |",
    "|---|---|---|---|---|---|",
    summaryRows,
    "",
    "---",
    "",
    productSections,
    "",
  ].join("\n");
}
async function readProductIds(
  arguments_: string[],
): Promise<string[]> {
  if (arguments_.length === 0) {
    throw new Error(
      "Provide product IDs or the path to a .txt file.",
    );
  }

  if (
    arguments_.length === 1 &&
    arguments_[0].toLowerCase().endsWith(".txt")
  ) {
    const filePath = path.resolve(
      process.cwd(),
      arguments_[0],
    );

    const fileContent = await readFile(
      filePath,
      "utf8",
    );

    return fileContent
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(
            (line) =>
            line.length > 0 &&
            !line.startsWith("#"),
        )
        .map((line) => {
            if (!/^\d+$/.test(line)) {
            throw new Error(
                `Invalid product ID in ${filePath}: "${line}".`,
            );
            }

            return line;
        });
  }

  return arguments_
  .map((argument) => argument.trim())
  .filter(Boolean)
  .map((argument) => {
    if (!/^\d+$/.test(argument)) {
      throw new Error(
        `Invalid product ID: "${argument}".`,
      );
    }

    return argument;
  });
}
async function main(): Promise<void> {
  const productIds = await readProductIds(
  process.argv.slice(2),
);

  const uniqueProductIds = [
    ...new Set(productIds),
  ];

  const results: AuditResult[] = [];

  for (const productId of uniqueProductIds) {
    const result =
      await auditProduct(productId);

    results.push(result);
  }

  const report =
    createMarkdownReport(results);

  const outputDirectory = path.resolve(
    process.cwd(),
    "data/catalog-audit",
  );

  const outputPath = path.join(
    outputDirectory,
    "remaining-products.md",
  );

  await mkdir(outputDirectory, {
    recursive: true,
  });

  await writeFile(
    outputPath,
    report,
    "utf8",
  );

  const successful = results.filter(
    (result) => "product" in result,
  ).length;

  const failed = results.length - successful;

  console.log("");
  console.log(
    `Audit complete: ${results.length} products inspected.`,
  );
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Report: ${outputPath}`);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(`Catalog audit failed: ${message}`);
  process.exitCode = 1;
});