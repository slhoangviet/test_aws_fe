'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useI18n } from '@/i18n';
import { apiFetch, getApiBase } from '@/utils/api';
import { PixiEditorView } from './PixiEditorView';

const fullUrl = (path: string) => {
  const base = getApiBase();
  return path.startsWith('http') ? path : (base ? `${base}${path}` : path);
};

const styles = {
  main: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
    overflow: 'hidden' as const,
  },
  leftPanel: {
    width: 280,
    minWidth: 280,
    background: '#1c1c24',
    borderRight: '1px solid #27272a',
    padding: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    height: '100%',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #27272a',
  },
  panelHeaderTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e4e4e7',
  },
  section: {
    padding: '12px 16px',
    borderBottom: '1px solid #27272a',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#a1a1aa',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  canvas: {
    flex: 1,
    background: '#0c0c10',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 0,
    position: 'relative' as const,
    flexDirection: 'column' as const,
  },
  rightPanel: {
    width: 280,
    minWidth: 280,
    background: '#1c1c24',
    borderLeft: '1px solid #27272a',
    padding: 12,
    overflowY: 'auto' as const,
    height: '100%',
  },
  input: {
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: 6,
    padding: '7px 10px',
    color: '#fff',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  label: { display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 4 },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    flex: 1,
    minWidth: 0,
  },
  sliderValue: {
    fontSize: 12,
    color: '#e4e4e7',
    minWidth: 32,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  slider: {
    flex: 1,
    cursor: 'pointer',
    outline: 'none',
  },
  thumbCard: {
    background: '#27272a',
    borderRadius: 8,
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
  },
  thumbCardActive: { border: '2px solid #6366f1' },
  btn: (primary: boolean) => ({
    padding: '7px 16px',
    borderRadius: 6,
    border: 'none',
    background: primary ? '#6366f1' : '#27272a',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  }),
  btnOutline: {
    padding: '7px 16px',
    borderRadius: 6,
    border: '1px solid #3f3f46',
    background: 'transparent',
    color: '#a1a1aa',
    fontSize: 12,
    cursor: 'pointer',
    width: '100%',
  },
  tabBar: {
    display: 'flex',
    gap: 2,
    background: '#27272a',
    borderRadius: 8,
    padding: 2,
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#fff' : '#71717a',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  panelTitle: { fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 4 },
};

type FileItem = {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url: string;
  createdAt: string;
};

type SelectionMode = 'all' | 'import' | 'resize';

export default function EditorPage() {
  const { t, locale } = useI18n();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  // Selection mode
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('all');

  // Size
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

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

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/files', { locale });
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) setFiles(data.items);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    setUploading(true);
    setProcessError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch('/upload', { method: 'POST', body: formData, locale });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('errorUpload'));
      if (data.success && data.file) {
        setFiles((prev) => [data.file, ...prev]);
        setSelectedId(data.file.id);
        setProcessResult(null);
      }
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : t('errorUpload'));
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (selectedId == null) return;
    setProcessLoading(true);
    setProcessError(null);
    setProcessResult(null);
    try {
      const body: Record<string, unknown> = {
        format,
        quality,
        brightness: brightnessMultiplier !== 1 ? brightnessMultiplier : undefined,
        contrast: contrastMultiplier !== 1 ? contrastMultiplier : undefined,
        saturation: saturationMultiplier !== 1 ? saturationMultiplier : undefined,
      };
      const w = width.trim() ? parseInt(width, 10) : undefined;
      const h = height.trim() ? parseInt(height, 10) : undefined;
      if (w && !Number.isNaN(w)) body.width = w;
      if (h && !Number.isNaN(h)) body.height = h;
      const cl = cropLeft.trim() ? parseInt(cropLeft, 10) : undefined;
      const ct = cropTop.trim() ? parseInt(cropTop, 10) : undefined;
      const cw = cropW.trim() ? parseInt(cropW, 10) : undefined;
      const ch = cropH.trim() ? parseInt(cropH, 10) : undefined;
      if (cl != null && ct != null && cw != null && ch != null && !Number.isNaN(cl) && !Number.isNaN(ct) && !Number.isNaN(cw) && !Number.isNaN(ch)) {
        body.crop = { left: cl, top: ct, width: cw, height: ch };
      }
      const res = await apiFetch(`/files/${selectedId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        locale,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || t('errorProcess'));
      if (data.url) setProcessResult(data.url);
      else throw new Error('No URL');
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : t('errorProcess'));
    } finally {
      setProcessLoading(false);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedId);
  const displayUrl = processResult ? fullUrl(processResult) : selectedFile ? fullUrl(selectedFile.s3Url) : null;

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const dragRef = useRef<{ kind: string; startX: number; startY: number; left: number; top: number; w: number; h: number; scaleX: number; scaleY: number } | null>(null);

  // Reset imgSize when URL changes
  useEffect(() => {
    if (!displayUrl) setImgSize(null);
  }, [displayUrl]);

  // Callback from PixiEditorView when it detects image dimensions
  const handleImgSizeDetected = useCallback((w: number, h: number) => {
    setImgSize({ w, h });
  }, []);

  const deleteFile = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/files/${id}`, { method: 'DELETE', locale });
      if (!res.ok) throw new Error('Delete failed');
      const next = files.filter((f) => f.id !== id);
      setFiles(next);
      if (selectedId === id) {
        setSelectedId(next.length ? next[0].id : null);
        setProcessResult(null);
      }
    } catch {
      setProcessError(t('errorDelete'));
    }
  };

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

  const SliderControl = ({ label, value, onChange, min = -1, max = 1, step = 0.01 }: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
  }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={styles.sliderRow}>
        <span style={styles.sliderLabel}>{label}</span>
        <span style={styles.sliderValue}>{Math.round(value * 100)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ...styles.slider, width: '100%' }}
      />
    </div>
  );

  return (
    <>
      <div style={{ padding: '8px 16px', background: '#1c1c24', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          <span style={styles.btn(true)}>{uploading ? t('uploading') : t('openImage')}</span>
        </label>
        {imgSize && (
          <span style={{ fontSize: 12, color: '#71717a' }}>
            {imgSize.w} × {imgSize.h}px
          </span>
        )}
      </div>
      <div style={styles.main}>
        {/* Left Panel - Adjustments */}
        {leftPanelOpen && (
          <aside style={styles.leftPanel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelHeaderTitle}>{t('adjust')}</span>
              <button
                type="button"
                onClick={() => setLeftPanelOpen(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* Selection mode tabs */}
            <div style={styles.section}>
              <div style={{ ...styles.sectionTitle, marginBottom: 8 }}>{t('selectRegion')}</div>
              <div style={styles.tabBar}>
                <button type="button" style={styles.tab(selectionMode === 'all')} onClick={() => setSelectionMode('all')}>
                  {t('selAll')}
                </button>
                <button type="button" style={styles.tab(selectionMode === 'import')} onClick={() => setSelectionMode('import')}>
                  {t('selImport')}
                </button>
                <button type="button" style={styles.tab(selectionMode === 'resize')} onClick={() => setSelectionMode('resize')}>
                  {t('selResize')}
                </button>
              </div>
            </div>

            {/* Auto adjust */}
            <div style={styles.section}>
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
            <div style={styles.section}>
              <div style={styles.sectionTitle}>{t('whiteBalance')}</div>
              <SliderControl label={t('temperature')} value={temperature} onChange={setTemperature} />
              <SliderControl label={t('tint')} value={tintVal} onChange={setTintVal} />
            </div>

            {/* Light */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>{t('light')}</div>
              <SliderControl label={t('brightness')} value={brightness} onChange={setBrightness} />
              <SliderControl label={t('contrast')} value={contrast} onChange={setContrast} />
              <SliderControl label={t('highlights')} value={highlightsVal} onChange={setHighlightsVal} />
              <SliderControl label={t('shadowsLabel')} value={shadowsVal} onChange={setShadowsVal} />
              <SliderControl label={t('whitesLabel')} value={whitesVal} onChange={setWhitesVal} />
              <SliderControl label={t('saturation')} value={saturation} onChange={setSaturation} />
            </div>

            {/* Reset */}
            <div style={styles.section}>
              <button type="button" onClick={resetAdjustments} style={styles.btnOutline}>
                {t('resetAdjustments')}
              </button>
            </div>

            {/* Export */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>{t('exportTitle')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={styles.label}>{t('format')}</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as 'webp' | 'jpeg' | 'png')} style={styles.input}>
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>{t('quality')} {quality}%</label>
                  <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ ...styles.slider, width: '100%' }} />
                </div>
                <button type="button" onClick={handleProcess} disabled={processLoading || selectedId == null} style={styles.btn(true)}>
                  {processLoading ? t('processing') : t('applyExport')}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Canvas / Preview */}
        <main style={styles.canvas}>
          {!leftPanelOpen && (
            <button
              type="button"
              onClick={() => setLeftPanelOpen(true)}
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 10,
                ...styles.btn(false),
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
                            <button type="button" onClick={applyCrop} style={styles.btn(true)}>Apply</button>
                            <button type="button" onClick={cancelCrop} style={styles.btn(false)}>Cancel</button>
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
                previewKey={`${cropLeft}|${cropTop}|${cropW}|${cropH}|${width}|${height}|${brightness}|${contrast}|${saturation}|${temperature}|${tintVal}|${highlightsVal}|${shadowsVal}|${whitesVal}`}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#71717a', fontSize: 14 }}>
              {t('canvasPlaceholder')} <strong>{t('canvasPlaceholderAction')}</strong> {t('canvasPlaceholderSuffix')}
            </div>
          )}
          {processError && (
            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: '#7f1d1d', color: '#fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>
              {processError}
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
              <ToolbarBtn title={t('size')} onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
              </ToolbarBtn>
              <ToolbarBtn title={t('exportTitle')} onClick={handleProcess} disabled={processLoading || selectedId == null}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </ToolbarBtn>
            </div>
          )}
        </main>

        {/* Right Panel - Library */}
        <aside style={styles.rightPanel}>
          <div style={styles.panelTitle}>{t('library')}</div>
          {loading ? (
            <div style={{ color: '#71717a', fontSize: 13 }}>{t('libraryLoading')}</div>
          ) : files.length === 0 ? (
            <div style={{ color: '#71717a', fontSize: 13 }}>{t('libraryEmpty')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map((item) => (
                <div
                  key={item.id}
                  style={{ ...styles.thumbCard, ...(selectedId === item.id ? styles.thumbCardActive : {}) }}
                  onClick={() => { setSelectedId(item.id); setProcessResult(null); setProcessError(null); }}
                >
                  <div style={{ aspectRatio: '16/10', position: 'relative' as const, background: '#0c0c10' }}>
                    <img src={fullUrl(item.s3Url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={(e) => deleteFile(item.id, e)}
                      style={{
                        position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 4, border: 'none',
                        background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: 0,
                      }}
                      title={t('delete')}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ padding: '6px 8px', fontSize: 11, color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.originalName}</div>
                </div>
              ))}
            </div>
          )}
          {processResult && (
            <div style={{ marginTop: 12 }}>
              <div style={styles.panelTitle}>{t('result')}</div>
              <a href={fullUrl(processResult)} download target="_blank" rel="noreferrer" style={{ ...styles.btn(true), display: 'inline-block', textDecoration: 'none', marginTop: 4 }}>{t('download')}</a>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function ToolbarBtn({ title, onClick, disabled, children }: {
  title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: disabled ? '#52525b' : '#d4d4d8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
