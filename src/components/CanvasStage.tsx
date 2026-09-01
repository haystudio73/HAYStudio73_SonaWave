import React, { useRef, useEffect, useState } from 'react';
import { AspectRatio } from '../types';
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
  Sliders
} from 'lucide-react';
import { formatTime } from '../utils/lyricsParser';

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
  beatIntensity: number;
  onUploadAudioFile: (file: File) => void;
  audioFileName: string;
  language?: Language;
  onOpenMasterEq?: () => void;
  masterEqActive?: boolean;
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
  beatIntensity,
  onUploadAudioFile,
  audioFileName,
  language = 'vi',
  onOpenMasterEq,
  masterEqActive = false,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsInFullscreen, setShowControlsInFullscreen] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        onSeek(Math.max(0, currentTime - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSeek(Math.min(duration || 100, currentTime + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, currentTime, duration, onTogglePlay, onVolumeChange, onSeek]);

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
            className="absolute top-3 left-3 p-2 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-rose-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
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
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-3.5 backdrop-blur-md flex flex-col gap-2.5 shadow-2xl">
          {/* Progress Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative flex items-center group cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Loop button */}
              <button
                onClick={onToggleLoop}
                title={isLooping ? 'Tắt lặp lại' : 'Bật lặp lại'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLooping ? 'text-rose-400 bg-rose-500/10' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
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

            <div className="flex items-center gap-1.5 sm:gap-2">
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
