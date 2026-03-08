import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n';

const styles = {
  wrap: {
    position: 'relative' as const,
    marginLeft: 'auto',
  },
  trigger: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #3f3f46',
    background: '#27272a',
    color: '#e4e4e7',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: 4,
    minWidth: 160,
    background: '#1c1c24',
    border: '1px solid #27272a',
    borderRadius: 8,
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    padding: 4,
    zIndex: 100,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#e4e4e7',
    fontSize: 13,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left' as const,
  },
  optionActive: {
    background: '#27272a',
    fontWeight: 600,
  },
};

/** Icon globe (Unicode) để chọn ngôn ngữ / quốc gia */
const GLOBE_ICON = '🌐';

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
    <div ref={ref} style={styles.wrap}>
      <button
        type="button"
        style={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        title={current?.label ?? locale}
        aria-label="Chọn ngôn ngữ"
      >
        {current ? current.flag : GLOBE_ICON}
      </button>
      {open && (
        <div style={styles.dropdown} role="listbox">
          {supportedLocales.map((item) => (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={locale === item.code}
              style={{
                ...styles.option,
                ...(locale === item.code ? styles.optionActive : {}),
              }}
              onClick={() => {
                setLocale(item.code);
                setOpen(false);
              }}
            >
              <span style={{ fontSize: 18 }}>{item.flag}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
