import React, { useCallback, useRef } from 'react';
import { editorStyles } from './editorStyles';

type SliderControlProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function SliderControl({
  label,
  value,
  onChange,
  min = -1,
  max = 1,
  step = 0.01,
}: SliderControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFromPosition = useCallback(
    (clientX: number) => {
      const el = inputRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      let v = min + x * (max - min);
      if (step > 0) v = Math.round(v / step) * step;
      v = Math.max(min, Math.min(max, v));
      onChange(v);
    },
    [min, max, step, onChange],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLInputElement).setPointerCapture(e.pointerId);
      updateFromPosition(e.clientX);
    },
    [updateFromPosition],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons !== 1) return;
      updateFromPosition(e.clientX);
    },
    [updateFromPosition],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={editorStyles.sliderRow}>
        <span style={editorStyles.sliderLabel}>{label}</span>
        <span style={editorStyles.sliderValue}>{Math.round(value * 100)}</span>
      </div>
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInput}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        style={{ ...editorStyles.slider, width: '100%' }}
      />
    </div>
  );
}

