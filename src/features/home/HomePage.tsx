import React from 'react';
import { useI18n } from '../../i18n';

const styles = {
  wrap: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto' as const,
    padding: 48,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  hero: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 16,
    maxWidth: 560,
    lineHeight: 1.3,
  },
  intro: {
    fontSize: 16,
    color: '#a1a1aa',
    maxWidth: 480,
    lineHeight: 1.6,
    marginBottom: 48,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 24,
    maxWidth: 720,
    width: '100%',
    marginBottom: 48,
  },
  featureCard: {
    background: '#1c1c24',
    border: '1px solid #27272a',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center' as const,
  },
  featureTitle: { fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 },
  featureDesc: { fontSize: 13, color: '#71717a', lineHeight: 1.5 },
  cta: {
    padding: '14px 28px',
    borderRadius: 8,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

type HomePageProps = { onGoEditor: () => void };

export default function HomePage({ onGoEditor }: HomePageProps) {
  const { t } = useI18n();

  return (
    <div style={styles.wrap}>
      <h1 style={styles.hero}>{t('homeHero')}</h1>
      <p style={styles.intro}>{t('homeIntro')}</p>

      <div style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.featureTitle}>{t('homeFeature1')}</div>
          <div style={styles.featureDesc}>{t('homeFeature1Desc')}</div>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureTitle}>{t('homeFeature2')}</div>
          <div style={styles.featureDesc}>{t('homeFeature2Desc')}</div>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureTitle}>{t('homeFeature3')}</div>
          <div style={styles.featureDesc}>{t('homeFeature3Desc')}</div>
        </div>
      </div>

      <button type="button" onClick={onGoEditor} style={styles.cta}>
        {t('homeCta')}
      </button>
    </div>
  );
}
