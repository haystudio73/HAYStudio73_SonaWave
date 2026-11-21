import React, { useState, useEffect, useRef } from 'react';
import {
  OverlayLayerItem,
  OverlayBlendMode,
  OverlayLayerFitMode,
  OverlayMediaType,
  OverlayAnchorPoint,
  OverlayScrollDirection,
  OverlayMaskShape,
  OverlayMaskBlendStyle,
  MAX_OVERLAY_LAYERS,
} from '../types';
import { Language } from '../utils/i18n';
import {
  Layers,
  Image as ImageIcon,
  Film,
  Eye,
  EyeOff,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Copy,
  RotateCcw,
  Upload,
  Sparkles,
  Crosshair,
  Repeat,
  Gauge,
  ChevronDown,
  ChevronUp,
  Infinity as InfinityIcon,
  Timer,
  Contrast,
} from 'lucide-react';

interface OverlayLayerTabProps {
  layers: OverlayLayerItem[];
  onChangeLayers: React.Dispatch<React.SetStateAction<OverlayLayerItem[]>>;
  language?: Language;
}

const BLEND_MODE_OPTIONS: Array<{
  id: OverlayBlendMode;
  labelVi: string;
  labelEn: string;
}> = [
  { id: 'normal', labelVi: 'Normal (Mặc định)', labelEn: 'Normal' },
  { id: 'light', labelVi: 'Light (Làm sáng)', labelEn: 'Light' },
  { id: 'dark', labelVi: 'Dark (Làm tối)', labelEn: 'Dark' },
  { id: 'reverse', labelVi: 'Reverse (Đảo ngược)', labelEn: 'Reverse' },
  { id: 'color-burn', labelVi: 'Colorburn (Cháy màu)', labelEn: 'Colorburn' },
  { id: 'overlay', labelVi: 'Overlay (Hòa trộn)', labelEn: 'Overlay' },
  { id: 'vivid', labelVi: 'Vivid (Rực rỡ)', labelEn: 'Vivid' },
  { id: 'screen', labelVi: 'Screen (Màn hình)', labelEn: 'Screen' },
  { id: 'multiply', labelVi: 'Multiply (Nhân lớp)', labelEn: 'Multiply' },
  { id: 'color-dodge', labelVi: 'Color Dodge (Chói sáng)', labelEn: 'Color Dodge' },
  { id: 'soft-light', labelVi: 'Soft Light (Ánh sáng dịu)', labelEn: 'Soft Light' },
  { id: 'hard-light', labelVi: 'Hard Light (Ánh sáng gắt)', labelEn: 'Hard Light' },
  { id: 'lighter', labelVi: 'Additive (Cộng sáng)', labelEn: 'Additive' },
  { id: 'exclusion', labelVi: 'Exclusion (Loại trừ)', labelEn: 'Exclusion' },
];

const FIT_MODE_OPTIONS: Array<{
  id: OverlayLayerFitMode;
  labelVi: string;
  labelEn: string;
}> = [
  { id: 'cover', labelVi: 'Phủ đầy khung (Cover)', labelEn: 'Fill Frame (Cover)' },
  { id: 'contain', labelVi: 'Vừa khung giữ tỷ lệ (Contain)', labelEn: 'Fit Inside (Contain)' },
  { id: 'original', labelVi: 'Kích thước gốc 1:1', labelEn: 'Original Size (1:1)' },
  { id: 'stretch', labelVi: 'Kéo giãn theo khung (Stretch)', labelEn: 'Stretch to Frame' },
];

const ANCHOR_POINTS: Array<{
  id: OverlayAnchorPoint;
  labelVi: string;
  labelEn: string;
  shortVi: string;
  shortEn: string;
}> = [
  { id: 'top-left', labelVi: 'Trái - Trên', labelEn: 'Top-Left', shortVi: '↖', shortEn: '↖' },
  { id: 'top-center', labelVi: 'Giữa - Trên', labelEn: 'Top-Center', shortVi: '↑', shortEn: '↑' },
  { id: 'top-right', labelVi: 'Phải - Trên', labelEn: 'Top-Right', shortVi: '↗', shortEn: '↗' },
  { id: 'center-left', labelVi: 'Trái - Giữa', labelEn: 'Center-Left', shortVi: '←', shortEn: '←' },
  { id: 'center', labelVi: 'Trung tâm (Giữa)', labelEn: 'Center', shortVi: '•', shortEn: '•' },
  { id: 'center-right', labelVi: 'Phải - Giữa', labelEn: 'Center-Right', shortVi: '→', shortEn: '→' },
  { id: 'bottom-left', labelVi: 'Trái - Dưới', labelEn: 'Bottom-Left', shortVi: '↙', shortEn: '↙' },
  { id: 'bottom-center', labelVi: 'Giữa - Dưới', labelEn: 'Bottom-Center', shortVi: '↓', shortEn: '↓' },
  { id: 'bottom-right', labelVi: 'Phải - Dưới', labelEn: 'Bottom-Right', shortVi: '↘', shortEn: '↘' },
];

const SCROLL_DIRECTIONS: Array<{
  id: OverlayScrollDirection;
  labelVi: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'left', labelVi: 'Sang Trái', labelEn: 'Left', icon: ArrowLeft },
  { id: 'right', labelVi: 'Sang Phải', labelEn: 'Right', icon: ArrowRight },
  { id: 'up', labelVi: 'Lên Trên', labelEn: 'Up', icon: ArrowUp },
  { id: 'down', labelVi: 'Xuống Dưới', labelEn: 'Down', icon: ArrowDown },
];

const MASK_SHAPES: Array<{
  id: OverlayMaskShape;
  labelVi: string;
  labelEn: string;
}> = [
  { id: 'none', labelVi: 'Không', labelEn: 'None' },
  { id: 'square', labelVi: 'Vuông', labelEn: 'Square' },
  { id: 'circle', labelVi: 'Tròn', labelEn: 'Circle' },
  { id: 'ellipse', labelVi: 'Elip', labelEn: 'Ellipse' },
  { id: 'triangle', labelVi: 'Tam giác', labelEn: 'Triangle' },
];

const MASK_BLEND_STYLES: Array<{
  id: OverlayMaskBlendStyle;
  labelVi: string;
  labelEn: string;
}> = [
  { id: 'solid', labelVi: 'Đặc (Không)', labelEn: 'Solid' },
  { id: 'linear', labelVi: 'Linear', labelEn: 'Linear' },
  { id: 'radial', labelVi: 'Radial', labelEn: 'Radial' },
  { id: 'angle', labelVi: 'Angle', labelEn: 'Angle' },
  { id: 'reflected', labelVi: 'Reflected', labelEn: 'Reflected' },
  { id: 'diamond', labelVi: 'Diamond', labelEn: 'Diamond' },
];

function renderMaskBlendSwatch(style: OverlayMaskBlendStyle) {
  switch (style) {
    case 'linear':
      return (
        <div
          className="w-6 h-6 rounded-[3px] border border-white/75"
          style={{ background: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)' }}
        />
      );
    case 'radial':
      return (
        <div
          className="w-6 h-6 rounded-[3px] border border-white/75"
          style={{ background: 'radial-gradient(circle, #ffffff 12%, #888888 58%, #000000 100%)' }}
        />
      );
    case 'angle':
      return (
        <div
          className="w-6 h-6 rounded-[3px] border border-white/75"
          style={{ background: 'conic-gradient(from 0deg, #ffffff 0deg, #888888 180deg, #000000 360deg)' }}
        />
      );
    case 'reflected':
      return (
        <div
          className="w-6 h-6 rounded-[3px] border border-white/75"
          style={{ background: 'linear-gradient(180deg, #000000 0%, #ffffff 50%, #000000 100%)' }}
        />
      );
    case 'diamond':
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 rounded-[3px] border border-white/75 bg-black">
          <defs>
            <radialGradient id="diamondSwatchGrad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="24" height="24" fill="#000000" />
          <path
            d="M12 1 L15.2 8.8 L23 12 L15.2 15.2 L12 23 L8.8 15.2 L1 12 L8.8 8.8 Z"
            fill="url(#diamondSwatchGrad)"
          />
          <circle cx="12" cy="12" r="4" fill="#ffffff" fillOpacity="0.85" />
        </svg>
      );
    case 'solid':
    default:
      return <div className="w-6 h-6 rounded-[3px] border border-white/75 bg-white/90" />;
  }
}

function renderMaskShapeIcon(shape: OverlayMaskShape) {
  switch (shape) {
    case 'square':
      return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
          <rect x="3.5" y="3.5" width="13" height="13" fill="currentColor" rx="1" />
        </svg>
      );
    case 'circle':
      return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
          <circle cx="10" cy="10" r="6.8" fill="currentColor" />
        </svg>
      );
    case 'ellipse':
      return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
          <ellipse cx="10" cy="10" rx="8" ry="5.2" fill="currentColor" />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
          <polygon points="10,3 17.5,16.5 2.5,16.5" fill="currentColor" />
        </svg>
      );
    case 'none':
    default:
      return (
        <svg viewBox="0 0 20 20" className="w-4 h-4">
          <rect x="3" y="3" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 2" rx="1.5" />
        </svg>
      );
  }
}

function formatDuration(sec?: number): string {
  if (!sec || !Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const OverlayLayerTab: React.FC<OverlayLayerTabProps> = ({
  layers,
  onChangeLayers,
  language = 'vi',
}) => {
  const isVi = language === 'vi';
  const [expandedLayerIds, setExpandedLayerIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (layers.length > 0) {
      initial[layers[0].id] = true;
    }
    return initial;
  });

  const addImageInputRef = useRef<HTMLInputElement>(null);
  const addVideoInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const replaceVideoInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetLayerIdRef = useRef<string | null>(null);

  useEffect(() => {
    setExpandedLayerIds((prev) => {
      const validIds = new Set(layers.map((l) => l.id));
      const keys = Object.keys(prev);
      const hasStale = keys.some((k) => !validIds.has(k));
      if (!hasStale) return prev;
      const next: Record<string, boolean> = {};
      for (const k of keys) {
        if (validIds.has(k)) next[k] = prev[k];
      }
      return next;
    });
  }, [layers]);

  const canAddMore = layers.length < MAX_OVERLAY_LAYERS;

  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayerIds((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const anyExpanded = layers.some((l) => !!expandedLayerIds[l.id]);
  const toggleExpandAll = () => {
    const targetState = !anyExpanded;
    const next: Record<string, boolean> = {};
    for (const l of layers) {
      next[l.id] = targetState;
    }
    setExpandedLayerIds(next);
  };

  const readFileUrl = (file: File, mediaType: OverlayMediaType): Promise<{ url: string; duration?: number }> => {
    return new Promise((resolve) => {
      if (mediaType === 'image' && file.size <= 1.5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          resolve({ url: result || URL.createObjectURL(file) });
        };
        reader.onerror = () => resolve({ url: URL.createObjectURL(file) });
        reader.readAsDataURL(file);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      if (mediaType === 'video') {
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.src = objectUrl;
        const done = (dur?: number) => {
          probe.onloadedmetadata = null;
          probe.onerror = null;
          resolve({ url: objectUrl, duration: dur });
        };
        probe.onloadedmetadata = () => {
          done(Number.isFinite(probe.duration) ? probe.duration : undefined);
        };
        probe.onerror = () => done(undefined);
        setTimeout(() => done(undefined), 1500);
      } else {
        resolve({ url: objectUrl });
      }
    });
  };

  const handleAddMediaLayer = async (file: File, mediaType: OverlayMediaType) => {
    if (!canAddMore) return;
    const { url, duration } = await readFileUrl(file, mediaType);
    const cleanName = file.name.replace(/\.[^/.]+$/, '') || (mediaType === 'video' ? 'Video Layer' : 'Image Layer');
    const newId = `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newLayer: OverlayLayerItem = {
      id: newId,
      name: cleanName.slice(0, 36),
      type: mediaType,
      url,
      fileName: file.name,
      enabled: true,
      anchorPoint: 'top-left',
      x: 0,
      y: 0,
      scale: 100,
      fitMode: 'cover',
      opacity: 100,
      blendMode: 'normal',
      scrollEnabled: false,
      scrollDirection: 'left',
      scrollDuration: 10,
      maskShape: 'none',
      maskBlendStyle: 'solid',
      maskSize: 85,
      maskX: 50,
      maskY: 50,
      maskFeather: 0,
      maskAngle: 0,
      maskInvert: false,
      loop: true,
      playbackSpeed: 1.0,
      duration,
    };

    onChangeLayers((prev) => {
      if (prev.length >= MAX_OVERLAY_LAYERS) return prev;
      return [...prev, newLayer];
    });
    setExpandedLayerIds((prev) => ({ ...prev, [newId]: true }));
  };

  const handleReplaceLayerMedia = async (layerId: string, file: File, mediaType: OverlayMediaType) => {
    const { url, duration } = await readFileUrl(file, mediaType);
    onChangeLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId
          ? {
              ...layer,
              type: mediaType,
              url,
              fileName: file.name,
              duration,
            }
          : layer
      )
    );
  };

  const updateLayer = (layerId: string, patch: Partial<OverlayLayerItem>) => {
    onChangeLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, ...patch } : l))
    );
  };

  const handleDeleteLayer = (layerId: string) => {
    onChangeLayers((prev) => prev.filter((l) => l.id !== layerId));
  };

  const handleMoveLayer = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= layers.length) return;
    onChangeLayers((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const handleDuplicateLayer = (layer: OverlayLayerItem) => {
    if (!canAddMore) return;
    const copyId = `overlay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const copy: OverlayLayerItem = {
      ...layer,
      id: copyId,
      name: `${layer.name} (Copy)`.slice(0, 40),
    };
    onChangeLayers((prev) => {
      if (prev.length >= MAX_OVERLAY_LAYERS) return prev;
      return [...prev, copy];
    });
    setExpandedLayerIds((prev) => ({ ...prev, [copyId]: true }));
  };

  const getBlendLabel = (mode: OverlayBlendMode) => {
    const found = BLEND_MODE_OPTIONS.find((m) => m.id === mode);
    if (!found) return mode;
    return isVi ? found.labelVi.split(' (')[0] : found.labelEn;
  };

  const getAnchorLabel = (anchor?: OverlayAnchorPoint) => {
    const found = ANCHOR_POINTS.find((a) => a.id === (anchor || 'top-left'));
    if (!found) return isVi ? 'Trái - Trên' : 'Top-Left';
    return isVi ? found.labelVi : found.labelEn;
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={addImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAddMediaLayer(file, 'image');
          e.target.value = '';
        }}
      />
      <input
        ref={addVideoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAddMediaLayer(file, 'video');
          e.target.value = '';
        }}
      />
      <input
        ref={replaceImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const targetId = replaceTargetLayerIdRef.current;
          if (file && targetId) handleReplaceLayerMedia(targetId, file, 'image');
          e.target.value = '';
        }}
      />
      <input
        ref={replaceVideoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const targetId = replaceTargetLayerIdRef.current;
          if (file && targetId) handleReplaceLayerMedia(targetId, file, 'video');
          e.target.value = '';
        }}
      />

      {/* Section Header + Upload Layer Buttons */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">
                {isVi ? 'Lớp Phủ Overlay (Trên Background)' : 'Overlay Layers (Above Background)'}
              </h3>
              <p className="text-[11px] text-neutral-400 truncate">
                {isVi
                  ? 'Tùy chỉnh điểm neo, hòa trộn & hiệu ứng Infinity Scrolling'
                  : 'Custom anchor point, blend modes & Infinity Scrolling'}
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums shrink-0 border ${
              canAddMore
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {layers.length} / {MAX_OVERLAY_LAYERS}
          </span>
        </div>

        {/* Add Layer Actions (Image or Video) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => addImageInputRef.current?.click()}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              canAddMore
                ? 'bg-teal-600/20 hover:bg-teal-600/30 text-teal-200 border-teal-500/40 cursor-pointer'
                : 'bg-neutral-800/50 text-neutral-500 border-neutral-800 cursor-not-allowed'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{isVi ? '+ Thêm Ảnh Layer' : '+ Upload Image'}</span>
          </button>

          <button
            type="button"
            disabled={!canAddMore}
            onClick={() => addVideoInputRef.current?.click()}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              canAddMore
                ? 'bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border-cyan-500/40 cursor-pointer'
                : 'bg-neutral-800/50 text-neutral-500 border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Film className="w-3.5 h-3.5 shrink-0" />
            <span>{isVi ? '+ Thêm Video Layer' : '+ Upload Video'}</span>
          </button>
        </div>

        {!canAddMore && (
          <p className="text-[11px] text-amber-300/90 text-center">
            {isVi
              ? `Đã đạt giới hạn tối đa ${MAX_OVERLAY_LAYERS} lớp Overlay. Xóa bớt lớp cũ nếu muốn thêm mới.`
              : `Maximum of ${MAX_OVERLAY_LAYERS} overlay layers reached. Remove a layer to add another.`}
          </p>
        )}
      </div>

      {/* Empty State */}
      {layers.length === 0 ? (
        <div className="p-6 rounded-2xl bg-neutral-900/40 border border-dashed border-neutral-800 text-center space-y-2">
          <Layers className="w-7 h-7 text-neutral-600 mx-auto" />
          <p className="text-xs font-medium text-neutral-300">
            {isVi ? 'Chưa có lớp Overlay nào' : 'No Overlay Layers yet'}
          </p>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
            {isVi
              ? 'Tải lên tối đa 6 ảnh hoặc video (khung viền PNG, bokeh, ánh sáng, texture...) để phủ trực tiếp lên trên Background với chế độ hòa trộn, điểm neo và cuộn vô tận.'
              : 'Upload up to 6 images or videos (PNG frames, bokeh, light leaks, textures) positioned right above your main Background with blend modes, anchor points, and infinity scrolling.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Layer Stack Toolbar */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {isVi ? 'Danh sách Layer (Dưới → Trên)' : 'Layer Stack (Bottom → Top)'}
            </span>
            {layers.length > 0 && (
              <button
                type="button"
                onClick={toggleExpandAll}
                className="text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
              >
                {anyExpanded
                  ? (isVi ? 'Thu gọn tất cả' : 'Collapse All')
                  : (isVi ? 'Mở rộng tất cả' : 'Expand All')}
              </button>
            )}
          </div>

          {/* Accordion Layer Cards */}
          <div className="space-y-2">
            {layers.map((layer, index) => {
              const isExpanded = !!expandedLayerIds[layer.id];
              return (
                <div
                  key={layer.id}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    isExpanded
                      ? 'bg-neutral-900/85 border-teal-500/50 shadow-md shadow-black/30'
                      : 'bg-neutral-900/55 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Layer Header Bar */}
                  <div
                    onClick={() => toggleLayerExpanded(layer.id)}
                    className={`flex items-center gap-2 p-2.5 cursor-pointer select-none ${
                      !layer.enabled ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Stack index badge */}
                    <span className="w-5 h-5 rounded-md bg-neutral-800 text-[10px] font-mono font-bold text-neutral-300 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Media Thumbnail */}
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                      {layer.type === 'image' ? (
                        <img
                          src={layer.url}
                          alt={layer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-cyan-950/50 text-cyan-300">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Layer Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {layer.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                            layer.type === 'video'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-teal-500/20 text-teal-300'
                          }`}
                        >
                          {layer.type === 'video' ? 'Video' : isVi ? 'Ảnh' : 'Image'}
                        </span>
                        {layer.scrollEnabled && (
                          <span
                            title={isVi ? 'Infinity Scrolling đang bật' : 'Infinity Scrolling Active'}
                            className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-300 shrink-0"
                          >
                            <InfinityIcon className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {((layer.maskShape && layer.maskShape !== 'none') ||
                          (layer.maskBlendStyle && layer.maskBlendStyle !== 'solid')) && (
                          <span
                            title={isVi ? 'Đang bật Mask' : 'Mask Active'}
                            className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-500/25 text-pink-300 shrink-0"
                          >
                            <Contrast className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1 tabular-nums truncate mt-0.5">
                        <span>{getBlendLabel(layer.blendMode)}</span>
                        <span>·</span>
                        <span>{layer.opacity}%</span>
                        <span>·</span>
                        <span>{getAnchorLabel(layer.anchorPoint)}</span>
                        <span>({layer.x}%, {layer.y}%)</span>
                      </div>
                    </div>

                    {/* Quick Layer Actions + Expand/Close Button */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveLayer(index, -1)}
                        title={isVi ? 'Đưa xuống dưới (gần nền hơn)' : 'Move down (closer to background)'}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === layers.length - 1}
                        onClick={() => handleMoveLayer(index, 1)}
                        title={isVi ? 'Đưa lên trên' : 'Move up'}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateLayer(layer.id, { enabled: !layer.enabled })}
                        title={layer.enabled ? (isVi ? 'Ẩn Layer' : 'Hide Layer') : (isVi ? 'Hiện Layer' : 'Show Layer')}
                        className={`p-1.5 rounded-lg cursor-pointer ${
                          layer.enabled
                            ? 'text-teal-400 hover:bg-neutral-800'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {layer.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      {canAddMore && (
                        <button
                          type="button"
                          onClick={() => handleDuplicateLayer(layer)}
                          title={isVi ? 'Nhân bản Layer' : 'Duplicate Layer'}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteLayer(layer.id)}
                        title={isVi ? 'Xóa Layer' : 'Delete Layer'}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Explicit Expand / Close Layer Settings Button */}
                      <button
                        type="button"
                        onClick={() => toggleLayerExpanded(layer.id)}
                        title={isExpanded ? (isVi ? 'Đóng cài đặt' : 'Close settings') : (isVi ? 'Mở cài đặt' : 'Expand settings')}
                        aria-label={isExpanded ? (isVi ? 'Đóng cài đặt' : 'Close settings') : (isVi ? 'Mở cài đặt' : 'Expand settings')}
                        aria-expanded={isExpanded}
                        className={`ml-0.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          isExpanded
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30'
                            : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/70 hover:text-white hover:bg-neutral-700'
                        }`}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Layer Settings Body */}
                  {isExpanded && (
                    <div className="border-t border-neutral-800/90 p-3.5 space-y-4 bg-neutral-950/45">
                      {/* Layer Identity & Media Swap */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={layer.enabled}
                              onChange={(e) => updateLayer(layer.id, { enabled: e.target.checked })}
                              className="rounded accent-teal-500 cursor-pointer"
                            />
                            <span>{isVi ? 'Hiển thị Layer này' : 'Layer Visible'}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => toggleLayerExpanded(layer.id)}
                            className="text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 cursor-pointer"
                          >
                            {isVi ? 'Đóng' : 'Close'}
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={layer.name}
                            onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                            placeholder={isVi ? 'Tên layer...' : 'Layer name...'}
                            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                          />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                replaceTargetLayerIdRef.current = layer.id;
                                replaceImageInputRef.current?.click();
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium border border-neutral-700 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{isVi ? 'Đổi Ảnh' : 'Replace Img'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                replaceTargetLayerIdRef.current = layer.id;
                                replaceVideoInputRef.current?.click();
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium border border-neutral-700 cursor-pointer"
                            >
                              <Film className="w-3 h-3" />
                              <span>{isVi ? 'Đổi Video' : 'Replace Vid'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Opacity (0 -> 100%) */}
                      <div className="space-y-1.5 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-300 font-medium">
                            {isVi ? 'Độ mờ (Opacity)' : 'Opacity'}
                          </span>
                          <span className="text-teal-400 font-mono font-semibold tabular-nums">
                            {layer.opacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={layer.opacity}
                          onChange={(e) => updateLayer(layer.id, { opacity: parseInt(e.target.value, 10) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[0, 25, 50, 75, 100].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => updateLayer(layer.id, { opacity: val })}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                                layer.opacity === val
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                                  : 'bg-neutral-900/70 text-neutral-400 border-neutral-800 hover:text-white'
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Blend Method */}
                      <div className="space-y-2 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            {isVi ? 'Chế độ hòa trộn (Blend Method)' : 'Blend Method'}
                          </span>
                          <span className="text-[11px] font-semibold text-teal-300">
                            {getBlendLabel(layer.blendMode)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {BLEND_MODE_OPTIONS.map((opt) => {
                            const isActive = layer.blendMode === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => updateLayer(layer.id, { blendMode: opt.id })}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border text-left truncate transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-teal-600/25 border-teal-500 text-teal-200 shadow-sm'
                                    : 'bg-neutral-900/70 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                                }`}
                                title={isVi ? opt.labelVi : opt.labelEn}
                              >
                                {isVi ? opt.labelVi.split(' (')[0] : opt.labelEn}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Anchor Point & Position / Scale */}
                      <div className="space-y-3 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Crosshair className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-xs font-medium text-neutral-200 truncate">
                              {isVi ? 'Điểm Neo (Anchor Point) & Vị trí' : 'Anchor Point & Position'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateLayer(layer.id, { x: 0, y: 0, scale: 100 })}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold border border-neutral-700 cursor-pointer shrink-0"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset (0, 0)</span>
                          </button>
                        </div>

                        {/* 9-Point Anchor Grid + Active Info */}
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800">
                          <div className="grid grid-cols-3 gap-1 shrink-0" role="radiogroup" aria-label="Anchor Point">
                            {ANCHOR_POINTS.map((pt) => {
                              const activeAnchor = (layer.anchorPoint || 'top-left') === pt.id;
                              return (
                                <button
                                  key={pt.id}
                                  type="button"
                                  onClick={() => updateLayer(layer.id, { anchorPoint: pt.id })}
                                  title={isVi ? pt.labelVi : pt.labelEn}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${
                                    activeAnchor
                                      ? 'bg-cyan-500 text-neutral-950 border-cyan-400 shadow-sm shadow-cyan-500/40'
                                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                                  }`}
                                >
                                  {isVi ? pt.shortVi : pt.shortEn}
                                </button>
                              );
                            })}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-[11px] font-semibold text-cyan-300 truncate">
                              {isVi ? 'Điểm neo hiện tại:' : 'Active Anchor:'} {getAnchorLabel(layer.anchorPoint)}
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-relaxed">
                              {isVi
                                ? 'Tại (0%, 0%), điểm neo của layer khớp đúng điểm neo tương ứng trên khung hình.'
                                : 'At (0%, 0%), the layer anchor aligns with the matching anchor point on the canvas.'}
                            </p>
                          </div>
                        </div>

                        {/* X Offset (%) */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">{isVi ? 'Vị trí X (Trái → Phải)' : 'Position X (Left → Right)'}</span>
                            <span className="text-cyan-400 font-mono tabular-nums">{layer.x}%</span>
                          </div>
                          <input
                            type="range"
                            min={-100}
                            max={100}
                            value={layer.x}
                            onChange={(e) => updateLayer(layer.id, { x: parseInt(e.target.value, 10) })}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>

                        {/* Y Offset (%) */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">{isVi ? 'Vị trí Y (Trên → Dưới)' : 'Position Y (Top → Bottom)'}</span>
                            <span className="text-cyan-400 font-mono tabular-nums">{layer.y}%</span>
                          </div>
                          <input
                            type="range"
                            min={-100}
                            max={100}
                            value={layer.y}
                            onChange={(e) => updateLayer(layer.id, { y: parseInt(e.target.value, 10) })}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>

                        {/* Scale (%) & Fit Mode */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neutral-400">{isVi ? 'Thu phóng (Scale)' : 'Scale'}</span>
                              <span className="text-teal-400 font-mono tabular-nums">{layer.scale ?? 100}%</span>
                            </div>
                            <input
                              type="range"
                              min={10}
                              max={300}
                              value={layer.scale ?? 100}
                              onChange={(e) => updateLayer(layer.id, { scale: parseInt(e.target.value, 10) })}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                            />
                          </div>

                          <div>
                            <span className="text-xs text-neutral-400 block mb-1">
                              {isVi ? 'Kiểu co giãn khung' : 'Fit / Sizing Mode'}
                            </span>
                            <select
                              value={layer.fitMode || 'cover'}
                              onChange={(e) => updateLayer(layer.id, { fitMode: e.target.value as OverlayLayerFitMode })}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                            >
                              {FIT_MODE_OPTIONS.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {isVi ? f.labelVi : f.labelEn}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Animation: Infinity Scrolling (On/Off, 4 Directions & Timing) */}
                      <div className="space-y-3 pt-2.5 border-t border-neutral-800/80">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <InfinityIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-xs font-semibold text-neutral-200 truncate">
                              {isVi ? 'Animation: Cuộn vô tận (Infinity Scrolling)' : 'Animation: Infinity Scrolling'}
                            </span>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!layer.scrollEnabled}
                            onClick={() => updateLayer(layer.id, { scrollEnabled: !layer.scrollEnabled })}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shrink-0 ${
                              layer.scrollEnabled
                                ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm shadow-indigo-500/30'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                            }`}
                          >
                            {layer.scrollEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>

                        {layer.scrollEnabled && (
                          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                            {/* 4 Directions */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-medium text-neutral-300 block">
                                {isVi ? 'Hướng cuộn (4 hướng)' : 'Scroll Direction'}
                              </span>
                              <div className="grid grid-cols-4 gap-1.5">
                                {SCROLL_DIRECTIONS.map((dir) => {
                                  const IconComp = dir.icon;
                                  const activeDir = (layer.scrollDirection || 'left') === dir.id;
                                  return (
                                    <button
                                      key={dir.id}
                                      type="button"
                                      onClick={() => updateLayer(layer.id, { scrollDirection: dir.id })}
                                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                                        activeDir
                                          ? 'bg-indigo-600/35 border-indigo-400 text-indigo-200'
                                          : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                                      }`}
                                    >
                                      <IconComp className="w-3.5 h-3.5" />
                                      <span>{isVi ? dir.labelVi : dir.labelEn}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Timing (Duration per Cycle) */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-300 font-medium flex items-center gap-1">
                                  <Timer className="w-3.5 h-3.5 text-indigo-400" />
                                  {isVi ? 'Thời gian 1 chu kỳ (Timing)' : 'Cycle Timing (Duration)'}
                                </span>
                                <span className="text-indigo-300 font-mono font-semibold tabular-nums">
                                  {(layer.scrollDuration ?? 10).toFixed(1)}s
                                </span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={60}
                                step={0.5}
                                value={layer.scrollDuration ?? 10}
                                onChange={(e) =>
                                  updateLayer(layer.id, { scrollDuration: parseFloat(e.target.value) })
                                }
                                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                {[3, 6, 10, 20, 40].map((sec) => (
                                  <button
                                    key={sec}
                                    type="button"
                                    onClick={() => updateLayer(layer.id, { scrollDuration: sec })}
                                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer ${
                                      (layer.scrollDuration ?? 10) === sec
                                        ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/50'
                                        : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-white'
                                    }`}
                                  >
                                    {sec}s
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-neutral-400">
                                {isVi
                                  ? 'Số giây càng nhỏ tốc độ cuộn càng nhanh (chạy đồng bộ theo nhạc & khi xuất video).'
                                  : 'Lower seconds = faster seamless loop (synced with playback & video export).'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mask & Gradient Mask Blending Style */}
                      {(() => {
                        const curMaskShape: OverlayMaskShape = layer.maskShape || 'none';
                        const curMaskBlend: OverlayMaskBlendStyle = layer.maskBlendStyle || 'solid';
                        const isMaskActive = curMaskShape !== 'none' || curMaskBlend !== 'solid';
                        return (
                          <div className="space-y-3 pt-2.5 border-t border-neutral-800/80">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Contrast className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                <span className="text-xs font-semibold text-neutral-200 truncate">
                                  {isVi ? 'Mặt nạ (Mask) & Kiểu hòa trộn Mask' : 'Mask Shape & Blending Style'}
                                </span>
                              </div>
                              {isMaskActive && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateLayer(layer.id, {
                                      maskShape: 'none',
                                      maskBlendStyle: 'solid',
                                      maskSize: 85,
                                      maskX: 50,
                                      maskY: 50,
                                      maskFeather: 0,
                                      maskAngle: 0,
                                      maskInvert: false,
                                    })
                                  }
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold border border-neutral-700 cursor-pointer shrink-0"
                                >
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  <span>{isVi ? 'Tắt Mask' : 'Reset'}</span>
                                </button>
                              )}
                            </div>

                            {/* Simple Mask Shapes: None, Square, Circle, Ellipse, Triangle */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-medium text-neutral-400 block">
                                {isVi ? 'Hình dạng Mask (Simple Mask)' : 'Mask Shape'}
                              </span>
                              <div className="grid grid-cols-5 gap-1.5">
                                {MASK_SHAPES.map((ms) => {
                                  const active = curMaskShape === ms.id;
                                  return (
                                    <button
                                      key={ms.id}
                                      type="button"
                                      onClick={() => updateLayer(layer.id, { maskShape: ms.id })}
                                      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                                        active
                                          ? 'bg-pink-500/20 border-pink-400 text-pink-200 shadow-sm'
                                          : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                                      }`}
                                    >
                                      {renderMaskShapeIcon(ms.id)}
                                      <span className="truncate max-w-full">
                                        {isVi ? ms.labelVi : ms.labelEn}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 5 Gradient Mask Blending Styles (matching uploaded reference) + Solid */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-medium text-neutral-400 block">
                                {isVi ? 'Kiểu chuyển sắc Mask (Mask Blending Style)' : 'Mask Blending Style'}
                              </span>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                                {MASK_BLEND_STYLES.map((bs) => {
                                  const active = curMaskBlend === bs.id;
                                  return (
                                    <button
                                      key={bs.id}
                                      type="button"
                                      onClick={() => updateLayer(layer.id, { maskBlendStyle: bs.id })}
                                      title={isVi ? bs.labelVi : bs.labelEn}
                                      className={`flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                                        active
                                          ? 'bg-neutral-800 border-pink-400 text-white shadow-sm ring-1 ring-pink-400/50'
                                          : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                                      }`}
                                    >
                                      {renderMaskBlendSwatch(bs.id)}
                                      <span className="truncate max-w-full">
                                        {isVi ? bs.labelVi.split(' (')[0] : bs.labelEn}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Mask Adjustment Sliders */}
                            {isMaskActive && (
                              <div className="p-3 rounded-xl bg-pink-950/15 border border-pink-500/25 space-y-2.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="text-neutral-300">{isVi ? 'Kích thước Mask' : 'Mask Size'}</span>
                                      <span className="text-pink-300 font-mono tabular-nums">{layer.maskSize ?? 85}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={10}
                                      max={150}
                                      value={layer.maskSize ?? 85}
                                      onChange={(e) =>
                                        updateLayer(layer.id, { maskSize: parseInt(e.target.value, 10) })
                                      }
                                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="text-neutral-300">{isVi ? 'Độ mềm viền (Feather)' : 'Edge Feather'}</span>
                                      <span className="text-pink-300 font-mono tabular-nums">{layer.maskFeather ?? 0}px</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={layer.maskFeather ?? 0}
                                      onChange={(e) =>
                                        updateLayer(layer.id, { maskFeather: parseInt(e.target.value, 10) })
                                      }
                                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="text-neutral-400">{isVi ? 'Tâm Mask X' : 'Mask Center X'}</span>
                                      <span className="text-pink-300 font-mono tabular-nums">{layer.maskX ?? 50}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={layer.maskX ?? 50}
                                      onChange={(e) =>
                                        updateLayer(layer.id, { maskX: parseInt(e.target.value, 10) })
                                      }
                                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                  </div>

                                  <div>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="text-neutral-400">{isVi ? 'Tâm Mask Y' : 'Mask Center Y'}</span>
                                      <span className="text-pink-300 font-mono tabular-nums">{layer.maskY ?? 50}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0}
                                      max={100}
                                      value={layer.maskY ?? 50}
                                      onChange={(e) =>
                                        updateLayer(layer.id, { maskY: parseInt(e.target.value, 10) })
                                      }
                                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-1">
                                  {curMaskBlend !== 'solid' && curMaskBlend !== 'radial' && (
                                    <div className="flex-1">
                                      <div className="flex justify-between text-[11px] mb-1">
                                        <span className="text-neutral-400">{isVi ? 'Góc xoay Gradient' : 'Gradient Angle'}</span>
                                        <span className="text-pink-300 font-mono tabular-nums">{layer.maskAngle ?? 0}°</span>
                                      </div>
                                      <input
                                        type="range"
                                        min={0}
                                        max={360}
                                        value={layer.maskAngle ?? 0}
                                        onChange={(e) =>
                                          updateLayer(layer.id, { maskAngle: parseInt(e.target.value, 10) })
                                        }
                                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                      />
                                    </div>
                                  )}

                                  <label className="flex items-center gap-1.5 text-[11px] text-neutral-300 cursor-pointer select-none shrink-0 pt-2">
                                    <input
                                      type="checkbox"
                                      checked={!!layer.maskInvert}
                                      onChange={(e) => updateLayer(layer.id, { maskInvert: e.target.checked })}
                                      className="rounded accent-pink-500 cursor-pointer"
                                    />
                                    <span>{isVi ? 'Đảo ngược Mask' : 'Invert Mask'}</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Video Specific Controls */}
                      {layer.type === 'video' && (
                        <div className="space-y-2.5 pt-2.5 border-t border-neutral-800/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-cyan-300 flex items-center gap-1.5">
                              <Film className="w-3.5 h-3.5" />
                              {isVi ? 'Thiết lập Video Layer' : 'Video Layer Playback'}
                            </span>
                            {layer.duration && (
                              <span className="text-[11px] font-mono text-neutral-400">
                                {formatDuration(layer.duration)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={layer.loop !== false}
                                onChange={(e) => updateLayer(layer.id, { loop: e.target.checked })}
                                className="rounded accent-cyan-500 cursor-pointer"
                              />
                              <Repeat className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{isVi ? 'Lặp lại liên tục' : 'Loop Video'}</span>
                            </label>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-neutral-400 flex items-center gap-1">
                                <Gauge className="w-3 h-3" />
                                {isVi ? 'Tốc độ phát' : 'Playback Speed'}
                              </span>
                              <span className="text-cyan-400 font-mono tabular-nums">
                                {(layer.playbackSpeed ?? 1.0).toFixed(2)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.25}
                              max={2.0}
                              step={0.05}
                              value={layer.playbackSpeed ?? 1.0}
                              onChange={(e) =>
                                updateLayer(layer.id, { playbackSpeed: parseFloat(e.target.value) })
                              }
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
