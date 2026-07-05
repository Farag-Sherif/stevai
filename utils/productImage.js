const PLACEHOLDER = "/images/placeholder.jpg";
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/**
 * Resolve product image URL from API response.
 * Handles: image_path, imgSrc, item.image_path, media[0].image_path.
 * Prepends API URL for relative paths like /storage/...
 */
export function getProductImageUrl(item) {
  if (!item || typeof item !== "object") return PLACEHOLDER;
  
  const mediaFirst = Array.isArray(item.media) ? item.media[0] : null;
  let path =
    item.image_path ??
    item.imgSrc ??
    item.item?.image_path ??
    item.item?.imgSrc ??
    mediaFirst?.image_path ??
    mediaFirst?.imgSrc ??
    null;

  if (!path || typeof path !== "string" || !path.trim()) return PLACEHOLDER;

  path = path.trim();
  // Already absolute URL
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Relative to API - prepend base URL
  if (path.startsWith("/") && API_URL) return `${API_URL}${path}`;
  if (path.startsWith("storage/") && API_URL) return `${API_URL}/${path}`;
  // Relative to site (e.g. /images/...)
  if (path.startsWith("/")) return path;
  // No leading slash - assume relative to API
  if (API_URL) return `${API_URL}/${path}`;
  return path;
}
