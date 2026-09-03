import React from 'react';
import { VisualizerConfig, VisualizerType, VisualizerColorMode } from '../types';
import { COLOR_PALETTES } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  BarChart2, 
  Disc, 
  Activity, 
  Sparkles, 
  Flame, 
  Radio, 
  Cpu, 
  Layers,
  Zap,
  Waves,
  RefreshCw,
  Gauge,
  Dna,
  Orbit,
  Sun,
  Grid3X3,
  Split
} from 'lucide-react';

interface VisualizerTabProps {
  config: VisualizerConfig;
  onChange: (config: VisualizerConfig) => void;
  detectedBpm?: number;
  isDetectingBpm?: boolean;
  onReDetectBpm?: () => void;
  language?: Language;
}

interface TypeOption {
  type: VisualizerType;
  label: string;
  labelVi: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  descriptionEn: string;
  badge?: string;
  badgeEn?: string;
}

const VISUALIZER_TYPES: TypeOption[] = [
  {
    type: 'bars-peaks',
    label: 'Spectrum Peak Drops',
    labelVi: 'Spectrum Cột Hạt Rơi',
    icon: BarChart2,
    description: 'Thanh phổ âm kèm hạt đỉnh rơi vật lý siêu thực Winamp',
    descriptionEn: 'Audio spectrum bars with realistic gravity peak drops',
    badge: 'Mới & Hot',
    badgeEn: 'Hot',
  },
  {
    type: 'bars-mirrored-peaks',
    label: 'Mirrored Peaks',
    labelVi: 'Sóng Đối Xứng Hạt Đỉnh',
    icon: BarChart2,
    description: 'Cột đối xứng 2 đầu kèm hạt rơi phía trên và dưới',
    descriptionEn: 'Dual-sided mirrored bars with floating peak particles',
    badge: 'Mới',
    badgeEn: 'New',
  },
  {
    type: 'spectrum-line',
    label: 'Smooth Area Curve',
    labelVi: 'Dải Phổ Gradient Mịn',
    icon: Waves,
    description: 'Đường cong sóng phủ màu gradient và điểm sáng lấp lánh',
    descriptionEn: 'Silky smooth curved audio waveform with glowing crests',
    badge: 'Mới',
    badgeEn: 'New',
  },
  {
    type: 'radial-bars-peaks',
    label: 'Radial Peak Orbit',
    labelVi: 'Vòng Tròn Hạt Bay Tỏa',
    icon: Disc,
    description: 'Tia xoay tròn 360° với hạt đỉnh bắn ra theo nhịp bass',
    descriptionEn: '360° circular orbit rays emitting dynamic bass particles',
    badge: 'Mới',
    badgeEn: 'New',
  },
  {
    type: 'dna-helix',
    label: 'DNA Neon Helix',
    labelVi: 'Chuỗi Xoắn Kép DNA 3D',
    icon: Dna,
    description: 'Hai dải xoắn kép đan xen kèm bậc thang tần số phát sáng 3D',
    descriptionEn: 'Double-helix neon DNA strands with 3D oscillating rungs',
    badge: 'Mới Siêu Đẹp',
    badgeEn: 'Stunning 3D',
  },
  {
    type: 'tunnel-vortex',
    label: 'Vortex Portal 3D',
    labelVi: 'Đường Hầm Không Gian 3D',
    icon: Orbit,
    description: 'Cổng đa giác xoay vô cực chuyển động theo dải tần âm trầm',
    descriptionEn: 'Infinite polygon spatial wormhole pulsing to sub-bass',
    badge: 'Mới 3D',
    badgeEn: '3D Tunnel',
  },
  {
    type: 'laser-beams',
    label: 'EDM Concert Lasers',
    labelVi: 'Tia Laser Sân Khấu EDM',
    icon: Zap,
    description: 'Dàn chùm tia laser quét góc rộng bùng nổ theo nhịp kick',
    descriptionEn: 'Wide-angle concert laser show synchronized with kick drums',
    badge: 'Mới Sôi Động',
    badgeEn: 'Concert',
  },
  {
    type: 'starburst-core',
    label: 'Starburst Nova Core',
    labelVi: 'Lõi Siêu Tân Tinh Tỏa Sáng',
    icon: Sun,
    description: 'Vụ nổ hạt sao đa giác 360° với tâm phát quang hạt năng lượng',
    descriptionEn: 'Radial cosmic supernova core erupting audio spark flares',
    badge: 'Mới Vũ Trụ',
    badgeEn: 'Cosmic',
  },
  {
    type: 'audio-equalizer-grid',
    label: 'Cyber EQ Matrix Grid',
    labelVi: 'Ma Trận EQ Khối Nổi',
    icon: Grid3X3,
    description: 'Lưới tầng bậc LED đa sắc màu xếp chồng phản ứng cực nhạy',
    descriptionEn: 'Cyberpunk layered LED VU meter grid with instant transient response',
    badge: 'Mới Pro',
    badgeEn: 'Pro Grid',
  },
  {
    type: 'bars-mirrored',
    label: 'Mirrored Bars',
    labelVi: 'Sóng Cột Đối Xứng',
    icon: BarChart2,
    description: 'Thanh equalizer đối xứng trên dưới bắt mắt',
    descriptionEn: 'Top and bottom symmetrical equalizer bars',
  },
  {
    type: 'bars',
    label: 'Classic Bars',
    labelVi: 'Cột Cổ Điển (EQ)',
    icon: BarChart2,
    description: 'Equalizer truyền thống hướng lên trên',
    descriptionEn: 'Classic bottom-to-top audio frequency columns',
  },
  {
    type: 'circular-spikes',
    label: 'Radial Spikes',
    labelVi: 'Tia Tròn Tỏa Sáng',
    icon: Disc,
    description: 'Tia sóng xoay quanh tâm đĩa phát sáng',
    descriptionEn: 'Luminous circular spikes rotating around vinyl center',
  },
  {
    type: 'smooth-wave',
    label: 'Liquid Wave',
    labelVi: 'Sóng Nước Mềm Mại',
    icon: Activity,
    description: 'Sóng chất lỏng chuyển động mượt mà',
    descriptionEn: 'Silky smooth liquid audio oscilloscope wave',
  },
  {
    type: 'cyber-matrix',
    label: 'Cyber Matrix',
    labelVi: 'Ma Trận LED Cyber',
    icon: Cpu,
    description: 'Khối LED số nhảy theo từng dải tần số',
    descriptionEn: 'Digital cyber LED bricks jumping to octave bins',
  },
  {
    type: 'flame-spectrum',
    label: 'Plasma Fire',
    labelVi: 'Ngọn Lửa Plasma',
    icon: Flame,
    description: 'Ngọn lửa âm nhạc rực cháy theo nhịp kick',
    descriptionEn: 'Blazing musical plasma flames rising on heavy drops',
  },
  {
    type: 'double-ribbon',
    label: 'Dual Ribbon',
    labelVi: 'Dải Ruy Băng Đôi',
    icon: Radio,
    description: 'Hai sợi dây sóng đan xen mềm mại',
    descriptionEn: 'Dual intertwined neon ribbons flowing effortlessly',
  },
  {
    type: 'minimal-pulse',
    label: 'Minimal Dots',
    labelVi: 'Chấm Tối Giản',
    icon: Layers,
    description: 'Đường ngang tinh gọn phong cách audiophile',
    descriptionEn: 'Clean minimalist dot matrix for high-end aesthetic',
  },
];

export const VisualizerTab: React.FC<VisualizerTabProps> = ({
  config,
  onChange,
  detectedBpm = 120,
  isDetectingBpm = false,
  onReDetectBpm,
  language = 'vi',
}) => {
  const isVi = language === 'vi';
  const update = (partial: Partial<VisualizerConfig>) => {
    onChange({ ...config, ...partial });
  };

  const currentBpm = config.bpm || detectedBpm || 120;
  const isBpmSyncOn = config.syncBpmPulse ?? true;

  const applyPalette = (p: { primary: string; secondary: string; tertiary: string }) => {
    update({
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      tertiaryColor: p.tertiary,
    });
  };

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 0. BPM Detection & Rhythm Pulse Rate Synchronization */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-neutral-900/90 to-neutral-950 border border-rose-500/25 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-100">
                  {isVi ? 'Đồng Bộ Nhịp BPM (Tempo Sync)' : 'BPM Tempo Synchronization'}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  {currentBpm} BPM
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {isVi ? 'Tự động bắt nhịp BPM bài hát để visualizer nảy xung nhịp chuẩn xác' : 'Automatically synchronizes visuals and pulse rate to track tempo'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBpmSyncOn}
              onChange={(e) => update({ syncBpmPulse: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* BPM Adjuster & Auto Re-detect */}
        <div className="space-y-2 pt-1 border-t border-rose-500/15">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              {isVi ? 'Tốc độ nhịp đập (Pulse Rate)' : 'Pulse Rate (BPM)'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-rose-400">{currentBpm} BPM</span>
              {onReDetectBpm && (
                <button
                  onClick={onReDetectBpm}
                  disabled={isDetectingBpm}
                  title={isVi ? 'Phân tích lại BPM từ file âm thanh' : 'Re-detect BPM from audio'}
                  className="px-2 py-1 text-[10px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 border border-neutral-700 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isDetectingBpm ? 'animate-spin text-rose-400' : ''}`} />
                  {isDetectingBpm ? (isVi ? 'Đang dò...' : 'Detecting...') : (isVi ? 'Dò lại BPM' : 'Auto Detect')}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={60}
              max={190}
              step={1}
              value={currentBpm}
              onChange={(e) => update({ bpm: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div className="flex justify-between text-[10px] text-neutral-500 px-0.5">
            <span>60 ({isVi ? 'Lofi Chậm' : 'Slow Lofi'})</span>
            <span>120 (House/Pop)</span>
            <span>128 (EDM)</span>
            <span>180 ({isVi ? 'DnB Nhanh' : 'DnB/Fast'})</span>
          </div>
        </div>
      </div>

      {/* 1. Visualizer Style Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {isVi ? 'Kiểu Sóng Âm (Visualizer Type)' : 'Visualizer Type'}
          </label>
          <span className="text-[11px] text-rose-400 font-medium">
            {VISUALIZER_TYPES.length} {isVi ? 'Kiểu Hiệu Ứng' : 'Styles'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {VISUALIZER_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = config.type === t.type;
            const badgeText = isVi ? t.badge : (t.badgeEn || t.badge);
            return (
              <button
                key={t.type}
                onClick={() => update({ type: t.type })}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/30'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {badgeText && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {badgeText}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-semibold leading-tight">
                    {isVi ? t.labelVi : t.label}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 line-clamp-1">
                  {isVi ? t.description : t.descriptionEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Palettes & Color Modes */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          {isVi ? 'Màu Sắc & Gradient (Color Styles)' : 'Color & Gradient Styles'}
        </label>

        {/* Color Mode Selector */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800">
          {(
            [
              { id: 'gradient2', nameVi: 'Gradient 2 Màu', nameEn: '2-Color Grad' },
              { id: 'gradient3', nameVi: 'Gradient 3 Màu', nameEn: '3-Color Grad' },
              { id: 'rainbow', nameVi: 'Cầu Vồng', nameEn: 'Rainbow' },
              { id: 'solid', nameVi: 'Đơn Sắc', nameEn: 'Solid' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => update({ colorMode: m.id as VisualizerColorMode })}
              className={`py-1.5 px-1 text-center rounded-lg text-xs font-medium transition-all cursor-pointer truncate ${
                config.colorMode === m.id
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isVi ? m.nameVi : m.nameEn}
            </button>
          ))}
        </div>

        {/* Quick Palettes Grid */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5">
            {isVi ? 'Bảng màu pha sẵn' : 'Color Palettes'}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PALETTES.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPalette(p)}
                title={p.name}
                className="h-7 rounded-lg border border-neutral-700/80 overflow-hidden flex cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex-1 h-full" style={{ backgroundColor: p.primary }} />
                <div className="flex-1 h-full" style={{ backgroundColor: p.secondary }} />
                <div className="flex-1 h-full" style={{ backgroundColor: p.tertiary }} />
              </button>
            ))}
          </div>
        </div>

        {/* Individual Color Pickers */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-neutral-400 block mb-1">
              {isVi ? 'Màu chính' : 'Primary'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[11px] font-mono text-neutral-300 truncate">
                {config.primaryColor}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-neutral-400 block mb-1">
              {isVi ? 'Màu thứ 2 / Đỉnh' : 'Secondary'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => update({ secondaryColor: e.target.value })}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[11px] font-mono text-neutral-300 truncate">
                {config.secondaryColor}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-neutral-400 block mb-1">
              {isVi ? 'Màu thứ 3' : 'Tertiary'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
              <input
                type="color"
                value={config.tertiaryColor}
                onChange={(e) => update({ tertiaryColor: e.target.value })}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[11px] font-mono text-neutral-300 truncate">
                {config.tertiaryColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sliders: Position, Scale, Amplitude, Glow, Bars */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          {isVi ? 'Tùy Chỉnh Kích Thước & Vị Trí' : 'Size & Position Adjustments'}
        </label>

        {/* Position X & Position Y Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
          {/* Position X Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-neutral-300 font-medium">
                {isVi ? 'Vị trí ngang (X)' : 'Horizontal (X)'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-400 font-mono font-bold text-[11px]">{config.positionX !== undefined ? config.positionX : 50}%</span>
                {(config.positionX !== undefined && config.positionX !== 50) && (
                  <button
                    type="button"
                    onClick={() => update({ positionX: 50 })}
                    className="text-[9px] text-neutral-400 hover:text-rose-300 px-1 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                    title={isVi ? 'Căn giữa 50%' : 'Center at 50%'}
                  >
                    {isVi ? 'Giữa' : 'Center'}
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.positionX !== undefined ? config.positionX : 50}
              onChange={(e) => update({ positionX: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Position Y Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-neutral-300 font-medium">
                {isVi ? 'Vị trí dọc (Y)' : 'Vertical (Y)'}
              </span>
              <span className="text-rose-400 font-mono font-bold text-[11px]">{config.positionY}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              value={config.positionY}
              onChange={(e) => update({ positionY: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Scale Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">{isVi ? 'Độ phóng to (Scale)' : 'Scale Factor'}</span>
            <span className="text-rose-400 font-mono">{config.scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={config.scale}
            onChange={(e) => update({ scale: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Amplitude / Sensitivity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">{isVi ? 'Độ nảy sóng âm (Amplitude)' : 'Bounce Amplitude'}</span>
            <span className="text-rose-400 font-mono">{config.amplitude.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.1}
            value={config.amplitude}
            onChange={(e) => update({ amplitude: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* 4. Glow & Multi-Pass Bloom Effects */}
        <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wide">
                {isVi ? 'Hiệu Ứng Phát Sáng & Bloom Neon' : 'Glow & Neon Bloom'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.bloomEffect !== false}
                onChange={(e) => update({ bloomEffect: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Quick Glow Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { nameVi: 'Tắt', nameEn: 'Off', glow: 0, bloom: 0, active: config.glowIntensity === 0 && config.bloomEffect === false },
              { nameVi: 'Nhẹ êm', nameEn: 'Subtle', glow: 12, bloom: 35, active: config.glowIntensity === 12 && config.bloomIntensity === 35 },
              { nameVi: 'Neon Sáng', nameEn: 'Bright', glow: 24, bloom: 70, active: config.glowIntensity === 24 && config.bloomIntensity === 70 },
              { nameVi: 'Cyberpunk', nameEn: 'Vivid', glow: 40, bloom: 100, active: config.glowIntensity === 40 && config.bloomIntensity === 100 },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => update({ glowIntensity: p.glow, bloomIntensity: p.bloom, bloomEffect: p.glow > 0 })}
                className={`py-1 px-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer truncate ${
                  p.active
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {isVi ? p.nameVi : p.nameEn}
              </button>
            ))}
          </div>

          {/* Glow Intensity Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ phát quang viền (Glow Blur)' : 'Glow Blur Radius'}</span>
              <span className="text-rose-400 font-mono">{config.glowIntensity}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={config.glowIntensity}
              onChange={(e) => update({ glowIntensity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Bloom Aura Intensity Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ bung tỏa ánh hào quang (Bloom Aura)' : 'Bloom Halo Aura'}</span>
              <span className="text-rose-400 font-mono">{config.bloomIntensity !== undefined ? config.bloomIntensity : 65}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.bloomIntensity !== undefined ? config.bloomIntensity : 65}
              onChange={(e) => update({ bloomIntensity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Line Thickness for Waveforms */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ dày nét vẽ sóng âm (Line Thickness)' : 'Line Thickness'}</span>
              <span className="text-rose-400 font-mono">{config.lineThickness || 3}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={config.lineThickness || 3}
              onChange={(e) => update({ lineThickness: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Chromatic Aberration RGB Glitch Effect */}
        <div className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 via-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center">
                <Split className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-neutral-200">Chromatic Aberration</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    RGB Glitch
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {isVi ? 'Tách lệch kênh màu Red / Cyan theo tần số âm thanh & nhịp kick' : 'RGB color split effect reacting dynamically to bass beats'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.chromaticAberration === true}
                onChange={(e) => update({ chromaticAberration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {config.chromaticAberration && (
            <div className="space-y-3 pt-1 border-t border-neutral-800/80">
              {/* Quick Intensity Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { nameVi: 'Nhẹ êm', nameEn: 'Subtle', val: 0.25 },
                  { nameVi: 'Cyberpunk', nameEn: 'Medium', val: 0.5 },
                  { nameVi: 'Glitch EDM', nameEn: 'Strong', val: 0.75 },
                  { nameVi: 'Cực mạnh', nameEn: 'Extreme', val: 1.0 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => update({ chromaticAberrationIntensity: p.val })}
                    className={`py-1 px-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer truncate ${
                      Math.abs((config.chromaticAberrationIntensity ?? 0.55) - p.val) < 0.08
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    {isVi ? p.nameVi : p.nameEn}
                  </button>
                ))}
              </div>

              {/* Intensity Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">
                    {isVi ? 'Độ mạnh lệch kênh màu (Shift Intensity)' : 'Color Split Shift Intensity'}
                  </span>
                  <span className="text-rose-400 font-mono">
                    {Math.round((config.chromaticAberrationIntensity ?? 0.55) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={config.chromaticAberrationIntensity ?? 0.55}
                  onChange={(e) => update({ chromaticAberrationIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/60">
                <span className="flex items-center gap-1 text-cyan-400 font-mono">◀ Cyan (+X)</span>
                <span className="text-neutral-500 text-[10px]">{isVi ? 'Tần số Bass & Treble' : 'Bass & Treble Frequencies'}</span>
                <span className="flex items-center gap-1 text-rose-400 font-mono">Red (-X) ▶</span>
              </div>
            </div>
          )}
        </div>

        {/* Bar Count & Width */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Số lượng cột' : 'Bar Count'}</span>
              <span className="text-rose-400 font-mono">{config.barCount}</span>
            </div>
            <input
              type="range"
              min={16}
              max={80}
              step={2}
              value={config.barCount}
              onChange={(e) => update({ barCount: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ rộng cột' : 'Bar Width'}</span>
              <span className="text-rose-400 font-mono">{config.barWidth}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={16}
              value={config.barWidth}
              onChange={(e) => update({ barWidth: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        {/* Bass Boost & Dynamic Beat Pulse */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.bassBoost}
              onChange={(e) => update({ bassBoost: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
            />
            <span className="text-xs font-semibold text-neutral-300">
              {isVi ? 'Tăng Lực Bass' : 'Bass Boost'}
            </span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.dynamicBeatPulse}
              onChange={(e) => update({ dynamicBeatPulse: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
            />
            <span className="text-xs font-semibold text-neutral-300">
              {isVi ? 'Chớp Sáng Theo Beat' : 'Dynamic Beat Flash'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
