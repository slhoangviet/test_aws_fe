'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-12 flex flex-col items-center text-center">
      <h1 className="text-[28px] font-bold text-white mb-4 max-w-[560px] leading-[1.3]">
        {t('homeHero')}
      </h1>
      <p className="text-base text-zinc-400 max-w-[480px] leading-relaxed mb-12">
        {t('homeIntro')}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 max-w-[720px] w-full mb-12">
        <div className="bg-panel-bg border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-[15px] font-semibold text-white mb-2">{t('homeFeature1')}</div>
          <div className="text-[13px] text-zinc-500 leading-normal">{t('homeFeature1Desc')}</div>
        </div>
        <div className="bg-panel-bg border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-[15px] font-semibold text-white mb-2">{t('homeFeature2')}</div>
          <div className="text-[13px] text-zinc-500 leading-normal">{t('homeFeature2Desc')}</div>
        </div>
        <div className="bg-panel-bg border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-[15px] font-semibold text-white mb-2">{t('homeFeature3')}</div>
          <div className="text-[13px] text-zinc-500 leading-normal">{t('homeFeature3Desc')}</div>
        </div>
      </div>

      <Link
        href="/editor"
        className="px-7 py-3.5 rounded-lg border-none bg-indigo-500 text-white text-[15px] font-semibold cursor-pointer no-underline inline-block"
      >
        {t('homeCta')}
      </Link>
    </div>
  );
}
