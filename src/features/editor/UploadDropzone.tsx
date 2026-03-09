'use client';

import React, { useState } from 'react';
import { useI18n } from '@/i18n';

type UploadDropzoneProps = {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelected: (file: File) => void;
};

export function UploadDropzone({ fileInputRef, onFileSelected }: UploadDropzoneProps) {
  const { t } = useI18n();
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        border: `2px dashed ${dragOver ? '#6366f1' : '#3f3f46'}`,
        borderRadius: 12,
        background: dragOver ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
        color: dragOver ? '#a5b4fc' : '#71717a',
        fontSize: 15,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '999px',
            border: `1px solid ${dragOver ? '#6366f1' : '#3f3f46'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: dragOver ? 'rgba(37, 99, 235, 0.18)' : 'rgba(24, 24, 27, 0.8)',
            boxShadow: dragOver ? '0 0 0 1px rgba(129, 140, 248, 0.6)' : '0 10px 30px rgba(0,0,0,0.6)',
            transition: 'all 0.15s',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 17a4 4 0 014-4h1" />
            <path d="M16 17h1a3 3 0 000-6 5 5 0 00-9.7-1.3" />
            <path d="M12 12v8" />
            <path d="M9.5 14.5L12 12l2.5 2.5" />
          </svg>
        </div>
        <div style={{ textAlign: 'center', maxWidth: 260 }}>
          <div style={{ fontWeight: 500 }}>{t('uploadDropzone')}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            PNG, JPEG, WebP · tối đa vài chục MB
          </div>
        </div>
      </div>
    </div>
  );
}

