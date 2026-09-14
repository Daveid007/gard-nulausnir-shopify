import type { ImgHTMLAttributes } from "react";

const RESPONSIVE_WIDTHS = [480, 768, 1200, 1800] as const;

function shopifyImageAtWidth(source: string, width: number): string | null {
  try {
    const url = new URL(source);
    if (url.hostname !== "cdn.shopify.com" || !url.pathname.startsWith("/s/files/")) {
      return null;
    }
    url.searchParams.set("width", String(width));
    return url.toString();
  } catch {
    return null;
  }
}

export type ResponsiveImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  sizes?: string;
};

/**
 * Shopify can serve a width-specific original from the same file URL. Keep
 * local assets and third-party image hosts untouched; they are intentionally
 * only rendered through the normal src attribute.
 */
export function ResponsiveImage({ src, sizes, ...props }: ResponsiveImageProps) {
  const source = typeof src === "string" ? src : undefined;
  const srcSet = source
    ? RESPONSIVE_WIDTHS.map((width) => {
        const candidate = shopifyImageAtWidth(source, width);
        return candidate ? `${candidate} ${width}w` : null;
      }).filter((candidate): candidate is string => Boolean(candidate)).join(", ")
    : "";

  return (
    <img
      {...props}
      src={src}
      {...(srcSet ? { srcSet, sizes: sizes ?? "100vw" } : {})}
    />
  );
}