export type CloudinaryTransformOptions = {
  width?: number;
  quality?: string | number;
  extra?: string;
};

/**
 * Lightweight Cloudinary URL transformer.
 *
 * - If the URL is not a Cloudinary `image/upload` URL, it is returned as‑is.
 * - Otherwise we inject a basic transformation string with:
 *   - `f_auto` for optimal format
 *   - `q_<quality>` for quality
 *   - `w_<width>` for bounding width
 *   - any extra flags passed via `extra`
 */
export function cldThumb(
  url: string,
  { width = 600, quality = "auto", extra = "" }: CloudinaryTransformOptions = {},
): string {
  if (!url || typeof url !== "string") return url;

  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const prefix = url.slice(0, idx + marker.length);
  const rest = url.slice(idx + marker.length);

  const transforms = [
    "f_auto",
    `q_${quality}`,
    width ? `w_${width}` : "",
    extra,
  ]
    .filter(Boolean)
    .join(",");

  // If there were already transforms, keep them after ours
  // Example: existing "e_background_removal/..." becomes "<ourTransforms>/e_background_removal/..."
  return `${prefix}${transforms}/${rest}`;
}

