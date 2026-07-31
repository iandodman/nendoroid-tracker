export interface RawGoodSmileProduct {
  source: "goodsmile";
  sourceId: string;
  officialUrl: string;

  name: string;
  number: string;
  series?: string;
  manufacturer?: string;
  distributedBy?: string;
  category?: string;
  productType?: string;
  mainImageUrl?: string;
  price?: number;
  currency?: string;

  specifications?: string;
  sculptor?: string;
  productionCooperation?: string;
  relatedInformation?: string;

  releaseDates: RawGoodSmileReleaseDate[];
  releases: RawGoodSmileRelease[];
}

export interface RawGoodSmileRelease {
  sourceReleaseId: string;
  name: string;
  price?: number;
  reservationDeadline?: string;
  isRerelease: boolean;
}

export interface RawGoodSmileReleaseDate {
  type: "initial" | "rerelease";
  month: number;
  year: number;
  rawLabel: string;
}

export type NormalizedCatalogProduct = {
  source: string;
  sourceId: string;
  officialUrl: string;

  number: string;
  name: string;
  series?: string;
  manufacturer?: string;
  imageUrl?: string;

    releaseYear?: number;
  releaseMonth?: number;

  // Stable internal identifier for the imported edition.
  // Examples: "standard", "good-smile-bonus" or "dx".
  slug: string;

  // Display name shown in the UI.
  editionName: string;

  // Optional information that distinguishes the edition.
  notes?: string;
};