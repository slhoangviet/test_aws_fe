import React, { useState } from 'react';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

function App() {
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

      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const uploadUrl = apiBase ? `${apiBase.replace(/\/$/, '')}/upload` : '/api/upload';
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Upload failed with status ${response.status}`);
      }

      const data: { success: boolean; url: string } = await response.json();

      if (data.success && data.url) {
        setImageUrl(data.url);
        setStatus('success');
        setMessage('Upload thành công!');
      } else {
        throw new Error('Phản hồi không hợp lệ từ server');
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        background:
          'radial-gradient(circle at top left, rgba(99,102,241,0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(56,189,248,0.12), transparent 55%)',
      }}
    >
      <div
        style={{
          padding: '2rem 2.5rem',
          borderRadius: '1.25rem',
          boxShadow: '0 18px 45px rgba(15,23,42,0.18)',
          background: 'white',
          width: '100%',
          maxWidth: 520,
        }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            marginBottom: '0.25rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          Upload ảnh lên S3
        </h1>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.95rem' }}>
          Chọn 1 file ảnh, gửi lên backend NestJS, backend sẽ upload lên AWS S3 và trả lại
          URL public để hiển thị bên dưới.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="file-input"
            style={{
              display: 'block',
              padding: '0.85rem 1rem',
              borderRadius: '0.75rem',
              border: '1px dashed #cbd5f5',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontWeight: 600, color: '#111827' }}>
              Chọn ảnh từ máy tính
            </span>
            <br />
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              JPG, PNG, WEBP, tối đa 5MB
            </span>
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
                fontSize: '0.85rem',
                color: '#374151',
                marginBottom: '0.75rem',
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
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                marginBottom: '0.75rem',
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
              padding: '0.8rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background:
                status === 'uploading'
                  ? 'linear-gradient(to right, #9ca3af, #6b7280)'
                  : 'linear-gradient(to right, #4f46e5, #0ea5e9)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: status === 'uploading' ? 'wait' : 'pointer',
              transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              boxShadow:
                status === 'uploading'
                  ? '0 0 0 rgba(0,0,0,0)'
                  : '0 10px 25px rgba(37,99,235,0.35)',
            }}
          >
            {status === 'uploading' ? 'Đang upload...' : 'Upload lên S3'}
          </button>
        </form>

        {imageUrl && (
          <div
            style={{
              marginTop: '1.75rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1.25rem',
            }}
          >
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: '#111827',
              }}
            >
              Ảnh đã upload
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  maxHeight: 320,
                }}
              >
                <img
                  src={imageUrl}
                  alt="Uploaded to S3"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: '#4b5563',
                  wordBreak: 'break-all',
                  backgroundColor: '#f3f4f6',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                }}
              >
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

