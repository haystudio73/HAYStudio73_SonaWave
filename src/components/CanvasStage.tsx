import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AspectRatio, HardwareAccelerationConfig, HardwareInfo, PlaylistRepeatMode, PlaylistConfig } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Activity,
  Upload,
  FileAudio,
  Sparkles,
  Sliders,
  Cpu,
  SkipBack,
  SkipForward,
  ListMusic,
  Repeat,
  Repeat1,
  Shuffle,
  Clock,
  Eye,
  EyeOff,
  Move
} from 'lucide-react';
import { formatTime } from '../utils/lyricsParser';
import { LottieItem } from '../types';

interface CanvasStageProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  aspectRatio: AspectRatio;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  onUploadAudioFile: (file: File) => void;
  audioFileName: string;
  language?: Language;
  onOpenMasterEq?: () => void;
  masterEqActive?: boolean;
  hardwareConfig?: HardwareAccelerationConfig;
  livePerformance?: { fps: number; renderDurationMs: number; droppedFrames: number };
  hardwareInfo?: HardwareInfo;
  onOpenSettings?: () => void;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
  hasNextTrack?: boolean;
  hasPreviousTrack?: boolean;
  playlistTrackInfo?: { current: number; total: number; title: string; artist?: string; fadeInSec?: number; fadeOutSec?: number };
  onOpenPlaylist?: () => void;
  repeatMode?: PlaylistRepeatMode;
  onToggleRepeatMode?: () => void;
  playlist?: PlaylistConfig;
  totalPlaylistDuration?: number;
  playlistElapsedTime?: number;
  onSeekPlaylist?: (globalTime: number) => void;
  isVisualizerVisible?: boolean;
  onToggleVisualizerVisible?: () => void;
  lotties?: LottieItem[];
  selectedLottie?: LottieItem | null;
  onSelectLottieId?: (id: string | null) => void;
  onUpdateLottie?: (id: string, partial: Partial<LottieItem>) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  canvasRef,
  aspectRatio,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isLooping,
  onToggleLoop,
  onUploadAudioFile,
  audioFileName,
  language = 'vi',
  onOpenMasterEq,
  masterEqActive = false,
  hardwareConfig,
  livePerformance,
  hardwareInfo,
  onOpenSettings,
  onPreviousTrack,
  onNextTrack,
  hasNextTrack = false,
  hasPreviousTrack = false,
  playlistTrackInfo,
  onOpenPlaylist,
  repeatMode,
  onToggleRepeatMode,
  playlist,
  totalPlaylistDuration,
  playlistElapsedTime,
  onSeekPlaylist,
  isVisualizerVisible = true,
  onToggleVisualizerVisible,
  lotties = [],
  selectedLottie,
  onSelectLottieId,
  onUpdateLottie,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const [isDraggingLottie, setIsDraggingLottie] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsInFullscreen, setShowControlsInFullscreen] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{ xPercent: number; time: number; label: string } | null>(null);

  const hasMultipleTracks = (playlist?.tracks?.length || 0) > 1;
  // Always maintain continuous timeline across the entire playlist without resetting to 0
  const isPlaylistMode = hasMultipleTracks && (totalPlaylistDuration || 0) > 0;

  const activeCurrentTime = isPlaylistMode ? (playlistElapsedTime || 0) : currentTime;
  const activeMaxDuration = isPlaylistMode ? (totalPlaylistDuration || 0) : (duration || 0);

  const handleProgressChange = (newVal: number) => {
    if (isPlaylistMode && onSeekPlaylist) {
      onSeekPlaylist(newVal);
    } else {
      onSeek(newVal);
    }
  };

  // Monitor fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut listener (Space, F, M, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onVolumeChange(volume > 0 ? 0 : 0.8);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleProgressChange(Math.max(0, activeCurrentTime - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleProgressChange(Math.min(activeMaxDuration || 100, activeCurrentTime + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, activeCurrentTime, activeMaxDuration, onTogglePlay, onVolumeChange]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleMouseMoveFullscreen = () => {
    if (!isFullscreen) return;
    setShowControlsInFullscreen(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControlsInFullscreen(false);
      }
    }, 3000);
  };

  // Aspect ratio classes for normal view
  const getAspectRatioClasses = () => {
    if (isFullscreen) {
      switch (aspectRatio) {
        case '9:16':
          return 'h-full aspect-[9/16] max-h-screen';
        case '1:1':
          return 'h-full aspect-square max-h-screen';
        case '16:9':
          return 'w-full aspect-[16/9] max-w-screen';
        case '4:5':
          return 'h-full aspect-[4/5] max-h-screen';
      }
    }

    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[68vh] max-w-[390px]';
      case '1:1':
        return 'aspect-square max-h-[66vh] max-w-[560px]';
      case '16:9':
        return 'aspect-[16/9] max-h-[62vh] max-w-[840px]';
      case '4:5':
        return 'aspect-[4/5] max-h-[66vh] max-w-[460px]';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadAudioFile(e.target.files[0]);
    }
  };

  // Compute partition markers for each track along the total playlist duration
  const trackMarkers = useMemo(() => {
    if (!playlist?.tracks || playlist.tracks.length <= 1 || !totalPlaylistDuration || totalPlaylistDuration <= 0) {
      return [];
    }
    let accumulated = 0;
    return playlist.tracks.map((tr, index) => {
      const trackDur = tr.duration || 0;
      const startSec = accumulated;
      accumulated += trackDur;
      const endSec = accumulated;
      const endRatio = Math.min(100, (endSec / totalPlaylistDuration) * 100);
      return {
        index,
        title: tr.title,
        startSec,
        endSec,
        endRatio,
      };
    });
  }, [playlist?.tracks, totalPlaylistDuration]);

  const handleMouseMoveProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !activeMaxDuration || activeMaxDuration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * activeMaxDuration;

    let label = formatTime(targetTime);
    if (isPlaylistMode && trackMarkers.length > 0) {
      const targetMarker = trackMarkers.find((m) => targetTime >= m.startSec && targetTime <= m.endSec) || trackMarkers[0];
      if (targetMarker) {
        const offsetInTrack = Math.max(0, targetTime - targetMarker.startSec);
        label = `Bài ${targetMarker.index + 1}: ${targetMarker.title} (${formatTime(offsetInTrack)})`;
      }
    }

    setHoverTooltip({
      xPercent: pos * 100,
      time: targetTime,
      label,
    });
  };

  // Drag and drop to move selected Lottie freely on canvas
  const handleLottieMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingLottie(true);
  };

  useEffect(() => {
    if (!isDraggingLottie || !selectedLottie || !onUpdateLottie) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasViewportRef.current) return;
      const rect = canvasViewportRef.current.getBoundingClientRect();
      const xPx = e.clientX - rect.left;
      const yPx = e.clientY - rect.top;
      const xPercent = Math.max(0, Math.min(100, (xPx / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (yPx / rect.height) * 100));
      onUpdateLottie(selectedLottie.id, {
        x: Math.round(xPercent * 10) / 10,
        y: Math.round(yPercent * 10) / 10,
      });
    };

    const handleMouseUp = () => {
      setIsDraggingLottie(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLottie, selectedLottie, onUpdateLottie]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMoveFullscreen}
      className={`flex-1 flex flex-col items-center justify-between p-4 lg:p-6 overflow-hidden relative transition-all ${
        isFullscreen ? 'bg-black w-screen h-screen fixed inset-0 z-50 p-0' : 'bg-neutral-950/60'
      }`}
    >
      {/* Top Banner / Upload Bar (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="w-full max-w-2xl flex items-center justify-between gap-3 mb-3 bg-neutral-900/70 border border-neutral-800/80 px-4 py-2 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <FileAudio className="w-4 h-4 text-rose-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-neutral-200 truncate">
                {audioFileName || 'Chưa tải nhạc lên (Sử dụng bài mẫu)'}
              </p>
              <p className="text-[10px] text-neutral-400">
                Hỗ trợ MP3, WAV, FLAC, M4A, OGG
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-medium transition-all shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải nhạc</span>
            </button>

            <button
              onClick={toggleFullscreen}
              title="Xem toàn màn hình (F)"
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Center Canvas Viewport */}
      <div className="w-full flex-1 flex items-center justify-center relative min-h-0">
        <div
          ref={canvasViewportRef}
          className={`relative rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-neutral-800 transition-all duration-300 ${getAspectRatioClasses()}`}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block bg-neutral-950"
          />

          {/* Quick Fullscreen Button in top left corner of canvas */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình (Esc/F)' : 'Toàn màn hình (F)'}
            className="absolute top-3 left-3 p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer z-10"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-rose-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Quick Toggle Visualizer Visibility */}
          {onToggleVisualizerVisible && (
            <button
              onClick={onToggleVisualizerVisible}
              title={
                isVisualizerVisible
                  ? (language === 'vi' ? 'Ẩn sóng âm Visualizer' : 'Hide visualizer waveform')
                  : (language === 'vi' ? 'Hiện sóng âm Visualizer' : 'Show visualizer waveform')
              }
              className={`absolute top-3 left-14 p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer z-10 ${
                isVisualizerVisible
                  ? 'bg-black/50 hover:bg-black/80 border-white/10 text-rose-400 hover:text-rose-300'
                  : 'bg-neutral-900/90 border-rose-500/50 text-neutral-400 hover:text-white'
              }`}
            >
              {isVisualizerVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-500" />}
            </button>
          )}

          {/* Interactive Bounding Box for Moving Selected Lottie */}
          {selectedLottie && selectedLottie.visible !== false && (
            <div
              style={{
                left: `${selectedLottie.x}%`,
                top: `${selectedLottie.y}%`,
                width: `${Math.max(70, (selectedLottie.width || 240) * (selectedLottie.scale || 1.0) * 0.45)}px`,
                height: `${Math.max(70, (selectedLottie.height || 240) * (selectedLottie.scale || 1.0) * 0.45)}px`,
                transform: `translate(-50%, -50%) rotate(${selectedLottie.rotation || 0}deg)`,
              }}
              onMouseDown={handleLottieMouseDown}
              className={`absolute border-2 border-dashed rounded-2xl transition-shadow cursor-grab active:cursor-grabbing z-20 group pointer-events-auto select-none ${
                isDraggingLottie
                  ? 'border-indigo-400 bg-indigo-950/25 shadow-lg shadow-indigo-500/30'
                  : 'border-indigo-400/70 hover:border-indigo-300 bg-indigo-950/10'
              }`}
            >
              {/* Center Move Handle Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-950/30 backdrop-blur-[1px] rounded-2xl">
                <div className="p-1 rounded-lg bg-indigo-600 text-white shadow">
                  <Move className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Coordinates Badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 text-[10px] text-indigo-200 whitespace-nowrap shadow pointer-events-none flex items-center gap-1 font-mono">
                <span>{selectedLottie.name}</span>
                <span className="text-indigo-400">• {selectedLottie.scale}x</span>
              </div>
            </div>
          )}

          {/* Interactive Click Targets for Other Visible Lottie Items */}
          {lotties
            .filter((l) => l.visible !== false && (!selectedLottie || l.id !== selectedLottie.id))
            .map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLottieId?.(item.id);
                }}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${Math.max(60, (item.width || 240) * (item.scale || 1.0) * 0.45)}px`,
                  height: `${Math.max(60, (item.height || 240) * (item.scale || 1.0) * 0.45)}px`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                }}
                title={`Bấm để chọn: ${item.name}`}
                className="absolute border border-dashed border-white/20 hover:border-indigo-400/80 hover:bg-indigo-950/20 rounded-2xl transition-all cursor-pointer z-10 pointer-events-auto group"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-700/50 text-[9px] text-neutral-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {item.name}
                </div>
              </div>
            ))}

          {/* Quick Hardware Acceleration Status Badge & Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Tăng tốc phần cứng CPU / GPU (Mở Cài Đặt)"
            className="absolute top-3 right-3 py-1.5 px-2.5 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-500/60 text-neutral-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer z-10 shadow-lg"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {livePerformance?.fps ?? 60} FPS
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase hidden sm:inline">
              GPU Accel
            </span>
          </button>

          {/* Real-time Hardware Performance HUD (when enabled in settings) */}
          {hardwareConfig?.showOverlay && (
            <div className="absolute top-12 right-3 p-3 rounded-2xl bg-black/85 backdrop-blur-lg border border-emerald-500/40 text-white font-mono text-[10px] space-y-1.5 pointer-events-none z-10 shadow-2xl min-w-[170px]">
              <div className="flex items-center justify-between gap-2 text-emerald-400 font-bold border-b border-neutral-800 pb-1">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  GPU ENGINE
                </span>
                <span className="text-white text-xs">{livePerformance?.fps ?? 60} FPS</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300 text-[10px]">
                <span>Render Frame:</span>
                <span className="text-emerald-400 font-bold">{livePerformance?.renderDurationMs ?? 2.0}ms</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400 text-[9px]">
                <span>Pipeline:</span>
                <span className="text-cyan-400 font-medium">Direct VRAM</span>
              </div>
              <div className="text-[9px] text-neutral-400 truncate pt-0.5 border-t border-neutral-900">
                {hardwareInfo?.gpuRenderer ?? 'Hardware Accelerated'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Controller Bar (Normal or Floating in Fullscreen) */}
      <div
        className={`transition-all duration-300 ${
          isFullscreen
            ? `fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 ${
                showControlsInFullscreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
              }`
            : 'w-full max-w-2xl mt-4'
        }`}
      >
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-3.5 backdrop-blur-md flex flex-col gap-2 shadow-2xl">
          {/* Active Track Title & Playlist Pill */}
          {playlistTrackInfo && (
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] pb-1 border-b border-neutral-800/70">
              <button
                type="button"
                onClick={onOpenPlaylist}
                title="Mở danh sách phát âm thanh (Audio Playlist)"
                className="flex items-center gap-1.5 text-neutral-300 hover:text-rose-400 transition-colors truncate text-left cursor-pointer group"
              >
                <ListMusic className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-bold text-rose-400 font-mono text-[10px] shrink-0">
                  [{playlistTrackInfo.current}/{playlistTrackInfo.total}]
                </span>
                <span className="truncate font-semibold text-white group-hover:underline">
                  {playlistTrackInfo.title}
                </span>
                {playlistTrackInfo.fadeInSec !== undefined && (
                  <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-emerald-400 font-mono">
                    Fade {playlistTrackInfo.fadeInSec}s/{playlistTrackInfo.fadeOutSec}s
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Continuous Playlist Timeline Indicator */}
                {hasMultipleTracks && (
                  <div
                    title="Thanh tiến trình hiển thị liền mạch toàn bộ danh sách phát - Kết thúc mỗi bài vẫn tiếp tục chạy tiếp toàn bộ thanh bar"
                    className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm shrink-0"
                  >
                    <Clock className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="font-mono">
                      Toàn Playlist ({formatTime(totalPlaylistDuration || 0)})
                    </span>
                  </div>
                )}

                {/* Repeat Mode Quick Selector */}
                {onToggleRepeatMode && repeatMode && (
                  <button
                    type="button"
                    onClick={onToggleRepeatMode}
                    title={`Chế độ phát: ${repeatMode}`}
                    className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    {repeatMode === 'repeat-all' && <Repeat className="w-3 h-3 text-rose-400" />}
                    {repeatMode === 'repeat-one' && <Repeat1 className="w-3 h-3 text-purple-400" />}
                    {repeatMode === 'shuffle' && <Shuffle className="w-3 h-3 text-cyan-400" />}
                    {repeatMode === 'off' && <RotateCcw className="w-3 h-3 text-neutral-500" />}
                    <span className="capitalize hidden xs:inline">{repeatMode.replace('-', ' ')}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Progress Slider (Continuous timeline across entire playlist with track notches and gradient fill) */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-neutral-400 w-11 text-right tabular-nums shrink-0">
              {formatTime(activeCurrentTime)}
            </span>
            <div
              ref={progressBarRef}
              onMouseMove={handleMouseMoveProgress}
              onMouseLeave={() => setHoverTooltip(null)}
              className="flex-1 relative flex items-center group cursor-pointer py-1"
            >
              {/* Background Track & Active Progress Fill */}
              <div className="absolute inset-x-0 h-2 bg-neutral-800/90 rounded-full pointer-events-none overflow-hidden z-0">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-amber-400 rounded-full transition-all duration-75 shadow-sm shadow-rose-500/20"
                  style={{
                    width: `${Math.min(100, Math.max(0, (activeCurrentTime / (activeMaxDuration || 1)) * 100))}%`,
                  }}
                />
              </div>

              {/* Track Partition Markers on Playlist Progress Bar */}
              {isPlaylistMode && trackMarkers.length > 1 && (
                <div className="absolute inset-x-0 h-2 rounded-full pointer-events-none overflow-hidden z-10">
                  {trackMarkers.map((marker, mIdx) => (
                    mIdx < trackMarkers.length - 1 && (
                      <div
                        key={marker.index}
                        style={{ left: `${marker.endRatio}%` }}
                        className="absolute top-0 bottom-0 w-[2px] bg-neutral-950 shadow-md ring-1 ring-white/20"
                        title={`Mốc chuyển bài ${mIdx + 1} ➔ ${mIdx + 2}: ${marker.title}`}
                      />
                    )
                  ))}
                </div>
              )}

              {/* Hover Tooltip */}
              {hoverTooltip && (
                <div
                  style={{
                    left: `${Math.max(10, Math.min(90, hoverTooltip.xPercent))}%`,
                    transform: 'translateX(-50%)',
                  }}
                  className="absolute -top-7 pointer-events-none px-2 py-0.5 rounded bg-neutral-950/95 border border-rose-500/50 text-[10px] font-mono text-rose-300 shadow-xl whitespace-nowrap z-30"
                >
                  {hoverTooltip.label}
                </div>
              )}

              <input
                type="range"
                min={0}
                max={activeMaxDuration || 100}
                step={0.1}
                value={activeCurrentTime}
                onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-rose-400 focus:outline-none relative z-20"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400 w-11 tabular-nums shrink-0">
              {formatTime(activeMaxDuration)}
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Loop / Repeat button */}
              <button
                onClick={onToggleRepeatMode || onToggleLoop}
                title={
                  repeatMode === 'repeat-all'
                    ? 'Lặp lại toàn bộ danh sách (Repeat All)'
                    : repeatMode === 'repeat-one'
                    ? 'Lặp lại 1 bài hiện tại (Repeat One)'
                    : repeatMode === 'shuffle'
                    ? 'Phát ngẫu nhiên (Shuffle)'
                    : 'Không lặp lại (Repeat Off)'
                }
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  repeatMode && repeatMode !== 'off' ? 'text-rose-400 bg-rose-500/10' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {repeatMode === 'repeat-all' ? (
                  <Repeat className="w-4 h-4 text-rose-400" />
                ) : repeatMode === 'repeat-one' ? (
                  <Repeat1 className="w-4 h-4 text-purple-400" />
                ) : repeatMode === 'shuffle' ? (
                  <Shuffle className="w-4 h-4 text-cyan-400" />
                ) : (
                  <RotateCcw className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
                  className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Center Controls: Prev - Big Play/Pause - Next */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {onPreviousTrack && (
                <button
                  type="button"
                  onClick={onPreviousTrack}
                  disabled={!hasPreviousTrack}
                  title="Bài trước (Previous Track)"
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>
              )}

              {/* Big Play / Pause Button */}
              <button
                onClick={onTogglePlay}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {onNextTrack && (
                <button
                  type="button"
                  onClick={onNextTrack}
                  disabled={!hasNextTrack}
                  title="Bài tiếp theo (Next Track)"
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-25 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quick Playlist button */}
              {onOpenPlaylist && (
                <button
                  type="button"
                  onClick={onOpenPlaylist}
                  title="Mở Playlist"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <ListMusic className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">List</span>
                </button>
              )}
              {/* Master EQ launcher button */}
              {onOpenMasterEq && (
                <button
                  onClick={onOpenMasterEq}
                  title={t.masterEqTitle}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    masterEqActive
                      ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 shadow-sm'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Sliders className={`w-3.5 h-3.5 ${masterEqActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span className="hidden sm:inline">EQ</span>
                  {masterEqActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </button>
              )}

              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? t.exitFullscreen : t.fullscreen}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Toàn màn hình</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
