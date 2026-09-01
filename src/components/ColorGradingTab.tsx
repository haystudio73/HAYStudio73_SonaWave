import React, { useState } from 'react';
import { ColorGradingConfig, ColorGradingLUT } from '../types';
import { LUT_PRESET_ITEMS, DEFAULT_COLOR_GRADING } from '../utils/presets';
import {
  Palette,
  SlidersHorizontal,
  Sun,
  Contrast,
  Droplet,
  Thermometer,
  Sparkles,
  RotateCcw,
  Film,
  Eye,
  Check,
  Zap,
} from 'lucide-react';

interface ColorGradingTabProps {
  colorGrading: ColorGradingConfig;
  onChange: (cfg: ColorGradingConfig) => void;
}

export const ColorGradingTab: React.FC<ColorGradingTabProps> = ({
  colorGrading = DEFAULT_COLOR_GRADING,
  onChange,
}) => {
  const [lutCategory, setLutCategory] = useState<'all' | 'cinema' | 'vintage' | 'creative' | 'moody' | 'clean'>('all');

  const update = (partial: Partial<ColorGradingConfig>) => {
    onChange({ ...colorGrading, ...partial });
  };

  const handleApplyLUT = (lutId: ColorGradingLUT) => {
    const item = LUT_PRESET_ITEMS.find((p) => p.id === lutId);
    if (!item) return;

    // Apply LUT preset parameters while maintaining enabled state & custom intensity
    onChange({
      ...colorGrading,
      enabled: true,
      lut: lutId,
      ...item.config,
    });
  };

  const handleResetAll = () => {
    onChange({
      ...DEFAULT_COLOR_GRADING,
      enabled: colorGrading.enabled,
    });
  };

  const filteredLUTs = lutCategory === 'all'
    ? LUT_PRESET_ITEMS
    : LUT_PRESET_ITEMS.filter((item) => item.category === lutCategory || item.id === 'none');

  return (
    <div className="space-y-5 text-sm pb-10">
      {/* Master Enable & Reset Header */}
      <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/60 rounded-2xl border border-neutral-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Palette className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-100 text-sm sm:text-base">
                  Chỉnh Màu Toàn Cục (Color Grading)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  LUT & Filters
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Áp dụng bảng màu điện ảnh LUT, điều chỉnh phơi sáng, tương phản & hạt phim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              title="Đặt lại tất cả thông số về mặc định"
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt Lại</span>
            </button>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={colorGrading.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {colorGrading.enabled && (
        <>
          {/* SECTION 1: 3D Cinematic LUTs Presets */}
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-neutral-200 text-xs">
                  Bảng Màu Điện Ảnh (3D Cinematic LUTs)
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'cinema', label: 'Điện ảnh' },
                  { id: 'vintage', label: 'Cổ điển' },
                  { id: 'creative', label: 'Sáng tạo' },
                  { id: 'moody', label: 'Trầm tối' },
                  { id: 'clean', label: 'Tối giản' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLutCategory(tab.id as any)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      lutCategory === tab.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200 bg-neutral-950/40 border border-neutral-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LUT Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredLUTs.map((item) => {
                const isSelected = colorGrading.lut === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyLUT(item.id)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    {/* Top Color Preview Ribbon */}
                    <div
                      className={`w-full h-8 rounded-lg bg-gradient-to-r ${item.previewGradient} border border-white/10 shadow-inner flex items-center justify-between px-2 mb-2 group-hover:scale-[1.02] transition-transform`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {item.badgeText}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-neutral-200 truncate">
                        {item.nameVi}
                      </div>
                      <div className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">
                        {item.descVi}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* LUT Intensity Slider (when a LUT is selected) */}
            {colorGrading.lut !== 'none' && (
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Cường độ bộ lọc (LUT Strength)
                  </span>
                  <span className="text-amber-400 font-mono font-semibold">
                    {Math.round((colorGrading.lutIntensity ?? 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={colorGrading.lutIntensity ?? 1.0}
                  onChange={(e) => update({ lutIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: Primary Tone & Exposure Controls */}
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-neutral-200 text-xs">
                  Ánh Sáng & Tương Phản (Primary Tones)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Exposure */}
              <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Phơi sáng (Exposure)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 font-mono text-[11px]">
                      {colorGrading.exposure > 0 ? `+${colorGrading.exposure}` : colorGrading.exposure}%
                    </span>
                    {colorGrading.exposure !== 0 && (
                      <button
                        type="button"
                        onClick={() => update({ exposure: 0 })}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={colorGrading.exposure}
                  onChange={(e) => update({ exposure: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-purple-400" />
                    Độ tương phản (Contrast)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 font-mono text-[11px]">
                      {colorGrading.contrast > 0 ? `+${colorGrading.contrast}` : colorGrading.contrast}%
                    </span>
                    {colorGrading.contrast !== 0 && (
                      <button
                        type="button"
                        onClick={() => update({ contrast: 0 })}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  step={1}
                  value={colorGrading.contrast}
                  onChange={(e) => update({ contrast: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-yellow-400" />
                    Độ sáng (Brightness)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 font-mono text-[11px]">
                      {colorGrading.brightness > 0 ? `+${colorGrading.brightness}` : colorGrading.brightness}%
                    </span>
                    {colorGrading.brightness !== 0 && (
                      <button
                        type="button"
                        onClick={() => update({ brightness: 0 })}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={colorGrading.brightness}
                  onChange={(e) => update({ brightness: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-400" />
                    Độ bão hòa (Saturation)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 font-mono text-[11px]">
                      {colorGrading.saturation > 0 ? `+${colorGrading.saturation}` : colorGrading.saturation}%
                    </span>
                    {colorGrading.saturation !== 0 && (
                      <button
                        type="button"
                        onClick={() => update({ saturation: 0 })}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={colorGrading.saturation}
                  onChange={(e) => update({ saturation: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: White Balance, Temperature & Tint */}
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-neutral-200 text-xs">
                  Cân Bằng Trắng & Nhiệt Độ Màu (White Balance)
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Temperature (Cool ↔ Warm) */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 flex items-center gap-1">
                    ❄️ Lạnh (Cool Cyan)
                  </span>
                  <span className="text-neutral-200 font-mono text-[11px] font-semibold">
                    Nhiệt độ: {colorGrading.temperature > 0 ? `+${colorGrading.temperature}` : colorGrading.temperature}
                  </span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    Ấm (Warm Gold) ☀️
                  </span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={colorGrading.temperature}
                  onChange={(e) => update({ temperature: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-sky-600 via-neutral-700 to-amber-500"
                />
              </div>

              {/* Tint (Green ↔ Magenta) */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 flex items-center gap-1">
                    🌿 Xanh Lục (Green)
                  </span>
                  <span className="text-neutral-200 font-mono text-[11px] font-semibold">
                    Sắc thái (Tint): {colorGrading.tint > 0 ? `+${colorGrading.tint}` : colorGrading.tint}
                  </span>
                  <span className="text-neutral-400 flex items-center gap-1">
                    Hồng (Magenta) 🌸
                  </span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={colorGrading.tint}
                  onChange={(e) => update({ tint: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-emerald-600 via-neutral-700 to-fuchsia-600"
                />
              </div>

              {/* Hue Rotation */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Xoay dải màu quang phổ (Hue Rotation)</span>
                  <span className="text-cyan-400 font-mono text-[11px]">
                    {colorGrading.hueRotate}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={colorGrading.hueRotate}
                  onChange={(e) => update({ hueRotate: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Split Toning & Film Curve */}
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-neutral-200 text-xs">
                  Tách Sắc & Phim Hoài Niệm (Split Toning & Film Curve)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shadows Lift (Milky Blacks) */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Đen mờ khói (Milky Shadows)</span>
                  <span className="text-neutral-200 font-mono text-[11px]">
                    {colorGrading.shadowsLift}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={colorGrading.shadowsLift}
                  onChange={(e) => update({ shadowsLift: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Sepia */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Màu Nâu Cổ Điển (Sepia)</span>
                  <span className="text-amber-300 font-mono text-[11px]">
                    {colorGrading.sepia}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={colorGrading.sepia}
                  onChange={(e) => update({ sepia: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Split Toning Colors */}
            <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-neutral-800/60 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-medium">Tách màu Vùng Sáng & Vùng Tối (Split Toning)</span>
                <span className="text-purple-400 font-mono text-[11px]">
                  {colorGrading.splitToneIntensity}%
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={colorGrading.splitToneIntensity}
                onChange={(e) => update({ splitToneIntensity: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />

              {colorGrading.splitToneIntensity > 0 && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800/80">
                  <div>
                    <label className="text-[11px] text-amber-300 block mb-1.5">Màu Vùng Sáng (Highlights Tint)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorGrading.highlightsTint || '#ffedd5'}
                        onChange={(e) => update({ highlightsTint: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {colorGrading.highlightsTint || '#ffedd5'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-cyan-300 block mb-1.5">Màu Vùng Tối (Shadows Tint)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorGrading.shadowsTint || '#083344'}
                        onChange={(e) => update({ shadowsTint: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {colorGrading.shadowsTint || '#083344'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Optics, Vignette, Grain & Glow */}
          <div className="p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-neutral-200 text-xs">
                  Hiệu Ứng Quang Học & Hạt Phim (Optics & Texture)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vignette */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Bo tối viền (Vignette)</span>
                  <span className="text-neutral-200 font-mono text-[11px]">
                    {colorGrading.vignette}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={2}
                  value={colorGrading.vignette}
                  onChange={(e) => update({ vignette: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-300"
                />
              </div>

              {/* Film Grain */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Hạt phim (Film Grain)</span>
                  <span className="text-neutral-200 font-mono text-[11px]">
                    {colorGrading.filmGrain}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={colorGrading.filmGrain}
                  onChange={(e) => update({ filmGrain: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Bloom Diffusion Glow */}
              <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Khuếch tán sáng (Bloom Glow)</span>
                  <span className="text-neutral-200 font-mono text-[11px]">
                    {colorGrading.bloomGlow}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={colorGrading.bloomGlow}
                  onChange={(e) => update({ bloomGlow: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
