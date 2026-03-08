/**
 * Gọi API kèm header x-locale để BE trả message lỗi đúng ngôn ngữ.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type ApiFetchOptions = RequestInit & { locale?: string };

export function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { locale, headers, ...rest } = options;
  const base = API_BASE ? `${API_BASE.replace(/\/$/, '')}` : '';
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
  const nextHeaders = new Headers(headers);
  if (locale) nextHeaders.set('x-locale', locale);
  return fetch(fullUrl, { ...rest, headers: nextHeaders });
}

export function getApiBase(): string {
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}` : '';
}
