'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

export type PixiEditorViewProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  displayUrl: string | null;
  imgSize: { w: number; h: number } | null;
  crop: { left: number; top: number; w: number; h: number };
  outputWidth?: number;
  outputHeight?: number;
  rotation?: 0 | 90 | 180 | 270;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  highlights: number;
  shadows: number;
  whites: number;
  cropMode: boolean;
  onDisplaySize?: (w: number, h: number) => void;
  onImgSizeDetected?: (w: number, h: number) => void;
  previewKey?: string;
};

export function PixiEditorView({
  containerRef,
  displayUrl,
  imgSize: imgSizeProp,
  crop,
  outputWidth,
  outputHeight,
  rotation = 0,
  brightness,
  contrast,
  saturation,
  temperature,
  tint,
  highlights,
  shadows,
  whites,
  cropMode,
  onDisplaySize,
  onImgSizeDetected,
  previewKey = '',
}: PixiEditorViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [localImgSize, setLocalImgSize] = useState<{ w: number; h: number } | null>(null);

  const imgSize = imgSizeProp ?? localImgSize;

  // Store ALL mutable props in a ref so draw() always reads fresh values
  const propsRef = useRef({
    crop, outputWidth, outputHeight, rotation, brightness, contrast, saturation,
    temperature, tint, highlights, shadows, whites,
    cropMode, onDisplaySize, imgSize,
  });
  propsRef.current = {
    crop, outputWidth, outputHeight, rotation, brightness, contrast, saturation,
    temperature, tint, highlights, shadows, whites,
    cropMode, onDisplaySize, imgSize,
  };

  // Load image - try with crossOrigin first, fallback without
  useEffect(() => {
    if (!displayUrl) {
      imgElRef.current = null;
      setImgLoaded(false);
      setLocalImgSize(null);
      return;
    }

    let cancelled = false;

    const tryLoad = (useCors: boolean) => {
      const img = new Image();
      if (useCors) img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelled) return;
        imgElRef.current = img;
        const size = { w: img.naturalWidth, h: img.naturalHeight };
        setLocalImgSize(size);
        setImgLoaded(true);
        onImgSizeDetected?.(size.w, size.h);
      };
      img.onerror = () => {
        if (cancelled) return;
        if (useCors) {
          tryLoad(false);
        } else {
          imgElRef.current = null;
          setImgLoaded(false);
        }
      };
      img.src = displayUrl;
    };

    tryLoad(true);

    return () => {
      cancelled = true;
    };
  }, [displayUrl, onImgSizeDetected]);

  // Create / mount canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      canvas.style.borderRadius = '4px';
      canvasRef.current = canvas;
    }
    if (!container.contains(canvas)) {
      container.insertBefore(canvas, container.firstChild);
    }
    return () => {
      if (canvas && container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [containerRef, cropMode]);

  // Draw function - reads all mutable values from propsRef (never stale)
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgElRef.current;
    const container = containerRef.current;
    const p = propsRef.current;
    const { imgSize: is } = p;
    if (!canvas || !img || !container || !is) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const contW = container.clientWidth || 1;
    const contH = container.clientHeight || 1;
    const imgW = is.w;
    const imgH = is.h;

    let srcX: number, srcY: number, srcW: number, srcH: number;
    let destW: number, destH: number;

    if (p.cropMode) {
      srcX = 0; srcY = 0; srcW = imgW; srcH = imgH;
      destW = imgW; destH = imgH;
    } else {
      srcX = p.crop.left; srcY = p.crop.top; srcW = p.crop.w; srcH = p.crop.h;
      destW = srcW; destH = srcH;
      if (p.outputWidth && p.outputWidth > 0 && p.outputHeight && p.outputHeight > 0) {
        destW = p.outputWidth; destH = p.outputHeight;
      } else if (p.outputWidth && p.outputWidth > 0) {
        destW = p.outputWidth; destH = Math.round((p.outputWidth * srcH) / srcW);
      } else if (p.outputHeight && p.outputHeight > 0) {
        destH = p.outputHeight; destW = Math.round((p.outputHeight * srcW) / srcH);
      }
      if (p.rotation === 90 || p.rotation === 270) {
        [destW, destH] = [destH, destW];
      }
    }

    const scale = Math.min(contW / destW, contH / destH, 1);
    const drawW = Math.round(destW * scale);
    const drawH = Math.round(destH * scale);
    if (drawW <= 0 || drawH <= 0) return;

    // Khi xoay 90°/270°, canvas cần swap kích thước để chứa nội dung đã xoay
    const rot90 = !p.cropMode && (p.rotation === 90 || p.rotation === 270);
    const viewW = rot90 ? drawH : drawW;
    const viewH = rot90 ? drawW : drawH;

    if (p.cropMode && p.onDisplaySize) p.onDisplaySize(viewW, viewH);

    canvas.width = viewW;
    canvas.height = viewH;
    canvas.style.width = viewW + 'px';
    canvas.style.height = viewH + 'px';

    // Basic adjustments via CSS filter
    ctx.filter = `brightness(${p.brightness}) contrast(${p.contrast}) saturate(${p.saturation})`;

    ctx.clearRect(0, 0, viewW, viewH);
    if (p.rotation && !p.cropMode) {
      ctx.save();
      ctx.translate(viewW / 2, viewH / 2);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.translate(-drawW / 2, -drawH / 2);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, drawW, drawH);
      ctx.restore();
    } else {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, viewW, viewH);
    }
    ctx.filter = 'none';

    // Temperature overlay (warm = orange, cool = blue)
    if (p.temperature !== 0) {
      ctx.globalCompositeOperation = 'overlay';
      const tempAlpha = Math.abs(p.temperature) * 0.15;
      ctx.fillStyle = p.temperature > 0
        ? `rgba(255, 140, 0, ${tempAlpha})`
        : `rgba(0, 100, 255, ${tempAlpha})`;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Tint overlay (positive = magenta, negative = green)
    if (p.tint !== 0) {
      ctx.globalCompositeOperation = 'overlay';
      const tintAlpha = Math.abs(p.tint) * 0.12;
      ctx.fillStyle = p.tint > 0
        ? `rgba(200, 50, 200, ${tintAlpha})`
        : `rgba(50, 200, 50, ${tintAlpha})`;
      ctx.fillRect(0, 0, viewW, viewH);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Highlights / Shadows / Whites via pixel manipulation
    if (p.highlights !== 0 || p.shadows !== 0 || p.whites !== 0) {
      try {
        const imageData = ctx.getImageData(0, 0, viewW, viewH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          let adj = 0;
          if (p.highlights !== 0 && lum > 0.6) {
            adj += p.highlights * (lum - 0.6) * 2.5 * 40;
          }
          if (p.shadows !== 0 && lum < 0.4) {
            adj += p.shadows * (0.4 - lum) * 2.5 * 40;
          }
          if (p.whites !== 0 && lum > 0.8) {
            adj += p.whites * (lum - 0.8) * 5 * 40;
          }

          if (adj !== 0) {
            data[i] = Math.max(0, Math.min(255, r + adj));
            data[i + 1] = Math.max(0, Math.min(255, g + adj));
            data[i + 2] = Math.max(0, Math.min(255, b + adj));
          }
        }
        ctx.putImageData(imageData, 0, 0);
      } catch {
        // getImageData may fail on tainted canvas (CORS)
      }
    }

    // Crop overlay
    if (p.cropMode) {
      const leftSc = (p.crop.left / imgW) * viewW;
      const topSc = (p.crop.top / imgH) * viewH;
      const wSc = (p.crop.w / imgW) * viewW;
      const hSc = (p.crop.h / imgH) * viewH;

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, viewW, topSc);
      ctx.fillRect(0, topSc, leftSc, hSc);
      ctx.fillRect(leftSc + wSc, topSc, viewW - leftSc - wSc, hSc);
      ctx.fillRect(0, topSc + hSc, viewW, viewH - topSc - hSc);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(leftSc, topSc, wSc, hSc);

      // Rule of thirds
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 2; i++) {
        const gx = leftSc + (wSc * i) / 3;
        const gy = topSc + (hSc * i) / 3;
        ctx.beginPath(); ctx.moveTo(gx, topSc); ctx.lineTo(gx, topSc + hSc); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(leftSc, gy); ctx.lineTo(leftSc + wSc, gy); ctx.stroke();
      }

      // Corner handles
      const hs = 8;
      ctx.fillStyle = '#ffffff';
      for (const [cx, cy] of [
        [leftSc, topSc], [leftSc + wSc, topSc],
        [leftSc, topSc + hSc], [leftSc + wSc, topSc + hSc],
      ]) {
        ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
      }
      // Edge handles
      for (const [cx, cy] of [
        [leftSc + wSc / 2, topSc], [leftSc + wSc / 2, topSc + hSc],
        [leftSc, topSc + hSc / 2], [leftSc + wSc, topSc + hSc / 2],
      ]) {
        ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
      }
    }
  }, [containerRef]);

  // Redraw on any prop change - dùng RAF để tránh block main thread khi kéo slider
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    draw, previewKey, imgSize, imgLoaded,
    crop.left, crop.top, crop.w, crop.h,
    outputWidth, outputHeight, rotation,
    brightness, contrast, saturation,
    temperature, tint, highlights, shadows, whites,
    cropMode,
  ]);

  // ResizeObserver for container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw, containerRef]);

  return null;
}
