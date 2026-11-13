import React, { useRef, useState } from 'react';
import { TrackMetadata, CardStyle, LogoPosition, BadgeBeatJumpStyle, TrackLayerOrder, TrackFontEffect, LogoAnimation, LogoAnimationDirection, TrackFontWeight, PlaylistConfig } from '../types';
import { AVAILABLE_FONTS, DEFAULT_TRACK } from '../utils/presets';
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
  Trash2,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  Sliders,
  Palette,
  RotateCw,
  RotateCcw,
  GripVertical,
  Move,
} from 'lucide-react';

import { Language, TRANSLATIONS } from '../utils/i18n';
import { Position2DPad } from './Position2DPad';

interface TrackTabProps {
  track: TrackMetadata;
  onChange: (track: TrackMetadata) => void;
  language?: Language;
  playlist?: PlaylistConfig;
}

const CARD_STYLES: { id: CardStyle; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'horizontal-rounded-card', nameVi: 'Thẻ Ngang Bo Tròn (Badge Mới)', nameEn: 'Horizontal Rounded Card Badge', descVi: 'Khung ảnh bo tròn viền dày nổi bật bên trái + 3 dòng phụ đề, tên bài và ca sĩ bên phải', descEn: 'Modern horizontal card with thick rounded cover frame on left and 3-tier track details on right', icon: CreditCard },
  { id: 'rotating-badge', nameVi: 'Huy Hiệu Tròn Xoay (Rotating Badge)', nameEn: 'Rotating Vinyl Badge 360°', descVi: 'Huy hiệu tròn xoay 360° với viền chữ uốn cong xoay tròn và tâm ảnh đĩa', descEn: 'Rotating circular badge with continuous circular curved text ribbon and center album artwork', icon: Disc },
  { id: 'glass-card', nameVi: 'Thẻ Kính Mờ (Glass Card)', nameEn: 'Frosted Glass Badge', descVi: 'Thẻ bo góc phủ kính hiện đại kèm ảnh bìa & tên ca sĩ', descEn: 'Translucent frosted glass card with artwork, title and singer', icon: CreditCard },
  { id: 'minimal-tag', nameVi: 'Chữ Tối Giản Không Khung', nameEn: 'Minimalist Typography', descVi: 'Chỉ hiển thị tên bài hát & ca sĩ không có khung bao quanh', descEn: 'Floating text only without container boundaries', icon: Music },
  { id: 'hidden', nameVi: 'Ẩn Thẻ Bìa', nameEn: 'Hidden / Off', descVi: 'Không hiển thị thẻ thông tin bài hát trên video', descEn: 'Hide track card info from the video render', icon: EyeOff },
];

const BEAT_JUMP_STYLES: { id: BadgeBeatJumpStyle; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'pulse', nameVi: 'Phóng To Co Giãn (Pulse)', nameEn: 'Pulse Scaling', descVi: 'Thu phóng mượt mà theo nhịp trống', descEn: 'Smooth scaling synchronized to drum beats' },
  { id: 'bounce-up', nameVi: 'Nảy Lên Tưng Tưng (Bounce Up)', nameEn: 'Bounce Upward', descVi: 'Nảy bật lên phía trên theo từng cú Kick', descEn: 'Bounces upward dynamically on each kick' },
  { id: 'scale-rotate', nameVi: 'Lắc Lư Nghiêng (Tilt & Rock)', nameEn: 'Tilt & Rock', descVi: 'Nghiêng góc nhịp nhàng kết hợp phóng to', descEn: 'Rhythmic angle tilting combined with scale' },
  { id: 'jelly', nameVi: 'Đàn Hồi Thạch (Jelly)', nameEn: 'Jelly Elastic', descVi: 'Co ép đàn hồi như thạch rau câu', descEn: 'Squash and stretch elastic jelly motion' },
  { id: 'shake', nameVi: 'Rung Giật Bass (Shake)', nameEn: 'Sub-Bass Shake', descVi: 'Rung giật điện ảnh cực mạnh theo Bass Sub', descEn: 'Cinematic shake pulse on heavy sub drops' },
];

const LAYER_ORDERS: { id: TrackLayerOrder; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'behind-visualizer', nameVi: 'Phía Sau Sóng Âm (Mặc Định)', nameEn: 'Behind Visualizer (Default)', descVi: 'Sóng âm vẽ đè lên trên thẻ bài hát', descEn: 'Visualizer waveform renders over track badge' },
  { id: 'front-visualizer', nameVi: 'Phía Trước Sóng Âm', nameEn: 'In Front of Visualizer', descVi: 'Thẻ bài hát nổi lên phía trước sóng âm', descEn: 'Track badge floats in front of visualizer' },
  { id: 'back-all', nameVi: 'Phía Sau Cùng (Dưới Hạt Bay)', nameEn: 'Behind All (Under Particles)', descVi: 'Nằm sát nền, dưới cả hiệu ứng hạt rơi', descEn: 'Lowest layer under particle effects' },
  { id: 'front-all', nameVi: 'Lớp Trên Cùng (Topmost)', nameEn: 'Topmost Layer', descVi: 'Hiển thị trên cùng đè lên tất cả các lớp', descEn: 'Renders on very top over all elements' },
];

const TRACK_FONT_EFFECTS: { id: TrackFontEffect; nameVi: string; nameEn: string }[] = [
  { id: 'none', nameVi: 'Mặc định (Không hiệu ứng)', nameEn: 'None (Clean)' },
  { id: 'neon-glow', nameVi: 'Hào quang Neon phát sáng', nameEn: 'Neon Glow' },
  { id: 'double-stroke', nameVi: 'Viền nét đôi tương phản', nameEn: 'Double Stroke' },
  { id: '3d-shadow', nameVi: 'Bóng đổ 3D chiều sâu', nameEn: '3D Depth Shadow' },
  { id: 'gradient', nameVi: 'Chuyển sắc Gradient', nameEn: 'Gradient Color' },
  { id: 'metallic-chrome', nameVi: 'Kim loại Chrome ánh kim', nameEn: 'Metallic Chrome' },
  { id: 'comic-pop', nameVi: 'Hoạt họa Comic Pop', nameEn: 'Comic Pop' },
];

const TRACK_FONT_STYLES: { id: 'normal' | 'italic' | 'bold' | 'bold-italic' | 'uppercase'; nameVi: string; nameEn: string }[] = [
  { id: 'normal', nameVi: 'Bình thường (Normal)', nameEn: 'Normal' },
  { id: 'bold', nameVi: 'Đậm nét (Bold)', nameEn: 'Bold' },
  { id: 'italic', nameVi: 'Nghiêng (Italic)', nameEn: 'Italic' },
  { id: 'bold-italic', nameVi: 'Đậm & Nghiêng (Bold Italic)', nameEn: 'Bold Italic' },
  { id: 'uppercase', nameVi: 'VIẾT HOA (ALL CAPS)', nameEn: 'Uppercase' },
];

const TRACK_FONT_WEIGHTS: { id: TrackFontWeight; nameVi: string; nameEn: string }[] = [
  { id: 'normal', nameVi: 'Bình thường (Regular 400)', nameEn: 'Regular (400)' },
  { id: '500', nameVi: 'Vừa phải (Medium 500)', nameEn: 'Medium (500)' },
  { id: '600', nameVi: 'Hơi đậm (SemiBold 600)', nameEn: 'SemiBold (600)' },
  { id: 'bold', nameVi: 'Đậm nét (Bold 700)', nameEn: 'Bold (700)' },
  { id: '900', nameVi: 'Cực đậm (Black 900)', nameEn: 'Black (900)' },
];

const LOGO_ANIMATIONS: { id: LogoAnimation; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'none', nameVi: 'Tĩnh (Không xoay)', nameEn: 'None (Static)', descVi: 'Hiển thị cố định không xoay', descEn: 'Static logo watermark' },
  { id: 'vertical-spin-3d', nameVi: 'Xoay 360° theo trục đứng (3D Spin)', nameEn: 'Vertical 3D Spin (360°)', descVi: 'Xoay lật 3D liên tục quanh trục dọc Y', descEn: 'Continuous 3D rotation around vertical Y-axis' },
  { id: 'circular-spin', nameVi: 'Xoay tròn 360° (Circular 2D)', nameEn: 'Circular Spin (360°)', descVi: 'Xoay tròn đều đặn theo chiều kim đồng hồ', descEn: 'Smooth circular clockwise rotation' },
];

export const TrackTab: React.FC<TrackTabProps> = ({ track: rawTrack, onChange, language = 'vi', playlist }) => {
  const track = rawTrack || DEFAULT_TRACK;
  const [selectedDetailTab, setSelectedDetailTab] = useState<'subtitle' | 'title' | 'artist' | 'track-title'>('title');
  const [draggedDetailKey, setDraggedDetailKey] = useState<string | null>(null);
  const [dragOverDetailKey, setDragOverDetailKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];

  const update = (partial: Partial<TrackMetadata>) => {
    onChange({ ...track, ...partial });
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ coverUrl: url });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    update({ logoUrl: url, showLogo: true });
  };

  const isBadgeJumpActive = track.badgeBeatJump !== false;
  const hasMultiplePlaylistSongs = !!(playlist && playlist.tracks && playlist.tracks.length > 1);
  const activePlaylistTrack = playlist?.tracks?.[playlist.currentIndex || 0];
  const activePlayingTitle = track.currentPlayingTrackTitle || activePlaylistTrack?.title || (playlist?.tracks?.[0]?.title) || '01. Track Title';

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Track Info Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {language === 'vi' ? 'Thông Tin Bài Hát & Tiêu Đề' : 'Track Details & Titles'}
          </label>
        </div>

        {/* 1. Subtitle Input & Toggle (Positioned above main title) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {language === 'vi' ? 'Tiêu đề phụ / Thể loại (Subtitle)' : 'Subtitle / Tagline'}
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-white">
              <input
                type="checkbox"
                checked={track.showSubtitle !== false}
                onChange={(e) => update({ showSubtitle: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
              <span>{language === 'vi' ? 'Hiển thị' : 'Show'}</span>
            </label>
          </div>
          <div className="relative">
            <Sparkles className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={track.subtitle || ''}
              onChange={(e) => update({ subtitle: e.target.value })}
              placeholder={language === 'vi' ? 'VD: Official Audio, Acoustic Version, Remake, Lofi Chill...' : 'e.g. Official Audio, Acoustic Version, Remake, Lofi Chill...'}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>

        {/* 2. Main Title Input & Toggle (Main Playlist / Album Title - Preserved) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-300">
                {language === 'vi' ? 'Tiêu Đề Chính Playlist / Album (Main Title)' : 'Main Title of Playlist (Album / Project)'}
              </span>
              {hasMultiplePlaylistSongs && (
                <span className="block text-[10px] text-neutral-400">
                  {language === 'vi' ? 'Tiêu đề cố định của Playlist (không bị đổi khi chuyển bài)' : 'Permanent main title of playlist (preserved across songs)'}
                </span>
              )}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-white">
              <input
                type="checkbox"
                checked={track.showTitle !== false}
                onChange={(e) => update({ showTitle: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
              <span>{language === 'vi' ? 'Hiển thị' : 'Show'}</span>
            </label>
          </div>
          <div className="relative">
            <Music className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={track.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder={language === 'vi' ? 'VD: Tuyển Tập Nhạc Lofi Chill, Đêm Lặng, Best Hits...' : 'e.g. Best of Lofi Chill, Deep Space, Greatest Hits...'}
              className="w-full bg-neutral-900 border border-rose-500/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
            />
          </div>
        </div>

        {/* 3. Artist Input & Toggle (Artist information positioned below main title) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {language === 'vi' ? 'Tên ca sĩ / Nghệ sĩ (Artist)' : 'Artist / Producer'}
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400 hover:text-white">
              <input
                type="checkbox"
                checked={track.showArtist !== false}
                onChange={(e) => update({ showArtist: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
              <span>{language === 'vi' ? 'Hiển thị' : 'Show'}</span>
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

        {/* 4. Dedicated Playlist Track Title Section (Displayed when playlist has > 1 song) */}
        {hasMultiplePlaylistSongs ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-neutral-900/90 to-neutral-950 border border-rose-500/40 space-y-3.5 shadow-lg mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {language === 'vi' ? 'Tên Bài Hát (Track Title)' : 'Playlist Track Title'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                      {playlist.tracks.length} bài
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {language === 'vi' 
                      ? 'Hiển thị tên bài đang phát và tự động cập nhật khi đổi bài' 
                      : 'Display active song title from playlist and auto-update'}
                  </span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                <input
                  type="checkbox"
                  checked={track.showTrackTitle !== false}
                  onChange={(e) => update({ showTrackTitle: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {/* Controls when showTrackTitle is enabled */}
            {track.showTrackTitle !== false && (
              <div className="space-y-3 pt-2 border-t border-neutral-800/80">
                {/* Active song banner indicator */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs">
                  <span className="text-neutral-400 text-[11px]">
                    {language === 'vi' ? 'Bài đang phát:' : 'Currently Playing:'}
                  </span>
                  <span className="font-semibold text-rose-300 truncate max-w-[220px]">
                    {activePlayingTitle}
                  </span>
                </div>

                {/* Font Family selector */}
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">
                    {language === 'vi' ? 'Phông chữ riêng của Tên Bài Hát' : 'Track Title Font'}
                  </span>
                  <div className="relative">
                    <Type className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={track.trackTitleFontFamily || track.fontFamily || 'Be Vietnam Pro'}
                      onChange={(e) => update({ trackTitleFontFamily: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
                    >
                      {AVAILABLE_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Font Weight & Font Effect */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">
                      {language === 'vi' ? 'Độ đậm chữ' : 'Font Weight'}
                    </span>
                    <select
                      value={track.trackTitleFontWeight || 'bold'}
                      onChange={(e) => update({ trackTitleFontWeight: e.target.value as TrackFontWeight })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      {TRACK_FONT_WEIGHTS.map((wt) => (
                        <option key={wt.id} value={wt.id}>
                          {language === 'vi' ? wt.nameVi : wt.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">
                      {language === 'vi' ? 'Hiệu ứng chữ (Effect)' : 'Font Effect'}
                    </span>
                    <select
                      value={track.trackTitleFontEffect || 'none'}
                      onChange={(e) => update({ trackTitleFontEffect: e.target.value as TrackFontEffect })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      {TRACK_FONT_EFFECTS.map((ef) => (
                        <option key={ef.id} value={ef.id}>
                          {language === 'vi' ? ef.nameVi : ef.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Italic & Uppercase checkboxes */}
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!track.trackTitleItalic}
                      onChange={(e) => update({ trackTitleItalic: e.target.checked })}
                      className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-300 font-medium italic">
                      {language === 'vi' ? 'Chữ nghiêng (Italic)' : 'Italic Style'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={!!track.trackTitleUppercase}
                      onChange={(e) => update({ trackTitleUppercase: e.target.checked })}
                      className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-300 font-medium font-mono uppercase">
                      {language === 'vi' ? 'In hoa (UPPERCASE)' : 'ALL CAPS'}
                    </span>
                  </label>
                </div>

                {/* Font Size & Color */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">
                        {language === 'vi' ? 'Cỡ chữ' : 'Font Size'}
                      </span>
                      <span className="text-rose-400 font-mono font-bold">
                        {track.trackTitleFontSize || 18}px
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = track.trackTitleFontSize || 18;
                          update({ trackTitleFontSize: Math.max(10, cur - 1) });
                        }}
                        className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={10}
                        max={48}
                        value={track.trackTitleFontSize || 18}
                        onChange={(e) => update({ trackTitleFontSize: parseInt(e.target.value) })}
                        className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cur = track.trackTitleFontSize || 18;
                          update({ trackTitleFontSize: Math.min(64, cur + 1) });
                        }}
                        className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-neutral-400 block mb-1">
                      {language === 'vi' ? 'Màu chữ' : 'Font Color'}
                    </span>
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
                      <input
                        type="color"
                        value={track.trackTitleColor || '#ffffff'}
                        onChange={(e) => update({ trackTitleColor: e.target.value })}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <div className="flex items-center gap-1 flex-wrap">
                        {['#ffffff', '#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#fb923c'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => update({ trackTitleColor: c })}
                            style={{ backgroundColor: c }}
                            className="w-3.5 h-3.5 rounded-full border border-neutral-700 hover:scale-110 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position Options: With card or Custom X, Y on Stage */}
                <div className="pt-2 border-t border-neutral-800/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-300">
                      {language === 'vi' ? 'Vị trí hiển thị Tên Bài Hát' : 'Track Title Placement'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {track.trackTitleCustomPosition 
                        ? (language === 'vi' ? 'Tọa độ X, Y tự do' : 'Custom X/Y')
                        : (language === 'vi' ? 'Gắn cùng Thẻ bài hát' : 'Inline with Card')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => update({ trackTitleCustomPosition: false })}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                        !track.trackTitleCustomPosition
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/30'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="block font-bold">
                        {language === 'vi' ? 'Đi cùng Thẻ bìa' : 'With Track Card'}
                      </span>
                      <span className="text-[9px] text-neutral-500 block font-normal">
                        {language === 'vi' ? 'Xếp chung dòng thông tin' : 'Flow in card details'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => update({ trackTitleCustomPosition: true })}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                        track.trackTitleCustomPosition
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/30'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="block font-bold">
                        {language === 'vi' ? 'Tọa độ X, Y tự do' : 'Custom X, Y'}
                      </span>
                      <span className="text-[9px] text-neutral-500 block font-normal">
                        {language === 'vi' ? 'Di chuyển bất kỳ đâu trên video' : 'Position anywhere on video'}
                      </span>
                    </button>
                  </div>

                  {track.trackTitleCustomPosition && (
                    <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2.5 mt-2">
                      <Position2DPad
                        x={track.trackTitlePositionX ?? 50}
                        y={track.trackTitlePositionY ?? 44}
                        onChange={(newX, newY) => update({ trackTitlePositionX: newX, trackTitlePositionY: newY })}
                        label={language === 'vi' ? 'Kéo Thả Vị Trí Tên Bài Hát (Drag & Drop)' : 'Track Title Drag & Drop Position'}
                        color="#f43f5e"
                        language={language}
                      />
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">
                            {language === 'vi' ? 'Vị trí ngang (Position X)' : 'Horizontal X'}
                          </span>
                          <span className="text-rose-400 font-mono font-bold">
                            {track.trackTitlePositionX ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={95}
                          value={track.trackTitlePositionX ?? 50}
                          onChange={(e) => update({ trackTitlePositionX: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">
                            {language === 'vi' ? 'Vị trí dọc (Position Y)' : 'Vertical Y'}
                          </span>
                          <span className="text-rose-400 font-mono font-bold">
                            {track.trackTitlePositionY ?? 44}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={95}
                          value={track.trackTitlePositionY ?? 44}
                          onChange={(e) => update({ trackTitlePositionY: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview Card */}
                <div className="p-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 text-center overflow-hidden">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-wider block mb-1">
                    {language === 'vi' ? 'Xem trước kiểu chữ Tên Bài Hát' : 'Live Track Title Preview'}
                  </span>
                  <p
                    style={{
                      fontFamily: `'${track.trackTitleFontFamily || track.fontFamily || 'Be Vietnam Pro'}', sans-serif`,
                      fontSize: `${Math.min(Math.max(track.trackTitleFontSize || 18, 12), 24)}px`,
                      fontWeight: track.trackTitleFontWeight === 'bold' || track.trackTitleFontWeight === '900' ? 700 : 400,
                      fontStyle: track.trackTitleItalic ? 'italic' : 'normal',
                      textTransform: track.trackTitleUppercase ? 'uppercase' : 'none',
                      color: track.trackTitleColor || '#ffffff',
                    }}
                    className="truncate px-2 font-bold"
                  >
                    {activePlayingTitle}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center gap-2.5 mt-2">
            <div className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0">
              <Music className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <span>
              {language === 'vi'
                ? 'Playlist chỉ có 1 bài hát: Tên bài hát (Track Title) được tự động ẩn để tránh lặp lại Tiêu đề chính.'
                : 'Playlist has only 1 track: Track Title is automatically removed to prevent repeating the Main Title.'}
            </span>
          </div>
        )}
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
            {track?.coverUrl ? (
              <img
                src={track?.coverUrl}
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
                    <span className="text-xs font-semibold block truncate">
                      {language === 'vi' ? st.nameVi : st.nameEn}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-1" />}
                  </div>
                  <span className="text-[10px] text-neutral-500 line-clamp-1">
                    {language === 'vi' ? st.descVi : st.descEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Dedicated Settings for Badge Styles (Huy Hiệu: rotating-badge, horizontal-rounded-card) */}
      {(track.cardStyle === 'rotating-badge' || track.cardStyle === 'horizontal-rounded-card') && (
        <div className="space-y-3.5 pt-2 border-t border-neutral-800/80 bg-gradient-to-br from-amber-500/10 via-neutral-900/60 to-neutral-900/80 p-3.5 rounded-2xl border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    {language === 'vi' ? 'Cài Đặt Huy Hiệu (Badge Settings)' : 'Badge Customization'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {language === 'vi' ? 'Riêng Biệt' : 'Dedicated'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">
                  {language === 'vi' 
                    ? 'Tùy chỉnh kích cỡ, độ trong suốt và màu viền huy hiệu độc lập hoàn toàn với Logo thương hiệu'
                    : 'Customize badge scale, opacity, and border styling independently from brand logo'}
                </span>
              </div>
            </div>
          </div>

          {/* Badge Scale & Opacity (Dedicated for Badge) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{language === 'vi' ? 'Kích cỡ Huy hiệu' : 'Badge Scale'}</span>
                <span className="text-amber-400 font-mono font-bold">{(track.badgeScale ?? 1.0).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={2.5}
                step={0.1}
                value={track.badgeScale ?? 1.0}
                onChange={(e) => update({ badgeScale: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{language === 'vi' ? 'Độ trong suốt Huy hiệu' : 'Badge Opacity'}</span>
                <span className="text-amber-400 font-mono font-bold">{Math.round((track.badgeOpacity ?? 1.0) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={track.badgeOpacity ?? 1.0}
                onChange={(e) => update({ badgeOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Badge Border Color & Presets */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-neutral-300 font-medium">{language === 'vi' ? 'Màu viền Huy hiệu (Badge Border Color)' : 'Badge Border Color'}</span>
              <span className="font-mono text-[11px] text-amber-400 font-bold">{track.badgeBorderColor || '#f97316'}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={track.badgeBorderColor || '#f97316'}
                onChange={(e) => update({ badgeBorderColor: e.target.value })}
                className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {[
                  { name: 'Cam Nổi Bật', hex: '#f97316' },
                  { name: 'Hồng Neon', hex: '#ec4899' },
                  { name: 'Xanh Cyan', hex: '#06b6d4' },
                  { name: 'Trắng Sáng', hex: '#ffffff' },
                  { name: 'Vàng Kim', hex: '#eab308' },
                  { name: 'Tím Cyber', hex: '#a855f7' },
                  { name: 'Xanh Ngọc', hex: '#10b981' },
                ].map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => update({ badgeBorderColor: col.hex })}
                    style={{ backgroundColor: col.hex }}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      (track.badgeBorderColor || '#f97316').toLowerCase() === col.hex.toLowerCase()
                        ? 'border-white scale-110 shadow-md ring-2 ring-amber-500/50'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Border Width & Specific options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{language === 'vi' ? 'Độ dày viền Huy hiệu' : 'Border Width'}</span>
                <span className="text-amber-400 font-mono font-bold">{track.badgeBorderWidth ?? 6}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={16}
                step={1}
                value={track.badgeBorderWidth ?? 6}
                onChange={(e) => update({ badgeBorderWidth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {track.cardStyle === 'horizontal-rounded-card' ? (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Bo góc viền' : 'Border Radius'}</span>
                  <span className="text-amber-400 font-mono font-bold">{track.badgeBorderRadius ?? 24}px</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={48}
                  step={2}
                  value={track.badgeBorderRadius ?? 24}
                  onChange={(e) => update({ badgeBorderRadius: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <label className="flex items-center justify-between w-full cursor-pointer p-2 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] font-medium text-neutral-300">
                    {language === 'vi' ? 'Hào quang bừng sáng theo Bass' : 'Bass Glow Aura'}
                  </span>
                  <input
                    type="checkbox"
                    checked={track.badgeBeatGlow !== false}
                    onChange={(e) => update({ badgeBeatGlow: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 ml-2 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {track.cardStyle === 'horizontal-rounded-card' && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-800/60">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Khoảng cách chữ' : 'Text Gap'}</span>
                  <span className="text-amber-400 font-mono">{track.badgeTextGap ?? 20}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={48}
                  step={2}
                  value={track.badgeTextGap ?? 20}
                  onChange={(e) => update({ badgeTextGap: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-end">
                <label className="flex items-center justify-between w-full cursor-pointer p-2 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] font-medium text-neutral-300">
                    {language === 'vi' ? 'Hào quang bừng sáng theo Bass' : 'Bass Glow Aura'}
                  </span>
                  <input
                    type="checkbox"
                    checked={track.badgeBeatGlow !== false}
                    onChange={(e) => update({ badgeBeatGlow: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-neutral-800 border-neutral-700 ml-2 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Dedicated Rotation Speed for Rotating Badge */}
          {track.cardStyle === 'rotating-badge' && (
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'vi' ? 'Tốc độ xoay Huy hiệu' : 'Badge Rotation Speed'}
                </span>
                <span className="text-amber-400 font-mono font-bold">{(track.rotatingBadgeSpeed ?? 1.0).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3.0}
                step={0.1}
                value={track.rotatingBadgeSpeed ?? 1.0}
                onChange={(e) => update({ rotatingBadgeSpeed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex items-center gap-1.5">
                {[0.2, 0.5, 1.0, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => update({ rotatingBadgeSpeed: spd })}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      (track.rotatingBadgeSpeed ?? 1.0) === spd
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {spd.toFixed(1)}x
                  </button>
                ))}
              </div>

              {/* Spacing between Vinyl Badge and Track Details (subtitle, title, artist) */}
              <div className="pt-2.5 border-t border-neutral-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                    <MoveVertical className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'vi' 
                      ? 'Khoảng cách giữa Đĩa Vinyl và Chi tiết bài hát' 
                      : 'Spacing between Vinyl Badge & Track Info'}
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{track.vinylTextSpacing ?? 28}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={2}
                  value={track.vinylTextSpacing ?? 28}
                  onChange={(e) => update({ vinylTextSpacing: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[0, 12, 20, 28, 40, 56, 80].map((spacingVal) => (
                    <button
                      key={spacingVal}
                      type="button"
                      onClick={() => update({ vinylTextSpacing: spacingVal })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        (track.vinylTextSpacing ?? 28) === spacingVal
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {spacingVal}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Badge Drag & Drop 2D Position Pad */}
          <div className="pt-2 border-t border-neutral-800/80">
            <Position2DPad
              x={track.positionX !== undefined ? track.positionX : 50}
              y={track.positionY !== undefined ? track.positionY : 28}
              onChange={(newX, newY) => update({ positionX: newX, positionY: newY })}
              label={language === 'vi' ? 'Kéo Thả Vị Trí Huy Hiệu (Badge Drag & Drop)' : 'Badge Drag & Drop Position'}
              color="#f97316"
              language={language}
            />
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
                  <span className="text-neutral-400">
                    {language === 'vi' ? 'Cường độ nảy theo Beat' : 'Beat Jump Intensity'}
                  </span>
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
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.10 })} className="hover:text-amber-400 cursor-pointer">
                    {language === 'vi' ? 'Nhẹ (10%)' : 'Soft (10%)'}
                  </button>
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.18 })} className="hover:text-amber-400 cursor-pointer">
                    {language === 'vi' ? 'Vừa (18%)' : 'Mid (18%)'}
                  </button>
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.32 })} className="hover:text-amber-400 cursor-pointer">
                    {language === 'vi' ? 'Mạnh (32%)' : 'High (32%)'}
                  </button>
                  <button onClick={() => update({ badgeBeatJumpIntensity: 0.45 })} className="hover:text-amber-400 cursor-pointer">
                    {language === 'vi' ? 'Cực mạnh (45%)' : 'Max (45%)'}
                  </button>
                </div>
              </div>

              {/* Jump Style Selector */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5">
                  {language === 'vi' ? 'Kiểu chuyển động nhảy' : 'Beat Jump Motion Style'}
                </span>
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
                          <span className="font-semibold block">{language === 'vi' ? style.nameVi : style.nameEn}</span>
                          <span className="text-[10px] text-neutral-500">{language === 'vi' ? style.descVi : style.descEn}</span>
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
              {language === 'vi' ? 'Thứ Tự Lớp Hiển Thị (Layout Order)' : 'Layer Render Order'}
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
                    <span className="font-semibold block">{language === 'vi' ? layer.nameVi : layer.nameEn}</span>
                    <span className="text-[10px] text-neutral-500">{language === 'vi' ? layer.descVi : layer.descEn}</span>
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
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-400">
                  {language === 'vi' ? 'Vị trí hiển thị Watermark' : 'Watermark Position'}
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  X: {Math.round(track.logoPositionX ?? 6)}% | Y: {Math.round(track.logoPositionY ?? 6)}%
                </span>
              </div>
              <select
                value={track.logoPosition || 'top-left'}
                onChange={(e) => {
                  const pos = e.target.value as LogoPosition;
                  if (pos === 'top-left') update({ logoPosition: pos, logoPositionX: 6, logoPositionY: 6 });
                  else if (pos === 'top-right') update({ logoPosition: pos, logoPositionX: 94, logoPositionY: 6 });
                  else if (pos === 'bottom-left') update({ logoPosition: pos, logoPositionX: 6, logoPositionY: 94 });
                  else if (pos === 'bottom-right') update({ logoPosition: pos, logoPositionX: 94, logoPositionY: 94 });
                  else if (pos === 'badge-center') update({ logoPosition: pos, logoPositionX: 50, logoPositionY: 28 });
                  else update({ logoPosition: 'custom' });
                }}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="top-left">{language === 'vi' ? '↖ Góc trên cùng bên Trái (Top Left)' : '↖ Top Left Corner'}</option>
                <option value="top-right">{language === 'vi' ? '↗ Góc trên cùng bên Phải (Top Right)' : '↗ Top Right Corner'}</option>
                <option value="bottom-left">{language === 'vi' ? '↙ Góc dưới cùng bên Trái (Bottom Left)' : '↙ Bottom Left Corner'}</option>
                <option value="bottom-right">{language === 'vi' ? '↘ Góc dưới cùng bên Phải (Bottom Right)' : '↘ Bottom Right Corner'}</option>
                <option value="badge-center">{language === 'vi' ? '⦿ Chính Giữa Khung (Center)' : '⦿ Center'}</option>
                <option value="custom">{language === 'vi' ? '✦ Tự do di chuyển (Tọa độ X, Y bất kỳ)' : '✦ Custom (Any X, Y Position)'}</option>
              </select>

              {/* Quick Position Presets */}
              <div className="flex items-center gap-1.5 mt-2">
                {[
                  { id: 'top-left', label: '↖ Trái-Trên', x: 6, y: 6 },
                  { id: 'top-right', label: '↗ Phải-Trên', x: 94, y: 6 },
                  { id: 'bottom-left', label: '↙ Trái-Dưới', x: 6, y: 94 },
                  { id: 'bottom-right', label: '↘ Phải-Dưới', x: 94, y: 94 },
                  { id: 'badge-center', label: '⦿ Giữa', x: 50, y: 50 },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update({ logoPosition: p.id as LogoPosition, logoPositionX: p.x, logoPositionY: p.y })}
                    className={`flex-1 py-1 text-[10px] rounded-lg border transition-all cursor-pointer font-medium ${
                      track.logoPosition === p.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-semibold'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Arbitrary X & Y Sliders */}
            <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2.5">
              <Position2DPad
                x={track.logoPositionX ?? 6}
                y={track.logoPositionY ?? 6}
                onChange={(newX, newY) => update({ logoPositionX: newX, logoPositionY: newY, logoPosition: 'custom' })}
                label={language === 'vi' ? 'Kéo Thả Vị Trí Logo Watermark' : 'Logo Watermark Drag & Drop Position'}
                color="#06b6d4"
                language={language}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-300">
                  {language === 'vi' ? 'Di dời vị trí tự do (X, Y Tùy ý)' : 'Free Position (X, Y Offset)'}
                </span>
                <span className="text-[10px] text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50">
                  {language === 'vi' ? '0% - 100% Canvas' : '0% - 100% Canvas'}
                </span>
              </div>

              {/* Slider X */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Vị trí ngang (Tọa độ X)' : 'Horizontal (X)'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{Math.round(track.logoPositionX ?? 6)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={track.logoPositionX ?? 6}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    update({ logoPositionX: val, logoPosition: 'custom' });
                  }}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Slider Y */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Vị trí dọc (Tọa độ Y)' : 'Vertical (Y)'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{Math.round(track.logoPositionY ?? 6)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={track.logoPositionY ?? 6}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    update({ logoPositionY: val, logoPosition: 'custom' });
                  }}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Logo Scale & Opacity (Dedicated for Brand Logo Watermark) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Kích cỡ Logo (Scale)' : 'Logo Scale'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{(track.logoScale || 1.0).toFixed(1)}x</span>
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
                  <span className="text-neutral-400">{language === 'vi' ? 'Độ trong suốt Logo' : 'Logo Opacity'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{Math.round((track.logoOpacity || 0.9) * 100)}%</span>
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

            {/* Logo Border Color & Presets */}
            <div className="pt-2 border-t border-neutral-800/80">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">{language === 'vi' ? 'Màu viền Logo (Logo Border Color)' : 'Logo Border Color'}</span>
                <span className="font-mono text-[11px] text-cyan-400 font-bold">{track.logoBorderColor || '#06b6d4'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={track.logoBorderColor || '#06b6d4'}
                  onChange={(e) => update({ logoBorderColor: e.target.value })}
                  className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 flex-wrap flex-1">
                  {[
                    { name: 'Xanh Cyan', hex: '#06b6d4' },
                    { name: 'Cam Nổi Bật', hex: '#f97316' },
                    { name: 'Hồng Neon', hex: '#ec4899' },
                    { name: 'Trắng Sáng', hex: '#ffffff' },
                    { name: 'Vàng Kim', hex: '#eab308' },
                    { name: 'Tím Cyber', hex: '#a855f7' },
                    { name: 'Xanh Ngọc', hex: '#10b981' },
                  ].map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => update({ logoBorderColor: col.hex })}
                      style={{ backgroundColor: col.hex }}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                        (track.logoBorderColor || '#06b6d4').toLowerCase() === col.hex.toLowerCase()
                          ? 'border-white scale-110 shadow-md ring-2 ring-cyan-500/50'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Logo Border Width & Radius */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Độ dày viền Logo' : 'Logo Border Width'}</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {(track.logoBorderWidth ?? 0) === 0 ? (language === 'vi' ? 'Tắt viền' : 'None') : `${track.logoBorderWidth}px`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={track.logoBorderWidth ?? 0}
                  onChange={(e) => update({ logoBorderWidth: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{language === 'vi' ? 'Bo góc viền Logo' : 'Logo Border Radius'}</span>
                  <span className="text-cyan-400 font-mono font-bold">{track.logoBorderRadius ?? 12}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={2}
                  value={track.logoBorderRadius ?? 12}
                  onChange={(e) => update({ logoBorderRadius: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Logo Glow */}
            <label className="flex items-center justify-between cursor-pointer pt-1">
              <span className="text-xs text-neutral-300">
                {language === 'vi' ? 'Phát sáng viền Logo theo tiếng Bass' : 'Pulse Logo Glow on Beat'}
              </span>
              <input
                type="checkbox"
                checked={!!track.logoGlow}
                onChange={(e) => update({ logoGlow: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 cursor-pointer"
              />
            </label>

            {/* Logo Animation (xoay 360 theo trục đứng, xoay tròn, etc.) */}
            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <div>
                <span className="text-xs text-neutral-400 block mb-1">
                  {language === 'vi' ? 'Hiệu ứng chuyển động Logo (Animation)' : 'Logo Animation Effect'}
                </span>
                <select
                  value={track.logoAnimation || 'none'}
                  onChange={(e) => update({ logoAnimation: e.target.value as LogoAnimation })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {LOGO_ANIMATIONS.map((anim) => (
                    <option key={anim.id} value={anim.id}>
                      {language === 'vi' ? anim.nameVi : anim.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {track.logoAnimation && track.logoAnimation !== 'none' && (
                <div className="space-y-2.5 pt-1">
                  {/* Direction buttons: Clockwise or Counter-Clockwise */}
                  <div>
                    <span className="text-xs text-neutral-400 block mb-1.5">
                      {language === 'vi' ? 'Hướng xoay Logo (Direction)' : 'Logo Rotation Direction'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => update({ logoAnimationDirection: 'clockwise' })}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          (track.logoAnimationDirection || 'clockwise') === 'clockwise'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/30'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>{language === 'vi' ? 'Theo chiều kim đồng hồ' : 'Clockwise'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => update({ logoAnimationDirection: 'counter-clockwise' })}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          track.logoAnimationDirection === 'counter-clockwise'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/30'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'vi' ? 'Ngược chiều kim đồng hồ' : 'Counter-Clockwise'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">
                        {language === 'vi' ? 'Tốc độ xoay / chuyển động' : 'Animation Speed'}
                      </span>
                      <span className="text-cyan-400 font-mono">{(track.logoAnimationSpeed ?? 1.0).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={3.0}
                      step={0.1}
                      value={track.logoAnimationSpeed ?? 1.0}
                      onChange={(e) => update({ logoAnimationSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 8. Font, Resize Scale, Layout Order, and Typography Customization */}
      {track.cardStyle !== 'hidden' && (
        <div className="space-y-4 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              {language === 'vi' ? 'Bố Cục & Phông Chữ Thông Tin Bài Hát' : 'Track Details Layout & Typography'}
            </label>
            <span className="text-[10px] text-neutral-400 font-medium">
              {language === 'vi' ? 'Đổi thứ tự & hiệu ứng từng dòng' : 'Order & font styling per line'}
            </span>
          </div>

          {/* A. Reorder Layout Section */}
          <div className="space-y-2.5 p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">
                {language === 'vi' ? 'Thứ tự sắp xếp dòng (Layout Order)' : 'Element Layout Order'}
              </span>
              <span className="text-[10px] text-neutral-400">
                {language === 'vi' ? 'Kéo thả hoặc nhấn ▲ ▼ để đảo thứ tự hiển thị' : 'Drag & drop or click ▲ ▼ to rearrange'}
              </span>
            </div>

            {/* List of current order items */}
            <div className="space-y-1.5">
              {(track.trackDetailsOrder && track.trackDetailsOrder.length === 3
                ? track.trackDetailsOrder
                : (['subtitle', 'title', 'artist'] as const)
              ).map((key, idx, arr) => {
                const isSub = key === 'subtitle';
                const isTitle = key === 'title';
                const label = isSub
                  ? { vi: '1. Tiêu đề phụ / Thể loại (Subtitle)', en: '1. Subtitle', color: 'text-sky-400' }
                  : isTitle
                  ? { vi: '2. Tên bài hát chính (Main Title)', en: '2. Main Title', color: 'text-rose-400' }
                  : { vi: '3. Tên ca sĩ / Nghệ sĩ (Artist)', en: '3. Artist Info', color: 'text-amber-400' };
                const isDragging = draggedDetailKey === key;
                const isDragOver = dragOverDetailKey === key;

                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => setDraggedDetailKey(key)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverDetailKey(key);
                    }}
                    onDragEnd={() => {
                      setDraggedDetailKey(null);
                      setDragOverDetailKey(null);
                    }}
                    onDrop={() => {
                      if (!draggedDetailKey || draggedDetailKey === key) {
                        setDraggedDetailKey(null);
                        setDragOverDetailKey(null);
                        return;
                      }
                      const order = track.trackDetailsOrder && track.trackDetailsOrder.length === 3
                        ? [...track.trackDetailsOrder]
                        : ['subtitle', 'title', 'artist'];
                      const fromIdx = order.indexOf(draggedDetailKey as any);
                      const toIdx = order.indexOf(key as any);
                      if (fromIdx !== -1 && toIdx !== -1) {
                        const [item] = order.splice(fromIdx, 1);
                        order.splice(toIdx, 0, item);
                        update({ trackDetailsOrder: order as any });
                      }
                      setDraggedDetailKey(null);
                      setDragOverDetailKey(null);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all select-none ${
                      isDragging ? 'opacity-40 scale-95 border-rose-500 bg-neutral-900' : 'bg-neutral-950/80 border-neutral-800/80'
                    } ${isDragOver ? 'border-cyan-400 ring-2 ring-cyan-400/30' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white p-0.5" title={language === 'vi' ? 'Kéo để đổi thứ tự' : 'Drag to reorder'}>
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-400 font-bold">
                        {idx + 1}
                      </span>
                      <span className={`font-semibold ${label.color}`}>
                        {language === 'vi' ? label.vi : label.en}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const next = [...arr];
                          const [item] = next.splice(idx, 1);
                          next.splice(idx - 1, 0, item);
                          update({ trackDetailsOrder: next as any });
                        }}
                        className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-neutral-300 transition-colors"
                        title={language === 'vi' ? 'Di chuyển lên' : 'Move up'}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => {
                          const next = [...arr];
                          const [item] = next.splice(idx, 1);
                          next.splice(idx + 1, 0, item);
                          update({ trackDetailsOrder: next as any });
                        }}
                        className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer text-neutral-300 transition-colors"
                        title={language === 'vi' ? 'Di chuyển xuống' : 'Move down'}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Layout Presets */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { labelVi: 'Phụ đề > Tên bài > Ca sĩ', labelEn: 'Subtitle > Title > Artist', order: ['subtitle', 'title', 'artist'] },
                { labelVi: 'Tên bài > Ca sĩ > Phụ đề', labelEn: 'Title > Artist > Subtitle', order: ['title', 'artist', 'subtitle'] },
                { labelVi: 'Tên bài > Phụ đề > Ca sĩ', labelEn: 'Title > Subtitle > Artist', order: ['title', 'subtitle', 'artist'] },
                { labelVi: 'Ca sĩ > Tên bài > Phụ đề', labelEn: 'Artist > Title > Subtitle', order: ['artist', 'title', 'subtitle'] },
              ].map((pst, pIdx) => {
                const currentStr = JSON.stringify(
                  track.trackDetailsOrder && track.trackDetailsOrder.length === 3
                    ? track.trackDetailsOrder
                    : ['subtitle', 'title', 'artist']
                );
                const isMatch = currentStr === JSON.stringify(pst.order);
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => update({ trackDetailsOrder: pst.order as any })}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-medium border transition-all cursor-pointer truncate ${
                      isMatch
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {language === 'vi' ? pst.labelVi : pst.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacing Settings between Elements */}
          <div className="space-y-3 p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">
                {language === 'vi' ? 'Khoảng cách giữa các dòng (Line Spacing)' : 'Element Spacing Gaps'}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">px</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">
                    {language === 'vi' ? 'Phụ đề ↔ Tên bài' : 'Subtitle ↔ Title'}
                  </span>
                  <span className="text-rose-400 font-mono font-bold">
                    {track.subtitleTitleGap ?? 6}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={track.subtitleTitleGap ?? 6}
                  onChange={(e) => update({ subtitleTitleGap: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">
                    {language === 'vi' ? 'Tên bài ↔ Ca sĩ' : 'Title ↔ Artist'}
                  </span>
                  <span className="text-rose-400 font-mono font-bold">
                    {track.titleArtistGap ?? 8}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={track.titleArtistGap ?? 8}
                  onChange={(e) => update({ titleArtistGap: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </div>

          {/* B. Sub-tabs to customize each element (Subtitle, Title, Artist) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">
                {language === 'vi' ? 'Tùy chỉnh chi tiết từng thành phần' : 'Customize Element Styles'}
              </span>
            </div>

            {/* Tab switch buttons */}
            <div className={`grid ${hasMultiplePlaylistSongs ? 'grid-cols-4' : 'grid-cols-3'} gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800`}>
              {[
                { id: 'subtitle', labelVi: 'Tiêu đề phụ', labelEn: 'Subtitle', activeColor: 'border-sky-500 text-sky-400 bg-sky-500/10' },
                { id: 'title', labelVi: 'Tiêu đề chính', labelEn: 'Main Title', activeColor: 'border-rose-500 text-rose-400 bg-rose-500/10' },
                { id: 'artist', labelVi: 'Ca sĩ / Artist', labelEn: 'Artist', activeColor: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                ...(hasMultiplePlaylistSongs
                  ? [{ id: 'track-title' as const, labelVi: 'Tên bài hát', labelEn: 'Track Title', activeColor: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' }]
                  : []),
              ].map((tab) => {
                const isActive = selectedDetailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedDetailTab(tab.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer truncate ${
                      isActive
                        ? tab.activeColor
                        : 'border-transparent text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {language === 'vi' ? tab.labelVi : tab.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Customization controls for active element */}
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-3">
              {/* 1. Font Name (Font Family) */}
              <div>
                <span className="text-xs text-neutral-400 block mb-1">
                  {language === 'vi' ? 'Phông chữ riêng' : 'Font Family'}
                </span>
                <div className="relative">
                  <Type className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={
                      selectedDetailTab === 'subtitle'
                        ? track.subtitleFontFamily || track.fontFamily || 'Be Vietnam Pro'
                        : selectedDetailTab === 'title'
                        ? track.titleFontFamily || track.fontFamily || 'Be Vietnam Pro'
                        : selectedDetailTab === 'track-title'
                        ? track.trackTitleFontFamily || track.fontFamily || 'Be Vietnam Pro'
                        : track.artistFontFamily || track.fontFamily || 'Be Vietnam Pro'
                    }
                    onChange={(e) => {
                      if (selectedDetailTab === 'subtitle') update({ subtitleFontFamily: e.target.value });
                      else if (selectedDetailTab === 'title') update({ titleFontFamily: e.target.value, fontFamily: e.target.value });
                      else if (selectedDetailTab === 'track-title') update({ trackTitleFontFamily: e.target.value });
                      else update({ artistFontFamily: e.target.value });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
                  >
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Font Weight & Font Effect in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Font Weight */}
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">
                    {language === 'vi' ? 'Độ đậm chữ (Font Weight)' : 'Font Weight'}
                  </span>
                  <select
                    value={
                      selectedDetailTab === 'subtitle'
                        ? track.subtitleFontWeight || (track.subtitleFontStyle === 'bold' || track.subtitleFontStyle === 'bold-italic' ? 'bold' : 'normal')
                        : selectedDetailTab === 'title'
                        ? track.titleFontWeight || (track.titleFontStyle === 'bold' || track.titleFontStyle === 'bold-italic' || track.titleFontStyle === 'uppercase' ? 'bold' : 'normal')
                        : selectedDetailTab === 'track-title'
                        ? track.trackTitleFontWeight || 'bold'
                        : track.artistFontWeight || (track.artistFontStyle === 'bold' || track.artistFontStyle === 'bold-italic' ? 'bold' : 'normal')
                    }
                    onChange={(e) => {
                      const val = e.target.value as TrackFontWeight;
                      if (selectedDetailTab === 'subtitle') update({ subtitleFontWeight: val });
                      else if (selectedDetailTab === 'title') update({ titleFontWeight: val });
                      else if (selectedDetailTab === 'track-title') update({ trackTitleFontWeight: val });
                      else update({ artistFontWeight: val });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {TRACK_FONT_WEIGHTS.map((wt) => (
                      <option key={wt.id} value={wt.id}>
                        {language === 'vi' ? wt.nameVi : wt.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Effect */}
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">
                    {language === 'vi' ? 'Hiệu ứng chữ (Effect)' : 'Font Effect'}
                  </span>
                  <select
                    value={
                      selectedDetailTab === 'subtitle'
                        ? track.subtitleFontEffect || 'none'
                        : selectedDetailTab === 'title'
                        ? track.titleFontEffect || 'none'
                        : selectedDetailTab === 'track-title'
                        ? track.trackTitleFontEffect || 'none'
                        : track.artistFontEffect || 'none'
                    }
                    onChange={(e) => {
                      const val = e.target.value as any;
                      if (selectedDetailTab === 'subtitle') update({ subtitleFontEffect: val });
                      else if (selectedDetailTab === 'title') update({ titleFontEffect: val });
                      else if (selectedDetailTab === 'track-title') update({ trackTitleFontEffect: val });
                      else update({ artistFontEffect: val });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {TRACK_FONT_EFFECTS.map((ef) => (
                      <option key={ef.id} value={ef.id}>
                        {language === 'vi' ? ef.nameVi : ef.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2b. Italic & Uppercase independent checkboxes */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={
                      selectedDetailTab === 'subtitle'
                        ? (track.subtitleItalic !== undefined ? track.subtitleItalic : (track.subtitleFontStyle === 'italic' || track.subtitleFontStyle === 'bold-italic'))
                        : selectedDetailTab === 'title'
                        ? (track.titleItalic !== undefined ? track.titleItalic : (track.titleFontStyle === 'italic' || track.titleFontStyle === 'bold-italic'))
                        : selectedDetailTab === 'track-title'
                        ? !!track.trackTitleItalic
                        : (track.artistItalic !== undefined ? track.artistItalic : (track.artistFontStyle === 'italic' || track.artistFontStyle === 'bold-italic'))
                    }
                    onChange={(e) => {
                      const chk = e.target.checked;
                      if (selectedDetailTab === 'subtitle') update({ subtitleItalic: chk });
                      else if (selectedDetailTab === 'title') update({ titleItalic: chk });
                      else if (selectedDetailTab === 'track-title') update({ trackTitleItalic: chk });
                      else update({ artistItalic: chk });
                    }}
                    className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-300 font-medium italic">
                    {language === 'vi' ? 'Chữ nghiêng (Italic)' : 'Italic Style'}
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={
                      selectedDetailTab === 'subtitle'
                        ? (track.subtitleUppercase !== undefined ? track.subtitleUppercase : (track.subtitleFontStyle === 'uppercase'))
                        : selectedDetailTab === 'title'
                        ? (track.titleUppercase !== undefined ? track.titleUppercase : (track.titleFontStyle === 'uppercase'))
                        : selectedDetailTab === 'track-title'
                        ? !!track.trackTitleUppercase
                        : (track.artistUppercase !== undefined ? track.artistUppercase : (track.artistFontStyle === 'uppercase'))
                    }
                    onChange={(e) => {
                      const chk = e.target.checked;
                      if (selectedDetailTab === 'subtitle') update({ subtitleUppercase: chk });
                      else if (selectedDetailTab === 'title') update({ titleUppercase: chk });
                      else if (selectedDetailTab === 'track-title') update({ trackTitleUppercase: chk });
                      else update({ artistUppercase: chk });
                    }}
                    className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-300 font-medium font-mono uppercase">
                    {language === 'vi' ? 'In hoa (UPPERCASE)' : 'ALL CAPS'}
                  </span>
                </label>
              </div>

              {/* 3. Font Size Slider with Steppers & Color Picker */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Font Size */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">
                      {language === 'vi' ? 'Cỡ chữ' : 'Font Size'}
                    </span>
                    <span className="text-rose-400 font-mono font-bold">
                      {selectedDetailTab === 'subtitle'
                        ? (track.subtitleFontSize || 13)
                        : selectedDetailTab === 'title'
                        ? (track.titleFontSize || 24)
                        : selectedDetailTab === 'track-title'
                        ? (track.trackTitleFontSize || 18)
                        : (track.artistFontSize || 15)}px
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = selectedDetailTab === 'subtitle' 
                          ? (track.subtitleFontSize || 13) 
                          : selectedDetailTab === 'title' 
                          ? (track.titleFontSize || 24) 
                          : selectedDetailTab === 'track-title'
                          ? (track.trackTitleFontSize || 18)
                          : (track.artistFontSize || 15);
                        const next = Math.max(8, cur - 1);
                        if (selectedDetailTab === 'subtitle') update({ subtitleFontSize: next });
                        else if (selectedDetailTab === 'title') update({ titleFontSize: next });
                        else if (selectedDetailTab === 'track-title') update({ trackTitleFontSize: next });
                        else update({ artistFontSize: next });
                      }}
                      className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={selectedDetailTab === 'subtitle' ? 8 : selectedDetailTab === 'title' ? 12 : 10}
                      max={selectedDetailTab === 'subtitle' ? 42 : selectedDetailTab === 'title' ? 64 : 48}
                      value={
                        selectedDetailTab === 'subtitle'
                          ? (track.subtitleFontSize || 13)
                          : selectedDetailTab === 'title'
                          ? (track.titleFontSize || 24)
                          : selectedDetailTab === 'track-title'
                          ? (track.trackTitleFontSize || 18)
                          : (track.artistFontSize || 15)
                      }
                      onChange={(e) => {
                        const sz = parseInt(e.target.value);
                        if (selectedDetailTab === 'subtitle') update({ subtitleFontSize: sz });
                        else if (selectedDetailTab === 'title') update({ titleFontSize: sz });
                        else if (selectedDetailTab === 'track-title') update({ trackTitleFontSize: sz });
                        else update({ artistFontSize: sz });
                      }}
                      className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const cur = selectedDetailTab === 'subtitle' 
                          ? (track.subtitleFontSize || 13) 
                          : selectedDetailTab === 'title' 
                          ? (track.titleFontSize || 24) 
                          : selectedDetailTab === 'track-title'
                          ? (track.trackTitleFontSize || 18)
                          : (track.artistFontSize || 15);
                        const next = Math.min(64, cur + 1);
                        if (selectedDetailTab === 'subtitle') update({ subtitleFontSize: next });
                        else if (selectedDetailTab === 'title') update({ titleFontSize: next });
                        else if (selectedDetailTab === 'track-title') update({ trackTitleFontSize: next });
                        else update({ artistFontSize: next });
                      }}
                      className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">
                      {language === 'vi' ? 'Màu sắc' : 'Color'}
                    </span>
                    <span className="text-neutral-300 font-mono text-[11px]">
                      {selectedDetailTab === 'subtitle'
                        ? (track.subtitleColor || '#a3a3a3')
                        : selectedDetailTab === 'title'
                        ? (track.textColor || '#ffffff')
                        : selectedDetailTab === 'track-title'
                        ? (track.trackTitleColor || '#ffffff')
                        : (track.artistColor || '#cccccc')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
                    <input
                      type="color"
                      value={
                        selectedDetailTab === 'subtitle'
                          ? (track.subtitleColor || '#a3a3a3')
                          : selectedDetailTab === 'title'
                          ? (track.textColor || '#ffffff')
                          : selectedDetailTab === 'track-title'
                          ? (track.trackTitleColor || '#ffffff')
                          : (track.artistColor || '#cccccc')
                      }
                      onChange={(e) => {
                        const col = e.target.value;
                        if (selectedDetailTab === 'subtitle') update({ subtitleColor: col });
                        else if (selectedDetailTab === 'title') update({ textColor: col });
                        else if (selectedDetailTab === 'track-title') update({ trackTitleColor: col });
                        else update({ artistColor: col });
                      }}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {['#ffffff', '#f87171', '#facc15', '#38bdf8', '#fb923c', '#e879f9', '#a3a3a3'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            if (selectedDetailTab === 'subtitle') update({ subtitleColor: c });
                            else if (selectedDetailTab === 'title') update({ textColor: c });
                            else if (selectedDetailTab === 'track-title') update({ trackTitleColor: c });
                            else update({ artistColor: c });
                          }}
                          style={{ backgroundColor: c }}
                          className="w-4 h-4 rounded-full border border-neutral-700 hover:scale-110 transition-transform cursor-pointer"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Live Font Preview Card */}
              {(() => {
                const curFamily = selectedDetailTab === 'subtitle'
                  ? (track.subtitleFontFamily || track.fontFamily || 'Be Vietnam Pro')
                  : selectedDetailTab === 'title'
                  ? (track.titleFontFamily || track.fontFamily || 'Be Vietnam Pro')
                  : selectedDetailTab === 'track-title'
                  ? (track.trackTitleFontFamily || track.fontFamily || 'Be Vietnam Pro')
                  : (track.artistFontFamily || track.fontFamily || 'Be Vietnam Pro');
                const curStyle = selectedDetailTab === 'subtitle'
                  ? (track.subtitleFontStyle || 'normal')
                  : selectedDetailTab === 'title'
                  ? (track.titleFontStyle || 'bold')
                  : selectedDetailTab === 'track-title'
                  ? (track.trackTitleFontStyle || 'bold')
                  : (track.artistFontStyle || 'normal');
                const curWeight = selectedDetailTab === 'subtitle'
                  ? (track.subtitleFontWeight || 'normal')
                  : selectedDetailTab === 'title'
                  ? (track.titleFontWeight || 'bold')
                  : selectedDetailTab === 'track-title'
                  ? (track.trackTitleFontWeight || 'bold')
                  : (track.artistFontWeight || 'normal');
                const isItalicVal = selectedDetailTab === 'subtitle'
                  ? (track.subtitleItalic !== undefined ? track.subtitleItalic : curStyle === 'italic')
                  : selectedDetailTab === 'title'
                  ? (track.titleItalic !== undefined ? track.titleItalic : curStyle === 'italic')
                  : selectedDetailTab === 'track-title'
                  ? !!track.trackTitleItalic
                  : (track.artistItalic !== undefined ? track.artistItalic : curStyle === 'italic');
                const isUpperVal = selectedDetailTab === 'subtitle'
                  ? (track.subtitleUppercase !== undefined ? track.subtitleUppercase : curStyle === 'uppercase')
                  : selectedDetailTab === 'title'
                  ? (track.titleUppercase !== undefined ? track.titleUppercase : curStyle === 'uppercase')
                  : selectedDetailTab === 'track-title'
                  ? !!track.trackTitleUppercase
                  : (track.artistUppercase !== undefined ? track.artistUppercase : curStyle === 'uppercase');
                const curSize = selectedDetailTab === 'subtitle'
                  ? (track.subtitleFontSize || 13)
                  : selectedDetailTab === 'title'
                  ? (track.titleFontSize || 24)
                  : selectedDetailTab === 'track-title'
                  ? (track.trackTitleFontSize || 18)
                  : (track.artistFontSize || 15);
                const curColor = selectedDetailTab === 'subtitle'
                  ? (track.subtitleColor || '#fb923c')
                  : selectedDetailTab === 'title'
                  ? (track.textColor || '#ffffff')
                  : selectedDetailTab === 'track-title'
                  ? (track.trackTitleColor || '#ffffff')
                  : (track.artistColor || '#cccccc');
                const sampleText = selectedDetailTab === 'subtitle'
                  ? (track.subtitle || 'Audio Experience')
                  : selectedDetailTab === 'title'
                  ? (track.title || 'SonaWave Music Title')
                  : selectedDetailTab === 'track-title'
                  ? activePlayingTitle
                  : (track.artist || 'Artist / Producer');

                return (
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-center overflow-hidden">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">
                      {language === 'vi' ? 'Xem trước phông chữ & kiểu' : 'Live Font & Style Preview'}
                    </span>
                    <p
                      style={{
                        fontFamily: `'${curFamily}', sans-serif`,
                        fontSize: `${Math.min(Math.max(curSize, 13), 26)}px`,
                        fontWeight: curWeight === 'bold' || curWeight === '900' || curStyle === 'bold' ? 700 : 400,
                        fontStyle: isItalicVal ? 'italic' : 'normal',
                        textTransform: isUpperVal ? 'uppercase' : 'none',
                        color: curColor,
                      }}
                      className="truncate px-2"
                    >
                      {sampleText}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* C. Global Typography Controls: Scale, Alignment, Accent Color */}
          <div className="space-y-3 pt-2 border-t border-neutral-800/60">
            {/* Resize Scale Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">
                  {language === 'vi' ? 'Kích thước tổng thể (Resize Scale)' : 'Overall Scale (Resize)'}
                </span>
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

            {/* Text Alignment */}
            <div>
              <span className="text-xs text-neutral-400 block mb-1.5">
                {language === 'vi' ? 'Căn chỉnh lề chữ' : 'Text Alignment'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'left', name: language === 'vi' ? 'Căn Trái' : 'Left', icon: AlignLeft },
                    { id: 'center', name: language === 'vi' ? 'Căn Giữa' : 'Center', icon: AlignCenter },
                    { id: 'right', name: language === 'vi' ? 'Căn Phải' : 'Right', icon: AlignRight },
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

            {/* Accent Color Picker */}
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">
                {language === 'vi' ? 'Màu Điểm Nhấn (Accent / Glow)' : 'Accent / Highlight Color'}
              </span>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
                <input
                  type="color"
                  value={track.accentColor || '#ec4899'}
                  onChange={(e) => update({ accentColor: e.target.value })}
                  className="w-6 h-6 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] font-mono text-neutral-300">
                  {track.accentColor || '#ec4899'}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {['#ec4899', '#f97316', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => update({ accentColor: c })}
                      style={{ backgroundColor: c }}
                      className="w-4 h-4 rounded-full border border-neutral-700 cursor-pointer hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Position X & Position Y with 2D Drag & Drop Pad */}
          <div className="space-y-3 pt-2">
            <Position2DPad
              x={track.positionX !== undefined ? track.positionX : 50}
              y={track.positionY !== undefined ? track.positionY : 28}
              onChange={(newX, newY) => update({ positionX: newX, positionY: newY })}
              label={language === 'vi' ? 'Kéo Thả Vị Trí Chi Tiết Bài Hát (Drag & Drop)' : 'Track Details Drag & Drop Position'}
              color="#f43f5e"
              language={language}
            />

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">
                  {language === 'vi' ? 'Vị trí ngang (Tọa độ X)' : 'Horizontal Position (X)'}
                </span>
                <span className="text-rose-400 font-mono font-bold">{track.positionX !== undefined ? track.positionX : 50}%</span>
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
                <span className="text-neutral-400">
                  {language === 'vi' ? 'Vị trí dọc (Tọa độ Y)' : 'Vertical Position (Y)'}
                </span>
                <span className="text-rose-400 font-mono font-bold">{track.positionY}%</span>
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
              <span className="text-xs font-semibold text-neutral-300">
                {language === 'vi' ? 'Khung nền mờ cho chữ (Backdrop Pill)' : 'Text Backdrop Pill'}
              </span>
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
                  <span className="text-[11px] font-mono text-neutral-400">
                    {language === 'vi' ? 'Màu nền khung' : 'Pill Background Color'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Rotate vinyl toggle & speed */}
          {track.cardStyle === 'vinyl' && (
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={track.rotateVinyl}
                  onChange={(e) => update({ rotateVinyl: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
                />
                <div>
                  <span className="text-xs font-semibold text-neutral-200 block">
                    {language === 'vi' ? 'Xoay đĩa than 360° khi phát nhạc' : 'Rotate Vinyl 360° During Playback'}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {language === 'vi' ? 'Tự động tăng tốc độ quay theo cường độ âm Bass' : 'Spin rate pulses dynamically with bass beats'}
                  </span>
                </div>
              </label>

              {track.rotateVinyl && (
                <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-rose-400" />
                      {language === 'vi' ? 'Tốc độ xoay đĩa than' : 'Vinyl Rotation Speed'}
                    </span>
                    <span className="text-rose-400 font-mono font-bold">{(track.vinylSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    value={track.vinylSpeed ?? 1.0}
                    onChange={(e) => update({ vinylSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex items-center gap-1.5">
                    {[0.2, 0.5, 1.0, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => update({ vinylSpeed: spd })}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          (track.vinylSpeed ?? 1.0) === spd
                            ? 'bg-rose-500 text-white font-bold'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {spd.toFixed(1)}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
