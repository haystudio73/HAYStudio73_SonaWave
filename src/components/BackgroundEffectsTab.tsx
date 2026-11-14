import React from 'react';
import { 
  BackgroundConfig, 
  ParticleConfig, 
  ParticleLayer,
  ParticleType, 
  ParticleShape, 
  ParticleColorMode, 
  SnowFlakeType,
  RainDropType,
  BackgroundZoomTrigger, 
  BackgroundZoomStyle,
  BackgroundGlitchTrigger,
  BackgroundGlitchStyle,
} from '../types';
import { createDefaultParticleLayer } from '../utils/presets';
import { Language } from '../utils/i18n';
import { 
  Sparkles, 
  Sliders, 
  CloudRain, 
  Eye, 
  EyeOff,
  Sun, 
  Maximize, 
  CircleDot, 
  Zap, 
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
  Tv, 
  Layers, 
  Slash, 
  CloudSnow,
  Wind,
  Snowflake,
  Droplet,
  Compass,
  Check,
  RotateCw,
  Shuffle,
  Feather,
  Plus,
  Trash2
} from 'lucide-react';

interface BackgroundEffectsTabProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  particles: ParticleConfig;
  onParticlesChange: (pt: ParticleConfig) => void;
  language?: Language;
}

const ZOOM_TRIGGERS: { id: BackgroundZoomTrigger; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bass', nameVi: 'Bass (Trống Sub Kick)', nameEn: 'Sub-Bass Kick', descVi: 'Phản ứng theo nhịp đập âm trầm mạnh mẽ', descEn: 'Reacts to deep low-end thuds', icon: Zap },
  { id: 'beat', nameVi: 'Beat (Nhịp Phách)', nameEn: 'Tempo / Transient', descVi: 'Bắt nhịp theo tiếng snare và tiết tấu bài hát', descEn: 'Pulsing on rhythmic beats', icon: Activity },
  { id: 'hybrid', nameVi: 'Kết Hợp (Hybrid Kick+Beat)', nameEn: 'Hybrid Dynamic', descVi: 'Hòa trộn cả dải bass trầm và nhịp điệu', descEn: 'Balances punch and rhythm', icon: Gauge },
];

const ZOOM_STYLES: { id: BackgroundZoomStyle; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pulse', nameVi: 'Đập Nhịp (Pulse Bounce)', nameEn: 'Pulse Bounce', descVi: 'Nảy bật mạnh mẽ theo từng cú kick rồi trở về', descEn: 'Punchy bounce on transients', icon: Zap },
  { id: 'smooth', nameVi: 'Điện Ảnh Mượt Mà (Cinematic Smooth)', nameEn: 'Cinematic Flow', descVi: 'Thu phóng lướt nhẹ nhàng, êm dịu phong cách phim', descEn: 'Gentle organic camera sway', icon: Waves },
  { id: 'shake', nameVi: 'Rung Giật EDM (Bass Shake)', nameEn: 'EDM Bass Shake', descVi: 'Rung chấn cực mạnh theo các nốt trầm cuồng nhiệt', descEn: 'Heavy vibrating rumble for drops', icon: Radio },
  { id: 'breathe', nameVi: 'Thở Nhẹ Nhàng (Ambient Breathe)', nameEn: 'Ambient Breathe', descVi: 'Co giãn tuần hoàn nhịp nhàng như hơi thở', descEn: 'Cyclic rhythmic inhalation', icon: Radio },
];

const GLITCH_TRIGGERS: { id: BackgroundGlitchTrigger; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bass', nameVi: 'Giật Theo Bass (Sub Kick)', nameEn: 'Bass Kick Trigger', descVi: 'Chỉ giật nhiễu khi tiếng trống bass đập mạnh', descEn: 'Flashes only on heavy bass punch', icon: Zap },
  { id: 'beat', nameVi: 'Giật Theo Beat (Nhịp Phách)', nameEn: 'Beat Pulse Trigger', descVi: 'Giật theo nhịp phách tiết tấu bài hát', descEn: 'Triggers on rhythmic tempo markers', icon: Activity },
  { id: 'random', nameVi: 'Ngẫu Nhiên (Random Spikes)', nameEn: 'Random Bursts', descVi: 'Giật bất ngờ tự nhiên như băng VHS lỗi', descEn: 'Spontaneous glitch bursts', icon: Radio },
  { id: 'continuous', nameVi: 'Liên Tục (Cyber Flow)', nameEn: 'Continuous Stream', descVi: 'Luôn giữ trạng thái sóng điện tử liên tục', descEn: 'Continuous digital cyber distortion', icon: Tv },
];

const GLITCH_STYLES: { id: BackgroundGlitchStyle; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'rgb-shift', nameVi: 'Tách Màu RGB (RGB Split)', nameEn: 'RGB Chromatic Shift', descVi: 'Lệch màu Đỏ - Xanh neon 3D sống động', descEn: 'Red & Cyan chromatic displacement', icon: Tv },
  { id: 'slice-displacement', nameVi: 'Cắt Lát Tearing (Glitch)', nameEn: 'Slice Displacement', descVi: 'Xé rách dịch chuyển lát ngang màn hình', descEn: 'Horizontal screen tearing blocks', icon: Layers },
  { id: 'vhs-tape', nameVi: 'Băng VHS Cổ Điển (90s Tape)', nameEn: 'Vintage 90s VHS', descVi: 'Vạch nhiễu sọc ngang băng từ analog', descEn: 'Tracking noise lines & vintage static', icon: Radio },
  { id: 'cyber-digital', nameVi: 'Kỹ Thuật Số Cyber (Matrix)', nameEn: 'Cyber Matrix Noise', descVi: 'Khối ô pixel điện tử tương lai', descEn: 'Futuristic digital grid artifacts', icon: Zap },
];

const PARTICLE_TYPES: { id: ParticleType; nameVi: string; nameEn: string; icon: React.ComponentType<{ className?: string }>; badgeVi?: string; badgeEn?: string }[] = [
  { id: 'none', nameVi: 'Tắt hạt', nameEn: 'Off', icon: Eye },
  { id: 'rain', nameVi: 'Mưa Rơi Tự Nhiên', nameEn: 'Natural Rain', icon: CloudRain, badgeVi: 'Vật Lý Mưa 🌧️', badgeEn: 'Rain Physics 🌧️' },
  { id: 'snow', nameVi: 'Tuyết Rơi Mùa Đông', nameEn: 'Winter Snowfall', icon: CloudSnow, badgeVi: 'Mùa Đông ❄️', badgeEn: 'Winter ❄️' },
  { id: 'speed-lines', nameVi: 'Vệt Tốc Độ (Speed Lines)', nameEn: 'Speed Lines', icon: Zap, badgeVi: 'Anime ⚡', badgeEn: 'Speed FX ⚡' },
  { id: 'spaghetti', nameVi: 'Mưa băng lụa', nameEn: 'Silk Ribbon Rain', icon: Waves, badgeVi: 'Mềm Mại 🎀', badgeEn: 'Silky 🎀' },
  { id: 'spinning-dashes', nameVi: 'Đoạn ngắn rơi & xoay', nameEn: 'Spinning Dashes', icon: Slash, badgeVi: 'Hot Trend', badgeEn: 'Trending' },
  { id: 'rainbow-bubbles', nameVi: 'Bong bóng cầu vồng', nameEn: 'Rainbow Bubbles', icon: CircleDot, badgeVi: 'Mới & Đẹp', badgeEn: 'Prismatic' },
  { id: 'hyperspace', nameVi: 'Tăng tốc Hyperspace', nameEn: 'Hyperspace 3D', icon: Zap, badgeVi: 'Mới 3D', badgeEn: '3D Warp' },
  { id: 'dust', nameVi: 'Bụi lofi trôi', nameEn: 'Lofi Ambient Dust', icon: Sparkles, badgeVi: 'Bóng Tơ ✨', badgeEn: 'Soft Fluff ✨' },
  { id: 'stars', nameVi: 'Sao lấp lánh', nameEn: 'Twinkling Stars', icon: Star, badgeVi: 'Lấp Lánh ⭐', badgeEn: 'Static Twinkle ⭐' },
  { id: 'fire-embers', nameVi: 'Những hạt lửa', nameEn: 'Fire Embers & Sparks', icon: Sun, badgeVi: 'Lửa & Tro 🔥', badgeEn: 'Embers 🔥' },
  { id: 'butterflies', nameVi: 'Đàn bướm phát sáng', nameEn: 'Butterflies', icon: Feather, badgeVi: 'Mới 🦋', badgeEn: 'Butterflies 🦋' },
];

const PARTICLE_COLOR_GROUPS = [
  {
    id: 'fire-ash',
    nameVi: 'Lửa & Tàn Tro',
    nameEn: 'Fire & Ash',
    primary: '#f97316',
    secondary: '#fef08a',
    swatches: ['#fef08a', '#f97316', '#dc2626', '#6b7280'],
  },
  {
    id: 'cyber-neon',
    nameVi: 'Cyberpunk Neon',
    nameEn: 'Cyberpunk Neon',
    primary: '#ec4899',
    secondary: '#06b6d4',
    swatches: ['#ec4899', '#06b6d4', '#a855f7', '#3b82f6'],
  },
  {
    id: 'winter-frost',
    nameVi: 'Băng Giá Mùa Đông',
    nameEn: 'Winter Frost',
    primary: '#bae6fd',
    secondary: '#38bdf8',
    swatches: ['#ffffff', '#e0f2fe', '#bae6fd', '#38bdf8'],
  },
  {
    id: 'golden-sparkle',
    nameVi: 'Hoàng Kim Lấp Lánh',
    nameEn: 'Golden Sparkle',
    primary: '#fbbf24',
    secondary: '#f59e0b',
    swatches: ['#fef08a', '#fbbf24', '#f59e0b', '#d97706'],
  },
  {
    id: 'prism-rainbow',
    nameVi: 'Cầu Vồng Prism',
    nameEn: 'Prism Rainbow',
    primary: '#a855f7',
    secondary: '#f43f5e',
    swatches: ['#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'],
  },
  {
    id: 'emerald-glow',
    nameVi: 'Dạ Quang Emerald',
    nameEn: 'Emerald Glow',
    primary: '#10b981',
    secondary: '#06b6d4',
    swatches: ['#a7f3d0', '#34d399', '#10b981', '#06b6d4'],
  },
  {
    id: 'mystic-violet',
    nameVi: 'Tím Ma Mị',
    nameEn: 'Mystic Violet',
    primary: '#c084fc',
    secondary: '#6366f1',
    swatches: ['#f3e8ff', '#d8b4fe', '#a855f7', '#6366f1'],
  },
  {
    id: 'pure-white',
    nameVi: 'Đơn Sắc Trắng',
    nameEn: 'Pure Monochrome',
    primary: '#ffffff',
    secondary: '#94a3b8',
    swatches: ['#ffffff', '#e2e8f0', '#94a3b8', '#475569'],
  },
];

export const BackgroundEffectsTab: React.FC<BackgroundEffectsTabProps> = ({
  background,
  onBackgroundChange,
  particles,
  onParticlesChange,
  language = 'vi',
}) => {
  const isVi = language === 'vi';

  const updateBg = (partial: Partial<BackgroundConfig>) => {
    onBackgroundChange({ ...background, ...partial });
  };

  const updatePt = (partial: Partial<ParticleConfig>) => {
    onParticlesChange({ ...particles, ...partial });
  };

  // Multi-layer particle system (Max 5 layers)
  const effectiveLayers: ParticleLayer[] = (particles.layers && particles.layers.length > 0)
    ? particles.layers
    : [
        {
          id: 'layer-1',
          name: isVi ? 'Lớp 1: Bụi Lofi' : 'Layer 1: Lofi Dust',
          enabled: particles.enabled !== false,
          type: particles.type,
          count: particles.count,
          speed: particles.speed,
          color: particles.color,
          secondaryColor: particles.secondaryColor,
          shape: particles.shape,
          colorMode: particles.colorMode,
          glowIntensity: particles.glowIntensity,
          sizeScale: particles.sizeScale,
          sizePx: particles.sizePx,
          randomSize: particles.randomSize,
          opacity: particles.opacity,
          rainGlow: particles.rainGlow,
          rainWindAngle: particles.rainWindAngle,
          rainWindSpeed: particles.rainWindSpeed,
          rainTurbulence: particles.rainTurbulence,
          rainDropType: particles.rainDropType,
          rainLengthScale: particles.rainLengthScale,
          rainSplash: particles.rainSplash,
          rainRandomWind: particles.rainRandomWind,
          rainRandomWindSpeed: particles.rainRandomWindSpeed,
          waterOnGlass: particles.waterOnGlass,
          snowShape: particles.snowShape,
          snowRandomShape: particles.snowRandomShape,
          snowWindAngle: particles.snowWindAngle,
          snowWindSpeed: particles.snowWindSpeed,
          snowTurbulence: particles.snowTurbulence,
          snowFlakeType: particles.snowFlakeType,
          speedLineOrientation: particles.speedLineOrientation,
          speedLineReverse: particles.speedLineReverse,
          speedLineMode: particles.speedLineMode,
          speedLineLength: particles.speedLineLength,
          speedLineRandomLength: particles.speedLineRandomLength,
          speedLineWidth: particles.speedLineWidth,
          speedLineBlur: particles.speedLineBlur,
          speedLineDirection: particles.speedLineDirection,
          speedLineTilt: particles.speedLineTilt,
          speedLineVerticalCenter: particles.speedLineVerticalCenter,
          speedLineCenterY: particles.speedLineCenterY,
          speedLineHorizontalCenter: particles.speedLineHorizontalCenter,
          speedLineCenterX: particles.speedLineCenterX,
          speedLineSpeed: particles.speedLineSpeed,
          ribbonWavy: particles.ribbonWavy,
          ribbonLength: particles.ribbonLength,
          ribbonThickness: particles.ribbonThickness,
          ribbonTwist: particles.ribbonTwist,
          ribbonGlow: particles.ribbonGlow,
          dustShape: particles.dustShape,
          dustRandomShape: particles.dustRandomShape,
          dustMinSize: particles.dustMinSize,
          silkFluffGlow: particles.silkFluffGlow,
          particleGlowRadius: particles.particleGlowRadius,
          hyperspaceLength: particles.hyperspaceLength,
          hyperspaceGlow: particles.hyperspaceGlow,
          starStatic: particles.starStatic,
          starShape: particles.starShape,
          starRandomFlare: particles.starRandomFlare,
          starFlareIntensity: particles.starFlareIntensity,
          fireEmbersShape: particles.fireEmbersShape,
          fireEmbersSpread: particles.fireEmbersSpread,
          fireEmbersCooling: particles.fireEmbersCooling,
          butterflySize: particles.butterflySize,
          butterflyWingSpeed: particles.butterflyWingSpeed,
          butterflyColorVariant: particles.butterflyColorVariant,
          butterflyTrail: particles.butterflyTrail,
        }
      ];

  const activeLayerId = particles.activeLayerId || effectiveLayers[0]?.id || 'layer-1';
  const activeLayer = effectiveLayers.find(l => l.id === activeLayerId) || effectiveLayers[0];

  const updateActiveLayer = (partial: Partial<ParticleLayer>) => {
    const updatedLayers = effectiveLayers.map(l => {
      if (l.id === activeLayer.id) {
        return { ...l, ...partial };
      }
      return l;
    });

    const updatedActive = { ...activeLayer, ...partial };
    onParticlesChange({
      ...particles,
      layers: updatedLayers,
      activeLayerId: activeLayer.id,
      type: updatedActive.type,
      count: updatedActive.count,
      speed: updatedActive.speed,
      color: updatedActive.color,
      secondaryColor: updatedActive.secondaryColor,
      shape: updatedActive.shape,
      colorMode: updatedActive.colorMode,
      glowIntensity: updatedActive.glowIntensity,
      sizeScale: updatedActive.sizeScale,
      sizePx: updatedActive.sizePx,
      randomSize: updatedActive.randomSize,
      opacity: updatedActive.opacity,
      ...partial,
    });
  };

  const handleAddLayer = () => {
    if (effectiveLayers.length >= 5) return;
    const usedTypes = effectiveLayers.map(l => l.type);
    const candidateTypes: ParticleType[] = ['butterflies', 'fire-embers', 'stars', 'dust', 'snow', 'rain', 'rainbow-bubbles', 'hyperspace', 'speed-lines', 'spaghetti', 'spinning-dashes'];
    const nextType = candidateTypes.find(t => !usedTypes.includes(t)) || 'butterflies';
    const newLayer = createDefaultParticleLayer(nextType, effectiveLayers.length + 1);
    const updatedLayers = [...effectiveLayers, newLayer];
    onParticlesChange({
      ...particles,
      layers: updatedLayers,
      activeLayerId: newLayer.id,
    });
  };

  const handleDeleteLayer = (layerId: string) => {
    if (effectiveLayers.length <= 1) return;
    const updatedLayers = effectiveLayers.filter(l => l.id !== layerId);
    const nextActiveId = activeLayerId === layerId ? (updatedLayers[0]?.id || 'layer-1') : activeLayerId;
    onParticlesChange({
      ...particles,
      layers: updatedLayers,
      activeLayerId: nextActiveId,
    });
  };

  const handleToggleLayerEnabled = (layerId: string) => {
    const updatedLayers = effectiveLayers.map(l => {
      if (l.id === layerId) {
        return { ...l, enabled: !l.enabled };
      }
      return l;
    });
    onParticlesChange({
      ...particles,
      layers: updatedLayers,
    });
  };

  const setActiveLayer = (id: string) => {
    onParticlesChange({
      ...particles,
      layers: effectiveLayers,
      activeLayerId: id,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-cyan-950/40 p-4 rounded-2xl border border-neutral-800 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isVi ? 'Hiệu Ứng Nền (Background Effects)' : 'Background Effects & Dynamics'}
            </h2>
            <p className="text-xs text-neutral-400">
              {isVi 
                ? 'Bộ lọc màu, phóng to theo nhịp, nhiễu sóng glitch, sóng gợn tròn và hệ thống hạt lơ lửng' 
                : 'Filters, beat-reactive zoom, glitch distortions, circular ripples, and floating particle overlay physics'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Bộ Lọc & Hiệu Ứng Nền (Filters) */}
      <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            {isVi ? '1. Bộ Lọc & Hiệu Ứng Nền (Filters)' : '1. Background Filters & Optics'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blur Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ mờ làm nhòe (Blur)' : 'Blur'}</span>
              <span className="text-cyan-400 font-mono font-bold">{background.blur}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={background.blur}
              onChange={(e) => updateBg({ blur: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Brightness Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ sáng (Brightness)' : 'Brightness'}</span>
              <span className="text-cyan-400 font-mono font-bold">{background.brightness}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={background.brightness}
              onChange={(e) => updateBg({ brightness: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Contrast Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ tương phản (Contrast)' : 'Contrast'}</span>
              <span className="text-cyan-400 font-mono font-bold">{background.contrast}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              value={background.contrast}
              onChange={(e) => updateBg({ contrast: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Vignette Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Tối bốn góc (Vignette)' : 'Vignette'}</span>
              <span className="text-cyan-400 font-mono font-bold">{background.vignette}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={background.vignette}
              onChange={(e) => updateBg({ vignette: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        {/* Film Grain Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-neutral-800/80">
          <input
            type="checkbox"
            checked={background.filmGrain}
            onChange={(e) => updateBg({ filmGrain: e.target.checked })}
            className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
          />
          <div>
            <span className="text-xs font-semibold text-neutral-200 block">
              {isVi ? 'Hạt nhiễu phim cổ điển (Film Grain Noise)' : 'Vintage Film Grain Noise'}
            </span>
            <span className="text-[10px] text-neutral-400">
              {isVi ? 'Tạo lớp hạt sần nhẹ phong cách phim nhựa cinematic' : 'Adds organic micro-texture film noise'}
            </span>
          </div>
        </label>
      </div>

      {/* 2. Zoom Nền Theo Nhịp (Beat & Bass Zoom) */}
      <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Maximize className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {isVi ? '2. Zoom Nền Theo Nhịp (Beat & Bass Zoom)' : '2. Beat & Bass Zoom Dynamics'}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {isVi ? 'Thu phóng nền động bùng nổ theo nhịp trống và âm trầm' : 'Pulsates background rhythmically with kicks'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={background.beatZoom}
            onChange={(e) => updateBg({ beatZoom: e.target.checked })}
            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
          />
        </div>

        {background.beatZoom && (
          <div className="space-y-4 pt-1">
            {/* Trigger Mode */}
            <div>
              <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                {isVi ? 'Nguồn kích hoạt (Audio Trigger)' : 'Audio Trigger Source'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ZOOM_TRIGGERS.map((trig) => {
                  const Icon = trig.icon;
                  const isSelected = (background.zoomTrigger || 'bass') === trig.id;
                  return (
                    <button
                      key={trig.id}
                      type="button"
                      onClick={() => updateBg({ zoomTrigger: trig.id })}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-white' 
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
                        <span className="text-xs font-semibold">{isVi ? trig.nameVi : trig.nameEn}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block line-clamp-1">
                        {isVi ? trig.descVi : trig.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Curve Style */}
            <div>
              <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                {isVi ? 'Kiểu chuyển động Zoom (Motion Curve)' : 'Motion Curve Style'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ZOOM_STYLES.map((st) => {
                  const Icon = st.icon;
                  const isSelected = (background.zoomStyle || 'pulse') === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateBg({ zoomStyle: st.id })}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-white' 
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-neutral-500'}`} />
                        <span className="text-xs font-semibold">{isVi ? st.nameVi : st.nameEn}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block line-clamp-1">
                        {isVi ? st.descVi : st.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intensity & Speed Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Biên độ thu phóng (Zoom %)' : 'Zoom Intensity'}</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {Math.round(((background.zoomIntensity !== undefined ? background.zoomIntensity : 0.05) * 100))}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.15}
                  step={0.01}
                  value={background.zoomIntensity !== undefined ? background.zoomIntensity : 0.05}
                  onChange={(e) => updateBg({ zoomIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Tốc độ phản hồi nhịp' : 'Zoom Speed'}</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {(background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0).toFixed(1)}x
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
              </div>
            </div>

            {/* Invert Zoom Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-neutral-800/80">
              <input
                type="checkbox"
                checked={background.zoomInvert || false}
                onChange={(e) => updateBg({ zoomInvert: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  {isVi ? 'Đảo chiều thu phóng (Zoom Out khi có Beat)' : 'Invert Direction (Zoom Out on beat)'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Mặc định là phóng to ra (Zoom In), tích chọn để co nhỏ lại khi đập nhịp' : 'Default zooms outward; enable to compress inward on kicks'}
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* 3. Hiệu Ứng Nhiễu Sóng Nền (Glitch Effect) */}
      <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-purple-400" />
            <div>
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {isVi ? '3. Hiệu Ứng Nhiễu Sóng Nền (Glitch Effect)' : '3. Background Glitch & Scanline Effect'}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {isVi ? 'Xé hình kỹ thuật số, lệch màu RGB Chromatic và sọc băng VHS' : 'RGB chromatic splits, tape tearing and digital scanline glitch'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={background.glitchEffect || false}
            onChange={(e) => updateBg({ glitchEffect: e.target.checked })}
            className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 bg-neutral-800 border-neutral-700 cursor-pointer"
          />
        </div>

        {background.glitchEffect && (
          <div className="space-y-4 pt-1">
            {/* Glitch Trigger */}
            <div>
              <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                {isVi ? 'Thời điểm kích hoạt giật nhiễu (Trigger)' : 'Glitch Trigger'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GLITCH_TRIGGERS.map((trig) => {
                  const Icon = trig.icon;
                  const isSelected = (background.glitchTrigger || 'bass') === trig.id;
                  return (
                    <button
                      key={trig.id}
                      type="button"
                      onClick={() => updateBg({ glitchTrigger: trig.id })}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500/60 text-white' 
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-neutral-500'}`} />
                        <span className="text-xs font-semibold">{isVi ? trig.nameVi : trig.nameEn}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block line-clamp-1">
                        {isVi ? trig.descVi : trig.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Glitch Style */}
            <div>
              <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                {isVi ? 'Kiểu hiệu ứng Glitch (Visual Style)' : 'Glitch Visual Style'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GLITCH_STYLES.map((st) => {
                  const Icon = st.icon;
                  const isSelected = (background.glitchStyle || 'rgb-shift') === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateBg({ glitchStyle: st.id })}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500/60 text-white' 
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-neutral-500'}`} />
                        <span className="text-xs font-semibold">{isVi ? st.nameVi : st.nameEn}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block line-clamp-1">
                        {isVi ? st.descVi : st.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Glitch Intensity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{isVi ? 'Cường độ xé hình & giật nhiễu' : 'Glitch Intensity'}</span>
                <span className="text-purple-400 font-mono font-bold">
                  {Math.round(((background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45) * 100))}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45}
                onChange={(e) => updateBg({ glitchIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Color Split Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-neutral-800/80">
              <input
                type="checkbox"
                checked={background.glitchColorSplit !== false}
                onChange={(e) => updateBg({ glitchColorSplit: e.target.checked })}
                className="rounded text-purple-500 focus:ring-purple-500 bg-neutral-800 border-neutral-700 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  {isVi ? 'Tách sắc sai màu quang học (RGB Chromatic Split)' : 'RGB Chromatic Color Fringe Split'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Phân tách 2 kênh màu đỏ & xanh cyan rực rỡ khi giật' : 'Separates red & cyan channel layers during glitches'}
                </span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* 4. Hiệu Ứng Sóng Gợn Tròn (Circle Ripple) */}
      <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {isVi ? '4. Hiệu Ứng Sóng Gợn Tròn (Circle Ripple)' : '4. Concentric Circle Ripple Wave Effect'}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {isVi ? 'Vòng sóng tròn đồng tâm lan tỏa phản hồi nhịp nhàng theo nhạc' : 'Expanding concentric circular water ripples bouncing with beats'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={background.circleRipple || false}
            onChange={(e) => updateBg({ circleRipple: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-800 border-neutral-700 cursor-pointer"
          />
        </div>

        {background.circleRipple && (
          <div className="space-y-4 pt-1">
            {/* Origin Position */}
            <div>
              <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                {isVi ? 'Tâm điểm lan tỏa sóng' : 'Ripple Center Origin'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'center', labelVi: 'Chính Giữa', labelEn: 'Center' },
                  { id: 'bottom', labelVi: 'Đáy Màn Hình', labelEn: 'Bottom Center' },
                  { id: 'cover', labelVi: 'Tâm Bìa Nhạc', labelEn: 'Album Center' },
                ].map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => updateBg({ circleRippleOrigin: org.id as any })}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      (background.circleRippleOrigin || 'center') === org.id
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {isVi ? org.labelVi : org.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Ripple Color */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl flex-1">
                <input
                  type="color"
                  value={background.circleRippleColor || '#ffffff'}
                  onChange={(e) => updateBg({ circleRippleColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-neutral-300">
                  {background.circleRippleColor || '#ffffff'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {['#ffffff', '#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateBg({ circleRippleColor: hex })}
                    style={{ backgroundColor: hex }}
                    className="w-5 h-5 rounded-full border border-neutral-700 hover:scale-110 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            </div>

            {/* Controls Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Số vòng tròn sóng' : 'Ripple Wave Count'}</span>
                  <span className="text-emerald-400 font-mono font-bold">{background.circleRippleCount || 4}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={background.circleRippleCount || 4}
                  onChange={(e) => updateBg({ circleRippleCount: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Tốc độ lan tỏa sóng' : 'Ripple Expansion Speed'}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {(background.circleRippleSpeed || 1.0).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={background.circleRippleSpeed || 1.0}
                  onChange={(e) => updateBg({ circleRippleSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Độ mờ đường sóng' : 'Ripple Opacity'}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round((background.circleRippleOpacity || 0.4) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.05}
                  value={background.circleRippleOpacity || 0.4}
                  onChange={(e) => updateBg({ circleRippleOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Độ dày nét viền sóng' : 'Ripple Line Width'}</span>
                  <span className="text-emerald-400 font-mono font-bold">{background.circleRippleLineWidth || 2.5}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={background.circleRippleLineWidth || 2.5}
                  onChange={(e) => updateBg({ circleRippleLineWidth: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Ripple Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={background.circleRippleReactive !== false}
                  onChange={(e) => updateBg({ circleRippleReactive: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  {isVi ? 'Phản hồi bùng nổ theo Bass' : 'Pulse & Expand with Bass'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={background.circleRippleGlow !== false}
                  onChange={(e) => updateBg({ circleRippleGlow: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                />
                <span className="text-xs text-neutral-300 font-medium">
                  {isVi ? 'Hào quang phát sáng Neon' : 'Neon Luminous Glow'}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 5. Hiệu Ứng Hạt Lơ Lửng (Particles) */}
      <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {isVi ? '5. Hiệu Ứng Hạt Lơ Lửng (Particles)' : '5. Floating Particle Overlays'}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {isVi ? 'Mưa, tuyết rơi mùa đông, vệt tốc độ anime, ruy băng lụa mềm và bụi lofi 2D sắc nét' : 'Rain, snow, anime speed lines, silk ribbons, and crisp 2D lofi drifting particles'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={particles.enabled}
            onChange={(e) => updatePt({ enabled: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
          />
        </div>

        {particles.enabled && (
          <div className="space-y-4 pt-1">
            {/* Global Particle Controls (Áp dụng cho toàn bộ các layer hạt) */}
            <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/90 space-y-3">
              <div className="flex items-center gap-2 text-xs text-neutral-300 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{isVi ? 'Cài Đặt Toàn Cục (Áp Dụng Cho Toàn Bộ Các Lớp Hạt)' : 'Global Audio Reactivity (Applies to All FX Layers)'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800">
                  <input
                    type="checkbox"
                    checked={particles.reactiveToBeat}
                    onChange={(e) => updatePt({ reactiveToBeat: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs text-neutral-200 font-medium block">
                      {isVi ? '⚡ Tăng tốc theo nhịp Beat' : '⚡ Accelerate on Beats'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isVi ? 'Tất cả các lớp hạt tăng tốc khi có nhịp phách' : 'All particle layers accelerate on beats'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800">
                  <input
                    type="checkbox"
                    checked={particles.bassReactiveColor}
                    onChange={(e) => updatePt({ bassReactiveColor: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs text-neutral-200 font-medium block">
                      {isVi ? '🔥 Bừng sáng theo Bass Drop' : '🔥 Flash Brighter on Bass Drop'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isVi ? 'Tất cả các lớp hạt chớp sáng rực rỡ khi bass đập' : 'All particle layers flash luminous on bass kicks'}
                    </span>
                  </div>
                </label>
              </div>

              {particles.bassReactiveColor && (
                <div className="pt-1 px-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Cường độ chớp sáng Bass Drop' : 'Bass Flash Boost'}</span>
                    <span className="text-amber-400 font-mono font-bold">{(particles.bassFlashBoost ?? 1.5).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={particles.bassFlashBoost ?? 1.5}
                    onChange={(e) => updatePt({ bassFlashBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Multi-Layer Management Toolbar (Max 5 Layers) */}
            <div className="bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isVi ? 'Danh Sách Lớp Hiệu Ứng (Particle Layers)' : 'Particle FX Layers'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {effectiveLayers.length}/5 {isVi ? 'lớp (Max 5)' : 'layers (Max 5)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddLayer}
                  disabled={effectiveLayers.length >= 5}
                  title={isVi ? 'Thêm Lớp Hạt Hiệu Ứng' : 'Add Particle FX Layer'}
                  aria-label={isVi ? 'Thêm Lớp Hạt' : 'Add Layer'}
                  className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    effectiveLayers.length >= 5
                      ? 'bg-neutral-800/60 text-neutral-500 border border-neutral-700/50 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95'
                  }`}
                >
                  <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">{isVi ? 'Thêm Lớp Hạt' : 'Add Layer'}</span>
                </button>
              </div>

              {/* Layer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {effectiveLayers.map((layer, idx) => {
                  const isSelected = layer.id === activeLayer.id;
                  const ptInfo = PARTICLE_TYPES.find(t => t.id === layer.type) || PARTICLE_TYPES[1];
                  const Icon = ptInfo.icon;
                  return (
                    <div
                      key={layer.id}
                      onClick={() => setActiveLayer(layer.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/70 shadow-sm shadow-amber-500/10'
                          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                              {layer.name || (isVi ? `Lớp ${idx + 1}` : `Layer ${idx + 1}`)}
                            </span>
                            {!layer.enabled && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">
                                {isVi ? 'Ẩn' : 'Off'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 block truncate">
                            {isVi ? ptInfo.nameVi : ptInfo.nameEn}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleLayerEnabled(layer.id)}
                          title={layer.enabled ? (isVi ? 'Ẩn lớp này' : 'Hide layer') : (isVi ? 'Hiện lớp này' : 'Show layer')}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            layer.enabled
                              ? 'text-amber-400 hover:bg-amber-500/20'
                              : 'text-neutral-500 hover:bg-neutral-800'
                          }`}
                        >
                          {layer.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLayer(layer.id)}
                          disabled={effectiveLayers.length <= 1}
                          title={effectiveLayers.length <= 1 ? (isVi ? 'Cần giữ ít nhất 1 lớp' : 'Keep at least 1 layer') : (isVi ? 'Xóa lớp này' : 'Delete layer')}
                          className={`p-1 rounded-lg transition-colors ${
                            effectiveLayers.length <= 1
                              ? 'text-neutral-600 cursor-not-allowed'
                              : 'text-neutral-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Currently Selected Layer Settings */}
            <div className="bg-neutral-900/70 p-3.5 rounded-xl border border-neutral-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isVi ? 'Đang chỉnh:' : 'Editing Layer:'}
                  </span>
                  <input
                    type="text"
                    value={activeLayer.name || ''}
                    placeholder={isVi ? 'Tên lớp...' : 'Layer name...'}
                    onChange={(e) => updateActiveLayer({ name: e.target.value })}
                    className="text-xs font-semibold bg-neutral-950/80 border border-neutral-700/80 focus:border-amber-500 px-2.5 py-1 rounded-lg text-amber-300 outline-none max-w-[200px]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400">{isVi ? 'Trạng thái lớp:' : 'Status:'}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeLayer.enabled}
                      onChange={(e) => updateActiveLayer({ enabled: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                    <span className={`font-semibold ${activeLayer.enabled ? 'text-green-400' : 'text-neutral-500'}`}>
                      {activeLayer.enabled ? (isVi ? 'Đang bật' : 'Active') : (isVi ? 'Đang ẩn' : 'Hidden')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Particle Types Selection Grid for active layer */}
              <div>
                <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                  {isVi ? 'Kiểu hiệu ứng hạt của lớp này (11 Effects)' : 'Layer Visual Effect (11 Effects)'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {PARTICLE_TYPES.map((pt) => {
                    const Icon = pt.icon;
                    const isSelected = activeLayer.type === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => updateActiveLayer({ type: pt.id })}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                          isSelected 
                            ? 'bg-amber-500/20 border-amber-500/60 text-white' 
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                          <span className="text-xs font-semibold">{isVi ? pt.nameVi : pt.nameEn}</span>
                        </div>
                        {(pt.badgeVi || pt.badgeEn) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {isVi ? pt.badgeVi : pt.badgeEn}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            {activeLayer.type !== 'none' && (() => {
              const currentLayer = activeLayer;
              const updateLayer = (partial: Partial<ParticleLayer>) => updateActiveLayer(partial);
              return (

              <div className="space-y-4 pt-2 border-t border-neutral-800/80">
                {/* Sliders: Count & Speed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Số lượng hạt' : 'Particle Count'}</span>
                      <span className="text-amber-400 font-mono font-bold">{currentLayer.count}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={250}
                      value={currentLayer.count}
                      onChange={(e) => updateLayer({ count: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Particle Speed Slider with quick chips down to 0.01x */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Tốc độ bay' : 'Particle Speed'}</span>
                      <span className="text-amber-400 font-mono font-bold">{currentLayer.speed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.01}
                      max={3.0}
                      step={0.01}
                      value={currentLayer.speed}
                      onChange={(e) => updateLayer({ speed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex items-center gap-1 mt-1.5">
                      {[0.01, 0.2, 0.5, 1.0, 2.0].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => updateLayer({ speed: spd })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            currentLayer.speed === spd
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Particle Opacity & Size Scale */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Độ trong suốt (Opacity)' : 'Opacity'}</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {Math.round((currentLayer.opacity ?? 0.85) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={currentLayer.opacity ?? 0.85}
                      onChange={(e) => updateLayer({ opacity: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div>
                    {(() => {
                      const currentSizePx =
                        currentLayer.sizePx !== undefined
                          ? Math.max(1, currentLayer.sizePx)
                          : currentLayer.type === 'dust'
                          ? Math.max(1, currentLayer.dustMinSize ?? 2)
                          : Math.max(1, Math.round((currentLayer.sizeScale || 1.0) * 6));
                      return (
                        <>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">
                              {isVi ? 'Kích thước hạt (Pixel)' : 'Particle Size (px)'}
                            </span>
                            <span className="text-amber-400 font-mono font-bold">
                              {currentSizePx}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={30}
                            step={1}
                            value={currentSizePx}
                            onChange={(e) => {
                              const px = Math.max(1, parseInt(e.target.value));
                              updateLayer({
                                sizePx: px,
                                sizeScale: Number((px / 6).toFixed(2)),
                                ...(currentLayer.type === 'dust' ? { dustMinSize: px, silkFluffGlow: false } : {}),
                              });
                            }}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <div className="flex items-center gap-1 mt-1.5">
                            {[1, 2, 4, 6, 10, 16].map((px) => (
                              <button
                                key={px}
                                type="button"
                                onClick={() =>
                                  updateLayer({
                                    sizePx: px,
                                    sizeScale: Number((px / 6).toFixed(2)),
                                    ...(currentLayer.type === 'dust' ? { dustMinSize: px, silkFluffGlow: false } : {}),
                                  })
                                }
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                                  currentSizePx === px
                                    ? 'bg-amber-500 text-neutral-950 font-bold'
                                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                }`}
                              >
                                {px}px
                              </button>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Particle Random Size Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={currentLayer.randomSize || false}
                    onChange={(e) => updateLayer({ randomSize: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-neutral-200 block">
                      {isVi ? 'Kích cỡ hạt ngẫu nhiên (1px → Kích thước hiện hành)' : 'Randomize Particle Sizes (1px → Current Size)'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {isVi ? 'Hạt 2D lớn nhỏ xen kẽ tự nhiên từ 1px tạo chiều sâu không gian' : 'Blends 1px micro & macro 2D particles for depth'}
                    </span>
                  </div>
                </label>

                {/* Curated Color Groups for Primary Particle Color */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-amber-400" />
                        {isVi ? 'Nhóm Màu Sắc Chính Của Hạt (Color Groups)' : 'Primary Particle Color Groups'}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {isVi ? 'Chạm để áp dụng bộ màu hoặc chọn từng ô màu' : 'Click group or individual swatch'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PARTICLE_COLOR_GROUPS.map((grp) => {
                        const isActiveGroup = currentLayer.color.toLowerCase() === grp.primary.toLowerCase();
                        return (
                          <div
                            key={grp.id}
                            onClick={() => updateLayer({ color: grp.primary, secondaryColor: grp.secondary, colorMode: 'custom' })}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isActiveGroup
                                ? 'bg-amber-500/15 border-amber-500/60 text-white'
                                : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            <div className="text-[11px] font-semibold truncate mb-1.5">
                              {isVi ? grp.nameVi : grp.nameEn}
                            </div>
                            <div className="flex items-center gap-1">
                              {grp.swatches.map((hex) => (
                                <button
                                  key={hex}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateLayer({ color: hex, secondaryColor: grp.secondary, colorMode: 'custom' });
                                  }}
                                  style={{ backgroundColor: hex }}
                                  className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 cursor-pointer ${
                                    currentLayer.color.toLowerCase() === hex.toLowerCase()
                                      ? 'border-white ring-1 ring-amber-400 scale-110'
                                      : 'border-neutral-700'
                                  }`}
                                  title={hex}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual Primary & Secondary Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Màu sắc chính của hạt' : 'Primary Particle Color'}
                      </span>
                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                        <input
                          type="color"
                          value={currentLayer.color.startsWith('#') ? currentLayer.color : '#ffffff'}
                          onChange={(e) => updateLayer({ color: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-neutral-300">{currentLayer.color}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Màu phụ / Vệt sáng thứ hai' : 'Secondary Accent Color'}
                      </span>
                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
                        <input
                          type="color"
                          value={currentLayer.secondaryColor || '#ec4899'}
                          onChange={(e) => updateLayer({ secondaryColor: e.target.value })}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-neutral-300">{currentLayer.secondaryColor || '#ec4899'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===================================================================== */}
                {/* DEDICATED SETTINGS VISIBLE ONLY FOR EACH SPECIFIC PARTICLE TYPE       */}
                {/* ===================================================================== */}

                {/* A. MƯA RƠI TỰ NHIÊN (RAIN) */}
                {currentLayer.type === 'rain' && (
                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                      <CloudRain className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Hiệu Ứng Mưa (Rain Settings)' : 'Rain Specific Settings'}</span>
                    </div>

                    {/* Độ dài giọt mưa & Chiều gió */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ dài vệt mưa (px)' : 'Raindrop Streak Length (px)'}</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {Math.round((currentLayer.rainLengthScale ?? 1.2) * 24)}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.4}
                          max={3.5}
                          step={0.1}
                          value={currentLayer.rainLengthScale ?? 1.2}
                          onChange={(e) => updateLayer({ rainLengthScale: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Chiều gió thổi (Góc nghiêng)' : 'Wind Direction Angle'}</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {currentLayer.rainWindAngle ?? 10}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-45}
                          max={45}
                          step={1}
                          disabled={Boolean(currentLayer.rainRandomWind)}
                          value={currentLayer.rainWindAngle ?? 10}
                          onChange={(e) => updateLayer({ rainWindAngle: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
                        />
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[
                            { labelVi: '↖ Gió Trái (-25°)', labelEn: '↖ Left (-25°)', val: -25 },
                            { labelVi: '↓ Thẳng (0°)', labelEn: '↓ Straight (0°)', val: 0 },
                            { labelVi: '↗ Gió Phải (+25°)', labelEn: '↗ Right (+25°)', val: 25 },
                          ].map((w) => (
                            <button
                              key={w.val}
                              type="button"
                              onClick={() => updateLayer({ rainWindAngle: w.val, rainRandomWind: false })}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all cursor-pointer ${
                                !currentLayer.rainRandomWind && (currentLayer.rainWindAngle ?? 10) === w.val
                                  ? 'bg-cyan-500/30 border-cyan-400 text-white'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {isVi ? w.labelVi : w.labelEn}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Chiều gió ngẫu nhiên thay đổi + Vệt sáng + Nước chảy trên bề mặt */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <label className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentLayer.rainRandomWind || false}
                          onChange={(e) => updateLayer({ rainRandomWind: e.target.checked })}
                          className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-200 block">
                            {isVi ? 'Chiều gió ngẫu nhiên thay đổi' : 'Dynamic Shifting Wind'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isVi ? 'Gió tự đổi chiều trái/phải tự nhiên' : 'Natural shifting wind gusts'}
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentLayer.rainGlow !== false}
                          onChange={(e) => updateLayer({ rainGlow: e.target.checked })}
                          className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-200 block">
                            {isVi ? 'Vệt sáng mưa (Rain Glow)' : 'Luminous Rain Streaks'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isVi ? 'Tạo hào quang phản chiếu trên tia mưa' : 'Glowing neon reflection on drops'}
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentLayer.waterOnGlass || false}
                          onChange={(e) => updateLayer({ waterOnGlass: e.target.checked })}
                          className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-200 block">
                            {isVi ? 'Hạt nước chảy trên bề mặt' : 'Water Drops on Glass'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isVi ? 'Giọt nước đọng, trượt nhẹ và tự biến mất sau thời gian ngẫu nhiên' : 'Droplets trickle on glass and vanish after a random lifetime'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* B. TUYẾT RƠI MÙA ĐÔNG (SNOW) */}
                {currentLayer.type === 'snow' && (
                  <div className="bg-sky-950/20 border border-sky-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
                      <Snowflake className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Tuyết Rơi (Snow Settings)' : 'Snowfall Specific Settings'}</span>
                    </div>

                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Chọn hình dáng hạt tuyết (Snow Shape)' : 'Snowflake Shape'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'snowflake', labelVi: '❄️ Bông Tuyết 6 Cánh', labelEn: '❄️ 6-Arm Flake' },
                          { id: 'crystal', labelVi: '💎 Tinh Thể Kim Cương', labelEn: '💎 Ice Crystal' },
                          { id: 'star', labelVi: '⭐ Sao Băng Tuyết', labelEn: '⭐ Snow Star' },
                          { id: 'circle', labelVi: '⚪ Hạt Tuyết Tròn', labelEn: '⚪ Snow Pellet' },
                          { id: 'flurry', labelVi: '☁️ Bông Tuyết Mờ Bokeh', labelEn: '☁️ Soft Flurry' },
                        ].map((sh) => (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() => updateLayer({ snowShape: sh.id as any, snowRandomShape: false })}
                            className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                              !currentLayer.snowRandomShape && (currentLayer.snowShape || 'snowflake') === sh.id
                                ? 'bg-sky-500/25 border-sky-400 text-white'
                                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {isVi ? sh.labelVi : sh.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentLayer.snowRandomShape || false}
                        onChange={(e) => updateLayer({ snowRandomShape: e.target.checked })}
                        className="rounded text-sky-500 focus:ring-sky-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-neutral-200 block">
                          {isVi ? 'Hình shape ngẫu nhiên (Random Snow Shapes)' : 'Randomize Snowflake Shapes'}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {isVi ? 'Kết hợp ngẫu nhiên bông tuyết 6 cánh, tinh thể, sao và hạt tròn' : 'Mixes 6-arm snowflakes, crystals, stars, and soft flurries'}
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                {/* C. VỆT TỐC ĐỘ / SPEED LINES */}
                {currentLayer.type === 'speed-lines' && (
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <Zap className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Vệt Tốc Độ (Speed Lines)' : 'Speed Lines Specific Settings'}</span>
                    </div>

                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Góc xoay hướng bay (Orientation & Origin)' : 'Speed Line Orientation & Origin'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'horizontal', labelVi: '↔ Chiều Ngang', labelEn: '↔ Horizontal' },
                          { id: 'vertical', labelVi: '↕ Chiều Dọc', labelEn: '↕ Vertical' },
                          { id: 'diagonal-45', labelVi: '↘ Chéo 45°', labelEn: '↘ Diagonal 45°' },
                          { id: 'diagonal-135', labelVi: '↙ Chéo 135°', labelEn: '↙ Diagonal 135°' },
                          { id: 'radial-center', labelVi: '🎯 Từ Giữa Ảnh (Tâm)', labelEn: '🎯 Center Focus' },
                          { id: 'radial-top', labelVi: '⬆️ Từ Giữa (Nửa Trên)', labelEn: '⬆️ Upper-Half Center' },
                          { id: 'radial-bottom', labelVi: '⬇️ Từ Giữa (Nửa Dưới)', labelEn: '⬇️ Lower-Half Center' },
                        ].map((ort) => {
                          const currentOrt = currentLayer.speedLineOrientation || (currentLayer.speedLineMode === 'converge-center' ? 'radial-center' : 'horizontal');
                          return (
                            <button
                              key={ort.id}
                              type="button"
                              onClick={() => updateLayer({ speedLineOrientation: ort.id as any })}
                              className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                                currentOrt === ort.id
                                  ? 'bg-amber-500/25 border-amber-400 text-white'
                                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              }`}
                            >
                              {isVi ? ort.labelVi : ort.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chiều xuôi / Chiều ngược (Forward vs Reverse Flow Direction) */}
                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Chiều chuyển động (Chiều Xuôi / Chiều Ngược)' : 'Flow Direction (Forward / Reverse)'}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateLayer({
                              speedLineReverse: false,
                              speedLineDirection: 'right-to-left',
                            })
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            !currentLayer.speedLineReverse
                              ? 'bg-amber-500/25 border-amber-400 text-white shadow-sm'
                              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <span>{isVi ? '➡️ Chiều Xuôi (Forward)' : '➡️ Forward Flow'}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {isVi ? 'Hướng chuẩn / Hội tụ vào tâm' : 'Standard / Converge to center'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateLayer({
                              speedLineReverse: true,
                              speedLineDirection: 'left-to-right',
                            })
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            currentLayer.speedLineReverse
                              ? 'bg-amber-500/25 border-amber-400 text-white shadow-sm'
                              : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <span>{isVi ? '⬅️ Chiều Ngược (Reverse)' : '⬅️ Reverse Flow'}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {isVi ? 'Đảo chiều / Phóng tỏa từ tâm ra ngoài' : 'Inverted / Radiate outward from center'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ dài vệt tốc độ' : 'Streak Length'}</span>
                          <span className="text-amber-400 font-mono font-bold">{currentLayer.speedLineLength ?? 140}px</span>
                        </div>
                        <input
                          type="range"
                          min={40}
                          max={400}
                          step={10}
                          value={currentLayer.speedLineLength ?? 140}
                          onChange={(e) => updateLayer({ speedLineLength: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Vệt sáng nhòe (Glow Blur)' : 'Motion Glow Blur'}</span>
                          <span className="text-amber-400 font-mono font-bold">{currentLayer.speedLineBlur ?? 5}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={22}
                          step={1}
                          value={currentLayer.speedLineBlur ?? 5}
                          onChange={(e) => updateLayer({ speedLineBlur: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* D. MƯA BĂNG LỤA (SILK RIBBON) */}
                {(currentLayer.type === 'spaghetti' || currentLayer.type === 'silk-ribbon') && (
                  <div className="bg-pink-950/20 border border-pink-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-pink-300 font-bold text-xs uppercase tracking-wider">
                      <Waves className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Mưa Băng Lụa (Silk Ribbon)' : 'Silk Ribbon Specific Settings'}</span>
                    </div>

                    <label className="flex items-center gap-2.5 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentLayer.ribbonWavy !== false}
                        onChange={(e) => updateLayer({ ribbonWavy: e.target.checked })}
                        className="rounded text-pink-500 focus:ring-pink-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-neutral-200 block">
                          {isVi ? 'Uốn lượn mềm mại như mảnh ruy băng khi rơi' : 'Undulating Wavy Silk Motion'}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {isVi ? 'Dải lụa xoắn 3D và đung đưa nhịp nhàng trong không trung' : '3D twisting and graceful sine-wave fluttering'}
                        </span>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ dài dải lụa' : 'Ribbon Length'}</span>
                          <span className="text-pink-400 font-mono font-bold">{currentLayer.ribbonLength ?? 160}px</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={450}
                          step={10}
                          value={currentLayer.ribbonLength ?? 160}
                          onChange={(e) => updateLayer({ ribbonLength: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ uốn xoắn 3D' : '3D Wave Twist'}</span>
                          <span className="text-pink-400 font-mono font-bold">{(currentLayer.ribbonTwist ?? 1.8).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={4.5}
                          step={0.1}
                          value={currentLayer.ribbonTwist ?? 1.8}
                          onChange={(e) => updateLayer({ ribbonTwist: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ rộng bản lụa' : 'Ribbon Width'}</span>
                          <span className="text-pink-400 font-mono font-bold">{currentLayer.ribbonThickness ?? 8}px</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={28}
                          step={1}
                          value={currentLayer.ribbonThickness ?? 8}
                          onChange={(e) => updateLayer({ ribbonThickness: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* E. BỤI LOFI TRÔI 2D (LOFI DUST 2D) */}
                {currentLayer.type === 'dust' && (
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>{isVi ? 'Tùy Chỉnh Riêng: Bụi Lofi Trôi (Vẽ 2D - Không Viền Mờ)' : 'Lofi Dust Settings (2D Canvas - Crisp Edges)'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                        2D Canvas
                      </span>
                    </div>

                    {/* Shape Selector: Tròn (default), Vuông, Ngôi Sao, Ngẫu Nhiên */}
                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Hình dáng hạt bụi (Dust Shape)' : 'Dust Shape'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'circle', labelVi: '⚪ Tròn (Mặc định)', labelEn: '⚪ Circle (Default)' },
                          { id: 'square', labelVi: '⬛ Vuông', labelEn: '⬛ Square' },
                          { id: 'star', labelVi: '⭐ Ngôi Sao', labelEn: '⭐ Star' },
                          { id: 'random', labelVi: '🎲 Ngẫu Nhiên', labelEn: '🎲 Random Mix' },
                        ].map((sh) => {
                          const currentShape = currentLayer.dustShape || (currentLayer.dustRandomShape ? 'random' : 'circle');
                          const isSelected = currentShape === sh.id;
                          return (
                            <button
                              key={sh.id}
                              type="button"
                              onClick={() =>
                                updateLayer({
                                  dustShape: sh.id as any,
                                  dustRandomShape: sh.id === 'random',
                                  shape: sh.id === 'random' ? undefined : (sh.id as any),
                                  silkFluffGlow: false,
                                })
                              }
                              className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-500/25 border-purple-400 text-white'
                                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              }`}
                            >
                              {isVi ? sh.labelVi : sh.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <label className="flex items-center gap-2.5 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentLayer.dustRandomShape || currentLayer.dustShape === 'random'}
                          onChange={(e) =>
                            updateLayer({
                              dustRandomShape: e.target.checked,
                              dustShape: e.target.checked ? 'random' : 'circle',
                              silkFluffGlow: false,
                            })
                          }
                          className="rounded text-purple-500 focus:ring-purple-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-200 block">
                            {isVi ? 'Shape 2D ngẫu nhiên (Không viền mờ)' : 'Random 2D Shapes (No Blurry Halo)'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isVi ? 'Trộn tròn, vuông nhỏ & sao 2D sắc nét' : 'Mixes crisp 2D circles, squares & stars'}
                          </span>
                        </div>
                      </label>

                      <div>
                        {(() => {
                          const dustPx = Math.max(1, Math.round(currentLayer.dustMinSize ?? currentLayer.sizePx ?? 1));
                          return (
                            <>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-neutral-300">
                                  {isVi ? 'Kích thước bụi Lofi (Từ 1px)' : 'Lofi Dust Size (From 1px)'}
                                </span>
                                <span className="text-purple-400 font-mono font-bold">{dustPx}px</span>
                              </div>
                              <input
                                type="range"
                                min={1}
                                max={16}
                                step={1}
                                value={dustPx}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value));
                                  updateLayer({
                                    dustMinSize: val,
                                    sizePx: val,
                                    sizeScale: Number((val / 6).toFixed(2)),
                                    silkFluffGlow: false,
                                  });
                                }}
                                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                              <div className="flex items-center gap-1 mt-1.5">
                                {[1, 2, 3, 5, 8, 12].map((px) => (
                                  <button
                                    key={px}
                                    type="button"
                                    onClick={() =>
                                      updateLayer({
                                        dustMinSize: px,
                                        sizePx: px,
                                        sizeScale: Number((px / 6).toFixed(2)),
                                        silkFluffGlow: false,
                                      })
                                    }
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                                      dustPx === px
                                        ? 'bg-purple-500 text-neutral-950 font-bold'
                                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                                    }`}
                                  >
                                    {px}px
                                  </button>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* F. TĂNG TỐC HYPERSPACE */}
                {currentLayer.type === 'hyperspace' && (
                  <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                      <Zap className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Tăng Tốc Hyperspace 3D' : '3D Hyperspace Warp Specific Settings'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ dài vệt sáng (Warp Length)' : 'Warp Trail Length'}</span>
                          <span className="text-indigo-400 font-mono font-bold">{currentLayer.hyperspaceLength ?? 20}px</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={50}
                          step={1}
                          value={currentLayer.hyperspaceLength ?? 20}
                          onChange={(e) => updateLayer({ hyperspaceLength: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Cường độ vệt sáng (Warp Glow)' : 'Luminous Streak Glow'}</span>
                          <span className="text-indigo-400 font-mono font-bold">{currentLayer.hyperspaceGlow ?? 15}px</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={40}
                          step={1}
                          value={currentLayer.hyperspaceGlow ?? 15}
                          onChange={(e) => updateLayer({ hyperspaceGlow: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* G. SAO LẤP LÁNH (TWINKLING STARS) */}
                {currentLayer.type === 'stars' && (
                  <div className="bg-yellow-950/20 border border-yellow-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs uppercase tracking-wider">
                      <Star className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Sao Lấp Lánh (Twinkling Stars)' : 'Twinkling Stars Specific Settings'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-2.5 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentLayer.starStatic !== false}
                          onChange={(e) => updateLayer({ starStatic: e.target.checked })}
                          className="rounded text-yellow-500 focus:ring-yellow-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-200 block">
                            {isVi ? 'Đứng yên không chuyển động' : 'Static Sky Position'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isVi ? 'Chỉ nhấp nháy lóe sáng ngẫu nhiên' : 'Random shimmer without translation'}
                          </span>
                        </div>
                      </label>

                      {/* Ngẫu nhiên lóe sáng tia 4 góc */}
                      <label className="flex items-center gap-2.5 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentLayer.starRandomFlare !== false}
                          onChange={(e) => updateLayer({ starRandomFlare: e.target.checked })}
                          className="rounded text-yellow-500 focus:ring-yellow-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-semibold text-neutral-200 block">
                            {isVi ? 'Ngẫu nhiên lóe sáng tia 4 góc' : '4-Corner Flare Bursts'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {isVi ? 'Phát tia hào quang chữ thập 4 hướng khi nhấp nháy' : 'Cross flare sparkle rays on twinkle peaks'}
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Star Flare Intensity slider if enabled */}
                    {currentLayer.starRandomFlare !== false && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ dài tia lóe sáng (Flare Intensity)' : 'Flare Ray Length'}</span>
                          <span className="text-yellow-400 font-mono font-bold">
                            {(currentLayer.starFlareIntensity ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.2}
                          max={2.5}
                          step={0.1}
                          value={currentLayer.starFlareIntensity ?? 1.0}
                          onChange={(e) => updateLayer({ starFlareIntensity: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                      </div>
                    )}

                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Chọn hình dáng ngôi sao (Star Shape)' : 'Star Shape'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: '4-point', labelVi: '✨ Sao 4 Tia', labelEn: '✨ 4-Point Star' },
                          { id: '5-point', labelVi: '⭐ Sao 5 Cánh', labelEn: '⭐ 5-Point Star' },
                          { id: 'circle', labelVi: '⚪ Chấm Tròn Sáng', labelEn: '⚪ Glowing Dot' },
                          { id: 'random', labelVi: '🎲 Ngẫu Nhiên Đủ Kiểu', labelEn: '🎲 Random Mix' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => updateLayer({ starShape: st.id as any })}
                            className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                              (currentLayer.starShape || '4-point') === st.id
                                ? 'bg-yellow-500/25 border-yellow-400 text-white'
                                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {isVi ? st.labelVi : st.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* H. NHỮNG HẠT LỬA BAY (FIRE EMBERS) */}
                {currentLayer.type === 'fire-embers' && (
                  <div className="bg-orange-950/20 border border-orange-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-orange-300 font-bold text-xs uppercase tracking-wider">
                      <Sun className="w-4 h-4" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Những Hạt Lửa & Tàn Tro (Fire Embers)' : 'Fire Embers Specific Settings'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {isVi
                        ? 'Các pixel lửa rực cháy bay từ đáy màn hình lên trên, tỏa ra nhiều hướng ngẫu nhiên rồi nguội dần sang màu xám, đen và tan biến.'
                        : 'Glowing fire pixels rise from the bottom, scatter randomly, cool into gray/black ash, and vanish.'}
                    </p>

                    {/* Shape Selector: Tròn, Vuông, Hình Thoi, Ngẫu Nhiên */}
                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Hình dáng hạt lửa (Ember Shape)' : 'Ember Shape'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'circle', labelVi: '⚪ Tròn', labelEn: '⚪ Circle' },
                          { id: 'square', labelVi: '⬛ Vuông', labelEn: '⬛ Square' },
                          { id: 'diamond', labelVi: '🔷 Hình Thoi', labelEn: '🔷 Diamond' },
                          { id: 'random', labelVi: '🎲 Ngẫu Nhiên', labelEn: '🎲 Random Mix' },
                        ].map((sh) => {
                          const currentShape = currentLayer.fireEmbersShape || 'random';
                          const isSelected = currentShape === sh.id;
                          return (
                            <button
                              key={sh.id}
                              type="button"
                              onClick={() => updateLayer({ fireEmbersShape: sh.id as any })}
                              className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-500/25 border-orange-400 text-white'
                                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              }`}
                            >
                              {isVi ? sh.labelVi : sh.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Độ tỏa rộng nhiều hướng' : 'Horizontal Scatter Spread'}</span>
                          <span className="text-orange-400 font-mono font-bold">
                            {(currentLayer.fireEmbersSpread ?? 1.2).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.3}
                          max={3.0}
                          step={0.1}
                          value={currentLayer.fireEmbersSpread ?? 1.2}
                          onChange={(e) => updateLayer({ fireEmbersSpread: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Tốc độ nguội sang xám/đen' : 'Ash Cooling Rate'}</span>
                          <span className="text-orange-400 font-mono font-bold">
                            {(currentLayer.fireEmbersCooling ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={2.5}
                          step={0.1}
                          value={currentLayer.fireEmbersCooling ?? 1.0}
                          onChange={(e) => updateLayer({ fireEmbersCooling: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}


                {/* I. ĐÀN BƯỚM PHÁT SÁNG (GLOWING BUTTERFLIES) */}
                {currentLayer.type === 'butterflies' && (
                  <div className="bg-pink-950/20 border border-pink-500/30 rounded-xl p-3.5 space-y-3.5">
                    <div className="flex items-center gap-2 text-pink-300 font-bold text-xs uppercase tracking-wider">
                      <Feather className="w-4 h-4 text-pink-400" />
                      <span>{isVi ? 'Tùy Chỉnh Riêng: Đàn Bướm Phát Sáng (Butterflies)' : 'Butterflies Specific Settings'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {isVi
                        ? 'Đàn bướm 2D bay dập dờn tự nhiên với đôi cánh co giãn theo góc nhìn, râu mềm mại và vệt bụi tiên lấp lánh.'
                        : '2D glowing butterflies flying with organic fluttering wings, foreshortening physics, delicate antennae, and fairy sparkle trails.'}
                    </p>

                    {/* Butterfly Color Variant */}
                    <div>
                      <span className="text-xs text-neutral-300 font-medium block mb-1.5">
                        {isVi ? 'Tông màu sắc bướm (Color Theme)' : 'Color Theme'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'monarch', labelVi: '🦋 Cam Cổ Điển (Monarch)', labelEn: '🦋 Monarch Amber' },
                          { id: 'neon-glow', labelVi: '⚡ Cyberpunk Neon', labelEn: '⚡ Cyberpunk Neon' },
                          { id: 'emerald', labelVi: '🌿 Ngọc Lục Bảo (Emerald)', labelEn: '🌿 Emerald Glow' },
                          { id: 'golden', labelVi: '✨ Hoàng Kim Ánh Dương', labelEn: '✨ Golden Sun' },
                          { id: 'rainbow', labelVi: '🌈 Cầu Vồng Ngũ Sắc', labelEn: '🌈 Prismatic Rainbow' },
                          { id: 'custom', labelVi: '🎨 Tùy Chỉnh Màu Riêng', labelEn: '🎨 Custom Palette' },
                        ].map((cv) => {
                          const isSelected = (currentLayer.butterflyColorVariant || 'neon-glow') === cv.id;
                          return (
                            <button
                              key={cv.id}
                              type="button"
                              onClick={() => updateLayer({ butterflyColorVariant: cv.id as any })}
                              className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-pink-500/25 border-pink-400 text-white'
                                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              }`}
                            >
                              {isVi ? cv.labelVi : cv.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Butterfly Size & Wing Flap Speed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Kích thước bướm' : 'Butterfly Wingspan'}</span>
                          <span className="text-pink-400 font-mono font-bold">
                            {currentLayer.butterflySize ?? 24}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={56}
                          step={1}
                          value={currentLayer.butterflySize ?? 24}
                          onChange={(e) => updateLayer({ butterflySize: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <div className="flex items-center gap-1 mt-1.5">
                          {[16, 22, 28, 36, 48].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => updateLayer({ butterflySize: sz })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                (currentLayer.butterflySize ?? 24) === sz
                                  ? 'bg-pink-500 text-neutral-950 font-bold'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {sz}px
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-300">{isVi ? 'Tần số đập cánh' : 'Wing Flap Frequency'}</span>
                          <span className="text-pink-400 font-mono font-bold">
                            {(currentLayer.butterflyWingSpeed ?? 1.2).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.5}
                          max={3.0}
                          step={0.1}
                          value={currentLayer.butterflyWingSpeed ?? 1.2}
                          onChange={(e) => updateLayer({ butterflyWingSpeed: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <div className="flex items-center gap-1 mt-1.5">
                          {[0.8, 1.2, 1.8, 2.5].map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              onClick={() => updateLayer({ butterflyWingSpeed: spd })}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                (currentLayer.butterflyWingSpeed ?? 1.2) === spd
                                  ? 'bg-pink-500 text-neutral-950 font-bold'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sparkle Dust Trail Toggle */}
                    <label className="flex items-center gap-2.5 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentLayer.butterflyTrail !== false}
                        onChange={(e) => updateLayer({ butterflyTrail: e.target.checked })}
                        className="rounded text-pink-500 focus:ring-pink-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-neutral-200 block">
                          {isVi ? 'Vệt bụi tiên lấp lánh (Sparkle Dust Trail)' : 'Fairy Sparkle Dust Trail'}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {isVi ? 'Tỏa ra những hạt lấp lánh nhỏ rơi phía sau đường bay của bướm' : 'Emits soft luminous particles along the flight path'}
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                </div>
              );
            })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
