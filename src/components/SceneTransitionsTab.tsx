import React, { useRef, useState } from 'react';
import {
  SceneTransitionsConfig,
  SceneTransitionType,
  SceneTransitionsMode,
  SlideImageItem,
  TimelineSceneItem,
  VisualizerType,
  VisualizerColorMode,
  VisualizerConfig,
  BackgroundConfig,
} from '../types';
import { CURATED_SLIDE_PRESETS } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  Layers,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  Clock,
  Sliders,
  Eye,
  RefreshCw,
  Shuffle,
  Wand2,
  ZoomIn,
  MoveRight,
  MoveLeft,
  MoveUp,
  MoveDown,
  Palette,
  CheckCircle2,
  Tv,
} from 'lucide-react';

interface SceneTransitionsTabProps {
  transitions: SceneTransitionsConfig;
  onTransitionsChange: (config: SceneTransitionsConfig) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  currentVisualizer: VisualizerConfig;
  currentBackground: BackgroundConfig;
  language: Language;
}

export const VISUALIZER_STYLE_OPTIONS: { id: VisualizerType; name: string; nameVi: string }[] = [
  { id: 'bars-mirrored', name: 'Mirrored Bars', nameVi: 'Sóng Kép Đối Xứng' },
  { id: 'bars-mirrored-peaks', name: 'Mirrored Bars + Peak Caps', nameVi: 'Sóng Kép + Đỉnh Rơi' },
  { id: 'bars-peaks', name: 'Classic Spectrum Peaks', nameVi: 'Cột Phổ Cổ Điển + Đỉnh' },
  { id: 'bars', name: 'Classic Spectrum Bars', nameVi: 'Cột Phổ Thẳng Đứng' },
  { id: 'radial-bars-peaks', name: 'Radial Spikes + Orbit Peaks', nameVi: 'Vòng Tròn Gai + Đỉnh Xoay' },
  { id: 'circular-spikes', name: 'Radial Spikes Circular', nameVi: 'Vòng Tròn Gai Tỏa Tâm' },
  { id: 'smooth-wave', name: 'Smooth Liquid Sine Wave', nameVi: 'Sóng Mềm Mại Uốn Lượn' },
  { id: 'double-ribbon', name: 'Double Cyber Ribbon', nameVi: 'Dải Lụa Cyber Đôi' },
  { id: 'cyber-matrix', name: 'Cyber Matrix LED Grid', nameVi: 'Lưới Đèn LED Ma Trận' },
  { id: 'tunnel-vortex', name: 'Concentric Tunnel Vortex', nameVi: 'Hầm Xuyên Không Gian 3D' },
  { id: 'laser-beams', name: 'EDM Concert Lasers', nameVi: 'Tia Laser Sân Khấu EDM' },
  { id: 'starburst-core', name: 'Pulsating Starburst Nova', nameVi: 'Ngôi Sao Siêu Tân Tinh' },
  { id: 'dna-helix', name: 'Neon 3D DNA Helix', nameVi: 'Chuỗi Xoắn Kép DNA 3D' },
  { id: 'vinyl-visual', name: 'Spinning Vinyl Record', nameVi: 'Đĩa Than Vinyl Quay' },
  { id: 'minimal-pulse', name: 'Minimal Audiophile Pulse', nameVi: 'Xung Nhịp Tối Giản' },
  { id: 'flame-spectrum', name: 'Hot Plasma Flame Spectrum', nameVi: 'Ngọn Lửa Plasma Rực Rỡ' },
  { id: 'audio-equalizer-grid', name: 'Studio EQ Cascade Blocks', nameVi: 'Khối Equalizer Phòng Thu' },
];

export const TRANSITION_TYPES_OPTIONS: {
  id: SceneTransitionType;
  name: string;
  nameVi: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'fade',
    name: 'Crossfade',
    nameVi: 'Mờ Dần (Fade)',
    icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    nameVi: 'Trượt Sang Trái',
    icon: <MoveLeft className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    nameVi: 'Trượt Sang Phải',
    icon: <MoveRight className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    nameVi: 'Trượt Lên Trên',
    icon: <MoveUp className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    nameVi: 'Trượt Xuống Dưới',
    icon: <MoveDown className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'zoom-in',
    name: 'Zoom In (Push)',
    nameVi: 'Phóng To Đột Phá (Zoom In)',
    icon: <ZoomIn className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out (Pull)',
    nameVi: 'Thu Nhỏ Kéo Lùi (Zoom Out)',
    icon: <Tv className="w-4 h-4 text-rose-400" />,
  },
];

export const SceneTransitionsTab: React.FC<SceneTransitionsTabProps> = ({
  transitions,
  onTransitionsChange,
  currentTime,
  duration,
  onSeek,
  currentVisualizer,
  currentBackground,
  language,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewActiveIndex, setPreviewActiveIndex] = useState<number | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];
  const isVi = language === 'vi';

  // Helper update
  const updateConfig = (patch: Partial<SceneTransitionsConfig>) => {
    onTransitionsChange({
      ...transitions,
      ...patch,
    });
  };

  // Upload multi images handler
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: SlideImageItem[] = [];
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));

    if (validFiles.length === 0) return;

    let loadedCount = 0;
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (url) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          newItems.push({
            id: `slide-upload-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            name: cleanName || `Image ${transitions.images.length + newItems.length + 1}`,
            url,
          });
        }
        loadedCount++;
        if (loadedCount === validFiles.length) {
          updateConfig({
            images: [...transitions.images, ...newItems],
            enabled: true,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Add Curated Presets
  const handleAddCuratedPresets = () => {
    const existingIds = new Set(transitions.images.map((img) => img.url));
    const toAdd = CURATED_SLIDE_PRESETS.filter((p) => !existingIds.has(p.url)).map((p) => ({
      ...p,
      id: `curated-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    if (toAdd.length > 0) {
      updateConfig({
        images: [...transitions.images, ...toAdd],
        enabled: true,
      });
    }
  };

  // Reorder images
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= transitions.images.length) return;
    const newImages = [...transitions.images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    updateConfig({ images: newImages });
  };

  const deleteImage = (id: string) => {
    const newImages = transitions.images.filter((img) => img.id !== id);
    updateConfig({ images: newImages });
  };

  // Preview / Jump to slide
  const jumpToSlide = (index: number) => {
    setPreviewActiveIndex(index);
    if (transitions.mode === 'slider' || transitions.mode === 'both') {
      const interval = Math.max(2, transitions.sliderInterval || 8);
      const targetTime = index * interval + 0.1;
      onSeek(targetTime);
    }
  };

  // Add scene at current playback time
  const handleAddSceneAtCurrentTime = () => {
    const roundedTime = Math.round(currentTime * 10) / 10;
    const sceneNum = transitions.scenes.length + 1;

    // Pick an image from slider if available
    const imgId =
      transitions.images.length > 0
        ? transitions.images[(sceneNum - 1) % transitions.images.length].id
        : undefined;

    // Cycle through a different visualizer preset
    const visOption = VISUALIZER_STYLE_OPTIONS[(sceneNum - 1) % VISUALIZER_STYLE_OPTIONS.length];

    const newScene: TimelineSceneItem = {
      id: `scene-${Date.now()}`,
      time: roundedTime,
      name: isVi ? `Cảnh ${sceneNum}: Mốc ${formatTime(roundedTime)}` : `Scene ${sceneNum}: ${formatTime(roundedTime)}`,
      imageId: imgId,
      transitionType: transitions.defaultTransition || 'fade',
      transitionDuration: transitions.transitionDuration || 1.2,
      visualizerType: visOption.id,
      visualizerPrimaryColor: currentVisualizer.primaryColor,
      visualizerSecondaryColor: currentVisualizer.secondaryColor,
      visualizerColorMode: currentVisualizer.colorMode,
    };

    const newScenes = [...transitions.scenes, newScene].sort((a, b) => a.time - b.time);
    updateConfig({
      scenes: newScenes,
      enabled: true,
    });
  };

  // Auto-distribute scenes across song duration
  const handleAutoDistributeScenes = () => {
    const songDur = duration > 0 ? duration : 60;
    const imageCount = transitions.images.length > 0 ? transitions.images.length : 4;
    const interval = songDur / imageCount;

    const newScenes: TimelineSceneItem[] = [];
    for (let i = 0; i < imageCount; i++) {
      const sceneTime = Math.round(i * interval * 10) / 10;
      const img = transitions.images[i % transitions.images.length];
      const vis = VISUALIZER_STYLE_OPTIONS[i % VISUALIZER_STYLE_OPTIONS.length];

      newScenes.push({
        id: `auto-scene-${Date.now()}-${i}`,
        time: sceneTime,
        name:
          i === 0
            ? (isVi ? 'Đoạn Mở Đầu (Intro)' : 'Intro')
            : i === 1
            ? (isVi ? 'Lời 1 (Verse 1)' : 'Verse 1')
            : i === 2
            ? (isVi ? 'Cao Trào / Drop (Chorus)' : 'Chorus / Drop')
            : (isVi ? `Đoạn ${i + 1} (Bridge/Outro)` : `Scene ${i + 1}`),
        imageId: img?.id,
        imageUrl: img?.url,
        transitionType:
          i === 0
            ? 'fade'
            : i % 3 === 1
            ? 'slide-left'
            : i % 3 === 2
            ? 'zoom-in'
            : 'slide-up',
        transitionDuration: 1.2,
        visualizerType: vis.id,
        visualizerPrimaryColor:
          i % 4 === 0 ? '#06b6d4' : i % 4 === 1 ? '#f59e0b' : i % 4 === 2 ? '#a855f7' : '#10b981',
        visualizerSecondaryColor:
          i % 4 === 0 ? '#ec4899' : i % 4 === 1 ? '#ef4444' : i % 4 === 2 ? '#3b82f6' : '#6366f1',
      });
    }

    updateConfig({
      scenes: newScenes,
      enabled: true,
      mode: 'both',
    });
  };

  // Delete scene
  const deleteScene = (id: string) => {
    updateConfig({
      scenes: transitions.scenes.filter((s) => s.id !== id),
    });
  };

  // Format seconds to mm:ss.s
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Master Enable & Mode Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                transitions.enabled
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">
                  {isVi ? 'Hiệu Ứng Chuyển Cảnh & Đổi Sóng Âm' : 'Scene Transitions & Visualizer Mixer'}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    transitions.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {transitions.enabled ? (isVi ? 'ĐANG BẬT' : 'ACTIVE') : isVi ? 'ĐÃ TẮT' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isVi
                  ? 'Tải lên nhiều ảnh nền slider tự chuyển đổi và phối trộn các kiểu sóng âm khác nhau theo nhịp bài hát'
                  : 'Upload multi-image slideshow and mix different visualizer styles with smooth fade, slide, and zoom transitions'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={transitions.enabled}
              onChange={(e) => updateConfig({ enabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Mode Selector */}
        {transitions.enabled && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'slider',
                label: isVi ? 'Trình Chiếu Slider Ảnh' : 'Multi-Image Slider',
                desc: isVi ? 'Tự động luân chuyển ảnh theo chu kỳ thời gian' : 'Auto cycles images at fixed intervals',
                icon: <ImageIcon className="w-4 h-4" />,
              },
              {
                id: 'timeline',
                label: isVi ? 'Mốc Thời Gian (Timeline)' : 'Timeline Cues',
                desc: isVi ? 'Đổi cảnh & sóng âm tại các giây cụ thể' : 'Triggers transitions at exact timestamps',
                icon: <Clock className="w-4 h-4" />,
              },
              {
                id: 'both',
                label: isVi ? 'Kết Hợp Đa Năng (Mix Both)' : 'Hybrid Mixer',
                desc: isVi ? 'Kết hợp slider ảnh + đổi preset sóng âm' : 'Blends slider rotation with preset changes',
                icon: <Shuffle className="w-4 h-4" />,
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateConfig({ mode: mode.id as SceneTransitionsMode })}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                  transitions.mode === mode.id
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 ring-1 ring-purple-500/40'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div
                  className={`mt-0.5 p-1 rounded ${
                    transitions.mode === mode.id ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {mode.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold">{mode.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{mode.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: Multi-Image Slider Manager */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <h4 className="font-semibold text-slate-200 text-sm">
              {isVi ? '1. Quản Lý Slider Nhiều Ảnh Nền' : '1. Multi-Image Slider Collection'}
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
              {transitions.images.length} {isVi ? 'ảnh' : 'images'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddCuratedPresets}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVi ? '+ Nạp 4 Ảnh Mẫu Tuyệt Đẹp' : '+ Add 4 Curated Presets'}</span>
            </button>
            {transitions.images.length > 0 && (
              <button
                type="button"
                onClick={() => updateConfig({ images: [] })}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                title={isVi ? 'Xóa toàn bộ ảnh' : 'Clear all images'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Image Upload Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-950/30'
              : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {isVi
                  ? 'Nhấp để chọn NHIỀU ẢNH cùng lúc hoặc Kéo & Thả ảnh vào đây'
                  : 'Click to upload MULTIPLE images or drag and drop here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isVi
                  ? 'Hỗ trợ định dạng JPG, PNG, WEBP, GIF. Chọn cùng lúc 2 đến 20+ tấm ảnh để làm slider'
                  : 'Supports JPG, PNG, WEBP. Select multiple photos at once for the background slideshow'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Slider Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Slide Interval */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {isVi ? 'Thời Gian Mỗi Ảnh' : 'Slide Interval'}
              </span>
              <span className="font-semibold text-cyan-400">{transitions.sliderInterval || 8}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={transitions.sliderInterval || 8}
              onChange={(e) => updateConfig({ sliderInterval: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>2s</span>
              <span>8s</span>
              <span>15s</span>
              <span>30s</span>
            </div>
          </div>

          {/* Default Transition Effect */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              {isVi ? 'Kiểu Hiệu Ứng Chuyển' : 'Default Transition'}
            </label>
            <select
              value={transitions.defaultTransition || 'fade'}
              onChange={(e) => updateConfig({ defaultTransition: e.target.value as SceneTransitionType })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {TRANSITION_TYPES_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {isVi ? opt.nameVi : opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transition Duration */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isVi ? 'Thời Lượng Chuyển' : 'Transition Duration'}
              </span>
              <span className="font-semibold text-amber-400">{transitions.transitionDuration || 1.2}s</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3.0"
              step="0.1"
              value={transitions.transitionDuration || 1.2}
              onChange={(e) => updateConfig({ transitionDuration: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.3s</span>
              <span>1.2s</span>
              <span>3.0s</span>
            </div>
          </div>

          {/* Ken Burns & Loop Switches */}
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 flex flex-col justify-center gap-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                {isVi ? 'Ken Burns (Thở Nhẹ)' : 'Ken Burns Pan/Zoom'}
              </span>
              <input
                type="checkbox"
                checked={transitions.kenBurnsEffect}
                onChange={(e) => updateConfig({ kenBurnsEffect: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                {isVi ? 'Lặp Vô Tận Slider' : 'Continuous Loop'}
              </span>
              <input
                type="checkbox"
                checked={transitions.sliderLoop}
                onChange={(e) => updateConfig({ sliderLoop: e.target.checked })}
                className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Uploaded Images List Cards */}
        {transitions.images.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>{isVi ? 'Danh Sách Thứ Tự Ảnh Trong Slider:' : 'Slide Order & Preview:'}</span>
              <span className="text-[11px] text-slate-400">
                {isVi ? 'Bấm ↑ ↓ để đảo thứ tự, bấm icon Play để xem ngay' : 'Use ↑ ↓ to reorder, click Play to audition'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {transitions.images.map((img, idx) => {
                const isCurrentSlide =
                  transitions.mode === 'slider' || transitions.mode === 'both'
                    ? Math.floor(currentTime / (transitions.sliderInterval || 8)) % transitions.images.length === idx
                    : false;

                return (
                  <div
                    key={img.id}
                    className={`relative group rounded-lg overflow-hidden border transition-all p-2 bg-slate-950/70 ${
                      isCurrentSlide
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-video rounded overflow-hidden bg-slate-900">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white">
                        #{idx + 1}
                      </div>

                      {isCurrentSlide && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-cyan-500/90 text-[9px] font-semibold text-slate-950 flex items-center gap-1 shadow">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isVi ? 'Đang Chiếu' : 'Live'}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1">
                      <input
                        type="text"
                        value={img.name}
                        onChange={(e) => {
                          const updated = [...transitions.images];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          updateConfig({ images: updated });
                        }}
                        className="bg-transparent border-none text-xs font-medium text-slate-200 focus:outline-none focus:bg-slate-900 px-1 py-0.5 rounded flex-1 truncate"
                        placeholder="Image name"
                      />

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => jumpToSlide(idx)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                          title={isVi ? 'Tua tới ảnh này' : 'Jump to this slide'}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'up')}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title={isVi ? 'Chuyển lên trước' : 'Move up'}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === transitions.images.length - 1}
                          onClick={() => moveImage(idx, 'down')}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title={isVi ? 'Chuyển xuống sau' : 'Move down'}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteImage(img.id)}
                          className="p-1 rounded hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition-colors"
                          title={isVi ? 'Xóa ảnh này' : 'Delete image'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Timeline Scenes & Visualizer Preset Mixer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h4 className="font-semibold text-slate-200 text-sm">
                {isVi ? '2. Phối Trộn Cảnh & Đổi Kiểu Sóng Âm (Scenes Mixer)' : '2. Timeline Scenes & Visualizer Presets Mixer'}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 border border-slate-700">
                {transitions.scenes.length} {isVi ? 'mốc cảnh' : 'scenes'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isVi
                ? 'Thiết lập các mốc thời gian để sóng âm tự động biến đổi phong cách và hình nền chuyển cảnh mượt mà'
                : 'Define cue timestamps to morph visualizer styles and change backgrounds seamlessly as song plays'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddSceneAtCurrentTime}
              className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-purple-900/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isVi
                  ? `+ Thêm Cảnh Tại ${formatTime(currentTime)}`
                  : `+ Add Scene at ${formatTime(currentTime)}`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleAutoDistributeScenes}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVi ? 'Tự Động Phân Bổ Toàn Bài' : 'Auto Distribute Across Song'}</span>
            </button>
          </div>
        </div>

        {/* Scene Cards List */}
        {transitions.scenes.length === 0 ? (
          <div className="p-8 text-center border border-slate-800/80 rounded-xl bg-slate-950/40 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {isVi ? 'Chưa có mốc cảnh nào được tạo' : 'No timeline scenes created yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {isVi
                  ? 'Bấm "+ Thêm Cảnh Tại..." để đánh dấu vị trí khi nghe bài hát, hoặc bấm "Tự Động Phân Bổ Toàn Bài" để hệ thống tự phối trộn cho bạn!'
                  : 'Click "+ Add Scene at..." while listening to cue a beat drop, or click "Auto Distribute" to let the studio generate scenes!'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeScenes}
              className="text-xs px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium inline-flex items-center gap-2 shadow-lg shadow-purple-900/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isVi ? 'Tạo 4 Cảnh Đổi Sóng Âm Mẫu Ngay' : 'Generate 4 Sample Scenes Now'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transitions.scenes.map((scene, sIdx) => {
              const nextScene = transitions.scenes[sIdx + 1];
              const isSceneActive =
                currentTime >= scene.time && (!nextScene || currentTime < nextScene.time);

              return (
                <div
                  key={scene.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSceneActive
                      ? 'bg-slate-950/90 border-purple-500/70 ring-1 ring-purple-500/40'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  {/* Scene Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSceneActive ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sIdx + 1}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={scene.name}
                          onChange={(e) => {
                            const updated = [...transitions.scenes];
                            updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                            updateConfig({ scenes: updated });
                          }}
                          className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 px-1 py-0.5 text-xs font-semibold text-slate-200 focus:outline-none focus:bg-slate-900 rounded"
                          placeholder="Scene title"
                        />

                        {isSceneActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                            {isVi ? 'Đang Phát' : 'Active'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Timestamp Editor */}
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={duration || 600}
                          value={scene.time}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...transitions.scenes];
                            updated[sIdx] = { ...updated[sIdx], time: val };
                            updateConfig({ scenes: updated.sort((a, b) => a.time - b.time) });
                          }}
                          className="w-12 bg-transparent text-xs text-right font-mono font-semibold text-cyan-300 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400">s</span>
                        <span className="text-[10px] text-slate-400">({formatTime(scene.time)})</span>
                      </div>

                      {/* Jump to time button */}
                      <button
                        type="button"
                        onClick={() => onSeek(scene.time)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1"
                        title={isVi ? 'Tua tới giây này' : 'Seek to scene time'}
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span className="hidden sm:inline">{isVi ? 'Tua Tới' : 'Seek'}</span>
                      </button>

                      {/* Delete scene */}
                      <button
                        type="button"
                        onClick={() => deleteScene(scene.id)}
                        className="p-1 rounded hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition-colors"
                        title={isVi ? 'Xóa cảnh này' : 'Delete scene'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scene Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                    {/* Background Image Picker */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                        <span>{isVi ? 'Hình Nền Cảnh' : 'Scene Background'}</span>
                      </label>
                      <select
                        value={scene.imageId || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...transitions.scenes];
                          const foundImg = transitions.images.find((img) => img.id === val);
                          updated[sIdx] = {
                            ...updated[sIdx],
                            imageId: val || undefined,
                            imageUrl: foundImg ? foundImg.url : undefined,
                          };
                          updateConfig({ scenes: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">{isVi ? '(Giữ nguyên nền chung)' : '(Keep global background)'}</option>
                        {transitions.images.map((img, i) => (
                          <option key={img.id} value={img.id}>
                            #{i + 1} - {img.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visualizer Preset Style Picker */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-purple-400" />
                        <span>{isVi ? 'Kiểu Sóng Âm (Visualizer)' : 'Visualizer Style'}</span>
                      </label>
                      <select
                        value={scene.visualizerType || ''}
                        onChange={(e) => {
                          const updated = [...transitions.scenes];
                          updated[sIdx] = {
                            ...updated[sIdx],
                            visualizerType: (e.target.value as VisualizerType) || undefined,
                          };
                          updateConfig({ scenes: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="">{isVi ? '(Giữ kiểu hiện tại)' : '(Keep current style)'}</option>
                        {VISUALIZER_STYLE_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {isVi ? opt.nameVi : opt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Visualizer Colors */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-amber-400" />
                        <span>{isVi ? 'Màu Sóng Âm' : 'Visualizer Colors'}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 flex-1">
                          <input
                            type="color"
                            value={scene.visualizerPrimaryColor || currentVisualizer.primaryColor}
                            onChange={(e) => {
                              const updated = [...transitions.scenes];
                              updated[sIdx] = { ...updated[sIdx], visualizerPrimaryColor: e.target.value };
                              updateConfig({ scenes: updated });
                            }}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                            title="Primary color"
                          />
                          <input
                            type="color"
                            value={scene.visualizerSecondaryColor || currentVisualizer.secondaryColor}
                            onChange={(e) => {
                              const updated = [...transitions.scenes];
                              updated[sIdx] = { ...updated[sIdx], visualizerSecondaryColor: e.target.value };
                              updateConfig({ scenes: updated });
                            }}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                            title="Secondary color"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Transition Effect & Duration */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>{isVi ? 'Hiệu Ứng Chuyển Vào Cảnh' : 'Transition into Scene'}</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={scene.transitionType || 'fade'}
                          onChange={(e) => {
                            const updated = [...transitions.scenes];
                            updated[sIdx] = {
                              ...updated[sIdx],
                              transitionType: e.target.value as SceneTransitionType,
                            };
                            updateConfig({ scenes: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        >
                          {TRANSITION_TYPES_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {isVi ? opt.nameVi : opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: Live Transition Quick Tester */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isVi ? 'Thử Nhanh Các Hiệu Ứng Chuyển Cảnh:' : 'Audition Transition Effects:'}</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isVi
              ? 'Nhấp vào các nút dưới đây để xem trực tiếp hiệu ứng chuyển cảnh ngay trên khung hình'
              : 'Click any effect button below to preview how it animates on screen'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TRANSITION_TYPES_OPTIONS.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                updateConfig({
                  defaultTransition: type.id,
                  enabled: true,
                });
                // Small seek nudge to trigger the transition visually
                if (transitions.images.length >= 2) {
                  const interval = transitions.sliderInterval || 8;
                  const tDur = transitions.transitionDuration || 1.2;
                  onSeek(interval - tDur * 0.7);
                }
              }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                transitions.defaultTransition === type.id
                  ? 'bg-purple-900/50 border-purple-500 text-purple-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {type.icon}
              <span className="font-medium">{isVi ? type.nameVi.split(' ')[0] : type.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
