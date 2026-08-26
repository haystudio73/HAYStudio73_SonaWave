import React, { useRef } from 'react';
import { TrackMetadata, CardStyle } from '../types';
import { AVAILABLE_FONTS } from '../utils/presets';
import { 
  Disc, 
  Upload, 
  Music, 
  User, 
  CreditCard, 
  EyeOff, 
  Sparkles,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  Palette,
  Eye,
  Sliders
} from 'lucide-react';

interface TrackTabProps {
  track: TrackMetadata;
  onChange: (track: TrackMetadata) => void;
}

const CARD_STYLES: { id: CardStyle; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'vinyl', nameVi: 'Đĩa Than Vinyl Xoay', desc: 'Đĩa vinyl chân thực với vân bóng và ảnh bìa xoay 360°', icon: Disc },
  { id: 'glass-card', nameVi: 'Thẻ Kính Mờ (Glass)', desc: 'Thẻ bo góc phủ kính hiện đại kèm ảnh bìa & tên ca sĩ', icon: CreditCard },
  { id: 'circular-badge', nameVi: 'Huy Hiệu Tròn', desc: 'Vòng tròn ảnh đại diện kèm viền phát sáng', icon: Sparkles },
  { id: 'minimal-tag', nameVi: 'Chữ Tối Giản', desc: 'Chỉ hiển thị tên bài hát & ca sĩ không có khung', icon: Music },
  { id: 'hidden', nameVi: 'Ẩn Thẻ Bìa', desc: 'Không hiển thị thẻ thông tin bài hát', icon: EyeOff },
];

export const TrackTab: React.FC<TrackTabProps> = ({ track, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<TrackMetadata>) => {
    onChange({ ...track, ...partial });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    update({ coverUrl: url });
  };

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Track Info Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Thông Tin Bài Hát (Track Details)
          </label>
        </div>

        {/* Title Input & Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Tên bài hát (Title)</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-white">
              <input
                type="checkbox"
                checked={track.showTitle !== false}
                onChange={(e) => update({ showTitle: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
              <span>Hiển thị</span>
            </label>
          </div>
          <div className="relative">
            <Music className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={track.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="VD: Đêm Lặng, Nơi Này Có Anh..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>

        {/* Artist Input & Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Tên ca sĩ / Nghệ sĩ (Artist)</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-white">
              <input
                type="checkbox"
                checked={track.showArtist !== false}
                onChange={(e) => update({ showArtist: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
              <span>Hiển thị</span>
            </label>
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={track.artist}
              onChange={(e) => update({ artist: e.target.value })}
              placeholder="VD: Sơn Tùng M-TP, Soobin, Vũ..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Cover Artwork Upload */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Ảnh Bìa Album (Cover Art)
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />

        <div className="flex items-center gap-4 bg-neutral-900/80 border border-neutral-800 p-3 rounded-2xl">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-700/80 shrink-0 bg-neutral-950">
            <img
              src={track.coverUrl}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Đổi ảnh bìa</span>
            </button>
            <p className="text-[10px] text-neutral-500 mt-1">
              Khuyên dùng ảnh vuông JPG / PNG độ nét cao
            </p>
          </div>
        </div>
      </div>

      {/* 3. Card Style Selector */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Kiểu Hiển Thị Thẻ Bìa (Badge Style)
        </label>

        <div className="space-y-2">
          {CARD_STYLES.map((st) => {
            const Icon = st.icon;
            const isSelected = track.cardStyle === st.id;
            return (
              <button
                key={st.id}
                onClick={() => update({ cardStyle: st.id, showTrackCard: st.id !== 'hidden' })}
                className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-500/30'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-rose-500/20 text-rose-400' : 'bg-neutral-800 text-neutral-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">{st.nameVi}</span>
                  <span className="text-[10px] text-neutral-500">{st.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Font, Resize Scale, and Typography Customization */}
      {track.cardStyle !== 'hidden' && (
        <div className="space-y-4 pt-2 border-t border-neutral-800/80">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Phông Chữ & Kích Thước (Font & Resize)
          </label>

          {/* Font Selector */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1.5">Phông chữ tiêu đề & ca sĩ</span>
            <div className="relative">
              <Type className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={track.fontFamily || 'Be Vietnam Pro'}
                onChange={(e) => update({ fontFamily: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resize Scale Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Kích thước tổng thể (Resize Scale)</span>
              <span className="text-rose-400 font-mono">{(track.scale || 1.0).toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.2}
              step={0.05}
              value={track.scale || 1.0}
              onChange={(e) => update({ scale: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Title Size & Artist Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Cỡ chữ Tên bài</span>
                <span className="text-rose-400 font-mono">{track.titleFontSize || 24}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={56}
                value={track.titleFontSize || 24}
                onChange={(e) => update({ titleFontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Cỡ chữ Ca sĩ</span>
                <span className="text-rose-400 font-mono">{track.artistFontSize || 15}px</span>
              </div>
              <input
                type="range"
                min={10}
                max={36}
                value={track.artistFontSize || 15}
                onChange={(e) => update({ artistFontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1.5">Căn chỉnh lề chữ</span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'left', name: 'Căn Trái', icon: AlignLeft },
                  { id: 'center', name: 'Căn Giữa', icon: AlignCenter },
                  { id: 'right', name: 'Căn Phải', icon: AlignRight },
                ] as const
              ).map((al) => {
                const Icon = al.icon;
                const isSelected = (track.alignment || 'center') === al.id;
                return (
                  <button
                    key={al.id}
                    onClick={() => update({ alignment: al.id })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{al.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Pickers: Title, Artist, Accent */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Màu Tên bài</span>
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
                <input
                  type="color"
                  value={track.textColor || '#ffffff'}
                  onChange={(e) => update({ textColor: e.target.value })}
                  className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-neutral-300 truncate">
                  {track.textColor || '#ffffff'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Màu Ca sĩ</span>
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
                <input
                  type="color"
                  value={track.artistColor || '#cccccc'}
                  onChange={(e) => update({ artistColor: e.target.value })}
                  className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-neutral-300 truncate">
                  {track.artistColor || '#cccccc'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Màu Điểm nhấn</span>
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
                <input
                  type="color"
                  value={track.accentColor || '#ec4899'}
                  onChange={(e) => update({ accentColor: e.target.value })}
                  className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-neutral-300 truncate">
                  {track.accentColor || '#ec4899'}
                </span>
              </div>
            </div>
          </div>

          {/* Position X & Position Y */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Vị trí ngang (Position X)</span>
                <span className="text-rose-400 font-mono">{track.positionX !== undefined ? track.positionX : 50}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                value={track.positionX !== undefined ? track.positionX : 50}
                onChange={(e) => update({ positionX: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Vị trí dọc (Position Y)</span>
                <span className="text-rose-400 font-mono">{track.positionY}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={85}
                value={track.positionY}
                onChange={(e) => update({ positionY: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          {/* Frosted Background Box for minimal tag or texts */}
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-neutral-300">Khung nền mờ cho chữ (Backdrop Pill)</span>
              <input
                type="checkbox"
                checked={!!track.boxBackground}
                onChange={(e) => update({ boxBackground: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
            </label>

            {track.boxBackground && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg flex-1">
                  <input
                    type="color"
                    value={track.boxBgColor || '#000000'}
                    onChange={(e) => update({ boxBgColor: e.target.value })}
                    className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-neutral-400">Màu nền khung</span>
                </div>
              </div>
            )}
          </div>

          {/* Rotate vinyl toggle */}
          {track.cardStyle === 'vinyl' && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={track.rotateVinyl}
                onChange={(e) => update({ rotateVinyl: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  Xoay đĩa than 360° khi phát nhạc
                </span>
                <span className="text-[10px] text-neutral-400">
                  Tự động tăng tốc độ quay theo cường độ âm Bass
                </span>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  );
};
