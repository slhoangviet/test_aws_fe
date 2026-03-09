import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-start',
  marginTop: -2,
  flexShrink: 0,
};

const iconStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 10,
  height: 10,
  borderRadius: '50%',
  border: '1px solid #71717a',
  color: '#71717a',
  fontSize: 8,
  fontWeight: 600,
  cursor: 'default',
};

const tooltipBaseStyle: React.CSSProperties = {
  position: 'fixed',
  display: 'block',
  width: 220,
  boxSizing: 'border-box',
  padding: '8px 12px',
  background: '#18181b',
  color: '#fafafa',
  fontSize: 12,
  lineHeight: 1.5,
  textAlign: 'left',
  whiteSpace: 'normal',
  wordBreak: 'normal',
  overflowWrap: 'break-word',
  borderRadius: 8,
  border: '1px solid #3f3f46',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  pointerEvents: 'none',
  transition: 'opacity 0.15s',
  zIndex: 2147483647,
};

export function InfoIcon({ title }: { title: string }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setPos({ left: rect.right + 8, top: rect.top + rect.height / 2 });
    }
    setVisible(true);
  };

  return (
    <>
      <span
        ref={iconRef}
        style={wrapperStyle}
        aria-label={title}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
      >
        <span style={iconStyle}>i</span>
      </span>
      {visible &&
        createPortal(
          <span
            style={{
              ...tooltipBaseStyle,
              left: pos.left,
              top: pos.top,
              transform: 'translateY(-50%)',
              opacity: 1,
            }}
          >
            {title}
          </span>,
          document.body,
        )}
    </>
  );
}
