'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/i18n';
import { apiFetch, getApiBase } from '@/utils/api';

const fullUrl = (path: string) => {
  const base = getApiBase();
  return path.startsWith('http') ? path : (base ? `${base}${path}` : path);
};

const styles = {
  main: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
  },
  leftPanel: {
    width: 260,
    background: '#1c1c24',
    borderRight: '1px solid #27272a',
    padding: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    overflowY: 'auto' as const,
  },
  panelTitle: { fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 4 },
  canvas: {
    flex: 1,
    background: '#0c0c10',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 0,
    position: 'relative' as const,
  },
  rightPanel: {
    width: 280,
    background: '#1c1c24',
    borderLeft: '1px solid #27272a',
    padding: 12,
    overflowY: 'auto' as const,
  },
  input: {
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: 6,
    padding: '8px 10px',
    color: '#fff',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  label: { display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 4 },
  sliderRow: { display: 'flex', alignItems: 'center', gap: 10 },
  slider: { flex: 1, height: 6, accentColor: '#6366f1' },
  thumbCard: {
    background: '#27272a',
    borderRadius: 8,
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
  },
  thumbCardActive: { borderColor: '#6366f1' },
  btn: (primary: boolean) => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    background: primary ? '#6366f1' : '#27272a',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }),
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

export default function EditorPage() {
  const { t, locale } = useI18n();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [cropLeft, setCropLeft] = useState('');
  const [cropTop, setCropTop] = useState('');
  const [cropW, setCropW] = useState('');
  const [cropH, setCropH] = useState('');
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [quality, setQuality] = useState(80);

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
        brightness: brightness !== 1 ? brightness : undefined,
        contrast: contrast !== 1 ? contrast : undefined,
        saturation: saturation !== 1 ? saturation : undefined,
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

  return (
    <>
      <div style={{ padding: '8px 16px', background: '#1c1c24', borderBottom: '1px solid #27272a', display: 'flex', alignItems: 'center' }}>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          <span style={styles.btn(true)}>{uploading ? t('uploading') : t('openImage')}</span>
        </label>
      </div>
      <div style={styles.main}>
        <aside style={styles.leftPanel}>
          <section>
            <div style={styles.panelTitle}>{t('size')}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>{t('widthPx')}</label>
                <input type="number" placeholder={t('auto')} value={width} onChange={(e) => setWidth(e.target.value)} style={styles.input} min={1} max={4000} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>{t('heightPx')}</label>
                <input type="number" placeholder={t('auto')} value={height} onChange={(e) => setHeight(e.target.value)} style={styles.input} min={1} max={4000} />
              </div>
            </div>
          </section>
          <section>
            <div style={styles.panelTitle}>{t('crop')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><label style={styles.label}>{t('left')}</label><input type="number" value={cropLeft} onChange={(e) => setCropLeft(e.target.value)} style={styles.input} min={0} /></div>
              <div><label style={styles.label}>{t('top')}</label><input type="number" value={cropTop} onChange={(e) => setCropTop(e.target.value)} style={styles.input} min={0} /></div>
              <div><label style={styles.label}>{t('width')}</label><input type="number" value={cropW} onChange={(e) => setCropW(e.target.value)} style={styles.input} min={1} /></div>
              <div><label style={styles.label}>{t('height')}</label><input type="number" value={cropH} onChange={(e) => setCropH(e.target.value)} style={styles.input} min={1} /></div>
            </div>
          </section>
          <section>
            <div style={styles.panelTitle}>{t('adjust')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><label style={styles.label}>{t('brightness')} {brightness.toFixed(1)}</label><div style={styles.sliderRow}><input type="range" min={0.2} max={2} step={0.1} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} style={styles.slider} /></div></div>
              <div><label style={styles.label}>{t('contrast')} {contrast.toFixed(1)}</label><div style={styles.sliderRow}><input type="range" min={0.2} max={2} step={0.1} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} style={styles.slider} /></div></div>
              <div><label style={styles.label}>{t('saturation')} {saturation.toFixed(1)}</label><div style={styles.sliderRow}><input type="range" min={0} max={2} step={0.1} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} style={styles.slider} /></div></div>
            </div>
          </section>
          <section>
            <div style={styles.panelTitle}>{t('exportTitle')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={styles.label}>{t('format')}</label>
                <select value={format} onChange={(e) => setFormat(e.target.value as 'webp' | 'jpeg' | 'png')} style={styles.input}>
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <div><label style={styles.label}>{t('quality')} {quality}%</label><input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={styles.slider} /></div>
              <button type="button" onClick={handleProcess} disabled={processLoading || selectedId == null} style={styles.btn(true)}>
                {processLoading ? t('processing') : t('applyExport')}
              </button>
            </div>
          </section>
        </aside>

        <main style={styles.canvas}>
          {displayUrl ? (
            <img src={displayUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
        </main>

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
