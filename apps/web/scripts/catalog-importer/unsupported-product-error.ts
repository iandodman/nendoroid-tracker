export interface UnsupportedProductDetails {
  productId: string;
  productType?: string;
}

export class UnsupportedProductError extends Error {
  readonly productId: string;
  readonly productType?: string;

  constructor(
    message: string,
    details: UnsupportedProductDetails,
  ) {
    super(message);

    this.name = "UnsupportedProductError";
    this.productId = details.productId;
    this.productType = details.productType;
  }
}