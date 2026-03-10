import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

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
        className="relative inline-flex items-center justify-center self-start -mt-0.5 shrink-0"
        aria-label={title}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
      >
        <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full border border-zinc-500 text-zinc-500 text-[8px] font-semibold cursor-default">
          i
        </span>
      </span>
      {visible &&
        createPortal(
          <span
            className="fixed block w-[220px] box-border px-3 py-2 bg-zinc-900 text-zinc-50 text-xs leading-normal text-left whitespace-normal break-normal rounded-lg border border-zinc-700 shadow-[0_8px_24px_rgba(0,0,0,0.5)] pointer-events-none transition-opacity duration-150 z-[2147483647]"
            style={{
              left: pos.left,
              top: pos.top,
              transform: 'translateY(-50%)',
            }}
          >
            {title}
          </span>,
          document.body,
        )}
    </>
  );
}
