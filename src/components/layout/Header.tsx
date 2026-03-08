import React from 'react';
import { useI18n } from '../../i18n';
import { LanguagePicker } from '../LanguagePicker';

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
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: 0,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  navLink: (active: boolean) => ({
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: active ? '#fff' : '#71717a',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
  }),
};

type Page = 'home' | 'editor';

type HeaderProps = {
  page: Page;
  onNavigate: (page: Page) => void;
};

export default function Header({ page, onNavigate }: HeaderProps) {
  const { t } = useI18n();

  return (
    <header style={styles.header}>
      <button
        type="button"
        style={styles.logo}
        onClick={() => onNavigate('home')}
      >
        {t('appTitle')}
      </button>
      <nav style={styles.nav}>
        <button
          type="button"
          style={styles.navLink(page === 'home')}
          onClick={() => onNavigate('home')}
        >
          {t('navHome')}
        </button>
        <button
          type="button"
          style={styles.navLink(page === 'editor')}
          onClick={() => onNavigate('editor')}
        >
          {t('navEditor')}
        </button>
      </nav>
      <LanguagePicker />
    </header>
  );
}
