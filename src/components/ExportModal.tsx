import React, { useState, useEffect } from 'react';
import { AspectRatio, ExportSettings } from '../types';
import { 
  Download, 
  X, 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Sparkles, 
  RotateCcw,
  RefreshCw,
  Play 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatTime } from '../utils/lyricsParser';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  duration: number;
  onStartExport: (settings: ExportSettings) => Promise<void>;
  onCancelExport: () => void;
  onResetExport?: () => void;
  isExporting: boolean;
  exportProgress: number; // 0 to 100
  exportCurrentSeconds: number;
  exportTotalSeconds: number;
  exportedBlob: Blob | null;
  onDownloadExportedVideo: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  duration,
  onStartExport,
  onCancelExport,
  onResetExport,
  isExporting,
  exportProgress,
  exportCurrentSeconds,
  exportTotalSeconds,
  exportedBlob,
  onDownloadExportedVideo,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<30 | 60>(60);
  const [qualityBitrate, setQualityBitrate] = useState<'high' | 'ultra' | 'medium'>('high');
  const [fullSong, setFullSong] = useState(true);
  const [rangeDuration, setRangeDuration] = useState<number>(30); // 15, 30, 60
  const [startTime, setStartTime] = useState<number>(0);

  // Trigger celebratory confetti when export completes
  useEffect(() => {
    if (exportedBlob && !isExporting) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
      });
    }
  }, [exportedBlob, isExporting]);

  if (!isOpen) return null;

  const getEffectiveSettings = (): ExportSettings => {
    const songDuration = duration || 30;
    const start = fullSong ? 0 : Math.min(startTime, Math.max(0, songDuration - 1));
    const end = fullSong ? songDuration : Math.min(start + rangeDuration, songDuration);

    return {
      resolution,
      fps,
      qualityBitrate,
      startTime: start,
      endTime: end,
      fullSong,
    };
  };

  const handleStart = () => {
    const settings = getEffectiveSettings();
    onStartExport(settings);
  };

  // Handle Export Again
  const handleExportAgain = (immediate = false) => {
    if (onResetExport) {
      onResetExport();
    }
    if (immediate) {
      setTimeout(() => {
        handleStart();
      }, 100);
    }
  };

  const getResolutionDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return resolution === '1080p' ? '1080 × 1920 (Full HD)' : resolution === '720p' ? '720 × 1280' : '2160 × 3840 (4K)';
      case '1:1':
        return resolution === '1080p' ? '1080 × 1080 (HD Square)' : resolution === '720p' ? '720 × 720' : '2160 × 2160 (4K)';
      case '16:9':
        return resolution === '1080p' ? '1920 × 1080 (YouTube HD)' : resolution === '720p' ? '1280 × 720' : '3840 × 2160 (4K)';
      case '4:5':
        return resolution === '1080p' ? '1080 × 1350 (IG Portrait)' : resolution === '720p' ? '720 × 900' : '2160 × 2700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400" />

        {/* Modal Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Film className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Xuất Video MP4 Chất Lượng Cao</h3>
              <p className="text-xs text-neutral-400">
                Định dạng MP4 (H.264) • Chuẩn {aspectRatio} • {getResolutionDimensions()}
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 1. Export in progress State */}
        {isExporting ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            {/* Animated Circular Progress Indicator */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-neutral-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-rose-500 transition-all duration-150"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * exportProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {Math.round(exportProgress)}%
                </span>
                <span className="text-[10px] text-rose-400 font-semibold tracking-wider uppercase">
                  Đang ghi hình
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-200">
                Đang kết xuất video sóng âm & đồng bộ lời bài hát...
              </p>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {formatTime(exportCurrentSeconds)} / {formatTime(exportTotalSeconds)} ({Math.round(exportProgress)}%)
              </p>
            </div>

            <button
              onClick={onCancelExport}
              className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition-all mt-2 cursor-pointer"
            >
              Hủy kết xuất
            </button>
          </div>
        ) : exportedBlob ? (
          /* 2. Export Completed State (With prominent "Xuất lại / Export Again" button) */
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Kết Xuất Video MP4 Hoàn Tất!</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Kích thước: {(exportedBlob.size / (1024 * 1024)).toFixed(1)} MB • Định dạng MP4 • 60 FPS • Sẵn sàng tải về hoặc đăng ngay lên TikTok / Shorts / Facebook.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 pt-2">
              {/* Primary Download Button */}
              <button
                onClick={onDownloadExportedVideo}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-rose-500/25 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Tải Video MP4 Về Máy (.mp4)</span>
              </button>

              {/* Action Buttons: Export Again & Edit Settings */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExportAgain(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Xuất lại ngay</span>
                </button>

                <button
                  onClick={() => handleExportAgain(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Đổi tùy chọn & xuất</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-medium transition-all cursor-pointer"
              >
                Đóng & Quay lại chỉnh sửa
              </button>
            </div>
          </div>
        ) : (
          /* 3. Settings Configuration Form */
          <div className="space-y-4">
            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Độ Phân Giải (Resolution)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1080p', '720p', '4k'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      resolution === res
                        ? 'bg-rose-500/20 border-rose-500 text-white font-bold ring-1 ring-rose-500/40'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="text-xs block uppercase font-mono">{res}</span>
                    <span className="text-[10px] text-neutral-500">
                      {res === '1080p' ? 'Full HD (Gợi ý)' : res === '720p' ? 'HD Nhanh' : 'Ultra HD'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* FPS & Quality */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Tốc Độ Khung Hình (FPS)
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                  <button
                    onClick={() => setFps(60)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fps === 60 ? 'bg-rose-600 text-white' : 'text-neutral-400'
                    }`}
                  >
                    60 FPS (Mượt)
                  </button>
                  <button
                    onClick={() => setFps(30)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fps === 30 ? 'bg-rose-600 text-white' : 'text-neutral-400'
                    }`}
                  >
                    30 FPS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Chất Lượng Bitrate
                </label>
                <select
                  value={qualityBitrate}
                  onChange={(e) => setQualityBitrate(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="high">Cao (14 Mbps)</option>
                  <option value="ultra">Cực Cao (24 Mbps)</option>
                  <option value="medium">Tiêu chuẩn (8 Mbps)</option>
                </select>
              </div>
            </div>

            {/* Export Range: Full Song vs Short Clip */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2.5">
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Độ Dài Xuất Video (Duration)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFullSong(true)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    fullSong
                      ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500/40 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="text-xs block">Toàn Bộ Bài Hát</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {formatTime(duration || 30)}
                  </span>
                </button>

                <button
                  onClick={() => setFullSong(false)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    !fullSong
                      ? 'bg-purple-500/20 border-purple-500 text-white ring-1 ring-purple-500/40 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="text-xs block">Đoạn Ngắn TikTok/Shorts</span>
                  <span className="text-[10px] text-neutral-500">{rangeDuration}s clip</span>
                </button>
              </div>

              {!fullSong && (
                <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Thời lượng clip:</span>
                    <div className="flex items-center gap-1">
                      {[15, 30, 60].map((s) => (
                        <button
                          key={s}
                          onClick={() => setRangeDuration(s)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            rangeDuration === s
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {s}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">Đoạn phát:</span>
                      <span className="text-purple-400 font-mono font-semibold">
                        {formatTime(startTime)} → {formatTime(Math.min(startTime + rangeDuration, duration || 30))}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, (duration || 30) - rangeDuration)}
                      step={1}
                      value={startTime}
                      onChange={(e) => setStartTime(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Start Export Button */}
            <div className="pt-2">
              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Xuất Video HD</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
