import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PresetTheme,
  AspectRatio,
  VisualizerConfig,
  LyricsConfig,
  BackgroundConfig,
  ParticleConfig,
  FilmLightConfig,
  ColorGradingConfig,
  MasterEQConfig,
  SceneTransitionsConfig,
  TrackMetadata,
  TextBoxItem,
  LottieItem,
  CardStyle,
  VisualizerType,
  ColorGradingLUT,
  ParticleType,
} from '../types';
import {
  PRESET_THEMES,
  DEFAULT_TRACK,
  DEFAULT_FILM_LIGHT,
  DEFAULT_COLOR_GRADING,
  getUserPresets,
  saveUserPreset,
  deleteUserPreset,
  clearAllUserPresets,
  exportSinglePresetJson,
  exportUserPresetsJson,
  importUserPresets,
} from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  Search,
  LayoutList,
  LayoutGrid,
  Disc3,
  Music2,
  SlidersHorizontal,
  Sparkles,
  Image as ImageIcon,
  Wand2,
  Palette,
  Maximize2,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: PresetTheme) => void;
  language?: Language;
  currentConfig?: {
    aspectRatio: AspectRatio;
    visualizer: VisualizerConfig;
    lyrics?: LyricsConfig;
    background: BackgroundConfig;
    particles: ParticleConfig;
    filmLight?: FilmLightConfig;
    colorGrading?: ColorGradingConfig;
    masterEq?: MasterEQConfig;
    sceneTransitions?: SceneTransitionsConfig;
    track?: TrackMetadata;
    textBoxes?: TextBoxItem[];
    lotties?: LottieItem[];
  };
}

type ViewMode = 'list' | 'thumbnail';
type SourceFilter = 'all' | 'builtin' | 'custom';
type GroupFilter = 'all' | 'neon' | 'lofi' | 'cosmic' | 'studio' | 'custom';
type RatioFilter = 'all' | AspectRatio;

const PRESET_GROUPS: { id: Exclude<GroupFilter, 'all'>; labelVi: string; labelEn: string }[] = [
  { id: 'neon', labelVi: 'Cyberpunk & Neon', labelEn: 'Cyberpunk & Neon' },
  { id: 'lofi', labelVi: 'Lofi & Chill', labelEn: 'Lofi & Chill' },
  { id: 'cosmic', labelVi: 'Vũ Trụ & 3D', labelEn: 'Cosmic & 3D' },
  { id: 'studio', labelVi: 'Studio & Acoustic', labelEn: 'Studio & Acoustic' },
  { id: 'custom', labelVi: 'Tùy Chỉnh', labelEn: 'Custom' },
];

function getGroupLabel(category: string | undefined, language: Language): string {
  const found = PRESET_GROUPS.find((g) => g.id === category);
  if (found) return language === 'vi' ? found.labelVi : found.labelEn;
  return language === 'vi' ? 'Tổng Hợp' : 'General';
}

function getAspectRatioLabel(ratio: AspectRatio, language: Language): string {
  switch (ratio) {
    case '9:16':
      return language === 'vi' ? '9:16 (Dọc · TikTok / Reels)' : '9:16 (Vertical · TikTok / Reels)';
    case '1:1':
      return language === 'vi' ? '1:1 (Vuông · Instagram)' : '1:1 (Square · Instagram)';
    case '16:9':
      return language === 'vi' ? '16:9 (Ngang · YouTube)' : '16:9 (Landscape · YouTube)';
    case '4:5':
      return language === 'vi' ? '4:5 (Chân dung · Feed)' : '4:5 (Portrait · Feed)';
    default:
      return ratio;
  }
}

function getBadgeStyleLabel(style: CardStyle | undefined, language: Language): string {
  const isVi = language === 'vi';
  switch (style) {
    case 'rotating-badge':
      return isVi ? 'Huy hiệu xoay 360°' : 'Rotating Badge 360°';
    case 'triangle-badge':
      return isVi ? 'Huy hiệu tam giác (Triangle)' : 'Triangle Badge';
    case 'vinyl':
      return isVi ? 'Đĩa than Vinyl 360°' : 'Spinning Vinyl Record';
    case 'glass-card':
      return isVi ? 'Thẻ kính mờ (Glass Card)' : 'Frosted Glass Card';
    case 'circular-badge':
      return isVi ? 'Huy hiệu tròn phát sáng' : 'Circular Avatar Badge';
    case 'horizontal-rounded-card':
      return isVi ? 'Thẻ ngang bo góc 3 dòng' : 'Horizontal Rounded Card';
    case 'logo-badge':
      return isVi ? 'Huy hiệu PNG trong suốt' : 'PNG Sticker Badge';
    case 'minimal-tag':
      return isVi ? 'Chữ tối giản không khung' : 'Minimalist Typography';
    case 'hidden':
      return isVi ? 'Ẩn thẻ bài hát' : 'Hidden / Off';
    default:
      return style || (isVi ? 'Mặc định' : 'Default');
  }
}

function getVisualizerLabel(type: VisualizerType, language: Language): string {
  const isVi = language === 'vi';
  const map: Record<string, [string, string]> = {
    'bars-peaks': ['Spectrum Cột Hạt Rơi', 'Bars with Falling Peaks'],
    'bars-mirrored-peaks': ['Sóng Đối Xứng Hạt Đỉnh', 'Mirrored Bars + Peaks'],
    'bars-mirrored': ['Sóng Cột Đối Xứng', 'Mirrored Spectrum Bars'],
    bars: ['Spectrum Cột Cổ Điển', 'Classic Spectrum Bars'],
    'spectrum-bars-simple': ['Spectrum Cột Đơn Giản', 'Simple Column Bars'],
    'spectrum-line': ['Đường Phổ Mịn Gradient', 'Smooth Gradient Curve'],
    'radial-bars-peaks': ['Tia Tròn + Hạt Đỉnh', 'Radial Spikes + Peaks'],
    'circular-spikes': ['Tia Tròn Tỏa Sáng', 'Circular Radial Spikes'],
    'smooth-wave': ['Sóng Nước Mềm Mại', 'Smooth Liquid Wave'],
    'cyber-matrix': ['Ma Trận LED Cyber', 'Cyber LED Matrix'],
    'double-ribbon': ['Dải Ruy Băng Đôi', 'Dual Neon Ribbon'],
    'vinyl-visual': ['Đĩa Than Hào Quang', 'Vinyl Sonic Aura'],
    'minimal-pulse': ['Chấm Tối Giản Audiophile', 'Minimalist Pulse Dots'],
    'flame-spectrum': ['Ngọn Lửa Plasma', 'Flame Plasma Spectrum'],
    'dna-helix': ['Chuỗi Xoắn DNA 3D', '3D DNA Helix'],
    'tunnel-vortex': ['Đường Hầm Vô Cực', 'Portal Tunnel Vortex'],
    'laser-beams': ['Tia Laser Sân Khấu', 'EDM Laser Beams'],
    'starburst-core': ['Lõi Siêu Tân Tinh', 'Starburst Nova Core'],
    'audio-equalizer-grid': ['Lưới EQ Đa Tầng', 'Equalizer Cascade Grid'],
    '3d-cube-matrix': ['3D Ma Trận Khối Lập Phương', '3D Cube Matrix'],
    '3d-sphere-waveform': ['3D Quả Cầu Tần Số', '3D Sphere Waveform'],
    '3d-wave-terrain': ['3D Địa Hình Sóng Cyber', '3D Wave Terrain'],
    '3d-solar-system': ['3D Hệ Thiên Hà', '3D Solar Galaxy'],
    '3d-fluid-shape': ['3D Khối Chất Lỏng', '3D Fluid Morph Shape'],
    '3d-bezier-mesh': ['3D Mạng Lưới Bezier', '3D Bezier Plexus'],
    '3d-raycaster': ['3D Tia Phóng Raycaster', '3D Raycaster Field'],
    '3d-spiral-galaxy': ['3D Ngân Hà Xoắn Ốc', '3D Spiral Galaxy'],
  };
  const entry = map[type];
  if (entry) return isVi ? entry[0] : entry[1];
  return type.replace(/-/g, ' ');
}

function getParticleLabel(type: ParticleType, language: Language): string {
  const isVi = language === 'vi';
  const map: Record<string, [string, string]> = {
    none: ['Không có', 'None'],
    rain: ['Mưa Rơi', 'Natural Rain'],
    snow: ['Tuyết Rơi', 'Winter Snow'],
    'speed-lines': ['Vệt Tốc Độ', 'Speed Lines'],
    spaghetti: ['Ruy Băng Lụa', 'Silk Ribbon Rain'],
    'silk-ribbon': ['Ruy Băng Lụa', 'Silk Ribbon Rain'],
    'spinning-dashes': ['Gạch Xoay 360°', 'Spinning Dashes'],
    'rainbow-bubbles': ['Bong Bóng Cầu Vồng', 'Rainbow Bubbles'],
    hyperspace: ['Hyperspace 3D', 'Hyperspace 3D'],
    dust: ['Bụi Lofi', 'Lofi Ambient Dust'],
    stars: ['Sao Lấp Lánh', 'Twinkling Stars'],
    'fire-embers': ['Tàn Lửa Bay', 'Fire Embers'],
    butterflies: ['Đàn Bướm Bay', 'Butterflies'],
  };
  const entry = map[type];
  if (entry) return isVi ? entry[0] : entry[1];
  return type;
}

function getLutLabel(lut: ColorGradingLUT | undefined, language: Language): string {
  const isVi = language === 'vi';
  const map: Record<string, [string, string]> = {
    none: ['Không áp dụng LUT', 'No LUT'],
    'teal-orange': ['Teal & Orange Điện Ảnh', 'Teal & Orange'],
    'cinematic-warm': ['Cinematic Warm', 'Cinematic Warm'],
    'bleach-bypass': ['Bleach Bypass', 'Bleach Bypass'],
    'cyberpunk-neon': ['Cyberpunk Neon', 'Cyberpunk Neon'],
    'vintage-70s': ['Vintage 70s Film', 'Vintage 70s Film'],
    'golden-hour': ['Golden Hour', 'Golden Hour'],
    'black-and-white': ['Đen Trắng (B&W)', 'Black & White'],
    'faded-film': ['Phim Phai Màu', 'Faded Film'],
    'retro-vhs': ['Retro VHS 90s', 'Retro VHS'],
    'matrix-green': ['Matrix Green', 'Matrix Green'],
    'moody-blue': ['Moody Blue', 'Moody Blue'],
    'candy-pop': ['Candy Pop', 'Candy Pop'],
  };
  if (!lut) return isVi ? 'Tự nhiên' : 'Natural';
  const entry = map[lut];
  return entry ? (isVi ? entry[0] : entry[1]) : lut;
}

function getFilmLightLabel(style: string | undefined, language: Language): string {
  const isVi = language === 'vi';
  const map: Record<string, [string, string]> = {
    'vintage-leak': ['Cháy Phim 35mm', 'Vintage 35mm Leak'],
    'anamorphic-flare': ['Anamorphic Flare', 'Anamorphic Flare'],
    'prism-rainbow': ['Tán Sắc Lăng Kính', 'Prism Rainbow'],
    'golden-hour': ['Nắng Hoàng Hôn', 'Golden Hour Rays'],
    'neon-cyber-leak': ['Neon Cyber Leak', 'Neon Cyber Leak'],
    'retro-projector': ['Đèn Chiếu 8mm', 'Retro 8mm Projector'],
    'lens-optical-flare': ['Lóa Ống Kính', 'Optical Lens Flare'],
    'film-burn-cycle': ['Film Burn Động', 'Dynamic Film Burn'],
  };
  if (!style) return isVi ? 'Ánh sáng phim' : 'Film Light';
  const entry = map[style];
  return entry ? (isVi ? entry[0] : entry[1]) : style;
}

function getBackgroundGradientStyle(bg: BackgroundConfig | undefined, primary: string, secondary: string): React.CSSProperties {
  if (bg?.type === 'solid') {
    return { backgroundColor: bg.color1 || '#0f172a' };
  }
  if (bg?.type === 'gradient') {
    const c1 = bg.color1 || primary || '#0f172a';
    const c2 = bg.color2 || secondary || '#1e293b';
    const c3 = bg.useThreeColors && bg.color3 ? `, ${bg.color3}` : '';
    if (bg.gradientType === 'radial') {
      return { background: `radial-gradient(circle at ${bg.radialOrigin || 'center'}, ${c1}, ${c2}${c3})` };
    }
    return { background: `linear-gradient(${bg.gradientAngle ?? 135}deg, ${c1}, ${c2}${c3})` };
  }
  return {
    background: `linear-gradient(135deg, ${primary}33 0%, #0a0a0c 55%, ${secondary}33 100%)`,
  };
}

function getPhotoFxCssFilter(cg: ColorGradingConfig | undefined, bg: BackgroundConfig | undefined): string {
  const parts: string[] = [];
  const blur = bg?.blur ?? 0;
  if (blur > 0) parts.push(`blur(${Math.min(6, blur * 0.4)}px)`);
  const brightness = bg?.brightness ?? 85;
  parts.push(`brightness(${Math.max(35, Math.min(150, brightness)) / 100})`);
  const contrast = bg?.contrast ?? 100;
  if (contrast !== 100) parts.push(`contrast(${contrast}%)`);

  if (cg?.enabled) {
    if (cg.lut === 'black-and-white') parts.push('grayscale(100%)');
    if (cg.lut === 'vintage-70s' || cg.lut === 'faded-film') parts.push('sepia(35%) contrast(95%)');
    if (cg.lut === 'cyberpunk-neon') parts.push('saturate(145%) contrast(112%)');
    if (cg.lut === 'golden-hour' || cg.lut === 'cinematic-warm') parts.push('sepia(20%) saturate(120%)');
    if (cg.lut === 'matrix-green') parts.push('hue-rotate(65deg) saturate(135%)');
    if (cg.lut === 'moody-blue') parts.push('hue-rotate(-15deg) saturate(85%) contrast(110%)');
    if (cg.sepia > 0) parts.push(`sepia(${cg.sepia}%)`);
  }
  return parts.join(' ');
}

/** Resilient Thumbnail with CSS gradient fallback (Zero-Broken-Image Policy) */
const PresetThumbnail: React.FC<{
  preset: PresetTheme;
  alt: string;
  className?: string;
}> = ({ preset, alt, className = 'w-full h-full' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const bgUrl =
    preset.background?.type !== 'gradient' && preset.background?.type !== 'solid'
      ? preset.thumbnail || preset.background?.url
      : preset.thumbnail;

  useEffect(() => {
    setImgFailed(false);
  }, [bgUrl, preset.id]);

  const fallbackStyle = getBackgroundGradientStyle(
    preset.background,
    preset.visualizer?.primaryColor || '#f43f5e',
    preset.visualizer?.secondaryColor || '#06b6d4'
  );

  if (!bgUrl || imgFailed) {
    return (
      <div
        className={`${className} flex items-center justify-center relative overflow-hidden`}
        style={fallbackStyle}
      >
        <div className="flex items-end gap-0.5 h-5 opacity-75">
          {[0.45, 0.85, 0.65, 1, 0.7, 0.5, 0.8].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-t-sm"
              style={{
                height: `${h * 100}%`,
                background:
                  i % 2 === 0
                    ? preset.visualizer?.primaryColor || '#f43f5e'
                    : preset.visualizer?.secondaryColor || '#06b6d4',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <img
      src={bgUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`${className} object-cover`}
    />
  );
};

/** Scaled Aspect-Ratio Visual Preview of Selected Preset */
const PresetStagePreview: React.FC<{
  preset: PresetTheme;
  language: Language;
}> = ({ preset, language }) => {
  const [bgFailed, setBgFailed] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  const bg = preset.background;
  const vis = preset.visualizer;
  const track = preset.track || DEFAULT_TRACK;
  const lyrics = preset.lyrics;
  const particles = preset.particles;
  const filmLight = preset.filmLight ?? DEFAULT_FILM_LIGHT;
  const colorGrading = preset.colorGrading ?? DEFAULT_COLOR_GRADING;

  const bgImageUrl =
    bg?.type !== 'gradient' && bg?.type !== 'solid'
      ? bg?.url || preset.thumbnail
      : '';

  useEffect(() => {
    setBgFailed(false);
    setCoverFailed(false);
  }, [preset.id, bgImageUrl, track.coverUrl]);

  const frameDimensionClass = useMemo(() => {
    switch (preset.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] h-[250px] sm:h-[290px] w-auto';
      case '4:5':
        return 'aspect-[4/5] h-[240px] sm:h-[275px] w-auto';
      case '1:1':
        return 'aspect-square h-[220px] sm:h-[260px] w-auto';
      case '16:9':
      default:
        return 'aspect-video w-full max-w-[460px]';
    }
  }, [preset.aspectRatio]);

  const activeLayers = useMemo(() => {
    if (!particles?.enabled) return [];
    if (particles.layers && particles.layers.length > 0) {
      return particles.layers.filter((l) => l.enabled && l.type !== 'none');
    }
    if (particles.type && particles.type !== 'none') {
      return [
        {
          id: 'single',
          enabled: true,
          type: particles.type,
          count: particles.count,
          color: particles.color,
        },
      ];
    }
    return [];
  }, [particles]);

  const primary = vis?.primaryColor || '#f43f5e';
  const secondary = vis?.secondaryColor || '#06b6d4';
  const tertiary = vis?.tertiaryColor || '#a855f7';

  const badgeY = Math.max(14, Math.min(72, track.positionY ?? 26));
  const visY = Math.max(25, Math.min(86, vis?.positionY ?? 75));
  const lyricsY = Math.max(20, Math.min(88, lyrics?.positionY ?? 52));

  const isRadialVisualizer =
    vis?.type === 'circular-spikes' ||
    vis?.type === 'radial-bars-peaks' ||
    vis?.type === 'starburst-core' ||
    vis?.type === 'vinyl-visual' ||
    vis?.type === 'tunnel-vortex';

  const isWaveVisualizer =
    vis?.type === 'smooth-wave' ||
    vis?.type === 'spectrum-line' ||
    vis?.type === 'double-ribbon' ||
    vis?.type === 'minimal-pulse';

  const barHeights = [0.35, 0.58, 0.78, 0.96, 0.72, 0.88, 0.62, 1, 0.82, 0.66, 0.9, 0.52, 0.74, 0.44];

  return (
    <div className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-4 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] relative overflow-hidden">
      <div
        className={`relative rounded-xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-neutral-900 select-none ${frameDimensionClass}`}
      >
        {/* 1. Background Layer + Photo FX Filter */}
        <div
          className="absolute inset-0"
          style={{
            ...getBackgroundGradientStyle(bg, primary, secondary),
            filter: getPhotoFxCssFilter(colorGrading, bg),
            transform: 'scale(1.06)',
          }}
        >
          {bgImageUrl && !bgFailed && (
            <img
              src={bgImageUrl}
              alt={preset.name}
              referrerPolicy="no-referrer"
              onError={() => setBgFailed(true)}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* 2. Vignette Overlay */}
        {(bg?.vignette ?? 0) > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle, transparent 38%, rgba(0,0,0,${Math.min(0.88, (bg.vignette || 40) / 100)}) 100%)`,
            }}
          />
        )}

        {/* 3. Film Light VFX Overlay */}
        {filmLight?.enabled && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              opacity: Math.min(0.75, (filmLight.intensity ?? 0.65) * 0.7),
              background: `radial-gradient(circle at 20% 20%, ${filmLight.primaryColor || '#ff7a00'}88 0%, transparent 55%), radial-gradient(circle at 82% 78%, ${filmLight.secondaryColor || '#38bdf8'}77 0%, transparent 55%)`,
            }}
          />
        )}

        {/* 4. Particle VFX Preview Dots/Streaks */}
        {activeLayers.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {activeLayers.slice(0, 3).map((layer, layerIdx) => {
              const particleColor = layer.color || primary;
              const isStreak = layer.type === 'rain' || layer.type === 'speed-lines' || layer.type === 'spaghetti' || layer.type === 'silk-ribbon' || layer.type === 'hyperspace';
              return [12, 24, 38, 52, 68, 82, 91].map((pos, idx) => (
                <span
                  key={`${layerIdx}-${idx}`}
                  className="absolute"
                  style={{
                    left: `${(pos + layerIdx * 11) % 94}%`,
                    top: `${((idx * 19 + layerIdx * 23) % 88) + 4}%`,
                    width: isStreak ? '1.5px' : idx % 2 === 0 ? '3px' : '2px',
                    height: isStreak ? '14px' : idx % 2 === 0 ? '3px' : '2px',
                    borderRadius: isStreak ? '1px' : '9999px',
                    transform: isStreak ? 'rotate(16deg)' : undefined,
                    backgroundColor: particleColor,
                    opacity: 0.72,
                    boxShadow: `0 0 6px ${particleColor}`,
                  }}
                />
              ));
            })}
          </div>
        )}

        {/* 5. Badge / Track Card Miniature */}
        {track.showTrackCard !== false && track.cardStyle !== 'hidden' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none"
            style={{ top: `${badgeY}%`, width: preset.aspectRatio === '16:9' ? '70%' : '84%' }}
          >
            {track.cardStyle === 'glass-card' || track.cardStyle === 'horizontal-rounded-card' ? (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/55 backdrop-blur-md border max-w-full"
                style={{
                  borderColor:
                    track.cardStyle === 'horizontal-rounded-card'
                      ? track.badgeBorderColor || track.accentColor || primary
                      : 'rgba(255,255,255,0.18)',
                }}
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-neutral-800 border border-white/15 flex items-center justify-center">
                  {track.coverUrl && !coverFailed ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      onError={() => setCoverFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music2 className="w-3.5 h-3.5 text-neutral-300" />
                  )}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-[10px] font-bold text-white truncate leading-tight">
                    {track.title || 'Track Title'}
                  </div>
                  <div className="text-[8px] text-neutral-300 truncate leading-tight">
                    {track.artist || 'Artist Name'}
                  </div>
                </div>
              </div>
            ) : track.cardStyle === 'minimal-tag' ? (
              <div className="text-center">
                <div className="text-[10px] font-bold text-white drop-shadow truncate max-w-[160px]">
                  {track.title || 'Track Title'}
                </div>
                <div className="text-[8px] text-neutral-300 drop-shadow truncate max-w-[140px]">
                  {track.artist || 'Artist Name'}
                </div>
              </div>
            ) : track.cardStyle === 'triangle-badge' ? (
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-12 h-11 flex items-center justify-center relative"
                  style={{
                    filter: `drop-shadow(0 0 8px ${(track.badgeBorderColor || primary)}88)`,
                  }}
                >
                  <div
                    className="w-full h-full p-[2px]"
                    style={{
                      clipPath: 'polygon(50% 4%, 96% 94%, 4% 94%)',
                      backgroundColor: track.badgeBorderColor || track.accentColor || primary,
                    }}
                  >
                    <div
                      className="w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center"
                      style={{
                        clipPath: 'polygon(50% 6%, 94% 92%, 6% 92%)',
                      }}
                    >
                      {track.coverUrl && !coverFailed ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          onError={() => setCoverFailed(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music2 className="w-4 h-4 text-white/80 translate-y-1" />
                      )}
                    </div>
                  </div>
                </div>
                {track.showTitle !== false && (
                  <div className="text-center max-w-[150px]">
                    <div className="text-[9px] font-bold text-white drop-shadow truncate">
                      {track.title || 'Track Title'}
                    </div>
                    {track.showArtist !== false && (
                      <div className="text-[8px] text-neutral-300 drop-shadow truncate">
                        {track.artist || 'Artist'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* rotating-badge, vinyl, circular-badge, logo-badge */
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-11 h-11 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg bg-neutral-900"
                  style={{
                    borderColor: primary,
                    boxShadow: `0 0 12px ${primary}66`,
                  }}
                >
                  {track.coverUrl && !coverFailed ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      onError={() => setCoverFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Disc3 className="w-6 h-6 text-white/80" />
                  )}
                </div>
                {track.showTitle !== false && (
                  <div className="text-center max-w-[150px]">
                    <div className="text-[9px] font-bold text-white drop-shadow truncate">
                      {track.title || 'Track Title'}
                    </div>
                    {track.showArtist !== false && (
                      <div className="text-[8px] text-neutral-300 drop-shadow truncate">
                        {track.artist || 'Artist'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. Sample Lyrics Preview Line */}
        {lyrics?.enabled !== false && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[86%] text-center pointer-events-none"
            style={{ top: `${lyricsY}%` }}
          >
            <div
              className="text-[10px] font-semibold tracking-wide truncate px-2 py-0.5 rounded"
              style={{
                color: lyrics?.activeColor || '#ffffff',
                textShadow: `0 0 8px ${lyrics?.glowColor || primary}`,
                backgroundColor:
                  lyrics?.style === 'subtitle-bar' || lyrics?.showBackgroundPill
                    ? 'rgba(0,0,0,0.48)'
                    : 'transparent',
              }}
            >
              {language === 'vi' ? 'Giai điệu vang lên giữa đêm...' : 'Melodies echo through the night...'}
            </div>
          </div>
        )}

        {/* 7. Visualizer Preview Miniature */}
        {vis?.visible !== false && (
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none"
            style={{
              top: isRadialVisualizer ? `${badgeY}%` : `${visY}%`,
              width: '82%',
            }}
          >
            {isRadialVisualizer ? (
              <div
                className="w-20 h-20 rounded-full border-2 border-dashed opacity-75"
                style={{
                  borderColor: primary,
                  boxShadow: `0 0 14px ${secondary}80`,
                }}
              />
            ) : isWaveVisualizer ? (
              <svg viewBox="0 0 180 36" className="w-full h-9 overflow-visible">
                <defs>
                  <linearGradient id={`wave-${preset.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={primary} />
                    <stop offset="50%" stopColor={secondary} />
                    <stop offset="100%" stopColor={tertiary} />
                  </linearGradient>
                </defs>
                <path
                  d="M0,18 Q22,4 45,18 T90,18 T135,18 T180,18"
                  fill="none"
                  stroke={`url(#wave-${preset.id})`}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <div className="flex items-center justify-center gap-1 h-9 w-full">
                {barHeights.map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 rounded-full"
                    style={{
                      height: `${Math.round(h * 100)}%`,
                      background:
                        vis?.colorMode === 'solid'
                          ? primary
                          : `linear-gradient(to top, ${primary}, ${secondary})`,
                      boxShadow: (vis?.glowIntensity ?? 0) > 10 ? `0 0 6px ${primary}88` : undefined,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom subtle ratio readout inside corner */}
        <div className="absolute bottom-2 right-2 text-[10px] font-mono tabular-nums text-white/85 bg-black/55 px-1.5 py-0.5 rounded">
          {preset.aspectRatio}
        </div>
      </div>
    </div>
  );
};

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  language = 'vi',
  currentConfig,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];
  const isVi = language === 'vi';

  const [userPresets, setUserPresets] = useState<PresetTheme[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_THEMES[0]?.id || '');

  // Left-panel organization: List vs Thumbnail + Filters + Create New Preset
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [ratioFilter, setRatioFilter] = useState<RatioFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline create form state
  const [isCreating, setIsCreating] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetCategory, setPresetCategory] = useState<Exclude<GroupFilter, 'all'>>('custom');
  const [presetDesc, setPresetDesc] = useState('');

  // Confirmations & feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inlineConfirmId, setInlineConfirmId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allPresets = useMemo(() => {
    return [...userPresets, ...PRESET_THEMES];
  }, [userPresets]);

  // Load user presets on open
  useEffect(() => {
    if (isOpen) {
      const loadedUser = getUserPresets();
      setUserPresets(loadedUser);
      setIsCreating(false);
      setInlineConfirmId(null);
      setConfirmClearAll(false);
      setSelectedPresetId((prev) => {
        const combined = [...loadedUser, ...PRESET_THEMES];
        if (prev && combined.some((p) => p.id === prev)) return prev;
        return combined[0]?.id || '';
      });
    }
  }, [isOpen]);

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPresets.filter((p) => {
      if (sourceFilter === 'builtin' && p.isUserPreset) return false;
      if (sourceFilter === 'custom' && !p.isUserPreset) return false;

      if (groupFilter !== 'all') {
        const cat = p.category || (p.isUserPreset ? 'custom' : 'neon');
        if (cat !== groupFilter) return false;
      }

      if (ratioFilter !== 'all' && p.aspectRatio !== ratioFilter) return false;

      if (q) {
        const haystack = [
          p.name,
          p.nameVi,
          p.description,
          p.descriptionEn,
          p.aspectRatio,
          p.visualizer?.type,
          p.track?.cardStyle,
          p.colorGrading?.lut,
          getGroupLabel(p.category, language),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allPresets, sourceFilter, groupFilter, ratioFilter, searchQuery, language]);

  const selectedPreset = useMemo(() => {
    return (
      allPresets.find((p) => p.id === selectedPresetId) ||
      filteredPresets[0] ||
      allPresets[0] ||
      null
    );
  }, [allPresets, filteredPresets, selectedPresetId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  const handleSaveCurrentPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) {
      showToast(isVi ? 'Vui lòng nhập tên cho preset!' : 'Please enter a preset name!');
      return;
    }

    if (!currentConfig) {
      showToast(isVi ? 'Không có cấu hình để lưu!' : 'No configuration available to save!');
      return;
    }

    const bg = currentConfig.background;
    const derivedThumbnail =
      (bg.type === 'preset' || bg.type === 'upload') && bg.url
        ? bg.url
        : currentConfig.track?.coverUrl || '';

    const newId = `user-preset-${Date.now()}`;
    const newPreset: PresetTheme = {
      id: newId,
      name: presetName.trim(),
      nameVi: presetName.trim(),
      description: presetDesc.trim() || (isVi ? 'Preset tùy chỉnh lưu từ trình chỉnh sửa' : 'Custom preset saved from editor'),
      descriptionEn: presetDesc.trim() || 'Custom preset saved from editor',
      category: presetCategory,
      aspectRatio: currentConfig.aspectRatio || '9:16',
      visualizer: { ...currentConfig.visualizer },
      lyrics: currentConfig.lyrics ? { ...currentConfig.lyrics } : undefined!,
      background: { ...currentConfig.background },
      particles: { ...currentConfig.particles },
      filmLight: currentConfig.filmLight ? { ...currentConfig.filmLight } : undefined,
      colorGrading: currentConfig.colorGrading ? { ...currentConfig.colorGrading } : undefined,
      masterEq: currentConfig.masterEq ? { ...currentConfig.masterEq } : undefined,
      sceneTransitions: currentConfig.sceneTransitions ? { ...currentConfig.sceneTransitions } : undefined,
      track: currentConfig.track ? { ...currentConfig.track } : { ...DEFAULT_TRACK },
      textBoxes: currentConfig.textBoxes ? [...currentConfig.textBoxes] : undefined,
      lotties: currentConfig.lotties ? [...currentConfig.lotties] : undefined,
      thumbnail: derivedThumbnail,
      isUserPreset: true,
      createdAt: Date.now(),
    };

    const updated = saveUserPreset(newPreset);
    setUserPresets(updated);
    setPresetName('');
    setPresetDesc('');
    setIsCreating(false);
    setSourceFilter('all');
    setGroupFilter('all');
    setRatioFilter('all');
    setSearchQuery('');
    setSelectedPresetId(newId);
    showToast(t.presetSavedSuccess || (isVi ? 'Đã lưu Preset thành công!' : 'Preset saved successfully!'));
  };

  const handleDirectDelete = (id: string, name: string) => {
    const updated = deleteUserPreset(id);
    setUserPresets(updated);
    setInlineConfirmId(null);
    if (selectedPresetId === id) {
      const next = updated[0] || PRESET_THEMES[0];
      if (next) setSelectedPresetId(next.id);
    }
    showToast(
      t.presetDeletedSuccess || (isVi ? `Đã xóa Preset "${name}"!` : `Preset "${name}" deleted!`)
    );
  };

  const executeClearAll = () => {
    const updated = clearAllUserPresets();
    setUserPresets(updated);
    setConfirmClearAll(false);
    setSelectedPresetId(PRESET_THEMES[0]?.id || '');
    showToast(isVi ? 'Đã xóa toàn bộ Preset tùy chỉnh!' : 'All custom presets deleted!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const { count, presets, importedIds } = importUserPresets(parsed);
        setUserPresets(presets);
        setSourceFilter('all');
        setGroupFilter('all');
        setRatioFilter('all');
        setSearchQuery('');
        if (importedIds && importedIds[0]) {
          setSelectedPresetId(importedIds[0]);
        }
        showToast(
          isVi ? `Đã tải lên thành công ${count} preset!` : `Uploaded ${count} preset(s) successfully!`
        );
      } catch {
        showToast(isVi ? 'File JSON preset không hợp lệ!' : 'Invalid preset JSON file!');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleApplySelected = () => {
    if (!selectedPreset) return;
    onSelectTheme(selectedPreset);
    onClose();
  };

  const resetFilters = () => {
    setSourceFilter('all');
    setGroupFilter('all');
    setRatioFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    sourceFilter !== 'all' || groupFilter !== 'all' || ratioFilter !== 'all' || searchQuery.trim() !== '';

  // Compute structured spec details for right preview column
  const renderPresetSpecs = (preset: PresetTheme) => {
    const vis = preset.visualizer;
    const bg = preset.background;
    const track = preset.track || DEFAULT_TRACK;
    const particles = preset.particles;
    const filmLight = preset.filmLight ?? DEFAULT_FILM_LIGHT;
    const colorGrading = preset.colorGrading ?? DEFAULT_COLOR_GRADING;

    // BG description
    const bgTypeName = (() => {
      if (bg?.mode === 'slides') return isVi ? `Slideshow (${bg.slides?.length || 0} ảnh)` : `Slideshow (${bg.slides?.length || 0} slides)`;
      switch (bg?.type) {
        case 'video':
          return isVi ? 'Video MP4 nền' : 'Video MP4';
        case 'gradient':
          return isVi ? 'Dải màu Gradient' : 'Color Gradient';
        case 'solid':
          return isVi ? 'Màu đơn sắc' : 'Solid Color';
        case 'upload':
          return isVi ? 'Ảnh tải lên' : 'Uploaded Image';
        default:
          return isVi ? 'Ảnh nền Preset' : 'Preset Image';
      }
    })();

    const activeBgFx: string[] = [];
    if (bg?.beatZoom) activeBgFx.push('Beat Zoom');
    if (bg?.glitchEffect) activeBgFx.push('Glitch');
    if (bg?.circleRipple) activeBgFx.push('Circle Ripple');
    if (bg?.filmGrain) activeBgFx.push(isVi ? 'Nhiễu hạt phim' : 'Film Grain');

    // VFX (Particles + Film Light)
    const activeLayers =
      particles?.enabled && particles.layers && particles.layers.length > 0
        ? particles.layers.filter((l) => l.enabled && l.type !== 'none')
        : particles?.enabled && particles.type && particles.type !== 'none'
          ? [{ type: particles.type, count: particles.count }]
          : [];

    const particleSummary =
      activeLayers.length > 0
        ? activeLayers.map((l) => `${getParticleLabel(l.type, language)} (${l.count})`).join(', ')
        : isVi
          ? 'Tắt'
          : 'Off';

    const filmLightSummary = filmLight.enabled
      ? `${getFilmLightLabel(filmLight.style, language)} · ${Math.round((filmLight.intensity ?? 0.65) * 100)}%`
      : isVi
        ? 'Tắt'
        : 'Off';

    // Photo FX (Color Grading)
    const photoFxSummary = colorGrading.enabled
      ? `${getLutLabel(colorGrading.lut, language)} (${Math.round((colorGrading.lutIntensity ?? 1) * 100)}%)`
      : isVi
        ? 'Mặc định / Tự nhiên'
        : 'Default / Natural';

    const photoFxExtras: string[] = [];
    if (colorGrading.enabled && colorGrading.filmGrain > 0) {
      photoFxExtras.push(`Grain ${colorGrading.filmGrain}%`);
    }
    if (colorGrading.enabled && colorGrading.bloomGlow > 0) {
      photoFxExtras.push(`Bloom ${colorGrading.bloomGlow}%`);
    }
    if (colorGrading.enabled && colorGrading.vignette > 0) {
      photoFxExtras.push(`Vignette ${colorGrading.vignette}%`);
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
        {/* Aspect Ratio */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
            <Maximize2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>{isVi ? 'Aspect Ratio (Tỷ lệ)' : 'Aspect Ratio'}</span>
          </div>
          <div className="text-xs font-semibold text-white tabular-nums">
            {getAspectRatioLabel(preset.aspectRatio, language)}
          </div>
        </div>

        {/* Badge Style */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
            <Disc3 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>{isVi ? 'Badge Style (Kiểu thẻ)' : 'Badge Style'}</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {getBadgeStyleLabel(track.cardStyle, language)}
          </div>
          <div className="text-[11px] text-neutral-400 truncate">
            {track.showTrackCard === false
              ? isVi
                ? 'Đã ẩn thẻ'
                : 'Card hidden'
              : track.badgeBorderEffectEnabled
                ? `${track.badgeBorderEffect || 'glow'} · ${track.title || 'Untitled'}`
                : `${track.title || 'Untitled'} · ${track.artist || 'Artist'}`}
          </div>
        </div>

        {/* Visualizer */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>Visualizer</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white truncate">
              {getVisualizerLabel(vis.type, language)}
            </span>
            <div className="flex items-center gap-1 shrink-0" title={vis.colorMode}>
              <span
                className="w-3 h-3 rounded-full border border-white/25"
                style={{ backgroundColor: vis.primaryColor }}
              />
              <span
                className="w-3 h-3 rounded-full border border-white/25"
                style={{ backgroundColor: vis.secondaryColor }}
              />
              {vis.tertiaryColor && (
                <span
                  className="w-3 h-3 rounded-full border border-white/25"
                  style={{ backgroundColor: vis.tertiaryColor }}
                />
              )}
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 tabular-nums">
            {vis.colorMode} · {vis.barCount} {isVi ? 'cột' : 'bars'} · {isVi ? 'Sáng' : 'Glow'} {vis.glowIntensity}
          </div>
        </div>

        {/* BG */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>BG ({isVi ? 'Hình nền' : 'Background'})</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">{bgTypeName}</div>
          <div className="text-[11px] text-neutral-400 tabular-nums truncate">
            Blur {bg?.blur ?? 0}px · {isVi ? 'Sáng' : 'Bright'} {bg?.brightness ?? 85}% · Vignette {bg?.vignette ?? 0}%
            {activeBgFx.length > 0 ? ` · ${activeBgFx.join(', ')}` : ''}
          </div>
        </div>

        {/* VFX */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
            <Wand2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>VFX ({isVi ? 'Hạt & Ánh sáng' : 'Particles & Light'})</span>
          </div>
          <div className="text-xs font-semibold text-white truncate" title={particleSummary}>
            {particleSummary}
          </div>
          <div className="text-[11px] text-neutral-400 truncate tabular-nums">
            Film Light: {filmLightSummary}
          </div>
        </div>

        {/* Photo FX */}
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
            <Palette className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>Photo FX ({isVi ? 'Chỉnh màu / LUT' : 'Color Grading'})</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">{photoFxSummary}</div>
          <div className="text-[11px] text-neutral-400 truncate tabular-nums">
            {photoFxExtras.length > 0
              ? photoFxExtras.join(' · ')
              : isVi
                ? 'Không có bộ lọc bổ sung'
                : 'No extra optical filters'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      {/* ~80% Viewport Width Modal */}
      <div className="w-[95vw] sm:w-[88vw] lg:w-[80vw] max-w-[1440px] h-[92vh] sm:h-[85vh] max-h-[880px] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl relative flex flex-col overflow-hidden">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between gap-4 shrink-0 bg-neutral-900">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {t.presetsTitle || (isVi ? 'Mẫu Thiết Kế Sẵn & Giao Diện Mẫu' : 'Design Templates & Aesthetic Presets')}
              </h3>
              <p className="text-xs text-neutral-400 truncate">
                {t.presetsSubtitle ||
                  (isVi
                    ? 'Chọn, xem trước chi tiết hoặc lưu & chia sẻ preset cấu hình video của bạn'
                    : 'Browse, preview specs, create new presets, or import/export JSON')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isVi ? 'Đóng' : 'Close'}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden JSON Upload Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
        />

        {/* 2-Column Workspace Split */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 overflow-hidden">
          {/* LEFT COLUMN: New Preset + Filters + List/Thumbnail View */}
          <div className="lg:col-span-5 flex flex-col min-h-0 bg-neutral-950/60 overflow-hidden">
            {/* Top Controls Bar */}
            <div className="p-3.5 sm:p-4 border-b border-neutral-800 space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isCreating
                      ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Tạo Preset Mới' : 'New Preset'}</span>
                </button>

                {/* List / Thumbnail View Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    title={isVi ? 'Kiểu danh sách' : 'List view'}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      viewMode === 'list'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isVi ? 'Danh sách' : 'List'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('thumbnail')}
                    title={isVi ? 'Kiểu thumbnail' : 'Thumbnail view'}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      viewMode === 'thumbnail'
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isVi ? 'Thumbnail' : 'Grid'}</span>
                  </button>
                </div>
              </div>

              {/* Inline New Preset Creation Form */}
              {isCreating && (
                <form
                  onSubmit={handleSaveCurrentPreset}
                  className="p-3.5 rounded-xl bg-neutral-900 border border-amber-500/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">
                      {isVi ? 'Lưu cấu hình hiện tại thành Preset mới' : 'Save Current Settings as New Preset'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                        {t.presetName || (isVi ? 'Tên Preset' : 'Preset Name')} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isVi ? 'Ví dụ: Lofi Đêm Mưa 9:16' : 'e.g., Midnight Lofi 9:16'}
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                        {isVi ? 'Nhóm (Group)' : 'Group'}
                      </label>
                      <select
                        value={presetCategory}
                        onChange={(e) => setPresetCategory(e.target.value as Exclude<GroupFilter, 'all'>)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        {PRESET_GROUPS.map((g) => (
                          <option key={g.id} value={g.id}>
                            {isVi ? g.labelVi : g.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      {t.presetDescription || (isVi ? 'Mô tả ngắn' : 'Description')}
                    </label>
                    <input
                      type="text"
                      placeholder={isVi ? 'Phong cách, thể loại nhạc phù hợp...' : 'Style, mood, or genre notes...'}
                      value={presetDesc}
                      onChange={(e) => setPresetDesc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {currentConfig && (
                    <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums">
                      <span>{currentConfig.aspectRatio}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getVisualizerLabel(currentConfig.visualizer.type, language)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getBadgeStyleLabel(currentConfig.track?.cardStyle, language)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
                    >
                      {t.cancel || (isVi ? 'Hủy' : 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold cursor-pointer"
                    >
                      {isVi ? 'Lưu Preset' : 'Save Preset'}
                    </button>
                  </div>
                </form>
              )}

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isVi ? 'Tìm tên preset, visualizer, LUT...' : 'Search presets, visualizer, LUT...'}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Controls: Source + Group + Aspect Ratio */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
                  {(
                    [
                      { id: 'all', label: isVi ? 'Tất cả' : 'All', count: allPresets.length },
                      { id: 'builtin', label: isVi ? 'Mẫu sẵn' : 'Built-in', count: PRESET_THEMES.length },
                      { id: 'custom', label: isVi ? 'Của tôi' : 'My Presets', count: userPresets.length },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSourceFilter(tab.id)}
                      className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                        sourceFilter === tab.id
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[11px] text-neutral-400 tabular-nums">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value as GroupFilter)}
                    aria-label={isVi ? 'Lọc theo nhóm' : 'Filter by group'}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  >
                    <option value="all">{isVi ? 'Nhóm: Tất cả' : 'Group: All'}</option>
                    {PRESET_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {isVi ? g.labelVi : g.labelEn}
                      </option>
                    ))}
                  </select>

                  <select
                    value={ratioFilter}
                    onChange={(e) => setRatioFilter(e.target.value as RatioFilter)}
                    aria-label={isVi ? 'Lọc theo tỷ lệ' : 'Filter by aspect ratio'}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
                  >
                    <option value="all">{isVi ? 'Tỷ lệ: Tất cả' : 'Ratio: All'}</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scrollable Preset List or Thumbnail Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar">
              {filteredPresets.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-xl border border-neutral-800/80 bg-neutral-900/40 flex flex-col items-center gap-3">
                  <FolderOpen className="w-8 h-8 text-neutral-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {isVi ? 'Không tìm thấy preset phù hợp' : 'No matching presets found'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {hasActiveFilters
                        ? isVi
                          ? 'Thử xóa bộ lọc hoặc từ khóa tìm kiếm.'
                          : 'Try clearing your active filters or search query.'
                        : isVi
                          ? 'Hãy tạo preset mới hoặc tải lên tệp JSON.'
                          : 'Create a new preset or upload a JSON preset file.'}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white cursor-pointer"
                    >
                      {isVi ? 'Xóa Bộ Lọc' : 'Clear Filters'}
                    </button>
                  )}
                </div>
              ) : viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="space-y-1.5">
                  {filteredPresets.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    const displayTitle = isVi ? preset.nameVi || preset.name : preset.name;
                    return (
                      <div
                        key={preset.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          setInlineConfirmId(null);
                        }}
                        onDoubleClick={() => {
                          onSelectTheme(preset);
                          onClose();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPresetId(preset.id);
                          }
                        }}
                        className={`w-full p-2 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-900 border-rose-500/70'
                            : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                        }`}
                      >
                        <div className="w-16 h-11 rounded-lg overflow-hidden shrink-0 border border-neutral-800 bg-neutral-900">
                          <PresetThumbnail preset={preset} alt={displayTitle} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white truncate">
                              {displayTitle}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate mt-0.5 tabular-nums">
                            {preset.aspectRatio} · {getGroupLabel(preset.category, language)} ·{' '}
                            {preset.isUserPreset ? (isVi ? 'Của tôi' : 'Custom') : isVi ? 'Có sẵn' : 'Built-in'}
                          </div>
                        </div>

                        {preset.isUserPreset && (
                          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            {inlineConfirmId === preset.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDirectDelete(preset.id, displayTitle)}
                                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  {isVi ? 'Xóa' : 'Yes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInlineConfirmId(null)}
                                  className="px-1.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
                                >
                                  {isVi ? 'Hủy' : 'No'}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setInlineConfirmId(preset.id)}
                                title={isVi ? 'Xóa preset' : 'Delete preset'}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* THUMBNAIL GRID VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredPresets.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    const displayTitle = isVi ? preset.nameVi || preset.name : preset.name;
                    return (
                      <div
                        key={preset.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          setInlineConfirmId(null);
                        }}
                        onDoubleClick={() => {
                          onSelectTheme(preset);
                          onClose();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPresetId(preset.id);
                          }
                        }}
                        className={`p-2.5 rounded-xl border transition-colors flex flex-col gap-2 cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-900 border-rose-500/80'
                            : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/50'
                        }`}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
                          <PresetThumbnail preset={preset} alt={displayTitle} />
                          <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono tabular-nums text-white bg-black/65 px-1.5 py-0.5 rounded">
                            {preset.aspectRatio}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {displayTitle}
                            </h4>
                            {preset.isUserPreset && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inlineConfirmId === preset.id) {
                                    handleDirectDelete(preset.id, displayTitle);
                                  } else {
                                    setInlineConfirmId(preset.id);
                                  }
                                }}
                                title={
                                  inlineConfirmId === preset.id
                                    ? isVi
                                      ? 'Bấm lại để xác nhận xóa'
                                      : 'Click again to confirm delete'
                                    : isVi
                                      ? 'Xóa preset'
                                      : 'Delete preset'
                                }
                                className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                                  inlineConfirmId === preset.id
                                    ? 'bg-rose-600 text-white'
                                    : 'text-neutral-500 hover:text-rose-400'
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {getGroupLabel(preset.category, language)} ·{' '}
                            {getVisualizerLabel(preset.visualizer.type, language)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Left Column Sub-footer (Clear custom presets if needed) */}
            {userPresets.length > 0 && (
              <div className="px-3.5 py-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 shrink-0 bg-neutral-950/80">
                <span className="tabular-nums">
                  {isVi
                    ? `${filteredPresets.length} / ${allPresets.length} preset`
                    : `${filteredPresets.length} of ${allPresets.length} presets`}
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {isVi ? 'Xóa hết preset tùy chỉnh' : 'Clear custom presets'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Selected Preset Preview + Specs + Download/Upload + Apply */}
          <div className="lg:col-span-7 flex flex-col min-h-0 bg-neutral-900 overflow-hidden">
            {selectedPreset ? (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
                  {/* Visual Aspect-Ratio Stage Preview */}
                  <PresetStagePreview preset={selectedPreset} language={language} />

                  {/* Preset Title, Group Metadata & Description */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {isVi ? selectedPreset.nameVi || selectedPreset.name : selectedPreset.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400 tabular-nums">
                        <span>{getGroupLabel(selectedPreset.category, language)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {selectedPreset.isUserPreset
                            ? isVi
                              ? 'Preset của tôi'
                              : 'My Preset'
                            : isVi
                              ? 'Mẫu có sẵn'
                              : 'Built-in'}
                        </span>
                        {selectedPreset.createdAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{new Date(selectedPreset.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed pt-1">
                        {isVi
                          ? selectedPreset.description
                          : selectedPreset.descriptionEn || selectedPreset.description}
                      </p>
                    </div>
                  </div>

                  {/* Structured Technical Specs (Aspect Ratio, Badge Style, Visualizer, BG, VFX, Photo FX) */}
                  {renderPresetSpecs(selectedPreset)}
                </div>

                {/* Right Column Action Footer: Download JSON, Upload JSON, Apply */}
                <div className="px-4 sm:px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        exportSinglePresetJson(selectedPreset);
                        showToast(
                          isVi ? 'Đã tải xuống tệp Preset (.json)!' : 'Preset (.json) downloaded!'
                        );
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Download Preset (.json)' : 'Download Preset (.json)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Upload Presets (.json)' : 'Upload Presets (.json)'}</span>
                    </button>

                    {userPresets.length > 0 && (
                      <button
                        type="button"
                        onClick={exportUserPresetsJson}
                        title={isVi ? 'Xuất tất cả preset của tôi' : 'Export all custom presets'}
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-medium border border-neutral-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Xuất tất cả' : 'Export All'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      {isVi ? 'Đóng' : 'Close'}
                    </button>

                    <button
                      type="button"
                      onClick={handleApplySelected}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.applyPreset || (isVi ? 'Apply Preset' : 'Apply Preset')}</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-neutral-400">
                {isVi ? 'Chọn một preset ở cột bên trái để xem trước.' : 'Select a preset on the left to preview.'}
              </div>
            )}
          </div>
        </div>

        {/* Clear All Custom Presets Confirmation Dialog */}
        {confirmClearAll && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isVi ? 'Xóa Toàn Bộ Preset' : 'Clear All Custom Presets'}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {isVi
                      ? 'Thao tác này sẽ xóa toàn bộ các preset tùy chỉnh bạn đã lưu trong trình duyệt. Bạn có chắc không?'
                      : 'This will delete all custom presets stored in your browser. Are you sure?'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  {t.cancel || (isVi ? 'Hủy' : 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={executeClearAll}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  {isVi ? 'Xóa Hết' : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
