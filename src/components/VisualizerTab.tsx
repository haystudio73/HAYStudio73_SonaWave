import React from 'react';
import { VisualizerConfig, VisualizerType, VisualizerColorMode } from '../types';
import { COLOR_PALETTES } from '../utils/presets';
import { 
  BarChart2, 
  Disc, 
  Activity, 
  Sparkles, 
  Sliders, 
  Flame, 
  Radio, 
  Cpu, 
  Layers,
  Zap,
  Waves,
  RefreshCw,
  Gauge
} from 'lucide-react';

interface VisualizerTabProps {
  config: VisualizerConfig;
  onChange: (config: VisualizerConfig) => void;
  detectedBpm?: number;
  isDetectingBpm?: boolean;
  onReDetectBpm?: () => void;
}

interface TypeOption {
  type: VisualizerType;
  label: string;
  labelVi: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const VISUALIZER_TYPES: TypeOption[] = [
  {
    type: 'bars-peaks',
    label: 'Spectrum Peak Drops',
    labelVi: 'Spectrum Cột Hạt Rơi',
    icon: BarChart2,
    description: 'Thanh phổ âm kèm hạt đỉnh rơi vật lý siêu thực Winamp',
    badge: 'Mới & Hot',
  },
  {
    type: 'bars-mirrored-peaks',
    label: 'Mirrored Peaks',
    labelVi: 'Sóng Đối Xứng Hạt Đỉnh',
    icon: BarChart2,
    description: 'Cột đối xứng 2 đầu kèm hạt rơi phía trên và dưới',
    badge: 'Mới',
  },
  {
    type: 'spectrum-line',
    label: 'Smooth Area Curve',
    labelVi: 'Dải Phổ Gradient Mịn',
    icon: Waves,
    description: 'Đường cong sóng phủ màu gradient và điểm sáng lấp lánh',
    badge: 'Mới',
  },
  {
    type: 'radial-bars-peaks',
    label: 'Radial Peak Orbit',
    labelVi: 'Vòng Tròn Hạt Bay Tỏa',
    icon: Disc,
    description: 'Tia xoay tròn 360° với hạt đỉnh bắn ra theo nhịp bass',
    badge: 'Mới',
  },
  {
    type: 'bars-mirrored',
    label: 'Mirrored Bars',
    labelVi: 'Sóng Cột Đối Xứng',
    icon: BarChart2,
    description: 'Thanh equalizer đối xứng trên dưới bắt mắt',
  },
  {
    type: 'bars',
    label: 'Classic Bars',
    labelVi: 'Cột Cổ Điển (EQ)',
    icon: BarChart2,
    description: 'Equalizer truyền thống hướng lên trên',
  },
  {
    type: 'circular-spikes',
    label: 'Radial Spikes',
    labelVi: 'Tia Tròn Tỏa Sáng',
    icon: Disc,
    description: 'Tia sóng xoay quanh tâm đĩa phát sáng',
  },
  {
    type: 'circular-ring',
    label: 'Neon Ring',
    labelVi: 'Vòng Tròn Sóng Mịn',
    icon: Disc,
    description: 'Vòng tròn neon uốn lượn liên tục',
  },
  {
    type: 'smooth-wave',
    label: 'Liquid Wave',
    labelVi: 'Sóng Nước Mềm Mại',
    icon: Activity,
    description: 'Sóng chất lỏng chuyển động mượt mà',
  },
  {
    type: 'galaxy-orbit',
    label: 'Galaxy Swirl',
    labelVi: 'Dải Ngân Hà Swirl',
    icon: Sparkles,
    description: 'Đám mây hạt tinh tú xoay 3D theo giai điệu',
  },
  {
    type: 'cyber-matrix',
    label: 'Cyber Matrix',
    labelVi: 'Ma Trận LED Cyber',
    icon: Cpu,
    description: 'Khối LED số nhảy theo từng dải tần số',
  },
  {
    type: 'flame-spectrum',
    label: 'Plasma Fire',
    labelVi: 'Ngọn Lửa Plasma',
    icon: Flame,
    description: 'Ngọn lửa âm nhạc rực cháy theo nhịp kick',
  },
  {
    type: 'double-ribbon',
    label: 'Dual Ribbon',
    labelVi: 'Dải Ruy Băng Đôi',
    icon: Radio,
    description: 'Hai sợi dây sóng đan xen mềm mại',
  },
  {
    type: 'minimal-pulse',
    label: 'Minimal Dots',
    labelVi: 'Chấm Tối Giản',
    icon: Layers,
    description: 'Đường ngang tinh gọn phong cách audiophile',
  },
  {
    type: 'blob-morph',
    label: 'Liquid Morph',
    labelVi: 'Khối Biến Hình Blob',
    icon: Zap,
    description: 'Khối hữu cơ co giãn linh hoạt theo âm trầm',
  },
];

export const VisualizerTab: React.FC<VisualizerTabProps> = ({
  config,
  onChange,
  detectedBpm = 120,
  isDetectingBpm = false,
  onReDetectBpm,
}) => {
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
                <span className="text-xs font-bold text-neutral-100">Đồng Bộ Nhịp BPM (Tempo Sync)</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  {currentBpm} BPM
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Tự động bắt nhịp BPM bài hát để visualizer nảy xung nhịp chuẩn xác</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBpmSyncOn}
              onChange={(e) => update({ syncBpmPulse: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* BPM Adjuster & Auto Re-detect */}
        <div className="space-y-2 pt-1 border-t border-rose-500/15">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Tốc độ nhịp đập (Pulse Rate)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-rose-400">{currentBpm} BPM</span>
              {onReDetectBpm && (
                <button
                  onClick={onReDetectBpm}
                  disabled={isDetectingBpm}
                  title="Phân tích lại BPM từ file âm thanh"
                  className="px-2 py-1 text-[10px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 border border-neutral-700 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isDetectingBpm ? 'animate-spin text-rose-400' : ''}`} />
                  {isDetectingBpm ? 'Đang dò...' : 'Dò lại BPM'}
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
            <span>60 (Lofi Chậm)</span>
            <span>120 (House/Pop)</span>
            <span>128 (EDM)</span>
            <span>180 (DnB/Fast)</span>
          </div>
        </div>
      </div>

      {/* 1. Visualizer Style Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Kiểu Sóng Âm (Visualizer Type)
          </label>
          <span className="text-[11px] text-rose-400 font-medium">
            {VISUALIZER_TYPES.length} Kiểu Hiệu Ứng
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {VISUALIZER_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = config.type === t.type;
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
                {t.badge && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {t.badge}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-semibold leading-tight">{t.labelVi}</span>
                </div>
                <span className="text-[10px] text-neutral-500 line-clamp-1">
                  {t.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Palettes & Color Modes */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Màu Sắc & Gradient (Color Styles)
        </label>

        {/* Color Mode Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900/80 rounded-xl border border-neutral-800">
          {(
            [
              { id: 'gradient2', name: 'Gradient 2 Màu' },
              { id: 'gradient3', name: 'Gradient 3 Màu' },
              { id: 'rainbow', name: 'Cầu Vồng' },
              { id: 'solid', name: 'Đơn Sắc' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => update({ colorMode: m.id as VisualizerColorMode })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                config.colorMode === m.id
                  ? 'bg-rose-600 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Quick Palettes Grid */}
        <div>
          <span className="text-[11px] text-neutral-400 block mb-1.5">Bảng màu pha sẵn</span>
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
            <span className="text-[10px] text-neutral-400 block mb-1">Màu chính</span>
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
            <span className="text-[10px] text-neutral-400 block mb-1">Màu thứ 2 / Đỉnh</span>
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
            <span className="text-[10px] text-neutral-400 block mb-1">Màu thứ 3</span>
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
          Tùy Chỉnh Kích Thước & Vị Trí
        </label>

        {/* Position Y Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Vị trí dọc (Position Y)</span>
            <span className="text-rose-400 font-mono">{config.positionY}%</span>
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

        {/* Scale Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Độ phóng to (Scale)</span>
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
            <span className="text-neutral-400">Độ nảy sóng âm (Amplitude)</span>
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

        {/* Glow Intensity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">Độ phát sáng Neon (Glow)</span>
            <span className="text-rose-400 font-mono">{config.glowIntensity}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={35}
            value={config.glowIntensity}
            onChange={(e) => update({ glowIntensity: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Bar Count & Width */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Số lượng cột</span>
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
              <span className="text-neutral-400">Độ rộng cột</span>
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
            <span className="text-xs font-semibold text-neutral-300">Tăng Lực Bass</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.dynamicBeatPulse}
              onChange={(e) => update({ dynamicBeatPulse: e.target.checked })}
              className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
            />
            <span className="text-xs font-semibold text-neutral-300">Chớp Sáng Theo Beat</span>
          </label>
        </div>
      </div>
    </div>
  );
};
