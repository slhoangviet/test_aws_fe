'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n';
import { LanguagePicker } from '@/components/LanguagePicker';

const styles = {
  header: {
    height: 48,
    background: '#1c1c24',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 24,
  },
  logo: {
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '-0.02em',
    color: '#fff',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  navLink: (active: boolean) => ({
    padding: '6px 12px',
    borderRadius: 6,
    background: 'transparent',
    color: active ? '#fff' : '#71717a',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    textDecoration: 'none',
  }),
};

export default function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isEditor = pathname.startsWith('/editor');

  return (
    <header style={styles.header}>
      <Link href="/" style={styles.logo}>
        {t('appTitle')}
      </Link>
      <nav style={styles.nav}>
        <Link href="/" style={styles.navLink(isHome)}>
          {t('navHome')}
        </Link>
        <Link href="/editor" style={styles.navLink(isEditor)}>
          {t('navEditor')}
        </Link>
      </nav>
      <LanguagePicker />
    </header>
  );
}
