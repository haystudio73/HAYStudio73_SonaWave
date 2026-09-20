import React, { useState } from 'react';
import { VisualizerConfig, VisualizerType, VisualizerColorMode, ThreeDVisualizerSettings } from '../types';
import { COLOR_PALETTES } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  BarChart2, 
  BarChart3,
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
  Split,
  FlipVertical,
  SlidersHorizontal,
  Box,
  Globe,
  Mountain,
  Droplets,
  CircleDot,
  RotateCw,
  Eye,
  EyeOff,
  Camera,
  Compass,
  Share2,
  Crosshair,
  Stars,
  Move,
  Rotate3d
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
  // --- 3D.js WebGL Audio Visualizers ---
  {
    type: '3d-cube-matrix',
    label: '3D Cube Matrix',
    labelVi: 'Ma Trận Khối 3D',
    icon: Box,
    description: 'Lưới khối lập phương 3D WebGL phản ứng âm thanh đa hướng',
    descriptionEn: 'Interactive 3D dynamic equalizer cube matrix powered by Three.js WebGL',
    badge: '3D.js',
    badgeEn: '3D.js',
  },
  {
    type: '3d-sphere-waveform',
    label: '3D Spike Sphere',
    labelVi: 'Quả Cầu Tần Số 3D',
    icon: Globe,
    description: 'Hình cầu 3D biến dạng gai nhọn phản ứng nhịp Bass và lõi năng lượng',
    descriptionEn: 'Pulsating 3D spike sphere with dynamic audio harmonic displacement',
    badge: '3D.js',
    badgeEn: '3D.js',
  },
  {
    type: '3d-wave-terrain',
    label: '3D Wave Terrain',
    labelVi: 'Địa Hình Cyberpunk 3D',
    icon: Mountain,
    description: 'Địa hình lưới sóng nhấp nhô lướt vô tận về phía mặt trời hoàng hôn',
    descriptionEn: 'Retro synthwave 3D undulating terrain grid flying into glowing sun',
    badge: '3D.js',
    badgeEn: '3D.js',
  },
  {
    type: '3d-solar-system',
    label: '3D Solar Galaxy',
    labelVi: 'Hệ Thiên Hà 3D',
    icon: Orbit,
    description: 'Hệ mặt trời thiên hà 3D rực rỡ với lõi Mặt Trời bùng nổ, các hành tinh quay quanh quỹ đạo và dải tiểu hành tinh',
    descriptionEn: 'Cosmic 3D solar galaxy with pulsating sun core, orbiting planets, and asteroid belts',
    badge: '3D.js Hot',
    badgeEn: '3D.js Hot',
  },
  {
    type: '3d-fluid-shape',
    label: '3D Transparent Fluid',
    labelVi: 'Chất Lỏng 3D Trong Suốt',
    icon: Droplets,
    description: 'Khối chất lỏng 3D trong suốt co giãn biến dạng nhấp nhô theo nhịp điệu âm nhạc, lõi phát sáng và gợn sóng thủy tinh',
    descriptionEn: 'Transparent 3D fluid morphing shape pulsing and undulating to the rhythm of the music with luminous inner core',
    badge: '3D Fluid',
    badgeEn: '3D Fluid',
  },
  {
    type: '3d-bezier-mesh',
    label: '3D Bezier Polygon Line',
    labelVi: 'Mạng Đa Giác Bezier 3D',
    icon: Share2,
    description: 'Mạng lưới các đường nối bezier và đa giác không gian 3D uốn lượn liên kết các hạt điểm phát sáng theo âm nhạc',
    descriptionEn: '3D interconnected Bezier curves and polygon line mesh network with pulsating vertex nodes and dynamic web links',
    badge: '3D Bezier',
    badgeEn: '3D Bezier',
  },
  {
    type: '3d-raycaster',
    label: '3D Ray Caster Field',
    labelVi: 'Trường Tia Phóng 3D',
    icon: Crosshair,
    description: 'Trường tia phóng 3D từ bề mặt mô hình với các đường tia và hạt điểm phát sáng ở đầu tia phản ứng nhịp điệu',
    descriptionEn: '3D normal vector ray casting field with dynamic length beams and glowing head dots projecting from geometry surface',
    badge: '3D Rays',
    badgeEn: '3D Rays',
  },
  {
    type: '3d-spiral-galaxy',
    label: '3D Cosmic Spiral Galaxy',
    labelVi: 'Dải Ngân Hà Xoắn Ốc 3D',
    icon: Stars,
    description: 'Dải ngân hà xoắn ốc 3D hàng ngàn vì sao khối tròn có tia sáng lightray & shadow, các nhánh xoắn ốc tinh vân chuyển động theo nhịp nhạc',
    descriptionEn: '3D cosmic spiral galaxy with thousands of circular glowing stars with celestial light rays & shadow depth, orbiting to the music beat',
    badge: '3D Galaxy',
    badgeEn: '3D Galaxy',
  },

  // --- Classic 2D Visualizers ---
  {
    type: 'spectrum-bars-simple',
    label: 'Simple Column Spectrum',
    labelVi: 'Spectrum Cột (Simple)',
    icon: BarChart3,
    description: 'Cột sóng âm phổ tần số đơn giản, thanh lịch, mượt mà và bo góc viền',
    descriptionEn: 'Clean, elegant minimalist audio spectrum vertical columns with rounded caps',
    badge: 'Mới',
    badgeEn: 'New',
  },
  {
    type: 'bars-peaks',
    label: 'Spectrum Peak Drops',
    labelVi: 'Spectrum Cột Hạt Rơi',
    icon: BarChart2,
    description: 'Thanh phổ âm kèm hạt đỉnh rơi vật lý siêu thực Winamp',
    descriptionEn: 'Audio spectrum bars with realistic gravity peak drops',
    badge: 'Hot',
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
  const [categoryFilter, setCategoryFilter] = useState<'all' | '3d' | '2d'>('all');

  const update = (partial: Partial<VisualizerConfig>) => {
    onChange({ ...config, ...partial });
  };

  const update3D = (partial: Partial<ThreeDVisualizerSettings>) => {
    onChange({
      ...config,
      threeDSettings: {
        ...(config.threeDSettings || {}),
        ...partial,
      },
    });
  };

  const three = config.threeDSettings || {};
  const is3DActive = config.type.startsWith('3d-');

  const count3D = VISUALIZER_TYPES.filter((t) => t.type.startsWith('3d-')).length;
  const count2D = VISUALIZER_TYPES.filter((t) => !t.type.startsWith('3d-')).length;

  const filteredTypes = VISUALIZER_TYPES.filter((t) => {
    if (categoryFilter === '3d') return t.type.startsWith('3d-');
    if (categoryFilter === '2d') return !t.type.startsWith('3d-');
    return true;
  });

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
      {/* 00. Visualizer Visibility (Toggle Hidden / Show) */}
      <div className={`p-4 rounded-2xl border shadow-lg transition-all ${
        config.visible !== false
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border-rose-500/30 shadow-rose-950/20'
          : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
              config.visible !== false
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                : 'bg-neutral-800 border border-neutral-700 text-neutral-500'
            }`}>
              {config.visible !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-100">
                  {isVi ? 'Hiển Thị Sóng Âm (Visualizer)' : 'Show Visualizer Waveform'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  config.visible !== false
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  {config.visible !== false ? (isVi ? 'Đang Hiển Thị' : 'Visible') : (isVi ? 'Đang Ẩn' : 'Hidden')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {config.visible !== false
                  ? (isVi ? 'Sóng âm hiển thị chuyển động theo tần số nhạc' : 'Waveform is rendered and reacting to audio frequencies')
                  : (isVi ? 'Đã tắt sóng âm - Nhạc, hình nền và các hiệu ứng khác vẫn phát bình thường' : 'Visualizer hidden - Music, background, and other effects play normally')}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.visible !== false}
              onChange={(e) => update({ visible: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
          </label>
        </div>
      </div>

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
            {filteredTypes.length}/{VISUALIZER_TYPES.length} {isVi ? 'Kiểu' : 'Styles'}
          </span>
        </div>

        {/* Visualizer Category Filter Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isVi ? 'Tất Cả' : 'All'} ({VISUALIZER_TYPES.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('3d')}
            className={`py-1.5 px-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              categoryFilter === '3d'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-indigo-400 hover:text-indigo-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D.js ({count3D})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('2d')}
            className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
              categoryFilter === '2d'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {isVi ? '2D Cổ Điển' : 'Classic 2D'} ({count2D})
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {filteredTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = config.type === t.type;
            const badgeText = isVi ? t.badge : (t.badgeEn || t.badge);
            const is3D = t.type.startsWith('3d-');
            return (
              <button
                key={t.type}
                onClick={() => update({ type: t.type })}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col gap-1 cursor-pointer ${
                  isSelected
                    ? is3D
                      ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-rose-500/15 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/30'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {badgeText && (
                  <span
                    className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      is3D
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? (is3D ? 'text-indigo-400' : 'text-rose-400') : 'text-neutral-400'}`} />
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

      {/* 3D.js Three.js Engine Dedicated Custom Settings Panel */}
      {is3DActive && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-neutral-900/90 to-purple-950/30 border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{isVi ? 'Tùy Chỉnh Chuyên Sâu 3D.js' : '3D.js Three.js Engine Settings'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                    WebGL Active
                  </span>
                </h4>
                <p className="text-[10px] text-neutral-400">
                  {isVi ? 'Góc nhìn camera, ánh sáng 3D và thông số riêng cho hiệu ứng đang chọn' : 'Adjust 3D camera viewport, lighting, and specialized model parameters'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                update3D({
                  cameraDistance: 38,
                  cameraAngleX: 18,
                  cameraAngleY: 0,
                  autoRotate: true,
                  autoRotateSpeed: 1.0,
                  wireframe: false,
                  lightIntensity: 1.5,
                  depthScale: 1.0,
                  moveX: 0,
                  moveY: 0,
                  moveZ: 0,
                  rotateX: 0,
                  rotateY: 0,
                  rotateZ: 0,
                })
              }
              title={isVi ? 'Đặt lại góc nhìn, tọa độ và camera chuẩn' : 'Reset camera, transforms & viewport to default'}
              className="text-[10px] px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 border border-neutral-700 transition cursor-pointer"
            >
              <RotateCw className="w-3 h-3 text-indigo-400" />
              <span>{isVi ? 'Reset Camera' : 'Reset'}</span>
            </button>
          </div>

          {/* Section A: Universal 3D Camera & Viewport Controls */}
          <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                {isVi ? 'Góc Nhìn & Camera Không Gian 3D' : '3D Camera & Spatial Viewport'}
              </span>
            </div>

            {/* Camera Distance (Zoom) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{isVi ? 'Khoảng cách Camera (Zoom)' : 'Camera Distance (Zoom)'}</span>
                <span className="text-indigo-400 font-mono">{three.cameraDistance ?? 38}</span>
              </div>
              <input
                type="range"
                min={15}
                max={75}
                step={1}
                value={three.cameraDistance ?? 38}
                onChange={(e) => update3D({ cameraDistance: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                <span>15 ({isVi ? 'Gần / Cận cảnh' : 'Close-up'})</span>
                <span>38 ({isVi ? 'Chuẩn' : 'Default'})</span>
                <span>75 ({isVi ? 'Xa / Toàn cảnh' : 'Wide'})</span>
              </div>
            </div>

            {/* Pitch (Angle X) and Yaw (Angle Y) in 2 columns */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Góc nghiêng (Pitch X)' : 'Tilt Pitch (X)'}</span>
                  <span className="text-indigo-400 font-mono">{three.cameraAngleX ?? 18}°</span>
                </div>
                <input
                  type="range"
                  min={-80}
                  max={80}
                  step={2}
                  value={three.cameraAngleX ?? 18}
                  onChange={(e) => update3D({ cameraAngleX: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Góc xoay (Yaw Y)' : 'Orbit Yaw (Y)'}</span>
                  <span className="text-indigo-400 font-mono">{three.cameraAngleY ?? 0}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={three.cameraAngleY ?? 0}
                  onChange={(e) => update3D({ cameraAngleY: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Auto-rotate */}
            <div className="pt-1 border-t border-neutral-800/80">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={three.autoRotate !== false}
                  onChange={(e) => update3D({ autoRotate: e.target.checked })}
                  className="rounded text-indigo-500 focus:ring-indigo-500 bg-neutral-800 border-neutral-700"
                />
                <span className="text-xs font-semibold text-neutral-300">
                  {isVi ? 'Tự Động Xoay 360°' : 'Auto Rotate 360°'}
                </span>
              </label>
            </div>

            {/* Speed & Light Intensity */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Tốc độ tự xoay' : 'Rotation Speed'}</span>
                  <span className="text-indigo-400 font-mono">{(three.autoRotateSpeed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={three.autoRotateSpeed ?? 1.0}
                  onChange={(e) => update3D({ autoRotateSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Độ sáng đèn 3D' : 'Light Intensity'}</span>
                  <span className="text-indigo-400 font-mono">{(three.lightIntensity ?? 1.5).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={three.lightIntensity ?? 1.5}
                  onChange={(e) => update3D({ lightIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Global Post-Processing Bloom Effect (Phát Sáng Hậu Kỳ Three.js) */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.bloomEnabled !== false}
                    onChange={(e) => update3D({ bloomEnabled: e.target.checked })}
                    className="rounded text-pink-500 focus:ring-pink-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-pink-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-pink-400" />
                    {isVi ? 'Hào Quang Phát Sáng Bloom (Global Bloom Post-Processing)' : 'Global Post-Processing Bloom'}
                  </span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Unreal Bloom
                </span>
              </div>

              {three.bloomEnabled !== false && (
                <div className="space-y-2.5 pl-2 pt-1 border-l-2 border-pink-500/40">
                  {/* Bloom Strength & Radius */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">{isVi ? 'Cường độ Bloom' : 'Bloom Strength'}</span>
                        <span className="text-pink-400 font-mono">{(three.bloomStrength ?? 1.6).toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={3.5}
                        step={0.1}
                        value={three.bloomStrength ?? 1.6}
                        onChange={(e) => update3D({ bloomStrength: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">{isVi ? 'Bán kính tỏa sáng' : 'Bloom Radius'}</span>
                        <span className="text-pink-400 font-mono">{(three.bloomRadius ?? 0.75).toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1.5}
                        step={0.05}
                        value={three.bloomRadius ?? 0.75}
                        onChange={(e) => update3D({ bloomRadius: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>

                  {/* Bloom Threshold */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Ngưỡng sáng phát quang (Threshold)' : 'Bloom Threshold'}</span>
                      <span className="text-pink-400 font-mono">{(three.bloomThreshold ?? 0.15).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={0.8}
                      step={0.05}
                      value={three.bloomThreshold ?? 0.15}
                      onChange={(e) => update3D({ bloomThreshold: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* Bass Boost Bloom Kick */}
                  <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={three.bloomBassBoost !== false}
                      onChange={(e) => update3D({ bloomBassBoost: e.target.checked })}
                      className="rounded text-pink-500 focus:ring-pink-500 bg-neutral-800 border-neutral-700"
                    />
                    <span className="text-xs font-semibold text-neutral-300">
                      {isVi ? 'Chói Lóa Cực Mạnh Theo Tiếng Bass & Beat Kicks (Bass Glow Surge)' : 'Intense Glow Surge on High-Energy Bass Moments'}
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Universal Flowing Light (Ánh Sáng Chạy) */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.flowingLight !== false}
                    onChange={(e) => update3D({ flowingLight: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isVi ? 'Hiệu Ứng Ánh Sáng Chạy (Flowing Light)' : 'Flowing Light Waves'}
                  </span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isVi ? 'Tính năng mới' : 'New Feature'}
                </span>
              </div>

              {three.flowingLight !== false && (
                <div className="space-y-2.5 pl-2 pt-1 border-l-2 border-amber-500/40">
                  {/* Mode selector */}
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      {isVi ? 'Kiểu luồng sáng chạy:' : 'Light Flow Mode:'}
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'neon-wave', labelVi: 'Neon Wave', labelEn: 'Neon Wave' },
                        { id: 'rainbow-stream', labelVi: 'Cầu Vồng', labelEn: 'Rainbow' },
                        { id: 'laser-pulse', labelVi: 'Xung Laser', labelEn: 'Laser' },
                        { id: 'audio-reactive', labelVi: 'Theo Nhạc', labelEn: 'Reactive' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => update3D({ flowingLightMode: m.id as any })}
                          className={`py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                            (three.flowingLightMode || 'neon-wave') === m.id
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {isVi ? m.labelVi : m.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed & Intensity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">{isVi ? 'Tốc độ sóng sáng' : 'Flow Speed'}</span>
                        <span className="text-amber-400 font-mono">{(three.flowingLightSpeed ?? 1.5).toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={4.0}
                        step={0.1}
                        value={three.flowingLightSpeed ?? 1.5}
                        onChange={(e) => update3D({ flowingLightSpeed: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">{isVi ? 'Độ sáng luồng' : 'Glow Intensity'}</span>
                        <span className="text-amber-400 font-mono">{(three.flowingLightIntensity ?? 1.6).toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.4}
                        max={3.5}
                        step={0.1}
                        value={three.flowingLightIntensity ?? 1.6}
                        onChange={(e) => update3D({ flowingLightIntensity: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Universal 3D Spatial Position (Move X, Y, Z) & Rotation (Rotate X, Y, Z) */}
          <div className="space-y-3.5 bg-neutral-900/60 p-3.5 rounded-xl border border-indigo-500/25 shadow-inner">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Move className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                    {isVi ? 'Tọa Độ & Góc Xoay 3D' : '3D Spatial Position & Rotation'}
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Move X,Y,Z • Rotate X,Y,Z
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => update3D({ moveX: 0, moveY: 0, moveZ: 0 })}
                  title={isVi ? 'Đặt lại vị trí về tâm (0, 0, 0)' : 'Reset position to (0, 0, 0)'}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
                >
                  {isVi ? 'Reset Vị Trí' : 'Reset Pos'}
                </button>
                <button
                  type="button"
                  onClick={() => update3D({ rotateX: 0, rotateY: 0, rotateZ: 0 })}
                  title={isVi ? 'Đặt lại góc xoay về 0°' : 'Reset rotations to 0°'}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
                >
                  {isVi ? 'Reset Xoay' : 'Reset Rot'}
                </button>
              </div>
            </div>

            {/* 1. DỊCH CHUYỂN TỌA ĐỘ: MOVE X, MOVE Y, MOVE Z */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-300 font-semibold">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Move className="w-3 h-3 text-indigo-400" />
                  {isVi ? 'Dịch Chuyển Tọa Độ (Move X, Y, Z)' : 'Spatial Position (Move X, Y, Z)'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  X: {three.moveX ?? 0} | Y: {three.moveY ?? 0} | Z: {three.moveZ ?? 0}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Move X */}
                <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Trục ngang (Move X)' : 'Move X (Left/Right)'}</span>
                    <span className="text-indigo-400 font-mono font-bold text-[11px]">{three.moveX ?? 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    step={1}
                    value={three.moveX ?? 0}
                    onChange={(e) => update3D({ moveX: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                    <span>-40 ({isVi ? 'Trái' : 'Left'})</span>
                    <button type="button" onClick={() => update3D({ moveX: 0 })} className="hover:text-indigo-300 font-mono">0</button>
                    <span>+40 ({isVi ? 'Phải' : 'Right'})</span>
                  </div>
                </div>

                {/* Move Y */}
                <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Trục dọc (Move Y)' : 'Move Y (Up/Down)'}</span>
                    <span className="text-indigo-400 font-mono font-bold text-[11px]">{three.moveY ?? 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    step={1}
                    value={three.moveY ?? 0}
                    onChange={(e) => update3D({ moveY: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                    <span>-40 ({isVi ? 'Dưới' : 'Down'})</span>
                    <button type="button" onClick={() => update3D({ moveY: 0 })} className="hover:text-indigo-300 font-mono">0</button>
                    <span>+40 ({isVi ? 'Trên' : 'Up'})</span>
                  </div>
                </div>

                {/* Move Z */}
                <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Trục sâu (Move Z)' : 'Move Z (Depth)'}</span>
                    <span className="text-indigo-400 font-mono font-bold text-[11px]">{three.moveZ ?? 0}</span>
                  </div>
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    step={1}
                    value={three.moveZ ?? 0}
                    onChange={(e) => update3D({ moveZ: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                    <span>-40 ({isVi ? 'Xa' : 'Far'})</span>
                    <button type="button" onClick={() => update3D({ moveZ: 0 })} className="hover:text-indigo-300 font-mono">0</button>
                    <span>+40 ({isVi ? 'Gần' : 'Near'})</span>
                  </div>
                </div>
              </div>

              {/* Quick Position Presets */}
              <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] text-neutral-500 shrink-0">{isVi ? 'Vị trí nhanh:' : 'Quick pos:'}</span>
                {[
                  { labelVi: 'Chính Giữa', labelEn: 'Center', x: 0, y: 0, z: 0 },
                  { labelVi: 'Dưới Thấp', labelEn: 'Lower', x: 0, y: -10, z: 0 },
                  { labelVi: 'Trên Cao', labelEn: 'Upper', x: 0, y: 10, z: 0 },
                  { labelVi: 'Lệch Trái', labelEn: 'Left', x: -12, y: 0, z: 0 },
                  { labelVi: 'Lệch Phải', labelEn: 'Right', x: 12, y: 0, z: 0 },
                ].map((pos, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => update3D({ moveX: pos.x, moveY: pos.y, moveZ: pos.z })}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-medium border transition cursor-pointer shrink-0 ${
                      (three.moveX ?? 0) === pos.x && (three.moveY ?? 0) === pos.y && (three.moveZ ?? 0) === pos.z
                        ? 'bg-indigo-500/25 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 border-neutral-700/60'
                    }`}
                  >
                    {isVi ? pos.labelVi : pos.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. XOAY THEO 3 TRỤC: ROTATE BY X, ROTATE BY Y, ROTATE BY Z */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
              <div className="flex items-center justify-between text-[11px] text-neutral-300 font-semibold">
                <span className="flex items-center gap-1 text-purple-300">
                  <Rotate3d className="w-3 h-3 text-purple-400" />
                  {isVi ? 'Xoay Trục Không Gian (Rotate by X, Y, Z)' : 'Rotation Angles (Rotate by X, Y, Z)'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  X: {three.rotateX ?? 0}° | Y: {three.rotateY ?? 0}° | Z: {three.rotateZ ?? 0}°
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Rotate by X */}
                <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Xoay trục X (Pitch)' : 'Rotate by X'}</span>
                    <span className="text-purple-400 font-mono font-bold text-[11px]">{three.rotateX ?? 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={5}
                    value={three.rotateX ?? 0}
                    onChange={(e) => update3D({ rotateX: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                    <span>-180°</span>
                    <button type="button" onClick={() => update3D({ rotateX: 0 })} className="hover:text-purple-300 font-mono">0°</button>
                    <span>+180°</span>
                  </div>
                </div>

                {/* Rotate by Y */}
                <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Xoay trục Y (Yaw)' : 'Rotate by Y'}</span>
                    <span className="text-purple-400 font-mono font-bold text-[11px]">{three.rotateY ?? 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={5}
                    value={three.rotateY ?? 0}
                    onChange={(e) => update3D({ rotateY: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                    <span>-180°</span>
                    <button type="button" onClick={() => update3D({ rotateY: 0 })} className="hover:text-purple-300 font-mono">0°</button>
                    <span>+180°</span>
                  </div>
                </div>

                {/* Rotate by Z */}
                <div className="bg-neutral-950/50 p-2 rounded-lg border border-neutral-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Xoay trục Z (Roll)' : 'Rotate by Z'}</span>
                    <span className="text-purple-400 font-mono font-bold text-[11px]">{three.rotateZ ?? 0}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={5}
                    value={three.rotateZ ?? 0}
                    onChange={(e) => update3D({ rotateZ: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                    <span>-180°</span>
                    <button type="button" onClick={() => update3D({ rotateZ: 0 })} className="hover:text-purple-300 font-mono">0°</button>
                    <span>+180°</span>
                  </div>
                </div>
              </div>

              {/* Quick Rotation Presets */}
              <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] text-neutral-500 shrink-0">{isVi ? 'Góc xoay mẫu:' : 'Presets:'}</span>
                {[
                  { labelVi: 'Mặc Định (0°)', labelEn: 'Default (0°)', rx: 0, ry: 0, rz: 0 },
                  { labelVi: 'Isometric (30°, 45°)', labelEn: 'Isometric', rx: 30, ry: 45, rz: 0 },
                  { labelVi: 'Nhìn Thẳng (Top-down)', labelEn: 'Top-down', rx: 90, ry: 0, rz: 0 },
                  { labelVi: 'Nghiêng Lượn (Roll)', labelEn: 'Tilted Roll', rx: 15, ry: -25, rz: 35 },
                ].map((rot, rIdx) => (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => update3D({ rotateX: rot.rx, rotateY: rot.ry, rotateZ: rot.rz })}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-medium border transition cursor-pointer shrink-0 ${
                      (three.rotateX ?? 0) === rot.rx && (three.rotateY ?? 0) === rot.ry && (three.rotateZ ?? 0) === rot.rz
                        ? 'bg-purple-500/25 border-purple-500 text-purple-300 font-semibold'
                        : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 border-neutral-700/60'
                    }`}
                  >
                    {isVi ? rot.labelVi : rot.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section C: Custom Per-Type 3D Settings */}
          {config.type === '3d-cube-matrix' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                {isVi ? 'Cài Đặt Riêng: Ma Trận Khối 3D (Cube Matrix)' : 'Settings: 3D Cube Matrix'}
              </span>

              {/* Grid Size Buttons */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  {isVi ? 'Kích thước lưới khối:' : 'Grid Dimensions:'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[6, 8, 10, 12].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => update3D({ cubeGridSize: g })}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        (three.cubeGridSize ?? 8) === g
                          ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {g}x{g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing & Height Scale */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Khoảng cách khe' : 'Cube Spacing'}</span>
                    <span className="text-amber-400 font-mono">{(three.cubeSpacing ?? 0.35).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.8}
                    step={0.05}
                    value={three.cubeSpacing ?? 0.35}
                    onChange={(e) => update3D({ cubeSpacing: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ cao cột sóng' : 'Height Amplitude'}</span>
                    <span className="text-amber-400 font-mono">{(three.cubeHeightScale ?? 1.6).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={three.cubeHeightScale ?? 1.6}
                    onChange={(e) => update3D({ cubeHeightScale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Shading Style */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  {isVi ? 'Kiểu phản quang khối (Shading):' : 'Cube Shading Style:'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['metallic', 'glow-edges', 'wireframe', 'phong'] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      onClick={() => update3D({ cubeShading: sh })}
                      className={`py-1 px-1 rounded-lg text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                        (three.cubeShading ?? 'metallic') === sh
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {sh.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {config.type === '3d-sphere-waveform' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                {isVi ? 'Cài Đặt Riêng: Quả Cầu Tần Số 3D (Faceted Audio Sphere)' : 'Settings: 3D Faceted Audio Sphere'}
              </span>

              {/* Radius & Spike intensity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Bán kính quả cầu' : 'Sphere Radius'}</span>
                    <span className="text-rose-400 font-mono">{three.sphereRadius ?? 13}</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={24}
                    step={1}
                    value={three.sphereRadius ?? 13}
                    onChange={(e) => update3D({ sphereRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ nhô gai tần số' : 'Audio Spike'}</span>
                    <span className="text-rose-400 font-mono">{(three.sphereSpikeIntensity ?? 1.4).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={3.0}
                    step={0.1}
                    value={three.sphereSpikeIntensity ?? 1.4}
                    onChange={(e) => update3D({ sphereSpikeIntensity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              {/* Polygon Transparency / Opacity (Độ trong suốt của các đa giác) */}
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-rose-200 font-medium">
                    {isVi ? 'Độ trong suốt đa giác (Transparency)' : 'Polygon Facet Transparency'}
                  </span>
                  <span className="text-rose-400 font-mono font-bold">
                    {Math.round((three.sphereOpacity ?? 0.85) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.05}
                  value={three.sphereOpacity ?? 0.85}
                  onChange={(e) => update3D({ sphereOpacity: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>{isVi ? 'Nhìn xuyên thấu (Trong suốt)' : 'See-Through (Transparent)'}</span>
                  <span>{isVi ? 'Màu đục (Solid)' : 'Solid'}</span>
                </div>
              </div>

              {/* Polygon Material Finish (Chất liệu đa giác) */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  {isVi ? 'Chất liệu đa giác (Material):' : 'Polygon Facet Material:'}
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { id: 'crystal-glass', vi: 'Pha Lê', en: 'Crystal' },
                    { id: 'neon-glow', vi: 'Neon', en: 'Neon' },
                    { id: 'metallic-poly', vi: 'Kim Loại', en: 'Metal' },
                    { id: 'matte-clay', vi: 'Nhám', en: 'Matte' },
                    { id: 'hologram', vi: 'Hologram', en: 'Holo' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => update3D({ sphereMaterial: m.id as any })}
                      className={`py-1 px-0.5 rounded-lg text-[10px] font-semibold text-center transition-all cursor-pointer ${
                        (three.sphereMaterial ?? 'crystal-glass') === m.id
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {isVi ? m.vi : m.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Polygon Color Mode (Phối màu đa giác) */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  {isVi ? 'Phối màu đa giác bao quanh:' : 'Facet Color Mode:'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'gradient-duo', vi: 'Chuyển sắc 2 màu', en: 'Dual Gradient' },
                    { id: 'primary-single', vi: 'Màu chính', en: 'Single Color' },
                    { id: 'audio-reactive', vi: 'Đổi màu theo Beat', en: 'Audio Beat Tint' },
                    { id: 'rainbow-flow', vi: 'Cầu vồng', en: 'Rainbow' },
                  ].map((cm) => (
                    <button
                      key={cm.id}
                      type="button"
                      onClick={() => update3D({ sphereColorMode: cm.id as any })}
                      className={`py-1 px-1 rounded-lg text-[9px] font-semibold text-center transition-all cursor-pointer ${
                        (three.sphereColorMode ?? 'gradient-duo') === cm.id
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {isVi ? cm.vi : cm.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metalness & Roughness fine-tuning */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ phản xạ kim loại' : 'Metalness'}</span>
                    <span className="text-rose-400 font-mono">{Math.round((three.sphereMetalness ?? 0.45) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={three.sphereMetalness ?? 0.45}
                    onChange={(e) => update3D({ sphereMetalness: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ nhám mờ mặt khối' : 'Roughness'}</span>
                    <span className="text-rose-400 font-mono">{Math.round((three.sphereRoughness ?? 0.25) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={three.sphereRoughness ?? 0.25}
                    onChange={(e) => update3D({ sphereRoughness: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              {/* Sphere Style & Mesh Detail */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">
                    {isVi ? 'Kiểu dáng vỏ cầu:' : 'Sphere Outer Shell:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {(['solid-facets', 'wireframe', 'particles', 'dual-shell'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => update3D({ sphereStyle: st })}
                        className={`py-1 px-1 rounded-lg text-[9px] font-semibold capitalize transition-all cursor-pointer ${
                          (three.sphereStyle ?? 'solid-facets') === st
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                        }`}
                      >
                        {st.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Mật độ đa giác (Detail)' : 'Facet Density'}</span>
                    <span className="text-rose-400 font-mono">
                      {(three.sphereDetail ?? 2) === 1 ? 'Thấp (20)' : (three.sphereDetail ?? 2) === 2 ? 'Chuẩn (80)' : (three.sphereDetail ?? 2) === 3 ? 'Dày (320)' : 'Siêu mịn'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={three.sphereDetail ?? 2}
                    onChange={(e) => update3D({ sphereDetail: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {isVi ? 'Càng cao mặt đa giác càng nhiều' : 'Higher = more geometric facets'}
                  </div>
                </div>
              </div>

              {/* Wireframe Facet Edges Toggle */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={three.sphereWireframeEdges !== false}
                  onChange={(e) => update3D({ sphereWireframeEdges: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
                />
                <span className="text-xs font-semibold text-neutral-300">
                  {isVi ? 'Viền cạnh đa giác sắc nét (Sharp Polygon Edges)' : 'Sharp Polygon Outline Edges'}
                </span>
              </label>
            </div>
          )}

          {config.type === '3d-wave-terrain' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-fuchsia-300 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-fuchsia-400" />
                {isVi ? 'Cài Đặt Riêng: Địa Hình Cyberpunk 3D (Wave Terrain)' : 'Settings: 3D Wave Terrain'}
              </span>

              {/* Terrain Render Mode (2 Dạng: Dạng Lưới Wireframe & Khối Đặc Solid Fill) */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  {isVi ? 'Dạng hiển thị địa hình:' : 'Terrain Render Mode:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'wireframe', vi: 'Dạng Lưới', en: 'Wireframe' },
                    { id: 'solid', vi: 'Khối Đặc (Solid)', en: 'Solid Fill' },
                    { id: 'solid-wireframe', vi: 'Khối + Lưới', en: 'Solid & Grid' },
                  ].map((rm) => (
                    <button
                      key={rm.id}
                      type="button"
                      onClick={() => update3D({ terrainRenderMode: rm.id as any })}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold text-center transition-all cursor-pointer ${
                        (three.terrainRenderMode ?? 'wireframe') === rm.id
                          ? 'bg-fuchsia-500/25 text-fuchsia-300 border border-fuchsia-500/50 shadow-sm'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {isVi ? rm.vi : rm.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment / Background Reflection Settings (Dành cho Dạng Khối Đặc Solid Fill) */}
              {(three.terrainRenderMode === 'solid' || three.terrainRenderMode === 'solid-wireframe') && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-fuchsia-950/20 border border-fuchsia-800/40">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={three.terrainEnvReflection !== false}
                      onChange={(e) => update3D({ terrainEnvReflection: e.target.checked })}
                      className="rounded text-fuchsia-500 focus:ring-fuchsia-500 bg-neutral-800 border-neutral-700"
                    />
                    <span className="text-xs font-semibold text-fuchsia-200">
                      {isVi ? 'Phản chiếu môi trường & ảnh background' : 'Reflect Background / Environment'}
                    </span>
                  </label>

                  {three.terrainEnvReflection !== false && (
                    <div className="space-y-2 pt-1">
                      {/* Reflection Intensity */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">{isVi ? 'Cường độ phản chiếu' : 'Reflection Intensity'}</span>
                          <span className="text-fuchsia-400 font-mono">
                            {Math.round((three.terrainReflectionIntensity ?? 0.85) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.0}
                          max={1.0}
                          step={0.05}
                          value={three.terrainReflectionIntensity ?? 0.85}
                          onChange={(e) => update3D({ terrainReflectionIntensity: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>

                      {/* Roughness & Metalness */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">{isVi ? 'Độ nhám mờ' : 'Roughness'}</span>
                            <span className="text-fuchsia-400 font-mono">
                              {Math.round((three.terrainRoughness ?? 0.18) * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={three.terrainRoughness ?? 0.18}
                            onChange={(e) => update3D({ terrainRoughness: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                          />
                          <span className="text-[9px] text-neutral-400">
                            {isVi ? '0% = Gương bóng soi hình' : '0% = Mirror gloss'}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">{isVi ? 'Độ kim loại' : 'Metalness'}</span>
                            <span className="text-fuchsia-400 font-mono">
                              {Math.round((three.terrainMetalness ?? 0.75) * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={three.terrainMetalness ?? 0.75}
                            onChange={(e) => update3D({ terrainMetalness: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                          />
                          <span className="text-[9px] text-neutral-400">
                            {isVi ? 'Phản xạ bóng kim loại' : 'Metallic shine'}
                          </span>
                        </div>
                      </div>

                      {/* Opacity of Solid Terrain */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">{isVi ? 'Độ trong suốt địa hình đặc' : 'Terrain Opacity'}</span>
                          <span className="text-fuchsia-400 font-mono">
                            {Math.round((three.terrainOpacity ?? 0.95) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.2}
                          max={1.0}
                          step={0.05}
                          value={three.terrainOpacity ?? 0.95}
                          onChange={(e) => update3D({ terrainOpacity: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Speed & Height Scale */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Tốc độ lướt tới' : 'Flight Speed'}</span>
                    <span className="text-fuchsia-400 font-mono">{(three.terrainSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={three.terrainSpeed ?? 1.0}
                    onChange={(e) => update3D({ terrainSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ cao đỉnh sóng' : 'Peak Height'}</span>
                    <span className="text-fuchsia-400 font-mono">{(three.terrainHeightScale ?? 1.4).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={three.terrainHeightScale ?? 1.4}
                    onChange={(e) => update3D({ terrainHeightScale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>
              </div>

              {/* Grid Resolution */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Mật độ lưới địa hình' : 'Grid Resolution'}</span>
                  <span className="text-fuchsia-400 font-mono">{three.terrainResolution ?? 36}x{three.terrainResolution ?? 36}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={56}
                  step={4}
                  value={three.terrainResolution ?? 36}
                  onChange={(e) => update3D({ terrainResolution: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
            </div>
          )}

          {config.type === '3d-solar-system' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5 text-amber-400" />
                {isVi ? 'Cài Đặt Riêng: Hệ Thiên Hà 3D (Solar Galaxy)' : 'Settings: 3D Solar Galaxy'}
              </span>

              {/* Sun size & Orbit Speed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Kích thước Mặt Trời' : 'Sun Size'}</span>
                    <span className="text-amber-400 font-mono">{(three.solarSunSize ?? 5.5).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={3.0}
                    max={9.0}
                    step={0.5}
                    value={three.solarSunSize ?? 5.5}
                    onChange={(e) => update3D({ solarSunSize: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Tốc độ quay quỹ đạo' : 'Orbit Speed'}</span>
                    <span className="text-amber-400 font-mono">{(three.solarOrbitSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={three.solarOrbitSpeed ?? 1.0}
                    onChange={(e) => update3D({ solarOrbitSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Sun Pulse & Planet count */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Mặt trời đập theo Bass' : 'Sun Bass Pulse'}</span>
                    <span className="text-amber-400 font-mono">{(three.solarSunPulse ?? 1.5).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.0}
                    step={0.1}
                    value={three.solarSunPulse ?? 1.5}
                    onChange={(e) => update3D({ solarSunPulse: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1.5">
                    {isVi ? 'Số lượng hành tinh:' : 'Planets Count:'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[4, 6, 8].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => update3D({ solarPlanetCount: cnt })}
                        className={`py-1 rounded-md text-xs font-mono font-bold cursor-pointer transition-colors ${
                          (three.solarPlanetCount ?? 6) === cnt
                            ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Planet Size Scale */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Kích thước các hành tinh' : 'Planets Size Scale'}</span>
                  <span className="text-amber-400 font-mono">{(three.solarPlanetSizeScale ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={three.solarPlanetSizeScale ?? 1.0}
                  onChange={(e) => update3D({ solarPlanetSizeScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Feature Toggles */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.solarShowOrbits !== false}
                    onChange={(e) => update3D({ solarShowOrbits: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Hiển Thị Đường Quỹ Đạo Phát Sáng' : 'Luminous Orbital Trajectory Rings'}
                  </span>
                </label>

                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.solarAsteroidBelt !== false}
                    onChange={(e) => update3D({ solarAsteroidBelt: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Vành Đai Tiểu Hành Tinh Hạt Sao' : 'Stardust Asteroid Belt'}
                  </span>
                </label>

                {three.solarAsteroidBelt !== false && (
                  <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-2.5 ml-2">
                    {/* Shape Selector */}
                    <div>
                      <span className="block text-[11px] text-neutral-400 mb-1 font-medium">
                        {isVi ? 'Hình dáng vì sao vành đai:' : 'Star Particle Shape:'}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => update3D({ solarStarShape: 'circle' })}
                          className={`py-1 px-2 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                            (three.solarStarShape || 'circle') === 'circle'
                              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-neutral-800 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-current inline-block"></span>
                          {isVi ? 'Khối Tròn' : 'Round Spheres'}
                        </button>
                        <button
                          type="button"
                          onClick={() => update3D({ solarStarShape: 'celestial-ray' })}
                          className={`py-1 px-2 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                            three.solarStarShape === 'celestial-ray'
                              ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                              : 'bg-neutral-800 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <span className="font-mono text-xs">✦</span>
                          {isVi ? 'Có Tia Sáng' : 'With Rays'}
                        </button>
                      </div>
                    </div>

                    {/* Star Size & Count */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">{isVi ? 'Cỡ vì sao tròn' : 'Star Size'}</span>
                          <span className="text-amber-400 font-mono">{(three.solarAsteroidSize ?? 1.8).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min={0.6}
                          max={4.0}
                          step={0.2}
                          value={three.solarAsteroidSize ?? 1.8}
                          onChange={(e) => update3D({ solarAsteroidSize: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">{isVi ? 'Số lượng sao' : 'Star Count'}</span>
                          <span className="text-amber-400 font-mono">{three.solarAsteroidCount ?? 550}</span>
                        </div>
                        <input
                          type="range"
                          min={200}
                          max={1200}
                          step={50}
                          value={three.solarAsteroidCount ?? 550}
                          onChange={(e) => update3D({ solarAsteroidCount: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.solarSaturnRings !== false}
                    onChange={(e) => update3D({ solarSaturnRings: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Vành Đai Sao Thổ 3D' : 'Saturn 3D Planetary Ring'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {config.type === '3d-fluid-shape' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                {isVi ? 'Cài Đặt Riêng: Khối Chất Lỏng 3D Trong Suốt (Fluid Shape)' : 'Settings: 3D Transparent Fluid Shape'}
              </span>

              {/* Fluid Style Presets */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">
                  {isVi ? 'Hiệu ứng chất liệu:' : 'Fluid Material Style:'}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'translucent-glass', nameVi: 'Thủy Tinh', nameEn: 'Glass' },
                    { id: 'iridescent', nameVi: 'Ngũ Sắc', nameEn: 'Iridescent' },
                    { id: 'liquid-chrome', nameVi: 'Kim Loại Lỏng', nameEn: 'Chrome' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => update3D({ fluidStyle: st.id as any })}
                      className={`py-1 rounded-md text-xs font-medium cursor-pointer ${
                        (three.fluidStyle || 'translucent-glass') === st.id
                          ? 'bg-cyan-500 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {isVi ? st.nameVi : st.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Turbulence & Speed Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ co giãn / nhấp nhô' : 'Turbulence Wave'}</span>
                    <span className="text-cyan-400 font-mono">{(three.fluidTurbulence ?? 1.5).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.0}
                    step={0.1}
                    value={three.fluidTurbulence ?? 1.5}
                    onChange={(e) => update3D({ fluidTurbulence: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Tốc độ dòng chảy' : 'Flow Speed'}</span>
                    <span className="text-cyan-400 font-mono">{(three.fluidSpeed ?? 1.2).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.0}
                    step={0.1}
                    value={three.fluidSpeed ?? 1.2}
                    onChange={(e) => update3D({ fluidSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Opacity & Glass Transmission */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ trong suốt' : 'Opacity'}</span>
                    <span className="text-cyan-400 font-mono">{Math.round((three.fluidOpacity ?? 0.72) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={three.fluidOpacity ?? 0.72}
                    onChange={(e) => update3D({ fluidOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Khúc xạ thủy tinh' : 'Glass Refract'}</span>
                    <span className="text-cyan-400 font-mono">{Math.round((three.fluidTransmission ?? 0.65) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={three.fluidTransmission ?? 0.65}
                    onChange={(e) => update3D({ fluidTransmission: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Reflection Intensity Slider */}
              {three.fluidEnvReflection !== false && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ phản chiếu bề mặt' : 'Reflection Intensity'}</span>
                    <span className="text-cyan-400 font-mono">{(three.fluidReflectionIntensity ?? 0.85).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={three.fluidReflectionIntensity ?? 0.85}
                    onChange={(e) => update3D({ fluidReflectionIntensity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              )}

              {/* Feature Toggles */}
              <div className="space-y-1.5 pt-1">
                {/* Wireframe toggle */}
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.fluidWireframe || false}
                    onChange={(e) => update3D({ fluidWireframe: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Khung Dây (Wireframe)' : 'Wireframe Mode'}
                  </span>
                </label>

                {/* Reflection toggle */}
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.fluidEnvReflection !== false}
                    onChange={(e) => update3D({ fluidEnvReflection: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Phản Chiếu Môi Trường (Reflection)' : 'Environment Reflection'}
                  </span>
                </label>

                {/* Floating Droplets */}
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.fluidDroplets !== false}
                    onChange={(e) => update3D({ fluidDroplets: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Giọt Nước & Bọt Khí Li Ti Xung Quanh' : 'Floating Fluid Droplets & Micro Bubbles'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 3D Bezier Polygon Line Network Settings */}
          {config.type === '3d-bezier-mesh' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-violet-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-violet-400" />
                {isVi ? 'Cài Đặt Riêng: Mạng Đa Giác Bezier 3D (Bezier Polygon Line)' : 'Settings: 3D Bezier Polygon Line Mesh'}
              </span>

              {/* Node Count & Max Distance Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Số hạt điểm (Nodes)' : 'Node Count'}</span>
                    <span className="text-violet-400 font-mono">{three.bezierNodeCount ?? 150}</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={260}
                    step={10}
                    value={three.bezierNodeCount ?? 150}
                    onChange={(e) => update3D({ bezierNodeCount: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Khoảng cách nối dây' : 'Max Connect Dist'}</span>
                    <span className="text-violet-400 font-mono">{three.bezierMaxDistance ?? 10}</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={1}
                    value={three.bezierMaxDistance ?? 10}
                    onChange={(e) => update3D({ bezierMaxDistance: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </div>

              {/* Audio Displacement & Speed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ nhạy sóng nhạc' : 'Audio Displace'}</span>
                    <span className="text-violet-400 font-mono">{(three.bezierAudioDisplace ?? 1.4).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.0}
                    step={0.1}
                    value={three.bezierAudioDisplace ?? 1.4}
                    onChange={(e) => update3D({ bezierAudioDisplace: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Tốc độ trôi dạt' : 'Drift Speed'}</span>
                    <span className="text-violet-400 font-mono">{(three.bezierSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    value={three.bezierSpeed ?? 1.0}
                    onChange={(e) => update3D({ bezierSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </div>

              {/* Point Size & Toggles */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Kích thước hạt đỉnh' : 'Point Size'}</span>
                    <span className="text-violet-400 font-mono">{(three.bezierPointSize ?? 2.5).toFixed(1)}px</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={6.0}
                    step={0.5}
                    value={three.bezierPointSize ?? 2.5}
                    onChange={(e) => update3D({ bezierPointSize: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.bezierShowPoints !== false}
                    onChange={(e) => update3D({ bezierShowPoints: e.target.checked })}
                    className="rounded text-violet-500 focus:ring-violet-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Hiển thị các hạt đỉnh phát sáng (Glowing Vertex Nodes)' : 'Show Glowing Vertex Nodes'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 3D Ray Caster Field Settings */}
          {config.type === '3d-raycaster' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                {isVi ? 'Cài Đặt Riêng: Trường Tia Phóng 3D (3D Ray Caster Field)' : 'Settings: 3D Ray Caster Field'}
              </span>

              {/* Head Dot Shape Selector: Vuông, tròn, sao 5 cánh */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                  {isVi ? 'Hạt điểm đầu tia (Hình dạng):' : 'Ray Head Dot Shape:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'square', nameVi: 'Vuông', nameEn: 'Square', icon: '■' },
                    { id: 'circle', nameVi: 'Tròn', nameEn: 'Circle', icon: '●' },
                    { id: 'star', nameVi: 'Sao 5 cánh', nameEn: '5-Point Star', icon: '★' },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => update3D({ rayDotShape: sh.id as 'square' | 'circle' | 'star' })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        (three.rayDotShape || 'circle') === sh.id
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700/80 border border-neutral-700/50'
                      }`}
                    >
                      <span className="text-sm leading-none">{sh.icon}</span>
                      <span>{isVi ? sh.nameVi : sh.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ray Count & Length */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Số tia phóng (Rays)' : 'Ray Count'}</span>
                    <span className="text-amber-400 font-mono">{three.rayCount ?? 160}</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={320}
                    step={10}
                    value={three.rayCount ?? 160}
                    onChange={(e) => update3D({ rayCount: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Chiều dài tia' : 'Ray Length'}</span>
                    <span className="text-amber-400 font-mono">{three.rayLength ?? 16}</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={32}
                    step={1}
                    value={three.rayLength ?? 16}
                    onChange={(e) => update3D({ rayLength: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Head Dot Size & Audio Pulse */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Hạt điểm đầu tia' : 'Head Dot Size'}</span>
                    <span className="text-amber-400 font-mono">{(three.rayHeadDotSize ?? 3.0).toFixed(1)}px</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={7.0}
                    step={0.5}
                    value={three.rayHeadDotSize ?? 3.0}
                    onChange={(e) => update3D({ rayHeadDotSize: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ nhún theo nhịp nhạc' : 'Audio Pulse'}</span>
                    <span className="text-amber-400 font-mono">{(three.rayAudioPulse ?? 1.5).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.0}
                    step={0.1}
                    value={three.rayAudioPulse ?? 1.5}
                    onChange={(e) => update3D({ rayAudioPulse: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/50 border border-neutral-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={three.rayShowCore !== false}
                    onChange={(e) => update3D({ rayShowCore: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-300">
                    {isVi ? 'Hiển thị bề mặt vật thể phát tia (Show Inner Core Mesh)' : 'Show Inner Core Mesh'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 3D Cosmic Spiral Galaxy Settings */}
          {config.type === '3d-spiral-galaxy' && (
            <div className="space-y-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
              <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                <Stars className="w-3.5 h-3.5 text-amber-300" />
                {isVi ? 'Cài Đặt Riêng: Dải Ngân Hà Xoắn Ốc 3D (3D Cosmic Spiral Galaxy)' : 'Settings: 3D Cosmic Spiral Galaxy'}
              </span>

              {/* Star Count & Arms */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Số lượng vì sao' : 'Star Count'}</span>
                    <span className="text-amber-300 font-mono">{three.galaxyStarCount ?? three.galaxyParticleCount ?? 8500}</span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={20000}
                    step={500}
                    value={three.galaxyStarCount ?? three.galaxyParticleCount ?? 8500}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      update3D({ galaxyStarCount: val, galaxyParticleCount: val });
                    }}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Số nhánh xoắn' : 'Spiral Arms'}</span>
                    <span className="text-amber-300 font-mono">{three.galaxyArms ?? 4}</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={three.galaxyArms ?? 4}
                    onChange={(e) => update3D({ galaxyArms: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              {/* Galaxy Radius & Spin Tightness */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Bán kính thiên hà' : 'Galaxy Radius'}</span>
                    <span className="text-amber-300 font-mono">{three.galaxyRadius ?? 26}</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={40}
                    step={2}
                    value={three.galaxyRadius ?? 26}
                    onChange={(e) => update3D({ galaxyRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ xoắn ốc (Spin)' : 'Spiral Spin'}</span>
                    <span className="text-amber-300 font-mono">{(three.galaxySpin ?? 1.25).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={2.5}
                    step={0.05}
                    value={three.galaxySpin ?? 1.25}
                    onChange={(e) => update3D({ galaxySpin: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              {/* Swirl Speed & Audio Displace */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Tốc độ quay thiên hà' : 'Swirl Speed'}</span>
                    <span className="text-amber-300 font-mono">{(three.galaxySwirlSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    value={three.galaxySwirlSpeed ?? 1.0}
                    onChange={(e) => update3D({ galaxySwirlSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ nhún sóng nhạc' : 'Audio Displace'}</span>
                    <span className="text-amber-300 font-mono">{(three.galaxyAudioDisplace ?? 1.4).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={3.0}
                    step={0.1}
                    value={three.galaxyAudioDisplace ?? 1.4}
                    onChange={(e) => update3D({ galaxyAudioDisplace: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>

              {/* Point Size (Cỡ hạt vì sao khối tròn có lightray & shadow) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Cỡ hạt vì sao (Khối tròn có Lightray)' : 'Star Size (Circular Volumetric)'}</span>
                  <span className="text-amber-300 font-mono">{(three.galaxyPointSize ?? three.galaxyParticleSize ?? 2.4).toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={6.5}
                  step={0.2}
                  value={three.galaxyPointSize ?? three.galaxyParticleSize ?? 2.4}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    update3D({ galaxyPointSize: val, galaxyParticleSize: val });
                  }}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* ========================================================================= */}
      {/* 3. CÀI ĐẶT HIỆU ỨNG VISUALIZER CHUNG (Always shown for both 2D & 3D)     */}
      {/* ========================================================================= */}
      <div className="space-y-3.5 pt-3 border-t border-neutral-800/80">
        <div className="flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <span>{isVi ? 'Cài Đặt Hiệu Ứng Visualizer Chung' : 'Common Visualizer Effects'}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono">
                {is3DActive ? (isVi ? '2D & 3D Chung' : '2D & 3D Common') : (isVi ? 'Chung' : 'Common')}
              </span>
            </h4>
          </div>
        </div>

        {/* Scale & Amplitude */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
          {/* Scale Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ phóng to (Scale)' : 'Scale Factor'}</span>
              <span className="text-rose-400 font-mono font-bold text-[11px]">{config.scale.toFixed(2)}x</span>
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
              <span className="text-rose-400 font-mono font-bold text-[11px]">{config.amplitude.toFixed(1)}x</span>
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
        </div>

        {/* Bass Boost & Dynamic Beat Pulse */}
        <div className="grid grid-cols-2 gap-2">
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

        {/* Glow & Multi-Pass Bloom Effects */}
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
      </div>

      {/* ========================================================================= */}
      {/* 4. TÙY CHỈNH RIÊNG VISUALIZER 2D (Chỉ hiển thị khi 2D active, ẩn khi 3D)   */}
      {/* ========================================================================= */}
      {!is3DActive && (
        <div className="space-y-3.5 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center justify-between pb-0.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <span>{isVi ? 'Tùy Chỉnh Riêng Visualizer 2D' : '2D-Specific Visualizer Settings'}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  2D Only
                </span>
              </h4>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {isVi ? 'Vị Trí & Nét Vẽ Trên Màn Hình 2D' : '2D Position & Stroke Thickness'}
            </label>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {isVi
                ? 'Tùy chỉnh vị trí chỉ tác động lên các mẫu sóng 2D (Không ảnh hưởng đến không gian 3D)'
                : 'Position settings only apply to 2D waveforms (Does not affect 3D spatial visualizers)'}
            </p>
          </div>

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
                  {isVi ? 'Vị trí dọc Y' : 'Vertical Position (Y)'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-mono font-bold text-[11px]">{config.positionY}%</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => update({ positionY: 0 })}
                      className={`text-[9px] px-1 py-0.5 rounded transition-colors ${
                        config.positionY === 0
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                          : 'text-neutral-400 hover:text-rose-300 bg-neutral-800 hover:bg-neutral-700'
                      }`}
                      title={isVi ? 'Đỉnh (0%)' : 'Top (0%)'}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ positionY: 50 })}
                      className={`text-[9px] px-1 py-0.5 rounded transition-colors ${
                        config.positionY === 50
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                          : 'text-neutral-400 hover:text-rose-300 bg-neutral-800 hover:bg-neutral-700'
                      }`}
                      title={isVi ? 'Giữa (50%)' : 'Center (50%)'}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ positionY: 72 })}
                      className={`text-[9px] px-1 py-0.5 rounded transition-colors ${
                        config.positionY === 72
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                          : 'text-neutral-400 hover:text-rose-300 bg-neutral-800 hover:bg-neutral-700'
                      }`}
                      title={isVi ? 'Chuẩn (72%)' : 'Standard (72%)'}
                    >
                      72%
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ positionY: 100 })}
                      className={`text-[9px] px-1 py-0.5 rounded transition-colors ${
                        config.positionY === 100
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                          : 'text-neutral-400 hover:text-rose-300 bg-neutral-800 hover:bg-neutral-700'
                      }`}
                      title={isVi ? 'Đáy (100%)' : 'Bottom (100%)'}
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={config.positionY}
                onChange={(e) => update({ positionY: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                <span>0% ({isVi ? 'Đỉnh khung' : 'Top'})</span>
                <span>50% ({isVi ? 'Chính giữa' : 'Center'})</span>
                <span>100% ({isVi ? 'Đáy khung' : 'Bottom'})</span>
              </div>
            </div>
          </div>

          {/* Line Thickness for Waveforms (2D) */}
          <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{isVi ? 'Độ dày nét vẽ sóng âm 2D (Line Thickness)' : '2D Waveform Line Thickness'}</span>
              <span className="text-rose-400 font-mono font-bold text-[11px]">{config.lineThickness || 3}px</span>
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

          {/* Bar Count, Bar Gap & Bar Width Configuration */}
          <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                {isVi ? 'Cấu hình cột sóng âm (Bars & Spacing)' : 'Bar & Spacing Configuration'}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {config.barCount} bars • {config.barWidth}px • {config.barGap ?? 3}px gap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Số lượng cột (Bar Count) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-neutral-300">{isVi ? 'Số lượng cột' : 'Bar Count'}</span>
                  <span className="text-rose-400 font-mono font-bold text-[11px]">{config.barCount}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={128}
                  step={2}
                  value={config.barCount}
                  onChange={(e) => update({ barCount: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                  <span>8</span>
                  <span>48</span>
                  <span>128</span>
                </div>
              </div>

              {/* 2. Khoảng cách giữa cột (Bar Gap) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-neutral-300">{isVi ? 'Khoảng cách giữa cột' : 'Bar Gap'}</span>
                  <span className="text-rose-400 font-mono font-bold text-[11px]">
                    {config.barGap !== undefined ? config.barGap : 3}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  value={config.barGap !== undefined ? config.barGap : 3}
                  onChange={(e) => update({ barGap: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                  <span>0px ({isVi ? 'Khít' : 'None'})</span>
                  <span>3px</span>
                  <span>24px</span>
                </div>
              </div>

              {/* 3. Độ rộng cột (Bar Width) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-neutral-300">{isVi ? 'Độ rộng cột' : 'Bar Width'}</span>
                  <span className="text-rose-400 font-mono font-bold text-[11px]">{config.barWidth}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={28}
                  step={1}
                  value={config.barWidth}
                  onChange={(e) => update({ barWidth: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                  <span>1px ({isVi ? 'Mảnh' : 'Slim'})</span>
                  <span>6px</span>
                  <span>28px ({isVi ? 'Dày' : 'Thick'})</span>
                </div>
              </div>
            </div>

            {/* Quick presets for bar styling */}
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] text-neutral-400">
                {isVi ? 'Kiểu mẫu nhanh:' : 'Quick Presets:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { labelVi: 'Dày đặc (Nhỏ)', labelEn: 'Dense (Fine)', count: 96, width: 3, gap: 2, round: 1 },
                  { labelVi: 'Cân đối (Chuẩn)', labelEn: 'Balanced (Std)', count: 48, width: 6, gap: 3, round: 4 },
                  { labelVi: 'Cột lớn (Chunky)', labelEn: 'Chunky Bars', count: 24, width: 14, gap: 5, round: 6 },
                  { labelVi: 'Khít liền kề', labelEn: 'Seamless (No Gap)', count: 64, width: 8, gap: 0, round: 0 },
                ].map((bp, bidx) => (
                  <button
                    key={bidx}
                    type="button"
                    onClick={() => update({ barCount: bp.count, barWidth: bp.width, barGap: bp.gap, barRoundness: bp.round })}
                    className="px-2 py-0.5 text-[10px] font-medium bg-neutral-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-neutral-300 border border-neutral-700/60 rounded-md transition-colors cursor-pointer"
                  >
                    {isVi ? bp.labelVi : bp.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NEW: Vertical Reflection of Visualizer */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                  <FlipVertical className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                      {isVi ? 'Bóng Phản Chiếu Dọc (Vertical Reflection)' : 'Vertical Reflection'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {isVi ? 'Mới' : 'New'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isVi 
                      ? 'Hiệu ứng bóng lật ngược theo phương dọc như phản chiếu trên mặt nước hoặc sàn kính'
                      : 'Flipped vertical reflection effect on glass floor or water surface'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.verticalReflection === true}
                  onChange={(e) => update({ verticalReflection: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {config.verticalReflection && (
              <div className="space-y-3 pt-1 border-t border-neutral-800/80">
                {/* Quick Reflection Presets */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { nameVi: 'Mờ nhẹ', nameEn: 'Subtle', op: 0.2, pos: config.positionY },
                    { nameVi: 'Mặt nước', nameEn: 'Water', op: 0.35, pos: config.positionY },
                    { nameVi: 'Sàn gương', nameEn: 'Mirror', op: 0.55, pos: config.positionY },
                    { nameVi: 'Rực rỡ', nameEn: 'Vivid', op: 0.8, pos: config.positionY },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => update({ reflectionOpacity: p.op, reflectionPositionY: p.pos })}
                      className={`py-1 px-1 rounded-lg text-[10px] font-medium border transition-all cursor-pointer truncate ${
                        Math.abs((config.reflectionOpacity ?? 0.35) - p.op) < 0.08
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      {isVi ? p.nameVi : p.nameEn}
                    </button>
                  ))}
                </div>

                {/* Reflection Opacity Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">
                      {isVi ? 'Độ mờ phản chiếu (Reflection Opacity)' : 'Reflection Opacity'}
                    </span>
                    <span className="text-sky-400 font-mono">
                      {Math.round((config.reflectionOpacity ?? 0.35) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    value={config.reflectionOpacity ?? 0.35}
                    onChange={(e) => update({ reflectionOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Reflection Vertical Position Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">
                      {isVi ? 'Vị trí trục phản chiếu dọc (Reflection Vertical Position)' : 'Reflection Vertical Position'}
                    </span>
                    <span className="text-sky-400 font-mono">
                      {config.reflectionPositionY !== undefined ? config.reflectionPositionY : config.positionY}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={config.reflectionPositionY !== undefined ? config.reflectionPositionY : config.positionY}
                    onChange={(e) => update({ reflectionPositionY: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                {/* Gradient Fade Toggle */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-400">
                    {isVi ? 'Làm mờ dần theo chiều sâu (Gradient Fade)' : 'Depth Gradient Fade Out'}
                  </span>
                  <button
                    type="button"
                    onClick={() => update({ reflectionFade: config.reflectionFade === false ? true : false })}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      config.reflectionFade !== false
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {config.reflectionFade !== false ? (isVi ? 'Bật (Fade)' : 'Enabled') : (isVi ? 'Tắt (Sắc nét)' : 'Disabled')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
