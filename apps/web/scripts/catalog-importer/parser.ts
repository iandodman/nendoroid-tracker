import * as cheerio from "cheerio";

import type {
  RawGoodSmileProduct,
  RawGoodSmileRelease,
  RawGoodSmileReleaseDate,
} from "./types";

interface AnalyticsItem {
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  price?: number;
  item_variant?: string;
  item_category?: string;
  item_category2?: string;
}

interface ProductAnalyticsItem {
  product_master_code?: string;
  product_name?: string;
  category?: string;
  image_url?: string;
  url?: string;
  price?: number;
  reservation_deadline?: string;
}

interface ViewItemDataLayerEntry {
  event?: string;

  ecommerce?: {
    currency?: string;
    items?: AnalyticsItem[];
  };

  items?: ProductAnalyticsItem[];
}

/**
 * Finds the dataLayer.push(...) call corresponding to the product view event.
 */
function extractViewItemEntry(html: string): ViewItemDataLayerEntry {
  const $ = cheerio.load(html);

  const scripts = $("script")
    .map((_, element) => $(element).html() ?? "")
    .get();

  for (const script of scripts) {
    if (
      !script.includes("dataLayer.push") ||
      !script.includes('"event":"view_item"')
    ) {
      continue;
    }

    const marker = 'dataLayer.push({"event":"view_item"';
    const markerIndex = script.indexOf(marker);

    if (markerIndex === -1) {
      continue;
    }

    const openingParenthesisIndex = script.indexOf("(", markerIndex);

    if (openingParenthesisIndex === -1) {
      continue;
    }

    const json = extractBalancedArgument(script, openingParenthesisIndex);

    try {
      return JSON.parse(json) as ViewItemDataLayerEntry;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown JSON parsing error";

      throw new Error(
        `Unable to parse the Good Smile view_item data: ${message}`,
      );
    }
  }

  throw new Error(
    "The Good Smile product analytics dataLayer entry was not found.",
  );
}

/**
 * Extracts the JSON argument from a function call while respecting
 * nested objects, arrays and quoted strings.
 */
function extractBalancedArgument(
  source: string,
  openingParenthesisIndex: number,
): string {
  let depth = 0;
  let insideString = false;
  let escaped = false;
  let argumentStart = -1;

  for (
    let index = openingParenthesisIndex + 1;
    index < source.length;
    index += 1
  ) {
    const character = source[index];

    if (insideString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === "\\") {
        escaped = true;
        continue;
      }

      if (character === '"') {
        insideString = false;
      }

      continue;
    }

    if (character === '"') {
      insideString = true;
      continue;
    }

    if (character === "{" || character === "[") {
      if (argumentStart === -1) {
        argumentStart = index;
      }

      depth += 1;
      continue;
    }

    if (character === "}" || character === "]") {
      depth -= 1;

      if (depth === 0 && argumentStart !== -1) {
        return source.slice(argumentStart, index + 1);
      }
    }
  }

  throw new Error(
    "The dataLayer.push argument could not be extracted completely.",
  );
}

function makeAbsoluteUrl(
  value: string | undefined,
  baseUrl: string,
): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function isRerelease(sourceReleaseId: string, name: string): boolean {
  return /R\d+$/i.test(sourceReleaseId) || name.includes("(Rerelease)");
}

interface ProductDefinitionData {
  series?: string;
  specifications?: string;
  sculptor?: string;
  productionCooperation?: string;
  relatedInformation?: string;
  manufacturer?: string;
  distributedBy?: string;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractDefinitionData(html: string): ProductDefinitionData {
  const $ = cheerio.load(html);
  const result: ProductDefinitionData = {};

  $("dt").each((_, element) => {
    const term = normalizeText($(element).text());
    const description = normalizeText(
      $(element).next("dd").text(),
    );

    if (!term || !description) {
      return;
    }

    switch (term.toLowerCase()) {
      case "series":
        result.series = description;
        break;

      case "specifications":
        result.specifications = description;
        break;

      case "sculptor":
        result.sculptor = description;
        break;

      case "production cooperation":
        result.productionCooperation = description;
        break;

      case "related information":
        result.relatedInformation = description;
        break;

      case "manufacturer":
        result.manufacturer = description;
        break;

      case "distributed by":
        result.distributedBy = description;
        break;
    }
  });

  return result;
}

function parseReleaseDates(
  relatedInformation: string | undefined,
): RawGoodSmileReleaseDate[] {
  if (!relatedInformation) {
    return [];
  }

  const releaseDates: RawGoodSmileReleaseDate[] = [];
  const pattern =
    /\[(Available|Rerelease)\s*:\s*(\d{1,2})\/(\d{4})\]/gi;

  for (const match of relatedInformation.matchAll(pattern)) {
    const [, label, monthText, yearText] = match;

    const month = Number.parseInt(monthText, 10);
    const year = Number.parseInt(yearText, 10);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year)
    ) {
      continue;
    }

    releaseDates.push({
      type:
        label.toLowerCase() === "available"
          ? "initial"
          : "rerelease",
      month,
      year,
      rawLabel: match[0],
    });
  }

  return releaseDates;
}

export function parseGoodSmileProduct(
  html: string,
  sourceId: string,
  officialUrl: string,
): RawGoodSmileProduct {
  const analytics = extractViewItemEntry(html);
  const definitionData = extractDefinitionData(html);
  const releaseDates = parseReleaseDates(
    definitionData.relatedInformation,
    );
  const analyticsItems = analytics.ecommerce?.items ?? [];
  const productItems = analytics.items ?? [];

  const originalAnalyticsItem =
    analyticsItems.find((item) => item.item_id === sourceId) ??
    analyticsItems.find(
      (item) => item.item_id && !/R\d+$/i.test(item.item_id),
    ) ??
    analyticsItems[0];

  const originalProductItem =
    productItems.find(
      (item) => item.product_master_code === sourceId,
    ) ??
    productItems.find(
      (item) =>
        item.product_master_code &&
        !/R\d+$/i.test(item.product_master_code),
    ) ??
    productItems[0];

  const name =
    originalProductItem?.product_name ??
    originalAnalyticsItem?.item_name;

  if (!name) {
    throw new Error("The product name could not be extracted.");
  }

  const manufacturer =
  definitionData.manufacturer ??
  originalAnalyticsItem?.item_brand;

  const releases: RawGoodSmileRelease[] = productItems
    .filter(
      (
        item,
      ): item is ProductAnalyticsItem & {
        product_master_code: string;
        product_name: string;
      } =>
        Boolean(item.product_master_code) &&
        Boolean(item.product_name),
    )
    .map((item) => ({
      sourceReleaseId: item.product_master_code,
      name: item.product_name,
      price: item.price,
      reservationDeadline: item.reservation_deadline,
      isRerelease: isRerelease(
        item.product_master_code,
        item.product_name,
      ),
    }));

  return {
    source: "goodsmile",
    sourceId,
    officialUrl,

    name,
    series: definitionData.series,
    manufacturer,
    distributedBy: definitionData.distributedBy,
    category: originalAnalyticsItem?.item_category,
    productType: originalAnalyticsItem?.item_category2,
    mainImageUrl: makeAbsoluteUrl(
        originalProductItem?.image_url,
        officialUrl,
    ),
    price:
        originalProductItem?.price ??
        originalAnalyticsItem?.price,
    currency: analytics.ecommerce?.currency,

    specifications: definitionData.specifications,
    sculptor: definitionData.sculptor,
    productionCooperation:
        definitionData.productionCooperation,
    relatedInformation:
        definitionData.relatedInformation,
    
    releaseDates,
    releases,
    };
}