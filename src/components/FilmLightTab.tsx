import React from 'react';
import {
  FilmLightConfig,
  FilmLightStyle,
  FilmLightPosition,
  FilmLightBlendMode,
} from '../types';
import { FILM_LIGHT_PRESETS, DEFAULT_FILM_LIGHT } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  Sun,
  Flame,
  Zap,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Activity,
  Tv,
  Film,
  Camera,
  RotateCw,
  Maximize,
  Eye,
  EyeOff,
  Disc,
  Compass
} from 'lucide-react';

interface FilmLightTabProps {
  filmLight?: FilmLightConfig;
  config?: FilmLightConfig;
  onChange: (cfg: FilmLightConfig) => void;
  language?: Language;
}

const FILM_LIGHT_STYLES: {
  id: FilmLightStyle;
  nameVi: string;
  nameEn: string;
  descVi: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeVi?: string;
  badgeEn?: string;
}[] = [
  {
    id: 'vintage-leak',
    nameVi: 'Cháy Phim 35mm Cổ Điển',
    nameEn: 'Vintage 35mm Burn',
    descVi: 'Vệt lóa ấm áp cam hổ phách & hồng ngọc lan tỏa tự nhiên từ góc khung hình',
    descEn: 'Warm amber & ruby light leaks diffusing naturally from film corners',
    icon: Flame,
    badgeVi: 'Kinh Điển',
    badgeEn: 'Classic'
  },
  {
    id: 'anamorphic-flare',
    nameVi: 'Vệt Sáng Xanh Điện Ảnh',
    nameEn: 'Anamorphic Cinema Flare',
    descVi: 'Tia sáng laser xanh biển Anamorphic quét ngang chuẩn phim bom tấn Hollywood',
    descEn: 'Horizontal anamorphic cyan laser flares seen in blockbuster Hollywood films',
    icon: Zap,
    badgeVi: 'Cinema 4K',
    badgeEn: 'Cinema 4K'
  },
  {
    id: 'prism-rainbow',
    nameVi: 'Tán Sắc Lăng Kính Prism',
    nameEn: 'Prism Rainbow Beam',
    descVi: 'Dải quang phổ 7 sắc cầu vồng mềm mại lấp lánh phản xạ ánh sáng',
    descEn: 'Delicate floating rainbow prism spectrum with dreamy refraction',
    icon: Sparkles,
    badgeVi: 'Mơ Màng',
    badgeEn: 'Dreamy'
  },
  {
    id: 'golden-hour',
    nameVi: 'Nắng Chiều Hoàng Hôn',
    nameEn: 'Golden Hour Sunbeams',
    descVi: 'Luồng nắng vàng óng ả ấm áp rọi xiên qua khung hình với bụi nắng',
    descEn: 'Warm honeyed sunbeams slicing through the frame with subtle light dust',
    icon: Sun,
    badgeVi: 'Ấm Áp',
    badgeEn: 'Warm'
  },
  {
    id: 'neon-cyber-leak',
    nameVi: 'Cháy Sáng Neon Cyber',
    nameEn: 'Cyberpunk Neon Leak',
    descVi: 'Đèn Neon Hồng Magenta & Xanh Cyan đối lập nồng nhiệt phong cách tương lai',
    descEn: 'High-contrast futuristic neon magenta & cyan futuristic lighting',
    icon: Tv,
    badgeVi: 'Cyberpunk',
    badgeEn: 'Cyberpunk'
  },
  {
    id: 'retro-projector',
    nameVi: 'Máy Chiếu Phim 8mm',
    nameEn: 'Retro 8mm Projector',
    descVi: 'Ánh đèn chiếu rung lắc kèm bụi xước và nhấp nháy màn chập phim nhựa cổ',
    descEn: 'Warm projector beam with gate weave, shutter flicker & organic dust',
    icon: Film,
    badgeVi: 'Vintage 8mm',
    badgeEn: 'Vintage 8mm'
  },
  {
    id: 'lens-optical-flare',
    nameVi: 'Vệt Lóa Ống Kính Đa Vòng',
    nameEn: 'Optical Ring Flare',
    descVi: 'Hào quang ống kính máy quay với chuỗi vòng tròn quang học phản xạ chân thực',
    descEn: 'Realistic camera lens flare circles and internal glass element reflections',
    icon: Camera,
    badgeVi: 'Quang Học',
    badgeEn: 'Optical'
  },
  {
    id: 'film-burn-cycle',
    nameVi: 'Cháy Phim Bốc Lửa Động',
    nameEn: 'Dynamic Film Fire Burn',
    descVi: 'Đám cháy phim nhựa bùng nổ chuyển động ngẫu nhiên theo nhịp điệu âm nhạc',
    descEn: 'Dynamic burning celluloid edges popping in sync with audio dynamics',
    icon: Flame,
    badgeVi: 'Bùng Nổ',
    badgeEn: 'Burst'
  }
];

const POSITIONS: { id: FilmLightPosition; nameVi: string; nameEn: string }[] = [
  { id: 'top-left', nameVi: 'Trái Trên (Top-L)', nameEn: 'Top-Left' },
  { id: 'top-right', nameVi: 'Phải Trên (Top-R)', nameEn: 'Top-Right' },
  { id: 'bottom-left', nameVi: 'Trái Dưới (Bot-L)', nameEn: 'Bottom-Left' },
  { id: 'bottom-right', nameVi: 'Phải Dưới (Bot-R)', nameEn: 'Bottom-Right' },
  { id: 'top-edge', nameVi: 'Cạnh Trên (Top Edge)', nameEn: 'Top Edge' },
  { id: 'center', nameVi: 'Chính Giữa (Center Sweep)', nameEn: 'Center Sweep' },
  { id: 'dynamic-float', nameVi: 'Tự Do (Dynamic Float)', nameEn: 'Dynamic Float' },
];

const BLEND_MODES: { id: FilmLightBlendMode; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'screen', nameVi: 'Screen (Lọc Sáng Chuẩn)', nameEn: 'Screen (Standard Light)', descVi: 'Pha trộn mềm mại tự nhiên, giữ nguyên chi tiết nền', descEn: 'Soft natural blending, preserves background shadows' },
  { id: 'lighter', nameVi: 'Lighter / Add (Cực Sáng)', nameEn: 'Lighter / Add (Vibrant)', descVi: 'Cộng dồn ánh sáng rực rỡ, thích hợp vệt sáng mạnh', descEn: 'Intense additive brightness for high-energy glows' },
  { id: 'color-dodge', nameVi: 'Color Dodge (Rực Rỡ)', nameEn: 'Color Dodge (Punchy)', descVi: 'Tăng tương phản màu sắc cao, hiệu ứng phát quang bắt mắt', descEn: 'High color contrast and luminous saturation boost' },
  { id: 'soft-light', nameVi: 'Soft Light (Dịu Nhẹ)', nameEn: 'Soft Light (Gentle)', descVi: 'Phủ ánh sáng êm dịu mơ màng cho MV Lofi & Acoustic', descEn: 'Subtle and atmospheric glow ideal for Lofi & Chill' },
  { id: 'overlay', nameVi: 'Overlay (Đậm Đà)', nameEn: 'Overlay (Rich Contrast)', descVi: 'Tăng độ bão hòa màu và chiều sâu thị giác', descEn: 'Boosts saturation and visual depth' },
];

export const FilmLightTab: React.FC<FilmLightTabProps> = ({
  filmLight: propFilmLight,
  config: propConfig,
  onChange,
  language = 'vi',
}) => {
  const filmLight = propFilmLight || propConfig || DEFAULT_FILM_LIGHT;
  const isVi = language === 'vi';
  const t = TRANSLATIONS[language] || TRANSLATIONS.vi;

  const update = (partial: Partial<FilmLightConfig>) => {
    onChange({ ...filmLight, ...partial });
  };

  const applyPreset = (presetConfig: Partial<FilmLightConfig>) => {
    onChange({
      ...filmLight,
      enabled: true,
      ...presetConfig
    });
  };

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Master Toggle Banner */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-950/40 via-neutral-900/80 to-rose-950/40 border border-amber-500/30 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-all ${
            filmLight.enabled
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30'
              : 'bg-neutral-800 text-neutral-400'
          }`}>
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {isVi ? 'Hiệu Ứng Ánh Sáng Phim (Film Light Leaks)' : 'Film Light Leaks & Optical Flares'}
              {filmLight.enabled && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {isVi ? 'Đang Bật' : 'Active'}
                </span>
              )}
            </h3>
            <p className="text-xs text-neutral-400">
              {isVi 
                ? 'Phủ vệt cháy phim 35mm, tia sáng lóa Anamorphic, tán sắc lăng kính lên toàn bộ video' 
                : 'Overlay vintage 35mm burns, anamorphic flares, and prism refractions onto video'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filmLight.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      {/* 2. Quick 1-Click Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isVi ? 'Mẫu Ánh Sáng Phim Chọn Nhanh (Quick Presets)' : 'Quick Film Light Presets'}
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FILM_LIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.config)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                filmLight.enabled && filmLight.style === preset.config.style
                  ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60'
              }`}
            >
              <div>
                <span className="text-xs font-bold block truncate text-amber-200">
                  {isVi ? preset.nameVi : preset.name}
                </span>
                <span className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                  {isVi ? preset.descVi : preset.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-neutral-800/80">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.config.primaryColor || '#ff7a00' }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.config.secondaryColor || '#ff0055' }}
                />
                <span className="text-[9px] text-neutral-500 uppercase ml-auto font-mono">
                  {preset.config.style}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Style Selection Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          {isVi ? 'Kiểu Vệt Sáng Điện Ảnh (Film Light Style)' : 'Cinematic Light Leak Style'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {FILM_LIGHT_STYLES.map((st) => {
            const Icon = st.icon;
            const isSelected = filmLight.style === st.id;

            return (
              <button
                key={st.id}
                onClick={() => update({ style: st.id, enabled: true })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-100 truncate">
                      {isVi ? st.nameVi : st.nameEn}
                    </span>
                    {(isVi ? st.badgeVi : st.badgeEn) && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        {isVi ? st.badgeVi : st.badgeEn}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {isVi ? st.descVi : st.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Position & Placement */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          {isVi ? 'Vị Trí & Hướng Vệt Sáng (Light Position)' : 'Light Position & Direction'}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => update({ position: pos.id })}
              className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                filmLight.position === pos.id
                  ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60'
              }`}
            >
              {isVi ? pos.nameVi : pos.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Blend Mode Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          {isVi ? 'Chế Độ Hòa Trộn (Blend Mode)' : 'Blending Mode'}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BLEND_MODES.map((bm) => (
            <button
              key={bm.id}
              onClick={() => update({ blendMode: bm.id })}
              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                filmLight.blendMode === bm.id
                  ? 'bg-amber-950/40 border-amber-500 text-white font-semibold shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-bold text-amber-200 truncate">{isVi ? bm.nameVi : bm.nameEn}</div>
              <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{isVi ? bm.descVi : bm.descEn}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Color Pickers & Swatches */}
      <div className="space-y-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          {isVi ? 'Tông Màu Vệt Sáng (Film Light Palette)' : 'Film Light Color Palette'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Primary Color */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {isVi ? 'Màu Vệt Sáng Chính 1' : 'Primary Light 1'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-800/80 p-1.5 rounded-xl border border-neutral-700/80">
              <input
                type="color"
                value={filmLight.primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={filmLight.primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {isVi ? 'Màu Vệt Sáng Phụ 2' : 'Secondary Light 2'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-800/80 p-1.5 rounded-xl border border-neutral-700/80">
              <input
                type="color"
                value={filmLight.secondaryColor}
                onChange={(e) => update({ secondaryColor: e.target.value })}
                className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={filmLight.secondaryColor}
                onChange={(e) => update({ secondaryColor: e.target.value })}
                className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Tertiary Color */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {isVi ? 'Màu Lóa Sáng 3 (Highlight)' : 'Highlight Flare 3'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-800/80 p-1.5 rounded-xl border border-neutral-700/80">
              <input
                type="color"
                value={filmLight.tertiaryColor || '#ffd700'}
                onChange={(e) => update({ tertiaryColor: e.target.value })}
                className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                value={filmLight.tertiaryColor || '#ffd700'}
                onChange={(e) => update({ tertiaryColor: e.target.value })}
                className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>

        {/* Quick Color Themes */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80 flex-wrap">
          <span className="text-[11px] text-neutral-400">{isVi ? 'Gợi ý tông màu:' : 'Color Suggestions:'}</span>
          {[
            { labelVi: 'Cam Lửa 35mm', labelEn: '35mm Amber Fire', c1: '#ff7a00', c2: '#ff0055', c3: '#ffd700' },
            { labelVi: 'Laser Xanh Hollywood', labelEn: 'Hollywood Blue Laser', c1: '#00d4ff', c2: '#3b82f6', c3: '#ffffff' },
            { labelVi: 'Nắng Hoàng Hôn', labelEn: 'Sunset Glow', c1: '#fbbf24', c2: '#f97316', c3: '#ffffff' },
            { labelVi: 'Neon Tím Hồng', labelEn: 'Neon Violet Pink', c1: '#ec4899', c2: '#8b5cf6', c3: '#06b6d4' },
            { labelVi: 'Bạch Kim Trắng', labelEn: 'Platinum White', c1: '#ffffff', c2: '#cbd5e1', c3: '#94a3b8' },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => update({ primaryColor: preset.c1, secondaryColor: preset.c2, tertiaryColor: preset.c3 })}
              className="text-[10px] px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 flex items-center gap-1.5 border border-neutral-700/60 cursor-pointer transition-all"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.c1 }} />
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.c2 }} />
              {isVi ? preset.labelVi : preset.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Sliders: Intensity, Speed, Scale */}
      <div className="space-y-4 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          {isVi ? 'Điều Chỉnh Thông Số Vệt Sáng' : 'Adjust Light Parameters'}
        </label>

        {/* Intensity */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">{isVi ? 'Độ đậm / Cường độ ánh sáng (Intensity)' : 'Intensity / Brightness'}</span>
            <span className="font-mono text-amber-400 font-semibold">{Math.round(filmLight.intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={filmLight.intensity}
            onChange={(e) => update({ intensity: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">{isVi ? 'Tốc độ chuyển động / Quét sáng (Speed)' : 'Motion & Sweep Speed'}</span>
            <span className="font-mono text-amber-400 font-semibold">{filmLight.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={filmLight.speed}
            onChange={(e) => update({ speed: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Scale */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">{isVi ? 'Kích thước vùng phủ sáng (Scale / Spread)' : 'Light Spread / Area Scale'}</span>
            <span className="font-mono text-amber-400 font-semibold">{Math.round(filmLight.scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={filmLight.scale}
            onChange={(e) => update({ scale: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* 8. Audio & Bass Reactivity */}
      <div className="space-y-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              {isVi ? 'Bùng Sáng Theo Nhịp Bass & Beat (Beat Reactive Flash)' : 'Audio & Bass Reactive Flare'}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              {isVi 
                ? 'Vệt sáng sẽ tự động lóe sáng rực rỡ và bung rộng mỗi khi có nhịp trống hoặc bass drop' 
                : 'Light automatically pulses and expands in sync with heavy kicks and bass drops'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={filmLight.reactiveToBeat}
            onChange={(e) => update({ reactiveToBeat: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {filmLight.reactiveToBeat && (
          <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">{isVi ? 'Độ bùng nổ khi gặp Bass Kick (Flash Boost)' : 'Kick Flash Boost'}</span>
              <span className="font-mono text-rose-400 font-semibold">{filmLight.beatFlashBoost.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={filmLight.beatFlashBoost}
              onChange={(e) => update({ beatFlashBoost: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 9. Vintage Film Optical Artifacts (Dust, Scratches, Flicker, Warm Vignette) */}
      <div className="space-y-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          {isVi ? 'Chất Liệu Phim Điện Ảnh (Cinematic Film FX)' : 'Cinematic Film Textures & Artifacts'}
        </label>

        {/* Film Dust & Scratches */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-200">
                {isVi ? 'Bụi & Vết Xước Phim Nhựa 35mm (Film Dust & Scratches)' : '35mm Film Dust & Hair Scratches'}
              </span>
              <span className="text-[10px] text-neutral-400 block">
                {isVi ? 'Tạo các hạt bụi li ti và đường xước mờ chuyển động tự nhiên như cuộn phim thật' : 'Simulate organic moving dust particles and hair scratches like real vintage film'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={filmLight.filmDustScratches}
              onChange={(e) => update({ filmDustScratches: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {filmLight.filmDustScratches && (
            <div className="space-y-1 pl-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{isVi ? 'Mật độ hạt bụi & xước (Dust Density)' : 'Dust & Scratch Density'}</span>
                <span className="font-mono text-amber-400">{Math.round(filmLight.dustIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={filmLight.dustIntensity}
                onChange={(e) => update({ dustIntensity: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Projector Flicker */}
        <div className="space-y-2 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-200">
                {isVi ? 'Nhấp Nháy Máy Chiếu Phim 8mm (Projector Shutter Flicker)' : '8mm Projector Shutter Flicker'}
              </span>
              <span className="text-[10px] text-neutral-400 block">
                {isVi ? 'Mô phỏng độ chớp sáng màn trập của đầu đọc băng máy chiếu cổ điển' : 'Simulate optical mechanical shutter brightness pulse of antique film projectors'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={filmLight.lensFlicker}
              onChange={(e) => update({ lensFlicker: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {filmLight.lensFlicker && (
            <div className="space-y-1 pl-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">{isVi ? 'Tốc độ chớp nháy (Flicker Speed)' : 'Shutter Flicker Speed'}</span>
                <span className="font-mono text-amber-400">{filmLight.flickerSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={filmLight.flickerSpeed}
                onChange={(e) => update({ flickerSpeed: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Chromatic Aberration */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
          <div>
            <span className="text-xs font-semibold text-neutral-200">
              {isVi ? 'Quang Sai Màu Viền Ống Kính (Chromatic Aberration)' : 'Lens Chromatic Aberration'}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              {isVi ? 'Tách viền đỏ - lam - lục ở các góc lóe sáng quang học' : 'Red/Cyan color fringing separation around high-intensity optical light edges'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={filmLight.chromaticAberration}
            onChange={(e) => update({ chromaticAberration: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {/* Warm Vignette */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
          <div>
            <span className="text-xs font-semibold text-neutral-200">
              {isVi ? 'Viền Tối Ấm Điện Ảnh (Cinematic Warm Vignette)' : 'Warm Cinematic Vignette'}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              {isVi ? 'Hút tầm nhìn vào tâm với bóng tối ấm áp ở 4 góc màn hình' : 'Soft warm amber dark corners drawing visual focus to center'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={filmLight.vignetteWarmth}
            onChange={(e) => update({ vignetteWarmth: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
