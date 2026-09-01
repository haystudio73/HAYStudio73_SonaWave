import React, { useRef, useState, useMemo } from 'react';
import { LyricsConfig, LyricLine, LyricsStyle, LyricsFontEffect, KaraokeSweepMode } from '../types';
import { 
  parseAnyLyrics, 
  exportToSRT, 
  formatTimeSub,
  validateLyricsTimings,
  autoFixLyricsOverlaps
} from '../utils/lyricsParser';
import { AVAILABLE_FONTS } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Clock,
  Play,
  Copy,
  ArrowUpDown,
  Wrench,
  Search,
  Check,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Calendar,
  Star,
  CircleDot
} from 'lucide-react';

interface LyricsTabProps {
  config: LyricsConfig;
  onChange: (config: LyricsConfig) => void;
  lyrics: LyricLine[];
  onLyricsChange: (lyrics: LyricLine[]) => void;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  language?: Language;
}

const STYLES: { id: LyricsStyle; labelVi: string; desc: string; badge?: string }[] = [
  { id: 'karaoke-single', labelVi: 'Karaoke 1 Dòng', desc: '1 dòng duy nhất quét màu mượt mà + hiệu ứng theo nhịp', badge: 'Hot Trend' },
  { id: 'teleprompter-4lines', labelVi: 'Karaoke 4 Dòng (Tự Cuộn)', desc: '4 dòng liên tục tự động cuộn mượt mà như máy nhắc chữ', badge: 'Mới' },
  { id: 'karaoke', labelVi: 'Karaoke 3 Dòng', desc: '3 dòng kinh điển: dòng trước, dòng đang hát & dòng kế tiếp' },
  { id: 'subtitle-bar', labelVi: 'Thanh Phụ Đề Mờ', desc: 'Hộp bo góc frosted glass tối giản hiện đại' },
  { id: 'minimal-glow', labelVi: 'Phát Sáng Tối Giản', desc: 'Font chữ sắc nét phát sáng hào quang nhẹ nhàng' },
];

const KARAOKE_SWEEP_MODES: { id: KaraokeSweepMode; labelVi: string; desc: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
  { 
    id: 'color-only', 
    labelVi: 'Chỉ Đổi Màu', 
    desc: 'Quét màu mượt mà chuẩn xác, phong cách tối giản & tinh tế', 
    icon: Sparkles,
  },
  { 
    id: 'star-flying', 
    labelVi: 'Sao vàng bay+đổi màu', 
    desc: 'Ngôi sao vàng 5 cánh phát sáng bay lượn & nảy theo từng từ', 
    icon: Star,
    badge: 'Kinh Điển ⭐'
  },
  { 
    id: 'bouncing-ball', 
    labelVi: 'Quả bóng nhỏ bay+đổi màu', 
    desc: 'Quả bóng tròn phát sáng nảy bồng bềnh nhịp nhàng trên từng từ', 
    icon: CircleDot,
    badge: 'Vui Nhộn ⚪'
  },
];

const FONT_EFFECTS: { id: LyricsFontEffect; name: string; desc: string }[] = [
  { id: 'none', name: 'Mặc định (Không)', desc: 'Chữ tiêu chuẩn viền bóng nhẹ' },
  { id: 'neon-glow', name: '⚡ Neon Laser Phát Sáng', desc: 'Hào quang neon rực rỡ bùng nổ theo nhịp beat' },
  { id: 'double-stroke', name: '🖋️ Viền Đôi Tương Phản', desc: 'Viền ngoài đen đậm + viền trong phát sáng chống chìm nền' },
  { id: '3d-shadow', name: '🏔️ Đổ Bóng Nổi 3D', desc: 'Hiệu ứng khối 3D đổ bóng đa tầng sâu thẳm' },
  { id: 'gradient-fill', name: '🌈 Dải Màu Gradient', desc: 'Tô màu chuyển sắc dọc êm dịu cao cấp' },
  { id: 'metallic-chrome', name: '💿 Kim Loại Chrome Ánh Kim', desc: 'Hiệu ứng phản chiếu kim loại bóng bẩy' },
  { id: 'comic-pop', name: '💥 Hoạt Hình Comic Pop', desc: 'Phong cách sticker hoạt họa viền đen cực nét' },
];

export const LyricsTab: React.FC<LyricsTabProps> = ({
  config,
  onChange,
  lyrics,
  onLyricsChange,
  currentTime,
  duration,
  onSeek,
  language = 'vi',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.vi;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ID of the line currently being edited in the Popup Modal
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  const update = (partial: Partial<LyricsConfig>) => {
    onChange({ ...config, ...partial });
  };

  // Timing Validation Calculation
  const timingValidation = useMemo(() => {
    return validateLyricsTimings(lyrics);
  }, [lyrics]);

  // Currently editing line object and index
  const editingIndex = useMemo(() => {
    if (!editingLineId) return -1;
    return lyrics.findIndex((l) => l.id === editingLineId);
  }, [lyrics, editingLineId]);

  const editingLine = useMemo(() => {
    if (editingIndex < 0) return null;
    return lyrics[editingIndex];
  }, [lyrics, editingIndex]);

  const prevLineInModal = useMemo(() => {
    if (editingIndex <= 0) return null;
    return lyrics[editingIndex - 1];
  }, [lyrics, editingIndex]);

  const nextLineInModal = useMemo(() => {
    if (editingIndex < 0 || editingIndex >= lyrics.length - 1) return null;
    return lyrics[editingIndex + 1];
  }, [lyrics, editingIndex]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsed = parseAnyLyrics(content, duration || 60);
        onLyricsChange(parsed);
        showToast(
          language === 'vi' 
            ? `Đã nạp thành công ${parsed.length} câu lời bài hát!` 
            : `Loaded ${parsed.length} lyric lines!`
        );
      }
    };
    reader.readAsText(file);
  };

  const handleShiftTime = (seconds: number) => {
    const shifted = lyrics.map((line) => ({
      ...line,
      startTime: Math.max(0, parseFloat((line.startTime + seconds).toFixed(2))),
      endTime: Math.max(0.5, parseFloat((line.endTime + seconds).toFixed(2))),
    }));
    onLyricsChange(shifted);
    showToast(
      language === 'vi' 
        ? `Đã dịch chuyển thời gian ${seconds > 0 ? '+' : ''}${seconds}s cho toàn bộ câu hát` 
        : `Shifted all lines by ${seconds > 0 ? '+' : ''}${seconds}s`
    );
  };

  const handleAddLine = () => {
    const start = parseFloat(currentTime.toFixed(2));
    const end = parseFloat((currentTime + 4).toFixed(2));
    const newLineId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newLine: LyricLine = {
      id: newLineId,
      startTime: start,
      endTime: end,
      text: language === 'vi' ? 'Lời bài hát mới...' : 'New lyric line...',
    };
    const updated = [...lyrics, newLine].sort((a, b) => a.startTime - b.startTime);
    onLyricsChange(updated);
    // Automatically open edit time popup for the new line
    setEditingLineId(newLineId);
    showToast(language === 'vi' ? 'Đã thêm câu hát mới!' : 'Added new lyric line!');
  };

  const handleDuplicateLine = (line: LyricLine) => {
    const newLine: LyricLine = {
      ...line,
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      startTime: parseFloat((line.endTime + 0.1).toFixed(2)),
      endTime: parseFloat((line.endTime + (line.endTime - line.startTime) + 0.1).toFixed(2)),
    };
    const updated = [...lyrics, newLine].sort((a, b) => a.startTime - b.startTime);
    onLyricsChange(updated);
    showToast(language === 'vi' ? 'Đã nhân bản câu hát!' : 'Duplicated lyric line!');
  };

  const handleUpdateLineText = (id: string, newText: string) => {
    onLyricsChange(lyrics.map((l) => (l.id === id ? { ...l, text: newText } : l)));
  };

  const handleUpdateLineStartTime = (id: string, newStart: number) => {
    const clamped = Math.max(0, parseFloat(newStart.toFixed(2)));
    onLyricsChange(
      lyrics.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          startTime: clamped,
          endTime: l.endTime <= clamped ? parseFloat((clamped + 2.0).toFixed(2)) : l.endTime,
        };
      })
    );
  };

  const handleUpdateLineEndTime = (id: string, newEnd: number) => {
    const clamped = Math.max(0, parseFloat(newEnd.toFixed(2)));
    onLyricsChange(
      lyrics.map((l) => (l.id === id ? { ...l, endTime: clamped } : l))
    );
  };

  const handleDeleteLine = (id: string) => {
    if (editingLineId === id) {
      setEditingLineId(null);
    }
    onLyricsChange(lyrics.filter((l) => l.id !== id));
  };

  // Auto-Fix all overlaps across all lines
  const handleAutoFixAllOverlaps = () => {
    const fixed = autoFixLyricsOverlaps(lyrics);
    onLyricsChange(fixed);
    showToast(
      language === 'vi' 
        ? 'Đã tự động sửa sạch toàn bộ lỗi chồng lấn thời gian (Gap Over)!' 
        : 'Auto-fixed all timing overlaps and gap errors!'
    );
  };

  // Sort by startTime
  const handleSortByTime = () => {
    const sorted = [...lyrics].sort((a, b) => a.startTime - b.startTime);
    onLyricsChange(sorted);
    showToast(language === 'vi' ? 'Đã sắp xếp danh sách theo thời gian!' : 'Sorted lyrics by start time!');
  };

  const handleExportSRT = () => {
    const srtText = exportToSRT(lyrics);
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lyrics_export.srt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter lyrics for search
  const filteredLyrics = useMemo(() => {
    if (!searchQuery.trim()) return lyrics;
    const q = searchQuery.toLowerCase();
    return lyrics.filter((l) => l.text.toLowerCase().includes(q));
  }, [lyrics, searchQuery]);

  return (
    <div className="space-y-6 text-neutral-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Master Toggle & Upload Actions */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {t.enableLyrics || 'Hiển Thị Lời Bài Hát (Lyrics)'}
              </h4>
              <p className="text-[11px] text-neutral-400">
                {lyrics.length > 0 ? `Đã nạp ${lyrics.length} câu hát` : 'Chưa có file lyrics'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* Upload & Export Buttons */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt,.lrc,.txt"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadLrcSrt || 'Tải File .SRT / .LRC'}</span>
          </button>

          <button
            onClick={handleExportSRT}
            disabled={lyrics.length === 0}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs font-medium transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportLyricsSrt || 'Xuất file .SRT'}</span>
          </button>
        </div>
      </div>

      {/* 2. Lyrics Display Style */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          {t.lyricsStyle || 'Kiểu Hiệu Ứng Lời Bài Hát (Style)'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => update({ style: st.id })}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                config.style === st.id
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-md ring-1 ring-purple-500/30'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">{st.labelVi}</span>
                {st.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[9px] font-bold text-rose-300">
                    {st.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                {st.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2.5 DEDICATED KARAOKE SWEEP & FLYING EFFECT MODE */}
      {(config.style === 'karaoke-single' || config.style === 'teleprompter-4lines' || config.style === 'karaoke') && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-neutral-900 to-amber-950/30 border border-purple-500/30 space-y-3 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Cách Chạy Chữ Karaoke (Karaoke Sweep Mode)
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              3 Tùy Chọn Mới
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {KARAOKE_SWEEP_MODES.map((km) => {
              const IconComp = km.icon;
              const isSelected = (config.karaokeSweepMode || 'star-flying') === km.id;
              return (
                <button
                  key={km.id}
                  type="button"
                  onClick={() => update({ karaokeSweepMode: km.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-500/40'
                      : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-200' : 'text-neutral-200'}`}>
                          {km.labelVi}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 block leading-tight">
                      {km.desc}
                    </span>
                  </div>

                  {km.badge && (
                    <div className="mt-2 pt-1.5 border-t border-neutral-800/60 flex justify-end">
                      <span className="text-[9px] font-semibold text-amber-300">
                        {km.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Special Font Effects */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            {t.fontEffect || 'Hiệu Ứng Chữ Đặc Biệt (Font Effect)'}
          </label>
          {config.fontEffect && config.fontEffect !== 'none' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
              Đang bật
            </span>
          )}
        </div>

        <select
          value={config.fontEffect || 'none'}
          onChange={(e) => update({ fontEffect: e.target.value as LyricsFontEffect })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
        >
          {FONT_EFFECTS.map((eff) => (
            <option key={eff.id} value={eff.id}>
              {eff.name}
            </option>
          ))}
        </select>

        {config.fontEffect && config.fontEffect !== 'none' && (
          <div className="grid grid-cols-2 gap-2 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">Màu hiệu ứng / viền</span>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5">
                <input
                  type="color"
                  value={config.fontEffectColor || config.glowColor || '#ec4899'}
                  onChange={(e) => update({ fontEffectColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono uppercase">{config.fontEffectColor || config.glowColor}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">{t.strokeWidth || 'Độ dày viền'}</span>
                <span className="text-purple-400 font-mono">{config.strokeWidth || 2}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={config.strokeWidth || 2}
                onChange={(e) => update({ strokeWidth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Typography & Font Style Settings */}
      <div className="space-y-4 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          {t.fontFamily || 'Phông Chữ & Kiểu Dáng (Font Style)'}
        </label>

        {/* Font Family */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1">Phông chữ (Google Fonts hỗ trợ Tiếng Việt)</span>
          <select
            value={config.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
          >
            {AVAILABLE_FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Weight & Font Style */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-neutral-400 block mb-1">{t.fontWeight || 'Độ đậm'}</span>
            <select
              value={config.fontWeight || 'bold'}
              onChange={(e) => update({ fontWeight: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
            >
              <option value="400">400 - Bình thường</option>
              <option value="500">500 - Trung bình</option>
              <option value="600">600 - Đậm vừa</option>
              <option value="bold">700 - Đậm (Bold)</option>
              <option value="900">900 - Siêu đậm (Black)</option>
            </select>
          </div>

          <div>
            <span className="text-xs text-neutral-400 block mb-1">{t.fontStyle || 'Kiểu chữ'}</span>
            <select
              value={config.fontStyle || 'normal'}
              onChange={(e) => update({ fontStyle: e.target.value as 'normal' | 'italic' })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
            >
              <option value="normal">Thẳng đứng (Regular)</option>
              <option value="italic">Chữ nghiêng (Italic)</option>
            </select>
          </div>
        </div>

        {/* Font Size & Position Y */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{t.fontSize || 'Cỡ chữ'}</span>
              <span className="text-purple-400 font-mono">{config.fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={44}
              value={config.fontSize}
              onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{t.lyricsPosition || 'Vị trí dọc'}</span>
              <span className="text-purple-400 font-mono">{config.positionY}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={88}
              value={config.positionY}
              onChange={(e) => update({ positionY: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">{t.activeTextColor || 'Màu câu đang hát'}</span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5">
              <input
                type="color"
                value={config.activeColor}
                onChange={(e) => update({ activeColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono uppercase">{config.activeColor}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">{t.textGlowColor || 'Màu hào quang (Glow)'}</span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5">
              <input
                type="color"
                value={config.glowColor}
                onChange={(e) => update({ glowColor: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono uppercase">{config.glowColor}</span>
            </div>
          </div>
        </div>

        {/* Container Pill Background & Underline */}
        <div className="grid grid-cols-2 gap-2 bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-800">
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showBackgroundPill || false}
              onChange={(e) => update({ showBackgroundPill: e.target.checked })}
              className="rounded text-purple-500 focus:ring-purple-500 bg-neutral-800 border-neutral-700"
            />
            <span>Khung nền bo góc (Pill)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.textDecoration === 'underline'}
              onChange={(e) => update({ textDecoration: e.target.checked ? 'underline' : 'none' })}
              className="rounded text-purple-500 focus:ring-purple-500 bg-neutral-800 border-neutral-700"
            />
            <span>Gạch chân chữ</span>
          </label>
        </div>

        {/* Text Alignment & Uppercase */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                onClick={() => update({ alignment: align })}
                className={`p-1.5 rounded-lg transition-all ${
                  config.alignment === align ? 'bg-purple-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.textTransform === 'uppercase'}
              onChange={(e) => update({ textTransform: e.target.checked ? 'uppercase' : 'none' })}
              className="rounded text-purple-500 focus:ring-purple-500 bg-neutral-800 border-neutral-700"
            />
            <span>IN HOA TOÀN BỘ</span>
          </label>
        </div>
      </div>

      {/* 5. Clean Lyrics List with Compact Time Badges & Edit Popup Button */}
      <div className="space-y-4 pt-3 border-t border-neutral-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {t.syncLyricsTime || 'Danh Sách Lời Bài Hát & Căn Chỉnh Time'}
            </label>
            <p className="text-[11px] text-neutral-400">
              {lyrics.length > 0 
                ? `Tổng cộng ${lyrics.length} câu • Vị trí: ${formatTimeSub(currentTime)}`
                : 'Chưa có dữ liệu lời bài hát'}
            </p>
          </div>

          {/* Quick global actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-1.5 py-0.5">
              <span className="text-[10px] text-neutral-400 mr-1">Shift:</span>
              <button
                onClick={() => handleShiftTime(-0.5)}
                title="Lùi toàn bộ 0.5 giây"
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300 transition-colors"
              >
                -0.5s
              </button>
              <button
                onClick={() => handleShiftTime(0.5)}
                title="Tiến toàn bộ 0.5 giây"
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-mono text-neutral-300 ml-1 transition-colors"
              >
                +0.5s
              </button>
            </div>

            <button
              onClick={handleSortByTime}
              title={t.sortByTime || 'Sắp xếp theo thời gian'}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors flex items-center gap-1"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] hidden sm:inline">{t.sortByTime || 'Sắp xếp'}</span>
            </button>

            <button
              onClick={handleAddLine}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addLyricLine || 'Thêm câu'}</span>
            </button>
          </div>
        </div>

        {/* Global Warning Banner for Overlaps or Inverted Timings */}
        {timingValidation.hasIssues && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/60 rounded-2xl space-y-2 animate-fade-in shadow-md shadow-amber-950/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold">
                  {language === 'vi'
                    ? `Phát hiện ${timingValidation.overlapCount} câu bị chồng lấn thời gian (Gap Over) & ${timingValidation.errorCount} lỗi thứ tự!`
                    : `Detected ${timingValidation.overlapCount} overlap (Gap Over) issues & ${timingValidation.errorCount} timing errors!`}
                </span>
              </div>

              <button
                onClick={handleAutoFixAllOverlaps}
                className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
                title="Tự động căn chỉnh và khử chồng lấn thời gian giữa các câu liên tiếp"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{t.autoFixOverlaps || 'Tự Động Sửa Chồng Lấn'}</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              {language === 'vi'
                ? 'Khi 2 câu hát bị chồng lấn, chữ sẽ bị nhảy hoặc hiển thị trùng lặp. Nhấn nút "Tự Động Sửa Chồng Lấn" ở trên để tự động căn chỉnh hoàn hảo.'
                : 'Overlapped timing causes lyrics to collide. Click "Auto-Fix Overlaps" to synchronize consecutive start/end boundaries automatically.'}
            </p>
          </div>
        )}

        {/* Search & Filter Bar */}
        {lyrics.length > 5 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchLyricsPlaceholder || 'Tìm kiếm câu hát nhanh...'}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-neutral-200"
              >
                Xóa
              </button>
            )}
          </div>
        )}

        {/* Clean, Non-Cluttered List of Lyric Lines */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredLyrics.length === 0 ? (
            <div className="text-center py-8 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl">
              <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">
                {searchQuery ? 'Không tìm thấy câu hát phù hợp' : 'Chưa có lời bài hát nào'}
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Tải lên file .SRT hoặc bấm "Thêm câu" để bắt đầu soạn thảo!
              </p>
            </div>
          ) : (
            filteredLyrics.map((line) => {
              const originalIndex = lyrics.findIndex((l) => l.id === line.id);
              const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
              const issue = timingValidation.issueMap[line.id];
              const lineDuration = Math.max(0, line.endTime - line.startTime);

              return (
                <div
                  key={line.id}
                  className={`p-2.5 rounded-2xl border transition-all space-y-2 relative overflow-hidden ${
                    issue?.type === 'inverted'
                      ? 'bg-rose-950/30 border-rose-500/80 shadow-md ring-1 ring-rose-500/30'
                      : issue?.type === 'overlap'
                      ? 'bg-amber-950/20 border-amber-500/70 shadow-md ring-1 ring-amber-500/20'
                      : isActive
                      ? 'bg-purple-500/15 border-purple-500/80 shadow-md ring-1 ring-purple-500/40'
                      : 'bg-neutral-900/75 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Top Row: Index, Play button, Lyric text, Duplicate, Delete */}
                  <div className="flex items-center gap-2">
                    {/* Index & Play */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                        isActive
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        #{originalIndex + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => onSeek?.(line.startTime)}
                        title={t.playFromHere || 'Phát từ câu này'}
                        className="p-1 rounded-lg bg-neutral-800/90 hover:bg-purple-600 text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>

                    {/* Lyric Text Input */}
                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => handleUpdateLineText(line.id, e.target.value)}
                      placeholder="Nội dung lời câu hát..."
                      className="flex-1 bg-neutral-950/60 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 focus:text-white font-medium"
                    />

                    {/* Duplicate & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDuplicateLine(line)}
                        title={t.duplicateLine || 'Nhân bản dòng này'}
                        className="p-1 rounded-lg text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLine(line.id)}
                        title={t.deleteLyricLine || 'Xóa dòng'}
                        className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Clean Time Badge + Sửa Time Button + Overlap Alert */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/60 text-xs">
                    {/* Time Summary Badge */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] font-mono">
                        <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="text-purple-300 font-semibold">{formatTimeSub(line.startTime)}</span>
                        <span className="text-neutral-500">➔</span>
                        <span className="text-rose-300 font-semibold">{formatTimeSub(line.endTime)}</span>
                        <span className="text-neutral-400 text-[10px] pl-1 font-sans">({lineDuration.toFixed(1)}s)</span>
                      </div>

                      {/* Overlap / Inverted Warning Chip */}
                      {issue && (
                        issue.type === 'inverted' ? (
                          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-500/20 px-1.5 py-0.5 rounded-md border border-rose-500/40">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Lỗi Start &gt; End</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-500/40">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Chồng lấn -{issue.diffSeconds.toFixed(1)}s</span>
                          </span>
                        )
                      )}
                    </div>

                    {/* Prominent "Sửa Time" Popup Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setEditingLineId(line.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{t.editTimeBtn || 'Sửa Time'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. DEDICATED POPUP MODAL WINDOW FOR EDITING LINE TIMING */}
      {editingLine && editingIndex >= 0 && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setEditingLineId(null)}
        >
          <div 
            className="w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 shadow-2xl space-y-5 text-neutral-100 relative animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                  Câu #{editingIndex + 1} / {lyrics.length}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {t.editTimeModalTitle || 'Chỉnh Sửa Thời Gian Câu Hát'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Căn chỉnh thời điểm bắt đầu &amp; kết thúc chuẩn xác từng mili-giây
                  </p>
                </div>
              </div>

              {/* Navigation & Close */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={editingIndex <= 0}
                  onClick={() => setEditingLineId(lyrics[editingIndex - 1].id)}
                  title={t.prevLineBtn || 'Câu trước'}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={editingIndex >= lyrics.length - 1}
                  onClick={() => setEditingLineId(lyrics[editingIndex + 1].id)}
                  title={t.nextLineBtn || 'Câu sau'}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingLineId(null)}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-600/80 text-neutral-400 hover:text-white transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lyric Content Banner with Playback Test */}
            <div className="p-3.5 bg-neutral-950/80 rounded-2xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Nội dung câu hát
                </span>
                <button
                  type="button"
                  onClick={() => onSeek?.(editingLine.startTime)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t.playFromHere || 'Phát thử câu này'}</span>
                </button>
              </div>
              <p className="text-sm font-semibold text-neutral-100 italic bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/60">
                "{editingLine.text}"
              </p>
            </div>

            {/* Current Player Time Real-Time Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-950/50 border border-neutral-800/80 text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-neutral-400">{t.currentPlaybackTime || 'Thời gian đang phát'}:</span>
                <span className="font-mono font-bold text-emerald-300 text-sm">{formatTimeSub(currentTime)}</span>
                <span className="text-neutral-500 font-mono text-[11px]">({currentTime.toFixed(2)}s)</span>
              </div>
            </div>

            {/* START TIME PRECISION CONTROLLER */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                  {t.timeStart || 'Thời Gian Bắt Đầu (Start Time)'}
                </span>
                <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                  {formatTimeSub(editingLine.startTime)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={editingLine.startTime}
                    onChange={(e) => handleUpdateLineStartTime(editingLine.id, parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-900 border border-purple-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">giây</span>
                </div>

                {/* Quick current time anchor */}
                <button
                  type="button"
                  onClick={() => handleUpdateLineStartTime(editingLine.id, currentTime)}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                  title="Gán thời gian bắt đầu = vị trí đang phát của bài hát"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>= Hiện tại ({formatTimeSub(currentTime)})</span>
                </button>
              </div>

              {/* Fast Stepper Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateLineStartTime(editingLine.id, editingLine.startTime - 1.0)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    -1.0s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLineStartTime(editingLine.id, editingLine.startTime - 0.1)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLineStartTime(editingLine.id, editingLine.startTime + 0.1)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLineStartTime(editingLine.id, editingLine.startTime + 1.0)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    +1.0s
                  </button>
                </div>

                {/* Snap to Previous Line End Time */}
                {prevLineInModal && (
                  <button
                    type="button"
                    onClick={() => handleUpdateLineStartTime(editingLine.id, prevLineInModal.endTime)}
                    className="text-[11px] text-purple-300 hover:text-white underline font-medium"
                    title={`Khớp ngay sau câu #${editingIndex} (lúc ${formatTimeSub(prevLineInModal.endTime)})`}
                  >
                    Khớp câu trước ({formatTimeSub(prevLineInModal.endTime)})
                  </button>
                )}
              </div>
            </div>

            {/* END TIME PRECISION CONTROLLER */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  {t.timeEnd || 'Thời Gian Kết Thúc (End Time)'}
                </span>
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                  {formatTimeSub(editingLine.endTime)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={editingLine.endTime}
                    onChange={(e) => handleUpdateLineEndTime(editingLine.id, parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-900 border border-rose-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">giây</span>
                </div>

                {/* Quick current time anchor */}
                <button
                  type="button"
                  onClick={() => handleUpdateLineEndTime(editingLine.id, currentTime)}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                  title="Gán thời gian kết thúc = vị trí đang phát của bài hát"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>= Hiện tại ({formatTimeSub(currentTime)})</span>
                </button>
              </div>

              {/* Fast Stepper Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateLineEndTime(editingLine.id, editingLine.endTime - 1.0)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    -1.0s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLineEndTime(editingLine.id, editingLine.endTime - 0.1)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLineEndTime(editingLine.id, editingLine.endTime + 0.1)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateLineEndTime(editingLine.id, editingLine.endTime + 1.0)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                  >
                    +1.0s
                  </button>
                </div>

                {/* Snap to Next Line Start Time */}
                {nextLineInModal && (
                  <button
                    type="button"
                    onClick={() => handleUpdateLineEndTime(editingLine.id, nextLineInModal.startTime)}
                    className="text-[11px] text-rose-300 hover:text-white underline font-medium"
                    title={`Khớp trước câu #${editingIndex + 2} (lúc ${formatTimeSub(nextLineInModal.startTime)})`}
                  >
                    Khớp câu sau ({formatTimeSub(nextLineInModal.startTime)})
                  </button>
                )}
              </div>
            </div>

            {/* Overlap & Status Alerts in Modal */}
            {timingValidation.issueMap[editingLine.id] && (
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/60 space-y-1 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{timingValidation.issueMap[editingLine.id].message}</span>
                </div>
                {prevLineInModal && editingLine.startTime < prevLineInModal.endTime && (
                  <button
                    type="button"
                    onClick={() => handleUpdateLineStartTime(editingLine.id, prevLineInModal.endTime)}
                    className="mt-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] transition-all cursor-pointer"
                  >
                    Tự động đẩy Start = {formatTimeSub(prevLineInModal.endTime)} để hết chồng lấn
                  </button>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <div className="text-xs text-neutral-400">
                {t.lineDuration || 'Thời lượng câu'}: <strong className="text-white font-mono text-sm">{Math.max(0, editingLine.endTime - editingLine.startTime).toFixed(1)}s</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = lyrics[editingIndex + 1];
                    if (next) {
                      setEditingLineId(next.id);
                    } else {
                      setEditingLineId(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingIndex < lyrics.length - 1 ? 'Lưu & Sang Câu Tiếp' : t.doneBtn || 'Xong'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
