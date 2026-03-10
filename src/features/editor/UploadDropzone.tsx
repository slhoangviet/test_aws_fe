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
      className={`flex-1 flex items-center justify-center min-w-0 min-h-0 w-full border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 text-[15px] ${
        dragOver
          ? 'border-indigo-500 bg-indigo-500/[0.08] text-indigo-300'
          : 'border-zinc-700 bg-transparent text-zinc-500'
      }`}
    >
      <div className="flex flex-col items-center gap-2.5">
        <div
          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-150 ${
            dragOver
              ? 'border border-indigo-500 bg-blue-600/[0.18] shadow-[0_0_0_1px_rgba(129,140,248,0.6)]'
              : 'border border-zinc-700 bg-zinc-900/80 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          }`}
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
        <div className="text-center max-w-[260px]">
          <div className="font-medium">{t('uploadDropzone')}</div>
          <div className="text-xs mt-1 opacity-80">
            PNG, JPEG, WebP · tối đa vài chục MB
          </div>
        </div>
      </div>
    </div>
  );
}
