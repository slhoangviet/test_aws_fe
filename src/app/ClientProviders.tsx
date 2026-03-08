'use client';

import { I18nProvider } from '@/i18n';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
