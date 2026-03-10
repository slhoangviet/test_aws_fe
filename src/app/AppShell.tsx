'use client';

import React from 'react';
import { Header } from '@/components/layout';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-['Inter','Segoe_UI',system-ui,sans-serif] h-screen bg-app-bg text-zinc-200 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
