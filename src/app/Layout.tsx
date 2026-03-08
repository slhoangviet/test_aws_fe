import React from 'react';
import { Header } from '../components/layout';

const styles = {
  layout: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh',
    background: '#14141a',
    color: '#e4e4e7',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
  },
};

type Page = 'home' | 'editor';

type LayoutProps = {
  page: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
};

export default function Layout({ page, onNavigate, children }: LayoutProps) {
  return (
    <div style={styles.layout}>
      <Header page={page} onNavigate={onNavigate} />
      <main style={styles.content}>{children}</main>
    </div>
  );
}
