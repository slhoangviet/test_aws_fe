'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useI18n } from '@/i18n';
import { PixiEditorView } from './PixiEditorView';
import { InfoIcon } from './InfoIcon';
import { UploadDropzone } from './UploadDropzone';
import { SliderControl } from './SliderControl';
import { ToolbarBtn } from './ToolbarBtn';

export default function EditorPage() {
  const { t } = useI18n();
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Current file
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('image');

  // Size
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  // Crop
  const [cropLeft, setCropLeft] = useState('');
  const [cropTop, setCropTop] = useState('');
  const [cropW, setCropW] = useState('');
  const [cropH, setCropH] = useState('');
  const [cropMode, setCropMode] = useState(false);
  const [cropInitial, setCropInitial] = useState<{ left: number; top: number; w: number; h: number } | null>(null);
  const [, setCropDisplaySize] = useState<{ w: number; h: number } | null>(null);

  // Color adjustments
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tintVal, setTintVal] = useState(0);
  const [highlightsVal, setHighlightsVal] = useState(0);
  const [shadowsVal, setShadowsVal] = useState(0);
  const [whitesVal, setWhitesVal] = useState(0);

  // Export
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [quality, setQuality] = useState(80);

  // Convert UI values (-1 to 1 range) to filter multipliers
  const brightnessMultiplier = 1 + brightness;
  const contrastMultiplier = 1 + contrast;
  const saturationMultiplier = 1 + saturation;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (displayUrl) URL.revokeObjectURL(displayUrl);
    setWidth('');
    setHeight('');
    setRotation(0);
    setCropLeft('');
    setCropTop('');
    setCropW('');
    setCropH('');
    setCropMode(false);
    setCropInitial(null);
    setCropDisplaySize(null);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setTemperature(0);
    setTintVal(0);
    setHighlightsVal(0);
    setShadowsVal(0);
    setWhitesVal(0);
    setDisplayUrl(URL.createObjectURL(file));
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    setExportError(null);
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file ?? null);
    e.target.value = '';
  };

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const qualitySliderRef = useRef<HTMLInputElement>(null);

  const updateQualityFromPosition = useCallback((clientX: number) => {
    const el = qualitySliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.round(1 + x * 99);
    setQuality(Math.max(1, Math.min(100, v)));
  }, []);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const dragRef = useRef<{ kind: string; startX: number; startY: number; left: number; top: number; w: number; h: number; scaleX: number; scaleY: number } | null>(null);

  useEffect(() => {
    if (!displayUrl) setImgSize(null);
  }, [displayUrl]);

  const handleImgSizeDetected = useCallback((w: number, h: number) => {
    setImgSize({ w, h });
  }, []);

  const getCropNumbers = useCallback(() => {
    if (!imgSize) return null;
    const imgW = imgSize.w;
    const imgH = imgSize.h;
    const cl = cropLeft.trim() ? parseInt(cropLeft, 10) : 0;
    const ct = cropTop.trim() ? parseInt(cropTop, 10) : 0;
    const cw = cropW.trim() ? parseInt(cropW, 10) : imgW - cl;
    const ch = cropH.trim() ? parseInt(cropH, 10) : imgH - ct;
    const left = Math.max(0, Number.isNaN(cl) ? 0 : cl);
    const top = Math.max(0, Number.isNaN(ct) ? 0 : ct);
    const w = Math.max(1, Math.min(Number.isNaN(cw) ? imgW : cw, imgW - left));
    const h = Math.max(1, Math.min(Number.isNaN(ch) ? imgH : ch, imgH - top));
    return { left, top, w, h };
  }, [imgSize, cropLeft, cropTop, cropW, cropH]);

  const enterCropMode = () => {
    if (!imgSize || !displayUrl) return;
    const cur = getCropNumbers();
    if (cur) setCropInitial({ left: cur.left, top: cur.top, w: cur.w, h: cur.h });
    if (!cropLeft.trim() || !cropTop.trim() || !cropW.trim() || !cropH.trim()) {
      setCropLeft('0');
      setCropTop('0');
      setCropW(String(imgSize.w));
      setCropH(String(imgSize.h));
      setCropInitial({ left: 0, top: 0, w: imgSize.w, h: imgSize.h });
    }
    setCropMode(true);
  };

  const applyCrop = () => {
    setCropMode(false);
    setCropInitial(null);
  };

  const cancelCrop = () => {
    if (cropInitial) {
      setCropLeft(String(cropInitial.left));
      setCropTop(String(cropInitial.top));
      setCropW(String(cropInitial.w));
      setCropH(String(cropInitial.h));
    }
    setCropMode(false);
    setCropInitial(null);
  };

  const resetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setTemperature(0);
    setTintVal(0);
    setHighlightsVal(0);
    setShadowsVal(0);
    setWhitesVal(0);
  };

  const autoAdjust = () => {
    setBrightness(0.1);
    setContrast(0.15);
    setSaturation(0.1);
    setHighlightsVal(-0.1);
    setShadowsVal(0.15);
  };

  const handleExport = async () => {
    if (!displayUrl || !imgSize) return;
    setExporting(true);
    setExportError(null);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = displayUrl;
      });

      const crop = getCropNumbers() ?? { left: 0, top: 0, w: imgSize.w, h: imgSize.h };
      let destW = crop.w;
      let destH = crop.h;
      const outW = width.trim() ? parseInt(width, 10) : undefined;
      const outH = height.trim() ? parseInt(height, 10) : undefined;
      if (outW && outW > 0 && outH && outH > 0) {
        destW = outW; destH = outH;
      } else if (outW && outW > 0) {
        destW = outW; destH = Math.round((outW * crop.h) / crop.w);
      } else if (outH && outH > 0) {
        destH = outH; destW = Math.round((outH * crop.w) / crop.h);
      }
      const rot = rotation === 90 || rotation === 270;
      if (rot) [destW, destH] = [destH, destW];

      const offscreen = document.createElement('canvas');
      offscreen.width = rot ? destH : destW;
      offscreen.height = rot ? destW : destH;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context unavailable');

      const bm = 1 + brightness;
      const cm = 1 + contrast;
      const sm = 1 + saturation;
      ctx.filter = `brightness(${bm}) contrast(${cm}) saturate(${sm})`;
      if (rotation) {
        const cw = offscreen.width;
        const ch = offscreen.height;
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-destW / 2, -destH / 2);
        ctx.drawImage(img, crop.left, crop.top, crop.w, crop.h, 0, 0, destW, destH);
        ctx.restore();
      } else {
        ctx.drawImage(img, crop.left, crop.top, crop.w, crop.h, 0, 0, destW, destH);
      }
      ctx.filter = 'none';

      if (temperature !== 0) {
        ctx.globalCompositeOperation = 'overlay';
        const tempAlpha = Math.abs(temperature) * 0.15;
        ctx.fillStyle = temperature > 0
          ? `rgba(255, 140, 0, ${tempAlpha})`
          : `rgba(0, 100, 255, ${tempAlpha})`;
        ctx.fillRect(0, 0, destW, destH);
        ctx.globalCompositeOperation = 'source-over';
      }

      if (tintVal !== 0) {
        ctx.globalCompositeOperation = 'overlay';
        const tintAlpha = Math.abs(tintVal) * 0.12;
        ctx.fillStyle = tintVal > 0
          ? `rgba(200, 50, 200, ${tintAlpha})`
          : `rgba(50, 200, 50, ${tintAlpha})`;
        ctx.fillRect(0, 0, destW, destH);
        ctx.globalCompositeOperation = 'source-over';
      }

      if (highlightsVal !== 0 || shadowsVal !== 0 || whitesVal !== 0) {
        const imageData = ctx.getImageData(0, 0, destW, destH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          let adj = 0;
          if (highlightsVal !== 0 && lum > 0.6) adj += highlightsVal * (lum - 0.6) * 2.5 * 40;
          if (shadowsVal !== 0 && lum < 0.4) adj += shadowsVal * (0.4 - lum) * 2.5 * 40;
          if (whitesVal !== 0 && lum > 0.8) adj += whitesVal * (lum - 0.8) * 5 * 40;
          if (adj !== 0) {
            data[i] = Math.max(0, Math.min(255, r + adj));
            data[i + 1] = Math.max(0, Math.min(255, g + adj));
            data[i + 2] = Math.max(0, Math.min(255, b + adj));
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const q = format === 'png' ? undefined : quality / 100;

      const blob = await new Promise<Blob | null>((resolve) => offscreen.toBlob(resolve, mimeType, q));
      if (!blob) throw new Error('Failed to create image blob');

      const ext = format === 'jpeg' ? 'jpg' : format;
      const downloadName = `${fileName}_edited.${ext}`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : t('errorProcess'));
    } finally {
      setExporting(false);
    }
  };

  const HANDLE = 10;
  const getCropDragKind = (e: React.MouseEvent, leftD: number, topD: number, wD: number, hD: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nearLeft = x >= leftD - HANDLE && x <= leftD + HANDLE;
    const nearRight = x >= leftD + wD - HANDLE && x <= leftD + wD + HANDLE;
    const nearTop = y >= topD - HANDLE && y <= topD + HANDLE;
    const nearBottom = y >= topD + hD - HANDLE && y <= topD + hD + HANDLE;
    if (nearLeft && nearTop) return 'nw';
    if (nearRight && nearTop) return 'ne';
    if (nearLeft && nearBottom) return 'sw';
    if (nearRight && nearBottom) return 'se';
    if (nearLeft) return 'w';
    if (nearRight) return 'e';
    if (nearTop) return 'n';
    if (nearBottom) return 's';
    if (x >= leftD && x <= leftD + wD && y >= topD && y <= topD + hD) return 'move';
    return null;
  };

  const handleCropOverlayMouseDown = (e: React.MouseEvent) => {
    if (!imgSize) return;
    const crop = getCropNumbers();
    if (!crop) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const leftD = (crop.left / imgSize.w) * rect.width;
    const topD = (crop.top / imgSize.h) * rect.height;
    const wD = (crop.w / imgSize.w) * rect.width;
    const hD = (crop.h / imgSize.h) * rect.height;
    const kind = getCropDragKind(e, leftD, topD, wD, hD);
    if (!kind) return;
    e.preventDefault();
    const scaleX = rect.width / imgSize.w;
    const scaleY = rect.height / imgSize.h;
    dragRef.current = { kind, startX: e.clientX, startY: e.clientY, left: crop.left, top: crop.top, w: crop.w, h: crop.h, scaleX, scaleY };
  };

  useEffect(() => {
    if (!imgSize) return;
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const sx = d.scaleX;
      const sy = d.scaleY;
      const dx = (e.clientX - d.startX) / sx;
      const dy = (e.clientY - d.startY) / sy;
      const { kind, left, top, w, h } = d;
      const imgW = imgSize.w;
      const imgH = imgSize.h;
      let nLeft = left;
      let nTop = top;
      let nW = w;
      let nH = h;
      if (kind === 'move') {
        nLeft = Math.max(0, Math.min(imgW - w, left + dx));
        nTop = Math.max(0, Math.min(imgH - h, top + dy));
      } else {
        if (kind.includes('w')) {
          const dw = -dx;
          nW = Math.max(20, Math.min(w + dw, left + w));
          nLeft = left + w - nW;
        }
        if (kind.includes('e')) nW = Math.max(20, Math.min(w + dx, imgW - nLeft));
        if (kind.includes('n')) {
          const dh = -dy;
          nH = Math.max(20, Math.min(h + dh, top + h));
          nTop = top + h - nH;
        }
        if (kind.includes('s')) nH = Math.max(20, Math.min(h + dy, imgH - nTop));
      }
      setCropLeft(String(Math.round(nLeft)));
      setCropTop(String(Math.round(nTop)));
      setCropW(String(Math.round(nW)));
      setCropH(String(Math.round(nH)));
      dragRef.current = { ...d, left: nLeft, top: nTop, w: nW, h: nH, startX: e.clientX, startY: e.clientY };
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [imgSize]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleOpenFile}
      />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel - Adjustments */}
        {leftPanelOpen && (
          <aside className="w-[280px] min-w-[280px] bg-panel-bg border-r border-zinc-800 p-0 flex flex-col overflow-y-auto h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <span className="text-sm font-semibold text-zinc-200">
                {t('adjust')}
                {imgSize && (
                  <span className="text-[11px] font-normal text-zinc-500 ml-2">
                    {imgSize.w} × {imgSize.h}px
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setLeftPanelOpen(false)}
                className="bg-transparent border-none text-zinc-500 cursor-pointer text-lg p-0 leading-none"
              >
                ×
              </button>
            </div>

            {/* Auto adjust */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <button
                type="button"
                onClick={autoAdjust}
                disabled={!displayUrl}
                className={`w-full px-4 py-2.5 rounded-lg border-none bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[13px] font-semibold ${
                  displayUrl ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
                }`}
              >
                {t('autoAdjust')}
              </button>
            </div>

            {/* Current image / change */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-1.5">{t('currentImage')}</div>
              <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                <span
                  className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={fileName}
                >
                  {fileName || '-'}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-md border border-zinc-700 bg-transparent text-zinc-200 text-xs cursor-pointer whitespace-nowrap"
                >
                  {t('changeImage')}
                </button>
              </div>
            </div>

            {/* White Balance */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-1.5">{t('whiteBalance')}</div>
              <SliderControl label={t('temperature')} value={temperature} onChange={setTemperature} tooltip={t('tooltipTemperature')} />
              <SliderControl label={t('tint')} value={tintVal} onChange={setTintVal} tooltip={t('tooltipTint')} />
            </div>

            {/* Light */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-1.5">{t('light')}</div>
              <SliderControl label={t('brightness')} value={brightness} onChange={setBrightness} tooltip={t('tooltipBrightness')} />
              <SliderControl label={t('contrast')} value={contrast} onChange={setContrast} tooltip={t('tooltipContrast')} />
              <SliderControl label={t('highlights')} value={highlightsVal} onChange={setHighlightsVal} tooltip={t('tooltipHighlights')} />
              <SliderControl label={t('shadowsLabel')} value={shadowsVal} onChange={setShadowsVal} tooltip={t('tooltipShadows')} />
              <SliderControl label={t('whitesLabel')} value={whitesVal} onChange={setWhitesVal} tooltip={t('tooltipWhites')} />
              <SliderControl label={t('saturation')} value={saturation} onChange={setSaturation} tooltip={t('tooltipSaturation')} />
            </div>

            {/* Reset */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <button
                type="button"
                onClick={resetAdjustments}
                className="w-full px-4 py-[7px] rounded-md border border-zinc-700 bg-transparent text-zinc-400 text-xs cursor-pointer"
              >
                {t('resetAdjustments')}
              </button>
            </div>

            {/* Export */}
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center gap-1.5">{t('exportTitle')}</div>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">{t('format')}</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as 'webp' | 'jpeg' | 'png')}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2.5 py-[7px] text-white text-[13px] box-border"
                  >
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                    {t('quality')} {quality}%
                    <InfoIcon title={t('tooltipQuality')} />
                  </label>
                  <input
                    ref={qualitySliderRef}
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    onPointerDown={(e) => {
                      (e.target as HTMLInputElement).setPointerCapture(e.pointerId);
                      updateQualityFromPosition(e.clientX);
                    }}
                    onPointerMove={(e) => {
                      if (e.buttons !== 1) return;
                      updateQualityFromPosition(e.clientX);
                    }}
                    className="flex-1 cursor-pointer outline-none w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || !displayUrl}
                  className="px-4 py-[7px] rounded-md border-none bg-indigo-500 text-white text-[13px] font-semibold cursor-pointer transition-colors duration-150"
                >
                  {exporting ? t('processing') : t('applyExport')}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Canvas / Preview */}
        <main className="flex-1 bg-canvas-bg flex items-center justify-center p-6 min-h-0 relative flex-col">
          {!leftPanelOpen && (
            <button
              type="button"
              onClick={() => setLeftPanelOpen(true)}
              className="absolute top-2 left-2 z-10 px-2.5 py-1.5 rounded-md border-none bg-zinc-800 text-white text-xs font-semibold cursor-pointer transition-colors duration-150"
            >
              {t('adjust')}
            </button>
          )}
          {displayUrl ? (
            <>
              <div
                ref={previewContainerRef}
                className={`${cropMode ? 'hidden' : 'flex'} flex-1 items-center justify-center min-w-0 min-h-0 w-full`}
              />
              {imgSize && cropMode && (
                <div className="fixed inset-0 z-[1000] flex bg-black/75 backdrop-blur-[8px] items-center justify-center p-6">
                  <div ref={cropContainerRef} className="relative inline-block max-w-full max-h-full">
                    {(() => {
                      const crop = getCropNumbers();
                      if (!crop) return null;
                      const leftPct = (crop.left / imgSize.w) * 100;
                      const topPct = (crop.top / imgSize.h) * 100;
                      const wPct = (crop.w / imgSize.w) * 100;
                      const hPct = (crop.h / imgSize.h) * 100;
                      return (
                        <div
                          role="presentation"
                          onMouseDown={handleCropOverlayMouseDown}
                          className="absolute inset-0 w-full h-full cursor-crosshair pointer-events-auto z-10"
                        >
                          <div className="absolute left-0 top-0 w-full bg-black/55" style={{ height: `${topPct}%` }} />
                          <div className="absolute left-0 bg-black/55" style={{ top: `${topPct}%`, width: `${leftPct}%`, height: `${hPct}%` }} />
                          <div className="absolute bg-black/55" style={{ left: `${leftPct + wPct}%`, top: `${topPct}%`, width: `${100 - leftPct - wPct}%`, height: `${hPct}%` }} />
                          <div className="absolute left-0 w-full bg-black/55" style={{ top: `${topPct + hPct}%`, height: `${100 - topPct - hPct}%` }} />
                          <div
                            className="absolute border-2 border-white box-border pointer-events-none shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
                            style={{
                              left: `${leftPct}%`,
                              top: `${topPct}%`,
                              width: `${wPct}%`,
                              height: `${hPct}%`,
                            }}
                          />
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                            <button type="button" onClick={applyCrop} className="px-4 py-[7px] rounded-md border-none bg-indigo-500 text-white text-[13px] font-semibold cursor-pointer transition-colors duration-150">Apply</button>
                            <button type="button" onClick={cancelCrop} className="px-4 py-[7px] rounded-md border-none bg-zinc-800 text-white text-[13px] font-semibold cursor-pointer transition-colors duration-150">Cancel</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              <PixiEditorView
                containerRef={cropMode ? cropContainerRef : previewContainerRef}
                displayUrl={displayUrl}
                imgSize={imgSize}
                crop={getCropNumbers() ?? { left: 0, top: 0, w: imgSize?.w ?? 1, h: imgSize?.h ?? 1 }}
                outputWidth={width.trim() ? parseInt(width, 10) : undefined}
                outputHeight={height.trim() ? parseInt(height, 10) : undefined}
                rotation={rotation}
                brightness={brightnessMultiplier}
                contrast={contrastMultiplier}
                saturation={saturationMultiplier}
                temperature={temperature}
                tint={tintVal}
                highlights={highlightsVal}
                shadows={shadowsVal}
                whites={whitesVal}
                cropMode={cropMode}
                onDisplaySize={cropMode ? (w, h) => setCropDisplaySize({ w, h }) : undefined}
                onImgSizeDetected={handleImgSizeDetected}
                previewKey={`${cropLeft}|${cropTop}|${cropW}|${cropH}|${width}|${height}|${rotation}|${brightness}|${contrast}|${saturation}|${temperature}|${tintVal}|${highlightsVal}|${shadowsVal}|${whitesVal}`}
              />
            </>
          ) : (
            <UploadDropzone
              fileInputRef={fileInputRef}
              onFileSelected={(file) => processFile(file)}
            />
          )}
          {exportError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-900 text-red-200 px-4 py-2 rounded-lg text-[13px]">
              {exportError}
            </div>
          )}

          {/* Bottom toolbar */}
          {displayUrl && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 bg-zinc-800 rounded-[10px] px-2 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <ToolbarBtn title={t('crop')} onClick={enterCropMode} disabled={!imgSize}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v4H2v2h4v10a2 2 0 002 2h10v4h2v-4h4v-2H14V6h4V4H8V2H6zm2 4h8v8H8V6z"/></svg>
              </ToolbarBtn>
              <ToolbarBtn title={t('rotate')} onClick={() => setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270)} disabled={!imgSize}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-9-9"/><path d="M21 3v6h-6"/></svg>
              </ToolbarBtn>
              <ToolbarBtn title={t('exportTitle')} onClick={handleExport} disabled={exporting || !displayUrl}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </ToolbarBtn>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
