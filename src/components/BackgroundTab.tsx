import React, { useRef, useState } from 'react';
import { 
  BackgroundConfig, 
  ParticleConfig, 
  ParticleType, 
  ParticleShape, 
  ParticleColorMode, 
  BackgroundZoomTrigger, 
  BackgroundZoomStyle,
  BackgroundGlitchTrigger,
  BackgroundGlitchStyle 
} from '../types';
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
  Film,
  Circle,
  Square,
  Star,
  Heart,
  Gem,
  Palette,
  Activity,
  Gauge,
  Waves,
  Radio,
  Music2,
  Move3d,
  Disc,
  Tv,
  Layers,
  Split,
  ScanLine
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

const PARTICLE_SHAPES: { id: ParticleShape; nameVi: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'circle', nameVi: 'Hình tròn', icon: Circle },
  { id: 'square', nameVi: 'Khối vuông', icon: Square },
  { id: 'star', nameVi: 'Ngôi sao', icon: Star },
  { id: 'heart', nameVi: 'Trái tim', icon: Heart },
  { id: 'diamond', nameVi: 'Kim cương', icon: Gem },
  { id: 'ring', nameVi: 'Vòng tròn', icon: CircleDot },
];

const COLOR_MODES: { id: ParticleColorMode; nameVi: string; desc: string }[] = [
  { id: 'custom', nameVi: 'Tùy chọn màu', desc: 'Màu tùy chỉnh theo bảng màu' },
  { id: 'rainbow', nameVi: 'Cầu vồng (Rainbow)', desc: 'Chuyển sắc ngũ sắc huyền ảo' },
  { id: 'fire', nameVi: 'Lửa rực (Fire Glow)', desc: 'Tông cam vàng rực rỡ' },
  { id: 'neon-pulse', nameVi: 'Neon Cyber', desc: 'Hồng & Xanh Cyan đối lập' },
  { id: 'audio-reactive', nameVi: 'Phổ âm thanh', desc: 'Đổi dải màu theo tần số nhạc' },
];

const QUICK_COLORS = [
  { name: 'Trắng tuyết', color: '#ffffff' },
  { name: 'Hồng Neon', color: '#ec4899' },
  { name: 'Xanh Cyan', color: '#06b6d4' },
  { name: 'Vàng Kim', color: '#eab308' },
  { name: 'Tím Cyber', color: '#a855f7' },
  { name: 'Cam Lửa', color: '#f97316' },
  { name: 'Xanh Ngọc', color: '#10b981' },
];

const ZOOM_TRIGGERS: { id: BackgroundZoomTrigger; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bass', nameVi: 'Nhịp Bass / Trống Kick', desc: 'Bắt nhịp tiếng trống trầm, nhịp drop mạnh', icon: Disc },
  { id: 'beat', nameVi: 'Nhịp Điệu Tổng Thể (Beat)', desc: 'Bắt nhịp điệu bài hát, snare & tempo', icon: Music2 },
  { id: 'hybrid', nameVi: 'Kết Hợp Bass & Beat', desc: 'Phản hồi toàn dải nhịp sống động nhất', icon: Waves },
];

const ZOOM_STYLES: { id: BackgroundZoomStyle; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pulse', nameVi: 'Nảy Nhịp (Pulse)', desc: 'Giật nảy tức thì theo từng tiếng trống', icon: Zap },
  { id: 'smooth', nameVi: 'Mượt Mà (Cinematic)', desc: 'Co giãn điện ảnh êm dịu, uyển chuyển', icon: Waves },
  { id: 'shake', nameVi: 'Rung Lắc (EDM Shake)', desc: 'Rung giật điện tử bùng nổ theo giọt bass', icon: Activity },
  { id: 'breathe', nameVi: 'Thở Nhịp (Breathe)', desc: 'Co giãn tuần hoàn theo tần số thấp', icon: Move3d },
];

const SPEED_PRESETS = [
  { label: 'Chậm êm', value: 0.5 },
  { label: 'Chuẩn', value: 1.0 },
  { label: 'Nhanh', value: 1.8 },
  { label: 'Cực nhanh', value: 2.6 },
];

const GLITCH_TRIGGERS: { id: BackgroundGlitchTrigger; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bass', nameVi: 'Bass Kick', desc: 'Nhiễu giật mạnh mỗi khi đập trống trầm', icon: Disc },
  { id: 'beat', nameVi: 'Nhịp Beat', desc: 'Nhiễu theo nhịp điệu bài hát & tempo', icon: Music2 },
  { id: 'random', nameVi: 'Bất Chợt', desc: 'Nhiễu giật ngẫu nhiên tạo cảm giác bí ẩn', icon: Zap },
  { id: 'continuous', nameVi: 'Liên Tục', desc: 'Hiệu ứng nhiễu sóng chạy liên hồi không ngừng', icon: Activity },
];

const GLITCH_STYLES: { id: BackgroundGlitchStyle; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'rgb-shift', nameVi: 'Tách Màu RGB (Chromatic)', desc: 'Tách sắc quang Red/Cyan & Blue ma mị', icon: Split },
  { id: 'slice-displacement', nameVi: 'Cắt Lát Tearing (Glitch)', desc: 'Xé rách dịch chuyển lát ngang màn hình', icon: Layers },
  { id: 'vhs-tape', nameVi: 'Băng VHS Retro (Scanline)', desc: 'Vạch nhiễu quét băng video & gợn sóng', icon: ScanLine },
  { id: 'cyber-digital', nameVi: 'Cyber Data Matrix', desc: 'Số hóa dữ liệu khối giật chớp Cyberpunk', icon: Tv },
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
                  loading="lazy"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
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

        {/* Beat & Bass Zoom Settings Panel */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-cyan-500/30 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block">
                  Zoom Nền Theo Nhịp (Beat & Bass Zoom)
                </span>
                <span className="text-[10px] text-neutral-400">
                  Phóng to co giãn nền theo nhịp trống Kick & giai điệu
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={background.beatZoom}
                onChange={(e) => updateBg({ beatZoom: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {background.beatZoom && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              {/* 1. Nguồn nhịp (Trigger Audio Source) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Disc className="w-3 h-3 text-cyan-400" />
                  Nguồn bắt nhịp âm thanh (Audio Source)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {ZOOM_TRIGGERS.map((trig) => {
                    const Icon = trig.icon;
                    const isSelected = (background.zoomTrigger || 'bass') === trig.id;
                    return (
                      <button
                        key={trig.id}
                        type="button"
                        onClick={() => updateBg({ zoomTrigger: trig.id })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-neutral-500'}`} />
                          <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-cyan-200' : 'text-neutral-300'}`}>
                            {trig.id === 'bass' ? 'Bass Kick' : trig.id === 'beat' ? 'Nhịp Beat' : 'Bass + Beat'}
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-400 line-clamp-2 leading-tight">
                          {trig.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Kiểu chuyển động (Motion Style) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  Kiểu chuyển động Zoom (Motion Style)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ZOOM_STYLES.map((st) => {
                    const Icon = st.icon;
                    const isSelected = (background.zoomStyle || 'pulse') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateBg({ zoomStyle: st.id })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-neutral-500'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-cyan-200' : 'text-neutral-300'}`}>
                            {st.nameVi}
                          </span>
                          <span className="text-[9px] text-neutral-400 block leading-tight">
                            {st.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Tốc độ Zoom (Speed Setting: Slow to Fast) */}
              <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    Tốc độ phản hồi (Slow &rarr; Fast)
                  </span>
                  <span className="text-cyan-400 font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {(background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0).toFixed(1)}x{' '}
                    {(background.zoomSpeed || 1.0) <= 0.6 ? '(Chậm êm)' : (background.zoomSpeed || 1.0) >= 2.0 ? '(Cực nhanh)' : '(Chuẩn)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.0}
                  step={0.1}
                  value={background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0}
                  onChange={(e) => updateBg({ zoomSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                
                {/* Speed Quick Presets */}
                <div className="flex items-center gap-1 pt-1">
                  {SPEED_PRESETS.map((sp) => {
                    const currentSpeed = background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0;
                    const isActive = Math.abs(currentSpeed - sp.value) < 0.05;
                    return (
                      <button
                        key={sp.label}
                        type="button"
                        onClick={() => updateBg({ zoomSpeed: sp.value })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500 text-white font-bold shadow-sm'
                            : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {sp.label} ({sp.value}x)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Biên độ Zoom (Zoom Intensity Scale) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">Độ phóng to (Zoom Scale / Intensity)</span>
                  <span className="text-cyan-400 font-mono">
                    {((background.zoomIntensity !== undefined ? background.zoomIntensity : 0.05) * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.15}
                  step={0.005}
                  value={background.zoomIntensity !== undefined ? background.zoomIntensity : 0.05}
                  onChange={(e) => updateBg({ zoomIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 mt-0.5">
                  <span>Nhẹ nhàng (1%)</span>
                  <span>Vừa phải (5%)</span>
                  <span>Mạnh mẽ (15%)</span>
                </div>
              </div>

              {/* 5. Invert Zoom Direction */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                <div>
                  <span className="text-[11px] font-medium text-neutral-300 block">
                    Đảo chiều Zoom (Zoom Out khi có beat)
                  </span>
                  <span className="text-[9px] text-neutral-500">
                    Mặc định là phóng to ra (Zoom In), bật lên để thu nhỏ lại khi đập nhịp
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!background.zoomInvert}
                  onChange={(e) => updateBg({ zoomInvert: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 ml-2"
                />
              </label>
            </div>
          )}
        </div>

        {/* 2.2 Hiệu Ứng Nhiễu Sóng Nền (Background Glitch Effect) */}
        <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Tv className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block">
                  Hiệu Ứng Nhiễu Sóng Nền (Glitch Effect)
                </span>
                <span className="text-[10px] text-neutral-400">
                  Tách màu RGB, cắt lát xé hình & quét vạch VHS theo nhịp nhạc
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={background.glitchEffect || false}
                onChange={(e) => updateBg({ glitchEffect: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          {background.glitchEffect && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              {/* 1. Nguồn kích hoạt Glitch (Trigger) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Disc className="w-3 h-3 text-rose-400" />
                  Thời điểm kích hoạt giật nhiễu (Trigger)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {GLITCH_TRIGGERS.map((trig) => {
                    const Icon = trig.icon;
                    const isSelected = (background.glitchTrigger || 'bass') === trig.id;
                    return (
                      <button
                        key={trig.id}
                        type="button"
                        onClick={() => updateBg({ glitchTrigger: trig.id })}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-300' : 'text-neutral-500'}`} />
                        <span className={`text-[10px] font-semibold truncate ${isSelected ? 'text-rose-200' : 'text-neutral-300'}`}>
                          {trig.nameVi}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Kiểu nhiễu (Glitch Style) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-rose-400" />
                  Kiểu hiệu ứng Glitch (Glitch Style)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {GLITCH_STYLES.map((st) => {
                    const Icon = st.icon;
                    const isSelected = (background.glitchStyle || 'rgb-shift') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateBg({ glitchStyle: st.id })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-rose-300' : 'text-neutral-500'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-rose-200' : 'text-neutral-300'}`}>
                            {st.nameVi}
                          </span>
                          <span className="text-[9px] text-neutral-400 block leading-tight">
                            {st.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Cường độ Glitch (Intensity Slider) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">Cường độ xé hình & giật nhiễu</span>
                  <span className="text-rose-400 font-mono font-bold">
                    {Math.round((background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45}
                  onChange={(e) => updateBg({ glitchIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                
                {/* Intensity Quick Presets */}
                <div className="flex items-center gap-1 pt-1">
                  {[
                    { label: 'Nhẹ êm', val: 0.25 },
                    { label: 'Vừa phải', val: 0.45 },
                    { label: 'Mạnh mẽ', val: 0.75 },
                    { label: 'Bùng nổ', val: 1.0 },
                  ].map((p) => {
                    const cur = background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45;
                    const active = Math.abs(cur - p.val) < 0.05;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => updateBg({ glitchIntensity: p.val })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-rose-500 text-white font-bold shadow-sm'
                            : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Tách màu RGB (Chromatic Aberration Split) */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Split className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[11px] font-medium text-neutral-300 block">
                      Tách sắc sai quang học RGB (Color Split)
                    </span>
                    <span className="text-[9px] text-neutral-500">
                      Tạo viền bóng đỏ và xanh lam (Anaglyph 3D) khi có chấn động
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={background.glitchColorSplit !== false}
                  onChange={(e) => updateBg({ glitchColorSplit: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 ml-2"
                />
              </label>
            </div>
          )}
        </div>
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

        {/* Particle Controls & Customization */}
        {particles.enabled && particles.type !== 'none' && (
          <div className="space-y-4 pt-1">
            {/* A. Particle Shape Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Hình Dáng Hạt (Particle Shape)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PARTICLE_SHAPES.map((shapeItem) => {
                  const Icon = shapeItem.icon;
                  const currentShape = particles.shape || (particles.type === 'stars' ? 'star' : 'circle');
                  const isSelected = currentShape === shapeItem.id;
                  return (
                    <button
                      key={shapeItem.id}
                      onClick={() => updatePt({ shape: shapeItem.id })}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                      <span>{shapeItem.nameVi}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Color Mode Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  Phong Cách & Màu Sắc Hạt
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_MODES.map((mode) => {
                  const currentMode = particles.colorMode || 'custom';
                  const isSelected = currentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => updatePt({ colorMode: mode.id })}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{mode.nameVi}</span>
                      <span className="text-[10px] text-neutral-400 block truncate">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Pickers and Swatches (when custom or base color is used) */}
              {(!particles.colorMode || particles.colorMode === 'custom') && (
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">Màu chính của hạt:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={particles.color || '#ffffff'}
                        onChange={(e) => updatePt({ color: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-400 uppercase">{particles.color || '#ffffff'}</span>
                    </div>
                  </div>

                  {/* Secondary Flash Color */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                    <span className="text-xs text-neutral-300">Màu chớp sáng (Flash):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={particles.secondaryColor || '#ec4899'}
                        onChange={(e) => updatePt({ secondaryColor: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-400 uppercase">{particles.secondaryColor || '#ec4899'}</span>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {QUICK_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => updatePt({ color: c.color })}
                        title={c.name}
                        className="w-5 h-5 rounded-full border border-neutral-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* C. Dynamic Bass-Reactive Color & Flash on Beat Drop */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-neutral-900/90 to-cyan-950/30 border border-cyan-500/30 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-neutral-100 block">
                      Đổi Màu & Chớp Sáng Theo Bass (Bass Reactive Color)
                    </span>
                    <span className="text-[10px] text-neutral-400 leading-relaxed block">
                      Hạt bừng sáng rực rỡ và chuyển màu flash theo từng nhịp drop của bài hát
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={particles.bassReactiveColor ?? true}
                  onChange={(e) => updatePt({ bassReactiveColor: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 w-4 h-4 ml-2"
                />
              </label>

              {(particles.bassReactiveColor ?? true) && (
                <div className="pt-2 border-t border-cyan-500/20">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300">Độ bùng nổ chớp sáng (Flash Boost)</span>
                    <span className="text-cyan-400 font-mono">{(particles.bassFlashBoost || 1.5).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={particles.bassFlashBoost || 1.5}
                    onChange={(e) => updatePt({ bassFlashBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* D. Size Scale & Glow Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Kích thước hạt</span>
                  <span className="text-cyan-400 font-mono">{(particles.sizeScale || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={particles.sizeScale || 1.0}
                  onChange={(e) => updatePt({ sizeScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Độ phát sáng (Glow)</span>
                  <span className="text-cyan-400 font-mono">{particles.glowIntensity !== undefined ? particles.glowIntensity : 12}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={particles.glowIntensity !== undefined ? particles.glowIntensity : 12}
                  onChange={(e) => updatePt({ glowIntensity: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* E. Particle Density & Speed */}
            <div className="grid grid-cols-2 gap-3">
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

            {/* F. Reactive Movement to Beat */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={particles.reactiveToBeat}
                onChange={(e) => updatePt({ reactiveToBeat: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  Chuyển động & Kích thước giật theo nhịp Bass
                </span>
                <span className="text-[10px] text-neutral-400">
                  Hạt tăng tốc và phóng to khi trống kick dồn dập
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
