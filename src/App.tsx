import React, { useEffect, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type FileItem = {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url: string;
  createdAt: string;
};

const fullUrl = (path: string) =>
  path.startsWith('http') ? path : (API_BASE ? `${API_BASE.replace(/\/$/, '')}${path}` : path);

const styles = {
  app: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh',
    background: '#14141a',
    color: '#e4e4e7',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    height: 48,
    background: '#1c1c24',
    borderBottom: '1px solid #27272a',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 16,
  },
  logo: { fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: '#fff' },
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
};

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Tool state
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
      const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/files` : '/api/files';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) setFiles(data.items);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/upload` : '/api/upload';
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      if (data.success && data.file) {
        setFiles((prev) => [data.file, ...prev]);
        setSelectedId(data.file.id);
        setProcessResult(null);
      }
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : 'Upload failed');
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
      const url = API_BASE
        ? `${API_BASE.replace(/\/$/, '')}/files/${selectedId}/process`
        : `/api/files/${selectedId}/process`;
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
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Process failed');
      if (data.url) setProcessResult(data.url);
      else throw new Error('No URL');
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : 'Process failed');
    } finally {
      setProcessLoading(false);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedId);
  const displayUrl = processResult ? fullUrl(processResult) : selectedFile ? fullUrl(selectedFile.s3Url) : null;

  const deleteFile = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/files/${id}` : `/api/files/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const next = files.filter((f) => f.id !== id);
      setFiles(next);
      if (selectedId === id) {
        setSelectedId(next.length ? next[0].id : null);
        setProcessResult(null);
      }
    } catch {
      setProcessError('Xóa thất bại');
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <span style={styles.logo}>Photo Editor</span>
        <label style={{ cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={uploading}
          />
          <span style={styles.btn(true)}>{uploading ? 'Đang tải...' : 'Mở ảnh'}</span>
        </label>
      </header>

      <div style={styles.main}>
        <aside style={styles.leftPanel}>
          <section>
            <div style={styles.panelTitle}>Kích thước</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Rộng (px)</label>
                <input
                  type="number"
                  placeholder="Tự động"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  style={styles.input}
                  min={1}
                  max={4000}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Cao (px)</label>
                <input
                  type="number"
                  placeholder="Tự động"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={styles.input}
                  min={1}
                  max={4000}
                />
              </div>
            </div>
          </section>

          <section>
            <div style={styles.panelTitle}>Cắt (Crop)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><label style={styles.label}>Left</label><input type="number" value={cropLeft} onChange={(e) => setCropLeft(e.target.value)} style={styles.input} min={0} /></div>
              <div><label style={styles.label}>Top</label><input type="number" value={cropTop} onChange={(e) => setCropTop(e.target.value)} style={styles.input} min={0} /></div>
              <div><label style={styles.label}>Width</label><input type="number" value={cropW} onChange={(e) => setCropW(e.target.value)} style={styles.input} min={1} /></div>
              <div><label style={styles.label}>Height</label><input type="number" value={cropH} onChange={(e) => setCropH(e.target.value)} style={styles.input} min={1} /></div>
            </div>
          </section>

          <section>
            <div style={styles.panelTitle}>Điều chỉnh</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><label style={styles.label}>Độ sáng {brightness.toFixed(1)}</label><div style={styles.sliderRow}><input type="range" min={0.2} max={2} step={0.1} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} style={styles.slider} /></div></div>
              <div><label style={styles.label}>Tương phản {contrast.toFixed(1)}</label><div style={styles.sliderRow}><input type="range" min={0.2} max={2} step={0.1} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} style={styles.slider} /></div></div>
              <div><label style={styles.label}>Bão hòa {saturation.toFixed(1)}</label><div style={styles.sliderRow}><input type="range" min={0} max={2} step={0.1} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} style={styles.slider} /></div></div>
            </div>
          </section>

          <section>
            <div style={styles.panelTitle}>Xuất file</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={styles.label}>Định dạng</label>
                <select value={format} onChange={(e) => setFormat(e.target.value as 'webp' | 'jpeg' | 'png')} style={styles.input}>
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
              <div><label style={styles.label}>Chất lượng {quality}%</label><input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={styles.slider} /></div>
              <button type="button" onClick={handleProcess} disabled={processLoading || selectedId == null} style={styles.btn(true)}>
                {processLoading ? 'Đang xử lý...' : 'Áp dụng / Xuất'}
              </button>
            </div>
          </section>
        </aside>

        <main style={styles.canvas}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#71717a', fontSize: 14 }}>
              Chọn ảnh bên phải hoặc nhấn <strong>Mở ảnh</strong> để bắt đầu
            </div>
          )}
          {processError && <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: '#7f1d1d', color: '#fecaca', padding: '8px 16px', borderRadius: 8, fontSize: 13 }}>{processError}</div>}
        </main>

        <aside style={styles.rightPanel}>
          <div style={styles.panelTitle}>Thư viện ảnh</div>
          {loading ? (
            <div style={{ color: '#71717a', fontSize: 13 }}>Đang tải...</div>
          ) : files.length === 0 ? (
            <div style={{ color: '#71717a', fontSize: 13 }}>Chưa có ảnh. Nhấn Mở ảnh để upload.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map((item) => (
                <div
                  key={item.id}
                  style={{ ...styles.thumbCard, ...(selectedId === item.id ? styles.thumbCardActive : {}) }}
                  onClick={() => { setSelectedId(item.id); setProcessResult(null); setProcessError(null); }}
                >
                  <div style={{ aspectRatio: '16/10', position: 'relative', background: '#0c0c10' }}>
                    <img src={fullUrl(item.s3Url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={(e) => deleteFile(item.id, e)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        border: 'none',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: 14,
                        cursor: 'pointer',
                        lineHeight: 1,
                        padding: 0,
                      }}
                      title="Xóa"
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
              <div style={styles.panelTitle}>Kết quả</div>
              <a href={fullUrl(processResult)} download target="_blank" rel="noreferrer" style={{ ...styles.btn(true), display: 'inline-block', textDecoration: 'none', marginTop: 4 }}>Tải xuống</a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
