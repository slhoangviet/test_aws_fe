/**
 * Re-export i18n public API
 */
export {
  I18nProvider,
  useI18n,
  SUPPORTED_LOCALES,
  type Locale,
  type TranslationKey,
} from './context';
export { translations } from './translations';
export {
  DEFAULT_LOCALE,
  getStoredLocale,
  setStoredLocale,
  STORAGE_KEY,
} from './config';
