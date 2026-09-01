import React, { useRef } from 'react';
import { TrackMetadata, CardStyle, LogoPosition, BadgeBeatJumpStyle, TrackLayerOrder } from '../types';
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
  Layers,
  ShieldCheck,
  Activity,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface TrackTabProps {
  track: TrackMetadata;
  onChange: (track: TrackMetadata) => void;
}

const CARD_STYLES: { id: CardStyle; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'vinyl', nameVi: 'Đĩa Than Vinyl Xoay 360°', desc: 'Đĩa vinyl chân thực với vân bóng và ảnh bìa xoay 360°', icon: Disc },
  { id: 'glass-card', nameVi: 'Thẻ Kính Mờ (Glass Card)', desc: 'Thẻ bo góc phủ kính hiện đại kèm ảnh bìa & tên ca sĩ', icon: CreditCard },
  { id: 'logo-badge', nameVi: 'Huy Hiệu PNG (PNG Badge)', desc: 'Hình ảnh PNG trong suốt / sticker làm tâm điểm không có nền tròn, nhảy theo nhạc', icon: ShieldCheck },
  { id: 'circular-badge', nameVi: 'Huy Hiệu Tròn Phát Sáng', desc: 'Vòng tròn ảnh đại diện kèm viền phát sáng', icon: Sparkles },
  { id: 'minimal-tag', nameVi: 'Chữ Tối Giản Không Khung', desc: 'Chỉ hiển thị tên bài hát & ca sĩ không có khung bao quanh', icon: Music },
  { id: 'hidden', nameVi: 'Ẩn Thẻ Bìa', desc: 'Không hiển thị thẻ thông tin bài hát trên video', icon: EyeOff },
];

const BEAT_JUMP_STYLES: { id: BadgeBeatJumpStyle; name: string; desc: string }[] = [
  { id: 'pulse', name: 'Phóng To Co Giãn (Pulse)', desc: 'Thu phóng mượt mà theo nhịp trống' },
  { id: 'bounce-up', name: 'Nảy Lên Tưng Tưng (Bounce Up)', desc: 'Nảy bật lên phía trên theo từng cú Kick' },
  { id: 'scale-rotate', name: 'Lắc Lư Nghiêng (Tilt & Rock)', desc: 'Nghiêng góc nhịp nhàng kết hợp phóng to' },
  { id: 'jelly', name: 'Đàn Hồi Thạch (Jelly)', desc: 'Co ép đàn hồi như thạch rau câu' },
  { id: 'shake', name: 'Rung Giật Bass (Shake)', desc: 'Rung giật điện ảnh cực mạnh theo Bass Sub' },
];

const LAYER_ORDERS: { id: TrackLayerOrder; name: string; desc: string }[] = [
  { id: 'behind-visualizer', name: 'Phía Sau Sóng Âm (Mặc Định)', desc: 'Sóng âm vẽ đè lên trên thẻ bài hát' },
  { id: 'front-visualizer', name: 'Phía Trước Sóng Âm', desc: 'Thẻ bài hát nổi lên phía trước sóng âm' },
  { id: 'back-all', name: 'Phía Sau Cùng (Dưới Hạt Bay)', desc: 'Nằm sát nền, dưới cả hiệu ứng hạt rơi' },
  { id: 'front-all', name: 'Lớp Trên Cùng (Topmost)', desc: 'Hiển thị trên cùng đè lên tất cả các lớp' },
];

export const TrackTab: React.FC<TrackTabProps> = ({ track, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badgePngInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<TrackMetadata>) => {
    onChange({ ...track, ...partial });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ coverUrl: url });
  };

  const handleBadgePngUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ badgePngUrl: url });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ logoUrl: url, showLogo: true });
  };

  const isBadgeJumpActive = track.badgeBeatJump !== false;

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

        <div className="flex items-center gap-3 bg-neutral-900/70 border border-neutral-800 p-3 rounded-2xl">
          <div className="w-14 h-14 rounded-xl border border-neutral-700/80 shrink-0 bg-neutral-950 overflow-hidden shadow-inner flex items-center justify-center">
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc className="w-6 h-6 text-neutral-600 animate-spin" />
            )}
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold block truncate">{st.nameVi}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1" />}
                  </div>
                  <span className="text-[10px] text-neutral-500 line-clamp-1">{st.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Dedicated PNG Badge Upload (When PNG Badge style is chosen) */}
      {track.cardStyle === 'logo-badge' && (
        <div className="space-y-3 pt-2 border-t border-neutral-800/80 bg-rose-500/5 p-3.5 rounded-2xl border border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-200 block">
                  Ảnh Huy Hiệu PNG (PNG Badge Image)
                </label>
                <span className="text-[10px] text-neutral-400">
                  Hiển thị hình ảnh PNG trong suốt không có nền tròn, độc lập với Logo thương hiệu
                </span>
              </div>
            </div>
          </div>

          <input
            ref={badgePngInputRef}
            type="file"
            accept="image/png,image/webp,image/svg+xml,image/*"
            className="hidden"
            onChange={handleBadgePngUpload}
          />

          <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl">
            <div className="w-14 h-14 rounded-xl border border-neutral-700/80 shrink-0 bg-neutral-950/80 flex items-center justify-center overflow-hidden p-1">
              {track.badgePngUrl ? (
                <img
                  src={track.badgePngUrl}
                  alt="PNG Badge preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : track.coverUrl ? (
                <img
                  src={track.coverUrl}
                  alt="Badge fallback preview"
                  className="max-w-full max-h-full object-contain opacity-70"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-neutral-600" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => badgePngInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{track.badgePngUrl ? 'Đổi Ảnh PNG' : 'Tải Lên Ảnh PNG'}</span>
                </button>
                {track.badgePngUrl && (
                  <button
                    onClick={() => update({ badgePngUrl: undefined })}
                    className="p-1.5 rounded-xl bg-neutral-800 hover:bg-red-500/20 border border-neutral-700 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
                    title="Xóa ảnh PNG riêng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-neutral-400">
                {track.badgePngUrl ? 'Đang dùng ảnh PNG tùy chỉnh' : 'Chưa tải ảnh riêng (đang dùng tạm ảnh bìa cover)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Beat Jump / Nhảy Theo Nhịp Beats Cho Badge (On / Off & Controls) */}
      {track.cardStyle !== 'hidden' && (
        <div className="space-y-3.5 pt-2 border-t border-neutral-800/80 bg-neutral-900/40 p-3.5 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                isBadgeJumpActive ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm' : 'bg-neutral-800 border-neutral-700 text-neutral-500'
              }`}>
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-200 block">
                  Nhảy Theo Nhịp Beats (Beat Jump / Bounce)
                </label>
                <span className="text-[10px] text-neutral-400">
                  Thẻ đĩa / Badge nảy tưng bừng và co giãn theo cường độ âm Bass
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
              <input
                type="checkbox"
                checked={isBadgeJumpActive}
                onChange={(e) => update({ badgeBeatJump: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {isBadgeJumpActive && (
            <div className="space-y-3 pt-1">
              {/* Intensity Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-neutral-400">Cường độ nảy theo Beat</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {Math.round(((track.badgeBeatJumpIntensity ?? 0.18) / 0.5) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.50}
                  step={0.01}
                  value={track.badgeBeatJumpIntensity ?? 0.18}
                  onChange={(e) => update({ badgeBeatJumpIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.10 })} className="hover:text-amber-400 cursor-pointer">Nhẹ (10%)</button>
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.18 })} className="hover:text-amber-400 cursor-pointer">Vừa (18%)</button>
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.32 })} className="hover:text-amber-400 cursor-pointer">Mạnh (32%)</button>
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.45 })} className="hover:text-amber-400 cursor-pointer">Cực mạnh (45%)</button>
                </div>
              </div>

              {/* Jump Style Selector */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">Kiểu chuyển động nhảy</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {BEAT_JUMP_STYLES.map((style) => {
                    const isSelected = (track.badgeBeatJumpStyle || 'pulse') === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => update({ badgeBeatJumpStyle: style.id })}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                            : 'bg-neutral-900/80 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{style.name}</span>
                          <span className="text-[10px] text-neutral-500">{style.desc}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bass Glow Pulse */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-neutral-200 block">
                      Hào quang bừng sáng theo tiếng Bass
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Tỏa neon sáng rực xung quanh viền mỗi khi có tiếng Bass Drop
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={track.badgeBeatGlow !== false}
                  onChange={(e) => update({ badgeBeatGlow: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* 6. Layout Layer Order (Thứ tự lớp hiển thị) */}
      {track.cardStyle !== 'hidden' && (
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Thứ Tự Lớp Hiển Thị (Layout Order)
            </label>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {LAYER_ORDERS.map((layer) => {
              const isSelected = (track.layerOrder || 'behind-visualizer') === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => update({ layerOrder: layer.id })}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500 text-rose-200'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{layer.name}</span>
                    <span className="text-[10px] text-neutral-500">{layer.desc}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Logo PNG Thương Hiệu (Brand Logo Watermark Section - Fully Independent) */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Logo PNG Thương Hiệu (Watermark Góc)
            </label>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!track.showLogo}
              onChange={(e) => update({ showLogo: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/webp,image/svg+xml,image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />

        <div className="flex items-center gap-3 bg-neutral-900/70 border border-neutral-800 p-3 rounded-2xl">
          <div className="w-14 h-14 rounded-xl border border-neutral-700/80 shrink-0 bg-neutral-950/80 flex items-center justify-center overflow-hidden p-1">
            {track.logoUrl ? (
              <img
                src={track.logoUrl}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-neutral-600" />
            )}
          </div>

          <div className="flex-1">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{track.logoUrl ? 'Đổi Logo PNG' : 'Tải lên Logo PNG'}</span>
            </button>
            <p className="text-[10px] text-neutral-500 mt-1">
              Hỗ trợ PNG trong suốt, SVG, WebP làm watermark kênh
            </p>
          </div>
        </div>

        {track.showLogo && (
          <div className="space-y-3 bg-neutral-900/40 p-3 rounded-xl border border-neutral-800/80">
            {/* Logo Position */}
            <div>
              <span className="text-xs text-neutral-400 block mb-1">Vị trí hiển thị Watermark</span>
              <select
                value={track.logoPosition || 'top-left'}
                onChange={(e) => update({ logoPosition: e.target.value as LogoPosition })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="top-left">Góc trên cùng bên Trái (Top Left)</option>
                <option value="top-right">Góc trên cùng bên Phải (Top Right)</option>
                <option value="bottom-left">Góc dưới cùng bên Trái (Bottom Left)</option>
                <option value="bottom-right">Góc dưới cùng bên Phải (Bottom Right)</option>
              </select>
            </div>

            {/* Logo Scale & Opacity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Kích cỡ Logo</span>
                  <span className="text-cyan-400 font-mono">{(track.logoScale || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2.5}
                  step={0.1}
                  value={track.logoScale || 1.0}
                  onChange={(e) => update({ logoScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Độ trong suốt</span>
                  <span className="text-cyan-400 font-mono">{Math.round((track.logoOpacity || 0.9) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={track.logoOpacity || 0.9}
                  onChange={(e) => update({ logoOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Logo Glow */}
            <label className="flex items-center justify-between cursor-pointer pt-1">
              <span className="text-xs text-neutral-300">Phát sáng viền Logo theo tiếng Bass</span>
              <input
                type="checkbox"
                checked={!!track.logoGlow}
                onChange={(e) => update({ logoGlow: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
              />
            </label>
          </div>
        )}
      </div>

      {/* 8. Font, Resize Scale, and Typography Customization */}
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
