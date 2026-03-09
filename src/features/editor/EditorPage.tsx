'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useI18n } from '@/i18n';
import { PixiEditorView } from './PixiEditorView';
import { editorStyles } from './editorStyles';
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

  // Reset imgSize when URL changes
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

  // Client-side export: render to offscreen canvas, then download
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

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleOpenFile}
      />
      <div style={editorStyles.main}>
        {/* Left Panel - Adjustments */}
        {leftPanelOpen && (
          <aside style={editorStyles.leftPanel}>
            <div style={editorStyles.panelHeader}>
              <span style={editorStyles.panelHeaderTitle}>
                {t('adjust')}
                {imgSize && (
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#71717a', marginLeft: 8 }}>
                    {imgSize.w} × {imgSize.h}px
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setLeftPanelOpen(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Auto adjust */}
            <div style={editorStyles.section}>
              <button
                type="button"
                onClick={autoAdjust}
                disabled={!displayUrl}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: displayUrl ? 'pointer' : 'not-allowed',
                  opacity: displayUrl ? 1 : 0.5,
                }}
              >
                {t('autoAdjust')}
              </button>
            </div>

            {/* White Balance */}
            <div style={editorStyles.section}>
              <div style={editorStyles.sectionTitle}>{t('whiteBalance')}</div>
              <SliderControl label={t('temperature')} value={temperature} onChange={setTemperature} tooltip={t('tooltipTemperature')} />
              <SliderControl label={t('tint')} value={tintVal} onChange={setTintVal} tooltip={t('tooltipTint')} />
            </div>

            {/* Light */}
            <div style={editorStyles.section}>
              <div style={editorStyles.sectionTitle}>{t('light')}</div>
              <SliderControl label={t('brightness')} value={brightness} onChange={setBrightness} tooltip={t('tooltipBrightness')} />
              <SliderControl label={t('contrast')} value={contrast} onChange={setContrast} tooltip={t('tooltipContrast')} />
              <SliderControl label={t('highlights')} value={highlightsVal} onChange={setHighlightsVal} tooltip={t('tooltipHighlights')} />
              <SliderControl label={t('shadowsLabel')} value={shadowsVal} onChange={setShadowsVal} tooltip={t('tooltipShadows')} />
              <SliderControl label={t('whitesLabel')} value={whitesVal} onChange={setWhitesVal} tooltip={t('tooltipWhites')} />
              <SliderControl label={t('saturation')} value={saturation} onChange={setSaturation} tooltip={t('tooltipSaturation')} />
            </div>

            {/* Reset */}
            <div style={editorStyles.section}>
              <button type="button" onClick={resetAdjustments} style={editorStyles.btnOutline}>
                {t('resetAdjustments')}
              </button>
            </div>

            {/* Export */}
            <div style={editorStyles.section}>
              <div style={editorStyles.sectionTitle}>{t('exportTitle')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={editorStyles.label}>{t('format')}</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as 'webp' | 'jpeg' | 'png')} style={editorStyles.input}>
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...editorStyles.label, display: 'flex', alignItems: 'center', gap: 6 }}>
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
                    style={{ ...editorStyles.slider, width: '100%' }}
                  />
                </div>
                <button type="button" onClick={handleExport} disabled={exporting || !displayUrl} style={editorStyles.btn(true)}>
                  {exporting ? t('processing') : t('applyExport')}
                </button>
              </div>
            </div>
          </aside>
        )}
 
        {/* Canvas / Preview */}
        <main style={editorStyles.canvas}>
          {!leftPanelOpen && (
            <button
              type="button"
              onClick={() => setLeftPanelOpen(true)}
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 10,
                ...editorStyles.btn(false),
                fontSize: 12,
                padding: '5px 10px',
              }}
            >
              {t('adjust')}
            </button>
          )}
          {displayUrl ? (
            <>
              <div
                ref={previewContainerRef}
                style={{
                  display: cropMode ? 'none' : 'flex',
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 0,
                  minHeight: 0,
                  width: '100%',
                }}
              />
              {imgSize && cropMode && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                  }}
                >
                  <div ref={cropContainerRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
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
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            cursor: 'crosshair',
                            pointerEvents: 'auto',
                            zIndex: 10,
                          }}
                        >
                          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: `${topPct}%`, background: 'rgba(0,0,0,0.55)' }} />
                          <div style={{ position: 'absolute', left: 0, top: `${topPct}%`, width: `${leftPct}%`, height: `${hPct}%`, background: 'rgba(0,0,0,0.55)' }} />
                          <div style={{ position: 'absolute', left: `${leftPct + wPct}%`, top: `${topPct}%`, width: `${100 - leftPct - wPct}%`, height: `${hPct}%`, background: 'rgba(0,0,0,0.55)' }} />
                          <div style={{ position: 'absolute', left: 0, top: `${topPct + hPct}%`, width: '100%', height: `${100 - topPct - hPct}%`, background: 'rgba(0,0,0,0.55)' }} />
                          <div
                            style={{
                              position: 'absolute',
                              left: `${leftPct}%`,
                              top: `${topPct}%`,
                              width: `${wPct}%`,
                              height: `${hPct}%`,
                              border: '2px solid #fff',
                              boxSizing: 'border-box',
                              pointerEvents: 'none',
                              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                            }}
                          />
                          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, zIndex: 20 }}>
                            <button type="button" onClick={applyCrop} style={editorStyles.btn(true)}>Apply</button>
                            <button type="button" onClick={cancelCrop} style={editorStyles.btn(false)}>Cancel</button>
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
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: '#7f1d1d', color: '#fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>
              {exportError}
            </div>
          )}

          {/* Bottom toolbar */}
          {displayUrl && (
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 4,
              background: '#27272a',
              borderRadius: 10,
              padding: '6px 8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
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

