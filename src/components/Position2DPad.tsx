import React, { useRef, useState, useEffect } from 'react';
import { Move, Crosshair } from 'lucide-react';
import { Language } from '../utils/i18n';

interface Position2DPadProps {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
  label?: string;
  language?: Language;
  color?: string; // e.g. '#f43f5e' for rose, '#06b6d4' for cyan, '#a855f7' for purple
  className?: string;
}

export const Position2DPad: React.FC<Position2DPadProps> = ({
  x,
  y,
  onChange,
  label,
  language = 'vi',
  color = '#f43f5e',
  className = '',
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isVi = language === 'vi';

  const updateCoordinates = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const pctX = Math.round((clampedX / rect.width) * 100);
    const pctY = Math.round((clampedY / rect.height) * 100);
    onChange(pctX, pctY);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateCoordinates(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      updateCoordinates(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const snapPresets = [
    { label: isVi ? '↖ Trên-Trái' : '↖ Top-Left', x: 10, y: 15 },
    { label: isVi ? '↑ Trên-Giữa' : '↑ Top-Mid', x: 50, y: 18 },
    { label: isVi ? '↗ Trên-Phải' : '↗ Top-Right', x: 90, y: 15 },
    { label: isVi ? '⦿ Chính Giữa' : '⦿ Center', x: 50, y: 50 },
    { label: isVi ? '↓ Dưới-Giữa' : '↓ Bot-Mid', x: 50, y: 75 },
    { label: isVi ? '↘ Dưới-Phải' : '↘ Bot-Right', x: 90, y: 85 },
  ];

  return (
    <div className={`p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800/90 space-y-2.5 ${className}`}>
      {/* Header with Title and Current X / Y */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
          <Move className="w-3.5 h-3.5" style={{ color }} />
          <span>{label || (isVi ? 'Bảng Kéo Thả Vị Trí 2D' : '2D Drag & Drop Position Pad')}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800" style={{ color }}>
          <span>X: {Math.round(x)}%</span>
          <span className="text-neutral-500">•</span>
          <span>Y: {Math.round(y)}%</span>
        </div>
      </div>

      {/* Interactive 2D Pad Box */}
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        className={`relative w-full h-32 rounded-xl border border-neutral-800/90 bg-gradient-to-b from-neutral-900/90 to-neutral-950 cursor-crosshair overflow-hidden touch-none select-none transition-shadow ${
          isDragging ? 'ring-2 shadow-lg shadow-black/60' : 'hover:border-neutral-700'
        }`}
        style={{ borderColor: isDragging ? color : undefined }}
      >
        {/* Subtle coordinate grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
          <div className="border-r border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-r border-b border-neutral-600" />
          <div className="border-b border-neutral-600" />
          <div className="border-r border-neutral-600" />
          <div className="border-r border-neutral-600" />
          <div className="border-r border-neutral-600" />
          <div />
        </div>

        {/* Center Crosshair Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-25">
          <Crosshair className="w-4 h-4 text-white" />
        </div>

        {/* Draggable Glowing Target Indicator */}
        <div
          style={{
            left: `${x}%`,
            top: `${y}%`,
            backgroundColor: color,
            boxShadow: `0 0 16px ${color}, 0 0 4px #ffffff`,
          }}
          className={`absolute w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white flex items-center justify-center transition-transform pointer-events-none ${
            isDragging ? 'scale-125' : 'hover:scale-110'
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400">
        <span>{isVi ? '✦ Bấm & kéo thả trực tiếp trên màn hình xem trước (Stage) hoặc trên bảng 2D này' : '✦ Drag directly on live preview stage or on this 2D pad'}</span>
      </div>

      {/* Snap Preset Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 pt-0.5">
        {snapPresets.map((sp, idx) => {
          const isSelected = Math.abs(x - sp.x) <= 3 && Math.abs(y - sp.y) <= 3;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(sp.x, sp.y)}
              className={`py-1 px-1 rounded-lg text-[9px] font-semibold border transition-all cursor-pointer text-center truncate ${
                isSelected
                  ? 'border-white/40 text-white font-bold shadow-sm'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
              style={{
                backgroundColor: isSelected ? `${color}33` : undefined,
                borderColor: isSelected ? color : undefined,
              }}
            >
              {sp.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Position2DPad;
