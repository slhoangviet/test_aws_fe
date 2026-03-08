/**
 * Cấu hình đa ngôn ngữ.
 * Thêm ngôn ngữ: thêm entry vào SUPPORTED_LOCALES và thêm bản dịch trong translations.ts.
 */
export const STORAGE_KEY = 'photo-editor-locale';

export const SUPPORTED_LOCALES = [
  { code: 'vi' as const, label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
  // Thêm ngôn ngữ tại đây, ví dụ:
  // { code: 'ja' as const, label: '日本語', flag: '🇯🇵' },
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'vi';

export function getStoredLocale(locales: readonly { code: Locale }[]): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const found = locales.find((l) => l.code === v);
    if (found) return found.code;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function setStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}
