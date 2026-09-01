import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from './types';
import {
  DEFAULT_VISUALIZER,
  DEFAULT_LYRICS,
  DEFAULT_BACKGROUND,
  DEFAULT_PARTICLES,
  DEFAULT_TRACK,
  DEFAULT_TEXT_BOXES,
  DEFAULT_FILM_LIGHT,
  DEFAULT_COLOR_GRADING,
  DEFAULT_MASTER_EQ,
  SAMPLE_SRT_LOFI,
  SAMPLE_SRT_SYNTHWAVE,
  SAMPLE_SRT_ACOUSTIC,
} from './utils/presets';
import { parseAnyLyrics } from './utils/lyricsParser';
import { AudioEngine } from './utils/audioEngine';
import { VisualizerRenderer } from './utils/visualizerRenderer';
import { VideoExporter } from './utils/videoExporter';
import {
  SavedProject,
  saveAutoSave,
  getAutoSave,
  hasAutoSave,
} from './utils/projectStorage';
import { Language, getSavedLanguage, saveLanguage, TRANSLATIONS } from './utils/i18n';
import { Header } from './components/Header';
import { CanvasStage } from './components/CanvasStage';
import { VisualizerTab } from './components/VisualizerTab';
import { LyricsTab } from './components/LyricsTab';
import { BackgroundTab } from './components/BackgroundTab';
import { FilmLightTab } from './components/FilmLightTab';
import { ColorGradingTab } from './components/ColorGradingTab';
import { TrackTab } from './components/TrackTab';
import { TextBoxTab } from './components/TextBoxTab';
import { PresetsModal } from './components/PresetsModal';
import { ProjectsModal } from './components/ProjectsModal';
import { ExportModal } from './components/ExportModal';
import { MasterEQModal } from './components/MasterEQModal';
import { GlobalSettingsModal } from './components/GlobalSettingsModal';

import {
  BarChart2,
  FileText,
  ImageIcon,
  Sparkles,
  Palette,
  Disc,
  Type,
} from 'lucide-react';

export function App() {
  // 1. Core Studio Configurations
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [visualizer, setVisualizer] = useState<VisualizerConfig>(DEFAULT_VISUALIZER);
  const [lyricsConfig, setLyricsConfig] = useState<LyricsConfig>(DEFAULT_LYRICS);
  const [lyricsData, setLyricsData] = useState<LyricLine[]>(() =>
    parseAnyLyrics(SAMPLE_SRT_SYNTHWAVE, 30)
  );
  const [background, setBackground] = useState<BackgroundConfig>(DEFAULT_BACKGROUND);
  const [particles, setParticles] = useState<ParticleConfig>(DEFAULT_PARTICLES);
  const [filmLight, setFilmLight] = useState<FilmLightConfig>(DEFAULT_FILM_LIGHT);
  const [colorGrading, setColorGrading] = useState<ColorGradingConfig>(DEFAULT_COLOR_GRADING);
  const [track, setTrack] = useState<TrackMetadata>(DEFAULT_TRACK);
  const [textBoxes, setTextBoxes] = useState<TextBoxItem[]>(DEFAULT_TEXT_BOXES);

  // 2. Audio Engine & State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.85);
  const [isLooping, setIsLooping] = useState(true);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [audioFileName, setAudioFileName] = useState('Neon_Synthwave_Demo.wav');
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [sampleAudioType, setSampleAudioType] = useState<'lofi' | 'synthwave' | 'acoustic' | 'edm'>('synthwave');
  const [detectedBpm, setDetectedBpm] = useState<number>(120);
  const [isDetectingBpm, setIsDetectingBpm] = useState<boolean>(false);
  const currentAudioBlobRef = useRef<Blob | File | null>(null);

  // 3. UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<
    'visualizer' | 'lyrics' | 'background' | 'filmlight' | 'colorgrading' | 'track' | 'textboxes'
  >('visualizer');
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMasterEqModalOpen, setIsMasterEqModalOpen] = useState(false);
  const [isGlobalSettingsModalOpen, setIsGlobalSettingsModalOpen] = useState(false);
  const [hasSavedIndicator, setHasSavedIndicator] = useState(false);

  // 4. Global Language & Pro Master EQ State
  const [language, setLanguage] = useState<Language>(() => getSavedLanguage());
  const [masterEqConfig, setMasterEqConfig] = useState<MasterEQConfig>(() => {
    try {
      const saved = localStorage.getItem('sonawave_master_eq_v1');
      return saved ? JSON.parse(saved) : DEFAULT_MASTER_EQ;
    } catch {
      return DEFAULT_MASTER_EQ;
    }
  });

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    saveLanguage(newLang);
  };

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
        filmLight,
        colorGrading,
        masterEq: masterEqConfig,
        audioFileName,
        sampleAudioType,
      });
      setHasSavedIndicator(true);
      const hideTimer = setTimeout(() => setHasSavedIndicator(false), 2000);
      return () => clearTimeout(hideTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, [
    aspectRatio,
    visualizer,
    lyricsConfig,
    lyricsData,
    background,
    particles,
    filmLight,
    colorGrading,
    masterEqConfig,
    track,
    textBoxes,
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
      setTrack(autoSaved.track);
      setTextBoxes(autoSaved.textBoxes || DEFAULT_TEXT_BOXES);
      setAudioFileName(autoSaved.audioFileName || 'Neon_Synthwave_Demo.wav');

      rendererRef.current.setBackgroundImage(autoSaved.background.url);
      rendererRef.current.setCoverImage(autoSaved.track.coverUrl);

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
      rendererRef.current.syncVideoPlayback(isPlaying);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setCoverImage(track.coverUrl);
    }
  }, [track.coverUrl]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setBadgeImage(track.badgePngUrl || '');
    }
  }, [track.badgePngUrl]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setLogoImage(track.logoUrl || '');
    }
  }, [track.logoUrl]);

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

      setAudioFileName(`${sampleTitle.replace(/\s+/g, '_')}.wav`);
      if (updateLyrics) {
        setTrack((prev) => ({
          ...prev,
          title: sampleTitle,
          artist: sampleArtist,
        }));
        const parsed = parseAnyLyrics(sampleLyrics, 30);
        setLyricsData(parsed);
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
    if (parts.length > 1) {
      setTrack((prev) => ({
        ...prev,
        artist: parts[0].trim(),
        title: parts.slice(1).join('-').trim(),
      }));
    } else {
      setTrack((prev) => ({
        ...prev,
        title: cleanName,
      }));
    }

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
    }
  };

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
    setTrack(project.track);
    setTextBoxes(project.textBoxes || DEFAULT_TEXT_BOXES);
    setAudioFileName(project.audioFileName || 'Neon_Synthwave_Demo.wav');

    if (rendererRef.current) {
      rendererRef.current.setBackgroundImage(project.background.url);
      rendererRef.current.setCoverImage(project.track.coverUrl);
    }

    if (project.sampleAudioType) {
      loadSampleTrack(project.sampleAudioType, false);
    }
  };

  // Reset to default blank state
  const handleResetToDefaults = () => {
    setAspectRatio('9:16');
    setVisualizer(DEFAULT_VISUALIZER);
    setLyricsConfig(DEFAULT_LYRICS);
    setBackground(DEFAULT_BACKGROUND);
    setParticles(DEFAULT_PARTICLES);
    setFilmLight(DEFAULT_FILM_LIGHT);
    setColorGrading(DEFAULT_COLOR_GRADING);
    setMasterEqConfig(DEFAULT_MASTER_EQ);
    setTrack(DEFAULT_TRACK);
    setTextBoxes(DEFAULT_TEXT_BOXES);
    loadSampleTrack('synthwave', true);
  };

  // Apply Preset Theme
  const handleSelectPresetTheme = (theme: PresetTheme) => {
    setAspectRatio(theme.aspectRatio);
    setVisualizer(theme.visualizer);
    setLyricsConfig(theme.lyrics);
    setBackground(theme.background);
    setParticles(theme.particles);
    setFilmLight(theme.filmLight || DEFAULT_FILM_LIGHT);
    setColorGrading(theme.colorGrading || DEFAULT_COLOR_GRADING);
    setTrack(theme.track);

    if (theme.sampleAudio) {
      loadSampleTrack(theme.sampleAudio.type);
    }
  };

  // Snapshot Capture
  const handleCaptureSnapshot = () => {
    if (canvasRef.current) {
      VideoExporter.captureSnapshot(
        canvasRef.current,
        `SonaWave_${track.title.replace(/\s+/g, '_')}_Cover.png`
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

            // Throttled beat indicator update for UI (every 120ms) to avoid render spam
            if (time - lastBeatUpdate > 120) {
              lastBeatUpdate = time;
              setBeatIntensity(beatIntensityVal);
            }
          }

          const curTime = audioRef.current ? audioRef.current.currentTime : currentTimeRef.current;

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
            colorGradingRef.current
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

    // Start playback
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn('Playback error during export:', e);
    }

    // Get fresh audio stream with live active tracks
    const audioStream = audioEngine.getFreshAudioStream();
    const recordPromise = exporter.startRecording(
      exportCanvas,
      audioStream,
      settings.fps,
      settings.qualityBitrate
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
      const filename = `SonaWave_${track.title.replace(/\s+/g, '_')}_${aspectRatio}_${Date.now()}.mp4`;
      const mp4Blob = exportedBlob.type === 'video/mp4' ? exportedBlob : new Blob([exportedBlob], { type: 'video/mp4' });
      VideoExporter.downloadBlob(mp4Blob, filename);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        loop={isLooping}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 30);
          }
        }}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
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
          beatIntensity={beatIntensity}
          onUploadAudioFile={handleUploadAudioFile}
          audioFileName={audioFileName}
          language={language}
          onOpenMasterEq={() => setIsMasterEqModalOpen(true)}
          masterEqActive={masterEqConfig.enabled}
        />

        {/* Right Area: Customization Panel Tabs */}
        <div className="w-full lg:w-[420px] xl:w-[460px] border-t lg:border-t-0 lg:border-l border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl flex flex-col shrink-0 h-[50vh] lg:h-[calc(100vh-4rem)]">
          {/* Tabs Navigation */}
          <div className="flex items-center border-b border-neutral-800/90 bg-neutral-900/50 p-1.5 gap-1 shrink-0 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('visualizer')}
              title={TRANSLATIONS[language].tabVisualizer}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'visualizer'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <BarChart2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabVisualizer}</span>
            </button>

            <button
              onClick={() => setActiveTab('lyrics')}
              title={TRANSLATIONS[language].tabLyrics}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'lyrics'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <FileText className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabLyrics}</span>
            </button>

            <button
              onClick={() => setActiveTab('background')}
              title={TRANSLATIONS[language].tabBackground}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'background'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <ImageIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabBackground}</span>
            </button>

            <button
              onClick={() => setActiveTab('filmlight')}
              title={TRANSLATIONS[language].tabFilmLight}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'filmlight'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabFilmLight}</span>
            </button>

            <button
              onClick={() => setActiveTab('colorgrading')}
              title={TRANSLATIONS[language].tabColorGrading}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'colorgrading'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Palette className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabColorGrading}</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              title={TRANSLATIONS[language].tabTrack}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'track'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Disc className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabTrack}</span>
            </button>

            <button
              onClick={() => setActiveTab('textboxes')}
              title={TRANSLATIONS[language].tabTextBoxes}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'textboxes'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Type className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{TRANSLATIONS[language].tabTextBoxes}</span>
            </button>
          </div>

          {/* Tab Content Panel (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-5 custom-scrollbar">
            {activeTab === 'visualizer' && (
              <VisualizerTab
                config={visualizer}
                onChange={setVisualizer}
                detectedBpm={detectedBpm}
                isDetectingBpm={isDetectingBpm}
                onReDetectBpm={handleReDetectBpm}
              />
            )}

            {activeTab === 'lyrics' && (
              <LyricsTab
                config={lyricsConfig}
                onChange={setLyricsConfig}
                lyrics={lyricsData}
                onLyricsChange={setLyricsData}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                language={language}
              />
            )}

            {activeTab === 'background' && (
              <BackgroundTab
                background={background}
                onBackgroundChange={setBackground}
                particles={particles}
                onParticlesChange={setParticles}
              />
            )}

            {activeTab === 'filmlight' && (
              <FilmLightTab
                filmLight={filmLight}
                onChange={setFilmLight}
              />
            )}

            {activeTab === 'colorgrading' && (
              <ColorGradingTab
                colorGrading={colorGrading}
                onChange={setColorGrading}
              />
            )}

            {activeTab === 'track' && (
              <TrackTab track={track} onChange={setTrack} />
            )}

            {activeTab === 'textboxes' && (
              <TextBoxTab textBoxes={textBoxes} onChange={setTextBoxes} />
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
      />
    </div>
  );
}

export default App;
