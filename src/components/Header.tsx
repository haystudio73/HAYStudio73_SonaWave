import React from 'react';
import { AspectRatio } from '../types';
import { 
  Sparkles, 
  Download, 
  Camera, 
  Smartphone, 
  Square, 
  Tv, 
  Music,
  FolderOpen,
  Check,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onSelectAspectRatio: (ar: AspectRatio) => void;
  onOpenExportModal: () => void;
  onCaptureSnapshot: () => void;
  onOpenPresetsModal: () => void;
  onOpenProjectsModal: () => void;
  onLoadDemoTrack: (type: 'lofi' | 'synthwave' | 'acoustic' | 'edm') => void;
  isLoadingAudio: boolean;
  savedIndicator?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onSelectAspectRatio,
  onOpenExportModal,
  onCaptureSnapshot,
  onOpenPresetsModal,
  onOpenProjectsModal,
  onLoadDemoTrack,
  isLoadingAudio,
  savedIndicator = false,
}) => {
  return (
    <header className="h-16 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between z-30 sticky top-0 gap-1.5 sm:gap-4">
      {/* Brand Zone */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
          <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
            <Music className="w-4 h-4 text-rose-400" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              SonaWave
            </span>
            {savedIndicator && (
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-medium text-emerald-300">
                <Check className="w-2.5 h-2.5" />
                Đã tự động lưu
              </span>
            )}
          </div>
          <span className="text-[10px] text-rose-400/90 font-medium tracking-wider uppercase">
            Audio & Lyrics Video Studio
          </span>
        </div>
      </div>

      {/* Center Zone: Projects, Presets, Demo & Aspect Ratio */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Projects / Save / Load Button */}
        <button
          onClick={onOpenProjectsModal}
          title="Dự án & Lưu trữ"
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 hover:border-purple-500 text-xs font-semibold text-purple-200 transition-all cursor-pointer shadow-sm shadow-purple-950"
        >
          <FolderOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Dự án & Lưu</span>
        </button>

        {/* Preset Templates Button */}
        <button
          onClick={onOpenPresetsModal}
          title="Mẫu thiết kế giao diện"
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-200 transition-all cursor-pointer hover:border-rose-500/50"
        >
          <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Mẫu thiết kế</span>
        </button>

        {/* Demo Tracks Dropdown / Selector */}
        <div className="relative group">
          <button
            disabled={isLoadingAudio}
            title="Chọn bài hát mẫu"
            className="flex items-center justify-center gap-1.5 p-2 sm:px-2.5 md:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-200 transition-all cursor-pointer"
          >
            <Music className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Nhạc mẫu</span>
          </button>
          
          <div className="absolute top-full right-0 mt-1.5 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl shadow-black/60 py-1.5 hidden group-hover:block z-50">
            <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Chọn nhạc & lyrics mẫu
            </div>
            <button
              onClick={() => onLoadDemoTrack('synthwave')}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
            >
              <span>⚡ Neon Synthwave</span>
              <span className="text-[10px] text-neutral-500">120 BPM</span>
            </button>
            <button
              onClick={() => onLoadDemoTrack('lofi')}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
            >
              <span>☕ Lofi Sunset Chill</span>
              <span className="text-[10px] text-neutral-500">85 BPM</span>
            </button>
            <button
              onClick={() => onLoadDemoTrack('acoustic')}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
            >
              <span>🎸 Acoustic Romance</span>
              <span className="text-[10px] text-neutral-500">95 BPM</span>
            </button>
            <button
              onClick={() => onLoadDemoTrack('edm')}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 flex items-center justify-between"
            >
              <span>🌌 Deep Space EDM</span>
              <span className="text-[10px] text-neutral-500">128 BPM</span>
            </button>
          </div>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 p-0.5 rounded-lg">
          <button
            onClick={() => onSelectAspectRatio('9:16')}
            title="TikTok, Reels, Shorts (9:16)"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">9:16</span>
          </button>
          <button
            onClick={() => onSelectAspectRatio('1:1')}
            title="Instagram Square (1:1)"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '1:1'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">1:1</span>
          </button>
          <button
            onClick={() => onSelectAspectRatio('16:9')}
            title="YouTube Landscape (16:9)"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">16:9</span>
          </button>
        </div>
      </div>

      {/* Action Zone: Snapshot & Export Video */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={onCaptureSnapshot}
          title="Chụp ảnh bìa / thumbnail (PNG)"
          className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExportModal}
          title="Xuất Video HD"
          className="flex items-center justify-center gap-1.5 sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Xuất Video HD</span>
        </button>
      </div>
    </header>
  );
};
