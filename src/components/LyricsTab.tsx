import React, { useRef, useState, useMemo } from 'react';
import { 
  LyricsConfig, 
  LyricLine, 
  LyricsStyle, 
  LyricsFontEffect, 
  KaraokeSweepMode,
  LyricsInEffect,
  LyricsOutEffect,
  LyricsPresetItem 
} from '../types';
import { 
  parseAnyLyrics, 
  exportToSRT, 
  formatTimeSub,
  validateLyricsTimings,
  autoFixLyricsOverlaps,
  splitLyricLineByChars,
  splitAllLyricsByChars,
  convertLyricsTo2LineKaraokeTiming,
  restoreOriginalLyricsTiming
} from '../utils/lyricsParser';
import { 
  AVAILABLE_FONTS, 
  LYRICS_GRADIENT_THEMES, 
  BUILTIN_LYRICS_PRESETS 
} from '../utils/presets';
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
  CircleDot,
  Scissors,
  Mic2,
  Sliders,
  ListMusic,
  ExternalLink,
  RefreshCw,
  Save,
  FileDown,
  FolderDown,
  Palette,
  Layers,
  Layers3,
  Move,
  RotateCw,
  Bookmark,
  Smartphone,
} from 'lucide-react';
import { PlaylistConfig, AudioTrackItem } from '../types';
import { matchLyricsFilesToTracks } from '../utils/playlistManager';

interface LyricsTabProps {
  config: LyricsConfig;
  onChange: (config: LyricsConfig) => void;
  lyrics: LyricLine[];
  onLyricsChange: (lyrics: LyricLine[]) => void;
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  language?: Language;
  playlist?: PlaylistConfig;
  onSelectTrackIndex?: (index: number) => void;
  onUpdateTrackLyrics?: (trackId: string, lyrics: LyricLine[], rawLyrics?: string, fileName?: string) => void;
  onBatchImportLyrics?: (files: { name: string; content: string }[]) => number | void;
  onNavigateToPlaylistTab?: () => void;
  onApplyLyricsToAllTracks?: (lyrics: LyricLine[]) => void;
}

const STYLES: { id: LyricsStyle; labelVi: string; labelEn: string; descVi: string; descEn: string; badge?: string }[] = [
  { id: 'karaoke-duo', labelVi: 'Karaoke 2 Dòng (Song Ca / So Le)', labelEn: '2-Line Karaoke (Duo Alternating)', descVi: '2 dòng hiển thị rõ ràng, dòng này hát dòng kia chờ sẵn, vị trí tách biệt', descEn: '2 distinct alternating lines, clear preview of next line, separate line positioning', badge: 'Mới ⭐' },
  { id: 'karaoke-single', labelVi: 'Karaoke 1 Dòng', labelEn: '1-Line Karaoke', descVi: '1 dòng duy nhất quét màu mượt mà + hiệu ứng theo nhịp', descEn: 'Single line with smooth progressive highlight and cursor trail', badge: 'Hot Trend' },
  { id: 'teleprompter-4lines', labelVi: 'Karaoke 4 Dòng (Tự Cuộn)', labelEn: '4-Line Teleprompter', descVi: '4 dòng liên tục tự động cuộn mượt mà như máy nhắc chữ', descEn: '4 continuous auto-scrolling lines with focus on the active lyric', badge: 'Mới' },
  { id: 'karaoke', labelVi: 'Karaoke 3 Dòng', labelEn: '3-Line Classic Karaoke', descVi: '3 dòng kinh điển: dòng trước, dòng đang hát & dòng kế tiếp', descEn: 'Classic 3-line layout showing previous, active, and upcoming lines' },
  { id: 'subtitle-bar', labelVi: 'Thanh Phụ Đề Mờ', labelEn: 'Frosted Subtitle Bar', descVi: 'Hộp bo góc frosted glass tối giản hiện đại', descEn: 'Modern frosted glass bar with centered crisp subtitles' },
  { id: 'minimal-glow', labelVi: 'Phát Sáng Tối Giản', labelEn: 'Minimalist Glow', descVi: 'Font chữ sắc nét phát sáng hào quang nhẹ nhàng, hỗ trợ tự ngắt 2 dòng cho video dọc 9:16', descEn: 'Clean floating lyrics with soft atmospheric glow, supports auto 2-line wrap for 9:16 vertical', badge: '9:16 Fit' },
];

const KARAOKE_SWEEP_MODES: { id: KaraokeSweepMode; labelVi: string; labelEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }>; badgeVi?: string; badgeEn?: string }[] = [
  { 
    id: 'color-only', 
    labelVi: 'Chỉ Đổi Màu', 
    labelEn: 'Color Fill Only',
    descVi: 'Quét màu mượt mà chuẩn xác, phong cách tối giản & tinh tế', 
    descEn: 'Smooth color sweep progression with clean minimalist text',
    icon: Sparkles,
  },
  { 
    id: 'star-flying', 
    labelVi: 'Sao vàng bay+đổi màu', 
    labelEn: 'Golden Star + Color Fill',
    descVi: 'Ngôi sao vàng 5 cánh phát sáng bay lượn & nảy theo từng từ', 
    descEn: 'Glowing 5-point golden star bouncing along with the lyrics',
    icon: Star,
    badgeVi: 'Kinh Điển ⭐',
    badgeEn: 'Classic ⭐'
  },
  { 
    id: 'bouncing-ball', 
    labelVi: 'Quả bóng nhỏ bay+đổi màu', 
    labelEn: 'Bouncing Ball + Color Fill',
    descVi: 'Quả bóng tròn phát sáng nảy bồng bềnh nhịp nhàng trên từng từ', 
    descEn: 'Glossy 3D bouncing sphere jumping rhythmically with words',
    icon: CircleDot,
    badgeVi: 'Vui Nhộn ⚪',
    badgeEn: 'Playful ⚪'
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

const IN_EFFECTS: { id: LyricsInEffect; labelVi: string; labelEn: string }[] = [
  { id: 'none', labelVi: 'Không (Tức thì)', labelEn: 'None (Instant)' },
  { id: 'fade', labelVi: 'Mờ dần (Fade In)', labelEn: 'Fade In' },
  { id: 'slide-up', labelVi: 'Trượt từ dưới lên (Slide Up)', labelEn: 'Slide Up' },
  { id: 'slide-down', labelVi: 'Trượt từ trên xuống (Slide Down)', labelEn: 'Slide Down' },
  { id: 'slide-left', labelVi: 'Trượt từ trái sang (Slide Left)', labelEn: 'Slide Left' },
  { id: 'slide-right', labelVi: 'Trượt từ phải sang (Slide Right)', labelEn: 'Slide Right' },
  { id: 'zoom-in', labelVi: 'Phóng to từ tâm (Zoom In)', labelEn: 'Zoom In' },
  { id: 'char-drop', labelVi: 'Rơi chữ (Char Drop)', labelEn: 'Char Drop' },
  { id: 'dissolve', labelVi: 'Hòa tan biến hình (Dissolve)', labelEn: 'Dissolve' },
  { id: 'bounce', labelVi: 'Nảy đàn hồi (Bounce)', labelEn: 'Bounce' },
];

const OUT_EFFECTS: { id: LyricsOutEffect; labelVi: string; labelEn: string }[] = [
  { id: 'none', labelVi: 'Không (Tức thì)', labelEn: 'None (Instant)' },
  { id: 'fade', labelVi: 'Mờ dần (Fade Out)', labelEn: 'Fade Out' },
  { id: 'slide-up', labelVi: 'Trượt lên trên tan biến', labelEn: 'Slide Up' },
  { id: 'slide-down', labelVi: 'Trượt xuống dưới tan biến', labelEn: 'Slide Down' },
  { id: 'zoom-out', labelVi: 'Thu nhỏ dần (Zoom Out)', labelEn: 'Zoom Out' },
  { id: 'dissolve', labelVi: 'Hòa tan biến mất (Dissolve)', labelEn: 'Dissolve' },
];

export const LyricsTab: React.FC<LyricsTabProps> = ({
  config,
  onChange,
  lyrics: propLyrics,
  onLyricsChange: propOnLyricsChange,
  currentTime,
  duration: propDuration,
  onSeek,
  language = 'vi',
  playlist,
  onSelectTrackIndex,
  onUpdateTrackLyrics,
  onBatchImportLyrics,
  onNavigateToPlaylistTab,
  onApplyLyricsToAllTracks,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.vi;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchLyricsInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playlist Track Selection State
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [pasteModalText, setPasteModalText] = useState<string>('');

  const currentPlaylistIndex = playlist ? playlist.currentIndex : 0;
  const currentPlayingTrack = playlist?.tracks?.[currentPlaylistIndex];
  
  // Track currently being viewed/edited in this tab
  const viewedTrack = (selectedTrackId ? playlist?.tracks?.find((t) => t.id === selectedTrackId) : null) || currentPlayingTrack;
  const isViewingCurrentTrack = !viewedTrack || viewedTrack.id === currentPlayingTrack?.id;

  // Active lyrics & duration for the viewed track
  const lyrics = useMemo(() => {
    if (!isViewingCurrentTrack && viewedTrack) {
      return viewedTrack.lyrics || [];
    }
    return propLyrics;
  }, [isViewingCurrentTrack, viewedTrack, propLyrics]);

  const duration = useMemo(() => {
    if (!isViewingCurrentTrack && viewedTrack && viewedTrack.duration) {
      return viewedTrack.duration;
    }
    return propDuration;
  }, [isViewingCurrentTrack, viewedTrack, propDuration]);

  // Unified onLyricsChange that routes to the viewed track or active track
  const onLyricsChange = (newLyrics: LyricLine[]) => {
    if (!isViewingCurrentTrack && viewedTrack) {
      onUpdateTrackLyrics?.(viewedTrack.id, newLyrics, undefined, viewedTrack.lyricsFileName);
    } else {
      propOnLyricsChange(newLyrics);
      if (currentPlayingTrack) {
        onUpdateTrackLyrics?.(currentPlayingTrack.id, newLyrics, undefined, currentPlayingTrack.lyricsFileName);
      }
    }
  };

  // Handle batch lyrics import inside Lyrics Tab
  const handleBatchLyricsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !playlist) return;

    try {
      const fileItems: { name: string; content: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const text = await f.text();
        fileItems.push({ name: f.name, content: text });
      }

      if (onBatchImportLyrics) {
        const count = onBatchImportLyrics(fileItems);
        showToast(
          language === 'vi'
            ? `Đã ghép thành công lời cho ${count ?? fileItems.length} bài hát trong danh sách!`
            : `Matched lyrics for tracks in playlist!`
        );
      }
    } catch (err) {
      console.error('Error importing batch lyrics in LyricsTab:', err);
      showToast(language === 'vi' ? 'Lỗi khi đọc file lyrics!' : 'Failed to parse lyrics files!');
    } finally {
      if (batchLyricsInputRef.current) {
        batchLyricsInputRef.current.value = '';
      }
    }
  };

  // Handle paste lyrics for viewed track
  const handleSavePastedLyrics = () => {
    if (!pasteModalText.trim()) return;
    const parsed = parseAnyLyrics(pasteModalText, duration || 60);
    onLyricsChange(parsed);
    setIsPasteModalOpen(false);
    setPasteModalText('');
    showToast(
      language === 'vi'
        ? `Đã nạp ${parsed.length} câu lời cho bài hát!`
        : `Loaded ${parsed.length} lyric lines!`
    );
  };

  // Handle apply current lyrics to all tracks
  const handleApplyToAllTracks = () => {
    if (!playlist || lyrics.length === 0) return;
    if (onApplyLyricsToAllTracks) {
      onApplyLyricsToAllTracks(lyrics);
    } else if (onUpdateTrackLyrics) {
      playlist.tracks.forEach((t) => {
        onUpdateTrackLyrics(t.id, lyrics, undefined, 'Shared_Lyrics.lrc');
      });
    }
    showToast(
      language === 'vi'
        ? `Đã sao chép lời này sang toàn bộ ${playlist.tracks.length} bài hát!`
        : `Applied lyrics to all ${playlist.tracks.length} tracks!`
    );
  };

  // Handle clear lyrics for viewed track
  const handleClearViewedLyrics = () => {
    onLyricsChange([]);
    showToast(language === 'vi' ? 'Đã xóa toàn bộ câu hát!' : 'Cleared all lyric lines!');
  };

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

  const isKaraokeMode = config.style === 'karaoke' || config.style === 'karaoke-single' || config.style === 'karaoke-duo' || config.style === 'teleprompter-4lines';

  // Preset management state (max 10 presets)
  const [customPresets, setCustomPresets] = useState<LyricsPresetItem[]>(() => {
    try {
      const saved = localStorage.getItem('sonawave_custom_lyrics_presets_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved lyrics presets:', e);
    }
    return [];
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const presetImportInputRef = useRef<HTMLInputElement>(null);

  const handleSaveCurrentPreset = () => {
    if (customPresets.length >= 10) {
      showToast(language === 'vi' ? 'Đã đạt tối đa 10 presets! Vui lòng xóa bớt preset cũ.' : 'Max 10 presets reached! Please delete an existing preset.');
      return;
    }
    const name = newPresetName.trim() || `Preset ${customPresets.length + 1}`;
    const newPreset: LyricsPresetItem = {
      id: 'preset_' + Date.now(),
      name,
      createdAt: Date.now(),
      config: { ...config }
    };
    const updated = [newPreset, ...customPresets].slice(0, 10);
    setCustomPresets(updated);
    try {
      localStorage.setItem('sonawave_custom_lyrics_presets_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setNewPresetName('');
    setIsAddingPreset(false);
    showToast(language === 'vi' ? `Đã lưu preset "${name}"!` : `Preset "${name}" saved!`);
  };

  const handleDeletePreset = (id: string, name: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('sonawave_custom_lyrics_presets_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast(language === 'vi' ? `Đã xóa preset "${name}"!` : `Deleted preset "${name}"!`);
  };

  const handleStyleSelect = (newStyle: LyricsStyle) => {
    if (newStyle === 'karaoke-duo' && config.style !== 'karaoke-duo') {
      const converted = convertLyricsTo2LineKaraokeTiming(lyrics);
      onLyricsChange(converted);
      update({ style: newStyle });
      showToast(
        language === 'vi'
          ? 'Đã tự động căn chỉnh timing Karaoke 2 dòng (hiện cùng lúc & chữ chờ)!'
          : 'Auto-adapted lyrics timing for 2-line karaoke (display at once & cover text)!'
      );
    } else if (config.style === 'karaoke-duo' && newStyle !== 'karaoke-duo') {
      const restored = restoreOriginalLyricsTiming(lyrics);
      onLyricsChange(restored);
      update({ style: newStyle });
      showToast(
        language === 'vi'
          ? 'Đã khôi phục lại mốc timing lời bài hát gốc!'
          : 'Restored original lyrics timing!'
      );
    } else {
      update({ style: newStyle });
    }
  };

  const handleApplyPreset = (presetConfig: Partial<LyricsConfig>, name: string) => {
    if (presetConfig.style === 'karaoke-duo' && config.style !== 'karaoke-duo') {
      const converted = convertLyricsTo2LineKaraokeTiming(lyrics);
      onLyricsChange(converted);
    } else if (config.style === 'karaoke-duo' && presetConfig.style && presetConfig.style !== 'karaoke-duo') {
      const restored = restoreOriginalLyricsTiming(lyrics);
      onLyricsChange(restored);
    }
    onChange({ ...config, ...presetConfig });
    showToast(language === 'vi' ? `Đã áp dụng preset "${name}"!` : `Applied preset "${name}"!`);
  };

  const handleExportSinglePreset = (preset: LyricsPresetItem) => {
    const data = JSON.stringify({
      format: 'sonawave-lyrics-preset',
      version: 1,
      preset,
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = preset.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${safeName || 'lyrics_style'}.lyrics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(language === 'vi' ? `Đã tải xuống file ${a.download}!` : `Downloaded ${a.download}!`);
  };

  const handleExportAllPresets = () => {
    const data = JSON.stringify({
      format: 'sonawave-lyrics-presets-bundle',
      version: 1,
      exportedAt: new Date().toISOString(),
      presets: customPresets,
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonawave_lyrics_presets_${Date.now()}.lyrics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(language === 'vi' ? `Đã xuất ${customPresets.length} presets ra file .lyrics!` : `Exported ${customPresets.length} presets to .lyrics!`);
  };

  const handleImportPresetFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        let imported: LyricsPresetItem[] = [];
        if (parsed.format === 'sonawave-lyrics-presets-bundle' && Array.isArray(parsed.presets)) {
          imported = parsed.presets;
        } else if (parsed.format === 'sonawave-lyrics-preset' && parsed.preset) {
          imported = [parsed.preset];
        } else if (Array.isArray(parsed)) {
          imported = parsed;
        } else if (parsed.config) {
          imported = [{
            id: 'imported_' + Date.now(),
            name: parsed.name || file.name.replace(/\.(lyrics|json)$/i, ''),
            createdAt: Date.now(),
            config: parsed.config
          }];
        } else if (parsed.style || parsed.fontFamily) {
          imported = [{
            id: 'imported_' + Date.now(),
            name: file.name.replace(/\.(lyrics|json)$/i, '') || 'Custom Preset',
            createdAt: Date.now(),
            config: parsed
          }];
        }

        if (imported.length > 0) {
          const merged = [...imported, ...customPresets].slice(0, 10);
          setCustomPresets(merged);
          try {
            localStorage.setItem('sonawave_custom_lyrics_presets_v1', JSON.stringify(merged));
          } catch (err) {
            console.error(err);
          }
          if (imported[0]?.config) {
            handleApplyPreset(imported[0].config, imported[0].name);
          }
          showToast(language === 'vi' ? `Đã nạp ${imported.length} preset từ file .lyrics!` : `Imported ${imported.length} preset(s) from .lyrics!`);
        } else {
          showToast(language === 'vi' ? 'Không tìm thấy dữ liệu preset hợp lệ trong file .lyrics' : 'No valid preset found in .lyrics file');
        }
      } catch (err) {
        console.error(err);
        showToast(language === 'vi' ? 'Lỗi phân tích file .lyrics / JSON' : 'Failed to parse .lyrics / JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsed = parseAnyLyrics(content, duration || 60);
        const finalLyrics = config.style === 'karaoke-duo'
          ? convertLyricsTo2LineKaraokeTiming(parsed)
          : parsed;
        onLyricsChange(finalLyrics);
        showToast(
          language === 'vi' 
            ? `Đã nạp thành công ${finalLyrics.length} câu lời bài hát!` 
            : `Loaded ${finalLyrics.length} lyric lines!`
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
    const hasKaraoke = line.karaokeEndTime !== undefined || line.karaokeStartTime !== undefined;
    const kStartOffset = line.karaokeStartTime !== undefined ? line.karaokeStartTime - line.startTime : 0;
    const kEndOffset = line.karaokeEndTime !== undefined ? line.karaokeEndTime - line.startTime : (line.endTime - line.startTime);
    const newStart = parseFloat((line.endTime + 0.1).toFixed(2));
    const newEnd = parseFloat((line.endTime + (line.endTime - line.startTime) + 0.1).toFixed(2));
    const newLine: LyricLine = {
      ...line,
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      startTime: newStart,
      endTime: newEnd,
      ...(hasKaraoke ? {
        karaokeStartTime: parseFloat((newStart + kStartOffset).toFixed(2)),
        karaokeEndTime: parseFloat((newStart + kEndOffset).toFixed(2)),
      } : {}),
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
        const newEnd = l.endTime <= clamped ? parseFloat((clamped + 2.0).toFixed(2)) : l.endTime;
        const updated: LyricLine = {
          ...l,
          startTime: clamped,
          endTime: newEnd,
        };
        if (updated.karaokeStartTime !== undefined && updated.karaokeStartTime < clamped) {
          updated.karaokeStartTime = clamped;
        }
        if (updated.karaokeEndTime !== undefined && updated.karaokeEndTime > newEnd) {
          updated.karaokeEndTime = newEnd;
        }
        return updated;
      })
    );
  };

  const handleUpdateLineEndTime = (id: string, newEnd: number) => {
    const clamped = Math.max(0, parseFloat(newEnd.toFixed(2)));
    onLyricsChange(
      lyrics.map((l) => {
        if (l.id !== id) return l;
        const updated: LyricLine = { ...l, endTime: clamped };
        if (updated.karaokeEndTime !== undefined && updated.karaokeEndTime > clamped) {
          updated.karaokeEndTime = clamped;
        }
        return updated;
      })
    );
  };

  const handleUpdateKaraokeStartTime = (id: string, newKStart: number) => {
    const clamped = Math.max(0, parseFloat(newKStart.toFixed(2)));
    onLyricsChange(
      lyrics.map((l) => {
        if (l.id !== id) return l;
        const currentKEnd = l.karaokeEndTime !== undefined ? l.karaokeEndTime : l.endTime;
        const validKStart = Math.min(clamped, Math.max(l.startTime, currentKEnd - 0.1));
        return {
          ...l,
          karaokeStartTime: validKStart,
        };
      })
    );
  };

  const handleUpdateKaraokeEndTime = (id: string, newKEnd: number) => {
    const clamped = Math.max(0, parseFloat(newKEnd.toFixed(2)));
    onLyricsChange(
      lyrics.map((l) => {
        if (l.id !== id) return l;
        const currentKStart = l.karaokeStartTime !== undefined ? l.karaokeStartTime : l.startTime;
        const validKEnd = Math.min(l.endTime, Math.max(currentKStart + 0.1, clamped));
        return {
          ...l,
          karaokeEndTime: validKEnd,
        };
      })
    );
  };

  const handleUpdateKaraokeDuration = (id: string, newDuration: number) => {
    onLyricsChange(
      lyrics.map((l) => {
        if (l.id !== id) return l;
        const kStart = l.karaokeStartTime !== undefined ? l.karaokeStartTime : l.startTime;
        const maxDuration = Math.max(0.1, l.endTime - kStart);
        const clampedDuration = Math.min(maxDuration, Math.max(0.1, newDuration));
        const newKEnd = parseFloat((kStart + clampedDuration).toFixed(2));
        return {
          ...l,
          karaokeEndTime: newKEnd,
        };
      })
    );
  };

  const handleResetKaraokeTiming = (id: string) => {
    onLyricsChange(
      lyrics.map((l) => {
        if (l.id !== id) return l;
        const { karaokeStartTime, karaokeEndTime, ...rest } = l;
        return rest;
      })
    );
    showToast(language === 'vi' ? 'Đã khôi phục Karaoke theo thời gian câu!' : 'Reset karaoke timing to match line!');
  };

  const handleBatchAdjustKaraokeDuration = (offsetSeconds: number) => {
    onLyricsChange(
      lyrics.map((l) => {
        const lineDuration = l.endTime - l.startTime;
        if (offsetSeconds === 0) {
          const { karaokeStartTime, karaokeEndTime, ...rest } = l;
          return rest;
        }
        const targetDuration = Math.max(0.4, lineDuration - offsetSeconds);
        const newKEnd = parseFloat((l.startTime + targetDuration).toFixed(2));
        return {
          ...l,
          karaokeStartTime: l.startTime,
          karaokeEndTime: newKEnd,
        };
      })
    );
    showToast(
      offsetSeconds === 0
        ? (language === 'vi' ? 'Đã đặt lại thời gian Karaoke tất cả câu = 100%' : 'Reset all karaoke timing to 100%')
        : (language === 'vi' ? `Đã rút ngắn thời gian hát Karaoke toàn bộ câu đi ${offsetSeconds}s!` : `Shortened all karaoke singing by ${offsetSeconds}s!`)
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

  // Split all lyrics lines containing ',' or '.' into shorter proportional lines
  const handleSplitAllLyrics = () => {
    const beforeCount = lyrics.length;
    const split = splitAllLyricsByChars(lyrics, [',', '.']);
    if (split.length === beforeCount) {
      showToast(
        language === 'vi' 
          ? 'Không tìm thấy câu nào có dấu phẩy (,) hoặc chấm (.) để tách!' 
          : 'No lines with commas (,) or periods (.) found to split!'
      );
      return;
    }
    onLyricsChange(split);
    showToast(
      language === 'vi'
        ? `Đã tách từ ${beforeCount} câu thành ${split.length} câu theo dấu phẩy & chấm!`
        : `Split ${beforeCount} lines into ${split.length} lines by commas and periods!`
    );
  };

  // Split a single line by ',' or '.'
  const handleSplitSingleLine = (line: LyricLine) => {
    const split = splitLyricLineByChars(line, [',', '.']);
    if (split.length <= 1) {
      showToast(
        language === 'vi'
          ? 'Câu này không có dấu phẩy (,) hoặc chấm (.) để tách!'
          : 'This line has no commas or periods to split!'
      );
      return;
    }
    const idx = lyrics.findIndex((l) => l.id === line.id);
    if (idx === -1) return;
    const newLyrics = [...lyrics.slice(0, idx), ...split, ...lyrics.slice(idx + 1)];
    onLyricsChange(newLyrics);
    showToast(
      language === 'vi'
        ? `Đã tách câu thành ${split.length} câu nhỏ!`
        : `Split line into ${split.length} segments!`
    );
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

      {/* Hidden Batch Lyrics Input */}
      <input
        ref={batchLyricsInputRef}
        type="file"
        multiple
        accept=".srt,.lrc,.txt"
        className="hidden"
        onChange={handleBatchLyricsUpload}
      />

      {/* 0. Playlist Track Lyrics Switcher & Batch Synchronizer */}
      {playlist && playlist.tracks.length > 0 && (
        <div className="bg-gradient-to-br from-purple-950/40 via-neutral-900 to-neutral-900 border border-purple-500/30 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <ListMusic className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    {language === 'vi' ? 'Danh Sách Lời Bài Hát (Playlist Lyrics)' : 'Playlist Lyrics by Audio Track'}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    {playlist.tracks.filter((t) => t.lyrics && t.lyrics.length > 0).length}/{playlist.tracks.length} {language === 'vi' ? 'bài đã có lời' : 'tracks ready'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {language === 'vi'
                    ? 'Mỗi file nhạc có lời riêng. Chọn bài bên dưới để xem, sửa câu hát hoặc nạp file lời hàng loạt'
                    : 'Each track holds its own lyrics. Select a track below to view, edit, or batch-match lyrics'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => batchLyricsInputRef.current?.click()}
                title={language === 'vi' ? 'Nạp nhiều file .LRC/.SRT cùng lúc, hệ thống tự động ghép theo tên bài hát' : 'Batch import .lrc/.srt files'}
                className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-purple-300" />
                <span>{language === 'vi' ? 'Nạp Lời Hàng Loạt (.LRC/.SRT)' : 'Batch Lyrics (.lrc/.srt)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasteModalText(viewedTrack?.rawLyrics || '');
                  setIsPasteModalOpen(true);
                }}
                title={language === 'vi' ? 'Dán nhanh văn bản hoặc nội dung file lời cho bài này' : 'Quick paste lyrics text'}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>{language === 'vi' ? 'Dán Lời Nhanh' : 'Paste'}</span>
              </button>

              {onNavigateToPlaylistTab && (
                <button
                  type="button"
                  onClick={onNavigateToPlaylistTab}
                  title={language === 'vi' ? 'Chuyển sang Tab Danh Sách Nhạc' : 'Go to Playlist tab'}
                  className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Track Selector Horizontal Scrollable Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 custom-scrollbar">
            {playlist.tracks.map((track, idx) => {
              const isSelected = viewedTrack?.id === track.id;
              const isPlayingThis = currentPlayingTrack?.id === track.id;
              const hasLyrics = track.lyrics && track.lyrics.length > 0;

              return (
                <button
                  key={`${track.id || 'track'}-${idx}`}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/25 border-purple-400 text-white shadow-md ring-1 ring-purple-500/40'
                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[120px] sm:max-w-[160px] text-neutral-100">
                        {track.title}
                      </span>
                      {isPlayingThis && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] uppercase border border-rose-500/40 shrink-0 animate-pulse">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                      {hasLyrics ? (
                        <span className="text-purple-300 font-medium flex items-center gap-0.5">
                          <Mic2 className="w-2.5 h-2.5" /> {track.lyrics?.length} câu
                        </span>
                      ) : (
                        <span className="text-neutral-500 italic">Chưa có lời</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Track Controls Bar */}
          {viewedTrack && (
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">
                  {language === 'vi' ? 'Đang chỉnh sửa:' : 'Editing:'}
                </span>
                <span className="font-bold text-white max-w-[200px] truncate">
                  {viewedTrack.title}
                </span>
                {viewedTrack.lyricsFileName && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                    {viewedTrack.lyricsFileName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {onSelectTrackIndex && viewedTrack.id !== currentPlayingTrack?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const trackIndex = playlist.tracks.findIndex((t) => t.id === viewedTrack.id);
                      if (trackIndex >= 0) {
                        onSelectTrackIndex(trackIndex);
                      }
                    }}
                    title={language === 'vi' ? 'Phát bài hát này ngay trên Visualizer' : 'Play this track'}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-rose-300 fill-rose-300" />
                    <span>{language === 'vi' ? 'Phát Bài Này' : 'Play Track'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleApplyToAllTracks}
                  disabled={lyrics.length === 0}
                  title={language === 'vi' ? 'Áp dụng câu hát này cho toàn bộ danh sách' : 'Apply these lyrics to all tracks'}
                  className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-neutral-400" />
                  <span className="hidden sm:inline">{language === 'vi' ? 'Chép Cho Mọi Bài' : 'Copy All'}</span>
                </button>

                {lyrics.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearViewedLyrics}
                    title={language === 'vi' ? 'Xóa toàn bộ câu hát của bài này' : 'Clear lyrics'}
                    className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>{language === 'vi' ? 'Xóa Lời' : 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Paste Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Dán Lời Nhanh Cho Bài Hát' : 'Quick Paste Lyrics'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              {language === 'vi'
                ? 'Hỗ trợ dán file .LRC, .SRT có thẻ thời gian [00:12.34] hoặc chỉ văn bản lời từng dòng. Hệ thống sẽ tự phân bổ thời gian thông minh.'
                : 'Paste .LRC or .SRT formatted text with timestamps, or raw lyric lines.'}
            </p>

            <textarea
              rows={8}
              value={pasteModalText}
              onChange={(e) => setPasteModalText(e.target.value)}
              placeholder="[00:02.00] Dòng lời đầu tiên...&#10;[00:08.50] Dòng lời thứ hai...&#10;hoặc dán nguyên bài hát không cần thời gian"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-y"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSavePastedLyrics}
                disabled={!pasteModalText.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'vi' ? 'Lưu & Nạp Lời' : 'Save & Load'}</span>
              </button>
            </div>
          </div>
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

      {/* 1.5 Lyrics Presets Manager (Max 10 Presets) */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
              {language === 'vi' ? 'Quản Lý Lyrics Presets' : 'Lyrics Presets Manager'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {customPresets.length}/10
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              ref={presetImportInputRef}
              type="file"
              accept=".lyrics,.json"
              className="hidden"
              onChange={handleImportPresetFile}
            />
            <button
              type="button"
              onClick={() => presetImportInputRef.current?.click()}
              title={language === 'vi' ? 'Nhập file preset (.lyrics hoặc .json)' : 'Import .lyrics or .json file'}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium border border-neutral-700 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3 text-cyan-400" />
              <span>{language === 'vi' ? 'Nạp .lyrics' : 'Import'}</span>
            </button>

            {customPresets.length > 0 && (
              <button
                type="button"
                onClick={handleExportAllPresets}
                title={language === 'vi' ? 'Xuất toàn bộ preset ra file .lyrics' : 'Export all presets as .lyrics'}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium border border-neutral-700 transition-colors cursor-pointer"
              >
                <FolderDown className="w-3 h-3 text-emerald-400" />
                <span>{language === 'vi' ? 'Xuất hết .lyrics' : 'Export All'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddingPreset(!isAddingPreset)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>{language === 'vi' ? 'Lưu Preset' : 'Save Preset'}</span>
            </button>
          </div>
        </div>

        {/* Inline save preset form */}
        {isAddingPreset && (
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-purple-500/40 space-y-2 animate-fade-in">
            <span className="text-[11px] text-neutral-300 block font-medium">
              {language === 'vi' ? 'Đặt tên cho Style Lyrics hiện tại:' : 'Enter name for current style:'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder={language === 'vi' ? 'Ví dụ: Karaoke Neon 3D Luxury' : 'e.g. Neon Karaoke Duo'}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCurrentPreset();
                  if (e.key === 'Escape') setIsAddingPreset(false);
                }}
              />
              <button
                type="button"
                onClick={handleSaveCurrentPreset}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>{language === 'vi' ? 'Lưu' : 'Save'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingPreset(false)}
                className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Built-in Presets */}
        <div>
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
            {language === 'vi' ? 'Presets Có Sẵn (Studio Templates):' : 'Built-in Studio Presets:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BUILTIN_LYRICS_PRESETS.map((bp) => (
              <button
                key={bp.id}
                type="button"
                onClick={() => handleApplyPreset(bp.config, bp.name)}
                className="px-2.5 py-1 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 text-[11px] text-neutral-200 hover:text-white transition-all flex items-center gap-1.5 group cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>{bp.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Presets List */}
        {customPresets.length > 0 && (
          <div className="pt-2 border-t border-neutral-800/60">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1.5">
              {language === 'vi' ? `Presets Của Bạn (${customPresets.length}/10):` : `Your Presets (${customPresets.length}/10):`}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customPresets.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-purple-500/40 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(cp.config, cp.name)}
                    className="flex-1 text-left truncate mr-2 cursor-pointer"
                    title={language === 'vi' ? 'Nhấn để áp dụng preset này' : 'Click to apply preset'}
                  >
                    <span className="text-xs font-semibold text-neutral-200 block truncate hover:text-purple-300">
                      {cp.name}
                    </span>
                    <span className="text-[9px] text-neutral-500">
                      {new Date(cp.createdAt).toLocaleDateString()}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportSinglePreset(cp)}
                      title={language === 'vi' ? 'Tải file .lyrics về máy' : 'Download .lyrics file'}
                      className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(cp.id, cp.name)}
                      title={language === 'vi' ? 'Xóa preset này' : 'Delete preset'}
                      className="p-1 rounded-lg bg-neutral-800 hover:bg-rose-950/50 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              onClick={() => handleStyleSelect(st.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                config.style === st.id
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-md ring-1 ring-purple-500/30'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">
                  {language === 'vi' ? st.labelVi : st.labelEn}
                </span>
                {st.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-[9px] font-bold text-rose-300">
                    {st.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                {language === 'vi' ? st.descVi : st.descEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2.4 DEDICATED 2-LINE KARAOKE SETTINGS */}
      {config.style === 'karaoke-duo' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-purple-950/30 border border-indigo-500/40 space-y-3.5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                {language === 'vi' ? 'Cài Đặt Karaoke 2 Dòng (Duo Line Controls)' : '2-Line Karaoke Layout & Controls'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {language === 'vi' ? 'Dòng 1 Hát - Dòng 2 Chờ' : 'Alternating Lines'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {language === 'vi'
              ? 'Dòng 1 và Dòng 2 hiển thị rõ nét, đầy đủ. Dòng này đang hát quét màu thì dòng kia hiện trước câu kế tiếp ở dạng chữ mờ (màu mặc định #FFFFFF) để chuẩn bị sẵn, không lo trễ nhịp.'
              : 'Both lines are displayed clearly. While one line is singing with progressive highlight, the other line previews the next lyric in base color (#FFFFFF).'}
          </p>

          {/* Quick Timing Alignment Actions for Duo */}
          <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {language === 'vi' ? 'Đồng bộ Timing 2 Dòng (Hiện đồng thời & Chữ chờ):' : '2-Line Timing Sync (Simultaneous & Cover Text):'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-neutral-900 text-indigo-300 border border-indigo-500/30">
                {lyrics.some(l => l.originalStartTime !== undefined)
                  ? (language === 'vi' ? '✓ Đang bật 2 dòng' : '✓ 2-Line Active')
                  : (language === 'vi' ? 'Timing chuẩn' : 'Standard')}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-normal">
              {language === 'vi'
                ? 'Khi chọn Karaoke 2 dòng, hệ thống tự động căn thời gian để 2 dòng xuất hiện cùng lúc ngay từ đầu, dòng kế tiếp đóng vai trò chữ mờ (#FFFFFF) chờ sẵn. Khi chuyển lại kiểu 1/3/4 dòng, timing ban đầu sẽ tự động được khôi phục.'
                : 'When 2-Line Karaoke is selected, timing automatically adapts so both lines show at once with next line acting as cover text (#FFFFFF). Switching back restores original timing.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const converted = convertLyricsTo2LineKaraokeTiming(lyrics);
                  onLyricsChange(converted);
                  showToast(language === 'vi' ? 'Đã căn lại timing 2 dòng hiển thị đồng thời!' : 'Re-aligned 2-line simultaneous timing!');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'vi' ? 'Căn lại Timing 2 Dòng' : 'Re-align 2-Line Timing'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const restored = restoreOriginalLyricsTiming(lyrics);
                  onLyricsChange(restored);
                  showToast(language === 'vi' ? 'Đã khôi phục timing gốc ban đầu!' : 'Restored original timing!');
                }}
                className="py-1.5 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {language === 'vi' ? 'Khôi phục Timing Gốc' : 'Restore Original'}
              </button>
            </div>
          </div>

          {/* Quick Layout Presets for Duo */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
              {language === 'vi' ? 'Bố cục mẫu nhanh:' : 'Quick Layout Presets:'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => update({ duoLine1Y: 78, duoLine1X: 50, duoLine2Y: 86, duoLine2X: 50, duoAlignMode: 'center', duoLineGap: 32 })}
                className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white text-center transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Căn Giữa Chuẩn' : 'Standard Centered'}
              </button>
              <button
                type="button"
                onClick={() => update({ duoLine1Y: 76, duoLine1X: 38, duoLine2Y: 85, duoLine2X: 62, duoAlignMode: 'left-right', duoLineGap: 34 })}
                className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white text-center transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'So Le Trái - Phải' : 'Staggered Duo'}
              </button>
              <button
                type="button"
                onClick={() => update({ duoLine1Y: 82, duoLine1X: 50, duoLine2Y: 89, duoLine2X: 50, duoAlignMode: 'center', duoLineGap: 26 })}
                className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 hover:text-white text-center transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Cận Đáy Video' : 'Bottom Close'}
              </button>
            </div>
          </div>

          {/* Alignment Mode */}
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1 font-medium">
              {language === 'vi' ? 'Chế độ canh lề (Alignment Mode):' : 'Alignment Mode:'}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { id: 'center', labelVi: 'Căn giữa', labelEn: 'Center' },
                { id: 'left-right', labelVi: 'So le (T-P)', labelEn: 'Staggered' },
                { id: 'left', labelVi: 'Căn trái', labelEn: 'Left' },
                { id: 'right', labelVi: 'Căn phải', labelEn: 'Right' }
              ] as const).map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => update({ duoAlignMode: mode.id })}
                  className={`py-1 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    (config.duoAlignMode || 'center') === mode.id
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {language === 'vi' ? mode.labelVi : mode.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Position Line 1 and Line 2 Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
            {/* Line 1 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-300 block">
                {language === 'vi' ? 'Dòng 1 (Câu Chẵn 0, 2, 4...):' : 'Line 1 (Even Lines):'}
              </span>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Vị trí dọc (Y)</span>
                  <span className="text-indigo-400 font-mono">{config.duoLine1Y ?? 78}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  value={config.duoLine1Y ?? 78}
                  onChange={(e) => update({ duoLine1Y: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Vị trí ngang (X)</span>
                  <span className="text-indigo-400 font-mono">{config.duoLine1X ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={config.duoLine1X ?? 50}
                  onChange={(e) => update({ duoLine1X: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Line 2 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-300 block">
                {language === 'vi' ? 'Dòng 2 (Câu Lẻ 1, 3, 5...):' : 'Line 2 (Odd Lines):'}
              </span>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Vị trí dọc (Y)</span>
                  <span className="text-purple-400 font-mono">{config.duoLine2Y ?? 86}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={92}
                  value={config.duoLine2Y ?? 86}
                  onChange={(e) => update({ duoLine2Y: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Vị trí ngang (X)</span>
                  <span className="text-purple-400 font-mono">{config.duoLine2X ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={config.duoLine2X ?? 50}
                  onChange={(e) => update({ duoLine2X: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Line Gap */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-neutral-400">{language === 'vi' ? 'Khoảng cách giữa 2 dòng' : 'Line Gap'}</span>
              <span className="text-indigo-400 font-mono">{config.duoLineGap ?? 32}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={config.duoLineGap ?? 32}
              onChange={(e) => update({ duoLineGap: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}

      {/* 2.4.1 DEDICATED MINIMALIST GLOW SETTINGS (Auto 2 lines for 9:16 vertical screens) */}
      {config.style === 'minimal-glow' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-neutral-900 to-sky-950/30 border border-purple-500/40 space-y-3.5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                {language === 'vi' ? 'Cài Đặt Phát Sáng Tối Giản (Minimalist Glow)' : 'Minimalist Glow Settings'}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Smartphone className="w-3 h-3 text-purple-300" />
              {language === 'vi' ? 'Tối Ưu 9:16 TikTok / Shorts' : '9:16 Video Fit'}
            </span>
          </div>

          {/* Checkbox Auto Turn 1 Line into 2 Lines */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/40 cursor-pointer transition-colors group">
            <input
              type="checkbox"
              checked={!!config.minimalGlowAutoTwoLines}
              onChange={(e) => update({ minimalGlowAutoTwoLines: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-purple-500 border-neutral-700 bg-neutral-800 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
            />
            <div className="space-y-1 select-none flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  {language === 'vi'
                    ? 'Tự động chia 1 câu thành 2 dòng (Tối ưu màn hình dọc 9:16)'
                    : 'Auto wrap 1 line into two lines on screen (Best fit for 9:16 vertical)'}
                </span>
                {config.minimalGlowAutoTwoLines && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    ON
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {language === 'vi'
                  ? 'Tự động cân đối và ngắt 1 câu lời bài hát thành 2 dòng ngắn hiển thị cùng lúc (dòng trên & dòng dưới), giúp chữ to rõ, không bị tràn mép màn hình khi dựng video khung dọc 9:16 (TikTok, YouTube Shorts, Reels).'
                  : 'Automatically balances and splits a long lyric line into two clean lines on screen, preventing edge overflow and keeping fonts large & readable on 9:16 vertical videos (TikTok, Shorts, Reels).'}
              </p>
            </div>
          </label>

          {/* Line gap setting when enabled */}
          {config.minimalGlowAutoTwoLines && (
            <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-purple-400" />
                  {language === 'vi' ? 'Khoảng cách giữa 2 dòng (Line Gap):' : 'Gap between 2 lines:'}
                </span>
                <span className="font-mono text-purple-400 font-bold">
                  {config.minimalGlowLineGap ?? Math.round((config.fontSize || 24) * 1.35)}px
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="80"
                step="2"
                value={config.minimalGlowLineGap ?? Math.round((config.fontSize || 24) * 1.35)}
                onChange={(e) => update({ minimalGlowLineGap: Number(e.target.value) })}
                className="w-full accent-purple-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>18px ({language === 'vi' ? 'Sát' : 'Tight'})</span>
                <span>36px ({language === 'vi' ? 'Chuẩn' : 'Normal'})</span>
                <span>80px ({language === 'vi' ? 'Rộng' : 'Spaced'})</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2.5 DEDICATED KARAOKE SWEEP & FLYING EFFECT MODE */}
      {(config.style === 'karaoke-single' || config.style === 'karaoke-duo' || config.style === 'teleprompter-4lines' || config.style === 'karaoke') && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-neutral-900 to-amber-950/30 border border-purple-500/30 space-y-3 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                {t.karaokeSweepMode || 'Cách Chạy Chữ Karaoke (Karaoke Sweep Mode)'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {language === 'vi' ? '3 Tùy Chọn Mới' : '3 Cursor Modes'}
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
                          {language === 'vi' ? km.labelVi : km.labelEn}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 block leading-tight">
                      {language === 'vi' ? km.descVi : km.descEn}
                    </span>
                  </div>

                  {(km.badgeVi || km.badgeEn) && (
                    <div className="mt-2 pt-1.5 border-t border-neutral-800/60 flex justify-end">
                      <span className="text-[9px] font-semibold text-amber-300">
                        {language === 'vi' ? km.badgeVi : km.badgeEn}
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
          <div className="space-y-3">
            {/* 3D Shadow Specialized Controls */}
            {config.fontEffect === '3d-shadow' && (
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    {language === 'vi' ? 'Tùy Chỉnh Đổ Bóng Nổi 3D' : '3D Extrusion Shadow Settings'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {config.threeDDepth || 6}px • {config.threeDAngle ?? 135}°
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-400">{language === 'vi' ? 'Độ sâu khối 3D (Depth)' : '3D Depth'}</span>
                      <span className="text-rose-400 font-mono">{config.threeDDepth || 6}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={25}
                      value={config.threeDDepth || 6}
                      onChange={(e) => update({ threeDDepth: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1">
                      {language === 'vi' ? 'Màu bóng khối 3D' : '3D Extrusion Color'}
                    </span>
                    <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5">
                      <input
                        type="color"
                        value={config.threeDColor || '#1a0033'}
                        onChange={(e) => update({ threeDColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono uppercase">{config.threeDColor || '#1a0033'}</span>
                    </div>
                  </div>
                </div>

                {/* Angle Controls */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">{language === 'vi' ? 'Góc đổ bóng 3D' : 'Shadow Angle'}</span>
                    <span className="text-rose-400 font-mono">{config.threeDAngle ?? 135}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={config.threeDAngle ?? 135}
                    onChange={(e) => update({ threeDAngle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[
                      { angle: 135, label: '↘ Dưới-Phải' },
                      { angle: 90, label: '↓ Thẳng Dưới' },
                      { angle: 45, label: '↙ Dưới-Trái' },
                      { angle: 225, label: '↗ Trên-Phải' },
                    ].map(btn => (
                      <button
                        key={btn.angle}
                        type="button"
                        onClick={() => update({ threeDAngle: btn.angle })}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-medium border text-center transition-all cursor-pointer ${
                          (config.threeDAngle ?? 135) === btn.angle
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={config.threeDStroke ?? true}
                    onChange={(e) => update({ threeDStroke: e.target.checked })}
                    className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
                  />
                  <span>{language === 'vi' ? 'Viền ngoài nổi khối sắc nét (Bevel Edge)' : 'Outer Bevel Outline'}</span>
                </label>
              </div>
            )}

            {/* Gradient Fill Specialized Controls */}
            {config.fontEffect === 'gradient-fill' && (
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    {language === 'vi' ? 'Dải Màu Gradient & Chủ Đề Sắc Màu' : 'Gradient Themes & Color Stops'}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {config.gradientAngle ?? 90}°
                  </span>
                </div>

                {/* Color Themes List */}
                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                    {language === 'vi' ? 'Chọn nhanh Color Theme:' : 'Preset Color Themes:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {LYRICS_GRADIENT_THEMES.map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => update({
                          gradientTheme: theme.id,
                          gradientColor1: theme.colors[0],
                          gradientColor2: theme.colors[1],
                          gradientColor3: theme.colors[2] || theme.colors[1],
                          gradientAngle: theme.angle ?? 90
                        })}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          (config.gradientTheme || 'cyber-neon') === theme.id
                            ? 'bg-purple-500/20 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/30'
                            : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}${theme.colors[2] ? `, ${theme.colors[2]}` : ''})`
                          }}
                        />
                        <span className="text-[10px] font-semibold truncate">
                          {language === 'vi' ? theme.nameVi : theme.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 Color Pickers */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Màu 1 (Đầu)</span>
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                      <input
                        type="color"
                        value={config.gradientColor1 || '#38bdf8'}
                        onChange={(e) => update({ gradientColor1: e.target.value, gradientTheme: 'custom' })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono uppercase">{config.gradientColor1 || '#38bdf8'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Màu 2 (Giữa)</span>
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                      <input
                        type="color"
                        value={config.gradientColor2 || '#c084fc'}
                        onChange={(e) => update({ gradientColor2: e.target.value, gradientTheme: 'custom' })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono uppercase">{config.gradientColor2 || '#c084fc'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Màu 3 (Cuối)</span>
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                      <input
                        type="color"
                        value={config.gradientColor3 || '#f43f5e'}
                        onChange={(e) => update({ gradientColor3: e.target.value, gradientTheme: 'custom' })}
                        className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] font-mono uppercase">{config.gradientColor3 || '#f43f5e'}</span>
                    </div>
                  </div>
                </div>

                {/* Gradient Angle Slider */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-400">{language === 'vi' ? 'Góc xoay gradient' : 'Gradient Angle'}</span>
                    <span className="text-purple-400 font-mono">{config.gradientAngle ?? 90}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={config.gradientAngle ?? 90}
                    onChange={(e) => update({ gradientAngle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            )}

            {/* General Effect Color & Stroke for other styles */}
            {config.fontEffect !== '3d-shadow' && config.fontEffect !== 'gradient-fill' && (
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

        {/* Font Size & Position Y & Position X */}
        <div className="grid grid-cols-3 gap-2">
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
              <span className="text-neutral-400">{t.lyricsPosition || 'Vị trí dọc (Y)'}</span>
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

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-400">{language === 'vi' ? 'Vị trí ngang (X)' : 'Horizontal (X)'}</span>
              <span className="text-purple-400 font-mono">{config.positionX !== undefined ? config.positionX : 50}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={90}
              value={config.positionX !== undefined ? config.positionX : 50}
              onChange={(e) => update({ positionX: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Color Pickers (3 columns: Base Text Color, Active Color, Glow Tint) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">
              {language === 'vi' ? 'Màu chữ gốc (Chờ hát)' : 'Lyric text color'}
            </span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5">
              <input
                type="color"
                value={config.color || '#ffffff'}
                onChange={(e) => update({ color: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono uppercase">{config.color || '#ffffff'}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 block mb-1">
              {t.activeTextColor || 'Màu câu đang hát'}
            </span>
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
            <span className="text-[11px] text-neutral-400 block mb-1">
              {t.textGlowColor || 'Màu hào quang (Glow)'}
            </span>
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
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
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

      {/* 5. In / Out Transitions for Lyrics */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {language === 'vi' ? 'Hiệu Ứng Xuất Hiện & Biến Mất (In / Out FX)' : 'In / Out Lyrics Transitions'}
          </label>
          {((config.inEffect && config.inEffect !== 'none') || (config.outEffect && config.outEffect !== 'none')) && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {language === 'vi' ? 'Đang bật FX' : 'Active'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* In Effect */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              {language === 'vi' ? 'Hiệu ứng xuất hiện (In-Effect):' : 'In-Effect:'}
            </span>
            <select
              value={config.inEffect || 'fade'}
              onChange={(e) => update({ inEffect: e.target.value as LyricsInEffect })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              {IN_EFFECTS.map((eff) => (
                <option key={eff.id} value={eff.id}>
                  {language === 'vi' ? eff.labelVi : eff.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Out Effect */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1">
              {language === 'vi' ? 'Hiệu ứng biến mất (Out-Effect):' : 'Out-Effect:'}
            </span>
            <select
              value={config.outEffect || 'fade'}
              onChange={(e) => update({ outEffect: e.target.value as LyricsOutEffect })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              {OUT_EFFECTS.map((eff) => (
                <option key={eff.id} value={eff.id}>
                  {language === 'vi' ? eff.labelVi : eff.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transition Duration Slider */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-neutral-400">
              {language === 'vi' ? 'Thời gian chuyển cảnh (Transition Duration)' : 'Transition Duration'}
            </span>
            <span className="text-amber-400 font-mono">
              {(config.inOutDuration ?? 0.35).toFixed(2)}s
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={config.inOutDuration ?? 0.35}
            onChange={(e) => update({ inOutDuration: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* 6. Clean Lyrics List with Compact Time Badges & Edit Popup Button */}
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
              onClick={handleSplitAllLyrics}
              title={language === 'vi' ? 'Tách câu theo dấu phẩy (,) hoặc chấm (.) thành các câu ngắn' : 'Split lyrics lines by comma (,) or period (.)'}
              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold hidden sm:inline">
                {language === 'vi' ? 'Tách câu (, .)' : 'Split (, .)'}
              </span>
            </button>

            {/* Quick Batch Karaoke Sweep Adjuster */}
            {isKaraokeMode && lyrics.length > 0 && (
              <div 
                className="flex items-center bg-amber-500/10 border border-amber-500/30 rounded-xl px-2 py-0.5 text-xs text-amber-300"
                title="Căn chỉnh thời gian quét Karaoke cho toàn bộ các câu"
              >
                <Mic2 className="w-3 h-3 text-amber-400 mr-1.5 shrink-0" />
                <span className="text-[10px] font-bold mr-1.5 hidden md:inline">Karaoke:</span>
                <button
                  type="button"
                  onClick={() => handleBatchAdjustKaraokeDuration(0.5)}
                  title="Rút ngắn thời gian quét Karaoke của tất cả câu sớm hơn 0.5s để chữ giữ lại sau khi hát"
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-neutral-950 text-[10px] font-mono text-amber-200 transition-colors cursor-pointer"
                >
                  -0.5s
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchAdjustKaraokeDuration(1.0)}
                  title="Rút ngắn thời gian quét Karaoke của tất cả câu sớm hơn 1.0s để chữ giữ lại sau khi hát"
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-neutral-950 text-[10px] font-mono text-amber-200 ml-1 transition-colors cursor-pointer"
                >
                  -1.0s
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchAdjustKaraokeDuration(0)}
                  title="Khôi phục thời gian quét Karaoke của tất cả câu khớp 100% thời gian hiển thị"
                  className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-400 hover:text-white ml-1 transition-colors cursor-pointer"
                >
                  ↺ 100%
                </button>
              </div>
            )}

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

                    {/* Duplicate, Split & Delete Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {(line.text.includes(',') || line.text.includes('.')) && (
                        <button
                          type="button"
                          onClick={() => handleSplitSingleLine(line)}
                          title={language === 'vi' ? 'Tách câu này theo dấu phẩy (,) hoặc chấm (.)' : 'Split this line by comma or period'}
                          className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                        </button>
                      )}

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

                      {/* Karaoke Timing Badge (when in karaoke mode or customized) */}
                      {(isKaraokeMode || line.karaokeEndTime !== undefined || line.karaokeStartTime !== undefined) && (() => {
                        const kStart = line.karaokeStartTime !== undefined ? line.karaokeStartTime : line.startTime;
                        const kEnd = line.karaokeEndTime !== undefined ? line.karaokeEndTime : line.endTime;
                        const kDur = Math.max(0, kEnd - kStart);
                        const isCustom = line.karaokeEndTime !== undefined || line.karaokeStartTime !== undefined;
                        return (
                          <div 
                            title={isCustom ? `Thời gian quét Karaoke: ${formatTimeSub(kStart)} ➔ ${formatTimeSub(kEnd)} (${kDur.toFixed(1)}s)` : 'Thời gian quét Karaoke theo thời gian câu'}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-colors ${
                              isCustom 
                                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm' 
                                : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                            }`}
                          >
                            <Mic2 className={`w-3 h-3 shrink-0 ${isCustom ? 'text-amber-400' : 'text-neutral-500'}`} />
                            <span className="text-[10px] font-sans font-medium text-neutral-400">Karaoke:</span>
                            <span className={isCustom ? 'text-amber-200 font-bold' : 'text-neutral-300'}>{formatTimeSub(kStart)}</span>
                            <span className="text-neutral-500">➔</span>
                            <span className={isCustom ? 'text-amber-200 font-bold' : 'text-neutral-300'}>{formatTimeSub(kEnd)}</span>
                            <span className={`text-[10px] font-sans font-semibold pl-0.5 ${isCustom ? 'text-amber-300' : 'text-neutral-400'}`}>
                              ({kDur.toFixed(1)}s)
                            </span>
                            {isCustom && line.endTime > kEnd && (
                              <span className="text-[9px] font-sans bg-amber-500/25 text-amber-300 px-1 rounded ml-0.5">
                                giữ {(line.endTime - kEnd).toFixed(1)}s
                              </span>
                            )}
                          </div>
                        );
                      })()}

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

                  {/* Inline Karaoke Timing Editor Bar (khi chọn chế độ Karaoke) */}
                  {isKaraokeMode && (() => {
                    const kStart = line.karaokeStartTime !== undefined ? line.karaokeStartTime : line.startTime;
                    const kEnd = line.karaokeEndTime !== undefined ? line.karaokeEndTime : line.endTime;
                    const kDur = Math.max(0.1, kEnd - kStart);
                    const isCustom = line.karaokeEndTime !== undefined || line.karaokeStartTime !== undefined;
                    const holdSecs = Math.max(0, line.endTime - kEnd);

                    return (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2 flex-wrap bg-amber-950/20 p-2 rounded-xl border">
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 flex-wrap">
                          <Mic2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold text-[11px] text-amber-200">Karaoke Timing:</span>
                          <span className="font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 text-[11px]">
                            {formatTimeSub(kStart)} ➔ {formatTimeSub(kEnd)}
                          </span>
                          <span className="font-mono text-amber-400 text-[11px] font-bold">
                            ({kDur.toFixed(1)}s)
                          </span>
                          {holdSecs > 0.05 && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
                              giữ chữ {holdSecs.toFixed(1)}s
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateKaraokeEndTime(line.id, Math.max(kStart + 0.3, kEnd - 0.5))}
                            title="Rút ngắn thời gian quét Karaoke 0.5s"
                            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-neutral-950 text-amber-200 text-[10px] font-mono font-bold transition-all cursor-pointer border border-amber-500/30"
                          >
                            -0.5s
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateKaraokeEndTime(line.id, Math.min(line.endTime, kEnd + 0.5))}
                            title="Kéo dài thời gian quét Karaoke 0.5s"
                            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-neutral-950 text-amber-200 text-[10px] font-mono font-bold transition-all cursor-pointer border border-amber-500/30"
                          >
                            +0.5s
                          </button>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => handleResetKaraokeTiming(line.id)}
                              title="Khôi phục khớp 100% thời gian câu"
                              className="px-1.5 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-[10px] transition-colors cursor-pointer"
                            >
                              ↺
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingLineId(line.id)}
                            title="Chỉnh chi tiết thời gian Karaoke"
                            className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Chỉnh Timing</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
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

            {/* KARAOKE SWEEP TIMING CONTROLLER (Chỉnh thời gian quét màu Karaoke của câu) */}
            {(() => {
              const curKStart = editingLine.karaokeStartTime !== undefined ? editingLine.karaokeStartTime : editingLine.startTime;
              const curKEnd = editingLine.karaokeEndTime !== undefined ? editingLine.karaokeEndTime : editingLine.endTime;
              const curKDuration = Math.max(0.1, curKEnd - curKStart);
              const lineDuration = Math.max(0.1, editingLine.endTime - editingLine.startTime);
              const hasCustomKaraoke = editingLine.karaokeEndTime !== undefined || editingLine.karaokeStartTime !== undefined;
              const holdTailSeconds = Math.max(0, editingLine.endTime - curKEnd);

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-neutral-950/90 to-amber-950/20 border border-amber-500/40 space-y-3.5 shadow-lg relative overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-sm">
                        <Mic2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          {t.karaokeTimingTitle || 'Thời Gian Quét Màu Karaoke'}
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Karaoke Timing
                          </span>
                        </h4>
                        <p className="text-[11px] text-neutral-300">
                          {t.karaokeTimingDesc || 'Thời gian ca sĩ hát xong câu (chữ sẽ quét màu xong và giữ hiển thị trên màn hình cho tới hết câu).'}{' '}
                          <span className="text-amber-300 font-medium">
                            Ví dụ: time của câu 00:10.0 ➔ 00:14.8 (4.8s) thì karaoke timing 00:10.0 ➔ 00:12.8 (2.8s) — giữ chữ thêm 2.0s.
                          </span>
                        </p>
                      </div>
                    </div>

                    {hasCustomKaraoke && (
                      <button
                        type="button"
                        onClick={() => handleResetKaraokeTiming(editingLine.id)}
                        className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-[11px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
                        title="Khôi phục thời gian quét Karaoke theo thời gian hiển thị câu"
                      >
                        ↺ {t.resetKaraokeDefault || 'Đặt lại theo câu'}
                      </button>
                    )}
                  </div>

                  {/* Side-by-Side Comparison Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase text-neutral-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>Hiển thị trên màn hình:</span>
                      </div>
                      <div className="font-mono text-purple-300 font-bold text-xs flex items-center gap-1.5">
                        <span>{formatTimeSub(editingLine.startTime)}</span>
                        <span className="text-neutral-500">➔</span>
                        <span className="text-rose-300">{formatTimeSub(editingLine.endTime)}</span>
                        <span className="text-neutral-400 font-normal text-[11px]">({lineDuration.toFixed(1)}s)</span>
                      </div>
                    </div>

                    <div className="space-y-1 sm:border-l sm:border-neutral-800 sm:pl-3">
                      <div className="text-[10px] uppercase text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Quét chữ Karaoke:</span>
                      </div>
                      <div className="font-mono text-amber-300 font-bold text-xs flex items-center gap-1.5">
                        <span>{formatTimeSub(curKStart)}</span>
                        <span className="text-neutral-500">➔</span>
                        <span>{formatTimeSub(curKEnd)}</span>
                        <span className="text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded text-[11px]">
                          ({curKDuration.toFixed(1)}s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration Slider + Presets */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium">
                        {t.karaokeSweepDuration || 'Thời lượng quét chữ Karaoke'}:
                      </span>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        {curKDuration.toFixed(1)}s / {(editingLine.endTime - curKStart).toFixed(1)}s
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0.2}
                      max={Math.max(0.4, editingLine.endTime - curKStart)}
                      step={0.1}
                      value={curKDuration}
                      onChange={(e) => handleUpdateKaraokeDuration(editingLine.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      <span className="text-[10px] text-neutral-400 mr-1">Nhanh:</span>
                      {[
                        { label: '100% (Hết câu)', dur: editingLine.endTime - curKStart },
                        { label: '-0.5s', dur: Math.max(0.3, editingLine.endTime - curKStart - 0.5) },
                        { label: '-1.0s', dur: Math.max(0.3, editingLine.endTime - curKStart - 1.0) },
                        { label: '-1.5s', dur: Math.max(0.3, editingLine.endTime - curKStart - 1.5) },
                        { label: '-2.0s', dur: Math.max(0.3, editingLine.endTime - curKStart - 2.0) },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleUpdateKaraokeDuration(editingLine.id, preset.dur)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer border ${
                            Math.abs(curKDuration - preset.dur) < 0.05
                              ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-sm'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Precise Karaoke End Time Input + Steppers + Set to Current Playhead */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-300">
                        {t.karaokeSingingEndTime || 'Thời điểm hát xong (Karaoke End Time)'}:
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        {formatTimeSub(curKEnd)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.05"
                          min={curKStart}
                          max={editingLine.endTime}
                          value={curKEnd}
                          onChange={(e) => handleUpdateKaraokeEndTime(editingLine.id, parseFloat(e.target.value) || curKStart)}
                          className="w-full bg-neutral-900 border border-amber-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">giây</span>
                      </div>

                      {/* Sync with current playing song */}
                      <button
                        type="button"
                        onClick={() => handleUpdateKaraokeEndTime(editingLine.id, currentTime)}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                        title="Gán thời điểm ca sĩ hát xong = vị trí bài hát đang phát"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>= Hiện tại ({formatTimeSub(currentTime)})</span>
                      </button>
                    </div>

                    {/* Fast Steppers */}
                    <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateKaraokeEndTime(editingLine.id, curKEnd - 1.0)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                        >
                          -1.0s
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKaraokeEndTime(editingLine.id, curKEnd - 0.2)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                        >
                          -0.2s
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKaraokeEndTime(editingLine.id, curKEnd - 0.05)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                        >
                          -0.05s
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKaraokeEndTime(editingLine.id, curKEnd + 0.05)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                        >
                          +0.05s
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKaraokeEndTime(editingLine.id, curKEnd + 0.2)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                        >
                          +0.2s
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKaraokeEndTime(editingLine.id, curKEnd + 1.0)}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300"
                        >
                          +1.0s
                        </button>
                      </div>

                      {holdTailSeconds > 0.05 && (
                        <span className="text-[11px] text-amber-300 font-medium">
                          ✓ {t.holdVisibleAfterSinging || 'Chữ giữ hiển thị sau khi hát'}: <strong>{holdTailSeconds.toFixed(1)}s</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

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
