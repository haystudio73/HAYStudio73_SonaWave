import React, { useRef, useState } from 'react';
import { BackgroundConfig, ParticleConfig, ParticleType } from '../types';
import { BACKGROUND_PRESETS } from '../utils/presets';
import { 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Sliders, 
  CloudRain, 
  Eye, 
  Sun, 
  Maximize,
  CircleDot,
  Zap,
  Flame,
  Video,
  Film
} from 'lucide-react';

interface BackgroundTabProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  particles: ParticleConfig;
  onParticlesChange: (pt: ParticleConfig) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'lofi', name: 'Lofi & Chill' },
  { id: 'space', name: 'Vũ Trụ' },
  { id: 'nature', name: 'Thiên Nhiên' },
  { id: 'abstract', name: 'Nghệ Thuật' },
];

const PARTICLE_TYPES: { id: ParticleType; nameVi: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
  { id: 'none', nameVi: 'Tắt hạt', icon: Eye },
  { id: 'sound-sparks', nameVi: 'Tia lửa bốc (Sparks)', icon: Flame, badge: 'Rực Rỡ' },
  { id: 'rainbow-bubbles', nameVi: 'Bong bóng cầu vồng', icon: CircleDot, badge: 'Mới & Đẹp' },
  { id: 'hyperspace', nameVi: 'Tăng tốc Hyperspace', icon: Zap, badge: 'Mới 3D' },
  { id: 'dust', nameVi: 'Bụi lofi trôi', icon: Sparkles },
  { id: 'stars', nameVi: 'Sao lấp lánh', icon: Sparkles },
  { id: 'rain', nameVi: 'Mưa đêm rơi', icon: CloudRain },
];

export const BackgroundTab: React.FC<BackgroundTabProps> = ({
  background,
  onBackgroundChange,
  particles,
  onParticlesChange,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const updateBg = (partial: Partial<BackgroundConfig>) => {
    onBackgroundChange({ ...background, ...partial });
  };

  const updatePt = (partial: Partial<ParticleConfig>) => {
    onParticlesChange({ ...particles, ...partial });
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    updateBg({
      type: 'upload',
      isVideo: false,
      url,
    });
  };

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    updateBg({
      type: 'video',
      isVideo: true,
      url,
      videoUrl: url,
    });
  };

  const filteredPresets =
    activeCategory === 'all'
      ? BACKGROUND_PRESETS
      : BACKGROUND_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Background Source Selection (Preset, Custom Image / Video Upload) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Hình / Video Nền (Background Source)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title="Tải ảnh PNG/JPG từ máy tính"
            >
              <Upload className="w-3 h-3" />
              <span>Tải Ảnh</span>
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Tải video MP4 làm nền chuyển động"
            >
              <Video className="w-3 h-3 text-rose-400" />
              <span>Tải Video MP4</span>
            </button>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCustomImageUpload}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/*,.mp4,.mov,.webm"
          className="hidden"
          onChange={handleCustomVideoUpload}
        />

        {/* Video Mode Active Notice */}
        {background.isVideo && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="font-semibold">Đang phát nền Video MP4 động</span>
            </div>
            <button
              onClick={() => updateBg({ type: 'preset', isVideo: false, url: BACKGROUND_PRESETS[0].url })}
              className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-medium text-rose-300 transition-all cursor-pointer"
            >
              Trở về Preset Ảnh
            </button>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Preset Gallery Grid (From Pexels) */}
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl custom-scrollbar">
          {filteredPresets.map((preset) => {
            const isSelected = !background.isVideo && background.url === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => updateBg({ type: 'preset', isVideo: false, url: preset.url })}
                className={`relative aspect-video rounded-xl overflow-hidden border transition-all group cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-[0.98]'
                    : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.nameVi}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] font-medium text-white truncate drop-shadow">
                    {preset.nameVi}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Image Filters & Adjustments */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Bộ Lọc & Hiệu Ứng Nền (Filters)
        </label>

        {/* Blur slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Độ làm mờ (Blur)</span>
            <span className="text-cyan-400 font-mono">{background.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={background.blur}
            onChange={(e) => updateBg({ blur: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Độ sáng (Brightness)</span>
            <span className="text-cyan-400 font-mono">{background.brightness}%</span>
          </div>
          <input
            type="range"
            min={30}
            max={130}
            value={background.brightness}
            onChange={(e) => updateBg({ brightness: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Vignette Shadow */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Viền đen nghệ thuật (Vignette)</span>
            <span className="text-cyan-400 font-mono">{background.vignette}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={85}
            value={background.vignette}
            onChange={(e) => updateBg({ vignette: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Beat Zoom Toggle */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
          <input
            type="checkbox"
            checked={background.beatZoom}
            onChange={(e) => updateBg({ beatZoom: e.target.checked })}
            className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
          />
          <div>
            <span className="text-xs font-semibold text-neutral-200 block">
              Zoom nảy nền theo nhịp Bass (Beat Zoom)
            </span>
            <span className="text-[10px] text-neutral-400">
              Hình nền tự động zoom nhẹ theo từng nhịp trống kick
            </span>
          </div>
        </label>
      </div>

      {/* 3. Particle Overlays */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Hiệu Ứng Hạt Lơ Lửng (Particles)
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={particles.enabled}
              onChange={(e) => updatePt({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Particle Type Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {PARTICLE_TYPES.map((pt) => {
            const Icon = pt.icon;
            const isSelected = particles.type === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => updatePt({ type: pt.id, enabled: pt.id !== 'none' })}
                className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-semibold truncate">{pt.nameVi}</span>
                </div>
                {pt.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    {pt.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Particle Density & Speed */}
        {particles.enabled && particles.type !== 'none' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Số lượng hạt</span>
                <span className="text-cyan-400 font-mono">{particles.count}</span>
              </div>
              <input
                type="range"
                min={15}
                max={90}
                value={particles.count}
                onChange={(e) => updatePt({ count: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Tốc độ bay</span>
                <span className="text-cyan-400 font-mono">{particles.speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.5}
                step={0.1}
                value={particles.speed}
                onChange={(e) => updatePt({ speed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
