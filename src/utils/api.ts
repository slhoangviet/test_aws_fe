/**
 * Gọi API kèm header x-locale để BE trả message lỗi đúng ngôn ngữ.
 * Next.js: dùng process.env.NEXT_PUBLIC_API_URL (có sẵn ở client).
 */
const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL ?? '') : '';

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
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL ?? '';
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}` : '';
}
