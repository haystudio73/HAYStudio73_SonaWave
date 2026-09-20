import React, { useState, useRef } from 'react';
import { AudioTrackItem, PlaylistConfig, PlaylistRepeatMode, BackgroundConfig, LyricLine } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { formatTime, parseAnyLyrics } from '../utils/lyricsParser';
import { BACKGROUND_PRESETS } from '../utils/presets';
import {
  extractAudioMetadata,
  reorderTracks,
  shuffleTracks,
  reverseTracks,
  matchLyricsFilesToTracks,
} from '../utils/playlistManager';
import {
  Music,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  GripVertical,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  Sparkles,
  Zap,
  Check,
  Radio,
  FileAudio,
  Image as ImageIcon,
  Upload,
  Video,
  Film,
  Sliders,
  ExternalLink,
  RotateCcw,
  Palette,
  Eye,
  ListMusic,
  Mic2,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface AudioPlaylistTabProps {
  playlist: PlaylistConfig;
  onChangePlaylist?: (newConfig: PlaylistConfig) => void;
  onChange?: (newConfig: PlaylistConfig) => void;
  isPlaying?: boolean;
  currentTime?: number;
  currentDuration?: number;
  onPlayTrackAtIndex?: (index: number) => void;
  onSelectTrack?: (index: number) => void;
  onTogglePlay?: () => void;
  language?: Language;
  currentBackground?: BackgroundConfig;
  defaultBackground?: BackgroundConfig;
  onNavigateToBackgroundTab?: (trackId?: string) => void;
  onAddTracklistBox?: () => void;
  onNavigateToTextBoxTab?: () => void;
  onNavigateToLyricsTab?: (trackIndex?: number) => void;
  onUpdateTrackLyrics?: (trackId: string, lyrics: LyricLine[], rawLyrics?: string, fileName?: string) => void;
  onBatchImportLyrics?: (files: { name: string; content: string }[]) => number | void;
}

export const AudioPlaylistTab: React.FC<AudioPlaylistTabProps> = ({
  playlist,
  onChangePlaylist: propOnChangePlaylist,
  onChange,
  isPlaying = false,
  currentTime = 0,
  currentDuration = 0,
  onPlayTrackAtIndex: propOnPlayTrackAtIndex,
  onSelectTrack,
  onTogglePlay = () => {},
  language = 'vi',
  currentBackground,
  defaultBackground,
  onNavigateToBackgroundTab,
  onAddTracklistBox,
  onNavigateToTextBoxTab,
  onNavigateToLyricsTab,
  onUpdateTrackLyrics,
  onBatchImportLyrics,
}) => {
  const onChangePlaylist = propOnChangePlaylist || onChange || (() => {});
  const onPlayTrackAtIndex = propOnPlayTrackAtIndex || onSelectTrack || (() => {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchLyricsInputRef = useRef<HTMLInputElement>(null);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pastingLyricsTrackId, setPastingLyricsTrackId] = useState<string | null>(null);
  const [pastingText, setPastingText] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Handle Batch Import of Lyrics (.lrc, .srt, .txt)
  const handleBatchLyricsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileItems: { name: string; content: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const text = await f.text();
        fileItems.push({ name: f.name, content: text });
      }

      const { updatedTracks, matchedCount } = matchLyricsFilesToTracks(playlist.tracks, fileItems);

      onChangePlaylist({
        ...playlist,
        tracks: updatedTracks,
      });

      if (onBatchImportLyrics) {
        onBatchImportLyrics(fileItems);
      }

      showToast(
        language === 'vi'
          ? `Đã tự động ghép lời thành công cho ${matchedCount} bài hát!`
          : `Successfully matched lyrics for ${matchedCount} tracks!`
      );
    } catch (err) {
      console.error('Error importing batch lyrics:', err);
      showToast(language === 'vi' ? 'Lỗi khi đọc file lyrics!' : 'Failed to parse lyrics files!');
    } finally {
      if (batchLyricsInputRef.current) {
        batchLyricsInputRef.current.value = '';
      }
    }
  };

  // Handle single track lyrics file upload
  const handleTrackLyricsUpload = async (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const track = playlist.tracks.find((t) => t.id === trackId);
      const parsed = parseAnyLyrics(content, track?.duration || 60);

      const updatedTracks = playlist.tracks.map((t) =>
        t.id === trackId
          ? { ...t, lyrics: parsed, rawLyrics: content, lyricsFileName: file.name }
          : t
      );

      onChangePlaylist({
        ...playlist,
        tracks: updatedTracks,
      });

      if (onUpdateTrackLyrics) {
        onUpdateTrackLyrics(trackId, parsed, content, file.name);
      }

      showToast(
        language === 'vi'
          ? `Đã nạp ${parsed.length} câu lời từ ${file.name}!`
          : `Loaded ${parsed.length} lines from ${file.name}!`
      );
    } catch (err) {
      console.error('Error loading track lyrics:', err);
      showToast(language === 'vi' ? 'Lỗi khi đọc file lời!' : 'Failed to parse lyrics file!');
    } finally {
      e.target.value = '';
    }
  };

  // Handle Save Pasted Lyrics for a track
  const handleSavePastedLyrics = (trackId: string) => {
    if (!pastingText.trim()) return;
    const track = playlist.tracks.find((t) => t.id === trackId);
    const parsed = parseAnyLyrics(pastingText, track?.duration || 60);

    const updatedTracks = playlist.tracks.map((t) =>
      t.id === trackId
        ? { ...t, lyrics: parsed, rawLyrics: pastingText, lyricsFileName: 'Pasted_Lyrics.lrc' }
        : t
    );

    onChangePlaylist({
      ...playlist,
      tracks: updatedTracks,
    });

    if (onUpdateTrackLyrics) {
      onUpdateTrackLyrics(trackId, parsed, pastingText, 'Pasted_Lyrics.lrc');
    }

    setPastingLyricsTrackId(null);
    setPastingText('');
    showToast(
      language === 'vi'
        ? `Đã lưu thành công ${parsed.length} câu lời cho bài hát!`
        : `Saved ${parsed.length} lyric lines for this track!`
    );
  };

  // Handle Clear Track Lyrics
  const handleClearTrackLyrics = (trackId: string) => {
    const updatedTracks = playlist.tracks.map((t) =>
      t.id === trackId
        ? { ...t, lyrics: [], rawLyrics: undefined, lyricsFileName: undefined }
        : t
    );

    onChangePlaylist({
      ...playlist,
      tracks: updatedTracks,
    });

    if (onUpdateTrackLyrics) {
      onUpdateTrackLyrics(trackId, [], undefined, undefined);
    }

    showToast(language === 'vi' ? 'Đã xóa lời bài hát!' : 'Removed lyrics for track!');
  };

  // Total duration of all tracks in playlist
  const totalPlaylistSeconds = playlist.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  // Handle uploading multiple audio files
  const handleAddFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const newItems: AudioTrackItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const meta = await extractAudioMetadata(file);
        const url = URL.createObjectURL(file);

        const trackItem: AudioTrackItem = {
          id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: meta.title,
          artist: meta.artist,
          fileName: file.name,
          url,
          duration: meta.duration,
          fadeInSec: playlist.defaultFadeInSec ?? 1.5,
          fadeOutSec: playlist.defaultFadeOutSec ?? 2.0,
          volume: 1.0,
          file,
        };
        newItems.push(trackItem);
      }

      onChangePlaylist({
        ...playlist,
        tracks: [...playlist.tracks, ...newItems],
      });
    } catch (err) {
      console.error('Error adding tracks to playlist:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Re-order Move Up
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index <= 0) return;
    const reordered = reorderTracks(playlist.tracks, index, index - 1);
    let newIndex = playlist.currentIndex;
    if (playlist.currentIndex === index) {
      newIndex = index - 1;
    } else if (playlist.currentIndex === index - 1) {
      newIndex = index;
    }
    onChangePlaylist({
      ...playlist,
      tracks: reordered,
      currentIndex: newIndex,
    });
  };

  // Re-order Move Down
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index >= playlist.tracks.length - 1) return;
    const reordered = reorderTracks(playlist.tracks, index, index + 1);
    let newIndex = playlist.currentIndex;
    if (playlist.currentIndex === index) {
      newIndex = index + 1;
    } else if (playlist.currentIndex === index + 1) {
      newIndex = index;
    }
    onChangePlaylist({
      ...playlist,
      tracks: reordered,
      currentIndex: newIndex,
    });
  };

  // Delete Track
  const handleDeleteTrack = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks.length <= 1) {
      showToast(language === 'vi' ? '⚠️ Danh sách phải có ít nhất 1 bài hát.' : '⚠️ Playlist must have at least 1 track.');
      return;
    }
    const newTracks = playlist.tracks.filter((_, i) => i !== index);
    let newIndex = playlist.currentIndex;
    if (newIndex >= newTracks.length) {
      newIndex = newTracks.length - 1;
    } else if (index < newIndex) {
      newIndex = newIndex - 1;
    }
    onChangePlaylist({
      ...playlist,
      tracks: newTracks,
      currentIndex: newIndex,
    });
  };

  // Duplicate Track
  const handleDuplicateTrack = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const source = playlist.tracks[index];
    const duplicated: AudioTrackItem = {
      ...source,
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: `${source.title} (Copy)`,
    };
    const newTracks = [...playlist.tracks];
    newTracks.splice(index + 1, 0, duplicated);
    onChangePlaylist({
      ...playlist,
      tracks: newTracks,
    });
  };

  // Update track property
  const handleUpdateTrack = (id: string, updates: Partial<AudioTrackItem>) => {
    const newTracks = playlist.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    onChangePlaylist({
      ...playlist,
      tracks: newTracks,
    });
  };

  // Apply default fade in/out to all tracks
  const handleApplyDefaultsToAll = () => {
    const updated = playlist.tracks.map((t) => ({
      ...t,
      fadeInSec: playlist.defaultFadeInSec,
      fadeOutSec: playlist.defaultFadeOutSec,
    }));
    onChangePlaylist({
      ...playlist,
      tracks: updated,
    });
  };

  // Track specific background handlers
  const handleTrackImageUpload = (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const track = playlist.tracks.find((t) => t.id === trackId);
    const baseBg = track?.background || currentBackground || defaultBackground || {
      type: 'upload',
      url: '',
      color1: '#111827',
      color2: '#000000',
      gradientAngle: 135,
      blur: 0,
      brightness: 85,
      contrast: 100,
      vignette: 40,
      beatZoom: true,
      beatZoomIntensity: 4,
    };
    const updatedBg: BackgroundConfig = {
      ...baseBg,
      type: 'upload',
      isVideo: false,
      url,
    };
    handleUpdateTrack(trackId, { background: updatedBg });
  };

  const handleTrackVideoUpload = (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const track = playlist.tracks.find((t) => t.id === trackId);
    const baseBg = track?.background || currentBackground || defaultBackground || {
      type: 'video',
      url: '',
      color1: '#111827',
      color2: '#000000',
      gradientAngle: 135,
      blur: 0,
      brightness: 85,
      contrast: 100,
      vignette: 40,
      beatZoom: true,
      beatZoomIntensity: 4,
    };
    const updatedBg: BackgroundConfig = {
      ...baseBg,
      type: 'video',
      isVideo: true,
      url,
      videoUrl: url,
    };
    handleUpdateTrack(trackId, { background: updatedBg });
  };

  const handleAssignPresetToTrack = (trackId: string, presetUrl: string) => {
    const track = playlist.tracks.find((t) => t.id === trackId);
    const baseBg = track?.background || currentBackground || defaultBackground || {
      type: 'preset',
      url: presetUrl,
      color1: '#111827',
      color2: '#000000',
      gradientAngle: 135,
      blur: 0,
      brightness: 85,
      contrast: 100,
      vignette: 40,
      beatZoom: true,
      beatZoomIntensity: 4,
    };
    const updatedBg: BackgroundConfig = {
      ...baseBg,
      type: 'preset',
      isVideo: false,
      url: presetUrl,
    };
    handleUpdateTrack(trackId, { background: updatedBg });
  };

  const handleCopyCurrentBackgroundToTrack = (trackId: string) => {
    if (!currentBackground) return;
    handleUpdateTrack(trackId, { background: { ...currentBackground } });
  };

  const handleResetTrackBackground = (trackId: string) => {
    handleUpdateTrack(trackId, { background: undefined });
  };

  const handleUpdateTrackBackgroundProp = (trackId: string, partial: Partial<BackgroundConfig>) => {
    const track = playlist.tracks.find((t) => t.id === trackId);
    const baseBg = track?.background || currentBackground || defaultBackground || {
      type: 'preset',
      url: BACKGROUND_PRESETS[0]?.url || '',
      color1: '#111827',
      color2: '#000000',
      gradientAngle: 135,
      blur: 0,
      brightness: 85,
      contrast: 100,
      vignette: 40,
      beatZoom: true,
      beatZoomIntensity: 4,
    };
    handleUpdateTrack(trackId, { background: { ...baseBg, ...partial } });
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = reorderTracks(playlist.tracks, draggedIndex, index);
    let newCurrent = playlist.currentIndex;
    if (playlist.currentIndex === draggedIndex) {
      newCurrent = index;
    } else if (draggedIndex < playlist.currentIndex && index >= playlist.currentIndex) {
      newCurrent -= 1;
    } else if (draggedIndex > playlist.currentIndex && index <= playlist.currentIndex) {
      newCurrent += 1;
    }

    onChangePlaylist({
      ...playlist,
      tracks: reordered,
      currentIndex: newCurrent,
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-neutral-200">
      {/* Top Banner: Multi Audio Queue Overview */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-rose-950/30 border border-neutral-800/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {language === 'vi' ? 'Danh Sách Âm Thanh' : 'Audio Playlist'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  {playlist.tracks.length} {language === 'vi' ? 'Bài Hát' : 'Tracks'}
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                {language === 'vi'
                  ? 'Sắp xếp thứ tự phát, chuyển bài & hiệu ứng Fade-in / Fade-out mượt mà'
                  : 'Re-order audio queue, crossfade & smooth Fade-in / Fade-out transitions'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
              {language === 'vi' ? 'Tổng Thời Lượng' : 'Total Time'}
            </span>
            <span className="text-xs font-mono font-bold text-rose-400">
              {formatTime(totalPlaylistSeconds)}
            </span>
          </div>
        </div>

        {/* Action Button: Batch Add Files & Add Tracklist to Video */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleAddFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isUploading
                ? language === 'vi'
                  ? 'Đang nạp âm thanh...'
                  : 'Loading audio...'
                : language === 'vi'
                ? 'Thêm Nhiều File Nhạc (Multi-Upload)'
                : 'Add Multiple Audio Tracks'}
            </span>
          </button>

          {onAddTracklistBox && (
            <button
              type="button"
              onClick={onAddTracklistBox}
              title={language === 'vi' ? 'Thêm hộp chữ danh sách bài hát (Thời gian & Tiêu đề) lên video visualizer' : 'Add audio tracklist info text box (Time & Title) to visualizer'}
              className="py-2.5 px-3.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98 whitespace-nowrap"
            >
              <ListMusic className="w-4 h-4 text-purple-300" />
              <span>
                {language === 'vi' ? 'Hộp Tracklist Lên Video' : 'Tracklist to Video'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Global Playlist Settings Card (Fade in/out, Repeat mode, Crossfade) */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              {language === 'vi' ? 'Cài Đặt Chuyển Bài & Fade' : 'Transitions & Fade Engine'}
            </span>
          </div>

          {/* Toggle Fade In/Out Globally */}
          <button
            type="button"
            onClick={() =>
              onChangePlaylist({
                ...playlist,
                enableFadeInOut: !playlist.enableFadeInOut,
              })
            }
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              playlist.enableFadeInOut
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                playlist.enableFadeInOut ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
              }`}
            />
            {playlist.enableFadeInOut
              ? language === 'vi'
                ? 'Đã Bật Fade'
                : 'Fade Enabled'
              : language === 'vi'
              ? 'Tắt Fade'
              : 'Fade Disabled'}
          </button>
        </div>

        {/* Global Fade In & Out Default Settings */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-300">
                {language === 'vi' ? 'Fade-In Mặc Định' : 'Default Fade-In'}
              </span>
              <span className="text-[11px] font-mono font-bold text-rose-400">
                {playlist.defaultFadeInSec.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={playlist.defaultFadeInSec}
              onChange={(e) =>
                onChangePlaylist({
                  ...playlist,
                  defaultFadeInSec: parseFloat(e.target.value),
                })
              }
              className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
              <button
                type="button"
                onClick={() => onChangePlaylist({ ...playlist, defaultFadeInSec: 0 })}
                className="hover:text-white"
              >
                0s
              </button>
              <button
                type="button"
                onClick={() => onChangePlaylist({ ...playlist, defaultFadeInSec: 1.5 })}
                className="hover:text-white"
              >
                1.5s
              </button>
              <button
                type="button"
                onClick={() => onChangePlaylist({ ...playlist, defaultFadeInSec: 3 })}
                className="hover:text-white"
              >
                3.0s
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-300">
                {language === 'vi' ? 'Fade-Out Mặc Định' : 'Default Fade-Out'}
              </span>
              <span className="text-[11px] font-mono font-bold text-purple-400">
                {playlist.defaultFadeOutSec.toFixed(1)}s
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={playlist.defaultFadeOutSec}
              onChange={(e) =>
                onChangePlaylist({
                  ...playlist,
                  defaultFadeOutSec: parseFloat(e.target.value),
                })
              }
              className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
              <button
                type="button"
                onClick={() => onChangePlaylist({ ...playlist, defaultFadeOutSec: 0 })}
                className="hover:text-white"
              >
                0s
              </button>
              <button
                type="button"
                onClick={() => onChangePlaylist({ ...playlist, defaultFadeOutSec: 2 })}
                className="hover:text-white"
              >
                2.0s
              </button>
              <button
                type="button"
                onClick={() => onChangePlaylist({ ...playlist, defaultFadeOutSec: 4 })}
                className="hover:text-white"
              >
                4.0s
              </button>
            </div>
          </div>
        </div>

        {/* Playback Repeat & Ordering Toolbar */}
        <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Repeat Mode Buttons */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => onChangePlaylist({ ...playlist, repeatMode: 'repeat-all' })}
              title={language === 'vi' ? 'Lặp lại toàn bộ danh sách' : 'Repeat All'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                playlist.repeatMode === 'repeat-all'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">
                {language === 'vi' ? 'Lặp Hết' : 'All'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onChangePlaylist({ ...playlist, repeatMode: 'repeat-one' })}
              title={language === 'vi' ? 'Lặp lại 1 bài hiện tại' : 'Repeat One Track'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                playlist.repeatMode === 'repeat-one'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Repeat1 className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">
                {language === 'vi' ? 'Lặp 1' : 'One'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onChangePlaylist({ ...playlist, repeatMode: 'shuffle' })}
              title={language === 'vi' ? 'Phát ngẫu nhiên' : 'Shuffle'}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                playlist.repeatMode === 'shuffle'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">
                {language === 'vi' ? 'Trộn' : 'Shuffle'}
              </span>
            </button>
          </div>

          {/* Quick Re-order Operations */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const res = shuffleTracks(playlist.tracks, playlist.currentIndex);
                onChangePlaylist({ ...playlist, tracks: res.tracks, currentIndex: res.newIndex });
              }}
              title={language === 'vi' ? 'Trộn thứ tự danh sách' : 'Shuffle track order'}
              className="px-2 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3 text-cyan-400" />
              <span>{language === 'vi' ? 'Trộn Thứ Tự' : 'Shuffle'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const res = reverseTracks(playlist.tracks, playlist.currentIndex);
                onChangePlaylist({ ...playlist, tracks: res.tracks, currentIndex: res.newIndex });
              }}
              title={language === 'vi' ? 'Đảo ngược thứ tự danh sách' : 'Reverse track order'}
              className="px-2 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3 text-purple-400" />
              <span>{language === 'vi' ? 'Đảo Ngược' : 'Reverse'}</span>
            </button>

            <button
              type="button"
              onClick={handleApplyDefaultsToAll}
              title={language === 'vi' ? 'Áp dụng Fade mặc định cho toàn bộ bài hát' : 'Apply default fade to all'}
              className="px-2 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-rose-300 hover:text-rose-200 text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>{language === 'vi' ? 'Fade Toàn Bộ' : 'Sync Fade'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={batchLyricsInputRef}
        type="file"
        multiple
        accept=".srt,.lrc,.txt"
        className="hidden"
        onChange={handleBatchLyricsUpload}
      />

      {/* Batch Lyrics & Synchronizer Bar */}
      <div className="p-3 bg-gradient-to-r from-purple-950/40 via-neutral-900 to-neutral-900 border border-purple-500/30 rounded-2xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shadow-sm">
              <Mic2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-200">
                  {language === 'vi' ? 'Đồng Bộ Lời Theo Danh Sách' : 'Lyrics List Sync'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {playlist.tracks.filter((t) => t.lyrics && t.lyrics.length > 0).length}/{playlist.tracks.length}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block">
                {language === 'vi'
                  ? 'Nạp nhiều file .LRC/.SRT một lúc, hệ thống sẽ tự khớp với bài hát'
                  : 'Batch match .LRC/.SRT files to playlist audio tracks'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => batchLyricsInputRef.current?.click()}
              title={language === 'vi' ? 'Chọn nhiều file lời (.lrc, .srt) để tự động ghép vào từng bài' : 'Import multiple .lrc/.srt files'}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-purple-300" />
              <span>{language === 'vi' ? 'Nạp Lời Hàng Loạt (.LRC/.SRT)' : 'Batch Lyrics (.lrc/.srt)'}</span>
            </button>

            {onNavigateToLyricsTab && (
              <button
                type="button"
                onClick={() => onNavigateToLyricsTab(playlist.currentIndex)}
                title={language === 'vi' ? 'Mở Tab Lời Bài Hát & Karaoke để chỉnh sửa câu chữ và hiệu ứng' : 'Open full Lyrics & Karaoke Studio'}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-neutral-400" />
                <span>{language === 'vi' ? 'Tab Lời Nhạc' : 'Lyrics Studio'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Track Cards List (With Drag-and-Drop & Move Up/Down Re-ordering) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileAudio className="w-3.5 h-3.5 text-rose-400" />
            {language === 'vi' ? 'Thứ Tự Danh Sách Phát' : 'Playlist Track Queue'}
          </span>
          <span className="text-[10px] text-neutral-500">
            {language === 'vi' ? 'Kéo thả hoặc bấm mũi tên để đổi vị trí' : 'Drag or use arrows to re-order'}
          </span>
        </div>

        {playlist.tracks.map((track, index) => {
          const isActive = index === playlist.currentIndex;
          const isExpanded = expandedTrackId === track.id;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={`${track.id || 'track'}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isActive
                  ? 'bg-neutral-900 border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30'
                  : 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
              } ${isDragging ? 'opacity-40 scale-98' : 'opacity-100'} ${
                isDragOver ? 'border-cyan-400 ring-2 ring-cyan-400/30' : ''
              }`}
            >
              {/* Card Header Bar */}
              <div
                onClick={() => onPlayTrackAtIndex(index)}
                className="p-3 flex items-center gap-2.5 cursor-pointer hover:bg-neutral-800/40 transition-colors"
              >
                {/* Drag Handle */}
                <div
                  title={language === 'vi' ? 'Kéo để đổi thứ tự' : 'Drag to re-order'}
                  className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white p-1 -ml-1"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Index & Play Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isActive) {
                      onTogglePlay();
                    } else {
                      onPlayTrackAtIndex(index);
                    }
                  }}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {isActive && isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : isActive ? (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Track Background Thumbnail Indicator */}
                <div 
                  className="w-8 h-8 rounded-lg overflow-hidden border border-neutral-700/80 bg-neutral-950 shrink-0 relative flex items-center justify-center shadow-inner"
                  title={
                    track.background 
                      ? (language === 'vi' ? 'Bài này có hình/video nền riêng' : 'Custom track background assigned')
                      : (language === 'vi' ? 'Dùng nền mặc định của dự án' : 'Project default background')
                  }
                >
                  {track.background?.isVideo ? (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                      <Film className="w-3.5 h-3.5 text-rose-400" />
                      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-1 ring-neutral-950" />
                    </div>
                  ) : track.background?.url ? (
                    <img
                      src={track.background.url}
                      alt="BG"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : currentBackground?.url ? (
                    <img
                      src={currentBackground.url}
                      alt="Default BG"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {track.background && (
                    <span 
                      className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-purple-400 ring-1 ring-neutral-950 shadow-sm" 
                      title={language === 'vi' ? 'Có nền riêng' : 'Custom BG'}
                    />
                  )}
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px] block">
                      {track.title}
                    </span>
                    {isActive && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold uppercase shrink-0 border border-rose-500/30 animate-pulse">
                        {isPlaying ? 'Playing' : 'Active'}
                      </span>
                    )}
                    {track.lyrics && track.lyrics.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToLyricsTab?.(index);
                        }}
                        title={language === 'vi' ? 'Đã có lời bài hát (Bấm để xem và chỉnh sửa trong Tab Lời)' : 'Lyrics loaded (Click to edit)'}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40 hover:bg-purple-500/30 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Mic2 className="w-2.5 h-2.5 text-purple-400" />
                        <span>{track.lyrics.length} câu</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTrackId(track.id);
                        }}
                        title={language === 'vi' ? 'Bấm để thêm lời cho bài này' : 'Click to add lyrics'}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>{language === 'vi' ? 'Thêm Lời' : 'Lyrics'}</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 truncate">
                    <span>{track.artist || 'SonaWave Master'}</span>
                    <span>•</span>
                    <span className="font-mono text-neutral-300">{formatTime(track.duration)}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">
                      In {track.fadeInSec}s / Out {track.fadeOutSec}s
                    </span>
                  </div>
                </div>

                {/* Re-order & Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleMoveUp(index, e)}
                    disabled={index === 0}
                    title={language === 'vi' ? 'Di chuyển lên' : 'Move up'}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleMoveDown(index, e)}
                    disabled={index === playlist.tracks.length - 1}
                    title={language === 'vi' ? 'Di chuyển xuống' : 'Move down'}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Toggle Fine-Tune Accordion */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTrackId(isExpanded ? null : track.id);
                    }}
                    title={language === 'vi' ? 'Chỉnh Fade & Âm Lượng' : 'Fine-tune Fade & Volume'}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isExpanded
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={(e) => handleDuplicateTrack(index, e)}
                    title={language === 'vi' ? 'Nhân đôi bài hát' : 'Duplicate track'}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTrack(index, e)}
                    disabled={playlist.tracks.length <= 1}
                    title={language === 'vi' ? 'Xóa khỏi danh sách' : 'Delete track'}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expandable Fine-Tune Panel (Fade-In / Fade-Out / Volume) */}
              {isExpanded && (
                <div className="p-3.5 bg-neutral-950/90 border-t border-neutral-800/80 space-y-3">
                  {/* Track metadata editing */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        {language === 'vi' ? 'Tên Bài Hát' : 'Title'}
                      </label>
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => handleUpdateTrack(track.id, { title: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                        {language === 'vi' ? 'Nghệ Sĩ' : 'Artist'}
                      </label>
                      <input
                        type="text"
                        value={track.artist}
                        onChange={(e) => handleUpdateTrack(track.id, { artist: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Fade-in & Fade-out Fine tuning sliders */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Fade-in slider */}
                    <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-300">
                          {language === 'vi' ? 'Fade-In (Lên Dần)' : 'Fade-In Duration'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-rose-400">
                          {track.fadeInSec.toFixed(1)}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={track.fadeInSec}
                        onChange={(e) =>
                          handleUpdateTrack(track.id, { fadeInSec: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-rose-500"
                      />
                      <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                        {[0, 1, 2, 4].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => handleUpdateTrack(track.id, { fadeInSec: sec })}
                            className={`hover:text-white px-1 py-0.5 rounded ${
                              track.fadeInSec === sec ? 'text-rose-400 font-bold' : ''
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fade-out slider */}
                    <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-300">
                          {language === 'vi' ? 'Fade-Out (Nhỏ Dần)' : 'Fade-Out Duration'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-purple-400">
                          {track.fadeOutSec.toFixed(1)}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={track.fadeOutSec}
                        onChange={(e) =>
                          handleUpdateTrack(track.id, { fadeOutSec: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-purple-500"
                      />
                      <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                        {[0, 1.5, 3, 5].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => handleUpdateTrack(track.id, { fadeOutSec: sec })}
                            className={`hover:text-white px-1 py-0.5 rounded ${
                              track.fadeOutSec === sec ? 'text-purple-400 font-bold' : ''
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Volume Trimming */}
                  <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-[11px] font-bold text-neutral-300">
                          {language === 'vi' ? 'Cân Chỉnh Âm Lượng Bài (Volume Trim)' : 'Track Gain Trim'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-neutral-200">
                        {Math.round(track.volume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={track.volume}
                      onChange={(e) =>
                        handleUpdateTrack(track.id, { volume: parseFloat(e.target.value) })
                      }
                      className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Track Background Customization Section */}
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <ImageIcon className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-neutral-200 block">
                            {language === 'vi' ? 'Hình Nền Của Bài Này' : 'Track Background'}
                          </span>
                          <span className="text-[9px] text-neutral-400">
                            {track.background
                              ? (language === 'vi' ? '✨ Đang dùng hình/video nền riêng biệt' : '✨ Using custom track background')
                              : (language === 'vi' ? 'Dùng nền mặc định của dự án' : 'Using project default background')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {track.background ? (
                          <button
                            type="button"
                            onClick={() => handleResetTrackBackground(track.id)}
                            title={language === 'vi' ? 'Xóa nền riêng, dùng nền mặc định' : 'Reset to default background'}
                            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>{language === 'vi' ? 'Xóa Nền Riêng' : 'Reset'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCopyCurrentBackgroundToTrack(track.id)}
                            title={language === 'vi' ? 'Sao chép nền đang hiển thị trên sân khấu cho bài này' : 'Copy active stage background'}
                            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3 text-cyan-400" />
                            <span>{language === 'vi' ? 'Lấy Nền Sân Khấu' : 'Copy Current'}</span>
                          </button>
                        )}

                        {onNavigateToBackgroundTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateToBackgroundTab(track.id)}
                            title={language === 'vi' ? 'Mở Tab Background để chỉnh hiệu ứng chuyên sâu' : 'Open Background Tab for full controls'}
                            className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[10px] font-semibold border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Chỉnh Chi Tiết' : 'Full Tab'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Background Preview & Upload Controls */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                      {/* Preview Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 shrink-0 relative flex items-center justify-center">
                        {track.background?.isVideo ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-rose-400 p-1 text-center">
                            <Film className="w-5 h-5 mb-0.5" />
                            <span className="text-[8px] font-bold uppercase">Video MP4</span>
                          </div>
                        ) : track.background?.url ? (
                          <img
                            src={track.background.url}
                            alt="Track BG"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : currentBackground?.url ? (
                          <img
                            src={currentBackground.url}
                            alt="Default BG"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-60"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 p-1 text-center">
                            <ImageIcon className="w-5 h-5 mb-0.5" />
                            <span className="text-[8px] font-medium">{language === 'vi' ? 'Mặc Định' : 'Default'}</span>
                          </div>
                        )}

                        {track.background && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-neutral-950" />
                        )}
                      </div>

                      {/* Upload Buttons */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-all cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Tải Ảnh Nền' : 'Upload Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleTrackImageUpload(track.id, e)}
                            />
                          </label>

                          <label className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-[11px] font-semibold transition-all cursor-pointer">
                            <Video className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Tải Video MP4' : 'Upload MP4'}</span>
                            <input
                              type="file"
                              accept="video/mp4,video/*,.mp4,.mov,.webm"
                              className="hidden"
                              onChange={(e) => handleTrackVideoUpload(track.id, e)}
                            />
                          </label>
                        </div>
                        <p className="text-[9px] text-neutral-400">
                          {language === 'vi' 
                            ? 'Nền riêng này sẽ tự động kích hoạt ngay khi bài hát bắt đầu phát' 
                            : 'This background triggers automatically when this track plays'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Preset Selector for this track */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase">
                        <span>{language === 'vi' ? 'Chọn Nhanh Preset Nền' : 'Quick Presets'}</span>
                        <span className="text-[9px] text-neutral-500 font-normal">
                          {language === 'vi' ? 'Nhấp để áp dụng ngay' : 'Click to apply'}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {BACKGROUND_PRESETS.slice(0, 6).map((preset) => {
                          const isPresetSelected = track.background?.url === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleAssignPresetToTrack(track.id, preset.url)}
                              title={language === 'vi' ? preset.nameVi : preset.nameEn}
                              className={`group relative aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer ${
                                isPresetSelected
                                  ? 'border-purple-500 ring-2 ring-purple-500/40 scale-102'
                                  : 'border-neutral-800 hover:border-neutral-600'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.nameEn}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                                <span className="text-[8px] font-bold text-white truncate block w-full leading-tight">
                                  {language === 'vi' ? preset.nameVi : preset.nameEn}
                                </span>
                              </div>
                              {isPresetSelected && (
                                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-purple-500 flex items-center justify-center">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Background Adjustments (Blur, Brightness, Beat Zoom) if track has background */}
                    {track.background && (
                      <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Blur slider */}
                          <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-neutral-300">
                                {language === 'vi' ? 'Độ Mờ (Blur)' : 'Blur'}
                              </span>
                              <span className="font-mono text-cyan-400 font-bold">
                                {track.background.blur ?? 0}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={30}
                              step={1}
                              value={track.background.blur ?? 0}
                              onChange={(e) =>
                                handleUpdateTrackBackgroundProp(track.id, { blur: parseInt(e.target.value) })
                              }
                              className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Brightness slider */}
                          <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-neutral-300">
                                {language === 'vi' ? 'Độ Sáng' : 'Brightness'}
                              </span>
                              <span className="font-mono text-rose-400 font-bold">
                                {track.background.brightness ?? 85}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={20}
                              max={200}
                              step={5}
                              value={track.background.brightness ?? 85}
                              onChange={(e) =>
                                handleUpdateTrackBackgroundProp(track.id, { brightness: parseInt(e.target.value) })
                              }
                              className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-rose-500"
                            />
                          </div>
                        </div>

                        {/* Beat Zoom Toggle & Intensity */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateTrackBackgroundProp(track.id, {
                                  beatZoom: !(track.background?.beatZoom ?? true),
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                (track.background.beatZoom ?? true)
                                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {(track.background.beatZoom ?? true) ? 'ON' : 'OFF'}
                            </button>
                            <span className="text-[10px] font-semibold text-neutral-300">
                              {language === 'vi' ? 'Beat Zoom (Giật Nhịp)' : 'Beat Zoom'}
                            </span>
                          </div>

                          {(track.background.beatZoom ?? true) && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-purple-300">
                                +{Math.round((track.background.zoomIntensity ?? 0.05) * 100)}%
                              </span>
                              <input
                                type="range"
                                min={0.01}
                                max={0.15}
                                step={0.01}
                                value={track.background.zoomIntensity ?? 0.05}
                                onChange={(e) =>
                                  handleUpdateTrackBackgroundProp(track.id, {
                                    zoomIntensity: parseFloat(e.target.value),
                                  })
                                }
                                className="w-16 h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-purple-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track Lyrics Customization Section */}
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Mic2 className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-neutral-200 block">
                            {language === 'vi' ? 'Lời Bài Hát Của Bài Này' : 'Track Lyrics'}
                          </span>
                          <span className="text-[9px] text-neutral-400">
                            {track.lyrics && track.lyrics.length > 0
                              ? (language === 'vi' 
                                  ? `✨ Đã có ${track.lyrics.length} câu lời (${track.lyricsFileName || 'LRC/SRT'})` 
                                  : `✨ ${track.lyrics.length} lines loaded (${track.lyricsFileName || 'LRC/SRT'})`)
                              : (language === 'vi' ? 'Chưa nạp lời cho bài hát này' : 'No lyrics loaded yet')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {track.lyrics && track.lyrics.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleClearTrackLyrics(track.id)}
                            title={language === 'vi' ? 'Xóa lời bài hát này' : 'Clear lyrics'}
                            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3 text-rose-400" />
                            <span>{language === 'vi' ? 'Xóa Lời' : 'Clear'}</span>
                          </button>
                        )}

                        {onNavigateToLyricsTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateToLyricsTab(index)}
                            title={language === 'vi' ? 'Mở Tab Lời Bài Hát để tinh chỉnh thời gian karaoke' : 'Edit in Lyrics Studio'}
                            className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[10px] font-semibold border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Chỉnh Chuyên Sâu' : 'Edit Studio'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Lyrics Action Buttons */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[11px] font-semibold transition-all cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>{language === 'vi' ? 'Tải File .LRC / .SRT' : 'Upload .LRC / .SRT'}</span>
                        <input
                          type="file"
                          accept=".srt,.lrc,.txt"
                          className="hidden"
                          onChange={(e) => handleTrackLyricsUpload(track.id, e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          if (pastingLyricsTrackId === track.id) {
                            setPastingLyricsTrackId(null);
                          } else {
                            setPastingLyricsTrackId(track.id);
                            setPastingText(track.rawLyrics || '');
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                          pastingLyricsTrackId === track.id
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-neutral-800/90 hover:bg-neutral-700 border-neutral-700 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span>{language === 'vi' ? 'Dán Lời Nhanh' : 'Paste Lyrics'}</span>
                      </button>
                    </div>

                    {/* Inline Paste Box */}
                    {pastingLyricsTrackId === track.id && (
                      <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-300">
                            {language === 'vi' ? 'Dán Nội Dung Lời (.lrc, .srt hoặc văn bản thường)' : 'Paste Lyrics Content'}
                          </span>
                          <span className="text-[9px] text-neutral-500">
                            {language === 'vi' ? 'Hỗ trợ thẻ thời gian [00:12.34]' : 'Supports [00:12.34] tags'}
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={pastingText}
                          onChange={(e) => setPastingText(e.target.value)}
                          placeholder="[00:02.00] Dòng lời đầu tiên...&#10;[00:08.50] Dòng lời thứ hai...&#10;hoặc dán từng dòng chữ lời bài hát"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-y"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPastingLyricsTrackId(null);
                              setPastingText('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            {language === 'vi' ? 'Hủy' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSavePastedLyrics(track.id)}
                            disabled={!pastingText.trim()}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-md shadow-purple-600/30"
                          >
                            <Check className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Lưu & Áp Dụng' : 'Save Lyrics'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview of loaded lyrics if available */}
                    {track.lyrics && track.lyrics.length > 0 && (
                      <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-neutral-400 uppercase font-bold">
                          <span>{language === 'vi' ? 'Xem Trước Lời Bài Hát' : 'Lyrics Preview'}</span>
                          <span className="font-mono text-purple-400">{track.lyrics.length} câu</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] font-mono">
                          {track.lyrics.slice(0, 3).map((l, i) => (
                            <div key={l.id || i} className="truncate text-neutral-300 flex items-center gap-1.5">
                              <span className="text-neutral-500 text-[10px]">[{formatTime(l.startTime)}]</span>
                              <span>{l.text}</span>
                            </div>
                          ))}
                          {track.lyrics.length > 3 && (
                            <div className="text-[10px] text-neutral-500 italic pt-0.5">
                              ... và còn {track.lyrics.length - 3} câu hát khác
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleAddFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className="p-4 border-2 border-dashed border-neutral-800 hover:border-rose-500/50 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/80 transition-all text-center cursor-pointer space-y-1.5 group"
      >
        <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-rose-500/20 text-neutral-400 group-hover:text-rose-400 flex items-center justify-center mx-auto transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold text-neutral-300 group-hover:text-white">
          {language === 'vi' ? 'Thêm Bài Hát Vào Danh Sách' : 'Drop Audio Files Here'}
        </div>
        <div className="text-[11px] text-neutral-500">
          {language === 'vi'
            ? 'Kéo thả nhiều file MP3, WAV, FLAC, M4A hoặc click để duyệt'
            : 'Supports batch MP3, WAV, FLAC, M4A upload'}
        </div>
      </div>
    </div>
  );
};
