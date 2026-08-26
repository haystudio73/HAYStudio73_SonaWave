import React, { useRef } from 'react';
import { LyricsConfig, LyricLine, LyricsStyle } from '../types';
import { parseAnyLyrics, exportToSRT, secondsToSRTTime, formatTime } from '../utils/lyricsParser';
import { 
  FileText, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Clock, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Eye,
  Sliders
} from 'lucide-react';

interface LyricsTabProps {
  config: LyricsConfig;
  onChange: (config: LyricsConfig) => void;
  lyrics: LyricLine[];
  onLyricsChange: (lyrics: LyricLine[]) => void;
  currentTime: number;
  duration: number;
}

const FONTS = [
  { name: 'Be Vietnam Pro (Chuẩn TV)', value: 'Be Vietnam Pro' },
  { name: 'Montserrat (Hiện Đại)', value: 'Montserrat' },
  { name: 'Outfit (Nổi Bật)', value: 'Outfit' },
  { name: 'Playfair Display (Nghệ Thuật)', value: 'Playfair Display' },
  { name: 'Space Grotesk (Futuristic)', value: 'Space Grotesk' },
];

const STYLES: { id: LyricsStyle; labelVi: string; desc: string }[] = [
  { id: 'karaoke', labelVi: 'Karaoke 3 Dòng', desc: 'Dòng đang hát phóng to phát sáng, 2 dòng trước & sau mờ dần' },
  { id: 'subtitle-bar', labelVi: 'Thanh Phụ Đề Mờ', desc: 'Hộp bo góc frosted glass tối giản hiện đại' },
  { id: 'kinetic-pop', labelVi: 'Kinetic Nhún Nhịp', desc: 'Chữ nhún nhảy và phóng to theo từng tiếng trống kick' },
  { id: 'minimal-glow', labelVi: 'Chữ Phát Sáng Tối Giản', desc: 'Font chữ đậm nét phát sáng hào quang mạnh mẽ' },
];

export const LyricsTab: React.FC<LyricsTabProps> = ({
  config,
  onChange,
  lyrics,
  onLyricsChange,
  currentTime,
  duration,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<LyricsConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsed = parseAnyLyrics(content, duration || 60);
        onLyricsChange(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleShiftTime = (seconds: number) => {
    const shifted = lyrics.map((line) => ({
      ...line,
      startTime: Math.max(0, line.startTime + seconds),
      endTime: Math.max(0.5, line.endTime + seconds),
    }));
    onLyricsChange(shifted);
  };

  const handleAddLine = () => {
    const newLine: LyricLine = {
      id: `line_${Date.now()}`,
      startTime: currentTime,
      endTime: currentTime + 4,
      text: 'Lời bài hát mới...',
    };
    const updated = [...lyrics, newLine].sort((a, b) => a.startTime - b.startTime);
    onLyricsChange(updated);
  };

  const handleUpdateLineText = (id: string, newText: string) => {
    onLyricsChange(lyrics.map((l) => (l.id === id ? { ...l, text: newText } : l)));
  };

  const handleDeleteLine = (id: string) => {
    onLyricsChange(lyrics.filter((l) => l.id !== id));
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

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Master Toggle & Upload Actions */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Hiển Thị Lời Bài Hát (Lyrics)
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
            <span>Tải File .SRT / .LRC</span>
          </button>

          <button
            onClick={handleExportSRT}
            disabled={lyrics.length === 0}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs font-medium transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file .SRT</span>
          </button>
        </div>
      </div>

      {/* 2. Lyrics Display Style */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Kiểu Hiệu Ứng Lời Bài Hát (Style)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((st) => (
            <button
              key={st.id}
              onClick={() => update({ style: st.id })}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                config.style === st.id
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-md ring-1 ring-purple-500/30'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="text-xs font-semibold block">{st.labelVi}</span>
              <span className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                {st.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Typography & Styling Settings */}
      <div className="space-y-4 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Phông Chữ & Màu Sắc (Typography)
        </label>

        {/* Font Family */}
        <div>
          <span className="text-xs text-neutral-400 block mb-1">Phông chữ</span>
          <select
            value={config.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size & Position Y */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Cỡ chữ</span>
              <span className="text-purple-400 font-mono">{config.fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={38}
              value={config.fontSize}
              onChange={(e) => update({ fontSize: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">Vị trí dọc</span>
              <span className="text-purple-400 font-mono">{config.positionY}%</span>
            </div>
            <input
              type="range"
              min={25}
              max={85}
              value={config.positionY}
              onChange={(e) => update({ positionY: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">Màu câu đang hát</span>
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
            <span className="text-[11px] text-neutral-400 block mb-1">Màu hào quang (Glow)</span>
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

      {/* 4. Live Lyrics Editor / Timing Adjustment */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Danh Sách & Đồng Bộ Thời Gian
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleShiftTime(-0.5)}
              title="Lùi lại 0.5 giây"
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300"
            >
              -0.5s
            </button>
            <button
              onClick={() => handleShiftTime(0.5)}
              title="Tiến lên 0.5 giây"
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300"
            >
              +0.5s
            </button>
            <button
              onClick={handleAddLine}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[10px] text-purple-300 font-semibold cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Thêm câu
            </button>
          </div>
        </div>

        {/* Scrollable list of lines */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {lyrics.length === 0 ? (
            <div className="text-center py-8 bg-neutral-900/40 border border-dashed border-neutral-800 rounded-2xl">
              <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">Chưa có lời bài hát nào</p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Tải lên file .SRT hoặc bấm "Nhạc mẫu" trên thanh trên cùng để thử ngay!
              </p>
            </div>
          ) : (
            lyrics.map((line) => {
              const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
              return (
                <div
                  key={line.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-purple-500/20 border-purple-500/80 shadow-md ring-1 ring-purple-500/40'
                      : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex flex-col items-center shrink-0 w-16">
                    <span className="text-[10px] font-mono text-purple-400 font-bold">
                      {formatTime(line.startTime)}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">
                      {formatTime(line.endTime)}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => handleUpdateLineText(line.id, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-xs text-neutral-200 focus:outline-none focus:text-white"
                  />

                  <button
                    onClick={() => handleDeleteLine(line.id)}
                    className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
