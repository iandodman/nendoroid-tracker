"use client";

import Image, {
  type ImageProps,
} from "next/image";

const PLACEHOLDER_IMAGE =
  "/images/nendoroids/placeholder.png";

type NendoroidImageProps = Omit<
  ImageProps,
  "src"
> & {
  src?: ImageProps["src"] | null;
};

export default function NendoroidImage({
  src,
  alt,
  onError,
  ...props
}: NendoroidImageProps) {
  return (
    <Image
      {...props}
      unoptimized
      src={src || PLACEHOLDER_IMAGE}
      alt={alt}
      onError={(event) => {
        onError?.(event);

        const image = event.currentTarget;

        if (
          image.src.endsWith(
            "/images/nendoroids/placeholder.png",
          )
        ) {
          return;
        }

        image.src = PLACEHOLDER_IMAGE;
      }}
    />
  );
}