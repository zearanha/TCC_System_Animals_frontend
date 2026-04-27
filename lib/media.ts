const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3002").replace(
  /\/$/,
  ""
);

export function resolveApiAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
}
