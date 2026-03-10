'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n';
import { LanguagePicker } from '@/components/LanguagePicker';

export default function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isEditor = pathname.startsWith('/editor');

  return (
    <header className="h-12 bg-panel-bg border-b border-zinc-800 flex items-center px-4 gap-6">
      <Link href="/" className="font-bold text-[15px] tracking-tight text-white no-underline">
        {t('appTitle')}
      </Link>
      <nav className="flex items-center gap-1">
        <Link
          href="/"
          className={`px-3 py-1.5 rounded-md text-[13px] no-underline ${
            isHome ? 'text-white font-semibold' : 'text-zinc-500 font-medium'
          }`}
        >
          {t('navHome')}
        </Link>
        <Link
          href="/editor"
          className={`px-3 py-1.5 rounded-md text-[13px] no-underline ${
            isEditor ? 'text-white font-semibold' : 'text-zinc-500 font-medium'
          }`}
        >
          {t('navEditor')}
        </Link>
      </nav>
      <LanguagePicker />
    </header>
  );
}
