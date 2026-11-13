export const API_URL = '/api/backend';

export function assetUrl(url: string): string {
  return url.startsWith('/uploads/') ? `${API_URL}${url}` : url;
}
