'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SUPPORTED_LOCALES, getStoredLocale, setStoredLocale, type Locale } from './config';
import { translations, type TranslationKey } from './translations';

export { SUPPORTED_LOCALES };
export type { Locale } from './config';
export type { TranslationKey } from './translations';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  supportedLocales: readonly { code: Locale; label: string; flag: string }[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    getStoredLocale(SUPPORTED_LOCALES),
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setStoredLocale(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[locale];
      if (dict && key in dict) return dict[key as keyof typeof dict];
      const fallback = translations.vi;
      return (fallback[key as keyof typeof fallback] as string) ?? key;
    },
    [locale],
  );

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
    supportedLocales: SUPPORTED_LOCALES,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
