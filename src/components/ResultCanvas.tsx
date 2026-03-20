import { useEffect, useRef } from 'react';
import type { Detection } from '../lib/api';

interface ResultCanvasProps {
  imageUrl: string;
  detections: Detection[];
}

const LABEL_COLORS: Record<string, string> = {};
const COLOR_PALETTE = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1',
];
let colorIndex = 0;

function getLabelColor(label: string): string {
  if (!LABEL_COLORS[label]) {
    LABEL_COLORS[label] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length]!;
    colorIndex++;
  }
  return LABEL_COLORS[label]!;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ResultCanvas({ imageUrl, detections }: ResultCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const scale = Math.min(1, 800 / Math.max(img.naturalWidth, img.naturalHeight));
      const fontSize = Math.max(12, Math.round(14 / scale));
      const lineWidth = Math.max(2, Math.round(2 / scale));

      for (const det of detections) {
        const { x1, y1, x2, y2 } = det.bbox;
        const w = x2 - x1;
        const h = y2 - y1;
        const color = getLabelColor(det.label);
        const confidencePct = Math.round(det.confidence * 100);
        const labelText = `${det.label} ${confidencePct}%`;

        ctx.fillStyle = hexToRgba(color, 0.12);
        ctx.fillRect(x1, y1, w, h);

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x1, y1, w, h);

        ctx.font = `bold ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        const padding = Math.round(4 / scale);

        const labelX = x1;
        const labelY = y1 - textHeight - padding * 2;
        const bgY = labelY < 0 ? y1 : labelY;

        ctx.fillStyle = color;
        ctx.fillRect(labelX, bgY, textWidth + padding * 2, textHeight + padding * 2);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(labelText, labelX + padding, bgY + textHeight + padding * 0.5);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, detections]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
      <p className="text-sm text-gray-500 px-4 py-2 bg-gray-900 border-b border-gray-700">
        탐지 결과 ({detections.length}개)
      </p>
      <div className="overflow-auto">
        <canvas
          ref={canvasRef}
          className="w-full object-contain"
          style={{ maxHeight: '60vh' }}
          role="img"
          aria-label={`탐지 결과 이미지, ${detections.length}개 항목`}
        />
      </div>
    </div>
  );
}
