import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  AspectRatio,
  VisualizerConfig,
  LyricsConfig,
  BackgroundConfig,
  ParticleConfig,
  TrackMetadata,
  LyricLine,
  ExportSettings,
  PresetTheme,
  TextBoxItem,
  FilmLightConfig,
  ColorGradingConfig,
  MasterEQConfig,
  SceneTransitionsConfig,
  HardwareAccelerationConfig,
  HardwareInfo,
  PlaylistConfig,
  AudioTrackItem,
  PlaylistRepeatMode,
  LottieItem,
  DEFAULT_LOTTIES,
} from './types';
import {
  DEFAULT_VISUALIZER,
  DEFAULT_LOW_HARDWARE_VISUALIZER,
  DEFAULT_LYRICS,
  DEFAULT_BACKGROUND,
  DEFAULT_PARTICLES,
  DEFAULT_LOW_HARDWARE_PARTICLES,
  DEFAULT_TRACK,
  DEFAULT_TEXT_BOXES,
  DEFAULT_FILM_LIGHT,
  DEFAULT_COLOR_GRADING,
  DEFAULT_MASTER_EQ,
  DEFAULT_SCENE_TRANSITIONS,
  SAMPLE_SRT_LOFI,
  SAMPLE_SRT_SYNTHWAVE,
  SAMPLE_SRT_ACOUSTIC,
} from './utils/presets';
import { parseAnyLyrics } from './utils/lyricsParser';
import { AudioEngine } from './utils/audioEngine';
import { VisualizerRenderer } from './utils/visualizerRenderer';
import { VideoExporter } from './utils/videoExporter';
import {
  detectHardwareInfo,
  getSavedHardwareConfig,
  saveHardwareConfig,
  DEFAULT_HARDWARE_CONFIG,
  DEFAULT_LOW_HARDWARE_CONFIG,
  isLowEndDevice,
  HardwarePerformanceTracker,
} from './utils/hardwareAcceleration';
import {
  SavedProject,
  saveAutoSave,
  getAutoSave,
  hasAutoSave,
  clearAutoSave,
} from './utils/projectStorage';
import { Language, getSavedLanguage, saveLanguage, TRANSLATIONS } from './utils/i18n';
import { Header } from './components/Header';
import { CanvasStage } from './components/CanvasStage';
import { VisualizerTab } from './components/VisualizerTab';
import { LyricsTab } from './components/LyricsTab';
import { BackgroundTab } from './components/BackgroundTab';
import { SceneTransitionsTab } from './components/SceneTransitionsTab';
import { FilmLightTab } from './components/FilmLightTab';
import { ColorGradingTab } from './components/ColorGradingTab';
import { TrackTab } from './components/TrackTab';
import { TextBoxTab } from './components/TextBoxTab';
import { PresetsModal } from './components/PresetsModal';
import { ProjectsModal } from './components/ProjectsModal';
import { ExportModal } from './components/ExportModal';
import { MasterEQModal } from './components/MasterEQModal';
import { GlobalSettingsModal } from './components/GlobalSettingsModal';
import { NewProjectModal, NewProjectHardwareProfile } from './components/NewProjectModal';
import { AudioPlaylistTab } from './components/AudioPlaylistTab';
import { LottieTab } from './components/LottieTab';
import {
  DEFAULT_PLAYLIST_CONFIG,
  getSavedPlaylist,
  savePlaylist,
  ensureUniqueTrackIds,
  calculateFadeMultiplier,
  generateTracklistContent,
  matchLyricsFilesToTracks,
} from './utils/playlistManager';

import {
  BarChart2,
  FileText,
  ImageIcon,
  Layers,
  Sparkles,
  Palette,
  Disc,
  Type,
  ListMusic,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function App() {
  // 1. Core Studio Configurations
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [visualizer, setVisualizer] = useState<VisualizerConfig>(DEFAULT_VISUALIZER);
  const [lyricsConfig, setLyricsConfig] = useState<LyricsConfig>(DEFAULT_LYRICS);
  const [playlist, setPlaylist] = useState<PlaylistConfig>(() => getSavedPlaylist());
  const playlistRef = useRef<PlaylistConfig>(playlist);
  playlistRef.current = playlist;

  const [lyricsData, setLyricsData] = useState<LyricLine[]>(() => {
    const savedPl = getSavedPlaylist();
    const curTrack = savedPl.tracks[savedPl.currentIndex];
    if (curTrack?.lyrics && curTrack.lyrics.length > 0) {
      return curTrack.lyrics;
    }
    return parseAnyLyrics(SAMPLE_SRT_SYNTHWAVE, 30);
  });

  const [defaultBackground, setDefaultBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);

  const [background, setBackground] = useState<BackgroundConfig>(() => {
    const savedPl = getSavedPlaylist();
    const curTrack = savedPl.tracks[savedPl.currentIndex];
    return curTrack?.background || DEFAULT_BACKGROUND;
  });
  const [particles, setParticles] = useState<ParticleConfig>(DEFAULT_PARTICLES);
  const [filmLight, setFilmLight] = useState<FilmLightConfig>(DEFAULT_FILM_LIGHT);
  const [colorGrading, setColorGrading] = useState<ColorGradingConfig>(DEFAULT_COLOR_GRADING);
  const [track, setTrack] = useState<TrackMetadata>(DEFAULT_TRACK);
  const [textBoxes, setTextBoxes] = useState<TextBoxItem[]>(DEFAULT_TEXT_BOXES);
  const [sceneTransitions, setSceneTransitions] = useState<SceneTransitionsConfig>(DEFAULT_SCENE_TRANSITIONS);

  // 2. Audio Engine & State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.85);
  const [isLooping, setIsLooping] = useState(true);
  const [audioFileName, setAudioFileName] = useState('Neon_Synthwave_Demo.wav');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [sampleAudioType, setSampleAudioType] = useState<'lofi' | 'synthwave' | 'acoustic' | 'edm'>('synthwave');
  const [detectedBpm, setDetectedBpm] = useState<number>(120);
  const [isDetectingBpm, setIsDetectingBpm] = useState<boolean>(false);
  const currentAudioBlobRef = useRef<Blob | File | null>(null);

  // Lottie Animation Overlays State
  const [lotties, setLotties] = useState<LottieItem[]>(() => {
    try {
      const saved = localStorage.getItem('sonawave_lotties_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy default vinyl-record-spin if it was auto-seeded
          const filtered = parsed.filter((item: any) => item && item.id !== 'vinyl-record-spin');
          return filtered.map((item: any) => ({
            ...item,
            // Clean out external failing CDN URLs on default items
            url: item.url && item.url.includes('assets2.lottiefiles.com/packages/lf20_m6cuL6') ? '' : (item.url || ''),
            // Ensure animationData is only kept if it is a valid object
            animationData: item.animationData && typeof item.animationData === 'object' && item.animationData.v ? item.animationData : undefined,
          }));
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_LOTTIES;
  });
  const [selectedLottieId, setSelectedLottieId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('sonawave_lotties_v1', JSON.stringify(lotties));
    } catch {
      // ignore
    }
  }, [lotties]);

  // 3. UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<
    'visualizer' | 'lyrics' | 'background' | 'transitions' | 'filmlight' | 'colorgrading' | 'track' | 'textboxes' | 'playlist' | 'lottie'
  >('visualizer');

  // Desktop Horizontal Tab Scrolling State & Navigation
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(true);

  const checkTabsScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollTabsLeft(scrollLeft > 4);
    setCanScrollTabsRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const scrollAmount = 180;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkTabsScroll, 320);
  };

  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    checkTabsScroll();
    el.addEventListener('scroll', checkTabsScroll, { passive: true });
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      el.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, [checkTabsScroll]);

  // Scroll active tab into view whenever activeTab changes
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    const timer = setTimeout(checkTabsScroll, 350);
    return () => clearTimeout(timer);
  }, [activeTab, checkTabsScroll]);

  // 4. Global Language & Pro Master EQ State
  const [language, setLanguage] = useState<Language>(() => getSavedLanguage());
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  // Persist playlist changes
  useEffect(() => {
    savePlaylist(playlist);
  }, [playlist]);

  // Auto-sync tracklist text boxes whenever playlist currentIndex or tracks change
  useEffect(() => {
    setTextBoxes((prevBoxes) => {
      let hasChanged = false;
      const nextBoxes = prevBoxes.map((box) => {
        if (box.isTracklist && box.tracklistAutoSync !== false) {
          const newText = generateTracklistContent(
            playlist.tracks,
            box.tracklistFormat || 'title-duration',
            {
              includeHeader: box.tracklistIncludeHeader !== false,
              headerTitle: box.tracklistCustomHeader || (language === 'vi' ? '🎵 DANH SÁCH BÀI HÁT' : '🎵 TRACKLIST'),
              currentIndex: playlist.currentIndex,
              highlightCurrent: box.tracklistHighlightCurrent !== false,
            }
          );
          if (newText !== box.text) {
            hasChanged = true;
            return { ...box, text: newText };
          }
        }
        return box;
      });
      return hasChanged ? nextBoxes : prevBoxes;
    });
  }, [playlist.currentIndex, playlist.tracks, language]);

  // Handler to add a Tracklist Text Box to the Visualizer Stage
  const handleAddTracklistToVisualizer = useCallback(() => {
    const existing = textBoxes.find((b) => b.isTracklist);
    if (existing) {
      setActiveTab('textboxes');
      return;
    }
    const content = generateTracklistContent(
      playlist.tracks,
      'title-duration',
      {
        includeHeader: true,
        headerTitle: language === 'vi' ? '🎵 DANH SÁCH BÀI HÁT' : '🎵 TRACKLIST',
        currentIndex: playlist.currentIndex,
        highlightCurrent: true,
      }
    );
    const newBox: TextBoxItem = {
      id: `tracklist-${Date.now()}`,
      text: content,
      positionX: 5,
      positionY: 8,
      fontSize: 14,
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      alignment: 'left',
      fontWeight: 'normal',
      fontStyle: 'normal',
      letterSpacing: 0.5,
      isUppercase: false,
      opacity: 0.95,
      hasBackground: true,
      backgroundColor: '#0a0a0c',
      backgroundOpacity: 0.7,
      glowColor: '#a855f7',
      glowIntensity: 10,
      visible: true,
      layerOrder: 'front-all',
      wrapText: true,
      maxWidth: 45,
      lineHeight: 1.4,
      isTracklist: true,
      tracklistFormat: 'title-duration',
      tracklistAutoSync: true,
      tracklistIncludeHeader: true,
      tracklistCustomHeader: language === 'vi' ? '🎵 DANH SÁCH BÀI HÁT' : '🎵 TRACKLIST',
      tracklistHighlightCurrent: true,
    };
    setTextBoxes((prev) => [...prev, newBox]);
    setActiveTab('textboxes');
  }, [playlist.tracks, playlist.currentIndex, language, textBoxes]);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMasterEqModalOpen, setIsMasterEqModalOpen] = useState(false);
  const [isGlobalSettingsModalOpen, setIsGlobalSettingsModalOpen] = useState(false);
  const [hasSavedIndicator, setHasSavedIndicator] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [masterEqConfig, setMasterEqConfig] = useState<MasterEQConfig>(() => {
    try {
      const saved = localStorage.getItem('sonawave_master_eq_v1');
      return saved ? JSON.parse(saved) : DEFAULT_MASTER_EQ;
    } catch {
      return DEFAULT_MASTER_EQ;
    }
  });

  // High Performance Render Path (Reduces load on lower-end devices during editing by simplifying particle calculations)
  const [highPerformanceRender, setHighPerformanceRender] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sonawave_high_perf_render');
      if (saved !== null) {
        return saved === 'true';
      }
      return isLowEndDevice();
    } catch {
      return false;
    }
  });
  const highPerformanceRenderRef = useRef(highPerformanceRender);

  useEffect(() => {
    highPerformanceRenderRef.current = highPerformanceRender;
    try {
      localStorage.setItem('sonawave_high_perf_render', String(highPerformanceRender));
    } catch {
      // ignore
    }
  }, [highPerformanceRender]);

  // Auto-Save background toggle state (Default: enabled, persists to localStorage)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sonawave_autosave_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sonawave_autosave_enabled', String(autoSaveEnabled));
    } catch {
      // ignore
    }
  }, [autoSaveEnabled]);

  // Hardware Acceleration (GPU/CPU) State & Diagnostics
  const [hardwareConfig, setHardwareConfig] = useState<HardwareAccelerationConfig>(getSavedHardwareConfig);
  const [hardwareInfo] = useState<HardwareInfo>(detectHardwareInfo);
  const hardwareConfigRef = useRef(hardwareConfig);
  hardwareConfigRef.current = hardwareConfig;

  useEffect(() => {
    saveHardwareConfig(hardwareConfig);
  }, [hardwareConfig]);

  // Live Performance & GPU Metrics Tracker
  const hwTrackerRef = useRef(new HardwarePerformanceTracker());
  const [livePerformance, setLivePerformance] = useState({ fps: 60, renderDurationMs: 2.1, droppedFrames: 0 });
  const lastPerfUpdateRef = useRef<number>(0);

  // 4. Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportCurrentSec, setExportCurrentSec] = useState(0);
  const [exportTotalSec, setExportTotalSec] = useState(30);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  // 5. Refs for High-Performance Animation Loop (Decoupled from React State Churn)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const rendererRef = useRef<VisualizerRenderer | null>(null);
  const exporterRef = useRef<VideoExporter | null>(null);
  const isExportingRef = useRef<boolean>(false);
  const exportCleanupRef = useRef<(() => void) | null>(null);

  // Dedicated Offscreen & Export Canvas refs for ultra-smooth 60fps rendering without UI thread blocking
  const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null);
  const offscreenCtxRef = useRef<OffscreenCanvasRenderingContext2D | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Dynamic configs in refs for 60fps render loop
  const aspectRatioRef = useRef(aspectRatio);
  aspectRatioRef.current = aspectRatio;

  const visualizerRef = useRef(visualizer);
  visualizerRef.current = visualizer;

  const lyricsConfigRef = useRef(lyricsConfig);
  lyricsConfigRef.current = lyricsConfig;

  const lyricsDataRef = useRef(lyricsData);
  lyricsDataRef.current = lyricsData;

  const backgroundRef = useRef(background);
  backgroundRef.current = background;

  const defaultBackgroundRef = useRef(defaultBackground);
  defaultBackgroundRef.current = defaultBackground;

  const particlesRef = useRef(particles);
  particlesRef.current = particles;

  const filmLightRef = useRef(filmLight);
  filmLightRef.current = filmLight;

  const colorGradingRef = useRef(colorGrading);
  colorGradingRef.current = colorGrading;

  const trackRef = useRef(track);
  trackRef.current = track;

  const textBoxesRef = useRef(textBoxes);
  textBoxesRef.current = textBoxes;

  const sceneTransitionsRef = useRef(sceneTransitions);
  sceneTransitionsRef.current = sceneTransitions;

  const lottiesRef = useRef(lotties);
  lottiesRef.current = lotties;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  // Real-time Master EQ Application to AudioEngine
  useEffect(() => {
    try {
      localStorage.setItem('sonawave_master_eq_v1', JSON.stringify(masterEqConfig));
    } catch (e) {
      // ignore
    }
    if (audioEngineRef.current) {
      audioEngineRef.current.applyMasterEQ(masterEqConfig);
    }
  }, [masterEqConfig]);

  // Auto-Save Effect (Debounced 800ms)
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setTimeout(() => {
      saveAutoSave({
        aspectRatio,
        visualizer,
        lyricsConfig,
        lyricsData,
        background,
        particles,
        track,
        textBoxes,
        sceneTransitions,
        filmLight,
        colorGrading,
        masterEq: masterEqConfig,
        lotties,
        audioFileName,
        sampleAudioType,
      });
      setHasSavedIndicator(true);
      const hideTimer = setTimeout(() => setHasSavedIndicator(false), 2000);
      return () => clearTimeout(hideTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, [
    autoSaveEnabled,
    aspectRatio,
    visualizer,
    lyricsConfig,
    lyricsData,
    background,
    particles,
    sceneTransitions,
    filmLight,
    colorGrading,
    masterEqConfig,
    track,
    textBoxes,
    lotties,
    audioFileName,
    sampleAudioType,
  ]);

  // Keyboard shortcut Ctrl+S / Cmd+S for Project Save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsProjectsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize engine & renderer on mount
  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    rendererRef.current = new VisualizerRenderer();
    exporterRef.current = new VideoExporter();

    // Check if auto-save session exists on startup
    const autoSaved = getAutoSave();
    if (autoSaved && autoSaved.visualizer) {
      setAspectRatio(autoSaved.aspectRatio || '9:16');
      setVisualizer(autoSaved.visualizer);
      setLyricsConfig(autoSaved.lyricsConfig);
      setLyricsData(autoSaved.lyricsData);
      setBackground(autoSaved.background);
      setParticles(autoSaved.particles);
      setFilmLight(autoSaved.filmLight || DEFAULT_FILM_LIGHT);
      setColorGrading(autoSaved.colorGrading || DEFAULT_COLOR_GRADING);
      if (autoSaved.masterEq) {
        setMasterEqConfig(autoSaved.masterEq);
      }
      const safeTrack = autoSaved.track ? { ...DEFAULT_TRACK, ...autoSaved.track } : DEFAULT_TRACK;
      setTrack(safeTrack);
      setTextBoxes(autoSaved.textBoxes || DEFAULT_TEXT_BOXES);
      if (autoSaved.sceneTransitions) {
        setSceneTransitions(autoSaved.sceneTransitions);
      }
      setAudioFileName(autoSaved.audioFileName || 'Neon_Synthwave_Demo.wav');

      if (autoSaved.background?.url) {
        rendererRef.current.setBackgroundImage(autoSaved.background.url);
      }
      rendererRef.current.setCoverImage(safeTrack.coverUrl || DEFAULT_TRACK.coverUrl);

      loadSampleTrack(autoSaved.sampleAudioType || 'synthwave', false);
    } else {
      rendererRef.current.setBackgroundImage(DEFAULT_BACKGROUND.url);
      rendererRef.current.setCoverImage(DEFAULT_TRACK.coverUrl);
      loadSampleTrack('synthwave', true);
    }

    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  // Update renderer when background image, video, or cover changes
  useEffect(() => {
    if (rendererRef.current) {
      if (background.isVideo || background.type === 'video') {
        rendererRef.current.setBackgroundVideo(background.videoUrl || background.url);
      } else {
        rendererRef.current.setBackgroundVideo('');
        rendererRef.current.setBackgroundImage(background.url);
      }
    }
  }, [background.url, background.videoUrl, background.isVideo, background.type]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.syncVideoPlayback(isPlaying, currentTime);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setCoverImage(track?.coverUrl || DEFAULT_TRACK.coverUrl);
    }
  }, [track?.coverUrl]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setBadgeImage(track?.badgePngUrl || '');
    }
  }, [track?.badgePngUrl]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setLogoImage(track?.logoUrl || '');
    }
  }, [track?.logoUrl]);

  // Load sample synthetic audio demo
  const loadSampleTrack = async (
    type: 'lofi' | 'synthwave' | 'acoustic' | 'edm',
    updateLyrics = true
  ) => {
    if (!audioEngineRef.current || !audioRef.current) return;
    setIsLoadingAudio(true);
    setSampleAudioType(type);

    try {
      const blob = await audioEngineRef.current.generateDemoAudio(type, 30);
      currentAudioBlobRef.current = blob;
      const url = URL.createObjectURL(blob);

      audioRef.current.src = url;
      audioRef.current.load();

      let sampleLyrics = SAMPLE_SRT_SYNTHWAVE;
      let sampleTitle = 'Neon Synthwave Dream';
      let sampleArtist = 'SonaWave Master Studio';
      let demoBpm = 120;

      if (type === 'lofi') {
        sampleLyrics = SAMPLE_SRT_LOFI;
        sampleTitle = 'Đêm Lặng (Lofi Chill)';
        sampleArtist = 'SonaWave Sessions ft. Mây';
        demoBpm = 85;
      } else if (type === 'acoustic') {
        sampleLyrics = SAMPLE_SRT_ACOUSTIC;
        sampleTitle = 'Acoustic Sunset Romance';
        sampleArtist = 'Golden Melodies Live';
        demoBpm = 95;
      } else if (type === 'edm') {
        sampleLyrics = SAMPLE_SRT_SYNTHWAVE;
        sampleTitle = 'Lost in Andromeda (EDM)';
        sampleArtist = 'Cyber Space Dream';
        demoBpm = 128;
      }

      setDetectedBpm(demoBpm);
      setVisualizer((prev) => ({ ...prev, bpm: demoBpm }));

      const fileName = `${sampleTitle.replace(/\s+/g, '_')}.wav`;
      setAudioFileName(fileName);
      if (updateLyrics) {
        setTrack((prev) => ({
          ...prev,
          title: sampleTitle,
          artist: sampleArtist,
        }));
        const parsed = parseAnyLyrics(sampleLyrics, 30);
        setLyricsData(parsed);
      }

      // Sync active demo track with playlist
      setPlaylist((prev) => {
        const tracks = [...prev.tracks];
        const curIdx = Math.max(0, Math.min(prev.currentIndex, Math.max(0, tracks.length - 1)));
        const existingTrack = tracks[curIdx];

        // Retain existing track ID if unique among other tracks, otherwise generate a unique demo ID
        let trackId = existingTrack?.id;
        const isDuplicate = !trackId || tracks.some((t, idx) => idx !== curIdx && t.id === trackId);
        if (isDuplicate) {
          trackId = `demo-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        }

        const demoItem: AudioTrackItem = {
          id: trackId,
          title: sampleTitle,
          artist: sampleArtist,
          fileName,
          url,
          duration: 30,
          fadeInSec: prev.defaultFadeInSec ?? 2,
          fadeOutSec: prev.defaultFadeOutSec ?? 2.5,
          volume: 1.0,
          bpm: demoBpm,
        };

        if (tracks.length === 0) {
          return { ...prev, tracks: [demoItem], currentIndex: 0 };
        } else {
          tracks[curIdx] = demoItem;
          return { ...prev, tracks: ensureUniqueTrackIds(tracks) };
        }
      });

      // Warm up demo audio for any other tracks in playlist in the background for zero-latency seamless continuation
      if (audioEngineRef.current) {
        setTimeout(async () => {
          const curTracks = playlistRef.current.tracks;
          for (let i = 0; i < curTracks.length; i++) {
            const tr = curTracks[i];
            if (!tr.url && audioEngineRef.current) {
              try {
                const dType = (tr.id?.includes('lofi') || tr.title?.toLowerCase().includes('lofi'))
                  ? 'lofi'
                  : (tr.id?.includes('acoustic') || tr.title?.toLowerCase().includes('acoustic'))
                  ? 'acoustic'
                  : (tr.id?.includes('edm') || tr.title?.toLowerCase().includes('edm'))
                  ? 'edm'
                  : 'synthwave';
                const b = await audioEngineRef.current.generateDemoAudio(dType, tr.duration || 30);
                tr.url = URL.createObjectURL(b);
              } catch (e) {
                // ignore
              }
            }
          }
        }, 150);
      }
    } catch (err) {
      console.error('Failed to generate demo track:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Upload user's custom audio file
  const handleUploadAudioFile = async (file: File) => {
    currentAudioBlobRef.current = file;
    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
    setAudioFileName(file.name);

    // Auto extract title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const parts = cleanName.split('-');
    const extractedArtist = parts.length > 1 ? parts[0].trim() : 'Artist';
    const extractedTitle = parts.length > 1 ? parts.slice(1).join('-').trim() : cleanName;

    setTrack((prev) => ({
      ...prev,
      artist: extractedArtist,
      title: extractedTitle,
    }));

    // Add track to playlist
    const newTrackItem: AudioTrackItem = {
      id: 'track-' + Date.now(),
      title: extractedTitle,
      artist: extractedArtist,
      fileName: file.name,
      url,
      duration: 0,
      fadeInSec: playlistRef.current.defaultFadeInSec ?? 2,
      fadeOutSec: playlistRef.current.defaultFadeOutSec ?? 2.5,
      volume: 1.0,
    };

    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      newTrackItem.duration = tempAudio.duration;
      setPlaylist((prev) => {
        const tracks = [...prev.tracks, newTrackItem];
        return {
          ...prev,
          tracks,
          currentIndex: tracks.length - 1,
        };
      });
    };

    // Auto detect BPM from uploaded audio
    if (audioEngineRef.current) {
      setIsDetectingBpm(true);
      try {
        const bpmRes = await audioEngineRef.current.detectBpmFromFile(file);
        if (bpmRes && bpmRes.bpm > 0) {
          setDetectedBpm(bpmRes.bpm);
          setVisualizer((prev) => ({
            ...prev,
            bpm: bpmRes.bpm,
            syncBpmPulse: true,
          }));
        }
      } catch (err) {
        console.warn('Auto BPM detection failed:', err);
      } finally {
        setIsDetectingBpm(false);
      }
    }
  };

  // Re-detect BPM from current audio
  const handleReDetectBpm = async () => {
    if (!audioEngineRef.current || !currentAudioBlobRef.current) return;
    setIsDetectingBpm(true);
    try {
      const bpmRes = await audioEngineRef.current.detectBpmFromFile(currentAudioBlobRef.current);
      if (bpmRes && bpmRes.bpm > 0) {
        setDetectedBpm(bpmRes.bpm);
        setVisualizer((prev) => ({
          ...prev,
          bpm: bpmRes.bpm,
        }));
      }
    } catch (err) {
      console.warn('Re-detect BPM error:', err);
    } finally {
      setIsDetectingBpm(false);
    }
  };

  // Audio Playback Controls
  const playTrackAtIndex = useCallback(async (index: number, shouldAutoPlay = true, seekTime = 0) => {
    const list = playlistRef.current;
    if (index < 0 || index >= list.tracks.length) return;
    const targetTrack = list.tracks[index];

    // Immediately pause current audio playback to avoid stale timeupdate events from previous track
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Immediately update index and reset currentTime to target seekTime (0 by default)
    setPlaylist((prev) => ({
      ...prev,
      currentIndex: index,
    }));
    setCurrentTime(seekTime);

    // Apply track's unique background if configured, otherwise fallback to project default background
    if (targetTrack.background) {
      setBackground(targetTrack.background);
    } else {
      setBackground(defaultBackgroundRef.current);
    }

    // Switch track lyrics if available
    if (targetTrack.lyrics && targetTrack.lyrics.length > 0) {
      setLyricsData(targetTrack.lyrics);
    } else {
      setLyricsData([]);
    }

    let audioUrl = targetTrack.url;
    if (!audioUrl && audioEngineRef.current) {
      try {
        const demoType = (targetTrack.id?.includes('lofi') || targetTrack.title?.toLowerCase().includes('lofi'))
          ? 'lofi'
          : (targetTrack.id?.includes('acoustic') || targetTrack.title?.toLowerCase().includes('acoustic'))
          ? 'acoustic'
          : (targetTrack.id?.includes('edm') || targetTrack.title?.toLowerCase().includes('edm'))
          ? 'edm'
          : 'synthwave';
        const blob = await audioEngineRef.current.generateDemoAudio(demoType, targetTrack.duration || 30);
        audioUrl = URL.createObjectURL(blob);
        targetTrack.url = audioUrl;
      } catch (e) {
        console.warn('Failed to generate audio for playlist track:', e);
      }
    }

    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.currentTime = seekTime;
    }

    setAudioFileName(targetTrack.fileName);
    setTrack((prev) => ({
      ...prev,
      title: targetTrack.title,
      artist: targetTrack.artist || prev.artist,
      coverUrl: targetTrack.coverUrl || prev.coverUrl,
    }));

    if (targetTrack.bpm) {
      setDetectedBpm(targetTrack.bpm);
      setVisualizer((prev) => ({ ...prev, bpm: targetTrack.bpm }));
    }

    if (audioEngineRef.current && audioRef.current) {
      audioEngineRef.current.attachAudioElement(audioRef.current);
      await audioEngineRef.current.resume();
      if (audioRef.current && seekTime > 0) {
        audioRef.current.currentTime = seekTime;
      }
      if (shouldAutoPlay) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (e) {
          console.warn('Track auto-play error:', e);
        }
      }
    }
  }, []);

  // Handler to update background for a specific track
  const handleUpdateTrackBackground = useCallback((trackId: string, bg: BackgroundConfig | undefined) => {
    setPlaylist((prev) => {
      const updated = prev.tracks.map((t) => (t.id === trackId ? { ...t, background: bg } : t));
      return { ...prev, tracks: updated };
    });

    const activeTrack = playlistRef.current.tracks[playlistRef.current.currentIndex];
    if (activeTrack && activeTrack.id === trackId) {
      setBackground(bg || defaultBackgroundRef.current);
    }
  }, []);

  // Handler to apply a background to all tracks in the playlist
  const handleApplyBackgroundToAllTracks = useCallback((bg: BackgroundConfig) => {
    setPlaylist((prev) => {
      const updated = prev.tracks.map((t) => ({ ...t, background: { ...bg } }));
      return { ...prev, tracks: updated };
    });
    setBackground(bg);
  }, []);

  // Handler to update lyrics for a specific track
  const handleUpdateTrackLyrics = useCallback(
    (trackId: string, lyrics: LyricLine[], rawLyrics?: string, fileName?: string) => {
      setPlaylist((prev) => {
        const updated = prev.tracks.map((t) =>
          t.id === trackId
            ? {
                ...t,
                lyrics,
                rawLyrics: rawLyrics !== undefined ? rawLyrics : t.rawLyrics,
                lyricsFileName: fileName !== undefined ? fileName : t.lyricsFileName,
              }
            : t
        );
        return { ...prev, tracks: updated };
      });

      const curTrack = playlistRef.current.tracks[playlistRef.current.currentIndex];
      if (curTrack && curTrack.id === trackId) {
        setLyricsData(lyrics);
      }
    },
    []
  );

  // Handler to batch import lyrics files
  const handleBatchImportLyrics = useCallback((files: { name: string; content: string }[]) => {
    let count = 0;
    setPlaylist((prev) => {
      const { updatedTracks, matchedCount } = matchLyricsFilesToTracks(prev.tracks, files);
      count = matchedCount;
      const curTrack = updatedTracks[prev.currentIndex];
      if (curTrack && curTrack.lyrics) {
        setLyricsData(curTrack.lyrics);
      }
      return { ...prev, tracks: updatedTracks };
    });
    return count;
  }, []);

  // Handler to apply lyrics to all tracks
  const handleApplyLyricsToAllTracks = useCallback((lyrics: LyricLine[]) => {
    setPlaylist((prev) => {
      const updated = prev.tracks.map((t) => ({
        ...t,
        lyrics: [...lyrics],
        lyricsFileName: 'Shared_Lyrics.lrc',
      }));
      return { ...prev, tracks: updated };
    });
    setLyricsData(lyrics);
  }, []);

  // Handler to update lyrics when user edits in Lyrics Tab
  const handleLyricsChange = useCallback((newLyrics: LyricLine[]) => {
    setLyricsData(newLyrics);
    setPlaylist((prev) => {
      const curIdx = prev.currentIndex;
      if (curIdx >= 0 && curIdx < prev.tracks.length) {
        const updated = [...prev.tracks];
        updated[curIdx] = {
          ...updated[curIdx],
          lyrics: newLyrics,
        };
        return { ...prev, tracks: updated };
      }
      return prev;
    });
  }, []);

  const isAdvancingTrackRef = useRef(false);
  const handleNextTrack = useCallback(async (autoAdvance = false) => {
    if (isAdvancingTrackRef.current) return;
    isAdvancingTrackRef.current = true;
    setTimeout(() => {
      isAdvancingTrackRef.current = false;
    }, 450);

    const list = playlistRef.current;
    if (list.tracks.length === 0) return;

    if (list.repeatMode === 'repeat-one' && autoAdvance) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    if (list.repeatMode === 'shuffle') {
      if (list.tracks.length > 1) {
        let rand = Math.floor(Math.random() * list.tracks.length);
        if (rand === list.currentIndex) {
          rand = (rand + 1) % list.tracks.length;
        }
        playTrackAtIndex(rand, true, 0);
      } else {
        playTrackAtIndex(0, true, 0);
      }
      return;
    }

    if (list.currentIndex < list.tracks.length - 1) {
      playTrackAtIndex(list.currentIndex + 1, true, 0);
    } else if (list.repeatMode === 'repeat-all') {
      playTrackAtIndex(0, true, 0);
    } else {
      // Reached the end of the entire playlist and repeat is off:
      // Keep playhead at the end of the full timeline bar without resetting to 0
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        const curDur = audioRef.current.duration || 30;
        audioRef.current.currentTime = curDur;
        setCurrentTime(curDur);
      }
    }
  }, [playTrackAtIndex]);

  const handlePreviousTrack = useCallback(async () => {
    const list = playlistRef.current;
    if (list.tracks.length === 0) return;

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (list.currentIndex > 0) {
      playTrackAtIndex(list.currentIndex - 1, true);
    } else if (list.repeatMode === 'repeat-all') {
      playTrackAtIndex(list.tracks.length - 1, true);
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [playTrackAtIndex]);

  const handleToggleRepeatMode = useCallback(() => {
    setPlaylist((prev) => {
      const modes: PlaylistRepeatMode[] = ['off', 'repeat-all', 'repeat-one', 'shuffle'];
      const currentIdx = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIdx + 1) % modes.length];
      return {
        ...prev,
        repeatMode: nextMode,
      };
    });
  }, []);

  const handleTogglePlay = async () => {
    if (!audioRef.current || !audioEngineRef.current) return;

    audioEngineRef.current.attachAudioElement(audioRef.current);
    await audioEngineRef.current.resume();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      rendererRef.current?.syncVideoSeek(time);
    }
  };

  // Total Playlist Duration (automatically updates when tracks are added, modified, or removed)
  const totalPlaylistDuration = useMemo(() => {
    if (!playlist.tracks || playlist.tracks.length === 0) {
      return duration || 30;
    }
    return playlist.tracks.reduce((sum, t) => sum + (t.duration || 0), 0) || duration || 30;
  }, [playlist.tracks, duration]);

  // Playlist Elapsed Time (cumulative elapsed time across all previous tracks + current track offset)
  const playlistElapsedTime = useMemo(() => {
    if (!playlist.tracks || playlist.tracks.length === 0) {
      return currentTime;
    }
    let elapsed = 0;
    for (let i = 0; i < playlist.currentIndex && i < playlist.tracks.length; i++) {
      const tDur = (playlist.tracks[i].duration && playlist.tracks[i].duration > 0)
        ? playlist.tracks[i].duration
        : 30;
      elapsed += tDur;
    }
    return elapsed + (currentTime || 0);
  }, [playlist.tracks, playlist.currentIndex, currentTime]);

  // Global Seek across whole playlist (switches to target track and seeks accurately)
  const handleSeekPlaylist = useCallback((globalTime: number) => {
    const tracks = playlistRef.current.tracks;
    if (!tracks || tracks.length === 0) {
      handleSeek(globalTime);
      return;
    }

    let cumulative = 0;
    for (let i = 0; i < tracks.length; i++) {
      const tDur = (tracks[i].duration && tracks[i].duration > 0) ? tracks[i].duration : 30;
      const nextCum = cumulative + tDur;
      if (globalTime < nextCum || i === tracks.length - 1) {
        const localSeek = Math.max(0, globalTime - cumulative);
        if (i === playlistRef.current.currentIndex) {
          if (audioRef.current) {
            audioRef.current.currentTime = localSeek;
            setCurrentTime(localSeek);
            rendererRef.current?.syncVideoSeek(localSeek);
          }
        } else {
          playTrackAtIndex(i, isPlaying, localSeek);
        }
        break;
      }
      cumulative = nextCum;
    }
  }, [isPlaying, playTrackAtIndex]);

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(vol);
    }
  };

  // Load Saved Project
  const handleLoadProject = (project: SavedProject) => {
    setAspectRatio(project.aspectRatio);
    setVisualizer(project.visualizer);
    setLyricsConfig(project.lyricsConfig);
    setLyricsData(project.lyricsData);
    setBackground(project.background);
    setParticles(project.particles);
    if (project.filmLight) {
      setFilmLight(project.filmLight);
    }
    if (project.colorGrading) {
      setColorGrading(project.colorGrading);
    } else {
      setColorGrading(DEFAULT_COLOR_GRADING);
    }
    if (project.masterEq) {
      setMasterEqConfig(project.masterEq);
    }
    const safeTrack = project.track ? { ...DEFAULT_TRACK, ...project.track } : DEFAULT_TRACK;
    setTrack(safeTrack);
    setTextBoxes(project.textBoxes || DEFAULT_TEXT_BOXES);
    if (project.sceneTransitions) {
      setSceneTransitions(project.sceneTransitions);
    } else {
      setSceneTransitions(DEFAULT_SCENE_TRANSITIONS);
    }
    if (project.lotties) {
      setLotties(project.lotties);
      setSelectedLottieId(project.lotties.length > 0 ? project.lotties[0].id : null);
    } else {
      setLotties([]);
      setSelectedLottieId(null);
    }
    setAudioFileName(project.audioFileName || 'Neon_Synthwave_Demo.wav');

    if (rendererRef.current) {
      if (project.background?.url) {
        rendererRef.current.setBackgroundImage(project.background.url);
      }
      rendererRef.current.setCoverImage(safeTrack.coverUrl || DEFAULT_TRACK.coverUrl);
    }

    if (project.sampleAudioType) {
      loadSampleTrack(project.sampleAudioType, false);
    }
  };

  // Complete Reset to Defaults / New Project
  const executeResetToDefaults = useCallback((profile: NewProjectHardwareProfile = 'low-hardware') => {
    // 1. Stop audio playback cleanly
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);

    const isLowHardware = profile === 'low-hardware';

    // 2. Set performance and hardware acceleration profile
    setHighPerformanceRender(isLowHardware);
    setHardwareConfig(isLowHardware ? { ...DEFAULT_LOW_HARDWARE_CONFIG } : { ...DEFAULT_HARDWARE_CONFIG });

    // 3. Reset all visualizer and scene configurations
    setAspectRatio('9:16');
    setVisualizer(isLowHardware ? { ...DEFAULT_LOW_HARDWARE_VISUALIZER } : { ...DEFAULT_VISUALIZER });
    setLyricsConfig(DEFAULT_LYRICS);
    setLyricsData([]);
    setBackground(DEFAULT_BACKGROUND);
    setDefaultBackground(DEFAULT_BACKGROUND);
    setParticles(isLowHardware ? { ...DEFAULT_LOW_HARDWARE_PARTICLES } : { ...DEFAULT_PARTICLES });
    setFilmLight(DEFAULT_FILM_LIGHT);
    setColorGrading(DEFAULT_COLOR_GRADING);
    setMasterEqConfig(DEFAULT_MASTER_EQ);
    setTrack(DEFAULT_TRACK);
    setTextBoxes(DEFAULT_TEXT_BOXES);
    setSceneTransitions(DEFAULT_SCENE_TRANSITIONS);
    setPlaylist(DEFAULT_PLAYLIST_CONFIG);
    setLotties(DEFAULT_LOTTIES);
    setSelectedLottieId(null);
    setAudioFileName('Neon_Synthwave_Demo.wav');

    // 4. Reset visualizer canvas renderer background and cover
    if (rendererRef.current) {
      rendererRef.current.setBackgroundVideo('');
      rendererRef.current.setBackgroundImage(DEFAULT_BACKGROUND.url);
      rendererRef.current.setCoverImage(DEFAULT_TRACK.coverUrl);
      rendererRef.current.syncVideoSeek(0);
    }

    // 5. Reload clean default sample track
    loadSampleTrack('synthwave', false);

    // 6. Clean stored local autosave
    try {
      localStorage.removeItem('sonawave_project_data_v1');
      localStorage.removeItem('sonawave_lotties_v1');
      clearAutoSave();
    } catch {
      // ignore
    }

    setToastMessage(
      isLowHardware
        ? (language === 'vi'
            ? '⚡ Đã tạo dự án mới với Cấu hình Tối ưu cho Máy yếu & Mobile!'
            : '⚡ New project created with Low Hardware & Mobile optimization!')
        : (language === 'vi'
            ? '✨ Đã tạo dự án mới (Đồ họa cao / Full GPU)!'
            : '✨ New project created (High-End GPU / Full Graphics)!')
    );
  }, [language, loadSampleTrack]);

  // Reset to default blank state
  const handleResetToDefaults = useCallback(() => {
    executeResetToDefaults();
  }, [executeResetToDefaults]);

  // Apply Preset Theme
  const handleSelectPresetTheme = (theme: PresetTheme) => {
    setAspectRatio(theme.aspectRatio || '9:16');
    setVisualizer(theme.visualizer || DEFAULT_VISUALIZER);
    setLyricsConfig(theme.lyrics || DEFAULT_LYRICS);
    setBackground(theme.background || DEFAULT_BACKGROUND);
    setParticles(theme.particles || DEFAULT_PARTICLES);
    setFilmLight(theme.filmLight || DEFAULT_FILM_LIGHT);
    setColorGrading(theme.colorGrading || DEFAULT_COLOR_GRADING);
    const safeTrack = theme.track ? { ...DEFAULT_TRACK, ...theme.track } : DEFAULT_TRACK;
    setTrack(safeTrack);
    if (theme.sceneTransitions) {
      setSceneTransitions(theme.sceneTransitions);
    }

    if (rendererRef.current) {
      if (theme.background?.url) {
        rendererRef.current.setBackgroundImage(theme.background.url);
      }
      rendererRef.current.setCoverImage(safeTrack.coverUrl || DEFAULT_TRACK.coverUrl);
    }

    if (theme.sampleAudio) {
      loadSampleTrack(theme.sampleAudio.type);
    }
  };

  // Snapshot Capture
  const handleCaptureSnapshot = () => {
    if (canvasRef.current) {
      const safeTitle = track?.title || 'Track';
      VideoExporter.captureSnapshot(
        canvasRef.current,
        `SonaWave_${safeTitle.replace(/\s+/g, '_')}_Cover.png`
      );
    }
  };

  // Ultra-Smooth 60FPS Animation & Rendering Loop with OffscreenCanvas Support (Decoupled from React State)
  useEffect(() => {
    let animationId: number;
    let lastBeatUpdate = 0;

    const renderLoop = (time: number) => {
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;
      const audioEngine = audioEngineRef.current;

      if (renderer) {
        const currentAR = aspectRatioRef.current;

        // Set internal canvas resolution based on AspectRatio for ultra HD rendering
        let targetW = 1080;
        let targetH = 1920;

        if (currentAR === '1:1') {
          targetW = 1080;
          targetH = 1080;
        } else if (currentAR === '16:9') {
          targetW = 1920;
          targetH = 1080;
        } else if (currentAR === '4:5') {
          targetW = 1080;
          targetH = 1350;
        }

        // Preview resolution scaling when High Performance Mode is enabled (cuts GPU pixel fill overhead by ~60%)
        if (!isExportingRef.current && highPerformanceRenderRef.current) {
          targetW = Math.round(targetW * 0.625);
          targetH = Math.round(targetH * 0.625);
        }

        // 1. Prepare OffscreenCanvas if supported
        const hasOffscreen = typeof OffscreenCanvas !== 'undefined';
        let drawTargetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

        if (hasOffscreen) {
          if (!offscreenCanvasRef.current || offscreenCanvasRef.current.width !== targetW || offscreenCanvasRef.current.height !== targetH) {
            offscreenCanvasRef.current = new OffscreenCanvas(targetW, targetH);
            offscreenCtxRef.current = offscreenCanvasRef.current.getContext('2d') as OffscreenCanvasRenderingContext2D;
          }
          drawTargetCtx = offscreenCtxRef.current;
        } else if (canvas) {
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }
          drawTargetCtx = canvas.getContext('2d');
        }

        if (drawTargetCtx) {
          // Get audio frequency analysis
          let freqData = new Uint8Array(128);
          let timeData = new Uint8Array(128);
          let bassIntensity = 0;
          let trebleIntensity = 0;
          let overallVol = 0;
          let beatIntensityVal = 0;

          if (audioEngine) {
            const data = audioEngine.updateData();
            freqData = data.freqData;
            timeData = data.timeData;
            bassIntensity = data.bassIntensity;
            trebleIntensity = data.trebleIntensity;
            overallVol = data.overallVolume;
            beatIntensityVal = audioEngine.beatIntensity;
          }

          const curTime = audioRef.current ? audioRef.current.currentTime : currentTimeRef.current;

          // Real-time Smooth Fade-In and Fade-Out automation
          if (audioEngine && audioRef.current && isPlayingRef.current) {
            const list = playlistRef.current;
            const curTrack = list.tracks[list.currentIndex];
            if (curTrack && list.enableFadeInOut) {
              const fadeMult = calculateFadeMultiplier(
                curTime,
                audioRef.current.duration || 30,
                curTrack.fadeInSec,
                curTrack.fadeOutSec,
                true
              );
              const targetFadeGain = fadeMult * (curTrack.volume ?? 1.0);
              audioEngine.setFadeGain(targetFadeGain);
            } else if (curTrack) {
              audioEngine.setFadeGain(curTrack.volume ?? 1.0);
            }
          }

          // Render entire visualizer scene directly to isolated offscreen buffer / target
          renderer.render(
            drawTargetCtx,
            targetW,
            targetH,
            curTime,
            freqData,
            timeData,
            bassIntensity,
            trebleIntensity,
            overallVol,
            beatIntensityVal,
            visualizerRef.current,
            lyricsConfigRef.current,
            lyricsDataRef.current,
            backgroundRef.current,
            particlesRef.current,
            trackRef.current,
            textBoxesRef.current,
            currentAR,
            isPlayingRef.current,
            filmLightRef.current,
            colorGradingRef.current,
            sceneTransitionsRef.current,
            isExportingRef.current ? false : highPerformanceRenderRef.current,
            lottiesRef.current
          );

          // Fast blit from OffscreenCanvas to export target if exporting
          if (hasOffscreen && offscreenCanvasRef.current) {
            if (isExportingRef.current && exportCanvasRef.current && exportCtxRef.current) {
              exportCtxRef.current.drawImage(offscreenCanvasRef.current, 0, 0);
            }

            // Fast blit to stage preview canvas
            if (canvas) {
              if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
              }
              const previewCtx = canvas.getContext('2d');
              if (previewCtx) {
                previewCtx.drawImage(offscreenCanvasRef.current, 0, 0);
              }
            }
          } else if (!hasOffscreen && canvas && isExportingRef.current && exportCanvasRef.current && exportCtxRef.current) {
            // Fallback blit
            exportCtxRef.current.drawImage(canvas, 0, 0);
          }
        }
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Video Export Handler (Fixed: OffscreenCanvas rendering, zero UI thread blocking, perfect sync)
  const handleStartExport = async (settings: ExportSettings) => {
    if (!canvasRef.current || !audioEngineRef.current || !exporterRef.current || !audioRef.current) {
      return;
    }

    const audioEngine = audioEngineRef.current;
    const exporter = exporterRef.current;
    const audio = audioRef.current;

    // Pause current playback first to avoid desync
    audio.pause();
    setIsPlaying(false);

    // Save previous loop state & force loop to false during recording
    const originalLoopState = isLooping;
    audio.loop = false;

    // Ensure AudioContext is fully running
    await audioEngine.ensureContextRunning();
    audioEngine.attachAudioElement(audio);

    // Ensure audio element is active, unmuted and full volume for recording capture
    audio.muted = false;
    if (audio.volume < 0.2) {
      audio.volume = 1.0;
    }

    setIsExporting(true);
    isExportingRef.current = true;
    setExportProgress(0);
    setExportedBlob(null);

    const startSec = settings.startTime;
    const endSec = Math.min(settings.endTime, audio.duration || settings.endTime || 30);
    const totalSec = Math.max(1, endSec - startSec);
    setExportTotalSec(totalSec);
    setExportCurrentSec(0);

    // Determine target resolution based on current aspect ratio
    const currentAR = aspectRatioRef.current;
    let targetW = 1080;
    let targetH = 1920;
    if (currentAR === '1:1') {
      targetW = 1080;
      targetH = 1080;
    } else if (currentAR === '16:9') {
      targetW = 1920;
      targetH = 1080;
    } else if (currentAR === '4:5') {
      targetW = 1080;
      targetH = 1350;
    }

    // Create a dedicated off-DOM export canvas to isolate video frame recording from DOM reflows
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetW;
    exportCanvas.height = targetH;
    exportCanvasRef.current = exportCanvas;
    exportCtxRef.current = exportCanvas.getContext('2d', { alpha: false }) || exportCanvas.getContext('2d');

    // Seek to start position and ensure audio is ready
    if (Math.abs(audio.currentTime - startSec) > 0.05) {
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          audio.removeEventListener('seeked', onSeeked);
          resolve();
        };
        audio.addEventListener('seeked', onSeeked);
        audio.currentTime = startSec;
        setTimeout(() => {
          audio.removeEventListener('seeked', onSeeked);
          resolve();
        }, 400);
      });
    }

    // Auto-replay Background MP4 from beginning when video render starts
    if (rendererRef.current) {
      rendererRef.current.replayBackgroundVideo();
    }

    // Start playback
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn('Playback error during export:', e);
    }

    // Get fresh audio stream with live active tracks
    const audioStream = audioEngine.getFreshAudioStream();
    const hwAccel = settings.hardwareAcceleration || (hardwareConfigRef.current.preferHardwareEncoder ? 'prefer-hardware' : 'software');
    const recordPromise = exporter.startRecording(
      exportCanvas,
      audioStream,
      settings.fps,
      settings.qualityBitrate,
      hwAccel
    );

    const startTimeStamp = Date.now();
    let hasStopped = false;

    const stopRecordingSession = () => {
      if (hasStopped) return;
      hasStopped = true;

      exporter.stopRecording();
      audio.pause();
      setIsPlaying(false);
      audio.loop = originalLoopState;
      exportCanvasRef.current = null;
      exportCtxRef.current = null;
      if (exportCleanupRef.current) {
        exportCleanupRef.current();
        exportCleanupRef.current = null;
      }
    };

    // Listen to audio ended event
    const handleAudioEnded = () => {
      stopRecordingSession();
    };
    audio.addEventListener('ended', handleAudioEnded);

    // Monitor interval with smooth 100ms throttle to prevent UI thread micro-stalls
    const progressInterval = window.setInterval(() => {
      if (!isExportingRef.current || hasStopped) {
        clearInterval(progressInterval);
        return;
      }

      const elapsed = Math.max(0, audio.currentTime - startSec);
      const wallElapsed = (Date.now() - startTimeStamp) / 1000;
      const progress = Math.min(99.5, (Math.max(elapsed, wallElapsed) / totalSec) * 100);

      setExportProgress(progress);
      setExportCurrentSec(Math.min(totalSec, elapsed));

      // Stop condition: reach endSec, audio ended, or wall clock exceeded
      if (audio.currentTime >= endSec - 0.05 || audio.ended || wallElapsed >= totalSec + 0.3) {
        clearInterval(progressInterval);
        stopRecordingSession();
      }
    }, 100);

    exportCleanupRef.current = () => {
      clearInterval(progressInterval);
      audio.removeEventListener('ended', handleAudioEnded);
      exportCanvasRef.current = null;
      exportCtxRef.current = null;
    };

    try {
      const blob = await recordPromise;
      setExportProgress(100);
      setExportCurrentSec(totalSec);
      setExportedBlob(blob);
    } catch (err) {
      console.error('Export recording failed:', err);
    } finally {
      setIsExporting(false);
      isExportingRef.current = false;
      exportCanvasRef.current = null;
      exportCtxRef.current = null;
      audio.loop = originalLoopState;
      if (exportCleanupRef.current) {
        exportCleanupRef.current();
        exportCleanupRef.current = null;
      }
    }
  };

  const handleCancelExport = () => {
    if (exporterRef.current) {
      exporterRef.current.stopRecording();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.loop = isLooping;
    }
    if (exportCleanupRef.current) {
      exportCleanupRef.current();
      exportCleanupRef.current = null;
    }
    setIsExporting(false);
    isExportingRef.current = false;
    setIsPlaying(false);
  };

  const handleDownloadExportedVideo = () => {
    if (exportedBlob) {
      const safeTitle = track?.title || 'Track';
      const filename = `SonaWave_${safeTitle.replace(/\s+/g, '_')}_${aspectRatio}_${Date.now()}.mp4`;
      const mp4Blob = exportedBlob.type === 'video/mp4' ? exportedBlob : new Blob([exportedBlob], { type: 'video/mp4' });
      VideoExporter.downloadBlob(mp4Blob, filename);
    }
  };

  const handleNewProject = useCallback(() => {
    setIsNewProjectModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        loop={playlist.tracks.length > 1 ? (playlist.repeatMode === 'repeat-one') : isLooping}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const cur = audioRef.current.currentTime;
            setCurrentTime(cur);

            // Seamless playlist continuation across timeline: auto advance when nearing end of current track
            const curDur = audioRef.current.duration;
            if (
              playlistRef.current.tracks.length > 1 &&
              playlistRef.current.repeatMode !== 'repeat-one' &&
              curDur > 0 &&
              cur >= curDur - 0.08
            ) {
              handleNextTrack(true);
            }
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            const d = audioRef.current.duration;
            if (d && !isNaN(d) && isFinite(d) && d > 0) {
              setDuration(d);
              setPlaylist((prev) => {
                const curIdx = prev.currentIndex;
                if (curIdx >= 0 && curIdx < prev.tracks.length) {
                  const cur = prev.tracks[curIdx];
                  if (!cur.duration || Math.abs(cur.duration - d) > 0.25) {
                    const copy = [...prev.tracks];
                    copy[curIdx] = { ...copy[curIdx], duration: d };
                    return { ...prev, tracks: copy };
                  }
                }
                return prev;
              });
            }
          }
        }}
        onEnded={() => {
          handleNextTrack(true);
        }}
      />

      {/* Top Header Bar */}
      <Header
        aspectRatio={aspectRatio}
        onSelectAspectRatio={setAspectRatio}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onCaptureSnapshot={handleCaptureSnapshot}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        onNewProject={handleNewProject}
        onLoadDemoTrack={(type) => loadSampleTrack(type, true)}
        isLoadingAudio={isLoadingAudio}
        savedIndicator={hasSavedIndicator}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenSettingsModal={() => setIsGlobalSettingsModalOpen(true)}
        onOpenMasterEqModal={() => setIsMasterEqModalOpen(true)}
        masterEqConfig={masterEqConfig}
      />

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Area: Canvas Stage & Audio Controls */}
        <CanvasStage
          canvasRef={canvasRef}
          aspectRatio={aspectRatio}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isLooping={isLooping}
          onToggleLoop={() => setIsLooping(!isLooping)}
          onUploadAudioFile={handleUploadAudioFile}
          audioFileName={audioFileName}
          language={language}
          onOpenMasterEq={() => setIsMasterEqModalOpen(true)}
          masterEqActive={masterEqConfig.enabled}
          hardwareConfig={hardwareConfig}
          livePerformance={livePerformance}
          hardwareInfo={hardwareInfo}
          onOpenSettings={() => setIsGlobalSettingsModalOpen(true)}
          onPreviousTrack={handlePreviousTrack}
          onNextTrack={() => handleNextTrack(false)}
          hasNextTrack={playlist.tracks.length > 1}
          hasPreviousTrack={playlist.tracks.length > 1 || currentTime > 3}
          playlistTrackInfo={
            playlist.tracks.length > 0 && playlist.tracks[playlist.currentIndex]
              ? {
                  current: playlist.currentIndex + 1,
                  total: playlist.tracks.length,
                  title: playlist.tracks[playlist.currentIndex].title,
                  artist: playlist.tracks[playlist.currentIndex].artist,
                  fadeInSec: playlist.enableFadeInOut ? playlist.tracks[playlist.currentIndex].fadeInSec : undefined,
                  fadeOutSec: playlist.enableFadeInOut ? playlist.tracks[playlist.currentIndex].fadeOutSec : undefined,
                }
              : undefined
          }
          onOpenPlaylist={() => setActiveTab('playlist')}
          repeatMode={playlist.repeatMode}
          onToggleRepeatMode={handleToggleRepeatMode}
          playlist={playlist}
          totalPlaylistDuration={totalPlaylistDuration}
          playlistElapsedTime={playlistElapsedTime}
          onSeekPlaylist={handleSeekPlaylist}
          isVisualizerVisible={visualizer.visible !== false}
          onToggleVisualizerVisible={() =>
            setVisualizer((prev) => ({ ...prev, visible: prev.visible === false ? true : false }))
          }
          lotties={lotties}
          selectedLottie={lotties.find((l) => l.id === selectedLottieId) || null}
          onSelectLottieId={(id) => setSelectedLottieId(id)}
          onUpdateLottie={(id, partial) =>
            setLotties((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)))
          }
        />

        {/* Right Area: Customization Panel Tabs */}
        <div className="w-full lg:w-[420px] xl:w-[460px] border-t lg:border-t-0 lg:border-l border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl flex flex-col shrink-0 h-[50vh] lg:h-[calc(100vh-4rem)]">
          {/* Tabs Navigation (Reorganized in logical production workflow) */}
          <div className="relative flex items-center border-b border-neutral-800/90 bg-neutral-900/50 px-1 py-1 shrink-0">
            {/* Desktop Left Scroll Button - Hidden on Mobile */}
            <button
              type="button"
              id="tab-scroll-left-btn"
              onClick={() => scrollTabs('left')}
              disabled={!canScrollTabsLeft}
              title={language === 'vi' ? 'Cuộn tab sang trái' : 'Scroll tabs left'}
              aria-label="Scroll tabs left"
              className={`hidden lg:flex items-center justify-center w-7 h-8 rounded-lg transition-all shrink-0 z-10 mr-1 border ${
                canScrollTabsLeft
                  ? 'text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700/60 shadow-sm cursor-pointer active:scale-90 hover:border-neutral-600'
                  : 'text-neutral-600 bg-neutral-900/40 border-neutral-800/40 opacity-30 cursor-default pointer-events-none'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Tabs Container */}
            <div
              ref={tabsContainerRef}
              className="flex-1 flex items-center gap-1 overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth py-0.5"
            >
              {/* 1. Playlist - Danh Sách Nhạc */}
              <button
                data-tab="playlist"
                onClick={() => setActiveTab('playlist')}
                title={TRANSLATIONS[language].tabPlaylist}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'playlist'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <ListMusic className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabPlaylist}</span>
              </button>

              {/* 2. Track - Thông Tin Bài Hát */}
              <button
                data-tab="track"
                onClick={() => setActiveTab('track')}
                title={TRANSLATIONS[language].tabTrack}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'track'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Disc className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabTrack}</span>
              </button>

              {/* 3. Visualizer - Sóng Nhạc */}
              <button
                data-tab="visualizer"
                onClick={() => setActiveTab('visualizer')}
                title={TRANSLATIONS[language].tabVisualizer}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'visualizer'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <BarChart2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabVisualizer}</span>
              </button>

              {/* 4. Lyrics - Lời Nhạc / Karaoke */}
              <button
                data-tab="lyrics"
                onClick={() => setActiveTab('lyrics')}
                title={TRANSLATIONS[language].tabLyrics}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'lyrics'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabLyrics}</span>
              </button>

              {/* 5. Text Boxes - Chữ & Hộp Tracklist */}
              <button
                data-tab="textboxes"
                onClick={() => setActiveTab('textboxes')}
                title={TRANSLATIONS[language].tabTextBoxes}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'textboxes'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Type className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabTextBoxes}</span>
              </button>

              {/* 6. Lottie Animation FX / LottieFiles (placed before Background) */}
              <button
                data-tab="lottie"
                onClick={() => setActiveTab('lottie')}
                title={TRANSLATIONS[language].tabLottie || 'LottieFiles'}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 relative ${
                  activeTab === 'lottie'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-300" />
                <span className="inline">{TRANSLATIONS[language].tabLottie || 'LottieFiles'}</span>
                {lotties.length > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-400 text-neutral-950 ml-0.5">
                    {lotties.length}
                  </span>
                )}
              </button>

              {/* 7. Background - Hình Nền & Hạt Bay */}
              <button
                data-tab="background"
                onClick={() => setActiveTab('background')}
                title={TRANSLATIONS[language].tabBackground}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'background'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <ImageIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabBackground}</span>
              </button>

              {/* 8. Scene Transitions - Hiệu Ứng Chuyển Cảnh */}
              <button
                data-tab="transitions"
                onClick={() => setActiveTab('transitions')}
                title={TRANSLATIONS[language].tabTransitions}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'transitions'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Layers className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="inline">{TRANSLATIONS[language].tabTransitions}</span>
              </button>

              {/* 9. Film Light - Ánh Sáng Phim & Bụi Điện Ảnh */}
              <button
                data-tab="filmlight"
                onClick={() => setActiveTab('filmlight')}
                title={TRANSLATIONS[language].tabFilmLight}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'filmlight'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span className="inline">{TRANSLATIONS[language].tabFilmLight}</span>
              </button>

              {/* 10. Color Grading - Chỉnh Màu & LUTs */}
              <button
                data-tab="colorgrading"
                onClick={() => setActiveTab('colorgrading')}
                title={TRANSLATIONS[language].tabColorGrading}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'colorgrading'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Palette className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span className="inline">{TRANSLATIONS[language].tabColorGrading}</span>
              </button>
            </div>

            {/* Desktop Right Scroll Button - Hidden on Mobile */}
            <button
              type="button"
              id="tab-scroll-right-btn"
              onClick={() => scrollTabs('right')}
              disabled={!canScrollTabsRight}
              title={language === 'vi' ? 'Cuộn tab sang phải' : 'Scroll tabs right'}
              aria-label="Scroll tabs right"
              className={`hidden lg:flex items-center justify-center w-7 h-8 rounded-lg transition-all shrink-0 z-10 ml-1 border ${
                canScrollTabsRight
                  ? 'text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700/60 shadow-sm cursor-pointer active:scale-90 hover:border-neutral-600'
                  : 'text-neutral-600 bg-neutral-900/40 border-neutral-800/40 opacity-30 cursor-default pointer-events-none'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content Panel (Scrollable, aligned in logical order) */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-5 custom-scrollbar">
            {/* 1. Playlist Content */}
            {activeTab === 'playlist' && (
              <AudioPlaylistTab
                playlist={playlist}
                onChangePlaylist={setPlaylist}
                onChange={setPlaylist}
                onPlayTrackAtIndex={(index) => playTrackAtIndex(index, true)}
                onSelectTrack={(index) => playTrackAtIndex(index, true)}
                onTogglePlay={handleTogglePlay}
                isPlaying={isPlaying}
                currentTime={currentTime}
                currentDuration={duration}
                language={language}
                currentBackground={background}
                defaultBackground={defaultBackground}
                onNavigateToBackgroundTab={() => setActiveTab('background')}
                onAddTracklistBox={handleAddTracklistToVisualizer}
                onNavigateToTextBoxTab={() => setActiveTab('textboxes')}
                onNavigateToLyricsTab={(trackIndex) => {
                  if (typeof trackIndex === 'number') {
                    playTrackAtIndex(trackIndex, false);
                  }
                  setActiveTab('lyrics');
                }}
                onUpdateTrackLyrics={handleUpdateTrackLyrics}
                onBatchImportLyrics={handleBatchImportLyrics}
              />
            )}

            {/* 2. Track Metadata Content */}
            {activeTab === 'track' && (
              <TrackTab track={track} onChange={setTrack} language={language} />
            )}

            {/* 3. Visualizer Content */}
            {activeTab === 'visualizer' && (
              <VisualizerTab
                config={visualizer}
                onChange={setVisualizer}
                detectedBpm={detectedBpm}
                isDetectingBpm={isDetectingBpm}
                onReDetectBpm={handleReDetectBpm}
              />
            )}

            {/* 4. Lyrics & Karaoke Content */}
            {activeTab === 'lyrics' && (
              <LyricsTab
                config={lyricsConfig}
                onChange={setLyricsConfig}
                lyrics={lyricsData}
                onLyricsChange={handleLyricsChange}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                language={language}
                playlist={playlist}
                onSelectTrackIndex={(idx) => playTrackAtIndex(idx, true)}
                onUpdateTrackLyrics={handleUpdateTrackLyrics}
                onBatchImportLyrics={handleBatchImportLyrics}
                onNavigateToPlaylistTab={() => setActiveTab('playlist')}
                onApplyLyricsToAllTracks={handleApplyLyricsToAllTracks}
              />
            )}

            {/* 5. Text Boxes & Tracklist Content */}
            {activeTab === 'textboxes' && (
              <TextBoxTab
                textBoxes={textBoxes}
                onChange={setTextBoxes}
                language={language}
                playlist={playlist}
              />
            )}

            {/* 6. Lottie Animation Overlays Content */}
            {activeTab === 'lottie' && (
              <LottieTab
                lotties={lotties}
                onChangeLotties={setLotties}
                selectedLottieId={selectedLottieId}
                onSelectLottieId={setSelectedLottieId}
                language={language}
              />
            )}

            {/* 7. Background Content */}
            {activeTab === 'background' && (
              <BackgroundTab
                background={background}
                onBackgroundChange={(newBg) => {
                  setBackground(newBg);
                  setDefaultBackground(newBg);
                }}
                particles={particles}
                onParticlesChange={setParticles}
                language={language}
                playlist={playlist}
                defaultBackground={defaultBackground}
                onUpdateTrackBackground={handleUpdateTrackBackground}
                onApplyBackgroundToAllTracks={handleApplyBackgroundToAllTracks}
                onSelectTrackForPlayback={(idx) => playTrackAtIndex(idx, false)}
              />
            )}

            {/* 8. Scene Transitions Content */}
            {activeTab === 'transitions' && (
              <SceneTransitionsTab
                transitions={sceneTransitions}
                onTransitionsChange={setSceneTransitions}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                currentVisualizer={visualizer}
                currentBackground={background}
                language={language}
              />
            )}

            {/* 9. Film Light Content */}
            {activeTab === 'filmlight' && (
              <FilmLightTab
                filmLight={filmLight}
                onChange={setFilmLight}
                language={language}
              />
            )}

            {/* 10. Color Grading Content */}
            {activeTab === 'colorgrading' && (
              <ColorGradingTab
                colorGrading={colorGrading}
                onChange={setColorGrading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preset Templates Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectTheme={handleSelectPresetTheme}
        language={language}
        currentConfig={{
          aspectRatio,
          visualizer,
          lyrics: lyricsConfig,
          background,
          particles,
          filmLight,
          colorGrading,
          track,
          textBoxes,
        }}
      />

      {/* Projects & Local Storage Save/Load Modal */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        currentConfig={{
          aspectRatio,
          visualizer,
          lyricsConfig,
          lyricsData,
          background,
          particles,
          filmLight,
          colorGrading,
          masterEq: masterEqConfig,
          track,
          textBoxes,
          sceneTransitions,
          lotties,
          audioFileName,
        }}
        onLoadProject={handleLoadProject}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* Pro Master Audio Equalizer Modal */}
      <MasterEQModal
        isOpen={isMasterEqModalOpen}
        onClose={() => setIsMasterEqModalOpen(false)}
        config={masterEqConfig}
        onChange={setMasterEqConfig}
        language={language}
      />

      {/* Global Settings & Language Configuration Modal */}
      <GlobalSettingsModal
        isOpen={isGlobalSettingsModalOpen}
        onClose={() => setIsGlobalSettingsModalOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        masterEqConfig={masterEqConfig}
        onOpenMasterEq={() => setIsMasterEqModalOpen(true)}
        aspectRatio={aspectRatio}
        onSelectAspectRatio={setAspectRatio}
        highPerformanceRender={highPerformanceRender}
        onToggleHighPerformanceRender={setHighPerformanceRender}
        hardwareConfig={hardwareConfig}
        onUpdateHardwareConfig={setHardwareConfig}
        hardwareInfo={hardwareInfo}
        autoSaveEnabled={autoSaveEnabled}
        onToggleAutoSave={setAutoSaveEnabled}
      />

      {/* High Definition Video Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        aspectRatio={aspectRatio}
        duration={duration}
        onStartExport={handleStartExport}
        onCancelExport={handleCancelExport}
        onResetExport={() => {
          setExportedBlob(null);
          setExportProgress(0);
        }}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportCurrentSeconds={exportCurrentSec}
        exportTotalSeconds={exportTotalSec}
        exportedBlob={exportedBlob}
        onDownloadExportedVideo={handleDownloadExportedVideo}
        playlist={playlist}
        language={language}
      />

      {/* New Project Confirmation Modal (Safe for Sandboxed iFrames) */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onConfirm={executeResetToDefaults}
        language={language}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
