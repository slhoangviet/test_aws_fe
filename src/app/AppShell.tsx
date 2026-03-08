'use client';

import React from 'react';
import { Header } from '@/components/layout';

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

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.layout}>
      <Header />
      <main style={styles.content}>{children}</main>
    </div>
  );
}
