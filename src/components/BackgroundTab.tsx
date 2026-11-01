import React, { useRef, useState } from 'react';
import { 
  BackgroundConfig, 
  BackgroundMode, 
  BackgroundType, 
  BackgroundSlideItem, 
  SlideTransitionType,
  KenBurnsDirection,
  PlaylistConfig 
} from '../types';
import { BACKGROUND_PRESETS } from '../utils/presets';
import { Language } from '../utils/i18n';
import { 
  Image as ImageIcon, 
  Upload, 
  Video, 
  Palette, 
  Layers, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Maximize, 
  Sliders, 
  Check, 
  Clock, 
  MoveHorizontal, 
  Compass, 
  Zap, 
  Eye, 
  ListMusic, 
  RefreshCw,
  Play,
  Pause,
  Scissors,
  Music
} from 'lucide-react';

interface BackgroundTabProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  language?: Language;
  playlist?: PlaylistConfig;
  defaultBackground?: BackgroundConfig;
  onUpdateTrackBackground?: (trackId: string, bg: BackgroundConfig | undefined) => void;
  onApplyBackgroundToAllTracks?: (bg: BackgroundConfig) => void;
  onSelectTrackForPlayback?: (index: number) => void;
  currentDuration?: number;
}

const CATEGORIES = [
  { id: 'all', nameVi: 'Tất cả', nameEn: 'All' },
  { id: 'cyberpunk', nameVi: 'Cyberpunk', nameEn: 'Cyberpunk' },
  { id: 'lofi', nameVi: 'Lofi & Chill', nameEn: 'Lofi & Chill' },
  { id: 'space', nameVi: 'Vũ Trụ', nameEn: 'Deep Space' },
  { id: 'nature', nameVi: 'Thiên Nhiên', nameEn: 'Nature' },
  { id: 'abstract', nameVi: 'Nghệ Thuật', nameEn: 'Abstract Art' },
];

const TRANSITION_TYPES: { id: SlideTransitionType; nameVi: string; nameEn: string; iconDesc: string }[] = [
  { id: 'crossfade', nameVi: 'Crossfade (Hòa tan mượt mà)', nameEn: 'Crossfade (Smooth Dissolve)', iconDesc: 'Fade' },
  { id: 'fade-in-out', nameVi: 'Fade In / Out (Mờ qua nền tối)', nameEn: 'Fade In/Out (Dip to Black)', iconDesc: 'Dip' },
  { id: 'slide-left', nameVi: 'Trượt sang trái (Slide Left)', nameEn: 'Slide Left', iconDesc: '←' },
  { id: 'slide-right', nameVi: 'Trượt sang phải (Slide Right)', nameEn: 'Slide Right', iconDesc: '→' },
  { id: 'slide-up', nameVi: 'Trượt lên trên (Slide Up)', nameEn: 'Slide Up', iconDesc: '↑' },
  { id: 'slide-down', nameVi: 'Trượt xuống dưới (Slide Down)', nameEn: 'Slide Down', iconDesc: '↓' },
  { id: 'zoom-in', nameVi: 'Thu phóng vào trong (Zoom In)', nameEn: 'Zoom In', iconDesc: '🔍+' },
  { id: 'zoom-out', nameVi: 'Thu nhỏ ra ngoài (Zoom Out)', nameEn: 'Zoom Out', iconDesc: '🔍-' },
];

const KEN_BURNS_DIRECTIONS: { id: KenBurnsDirection; nameVi: string; nameEn: string }[] = [
  { id: 'auto', nameVi: 'Tự động ngẫu nhiên (Auto)', nameEn: 'Auto Organic' },
  { id: 'zoom-in', nameVi: 'Thu phóng vào giữa (Zoom In)', nameEn: 'Zoom In Center' },
  { id: 'zoom-out', nameVi: 'Thu phóng ra xa (Zoom Out)', nameEn: 'Zoom Out Center' },
  { id: 'pan-left', nameVi: 'Lướt sang trái (Pan Left)', nameEn: 'Pan Left' },
  { id: 'pan-right', nameVi: 'Lướt sang phải (Pan Right)', nameEn: 'Pan Right' },
  { id: 'pan-up', nameVi: 'Lướt lên trên (Pan Up)', nameEn: 'Pan Up' },
  { id: 'pan-down', nameVi: 'Lướt xuống dưới (Pan Down)', nameEn: 'Pan Down' },
  { id: 'diagonal-tl-br', nameVi: 'Chéo: Trái Trên → Phải Dưới', nameEn: 'Diagonal TL → BR' },
  { id: 'diagonal-tr-bl', nameVi: 'Chéo: Phải Trên → Trái Dưới', nameEn: 'Diagonal TR → BL' },
];

export const BackgroundTab: React.FC<BackgroundTabProps> = ({
  background,
  onBackgroundChange,
  language = 'vi',
  playlist,
  onApplyBackgroundToAllTracks,
  currentDuration = 30,
}) => {
  const isVi = language === 'vi';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const slideVideoInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [directUrlInput, setDirectUrlInput] = useState<string>('');
  const [activeSlidePickerId, setActiveSlidePickerId] = useState<string | null>(null);
  const [activeSlideVideoPickerId, setActiveSlideVideoPickerId] = useState<string | null>(null);
  const [playingSlideVideoId, setPlayingSlideVideoId] = useState<string | null>(null);

  // Batch Auto Settings Controls State
  const [batchTransition, setBatchTransition] = useState<SlideTransitionType>('crossfade');
  const [batchTransDuration, setBatchTransDuration] = useState<number>(1.2);

  // Calculate active song duration and total playlist duration
  const activeTrack = playlist?.tracks?.[playlist?.currentIndex ?? 0];
  const activeSongDuration = Math.round(currentDuration || activeTrack?.duration || 30);
  const totalPlaylistDuration = Math.round(
    playlist?.tracks && playlist.tracks.length > 0
      ? playlist.tracks.reduce((sum, t) => sum + (t.duration || 0), 0)
      : activeSongDuration
  );

  const update = (partial: Partial<BackgroundConfig>) => {
    onBackgroundChange({ ...background, ...partial });
  };

  const mode: BackgroundMode = background.mode || 'single';
  const slides: BackgroundSlideItem[] = background.slides && background.slides.length > 0
    ? background.slides
    : [
        {
          id: 'slide-1',
          name: 'Slide 1',
          type: 'preset',
          url: BACKGROUND_PRESETS[0].url,
          duration: 8,
          transitionType: 'crossfade',
          transitionDuration: 1.2,
          kenBurns: true,
        },
        {
          id: 'slide-2',
          name: 'Slide 2',
          type: 'preset',
          url: BACKGROUND_PRESETS[1]?.url || BACKGROUND_PRESETS[0].url,
          duration: 8,
          transitionType: 'crossfade',
          transitionDuration: 1.2,
          kenBurns: true,
        },
      ];

  const updateSlides = (newSlides: BackgroundSlideItem[]) => {
    const first = newSlides[0];
    update({
      slides: newSlides,
      ...(first && first.url ? { url: first.url } : {}),
    });
  };

  // Add new Slide
  const handleAddSlide = () => {
    const nextIdx = slides.length + 1;
    const presetItem = BACKGROUND_PRESETS[(nextIdx - 1) % BACKGROUND_PRESETS.length];
    const newSlide: BackgroundSlideItem = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `Slide ${nextIdx}`,
      type: 'preset',
      url: presetItem.url,
      duration: 10,
      transitionType: 'crossfade',
      transitionDuration: 1.2,
      kenBurns: true,
    };
    updateSlides([...slides, newSlide]);
  };

  // Delete Slide
  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return;
    updateSlides(slides.filter((s) => s.id !== id));
  };

  // Duplicate Slide
  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    const clone: BackgroundSlideItem = {
      ...target,
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${target.name || `Slide ${index + 1}`} (Copy)`,
    };
    const next = [...slides];
    next.splice(index + 1, 0, clone);
    updateSlides(next);
  };

  // Reorder Slide
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...slides];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    updateSlides(next);
  };

  // Update specific slide property
  const handleUpdateSlide = (id: string, partial: Partial<BackgroundSlideItem>) => {
    updateSlides(
      slides.map((s) => (s.id === id ? { ...s, ...partial } : s))
    );
  };

  // Sum previous slides duration up to lastIndex
  const sumPreviousSlidesDuration = (lastIndex: number) => {
    return slides.slice(0, lastIndex).reduce((sum, s) => sum + (s.duration || 0), 0);
  };

  // Auto-calculate last slide duration based on target total (Active Song or Playlist)
  const handleAutoCalcLastSlide = (targetTotal: number = activeSongDuration) => {
    if (slides.length === 0) return;
    const lastIdx = slides.length - 1;
    const prevSum = sumPreviousSlidesDuration(lastIdx);
    const calculated = Math.max(2, targetTotal - prevSum);
    handleUpdateSlide(slides[lastIdx].id, { duration: calculated });
  };

  // Batch Setting: Auto distribute duration evenly across all slides (Active Song or Playlist)
  const handleAutoDistributeAll = (targetTotal: number = activeSongDuration) => {
    if (slides.length === 0) return;
    const perSlide = Math.max(2, Math.round(targetTotal / slides.length));
    updateSlides(
      slides.map((s, idx) => ({
        ...s,
        duration: idx === slides.length - 1 
          ? Math.max(2, targetTotal - perSlide * (slides.length - 1))
          : perSlide,
      }))
    );
  };

  // Batch Setting: Apply transition to all slides
  const handleApplyBatchTransition = () => {
    updateSlides(
      slides.map((s) => ({
        ...s,
        transitionType: batchTransition,
        transitionDuration: batchTransDuration,
      }))
    );
  };

  // Batch Setting: Toggle Ken Burns on all
  const handleToggleKenBurnsAll = (enable: boolean) => {
    updateSlides(
      slides.map((s) => ({
        ...s,
        kenBurns: enable,
      }))
    );
  };

  // Single Background Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update({ type: 'upload', url, isVideo: false });
    }
  };

  // Single Background Video Upload Handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update({ type: 'video', isVideo: true, videoUrl: url, url });
    }
  };

  // Slide Image Upload Handler
  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlidePickerId) {
      const url = URL.createObjectURL(file);
      handleUpdateSlide(activeSlidePickerId, { type: 'upload', url, isVideo: false });
      setActiveSlidePickerId(null);
    }
    e.target.value = '';
  };

  // Slide Video MP4 Upload Handler (Extracts metadata duration & auto-fixes slide duration)
  const handleSlideVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlideVideoPickerId) {
      const targetId = activeSlideVideoPickerId;
      const url = URL.createObjectURL(file);

      // Create video element to inspect duration
      const tempVid = document.createElement('video');
      tempVid.preload = 'metadata';
      tempVid.src = url;

      let applied = false;
      const applyWithDuration = (rawDuration?: number) => {
        if (applied) return;
        applied = true;
        const vidDur = (rawDuration && Number.isFinite(rawDuration) && rawDuration > 0)
          ? Math.max(2, Math.round(rawDuration))
          : 8;

        handleUpdateSlide(targetId, {
          type: 'video',
          isVideo: true,
          videoUrl: url,
          url,
          videoDuration: vidDur,
          // User request: "Có thể tự động fix thời lượng Slide theo thời lượng MP4 upload."
          duration: vidDur,
        });
      };

      tempVid.onloadedmetadata = () => {
        applyWithDuration(tempVid.duration);
      };

      tempVid.onerror = () => {
        applyWithDuration(8);
      };

      // Fallback in case onloadedmetadata doesn't fire promptly in some browser environments
      setTimeout(() => {
        if (!applied) {
          applyWithDuration(tempVid.duration);
        }
      }, 400);

      setActiveSlideVideoPickerId(null);
    }
    e.target.value = '';
  };

  const filteredPresets = selectedCategory === 'all'
    ? BACKGROUND_PRESETS
    : BACKGROUND_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Main Mode Selector: Hình nền đơn | Nhiều Ảnh */}
      <div className="bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              {isVi ? 'Phương Pháp Tạo Hình Nền' : 'Background Creation Mode'}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">
            {mode === 'single'
              ? (isVi ? '1 Hình nền cố định xuyên suốt' : '1 Static or looping background')
              : (isVi ? `${slides.length} Slide chuyển cảnh tự động` : `${slides.length} Automatic animated slides`)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Option A: Hình nền đơn */}
          <button
            type="button"
            onClick={() => update({ mode: 'single' })}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/25 ring-2 ring-cyan-500/30'
                : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isVi ? 'Hình Nền Đơn (Single)' : 'Single Background'}</span>
          </button>

          {/* Option B: Nhiều Ảnh (Slideshow) */}
          <button
            type="button"
            onClick={() => {
              const firstSlide = slides[0];
              update({
                mode: 'slides',
                slides: slides,
                url: firstSlide?.url || background.url,
                type: firstSlide?.type || 'preset',
                isVideo: Boolean(firstSlide?.isVideo),
                videoUrl: firstSlide?.videoUrl || '',
              });
            }}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              mode === 'slides'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-500/30'
                : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isVi ? 'Nhiều Ảnh (Slides)' : 'Multi-Image Slideshow'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: HÌNH NỀN ĐƠN (Single Background)                     */}
      {/* ============================================================ */}
      {mode === 'single' && (
        <div className="space-y-5">
          {/* Sub-selector for Single Background Types */}
          <div className="bg-neutral-900/50 p-3 rounded-2xl border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-300 block mb-2 px-1">
              {isVi ? 'Chọn nguồn hình nền đơn:' : 'Select single background source:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'gradient', nameVi: 'Nền Màu Tùy Chỉnh', nameEn: 'Custom Color', icon: Palette },
                { id: 'preset', nameVi: 'Ảnh Mẫu (Presets)', nameEn: 'Image Presets', icon: ImageIcon },
                { id: 'upload', nameVi: 'Ảnh Upload', nameEn: 'Upload Image', icon: Upload },
                { id: 'video', nameVi: 'Mp4 Upload', nameEn: 'Mp4 Video', icon: Video },
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = src.id === 'gradient'
                  ? (background.type === 'gradient' || background.type === 'solid')
                  : background.type === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      if (src.id === 'gradient') {
                        update({ type: 'gradient', isVideo: false });
                      } else if (src.id === 'preset') {
                        update({ type: 'preset', isVideo: false, url: background.url || BACKGROUND_PRESETS[0].url });
                      } else if (src.id === 'upload') {
                        update({ type: 'upload', isVideo: false });
                      } else if (src.id === 'video') {
                        update({ type: 'video', isVideo: true });
                      }
                    }}
                    className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
                    <span className="text-xs font-semibold">{isVi ? src.nameVi : src.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-view A: Nền Màu Tùy Chỉnh (Custom Color) */}
          {(background.type === 'gradient' || background.type === 'solid') && (
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                <Palette className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  {isVi ? 'Nền Màu Tùy Chỉnh (Solid & Gradient)' : 'Custom Color & Gradients'}
                </h3>
              </div>

              {/* Gradient vs Solid Mode */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update({ type: 'gradient', gradientType: 'linear' })}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    background.type === 'gradient' && background.gradientType !== 'radial'
                      ? 'bg-cyan-500/20 border-cyan-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {isVi ? 'Linear Gradient (Thẳng)' : 'Linear Gradient'}
                </button>
                <button
                  type="button"
                  onClick={() => update({ type: 'gradient', gradientType: 'radial' })}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    background.type === 'gradient' && background.gradientType === 'radial'
                      ? 'bg-cyan-500/20 border-cyan-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {isVi ? 'Radial Gradient (Tâm Tròn)' : 'Radial Gradient'}
                </button>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1">{isVi ? 'Màu 1 (Chính)' : 'Color 1'}</span>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={background.color1 || '#0f172a'}
                      onChange={(e) => update({ color1: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-neutral-300">{background.color1 || '#0f172a'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1">{isVi ? 'Màu 2 (Phụ)' : 'Color 2'}</span>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                    <input
                      type="color"
                      value={background.color2 || '#312e81'}
                      onChange={(e) => update({ color2: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-neutral-300">{background.color2 || '#312e81'}</span>
                  </div>
                </div>

                {background.useThreeColors && (
                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">{isVi ? 'Màu 3 (Điểm Nhấn)' : 'Color 3'}</span>
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                      <input
                        type="color"
                        value={background.color3 || '#7c3aed'}
                        onChange={(e) => update({ color3: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-neutral-300">{background.color3 || '#7c3aed'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Colors Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={background.useThreeColors || false}
                  onChange={(e) => update({ useThreeColors: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                />
                <span className="text-xs text-neutral-300">
                  {isVi ? 'Sử dụng dải chuyển sắc 3 màu (3-Color Gradient)' : 'Use 3-color gradient blending'}
                </span>
              </label>

              {/* Gradient Angle Slider */}
              {background.gradientType !== 'radial' && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Góc xoay dải màu' : 'Gradient Angle'}</span>
                    <span className="text-cyan-400 font-mono font-bold">{background.gradientAngle || 135}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={background.gradientAngle || 135}
                    onChange={(e) => update({ gradientAngle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              )}

              {/* Quick Palettes */}
              <div className="pt-2 border-t border-neutral-800/80">
                <span className="text-[11px] text-neutral-400 block mb-2">{isVi ? 'Bộ phối màu gợi ý:' : 'Curated Palettes:'}</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Dark Cyber', c1: '#0f172a', c2: '#312e81', c3: '#7c3aed' },
                    { name: 'Sunset Glow', c1: '#4a044e', c2: '#9d174d', c3: '#f97316' },
                    { name: 'Deep Emerald', c1: '#022c22', c2: '#064e3b', c3: '#059669' },
                    { name: 'Nordic Midnight', c1: '#030712', c2: '#111827', c3: '#1f2937' },
                  ].map((pal) => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => update({ color1: pal.c1, color2: pal.c2, color3: pal.c3, useThreeColors: true })}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-cyan-500/50 flex items-center gap-1.5 cursor-pointer text-xs text-neutral-300"
                    >
                      <div className="flex -space-x-1">
                        <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: pal.c1 }} />
                        <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: pal.c2 }} />
                        <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: pal.c3 }} />
                      </div>
                      <span>{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-view B: Ảnh Mẫu (Image Presets) */}
          {background.type === 'preset' && (
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    {isVi ? 'Thư Viện Ảnh Mẫu (Image Presets)' : 'Curated Image Presets'}
                  </h3>
                </div>
                <span className="text-[10px] text-neutral-400">{filteredPresets.length} {isVi ? 'ảnh' : 'photos'}</span>
              </div>

              {/* Categories */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-500 text-neutral-950 font-bold'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isVi ? cat.nameVi : cat.nameEn}
                  </button>
                ))}
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = background.url === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => update({ type: 'preset', url: preset.url, isVideo: false })}
                      className={`group relative rounded-xl overflow-hidden aspect-video border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-[1.02]'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[11px] font-medium text-white truncate drop-shadow-sm">
                          {isVi ? preset.nameVi : preset.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-neutral-950 flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-view C: Ảnh Upload (Upload Image) */}
          {background.type === 'upload' && (
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                <Upload className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  {isVi ? 'Tải Lên Ảnh Tùy Chỉnh (Upload Image)' : 'Upload Custom Image File'}
                </h3>
              </div>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-cyan-500 bg-neutral-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-neutral-200">
                  {isVi ? 'Bấm để chọn ảnh từ máy tính (PNG, JPG, WEBP)' : 'Click to browse image file (PNG, JPG, WEBP)'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Hỗ trợ độ phân giải cao 1080p, 2K, 4K sắc nét' : 'Supports Full HD, 2K and 4K high resolution'}
                </span>
              </button>

              {/* Direct URL Input */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                <span className="text-[11px] text-neutral-300 font-medium block">
                  {isVi ? 'Hoặc dán đường dẫn ảnh trực tiếp (Image URL):' : 'Or paste direct image URL:'}
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={directUrlInput}
                    onChange={(e) => setDirectUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (directUrlInput.trim()) {
                        update({ type: 'upload', url: directUrlInput.trim(), isVideo: false });
                        setDirectUrlInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isVi ? 'Áp Dụng' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Active Image Preview */}
              {background.url && (
                <div className="pt-2">
                  <span className="text-[11px] text-neutral-400 block mb-1.5">{isVi ? 'Ảnh hiện tại đang dùng:' : 'Currently active image:'}</span>
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-neutral-700 max-h-48">
                    <img src={background.url} alt="Current Background" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-view D: Mp4 Upload (Upload Video MP4) */}
          {background.type === 'video' && (
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                <Video className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  {isVi ? 'Tải Lên Video MP4 Nền Lặp (Video MP4 Loop)' : 'Upload MP4 Video Background'}
                </h3>
              </div>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full p-6 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-cyan-500 bg-neutral-950/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-neutral-200">
                  {isVi ? 'Bấm để chọn file video MP4 từ máy tính' : 'Click to browse MP4/WebM video file'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Video sẽ tự động lặp mượt mà đồng bộ theo bài hát' : 'Video loops continuously in sync with the song'}
                </span>
              </button>

              {/* Loop Fade In/Out Controls */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={background.videoLoopFade !== false}
                    onChange={(e) => update({ videoLoopFade: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-200 block">
                      {isVi ? 'Fade In / Out khi Video ngắn hơn bài hát' : 'Loop Fade In / Out Transition'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isVi ? 'Chuyển cảnh mờ dần mềm mại mỗi khi video hết và lặp lại' : 'Smooth dissolve fade at loop boundaries'}
                    </span>
                  </div>
                </label>

                {background.videoLoopFade !== false && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Thời gian mờ dần (Fade Duration)' : 'Fade Duration'}</span>
                      <span className="text-cyan-400 font-mono font-bold">
                        {(background.videoFadeDuration !== undefined ? background.videoFadeDuration : 1.0).toFixed(1)}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={3.0}
                      step={0.1}
                      value={background.videoFadeDuration !== undefined ? background.videoFadeDuration : 1.0}
                      onChange={(e) => update({ videoFadeDuration: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Apply to All Playlist Button */}
          {playlist && playlist.tracks.length > 1 && onApplyBackgroundToAllTracks && (
            <button
              type="button"
              onClick={() => onApplyBackgroundToAllTracks(background)}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ListMusic className="w-4 h-4 text-cyan-400" />
              <span>{isVi ? 'Áp dụng hình nền này cho tất cả bài trong Playlist' : 'Apply this background to all tracks in playlist'}</span>
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: NHIỀU ẢNH (Multi-Image Slideshow)                    */}
      {/* ============================================================ */}
      {mode === 'slides' && (
        <div className="space-y-5">
          {/* Slideshow Overview Header Banner */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-purple-950/40 p-4 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isVi ? 'Danh Sách Slide Chuyển Cảnh' : 'Multi-Slide Sequence'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  {slides.length} {isVi ? 'Slide' : 'Slides'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {isVi ? 'Tổng thời lượng slide:' : 'Total slides:'}{' '}
                    <b className="text-white font-mono">{slides.reduce((acc, s) => acc + (s.duration || 0), 0)}s</b>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isVi ? 'Bài MP3 đang chọn:' : 'Active MP3:'}{' '}
                    <b className="text-emerald-300 font-mono">{activeSongDuration}s</b>
                  </span>
                </div>
                {playlist && playlist.tracks && playlist.tracks.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {isVi ? 'Toàn bộ Playlist:' : 'All Playlist:'}{' '}
                      <b className="text-cyan-300 font-mono">{totalPlaylistDuration}s</b>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? '+ Thêm Slide Mới' : '+ Add New Slide'}</span>
            </button>
          </div>

          {/* List of Slide Cards */}
          <div className="space-y-4">
            {slides.map((slide, index) => {
              const isLastSlide = index === slides.length - 1;
              const prevDurationsSum = sumPreviousSlidesDuration(index);
              const autoCalcSong = Math.max(2, activeSongDuration - prevDurationsSum);
              const autoCalcPlaylist = Math.max(2, totalPlaylistDuration - prevDurationsSum);

              return (
                <div
                  key={slide.id}
                  className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all space-y-3.5 shadow-sm"
                >
                  {/* Slide Card Header */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={slide.name || `Slide ${index + 1}`}
                        onChange={(e) => handleUpdateSlide(slide.id, { name: e.target.value })}
                        className="bg-transparent text-xs font-bold text-neutral-200 focus:outline-none focus:underline"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title={isVi ? 'Di chuyển lên' : 'Move Up'}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveSlide(index, 'down')}
                        disabled={index === slides.length - 1}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title={isVi ? 'Di chuyển xuống' : 'Move Down'}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateSlide(index)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-indigo-400 cursor-pointer"
                        title={isVi ? 'Nhân đôi slide' : 'Duplicate Slide'}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 cursor-pointer ml-1"
                          title={isVi ? 'Xóa slide' : 'Delete Slide'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slide Content Source Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Left: Thumbnail & Source Picker */}
                    <div className="space-y-2.5">
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-neutral-700 bg-neutral-950 flex items-center justify-center">
                        {slide.type === 'solid' ? (
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: slide.color1 || '#0f172a' }}
                          />
                        ) : slide.type === 'gradient' ? (
                          <div
                            className="w-full h-full"
                            style={{
                              background:
                                slide.gradientType === 'radial'
                                  ? slide.useThreeColors
                                    ? `radial-gradient(circle at ${slide.radialOrigin || 'center'}, ${slide.color1 || '#312e81'}, ${slide.color2 || '#0f172a'}, ${slide.color3 || '#7c3aed'})`
                                    : `radial-gradient(circle at ${slide.radialOrigin || 'center'}, ${slide.color1 || '#312e81'}, ${slide.color2 || '#0f172a'})`
                                  : slide.useThreeColors
                                  ? `linear-gradient(${slide.gradientAngle ?? 135}deg, ${slide.color1 || '#0f172a'}, ${slide.color2 || '#312e81'}, ${slide.color3 || '#7c3aed'})`
                                  : `linear-gradient(${slide.gradientAngle ?? 135}deg, ${slide.color1 || '#0f172a'}, ${slide.color2 || '#312e81'})`,
                            }}
                          />
                        ) : slide.type === 'video' ? (
                          slide.videoUrl || slide.url ? (
                            <div className="relative w-full h-full group">
                              <video
                                ref={(el) => {
                                  if (el) {
                                    if (playingSlideVideoId === slide.id) {
                                      el.play().catch(() => {});
                                    } else {
                                      el.pause();
                                    }
                                  }
                                }}
                                src={slide.videoUrl || slide.url}
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                              {/* Small Play/Pause Preview Control for Slide Video */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlayingSlideVideoId(playingSlideVideoId === slide.id ? null : slide.id);
                                }}
                                className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-110"
                                title={
                                  playingSlideVideoId === slide.id
                                    ? (isVi ? 'Tạm dừng xem trước video' : 'Pause preview')
                                    : (isVi ? 'Xem trước video MP4' : 'Play preview')
                                }
                              >
                                {playingSlideVideoId === slide.id ? (
                                  <Pause className="w-4 h-4 fill-white" />
                                ) : (
                                  <Play className="w-4 h-4 fill-white translate-x-0.5" />
                                )}
                              </button>
                              {/* Video duration badge */}
                              {slide.videoDuration && (
                                <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-black/80 text-indigo-300 font-mono border border-indigo-500/30">
                                  {slide.videoDuration}s
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-neutral-500">
                              <Video className="w-6 h-6 text-indigo-400/70" />
                              <span className="text-[11px]">{isVi ? 'Chưa chọn video MP4' : 'No MP4 video selected'}</span>
                            </div>
                          )
                        ) : slide.url ? (
                          <img src={slide.url} alt={slide.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-neutral-500">{isVi ? 'Chưa có ảnh' : 'No image'}</span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono uppercase">
                          {slide.type === 'video' ? 'MP4 VIDEO' : slide.type}
                        </span>
                      </div>

                      {/* Source Chips (4 Options: Ảnh Mẫu | Tải Ảnh | Mp4 Upload | Màu Sắc) */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const nextPreset = BACKGROUND_PRESETS[(index + 1) % BACKGROUND_PRESETS.length];
                            handleUpdateSlide(slide.id, { type: 'preset', isVideo: false, url: slide.url || nextPreset.url });
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            slide.type === 'preset'
                              ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{isVi ? 'Ảnh Mẫu' : 'Preset'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveSlidePickerId(slide.id);
                            slideFileInputRef.current?.click();
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            slide.type === 'upload'
                              ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Upload className="w-3 h-3 shrink-0" />
                          <span className="truncate">{isVi ? 'Tải Ảnh' : 'Image'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateSlide(slide.id, { type: 'video', isVideo: true });
                            if (!slide.videoUrl) {
                              setActiveSlideVideoPickerId(slide.id);
                              slideVideoInputRef.current?.click();
                            }
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            slide.type === 'video'
                              ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Video className="w-3 h-3 shrink-0" />
                          <span className="truncate">{isVi ? 'Mp4 Upload' : 'MP4'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateSlide(slide.id, {
                              type: slide.type === 'solid' ? 'solid' : 'gradient',
                              isVideo: false,
                              color1: slide.color1 || '#1e1b4b',
                              color2: slide.color2 || '#0f172a',
                              color3: slide.color3 || '#7c3aed',
                              gradientAngle: slide.gradientAngle ?? 135,
                              gradientType: slide.gradientType || 'linear',
                            });
                          }}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            slide.type === 'gradient' || slide.type === 'solid'
                              ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Palette className="w-3 h-3 shrink-0" />
                          <span className="truncate">{isVi ? 'Màu Sắc' : 'Color'}</span>
                        </button>
                      </div>

                      {/* Quick Preset Strip when slide.type === 'preset' */}
                      {slide.type === 'preset' && (
                        <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                          {BACKGROUND_PRESETS.map((pr) => (
                            <button
                              key={pr.id}
                              type="button"
                              onClick={() => handleUpdateSlide(slide.id, { type: 'preset', isVideo: false, url: pr.url })}
                              className={`relative w-12 h-8 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                                slide.url === pr.url
                                  ? 'border-indigo-400 ring-1 ring-indigo-400 scale-105'
                                  : 'border-neutral-800 opacity-70 hover:opacity-100'
                              }`}
                              title={isVi ? pr.nameVi : pr.name}
                            >
                              <img src={pr.thumbnail} alt={pr.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* MP4 Video Upload Panel when slide.type === 'video' */}
                      {slide.type === 'video' && (
                        <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-indigo-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5" />
                              {isVi ? 'Video MP4 của Slide này' : 'Slide MP4 Video'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSlideVideoPickerId(slide.id);
                                slideVideoInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{slide.videoUrl ? (isVi ? 'Đổi File MP4' : 'Replace MP4') : (isVi ? 'Chọn File MP4' : 'Upload MP4')}</span>
                            </button>
                          </div>

                          {/* MP4 Duration & Loop / Cut Status Info */}
                          {slide.videoDuration ? (
                            <div className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 space-y-1.5 text-[10px]">
                              <div className="flex items-center justify-between">
                                <span className="text-neutral-300">
                                  {isVi ? 'Thời lượng file MP4 gốc:' : 'Original MP4 length:'}{' '}
                                  <b className="text-indigo-300 font-mono font-bold">{slide.videoDuration}s</b>
                                </span>
                                {slide.duration !== slide.videoDuration && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSlide(slide.id, { duration: slide.videoDuration! })}
                                    className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer text-[9px] flex items-center gap-1"
                                    title={isVi ? 'Khớp thời lượng slide bằng thời lượng video MP4' : 'Set slide duration to video duration'}
                                  >
                                    <Zap className="w-2.5 h-2.5" />
                                    <span>{isVi ? `Đặt Slide = ${slide.videoDuration}s` : `Match = ${slide.videoDuration}s`}</span>
                                  </button>
                                )}
                              </div>

                              {slide.duration > slide.videoDuration ? (
                                <div className="text-amber-400 flex items-center gap-1 leading-tight">
                                  <RefreshCw className="w-3 h-3 shrink-0" />
                                  <span>
                                    {isVi
                                      ? `Slide (${slide.duration}s) > MP4 (${slide.videoDuration}s) → Video tự động lặp lại (Loop).`
                                      : `Slide (${slide.duration}s) > MP4 (${slide.videoDuration}s) → Video will loop.`}
                                  </span>
                                </div>
                              ) : slide.duration < slide.videoDuration ? (
                                <div className="text-cyan-400 flex items-center gap-1 leading-tight">
                                  <Scissors className="w-3 h-3 shrink-0" />
                                  <span>
                                    {isVi
                                      ? `Slide (${slide.duration}s) < MP4 (${slide.videoDuration}s) → Video phát ${slide.duration}s rồi cắt chuyển slide.`
                                      : `Slide (${slide.duration}s) < MP4 (${slide.videoDuration}s) → Video plays ${slide.duration}s then cuts.`}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-emerald-400 flex items-center gap-1 leading-tight">
                                  <Check className="w-3 h-3 shrink-0" />
                                  <span>
                                    {isVi
                                      ? 'Thời lượng Slide khớp 100% với video MP4.'
                                      : 'Slide duration matches video duration perfectly.'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-neutral-400 leading-tight">
                              {isVi
                                ? 'Hỗ trợ định dạng .MP4 / .WebM. Preview chỉ phát khi bấm Play nhạc, không lag app.'
                                : 'Supports .MP4 / .WebM. Preview only plays on music playback to prevent app lag.'}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Full Color & Gradient Studio when slide.type === 'gradient' | 'solid' */}
                      {(slide.type === 'gradient' || slide.type === 'solid') && (
                        <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-indigo-500/30 space-y-2.5">
                          {/* 1. Kiểu màu: Solid | Linear Gradient | Radial Gradient */}
                          <div>
                            <span className="text-[10px] text-neutral-400 font-medium block mb-1">
                              {isVi ? 'Kiểu màu nền Slide:' : 'Slide Color Mode:'}
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { type: 'solid' })}
                                className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                                  slide.type === 'solid'
                                    ? 'bg-indigo-500/25 border-indigo-400 text-white'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                              >
                                {isVi ? 'Màu Đơn (Solid)' : 'Solid'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { type: 'gradient', gradientType: 'linear' })}
                                className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                                  slide.type === 'gradient' && slide.gradientType !== 'radial'
                                    ? 'bg-indigo-500/25 border-indigo-400 text-white'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                              >
                                {isVi ? 'Linear (Thẳng)' : 'Linear'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSlide(slide.id, { type: 'gradient', gradientType: 'radial' })}
                                className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                                  slide.type === 'gradient' && slide.gradientType === 'radial'
                                    ? 'bg-indigo-500/25 border-indigo-400 text-white'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                              >
                                {isVi ? 'Radial (Tròn)' : 'Radial'}
                              </button>
                            </div>
                          </div>

                          {/* 2. Color Pickers (1, 2 or 3 Colors) */}
                          <div className={`grid ${slide.type === 'solid' ? 'grid-cols-1' : slide.useThreeColors ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5`}>
                            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg">
                              <input
                                type="color"
                                value={slide.color1 || '#1e1b4b'}
                                onChange={(e) => handleUpdateSlide(slide.id, { color1: e.target.value })}
                                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 shrink-0"
                              />
                              <span className="text-[10px] font-mono text-neutral-300 truncate">{slide.color1 || '#1e1b4b'}</span>
                            </div>

                            {slide.type === 'gradient' && (
                              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg">
                                <input
                                  type="color"
                                  value={slide.color2 || '#0f172a'}
                                  onChange={(e) => handleUpdateSlide(slide.id, { color2: e.target.value })}
                                  className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 shrink-0"
                                />
                                <span className="text-[10px] font-mono text-neutral-300 truncate">{slide.color2 || '#0f172a'}</span>
                              </div>
                            )}

                            {slide.type === 'gradient' && slide.useThreeColors && (
                              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-lg">
                                <input
                                  type="color"
                                  value={slide.color3 || '#7c3aed'}
                                  onChange={(e) => handleUpdateSlide(slide.id, { color3: e.target.value })}
                                  className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 shrink-0"
                                />
                                <span className="text-[10px] font-mono text-neutral-300 truncate">{slide.color3 || '#7c3aed'}</span>
                              </div>
                            )}
                          </div>

                          {/* 3. Gradient Extra Options: 3-Color toggle, Angle or Radial Origin */}
                          {slide.type === 'gradient' && (
                            <div className="space-y-2 pt-0.5">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={slide.useThreeColors || false}
                                  onChange={(e) => handleUpdateSlide(slide.id, { useThreeColors: e.target.checked, color3: slide.color3 || '#7c3aed' })}
                                  className="rounded text-indigo-500 focus:ring-indigo-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                                />
                                <span className="text-[10px] text-neutral-300">
                                  {isVi ? 'Phối 3 màu chuyển sắc (3-Color Gradient)' : '3-Color Gradient Blend'}
                                </span>
                              </label>

                              {slide.gradientType !== 'radial' ? (
                                <div>
                                  <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-neutral-400">{isVi ? 'Góc xoay Gradient:' : 'Gradient Angle:'}</span>
                                    <span className="text-indigo-400 font-mono font-bold">{slide.gradientAngle ?? 135}°</span>
                                  </div>
                                  <input
                                    type="range"
                                    min={0}
                                    max={360}
                                    step={5}
                                    value={slide.gradientAngle ?? 135}
                                    onChange={(e) => handleUpdateSlide(slide.id, { gradientAngle: parseInt(e.target.value) })}
                                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <span className="text-[10px] text-neutral-400 block mb-1">
                                    {isVi ? 'Tâm tỏa tròn (Radial Origin):' : 'Radial Origin:'}
                                  </span>
                                  <div className="grid grid-cols-5 gap-1">
                                    {[
                                      { id: 'center', labelVi: 'Giữa', labelEn: 'Center' },
                                      { id: 'top', labelVi: 'Trên', labelEn: 'Top' },
                                      { id: 'bottom', labelVi: 'Dưới', labelEn: 'Bottom' },
                                      { id: 'left', labelVi: 'Trái', labelEn: 'Left' },
                                      { id: 'right', labelVi: 'Phải', labelEn: 'Right' },
                                    ].map((org) => (
                                      <button
                                        key={org.id}
                                        type="button"
                                        onClick={() => handleUpdateSlide(slide.id, { radialOrigin: org.id as any })}
                                        className={`py-1 rounded text-[9px] font-medium border cursor-pointer ${
                                          (slide.radialOrigin || 'center') === org.id
                                            ? 'bg-indigo-500/25 border-indigo-400 text-white'
                                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                                        }`}
                                      >
                                        {isVi ? org.labelVi : org.labelEn}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. Quick Curated Color Palettes */}
                          <div className="pt-1 border-t border-neutral-800/80">
                            <span className="text-[9px] text-neutral-500 block mb-1">
                              {isVi ? 'Bảng màu mẫu nhanh:' : 'Quick Color Presets:'}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {[
                                { name: 'Cyber', c1: '#0f172a', c2: '#312e81', c3: '#ec4899' },
                                { name: 'Sunset', c1: '#4a044e', c2: '#9d174d', c3: '#f97316' },
                                { name: 'Emerald', c1: '#022c22', c2: '#065f46', c3: '#10b981' },
                                { name: 'Ocean', c1: '#082f49', c2: '#0369a1', c3: '#38bdf8' },
                                { name: 'Lofi', c1: '#1e1b4b', c2: '#4c1d95', c3: '#c084fc' },
                                { name: 'Dark', c1: '#030712', c2: '#111827', c3: '#374151' },
                              ].map((pal) => (
                                <button
                                  key={pal.name}
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSlide(slide.id, {
                                      color1: pal.c1,
                                      color2: pal.c2,
                                      color3: pal.c3,
                                    })
                                  }
                                  className="px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 hover:border-indigo-400 flex items-center gap-1 cursor-pointer text-[9px] text-neutral-300"
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.c1 }} />
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pal.c3 }} />
                                  <span>{pal.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Timing, Transitions & Ken Burns */}
                    <div className="space-y-3">
                      {/* 1. Slide Interval / Duration */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-neutral-300 font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            {isVi ? 'Thời lượng hiển thị (Duration):' : 'Slide Duration:'}
                          </span>
                          <span className="text-indigo-400 font-mono font-bold">{slide.duration}s</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={90}
                          step={1}
                          value={slide.duration}
                          onChange={(e) => handleUpdateSlide(slide.id, { duration: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />

                        {/* Special Auto-calc Indicator for Last Slide */}
                        {isLastSlide && (
                          <div className="mt-2 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-indigo-300">
                              <span>
                                {isVi ? 'Khớp theo Bài MP3 hiện tại:' : 'Match active MP3:'}{' '}
                                <b className="text-emerald-300 font-mono font-bold">{autoCalcSong}s</b>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAutoCalcLastSlide(activeSongDuration)}
                                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold transition-colors cursor-pointer"
                              >
                                {isVi ? `⚡ Điền ${autoCalcSong}s` : `⚡ Fill ${autoCalcSong}s`}
                              </button>
                            </div>
                            {playlist && playlist.tracks && playlist.tracks.length > 1 && (
                              <div className="flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800/60 pt-1">
                                <span>
                                  {isVi ? 'Khớp theo toàn bộ Playlist:' : 'Match full Playlist:'}{' '}
                                  <b className="text-cyan-300 font-mono font-bold">{autoCalcPlaylist}s</b>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAutoCalcLastSlide(totalPlaylistDuration)}
                                  className="px-2 py-0.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold transition-colors cursor-pointer"
                                >
                                  {isVi ? `⚡ Điền ${autoCalcPlaylist}s` : `⚡ Fill ${autoCalcPlaylist}s`}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Transition Type & Duration */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-neutral-300 font-medium">
                            {isVi ? 'Hiệu ứng chuyển cảnh (Transition):' : 'Transition Effect:'}
                          </span>
                          <span className="text-indigo-400 font-mono font-bold">
                            {(slide.transitionDuration ?? 1.2).toFixed(1)}s
                          </span>
                        </div>

                        <select
                          value={slide.transitionType || 'crossfade'}
                          onChange={(e) => handleUpdateSlide(slide.id, { transitionType: e.target.value as SlideTransitionType })}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 mb-1.5 cursor-pointer"
                        >
                          {TRANSITION_TYPES.map((tr) => (
                            <option key={tr.id} value={tr.id}>
                              {isVi ? tr.nameVi : tr.nameEn}
                            </option>
                          ))}
                        </select>

                        <input
                          type="range"
                          min={0.3}
                          max={3.0}
                          step={0.1}
                          value={slide.transitionDuration ?? 1.2}
                          onChange={(e) => handleUpdateSlide(slide.id, { transitionDuration: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {/* 3. Ken Burns Pan / Zoom */}
                      <div className="pt-1 space-y-2">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slide.kenBurns !== false}
                            onChange={(e) => handleUpdateSlide(slide.id, { kenBurns: e.target.checked })}
                            className="rounded text-indigo-500 focus:ring-indigo-500 bg-neutral-800 border-neutral-700 mt-0.5 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-semibold text-neutral-200 block">
                              {isVi ? 'Hiệu ứng Ken Burns (Pan & Zoom nhẹ)' : 'Ken Burns Organic Motion'}
                            </span>
                            <span className="text-[10px] text-neutral-400 block leading-tight">
                              {isVi 
                                ? 'Tự động mở rộng tỷ lệ (overscale) chống hở viền đen khi chuyển động'
                                : 'Overscales image dimension to eliminate black border gaps'}
                            </span>
                          </div>
                        </label>

                        {/* Ken Burns Detailed Settings Panel */}
                        {slide.kenBurns !== false && (
                          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-indigo-500/25 space-y-2.5">
                            {/* Direction */}
                            <div>
                              <div className="flex justify-between items-center text-[10px] mb-1">
                                <span className="text-neutral-400 font-medium">
                                  {isVi ? 'Hướng chuyển động (Motion Direction):' : 'Motion Direction:'}
                                </span>
                                <span className="text-indigo-400 font-mono font-bold text-[9px] uppercase">
                                  {slide.kenBurnsDirection || 'auto'}
                                </span>
                              </div>
                              <select
                                value={slide.kenBurnsDirection || 'auto'}
                                onChange={(e) => handleUpdateSlide(slide.id, { kenBurnsDirection: e.target.value as KenBurnsDirection })}
                                className="w-full px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                {KEN_BURNS_DIRECTIONS.map((dir) => (
                                  <option key={dir.id} value={dir.id}>
                                    {isVi ? dir.nameVi : dir.nameEn}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Zoom Scale */}
                            <div>
                              <div className="flex justify-between items-center text-[10px] mb-1">
                                <span className="text-neutral-400">{isVi ? 'Tỷ lệ Zoom (Zoom Scale):' : 'Zoom Scale:'}</span>
                                <span className="text-indigo-400 font-mono font-bold">
                                  {(slide.kenBurnsScale ?? 1.18).toFixed(2)}x
                                </span>
                              </div>
                              <input
                                type="range"
                                min={1.05}
                                max={1.35}
                                step={0.01}
                                value={slide.kenBurnsScale ?? 1.18}
                                onChange={(e) => handleUpdateSlide(slide.id, { kenBurnsScale: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>

                            {/* Pan & Zoom Speed */}
                            <div>
                              <div className="flex justify-between items-center text-[10px] mb-1">
                                <span className="text-neutral-400">{isVi ? 'Tốc độ lướt (Speed):' : 'Pan Speed:'}</span>
                                <span className="text-indigo-400 font-mono font-bold">
                                  {(slide.kenBurnsSpeed ?? 1.0).toFixed(1)}x
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0.3}
                                max={2.5}
                                step={0.1}
                                value={slide.kenBurnsSpeed ?? 1.0}
                                onChange={(e) => handleUpdateSlide(slide.id, { kenBurnsSpeed: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hidden Slide Image & Video MP4 Upload Inputs */}
          <input
            ref={slideFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSlideImageUpload}
            className="hidden"
          />
          <input
            ref={slideVideoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleSlideVideoUpload}
            className="hidden"
          />

          {/* ============================================================ */}
          {/* CUỐI TAB: CÀI ĐẶT TỰ ĐỘNG CHO TOÀN BỘ SLIDE (Batch Settings) */}
          {/* ============================================================ */}
          <div className="bg-neutral-900/80 p-4 rounded-2xl border border-indigo-500/30 space-y-3.5 shadow-md">
            <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isVi ? 'Cài Đặt Tự Động Cho Toàn Bộ Slide (Batch Auto Settings)' : 'Batch Auto Settings for All Slides'}
                </h3>
                <p className="text-[10px] text-neutral-400">
                  {isVi 
                    ? 'Áp dụng nhanh thời lượng, kiểu chuyển cảnh và Ken Burns đồng bộ cho mọi slide' 
                    : 'Quickly distribute duration or apply transition styles across all slides'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Batch Action 1: Chia đều thời lượng */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-neutral-200">
                    {isVi ? 'Chia Đều Thời Lượng Slide' : 'Distribute Duration Evenly'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAutoDistributeAll(activeSongDuration)}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-[11px] font-semibold text-emerald-300">
                      {isVi ? `⚡ Theo bài MP3 (${activeSongDuration}s)` : `⚡ By active MP3 (${activeSongDuration}s)`}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      ~{Math.round(activeSongDuration / Math.max(1, slides.length))}s/slide
                    </span>
                  </button>

                  {playlist && playlist.tracks && playlist.tracks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleAutoDistributeAll(totalPlaylistDuration)}
                      className="py-1.5 px-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-[11px] font-semibold text-indigo-300">
                        {isVi ? `⚡ Theo Playlist (${totalPlaylistDuration}s)` : `⚡ By Playlist (${totalPlaylistDuration}s)`}
                      </span>
                      <span className="text-[10px] text-indigo-400/80 font-mono">
                        ~{Math.round(totalPlaylistDuration / Math.max(1, slides.length))}s/slide
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Action 2: Ken Burns All Toggle */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-neutral-200">
                    {isVi ? 'Đồng Bộ Ken Burns Pan/Zoom' : 'Sync Ken Burns Motion'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleKenBurnsAll(true)}
                    className="flex-1 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/40 cursor-pointer"
                  >
                    {isVi ? 'Bật Cho Tất Cả' : 'Enable All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleKenBurnsAll(false)}
                    className="flex-1 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold border border-neutral-700 cursor-pointer"
                  >
                    {isVi ? 'Tắt Cho Tất Cả' : 'Disable All'}
                  </button>
                </div>
              </div>
            </div>

            {/* Batch Action 3: Apply Uniform Transition to All Slides */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-200 block">
                {isVi ? 'Áp Dụng Kiểu Chuyển Cảnh Cho Tất Cả Slide:' : 'Apply Transition Style to All Slides:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={batchTransition}
                  onChange={(e) => setBatchTransition(e.target.value as SlideTransitionType)}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {TRANSITION_TYPES.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {isVi ? tr.nameVi : tr.nameEn}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.3}
                    max={3.0}
                    step={0.1}
                    value={batchTransDuration}
                    onChange={(e) => setBatchTransDuration(parseFloat(e.target.value))}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-400">{batchTransDuration.toFixed(1)}s</span>
                </div>

                <button
                  type="button"
                  onClick={handleApplyBatchTransition}
                  className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  {isVi ? 'Áp Dụng Cho Tất Cả' : 'Apply to All Slides'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
