export function frontendOrigin(
  requestOrigin: string,
  configuredOrigin = process.env.FRONTEND_URL ||
    (process.env.NETLIFY === "true" ? process.env.URL : undefined),
): string {
  const url = new URL(configuredOrigin || requestOrigin);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("Configura un FRONTEND_URL HTTP o HTTPS válido.");
  }
  return url.origin;
}
