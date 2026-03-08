import React, { useEffect, useState } from 'react';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

type FileItem = {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url: string;
  createdAt: string;
};

type UploadResponse = {
  success: boolean;
  url: string;
  key: string;
  file?: FileItem;
};

export type S3UploaderProps = {
  /**
   * API base URL (subdomain api.{domain}), ví dụ: "https://api.yourdomain.com".
   * Không dùng /api trong path; backend phục vụ trực tiếp tại gốc (vd: /upload, /files).
   * Nếu không truyền, dùng VITE_API_URL; fallback "/api/..." chỉ cho dev proxy.
   */
  apiBaseUrl?: string;
  /**
   * Callback sau khi upload thành công (dùng cho file manager).
   */
  onUploaded?: (payload: UploadResponse) => void;
};

export const S3ImageUploader: React.FC<S3UploaderProps> = ({ apiBaseUrl, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    if (!selected.type.startsWith('image/')) {
      setMessage('Chỉ được chọn file ảnh (jpeg, png, webp,...)');
      setStatus('error');
      setFile(null);
      return;
    }

    setFile(selected);
    setMessage(null);
    setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage('Vui lòng chọn 1 ảnh trước');
      setStatus('error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('uploading');
      setMessage(null);

      const envBase = import.meta.env.VITE_API_URL ?? '';
      const base = apiBaseUrl ?? envBase;
      const uploadUrl = base ? `${base.replace(/\/$/, '')}/upload` : '/api/upload';

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Upload failed with status ${response.status}`);
      }

      const data: UploadResponse = await response.json();

      if (!data.success || !data.url) {
        throw new Error('Phản hồi không hợp lệ từ server');
      }

      setImageUrl(data.url);
      setStatus('success');
      setMessage('Upload thành công!');

      if (onUploaded) {
        onUploaded(data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setStatus('error');
      setMessage('Upload thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1rem',
        fontFamily: 'system-ui, sans-serif',
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#ffffff',
      }}
    >
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: '#111827',
        }}
      >
        Upload ảnh
      </h2>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="file-input"
          style={{
            display: 'block',
            padding: '0.6rem 0.8rem',
            borderRadius: '0.5rem',
            border: '1px dashed #6366f1',
            backgroundColor: '#eef2ff',
            cursor: 'pointer',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          Chọn ảnh (JPG, PNG, WEBP — tối đa 10MB)
        </label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {file && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#374151',
              marginBottom: '0.5rem',
            }}
          >
            Đã chọn:{' '}
            <span style={{ fontWeight: 600 }}>
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}

        {message && (
          <div
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '0.4rem',
              fontSize: '0.8rem',
              marginBottom: '0.5rem',
              color: status === 'error' ? '#b91c1c' : '#166534',
              backgroundColor:
                status === 'error' ? 'rgba(254,226,226,0.8)' : 'rgba(220,252,231,0.8)',
              border:
                status === 'error'
                  ? '1px solid rgba(248,113,113,0.7)'
                  : '1px solid rgba(74,222,128,0.7)',
            }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'uploading'}
          style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: status === 'uploading' ? '#9ca3af' : '#2563eb',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: status === 'uploading' ? 'wait' : 'pointer',
          }}
        >
          {status === 'uploading' ? 'Đang tải lên...' : 'Thêm ảnh'}
        </button>
      </form>

      {imageUrl && (
        <div style={{ marginTop: '0.75rem' }}>
          <img
            src={imageUrl}
            alt="Uploaded to S3"
            style={{
              display: 'block',
              width: '100%',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              objectFit: 'contain',
              maxHeight: 240,
            }}
          />
        </div>
      )}
    </div>
  );
};

type FileManagerProps = {
  apiBaseUrl?: string;
  reloadKey: number;
};

const FileManager: React.FC<FileManagerProps> = ({ apiBaseUrl, reloadKey }) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedForProcess, setSelectedForProcess] = useState<number | null>(null);
  const [processWidth, setProcessWidth] = useState<string>('800');
  const [processHeight, setProcessHeight] = useState<string>('');
  const [processFormat, setProcessFormat] = useState<'webp' | 'jpeg' | 'png'>('webp');
  const [processQuality, setProcessQuality] = useState<number>(80);
  const [processLoading, setProcessLoading] = useState(false);
  const [processResult, setProcessResult] = useState<{ url: string } | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  const getBaseUrl = () => {
    const envBase = import.meta.env.VITE_API_URL ?? '';
    return apiBaseUrl ?? envBase;
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const base = getBaseUrl();
      const listUrl = base ? `${base.replace(/\/$/, '')}/files` : '/api/files';

      const res = await fetch(listUrl);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Fetch failed with status ${res.status}`);
      }

      const data: { success: boolean; items: FileItem[] } = await res.json();
      if (!data.success || !Array.isArray(data.items)) {
        throw new Error('Phản hồi không hợp lệ từ server');
      }

      setItems(data.items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError('Không tải được danh sách file');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1rem',
        fontFamily: 'system-ui, sans-serif',
        width: '100%',
        backgroundColor: '#ffffff',
      }}
    >
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '0.5rem',
        }}
      >
        Danh sách ảnh
      </h2>

      {loading && <p style={{ fontSize: '0.85rem' }}>Đang tải...</p>}
      {error && (
        <p style={{ fontSize: '0.85rem', color: '#b91c1c', marginBottom: '0.5rem' }}>
          {error}
        </p>
      )}

      {!loading && items.length === 0 && !error && (
        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Chưa có ảnh nào. Hãy upload ảnh trước.</p>
      )}

      {items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.25rem',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
              }}
            >
              <a
                href={item.s3Url}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    paddingTop: '70%',
                    position: 'relative',
                    backgroundColor: '#111827',
                  }}
                >
                  <img
                    src={item.s3Url}
                    alt={item.originalName}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.originalName}
                  >
                    {item.originalName}
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {(item.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </a>
              <button
                type="button"
                disabled={deletingId === item.id}
                onClick={async (e) => {
                  e.preventDefault();
                  if (deletingId === item.id) return;
                  const base = getBaseUrl();
                  const deleteUrl = base
                    ? `${base.replace(/\/$/, '')}/files/${item.id}`
                    : `/api/files/${item.id}`;
                  try {
                    setDeletingId(item.id);
                    const res = await fetch(deleteUrl, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Xóa thất bại');
                    await fetchFiles();
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                  } finally {
                    setDeletingId(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  cursor: deletingId === item.id ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
                title="Xóa ảnh"
              >
                ×
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedForProcess(item.id);
                  setProcessResult(null);
                  setProcessError(null);
                }}
                style={{
                  position: 'absolute',
                  bottom: '0.25rem',
                  right: '0.25rem',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Xử lý ảnh (resize, đổi format)"
              >
                Xử lý
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedForProcess != null && items.some((i) => i.id === selectedForProcess) && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
          }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>
            Xử lý ảnh — resize, đổi định dạng, nén
          </h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const base = getBaseUrl();
              const url = base
                ? `${base.replace(/\/$/, '')}/files/${selectedForProcess}/process`
                : `/api/files/${selectedForProcess}/process`;
              setProcessLoading(true);
              setProcessError(null);
              setProcessResult(null);
              try {
                const w = processWidth.trim() ? parseInt(processWidth, 10) : undefined;
                const h = processHeight.trim() ? parseInt(processHeight, 10) : undefined;
                const res = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    width: w && !Number.isNaN(w) ? w : undefined,
                    height: h && !Number.isNaN(h) ? h : undefined,
                    format: processFormat,
                    quality: processQuality,
                  }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.message || data.error || `Lỗi ${res.status}`);
                if (!data.url) throw new Error('Không nhận được URL ảnh');
                setProcessResult({ url: data.url });
              } catch (err) {
                setProcessError(err instanceof Error ? err.message : 'Xử lý thất bại');
              } finally {
                setProcessLoading(false);
              }
            }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              Rộng (px)
              <input
                type="number"
                min={1}
                max={4000}
                value={processWidth}
                onChange={(e) => setProcessWidth(e.target.value)}
                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d1d5db', width: '5rem' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              Cao (px)
              <input
                type="number"
                min={1}
                max={4000}
                value={processHeight}
                onChange={(e) => setProcessHeight(e.target.value)}
                placeholder="Tự động"
                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d1d5db', width: '5rem' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              Định dạng
              <select
                value={processFormat}
                onChange={(e) => setProcessFormat(e.target.value as 'webp' | 'jpeg' | 'png')}
                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d1d5db' }}
              >
                <option value="webp">WebP</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              Chất lượng (1–100)
              <input
                type="number"
                min={1}
                max={100}
                value={processQuality}
                onChange={(e) => setProcessQuality(Number(e.target.value))}
                style={{ padding: '0.4rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d1d5db', width: '4rem' }}
              />
            </label>
            <button
              type="submit"
              disabled={processLoading}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: processLoading ? '#94a3b8' : '#6366f1',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: processLoading ? 'wait' : 'pointer',
              }}
            >
              {processLoading ? 'Đang xử lý...' : 'Tạo bản xử lý'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedForProcess(null);
                setProcessResult(null);
                setProcessError(null);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                background: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </form>
          {processError && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#b91c1c' }}>{processError}</p>
          )}
          {processResult && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Kết quả:</p>
              {(() => {
                const base = getBaseUrl().replace(/\/$/, '');
                const fullUrl = processResult.url.startsWith('http') ? processResult.url : (base ? base + processResult.url : processResult.url);
                return (
                  <>
                    <img
                      src={fullUrl}
                      alt="Đã xử lý"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 280,
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        display: 'block',
                      }}
                    />
                    <a
                      href={fullUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.4rem',
                        background: '#0f766e',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      Tải xuống ảnh đã xử lý
                    </a>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

type EmailTestProps = { apiBaseUrl?: string };

const EmailTestForm: React.FC<EmailTestProps> = ({ apiBaseUrl }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test email từ backend');
  const [text, setText] = useState('Nội dung test từ FE.');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const getBaseUrl = () => {
    const envBase = import.meta.env.VITE_API_URL ?? '';
    return apiBaseUrl ?? envBase;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const base = getBaseUrl();
    const url = base ? `${base.replace(/\/$/, '')}/email/send-test` : '/api/email/send-test';

    setStatus('sending');
    setMessage(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to.trim(), subject: subject.trim() || undefined, text: text.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      setStatus('success');
      setMessage('Email đã gửi thành công.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Gửi email thất bại.');
    }
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1rem',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#ffffff',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
        Gửi email test (SES IAM)
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          Email người nhận <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
          }}
        />
        <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Tiêu đề</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Test email từ backend"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
          }}
        />
        <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Nội dung</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nội dung email..."
          rows={3}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
            resize: 'vertical',
          }}
        />
        {message && (
          <div
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: '0.4rem',
              fontSize: '0.8rem',
              color: status === 'error' ? '#b91c1c' : '#166534',
              backgroundColor:
                status === 'error' ? 'rgba(254,226,226,0.8)' : 'rgba(220,252,231,0.8)',
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            padding: '0.6rem 0.8rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: status === 'sending' ? '#9ca3af' : '#2563eb',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: status === 'sending' ? 'wait' : 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {status === 'sending' ? 'Đang gửi...' : 'Gửi email test'}
        </button>
      </form>
    </div>
  );
};

/**
 * Component App đơn giản dùng lại `S3ImageUploader`
 * để có thể chạy dev như một SPA nhỏ,
 * đồng thời export `S3ImageUploader` như một "library component".
 */
const App: React.FC = () => {
  const [reloadKey, setReloadKey] = useState(0);
  const apiBase = import.meta.env.VITE_API_URL ?? '';

  const handleUploaded = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.25rem',
              color: '#111827',
            }}
          >
            Web xử lý ảnh
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>
            Upload ảnh, resize theo kích thước, đổi định dạng (WebP, JPEG, PNG) và nén chất lượng. Ảnh lưu trên S3, xử lý bằng Sharp trên server.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)',
            gap: '1rem',
          }}
        >
          <S3ImageUploader apiBaseUrl={apiBase || undefined} onUploaded={handleUploaded} />
          <FileManager apiBaseUrl={apiBase || undefined} reloadKey={reloadKey} />
        </div>

        <details style={{ marginTop: '0.5rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#6b7280' }}>
            Công cụ khác — Gửi email test (SES)
          </summary>
          <div style={{ marginTop: '0.5rem' }}>
            <EmailTestForm apiBaseUrl={apiBase || undefined} />
          </div>
        </details>
      </div>
    </div>
  );
};

export default App;


