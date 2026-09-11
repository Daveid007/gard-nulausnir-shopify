const rawModules = import.meta.glob(
  "../../../assets/swatches/柔景_*.jpg",
  { eager: true, import: "default" }
) as Record<string, string>;

const swatchUrls: Record<string, string> = {};
for (const [fullPath, url] of Object.entries(rawModules)) {
  const filename = fullPath.split("/").pop() ?? "";
  swatchUrls[filename] = url;
}

export function swatchUrl(filename: string): string {
  return swatchUrls[filename] ?? "";
}