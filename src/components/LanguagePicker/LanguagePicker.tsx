import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n';

export default function LanguagePicker() {
  const { locale, setLocale, supportedLocales } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const current = supportedLocales.find((l) => l.code === locale);

  return (
    <div ref={ref} className="relative ml-auto">
      <button
        type="button"
        className="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 text-lg cursor-pointer flex items-center justify-center p-0"
        onClick={() => setOpen((v) => !v)}
        title={current?.label ?? locale}
        aria-label="Chọn ngôn ngữ"
      >
        {current ? current.flag : '🌐'}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-panel-bg border border-zinc-800 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.4)] p-1 z-[100]" role="listbox">
          {supportedLocales.map((item) => (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={locale === item.code}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border-none text-zinc-200 text-[13px] cursor-pointer w-full text-left ${
                locale === item.code ? 'bg-zinc-800 font-semibold' : 'bg-transparent'
              }`}
              onClick={() => {
                setLocale(item.code);
                setOpen(false);
              }}
            >
              <span className="text-lg">{item.flag}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
