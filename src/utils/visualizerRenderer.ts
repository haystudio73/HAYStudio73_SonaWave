import {
  VisualizerConfig,
  BackgroundConfig,
  LyricsConfig,
  ParticleConfig,
  ParticleShape,
  TextBoxLayerOrder,
  TrackLayerOrder,
  TrackMetadata,
  LyricLine,
  TextBoxItem,
  AspectRatio,
  FilmLightConfig,
  ColorGradingConfig,
  SnowFlakeType,
  RainDropType,
  KaraokeSweepMode,
} from '../types';
import { getActiveLyricInfo } from './lyricsParser';

interface Particle {
  x: number;
  y: number;
  z?: number;
  pz?: number;
  vx: number;
  vy: number;
  speed?: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  hue: number;
  angle?: number;
  rotSpeed?: number;
  length?: number;
  orbitRadius?: number;
  wobble?: number;
  wobbleSpeed?: number;
  flakeType?: 'crystal' | 'flurry' | 'glitter';
  rainDropType?: RainDropType;
}

export type CanvasContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export class VisualizerRenderer {
  private particles: Particle[] = [];

  private bgImage: HTMLImageElement | null = null;
  private bgImageSrc = '';
  private bgVideo: HTMLVideoElement | null = null;
  private bgVideoSrc = '';
  private coverImage: HTMLImageElement | null = null;
  private coverImageSrc = '';
  private badgePngImage: HTMLImageElement | null = null;
  private badgePngImageSrc = '';
  private logoImage: HTMLImageElement | null = null;
  private logoImageSrc = '';

  private vinylRotation = 0;
  private peakBars: number[] = [];
  private peakVelocities: number[] = [];
  private radialPeaks: number[] = [];
  private radialVelocities: number[] = [];

  // Smooth Fade-In State (Only show visualizer wave 0.8s after user presses Play)
  private playStartTime = 0;
  private visualizerOpacity = 0;

  // Background Beat & Bass Zoom State
  private currentBgZoom = 1.0;
  private lastBgZoomTime = 0;
  private bgShakeX = 0;
  private bgShakeY = 0;

  // Visualizer Chromatic Aberration Offscreen Buffers
  private visBufferCanvas: HTMLCanvasElement | null = null;
  private visBufferCtx: CanvasRenderingContext2D | null = null;
  private visRedCanvas: HTMLCanvasElement | null = null;
  private visRedCtx: CanvasRenderingContext2D | null = null;
  private visCyanCanvas: HTMLCanvasElement | null = null;
  private visCyanCtx: CanvasRenderingContext2D | null = null;

  // Global Color Grading Offscreen Buffers & Grain Cache
  private gradingCanvas: HTMLCanvasElement | null = null;
  private gradingCtx: CanvasRenderingContext2D | null = null;
  private grainNoiseCanvas: HTMLCanvasElement | null = null;
  private grainNoiseCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initParticles(60);
  }

  public setBackgroundImage(url: string) {
    if (this.bgImageSrc === url && this.bgImage) return;
    this.bgImageSrc = url;
    if (!url) {
      this.bgImage = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.bgImage = img;
    };
  }

  public setBackgroundVideo(url: string) {
    if (this.bgVideoSrc === url && this.bgVideo) return;
    this.bgVideoSrc = url;
    if (!url) {
      if (this.bgVideo) {
        this.bgVideo.pause();
        this.bgVideo.src = '';
        this.bgVideo = null;
      }
      return;
    }
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = url;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.onloadeddata = () => {
      video.play().catch(() => {});
    };
    this.bgVideo = video;
  }

  public syncVideoPlayback(isPlaying: boolean, currentTime?: number) {
    if (!this.bgVideo) return;
    if (isPlaying) {
      if (this.bgVideo.paused) {
        this.bgVideo.play().catch(() => {});
      }
    } else {
      if (!this.bgVideo.paused) {
        this.bgVideo.pause();
      }
    }
  }

  public setCoverImage(url: string) {
    if (this.coverImageSrc === url && this.coverImage) return;
    this.coverImageSrc = url;
    if (!url) {
      this.coverImage = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.coverImage = img;
    };
  }

  public setBadgeImage(url: string) {
    if (this.badgePngImageSrc === url && this.badgePngImage) return;
    this.badgePngImageSrc = url;
    if (!url) {
      this.badgePngImage = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.badgePngImage = img;
    };
  }

  public setLogoImage(url: string) {
    if (this.logoImageSrc === url && this.logoImage) return;
    this.logoImageSrc = url;
    if (!url) {
      this.logoImage = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.logoImage = img;
    };
  }

  private initParticles(count: number) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const zInit = Math.random() * 1000 + 10;
      this.particles.push({
        x: Math.random() * 1920,
        y: Math.random() * 1920,
        z: zInit,
        pz: zInit,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8 - 0.3,
        speed: Math.random() * 4 + 4,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.7 + 0.2,
        baseAlpha: Math.random() * 0.7 + 0.2,
        hue: Math.random() * 360,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08 + (Math.random() > 0.5 ? 0.035 : -0.035),
        length: Math.random() * 24 + 16,
        orbitRadius: Math.random() * 250 + 50,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        flakeType: Math.random() > 0.4 ? 'crystal' : 'flurry',
        rainDropType: Math.random() > 0.5 ? 'streaks' : (Math.random() > 0.5 ? 'drizzle' : 'heavy'),
      });
    }
  }

  /**
   * Main render function called on every frame
   */
  public render(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    currentTime: number,
    freqData: Uint8Array,
    timeData: Uint8Array,
    bassIntensity: number,
    trebleIntensity: number,
    overallVolume: number,
    beatIntensity: number,
    visualizer: VisualizerConfig,
    lyrics: LyricsConfig,
    lyricsData: LyricLine[],
    background: BackgroundConfig,
    particlesConfig: ParticleConfig,
    track: TrackMetadata,
    textBoxes: TextBoxItem[] = [],
    aspectRatio: AspectRatio,
    isPlaying: boolean,
    filmLight?: FilmLightConfig,
    colorGrading?: ColorGradingConfig
  ) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Determine target context: if color grading is active, render scene into offscreen grading buffer first
    const isGradingActive = colorGrading && colorGrading.enabled;
    let sceneCtx: CanvasContext2D = ctx;

    if (isGradingActive) {
      this.ensureGradingBuffers(width, height);
      if (this.gradingCtx) {
        sceneCtx = this.gradingCtx;
        sceneCtx.clearRect(0, 0, width, height);
      }
    }

    // Helper function to render text boxes assigned to a specific layer slot
    const renderTextBoxesForLayer = (layer: TextBoxLayerOrder) => {
      const filtered = textBoxes.filter((b) => (b.layerOrder || 'front-all') === layer);
      if (filtered.length > 0) {
        this.renderTextBoxes(sceneCtx, width, height, filtered, beatIntensity);
      }
    };

    // Helper function to render Track Card/Badge based on assigned layer slot
    const trackOrder = track.layerOrder || 'behind-visualizer';
    const renderTrackCardIfSlot = (slot: TrackLayerOrder) => {
      if (trackOrder === slot && track.showTrackCard && track.cardStyle !== 'hidden') {
        this.renderTrackCard(sceneCtx, width, height, track, bassIntensity, beatIntensity, isPlaying);
      }
    };

    // 1. Render Background (Image / Video / Gradient)
    this.renderBackground(sceneCtx, width, height, background, bassIntensity, beatIntensity, isPlaying);

    // 1.2 Render Track Card if configured 'back-all'
    renderTrackCardIfSlot('back-all');

    // 1.5 Render Text Boxes: 'back-all' (Phía sau cùng - ngay trên background)
    renderTextBoxesForLayer('back-all');

    // 2. Render Particles Overlay
    if (particlesConfig.enabled) {
      this.renderParticles(sceneCtx, width, height, particlesConfig, bassIntensity, trebleIntensity, beatIntensity, currentTime, isPlaying);
    }

    // 2.5 Render Text Boxes: 'behind-track' (Phía sau Đĩa nhạc / Thẻ bài hát)
    renderTextBoxesForLayer('behind-track');

    // 3. Render Track Cover / Badge (if default 'behind-visualizer')
    renderTrackCardIfSlot('behind-visualizer');

    // 3.5 Render Text Boxes: 'behind-visualizer' (Phía sau Sóng âm)
    renderTextBoxesForLayer('behind-visualizer');

    // 4. Calculate Visualizer 0.8s Fade-In on Play
    if (isPlaying) {
      if (this.playStartTime === 0) {
        this.playStartTime = performance.now();
      }
      const elapsedPlaySeconds = (performance.now() - this.playStartTime) / 1000;
      if (elapsedPlaySeconds < 0.8) {
        this.visualizerOpacity = 0;
      } else {
        // Smooth 0.5s ease-in to 1.0
        this.visualizerOpacity = Math.min(1, (elapsedPlaySeconds - 0.8) / 0.5);
      }
    } else {
      this.playStartTime = 0;
      this.visualizerOpacity = Math.max(0, this.visualizerOpacity - 0.08);
    }

    // 5. Render Waveform / Audio Visualizer (Only when opacity > 0)
    if (this.visualizerOpacity > 0.005) {
      sceneCtx.save();
      sceneCtx.globalAlpha = this.visualizerOpacity;
      this.renderVisualizer(
        sceneCtx,
        width,
        height,
        visualizer,
        freqData,
        timeData,
        bassIntensity,
        trebleIntensity,
        beatIntensity,
        currentTime
      );
      sceneCtx.restore();
    }

    // 5.2 Render Track Card if configured 'front-visualizer'
    renderTrackCardIfSlot('front-visualizer');

    // 5.5 Render Text Boxes: 'behind-lyrics' (Phía sau Lời bài hát)
    renderTextBoxesForLayer('behind-lyrics');

    // 6. Render Synchronized Lyrics
    if (lyrics.enabled && lyricsData.length > 0) {
      this.renderLyrics(sceneCtx, width, height, lyrics, lyricsData, currentTime, beatIntensity);
    }

    // 6.3 Render Track Card if configured 'front-all'
    renderTrackCardIfSlot('front-all');

    // 6.5 Render Text Boxes: 'front-all' (Phía trước tất cả - Trên cùng)
    renderTextBoxesForLayer('front-all');

    // 6.8 Render Custom Logo PNG Watermark (Brand Logo watermark)
    if (track.logoUrl && track.showLogo !== false) {
      this.renderLogoWatermark(sceneCtx, width, height, track, beatIntensity);
    }

    // 6.9 Render Film Light Effect Overlay (Full-screen Cinematic Light Leaks / Flares / Prism / Burn)
    if (filmLight && filmLight.enabled) {
      this.renderFilmLight(
        sceneCtx,
        width,
        height,
        filmLight,
        bassIntensity,
        trebleIntensity,
        beatIntensity,
        currentTime,
        isPlaying
      );
    }

    // If color grading is active, composite the graded scene buffer onto main target canvas
    if (isGradingActive && colorGrading) {
      this.applyColorGrading(ctx, width, height, colorGrading);
    }

    // 7. Permanent Copyright Watermark: 🔥 Visualizer by HAY Studio73 (Rendered directly on top)
    this.renderCopyrightWatermark(ctx, width, height);

    ctx.restore();
  }

  /**
   * Ensure offscreen buffers for Global Color Grading
   */
  private ensureGradingBuffers(width: number, height: number) {
    if (!this.gradingCanvas) {
      this.gradingCanvas = document.createElement('canvas');
      this.gradingCtx = this.gradingCanvas.getContext('2d', { willReadFrequently: false });
    }
    if (this.gradingCanvas.width !== width || this.gradingCanvas.height !== height) {
      this.gradingCanvas.width = width;
      this.gradingCanvas.height = height;
    }
  }

  /**
   * Apply Global Color Grading (LUTs, Saturation, Contrast, Brightness, Exposure, Temperature, Split Toning, Vignette & Grain)
   */
  private applyColorGrading(
    targetCtx: CanvasContext2D,
    width: number,
    height: number,
    grading: ColorGradingConfig
  ) {
    if (!this.gradingCanvas) return;

    // 1. Calculate Primary Tonal Factors
    const exp = (grading.exposure || 0) / 100;
    const bri = (grading.brightness || 0) / 100;
    const con = (grading.contrast || 0) / 100;
    const sat = (grading.saturation || 0) / 100;
    const hue = grading.hueRotate || 0;
    const sep = grading.sepia || 0;

    const brightnessMul = Math.max(0.05, 1 + bri + exp * 0.55);
    const contrastMul = Math.max(0.05, 1 + con);
    const saturateMul = Math.max(0, 1 + sat);

    // 2. Base Filter Draw onto targetCtx
    targetCtx.save();
    try {
      (targetCtx as any).filter = `brightness(${brightnessMul}) contrast(${contrastMul}) saturate(${saturateMul}) hue-rotate(${hue}deg) sepia(${sep}%)`;
    } catch {
      // Fallback if filter is unsupported
    }
    targetCtx.drawImage(this.gradingCanvas, 0, 0);
    try {
      (targetCtx as any).filter = 'none';
    } catch {}
    targetCtx.restore();

    // 3. Temperature Overlay (Warm Gold vs Cool Cyan)
    if (grading.temperature !== 0) {
      targetCtx.save();
      const temp = grading.temperature;
      if (temp > 0) {
        // Warm Amber / Golden Sunset
        const alpha = Math.min(0.65, (temp / 100) * 0.45);
        targetCtx.globalCompositeOperation = 'color';
        targetCtx.fillStyle = `rgba(255, 175, 45, ${alpha})`;
        targetCtx.fillRect(0, 0, width, height);

        // Soft light glow for warm sunlit warmth
        targetCtx.globalCompositeOperation = 'soft-light';
        targetCtx.fillStyle = `rgba(255, 130, 0, ${alpha * 0.65})`;
        targetCtx.fillRect(0, 0, width, height);
      } else {
        // Cool Cyan / Cold Cinematic Blue
        const cold = Math.abs(temp);
        const alpha = Math.min(0.65, (cold / 100) * 0.45);
        targetCtx.globalCompositeOperation = 'color';
        targetCtx.fillStyle = `rgba(45, 160, 255, ${alpha})`;
        targetCtx.fillRect(0, 0, width, height);

        // Soft light for deep cold cinema blue
        targetCtx.globalCompositeOperation = 'soft-light';
        targetCtx.fillStyle = `rgba(0, 110, 230, ${alpha * 0.65})`;
        targetCtx.fillRect(0, 0, width, height);
      }
      targetCtx.restore();
    }

    // 4. Tint Overlay (Green vs Magenta)
    if (grading.tint !== 0) {
      targetCtx.save();
      const tint = grading.tint;
      if (tint > 0) {
        // Magenta / Pink
        const alpha = Math.min(0.5, (tint / 100) * 0.35);
        targetCtx.globalCompositeOperation = 'soft-light';
        targetCtx.fillStyle = `rgba(255, 0, 180, ${alpha})`;
        targetCtx.fillRect(0, 0, width, height);
      } else {
        // Green / Cyber Matrix
        const green = Math.abs(tint);
        const alpha = Math.min(0.5, (green / 100) * 0.35);
        targetCtx.globalCompositeOperation = 'soft-light';
        targetCtx.fillStyle = `rgba(0, 255, 110, ${alpha})`;
        targetCtx.fillRect(0, 0, width, height);
      }
      targetCtx.restore();
    }

    // 5. Shadows Lift / Milky Blacks
    if (grading.shadowsLift && grading.shadowsLift > 0) {
      targetCtx.save();
      targetCtx.globalCompositeOperation = 'screen';
      const liftAlpha = Math.min(0.35, (grading.shadowsLift / 100) * 0.22);
      targetCtx.fillStyle = `rgba(55, 50, 60, ${liftAlpha})`;
      targetCtx.fillRect(0, 0, width, height);
      targetCtx.restore();
    }

    // 6. Split Toning (Highlights Tint & Shadows Tint)
    if (grading.splitToneIntensity && grading.splitToneIntensity > 0) {
      const splitAlpha = (grading.splitToneIntensity / 100) * 0.45;
      
      // Highlights Tint (screen blend)
      if (grading.highlightsTint) {
        targetCtx.save();
        targetCtx.globalCompositeOperation = 'screen';
        targetCtx.fillStyle = grading.highlightsTint;
        targetCtx.globalAlpha = splitAlpha * 0.6;
        targetCtx.fillRect(0, 0, width, height);
        targetCtx.restore();
      }

      // Shadows Tint (multiply blend)
      if (grading.shadowsTint) {
        targetCtx.save();
        targetCtx.globalCompositeOperation = 'multiply';
        targetCtx.fillStyle = grading.shadowsTint;
        targetCtx.globalAlpha = splitAlpha * 0.75;
        targetCtx.fillRect(0, 0, width, height);
        targetCtx.restore();
      }
    }

    // 7. Bloom / Soft Diffusion Glow
    if (grading.bloomGlow && grading.bloomGlow > 0) {
      targetCtx.save();
      targetCtx.globalCompositeOperation = 'screen';
      const blurPx = Math.max(4, Math.round(Math.min(width, height) * 0.022));
      try {
        (targetCtx as any).filter = `blur(${blurPx}px) brightness(1.25) saturate(1.15)`;
      } catch {}
      targetCtx.globalAlpha = Math.min(0.65, (grading.bloomGlow / 100) * 0.55);
      targetCtx.drawImage(this.gradingCanvas, 0, 0);
      try {
        (targetCtx as any).filter = 'none';
      } catch {}
      targetCtx.restore();
    }

    // 8. Post-Process Vignette
    if (grading.vignette && grading.vignette > 0) {
      targetCtx.save();
      const vigStrength = grading.vignette / 100;
      const feather = (grading.vignetteFeather || 65) / 100;
      const radius = Math.max(width, height) * 0.72;
      const grad = targetCtx.createRadialGradient(
        width / 2,
        height / 2,
        radius * Math.max(0.1, 1 - feather),
        width / 2,
        height / 2,
        radius
      );
      const col = grading.vignetteColor || '#000000';
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
      
      const cleanHex = col.replace('#', '');
      let r = 0, g = 0, b = 0;
      if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${Math.min(0.95, vigStrength * 0.95)})`);
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, width, height);
      targetCtx.restore();
    }

    // 9. Procedural Film Grain Noise
    if (grading.filmGrain && grading.filmGrain > 0) {
      this.renderFilmGrainNoise(targetCtx, width, height, grading.filmGrain);
    }
  }

  /**
   * Fast Procedural 35mm Film Grain Noise Generator
   */
  private renderFilmGrainNoise(ctx: CanvasContext2D, width: number, height: number, intensity: number) {
    if (!this.grainNoiseCanvas) {
      this.grainNoiseCanvas = document.createElement('canvas');
      this.grainNoiseCanvas.width = 256;
      this.grainNoiseCanvas.height = 256;
      this.grainNoiseCtx = this.grainNoiseCanvas.getContext('2d');
    }
    if (!this.grainNoiseCtx) return;

    const imgData = this.grainNoiseCtx.createImageData(256, 256);
    const data = imgData.data;
    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      const val = (Math.random() * 255) | 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = (Math.random() * 70) | 0;
    }
    this.grainNoiseCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = Math.min(0.45, (intensity / 100) * 0.38);
    const pattern = ctx.createPattern(this.grainNoiseCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  /**
   * Permanent Copyright Watermark (Non-removable bottom branding)
   */
  private renderCopyrightWatermark(ctx: CanvasContext2D, width: number, height: number) {
    ctx.save();
    const text = '🔥 Visualizer by HAY Studio73 ';
    const fontSize = Math.max(12, Math.min(18, Math.round(width * 0.016)));
    const posY = height - Math.max(22, Math.round(height * 0.024));
    const centerX = width / 2;

    ctx.font = `600 ${fontSize}px 'Outfit', 'Be Vietnam Pro', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const pillW = textW + 28;
    const pillH = fontSize * 1.85;

    // Elegant frosted dark pill backdrop
    ctx.beginPath();
    ctx.roundRect(centerX - pillW / 2, posY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fillStyle = 'rgba(8, 12, 24, 0.72)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Soft glowing text
    ctx.shadowColor = 'rgba(255, 110, 60, 0.55)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, centerX, posY);

    ctx.restore();
  }

  /**
   * Background renderer (Supports Images, MP4 Videos, Gradients, Colors, Dynamic Beat & Bass Zoom)
   */
  private renderBackground(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    bg: BackgroundConfig,
    bassIntensity: number,
    beatIntensity: number,
    isPlaying: boolean
  ) {
    ctx.save();

    // 1. Dynamic Beat & Bass Zoom Calculation
    let zoom = 1.0;
    let offsetX = 0;
    let offsetY = 0;

    if (bg.beatZoom && isPlaying) {
      const now = performance.now();
      const dt = this.lastBgZoomTime > 0 ? Math.min(0.1, (now - this.lastBgZoomTime) / 1000) : 0.016;
      this.lastBgZoomTime = now;

      // Select audio trigger source: Bass (Sub kick), Beat (Tempo/Snare/Transient), or Hybrid (Combined)
      const trigger = bg.zoomTrigger || 'bass';
      let signal = 0;
      if (trigger === 'bass') {
        signal = bassIntensity;
      } else if (trigger === 'beat') {
        signal = beatIntensity;
      } else {
        // Hybrid: merges kick punch with rhythm beats
        signal = Math.max(bassIntensity * 1.05, beatIntensity * 0.95);
      }
      signal = Math.min(1.0, Math.max(0, signal));

      const maxIntensity = bg.zoomIntensity !== undefined ? bg.zoomIntensity : 0.05;
      const speedMultiplier = bg.zoomSpeed !== undefined ? bg.zoomSpeed : 1.0;
      const style = bg.zoomStyle || 'pulse';
      const invert = bg.zoomInvert || false;
      const direction = invert ? -1 : 1;

      let targetZoom = 1.0;

      if (style === 'smooth') {
        // Smooth cinematic zoom that expands fluidly with harmonic rhythm
        targetZoom = 1.0 + direction * (signal * maxIntensity * 1.25);
      } else if (style === 'shake') {
        // High-energy EDM shake & punchy zoom
        targetZoom = 1.0 + direction * (signal * maxIntensity * 1.4);
        if (signal > 0.25) {
          const shakeFactor = (signal - 0.25) * maxIntensity * 35 * speedMultiplier;
          this.bgShakeX = (Math.random() - 0.5) * shakeFactor;
          this.bgShakeY = (Math.random() - 0.5) * shakeFactor;
        } else {
          this.bgShakeX *= 0.65;
          this.bgShakeY *= 0.65;
        }
        offsetX = this.bgShakeX;
        offsetY = this.bgShakeY;
      } else if (style === 'breathe') {
        // Ambient organic breathing cycle modulated by low frequencies
        const breatheWave = (Math.sin(now * 0.0018 * speedMultiplier) * 0.5 + 0.5) * 0.45;
        targetZoom = 1.0 + direction * ((breatheWave + signal * 0.55) * maxIntensity);
      } else {
        // Default 'pulse': punchy beat bounce
        targetZoom = 1.0 + direction * (signal * maxIntensity * 1.5);
      }

      // Smooth attack & decay lerp parameterized by speedMultiplier (Slow: 0.4x -> Fast/Instant: 3.0x)
      const attackLerp = Math.min(1.0, dt * 24 * speedMultiplier);
      const decayLerp = Math.min(1.0, dt * 9 * speedMultiplier);

      if (targetZoom > this.currentBgZoom) {
        this.currentBgZoom += (targetZoom - this.currentBgZoom) * attackLerp;
      } else {
        this.currentBgZoom += (targetZoom - this.currentBgZoom) * decayLerp;
      }

      zoom = Math.max(0.85, Math.min(1.35, this.currentBgZoom));
    } else {
      this.currentBgZoom = 1.0;
      this.lastBgZoomTime = 0;
      this.bgShakeX = 0;
      this.bgShakeY = 0;
      zoom = 1.0;
    }

    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);

    // A. Video Background
    if ((bg.isVideo || bg.type === 'video') && this.bgVideo && this.bgVideo.readyState >= 2) {
      ctx.filter = `blur(${bg.blur}px) brightness(${bg.brightness}%) contrast(${bg.contrast}%)`;
      
      const vid = this.bgVideo;
      const vidW = vid.videoWidth || 1920;
      const vidH = vid.videoHeight || 1080;
      const vidAspect = vidW / vidH;
      const canvasAspect = width / height;
      let sx = 0, sy = 0, sw = vidW, sh = vidH;

      if (vidAspect > canvasAspect) {
        sw = vidH * canvasAspect;
        sx = (vidW - sw) / 2;
      } else {
        sh = vidW / canvasAspect;
        sy = (vidH - sh) / 2;
      }

      const bleed = bg.blur * 2;
      ctx.drawImage(vid, sx, sy, sw, sh, -bleed, -bleed, width + bleed * 2, height + bleed * 2);
      ctx.filter = 'none';

    } else if (bg.type === 'preset' || bg.type === 'upload') {
      if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth > 0) {
        ctx.filter = `blur(${bg.blur}px) brightness(${bg.brightness}%) contrast(${bg.contrast}%)`;
        
        const img = this.bgImage;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = width / height;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

        if (imgAspect > canvasAspect) {
          sw = img.naturalHeight * canvasAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / canvasAspect;
          sy = (img.naturalHeight - sh) / 2;
        }

        const bleed = bg.blur * 2;
        ctx.drawImage(img, sx, sy, sw, sh, -bleed, -bleed, width + bleed * 2, height + bleed * 2);
        ctx.filter = 'none';
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (bg.type === 'gradient') {
      const angleRad = (bg.gradientAngle * Math.PI) / 180;
      const x2 = width * Math.cos(angleRad);
      const y2 = height * Math.sin(angleRad);
      const grad = ctx.createLinearGradient(0, 0, x2, y2);
      grad.addColorStop(0, bg.color1);
      grad.addColorStop(1, bg.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bg.color1;
      ctx.fillRect(0, 0, width, height);
    }

    // Vignette Effect
    if (bg.vignette > 0) {
      const maxDim = Math.max(width, height);
      const vGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        maxDim * 0.25,
        centerX,
        centerY,
        maxDim * 0.75
      );
      vGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vGrad.addColorStop(1, `rgba(0, 0, 0, ${bg.vignette / 100})`);
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Glitch Effect in Background
    if (bg.glitchEffect) {
      this.applyBackgroundGlitch(ctx, width, height, bg, bassIntensity, beatIntensity, isPlaying);
    }

    ctx.restore();
  }

  /**
   * Background Glitch & Chromatic Aberration Renderer
   */
  private applyBackgroundGlitch(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    bg: BackgroundConfig,
    bassIntensity: number,
    beatIntensity: number,
    isPlaying: boolean
  ) {
    if (!bg.glitchEffect) return;

    const trigger = bg.glitchTrigger || 'bass';
    let shouldGlitch = false;
    let basePower = bg.glitchIntensity !== undefined ? bg.glitchIntensity : 0.45;

    if (trigger === 'continuous') {
      shouldGlitch = true;
    } else if (trigger === 'bass') {
      if (isPlaying && bassIntensity > 0.22) {
        shouldGlitch = true;
        basePower *= (0.7 + bassIntensity * 1.6);
      } else if (!isPlaying) {
        shouldGlitch = true;
        basePower *= 0.35;
      }
    } else if (trigger === 'beat') {
      if (isPlaying && beatIntensity > 0.2) {
        shouldGlitch = true;
        basePower *= (0.7 + beatIntensity * 1.6);
      } else if (!isPlaying) {
        shouldGlitch = true;
        basePower *= 0.35;
      }
    } else if (trigger === 'random') {
      if (Math.random() < (isPlaying ? 0.35 : 0.15)) {
        shouldGlitch = true;
        basePower *= (0.8 + Math.random() * 0.8);
      }
    }

    if (!shouldGlitch || basePower <= 0.01) return;

    ctx.save();
    const style = bg.glitchStyle || 'rgb-shift';
    const colorSplit = bg.glitchColorSplit !== false;
    const numSlices = Math.min(18, Math.floor(4 + basePower * 14));

    // 1. Horizontal Slices Displacement
    for (let i = 0; i < numSlices; i++) {
      const sliceY = Math.random() * height;
      const sliceH = Math.min(height - sliceY, Math.random() * (16 + basePower * 50) + 4);
      const maxShift = 12 + basePower * 60;
      const shiftX = (Math.random() - 0.5) * maxShift;

      try {
        ctx.drawImage(
          ctx.canvas,
          0, sliceY, width, sliceH,
          shiftX, sliceY, width, sliceH
        );
      } catch {
        // Fallback for canvas tainted edge cases
      }

      // 2. RGB Chromatic Aberration Split (Cyan & Red tints)
      if (colorSplit && Math.random() < 0.8) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        // Red channel offset
        ctx.fillStyle = `rgba(255, 30, 80, ${Math.min(0.35, 0.12 * basePower)})`;
        ctx.fillRect(shiftX - 5 * basePower, sliceY, width, sliceH);

        // Cyan / Blue channel offset
        ctx.fillStyle = `rgba(0, 235, 255, ${Math.min(0.35, 0.12 * basePower)})`;
        ctx.fillRect(shiftX + 5 * basePower, sliceY, width, sliceH);
        ctx.restore();
      }
    }

    // 3. Style-specific artifact overlays
    if (style === 'vhs-tape') {
      const vhsBars = Math.floor(2 + basePower * 5);
      for (let b = 0; b < vhsBars; b++) {
        const barY = Math.random() * height;
        const barH = Math.random() * 10 + 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.4, 0.08 + Math.random() * 0.22 * basePower)})`;
        ctx.fillRect(0, barY, width, barH);
      }
    } else if (style === 'cyber-digital') {
      const blockCount = Math.floor(3 + basePower * 8);
      for (let k = 0; k < blockCount; k++) {
        const bx = Math.random() * width;
        const by = Math.random() * height;
        const bw = Math.random() * (width * 0.15) + 15;
        const bh = Math.random() * 20 + 4;
        ctx.fillStyle = Math.random() > 0.5 
          ? `rgba(6, 182, 212, ${0.25 * basePower})` 
          : `rgba(244, 63, 94, ${0.25 * basePower})`;
        ctx.fillRect(bx, by, bw, bh);
      }
    } else if (style === 'slice-displacement') {
      // Extra high-contrast tearing lines
      for (let s = 0; s < 4; s++) {
        const lineY = Math.random() * height;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, lineY, width, 1.5);
      }
    }

    ctx.restore();
  }

  /**
   * Particles overlay
   */
  private renderParticles(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    config: ParticleConfig,
    bassIntensity: number,
    trebleIntensity: number,
    beatIntensity: number,
    currentTime: number,
    isPlaying: boolean
  ) {
    if (config.type === 'none') return;

    if (this.particles.length !== config.count) {
      this.initParticles(config.count);
    }

    ctx.save();
    const speedMult = isPlaying ? config.speed : 0.35 * config.speed;
    const beatKick = isPlaying && config.reactiveToBeat ? beatIntensity * 2.5 : 0;
    const centerX = width / 2;
    const centerY = height / 2;

    // Special backdrop glow for Hyperspace
    if (config.type === 'hyperspace') {
      const warpGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, Math.min(width, height) * 0.4);
      warpGlow.addColorStop(0, `rgba(56, 189, 248, ${0.15 + beatKick * 0.2})`);
      warpGlow.addColorStop(0.5, `rgba(139, 92, 246, ${0.08 + beatKick * 0.12})`);
      warpGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = warpGlow;
      ctx.fillRect(0, 0, width, height);
    }

    for (const p of this.particles) {
      if (config.type === 'rain') {
        // Atmospheric Rain with Wind Angle, Wind Speed, Turbulence & Drop Types
        const windAngleDeg = config.rainWindAngle !== undefined ? config.rainWindAngle : 10;
        const windRad = (windAngleDeg * Math.PI) / 180;
        const windSpeedMult = config.rainWindSpeed !== undefined ? config.rainWindSpeed : 1.2;
        const turbulenceAmt = (config.rainTurbulence !== undefined ? config.rainTurbulence : 25) / 100;
        const lengthScale = config.rainLengthScale !== undefined ? config.rainLengthScale : 1.2;

        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.04);
        const flutter = Math.sin(p.wobble) * (0.8 + beatKick * 0.8) * turbulenceAmt;
        const baseFall = Math.cos(windRad) * windSpeedMult * ((p.speed || 8) * 1.8 + 6) + beatKick * 6.5;
        const baseDrift = Math.sin(windRad) * windSpeedMult * ((p.speed || 8) * 1.8 + 6);

        p.x += (baseDrift + flutter + (p.vx || 0) * 0.4) * speedMult;
        p.y += Math.max(3.5, baseFall) * speedMult;

        const margin = 80;
        if (p.y > height + margin) {
          p.y = -margin - Math.random() * 50;
          p.x = Math.random() * (width + margin * 2) - margin;
          p.speed = Math.random() * 6 + 6;
          p.size = Math.random() * 2.8 + 1.2;
          p.length = (Math.random() * 32 + 20) * lengthScale;
          p.baseAlpha = Math.random() * 0.4 + 0.55;
          p.hue = Math.random() * 360;

          if (config.rainDropType === 'mixed' || !config.rainDropType) {
            const rand = Math.random();
            p.rainDropType = rand > 0.55 ? 'streaks' : (rand > 0.3 ? 'drizzle' : (rand > 0.12 ? 'heavy' : 'neon-glow'));
          } else {
            p.rainDropType = config.rainDropType;
          }
        }

        if (baseDrift > 0 && p.x > width + margin) {
          p.x = -margin;
          p.y = Math.random() * height;
        } else if (baseDrift < 0 && p.x < -margin) {
          p.x = width + margin;
          p.y = Math.random() * height;
        }
      } else if (config.type === 'stars') {
        p.alpha = p.baseAlpha + Math.sin(Date.now() * 0.003 + p.x) * 0.25 + beatKick * 0.3;
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
      } else if (config.type === 'sound-sparks') {
        // Dynamic Fire Embers & Rising Sparks with heat turbulence
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.04);
        p.y -= (p.speed * 0.65 + 2.2) * speedMult + beatKick * 5.5;
        p.x += Math.sin(p.wobble) * (1.8 + beatKick * 2.5) + p.vx * speedMult;
        p.alpha = Math.max(0.25, Math.min(1.0, p.baseAlpha + Math.sin(Date.now() * 0.008 + p.x) * 0.35 + beatKick * 0.4));

        if (p.y < -40 || p.x < -60 || p.x > width + 60) {
          p.y = height + Math.random() * 40 + 10;
          p.x = Math.random() * width;
          p.size = Math.random() * 3.5 + 1.5;
          p.speed = Math.random() * 4 + 3;
          p.hue = Math.random() * 45 + 10; // 10 (red) to 55 (bright gold)
          p.baseAlpha = Math.random() * 0.4 + 0.6;
        }
      } else if (config.type === 'spinning-dashes') {
        // Dynamic rotating short streaks / dashes falling with energetic tumble
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.035);
        const spinBoost = 1 + (config.reactiveToBeat ? beatKick * 2.2 : 0);
        p.angle = ((p.angle || 0) + (p.rotSpeed || 0.045) * spinBoost * speedMult);
        p.y += ((p.speed || 5) * 0.85 + 2.6) * speedMult + beatKick * 6.2;
        p.x += Math.sin(p.wobble) * (1.2 + beatKick * 1.5) + p.vx * speedMult;

        if (p.y > height + 60) {
          p.y = -50 - Math.random() * 60;
          p.x = Math.random() * width;
          p.speed = Math.random() * 4 + 4;
          p.length = Math.random() * 24 + 16;
          p.rotSpeed = (Math.random() - 0.5) * 0.09 + (Math.random() > 0.5 ? 0.04 : -0.04);
          p.hue = Math.random() * 360;
          p.baseAlpha = Math.random() * 0.4 + 0.6;
        }
      } else if (config.type === 'spaghetti') {
        // Silky Italian Spaghetti noodles falling down with swaying wave curves
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.035);
        p.y += ((p.speed || 4) * 0.9 + 2.8) * speedMult + beatKick * 6.5;
        p.x += Math.sin(p.wobble) * 1.5;

        if (p.y > height + 280) {
          p.y = -220 - Math.random() * 90;
          p.x = Math.random() * width;
          p.wobble = Math.random() * Math.PI * 2;
          p.hue = Math.random() * 25 + 38; // 38 to 63: warm pasta golden hues
          p.baseAlpha = Math.random() * 0.3 + 0.7;
        }
      } else if (config.type === 'rainbow-bubbles' || config.type === 'bubbles') {
        // Organic floating soap bubbles with horizontal sine wobble
        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.03);
        p.y -= (p.speed * 0.4 + 1.2) * speedMult + beatKick * 1.8;
        p.x += Math.sin(p.wobble) * 1.2 + p.vx * speedMult * 0.5;
        p.hue = (p.hue + 0.6) % 360;

        if (p.y < -60) {
          p.y = height + 40;
          p.x = Math.random() * width;
          p.hue = Math.random() * 360;
        }
      } else if (config.type === 'snow') {
        // Romantic realistic snowfall with wind angle direction, velocity & turbulence
        const windAngleDeg = config.snowWindAngle !== undefined ? config.snowWindAngle : 15;
        const windRad = (windAngleDeg * Math.PI) / 180;
        const windSpeedMult = config.snowWindSpeed !== undefined ? config.snowWindSpeed : 1.0;
        const turbulenceAmt = (config.snowTurbulence !== undefined ? config.snowTurbulence : 40) / 100;

        p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.025);
        p.angle = ((p.angle || 0) + (p.rotSpeed || 0.012) * speedMult);

        const baseDrift = Math.sin(windRad) * windSpeedMult * ((p.speed || 3.2) * 1.4 + 1.2);
        const flutter = Math.sin(p.wobble) * (1.6 + beatKick * 1.4) * turbulenceAmt;
        const baseFall = Math.cos(windRad) * windSpeedMult * ((p.speed || 3.2) * 0.45 + 1.2) + beatKick * 2.5;

        p.x += (baseDrift + flutter + (p.vx || 0) * 0.4) * speedMult;
        p.y += Math.max(0.6, baseFall) * speedMult;

        const margin = 50;
        if (p.y > height + margin) {
          p.y = -margin - Math.random() * 40;
          p.x = Math.random() * (width + margin * 2) - margin;
          p.speed = Math.random() * 3.5 + 2;
          p.size = Math.random() * 4 + 2;
          p.rotSpeed = (Math.random() - 0.5) * 0.035;
          p.baseAlpha = Math.random() * 0.4 + 0.55;
          
          if (config.snowFlakeType === 'mixed' || !config.snowFlakeType) {
            const rand = Math.random();
            p.flakeType = rand > 0.55 ? 'crystal' : (rand > 0.25 ? 'flurry' : 'glitter');
          } else {
            p.flakeType = config.snowFlakeType;
          }
        }

        // Wrap around for horizontal wind drift
        if (baseDrift > 0 && p.x > width + margin) {
          p.x = -margin;
          p.y = Math.random() * height;
        } else if (baseDrift < 0 && p.x < -margin) {
          p.x = width + margin;
          p.y = Math.random() * height;
        }
      } else if (config.type === 'hyperspace') {
        // 3D Hyperspace Warp Drive Acceleration
        if (p.z === undefined) {
          p.z = Math.random() * 1000 + 10;
          p.pz = p.z;
        }
        p.pz = p.z;
        // Sonic acceleration with huge warp jump on beat drop
        const warpStep = (16 * speedMult + 4) * (1 + (config.reactiveToBeat ? beatKick * 3.2 : 0));
        p.z -= warpStep;

        if (p.z <= 2) {
          p.z = 1000;
          p.pz = 1000;
          p.x = (Math.random() - 0.5) * width * 1.8;
          p.y = (Math.random() - 0.5) * height * 1.8;
          p.hue = Math.random() * 360;
        }
      } else {
        p.x += p.vx * speedMult + (config.reactiveToBeat ? (Math.random() - 0.5) * beatKick : 0);
        p.y += p.vy * speedMult - beatKick * 0.5;
      }

      if (
        config.type !== 'hyperspace' &&
        config.type !== 'rainbow-bubbles' &&
        config.type !== 'bubbles' &&
        config.type !== 'sound-sparks' &&
        config.type !== 'spaghetti' &&
        config.type !== 'spinning-dashes' &&
        config.type !== 'snow' &&
        config.type !== 'rain'
      ) {
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // --- RENDERING PARTICLE STYLES ---

      if (config.type === 'rain') {
        // --- REALISTIC & HIGH-TECH RAINFALL SUITE ---
        const sizeScale = config.sizeScale !== undefined ? config.sizeScale : 1.0;
        const lengthScale = config.rainLengthScale !== undefined ? config.rainLengthScale : 1.2;
        const windAngleDeg = config.rainWindAngle !== undefined ? config.rainWindAngle : 10;
        const windRad = (windAngleDeg * Math.PI) / 180;
        const colorMode = config.colorMode || 'custom';

        let rainColor = config.color || '#bae6fd';
        let glowColor = config.secondaryColor || '#38bdf8';
        const isBassFlash = config.bassReactiveColor && beatKick > 0.15;
        const flashBoost = config.bassFlashBoost || 1.5;

        if (colorMode === 'rainbow') {
          const shiftHue = (p.hue + (config.bassReactiveColor ? bassIntensity * 240 : 0)) % 360;
          rainColor = `hsl(${shiftHue}, 100%, 85%)`;
          glowColor = `hsl(${shiftHue}, 90%, 65%)`;
        } else if (colorMode === 'fire') {
          const fireHue = Math.max(10, Math.min(50, 20 + (p.hue % 30)));
          rainColor = `hsl(${fireHue}, 100%, 80%)`;
          glowColor = '#f97316';
        } else if (colorMode === 'neon-pulse') {
          rainColor = isBassFlash ? '#a5f3fc' : '#38bdf8';
          glowColor = isBassFlash ? '#ec4899' : '#0284c7';
        } else if (colorMode === 'audio-reactive') {
          const reactiveHue = Math.floor((bassIntensity * 160 + trebleIntensity * 120 + 195) % 360);
          rainColor = `hsl(${reactiveHue}, 95%, 88%)`;
          glowColor = `hsl(${reactiveHue}, 90%, 60%)`;
        } else {
          if (isBassFlash && config.secondaryColor) {
            rainColor = config.secondaryColor;
            glowColor = config.secondaryColor;
          }
        }

        const baseAlpha = p.alpha || p.baseAlpha || 0.65;
        const dynamicAlpha = Math.min(
          1.0,
          Math.max(
            0.2,
            baseAlpha + (config.bassReactiveColor ? beatKick * flashBoost * 0.4 : (config.reactiveToBeat ? beatKick * 0.25 : 0))
          )
        );

        const currentDropType = p.rainDropType || (config.rainDropType === 'mixed' || !config.rainDropType ? 'streaks' : config.rainDropType);

        ctx.save();
        ctx.globalAlpha = dynamicAlpha;

        const baseGlow = config.glowIntensity !== undefined ? config.glowIntensity : 8;
        const glowBlur = (currentDropType === 'neon-glow' ? baseGlow + 8 : baseGlow) + (isBassFlash ? beatKick * flashBoost * 12 : beatKick * 5);
        if (glowBlur > 0) {
          ctx.shadowBlur = glowBlur;
          ctx.shadowColor = glowColor;
        }

        // Draw according to raindrop type
        if (currentDropType === 'drizzle') {
          // Delicate fine mist / micro droplet bead with short tail
          const dropR = Math.max(1.2, p.size * 0.8 * sizeScale);
          const dropL = Math.max(8, (p.length || 18) * 0.45 * lengthScale);
          const dx = Math.sin(windRad) * dropL;
          const dy = Math.cos(windRad) * dropL;

          const grad = ctx.createLinearGradient(p.x - dx, p.y - dy, p.x, p.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.6, rainColor);
          grad.addColorStop(1, '#ffffff');

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(1, dropR * 0.9);
          ctx.lineCap = 'round';
          ctx.moveTo(p.x - dx, p.y - dy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Tiny sparkling water droplet tip
          ctx.beginPath();
          ctx.arc(p.x, p.y, dropR, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (currentDropType === 'heavy') {
          // Torrential dense rain downpour stream with thick water ribbons
          const dropL = Math.max(28, (p.length || 42) * 1.5 * lengthScale * (1 + (config.reactiveToBeat ? beatKick * 0.35 : 0)));
          const dropW = Math.max(2.2, p.size * 1.4 * sizeScale);
          const dx = Math.sin(windRad) * dropL;
          const dy = Math.cos(windRad) * dropL;

          const grad = ctx.createLinearGradient(p.x - dx, p.y - dy, p.x, p.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
          grad.addColorStop(0.3, glowColor);
          grad.addColorStop(0.8, rainColor);
          grad.addColorStop(1, '#ffffff');

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = dropW;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x - dx, p.y - dy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Center bright core streak
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = Math.max(1, dropW * 0.4);
          ctx.moveTo(p.x - dx * 0.5, p.y - dy * 0.5);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else if (currentDropType === 'neon-glow') {
          // Cyberpunk neon laser rain beam
          const dropL = Math.max(22, (p.length || 32) * 1.25 * lengthScale * (1 + (config.reactiveToBeat ? beatKick * 0.4 : 0)));
          const dropW = Math.max(2.0, (p.size * 0.9 + 1.2) * sizeScale);
          const dx = Math.sin(windRad) * dropL;
          const dy = Math.cos(windRad) * dropL;

          ctx.beginPath();
          ctx.strokeStyle = rainColor;
          ctx.lineWidth = dropW;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x - dx, p.y - dy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Intense neon core
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, dropW * 0.4);
          ctx.moveTo(p.x - dx * 0.6, p.y - dy * 0.6);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          // 'streaks' & Standard: Cinematic angled glass streaks with glowing water droplet
          const dropL = Math.max(18, (p.length || 28) * lengthScale * (1 + (config.reactiveToBeat ? beatKick * 0.3 : 0)));
          const dropW = Math.max(1.4, (p.size * 0.8 + 0.8) * sizeScale);
          const dx = Math.sin(windRad) * dropL;
          const dy = Math.cos(windRad) * dropL;

          const grad = ctx.createLinearGradient(p.x - dx, p.y - dy, p.x, p.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.4, rainColor);
          grad.addColorStop(1, '#ffffff');

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = dropW;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x - dx, p.y - dy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Droplet head bead
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, dropW * 0.9), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        // Bottom splash ripples & micro water droplets
        if (config.rainSplash !== false && p.y >= height - 25 && p.y <= height + 10) {
          const splashProgress = Math.min(1.0, Math.max(0, (p.y - (height - 25)) / 30));
          const splashW = (10 + p.size * 5) * (0.3 + splashProgress * 0.7);
          const splashH = Math.max(2, splashW * 0.28);
          const splashAlpha = (1 - splashProgress) * 0.65;

          ctx.save();
          ctx.globalAlpha = splashAlpha;
          ctx.strokeStyle = rainColor;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(p.x, height - 4, splashW, splashH, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Tiny water spark droplets popping up
          const popH = (1 - splashProgress) * 10 * (1 + beatKick * 0.5);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x - splashW * 0.45, height - 4 - popH * 0.8, 1.2, 0, Math.PI * 2);
          ctx.arc(p.x + splashW * 0.45, height - 4 - popH, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      } else if (config.type === 'rainbow-bubbles' || config.type === 'bubbles') {
        // --- 1. RAINBOW SOAP BUBBLES ---
        const bubbleRadius = Math.max(10, (p.size * 7 + 12) * (1 + (config.reactiveToBeat ? beatKick * 0.22 : 0)));
        const currentHue = p.hue;

        ctx.save();
        ctx.translate(p.x, p.y);

        // A. Translucent Iridescent Inner Sphere
        const innerGrad = ctx.createRadialGradient(-bubbleRadius * 0.25, -bubbleRadius * 0.25, bubbleRadius * 0.1, 0, 0, bubbleRadius);
        innerGrad.addColorStop(0, `hsla(${currentHue}, 85%, 92%, 0.12)`);
        innerGrad.addColorStop(0.5, `hsla(${(currentHue + 60) % 360}, 80%, 75%, 0.08)`);
        innerGrad.addColorStop(0.85, `hsla(${(currentHue + 160) % 360}, 85%, 70%, 0.22)`);
        innerGrad.addColorStop(1, `hsla(${(currentHue + 240) % 360}, 90%, 80%, 0.45)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, bubbleRadius, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // B. Thin-Film Multi-Color Rainbow Rim
        const rimGrad = ctx.createLinearGradient(-bubbleRadius, -bubbleRadius, bubbleRadius, bubbleRadius);
        rimGrad.addColorStop(0, `hsla(${currentHue}, 95%, 72%, 0.85)`);
        rimGrad.addColorStop(0.25, `hsla(${(currentHue + 75) % 360}, 95%, 70%, 0.85)`);
        rimGrad.addColorStop(0.5, `hsla(${(currentHue + 150) % 360}, 95%, 68%, 0.85)`);
        rimGrad.addColorStop(0.75, `hsla(${(currentHue + 225) % 360}, 95%, 72%, 0.85)`);
        rimGrad.addColorStop(1, `hsla(${(currentHue + 300) % 360}, 95%, 75%, 0.85)`);

        ctx.beginPath();
        ctx.arc(0, 0, bubbleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rimGrad;
        ctx.lineWidth = Math.max(1.5, bubbleRadius * 0.075);
        ctx.shadowColor = `hsla(${currentHue}, 90%, 70%, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // C. Upper-Left Glossy Specular Curved Highlight Glint
        ctx.beginPath();
        ctx.arc(-bubbleRadius * 0.12, -bubbleRadius * 0.12, bubbleRadius * 0.72, Math.PI * 1.1, Math.PI * 1.55);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = Math.max(1.8, bubbleRadius * 0.09);
        ctx.lineCap = 'round';
        ctx.stroke();

        // D. Secondary Small Sparkle Dot
        ctx.beginPath();
        ctx.arc(-bubbleRadius * 0.45, -bubbleRadius * 0.45, Math.max(1.2, bubbleRadius * 0.08), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // E. Lower-Right Soft Rainbow Refraction Arc
        ctx.beginPath();
        ctx.arc(bubbleRadius * 0.1, bubbleRadius * 0.1, bubbleRadius * 0.78, Math.PI * 0.18, Math.PI * 0.48);
        ctx.strokeStyle = `hsla(${(currentHue + 140) % 360}, 90%, 82%, 0.55)`;
        ctx.lineWidth = Math.max(1.2, bubbleRadius * 0.06);
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
      } else if (config.type === 'hyperspace') {
        // --- 2. HYPERSPACE SPEED LINES & STAR WARP ---
        const focalLength = 480;
        const z = p.z || 500;
        const pz = p.pz || z;

        const screenX = centerX + (p.x / z) * focalLength;
        const screenY = centerY + (p.y / z) * focalLength;
        const prevScreenX = centerX + (p.x / pz) * focalLength;
        const prevScreenY = centerY + (p.y / pz) * focalLength;

        // Reset if offscreen
        if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) {
          p.z = 1000;
          p.pz = 1000;
          p.x = (Math.random() - 0.5) * width * 1.8;
          p.y = (Math.random() - 0.5) * height * 1.8;
          continue;
        }

        const depthRatio = Math.max(0, Math.min(1, 1 - z / 1000));
        const trailWidth = Math.max(0.75, depthRatio * 3.8);
        const trailAlpha = Math.min(1, Math.max(0.15, depthRatio * 1.1 + beatKick * 0.25));

        // Color selection for futuristic warp streaks (Cyan / Neon Purple / Pure White)
        const streakColor = p.hue > 240 
          ? `rgba(56, 189, 248, ${trailAlpha})` 
          : (p.hue > 120 ? `rgba(192, 132, 252, ${trailAlpha})` : `rgba(255, 255, 255, ${trailAlpha})`);

        // Luminous Speed Trail
        ctx.beginPath();
        ctx.moveTo(prevScreenX, prevScreenY);
        ctx.lineTo(screenX, screenY);
        ctx.strokeStyle = streakColor;
        ctx.lineWidth = trailWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = streakColor;
        ctx.shadowBlur = Math.min(15, depthRatio * 12 + beatKick * 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Glowing Star Point Head
        ctx.beginPath();
        const headRadius = Math.max(0.8, depthRatio * 2.6);
        ctx.arc(screenX, screenY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else if (config.type === 'sound-sparks') {
        // --- 3. FIERY EMBERS & SPARKS (Tia lửa bốc cháy phát sáng) ---
        ctx.save();
        ctx.translate(p.x, p.y);

        const sparkSize = Math.max(2, p.size * (1 + (config.reactiveToBeat ? beatKick * 0.45 : 0)));
        const sparkHue = p.hue; // 10 (crimson red) to 55 (bright gold)
        const sparkAlpha = Math.min(1, Math.max(0.3, p.alpha + (config.reactiveToBeat ? beatKick * 0.35 : 0)));

        // A. Radiant Fire Heat Halo
        const glowRadius = Math.max(10, sparkSize * 4.5 + (config.reactiveToBeat ? beatKick * 8 : 0));
        const flareGrad = ctx.createRadialGradient(0, 0, sparkSize * 0.3, 0, 0, glowRadius);
        flareGrad.addColorStop(0, `hsla(${sparkHue}, 100%, 65%, ${sparkAlpha * 0.85})`);
        flareGrad.addColorStop(0.35, `hsla(${Math.max(0, sparkHue - 15)}, 100%, 50%, ${sparkAlpha * 0.5})`);
        flareGrad.addColorStop(0.75, `hsla(0, 95%, 45%, ${sparkAlpha * 0.15})`);
        flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = flareGrad;
        ctx.fill();

        // B. Upward Motion Spark Tail Streak
        const tailLength = Math.max(10, ((p.speed || 4) * 3.0 + 8) * (1 + (config.reactiveToBeat ? beatKick * 0.8 : 0)));
        const trailGrad = ctx.createLinearGradient(0, tailLength, 0, 0);
        trailGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
        trailGrad.addColorStop(0.4, `hsla(${sparkHue}, 100%, 50%, ${sparkAlpha * 0.6})`);
        trailGrad.addColorStop(1, '#ffffff');

        ctx.beginPath();
        ctx.moveTo(-sparkSize * 0.45, 0);
        ctx.lineTo(0, tailLength);
        ctx.lineTo(sparkSize * 0.45, 0);
        ctx.closePath();
        ctx.fillStyle = trailGrad;
        ctx.fill();

        // C. Blazing White-Hot Core
        ctx.beginPath();
        ctx.arc(0, 0, sparkSize * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#fffbeb';
        ctx.shadowColor = `hsla(${sparkHue}, 100%, 60%, 1)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // D. Crackling Hot Spark Cross Starlet on Beat Drop
        if (config.reactiveToBeat && beatKick > 0.35) {
          const starR = sparkSize * 1.8;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-starR, 0);
          ctx.lineTo(starR, 0);
          ctx.moveTo(0, -starR);
          ctx.lineTo(0, starR);
          ctx.stroke();
        }

        ctx.restore();
      } else if (config.type === 'spaghetti') {
        // --- 3.5 SILKY SPAGHETTI NOODLES FALLING DOWN ---
        const noodleLength = (p.size * 34 + 110) * (1 + (config.reactiveToBeat ? beatKick * 0.25 : 0));
        const thickness = Math.max(2.2, (p.size * 1.1 + 2.2) * (config.sizeScale || 1.0));
        const phase = p.wobble || 0;
        const colorMode = config.colorMode || 'custom';

        let noodleColor = '#facc15';
        let glowColor = '#eab308';
        if (colorMode === 'rainbow') {
          noodleColor = `hsl(${p.hue}, 95%, 68%)`;
          glowColor = `hsl(${p.hue}, 90%, 55%)`;
        } else if (colorMode === 'fire') {
          noodleColor = `hsl(${Math.min(50, 18 + (p.hue % 30))}, 100%, 65%)`;
          glowColor = '#ef4444';
        } else if (colorMode === 'neon-pulse') {
          noodleColor = '#38bdf8';
          glowColor = '#0284c7';
        } else {
          noodleColor = config.color || '#fef08a';
          glowColor = config.secondaryColor || '#eab308';
        }

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // A. Soft glowing aura around pasta noodle
        const glowAmount = (config.glowIntensity !== undefined ? config.glowIntensity : 12) + beatKick * 10;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowAmount;

        // Draw silky wavy strand path
        ctx.beginPath();
        const startY = p.y - noodleLength;
        const endY = p.y;
        ctx.moveTo(p.x + Math.sin(phase) * 16, startY);

        const segments = 6;
        const segHeight = noodleLength / segments;
        for (let s = 1; s <= segments; s++) {
          const currentY = startY + s * segHeight;
          const waveOffset = Math.sin(phase + s * 0.9) * (14 + beatKick * 8);
          const prevY = startY + (s - 1) * segHeight;
          const prevOffset = Math.sin(phase + (s - 1) * 0.9) * (14 + beatKick * 8);
          const cpY = (prevY + currentY) / 2;
          const cpX = p.x + (prevOffset + waveOffset) / 2 + Math.cos(phase + s) * 6;
          ctx.quadraticCurveTo(cpX, cpY, p.x + waveOffset, currentY);
        }

        // Outer pasta core
        ctx.strokeStyle = noodleColor;
        ctx.lineWidth = thickness;
        ctx.stroke();

        // B. Inner glossy specular shine stroke along the noodle
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = Math.max(1, thickness * 0.35);
        ctx.stroke();

        ctx.restore();
      } else if (config.type === 'spinning-dashes') {
        // --- 3.6 ROTATING DASHES / SHORT STREAKS FALLING & SPINNING 360° ---
        const sizeScale = config.sizeScale !== undefined ? config.sizeScale : 1.0;
        const dashLen = Math.max(12, ((p.length || 24) * sizeScale + 4) * (1 + (config.reactiveToBeat ? beatKick * 0.35 : 0)));
        const thickness = Math.max(2.0, (p.size * 0.85 + 1.8) * sizeScale);
        const colorMode = config.colorMode || 'custom';

        let dashColor = config.color || '#38bdf8';
        let glowColor = config.secondaryColor || '#0284c7';
        const isBassFlash = config.bassReactiveColor && beatKick > 0.15;
        const flashBoost = config.bassFlashBoost || 1.5;

        if (colorMode === 'rainbow') {
          const shiftHue = (p.hue + (config.bassReactiveColor ? bassIntensity * 240 : 0)) % 360;
          const lightness = isBassFlash ? Math.min(95, 70 + beatKick * 20) : 68;
          dashColor = `hsl(${shiftHue}, 100%, ${lightness}%)`;
          glowColor = `hsl(${shiftHue}, 90%, 55%)`;
        } else if (colorMode === 'fire') {
          const fireHue = Math.max(8, Math.min(55, 15 + (p.hue % 35) + (isBassFlash ? 15 : 0)));
          const lightness = isBassFlash ? Math.min(98, 65 + beatKick * 30) : 58;
          dashColor = `hsl(${fireHue}, 100%, ${lightness}%)`;
          glowColor = '#ef4444';
        } else if (colorMode === 'neon-pulse') {
          const isMagenta = (Math.sin(Date.now() * 0.003 + p.x * 0.01) + (isBassFlash ? 0.8 : 0)) > 0;
          dashColor = isMagenta ? (isBassFlash ? '#f472b6' : '#ec4899') : (isBassFlash ? '#67e8f9' : '#06b6d4');
          glowColor = isMagenta ? '#db2777' : '#0891b2';
        } else if (colorMode === 'audio-reactive') {
          const reactiveHue = Math.floor((bassIntensity * 180 + trebleIntensity * 140 + p.hue) % 360);
          const lightness = isBassFlash ? Math.min(95, 65 + beatKick * 25) : 62;
          dashColor = `hsl(${reactiveHue}, 95%, ${lightness}%)`;
          glowColor = `hsl(${reactiveHue}, 90%, 50%)`;
        } else {
          if (isBassFlash && config.secondaryColor) {
            dashColor = config.secondaryColor;
            glowColor = config.secondaryColor;
          } else {
            dashColor = config.color || '#38bdf8';
            glowColor = config.secondaryColor || '#0284c7';
          }
        }

        const baseAlpha = p.alpha || p.baseAlpha || 0.7;
        const dynamicAlpha = Math.min(
          1.0,
          Math.max(
            0.2,
            baseAlpha + (config.bassReactiveColor ? beatKick * flashBoost * 0.45 : (config.reactiveToBeat ? beatKick * 0.3 : 0))
          )
        );

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        ctx.globalAlpha = dynamicAlpha;

        const baseGlow = config.glowIntensity !== undefined ? config.glowIntensity : 14;
        const glowBlur = baseGlow + (isBassFlash ? beatKick * flashBoost * 18 : beatKick * 10);
        if (glowBlur > 0) {
          ctx.shadowBlur = glowBlur;
          ctx.shadowColor = glowColor;
        }

        // Draw outer neon stroke dash with rounded caps
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.moveTo(-dashLen / 2, 0);
        ctx.lineTo(dashLen / 2, 0);
        ctx.strokeStyle = dashColor;
        ctx.lineWidth = thickness;
        ctx.stroke();

        // Draw inner bright intense core highlight
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-dashLen * 0.32, 0);
        ctx.lineTo(dashLen * 0.32, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = Math.max(1, thickness * 0.4);
        ctx.stroke();

        ctx.restore();
      } else if (config.type === 'snow') {
        // --- 3.7 REALISTIC CRYSTALLINE, FLURRY & GLITTER WINTER SNOWFALL ---
        const sizeScale = config.sizeScale !== undefined ? config.sizeScale : 1.0;
        const flakeR = Math.max(3.5, (p.size * 2.2 + 2.5) * sizeScale * (1 + (config.reactiveToBeat ? beatKick * 0.25 : 0)));
        const colorMode = config.colorMode || 'custom';

        let flakeColor = config.color || '#ffffff';
        let glowColor = config.secondaryColor || '#38bdf8';
        const isBassFlash = config.bassReactiveColor && beatKick > 0.15;
        const flashBoost = config.bassFlashBoost || 1.5;

        if (colorMode === 'rainbow') {
          const shiftHue = (p.hue + (config.bassReactiveColor ? bassIntensity * 240 : 0)) % 360;
          flakeColor = `hsl(${shiftHue}, 100%, 92%)`;
          glowColor = `hsl(${shiftHue}, 90%, 65%)`;
        } else if (colorMode === 'fire') {
          const fireHue = Math.max(15, Math.min(50, 25 + (p.hue % 25)));
          flakeColor = `hsl(${fireHue}, 100%, 85%)`;
          glowColor = '#f97316';
        } else if (colorMode === 'neon-pulse') {
          flakeColor = isBassFlash ? '#e0f2fe' : '#ffffff';
          glowColor = (p.hue % 2 === 0) ? '#38bdf8' : '#ec4899';
        } else if (colorMode === 'audio-reactive') {
          const reactiveHue = Math.floor((bassIntensity * 160 + trebleIntensity * 120 + 190) % 360);
          flakeColor = `hsl(${reactiveHue}, 90%, 92%)`;
          glowColor = `hsl(${reactiveHue}, 90%, 60%)`;
        } else {
          if (isBassFlash && config.secondaryColor) {
            glowColor = config.secondaryColor;
          } else {
            glowColor = config.secondaryColor || '#38bdf8';
          }
        }

        const baseAlpha = p.alpha || p.baseAlpha || 0.7;
        const dynamicAlpha = Math.min(
          1.0,
          Math.max(
            0.25,
            baseAlpha + (config.bassReactiveColor ? beatKick * flashBoost * 0.4 : (config.reactiveToBeat ? beatKick * 0.25 : 0))
          )
        );

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle || 0);
        ctx.globalAlpha = dynamicAlpha;

        const baseGlow = config.glowIntensity !== undefined ? config.glowIntensity : 10;
        const glowBlur = baseGlow + (isBassFlash ? beatKick * flashBoost * 14 : beatKick * 6);
        if (glowBlur > 0) {
          ctx.shadowBlur = glowBlur;
          ctx.shadowColor = glowColor;
        }

        const currentFlakeType = p.flakeType || (config.snowFlakeType === 'mixed' || !config.snowFlakeType ? 'crystal' : config.snowFlakeType);

        if (currentFlakeType === 'crystal' && flakeR >= 4.5) {
          // Six-armed branching snowflake crystal
          ctx.strokeStyle = flakeColor;
          ctx.lineWidth = Math.max(1.2, 1.6 * sizeScale);
          ctx.lineCap = 'round';

          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3;
            const armX = Math.cos(angle) * flakeR;
            const armY = Math.sin(angle) * flakeR;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(armX, armY);
            ctx.stroke();

            // Branchlets
            const midX = Math.cos(angle) * (flakeR * 0.55);
            const midY = Math.sin(angle) * (flakeR * 0.55);
            const branchLen = flakeR * 0.35;
            const bAngle1 = angle + Math.PI / 4;
            const bAngle2 = angle - Math.PI / 4;

            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + Math.cos(bAngle1) * branchLen, midY + Math.sin(bAngle1) * branchLen);
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + Math.cos(bAngle2) * branchLen, midY + Math.sin(bAngle2) * branchLen);
            ctx.stroke();
          }

          // Center bright snowflake crystal nucleus
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(1.2, flakeR * 0.2), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (currentFlakeType === 'glitter') {
          // 4-Point Shimmering Ice Diamond Cross
          const glint = Math.abs(Math.sin((p.angle || 0) * 3)) * 0.4 + 0.8;
          ctx.fillStyle = flakeColor;
          ctx.beginPath();
          ctx.moveTo(0, -flakeR * 1.4 * glint);
          ctx.lineTo(flakeR * 0.35, 0);
          ctx.lineTo(0, flakeR * 1.4 * glint);
          ctx.lineTo(-flakeR * 0.35, 0);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-flakeR * 1.4 * glint, 0);
          ctx.lineTo(0, flakeR * 0.35);
          ctx.lineTo(flakeR * 1.4 * glint, 0);
          ctx.lineTo(0, -flakeR * 0.35);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, flakeR * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft glowing snowfall flurry bokeh disc
          const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, flakeR);
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.35, flakeColor);
          radGrad.addColorStop(0.8, glowColor);
          radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(0, 0, flakeR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      } else {
        // --- 4. CUSTOM SHAPED PARTICLES (Circle, Square, Star, Heart, Diamond, Ring) ---
        ctx.save();
        ctx.translate(p.x, p.y);

        const sizeScale = config.sizeScale !== undefined ? config.sizeScale : 1.0;
        const radius = Math.max(1.5, p.size * sizeScale * (1 + (config.reactiveToBeat ? beatKick * 0.45 : 0)));
        const shape: ParticleShape = config.shape || (config.type === 'stars' ? 'star' : 'circle');
        const colorMode = config.colorMode || 'custom';

        // Compute particle dynamic color based on colorMode and bass intensity
        let particleColor = config.color || '#ffffff';
        const isBassFlash = config.bassReactiveColor && beatKick > 0.15;
        const flashBoost = config.bassFlashBoost || 1.5;

        if (colorMode === 'rainbow') {
          const shiftHue = (p.hue + (config.bassReactiveColor ? bassIntensity * 240 : 0)) % 360;
          const lightness = isBassFlash ? Math.min(95, 70 + beatKick * 20) : 70;
          particleColor = `hsl(${shiftHue}, 100%, ${lightness}%)`;
        } else if (colorMode === 'fire') {
          const fireHue = Math.max(8, Math.min(55, 15 + (p.hue % 35) + (isBassFlash ? 15 : 0)));
          const lightness = isBassFlash ? Math.min(98, 65 + beatKick * 30) : 55;
          particleColor = `hsl(${fireHue}, 100%, ${lightness}%)`;
        } else if (colorMode === 'neon-pulse') {
          const isMagenta = (Math.sin(Date.now() * 0.003 + p.x * 0.01) + (isBassFlash ? 0.8 : 0)) > 0;
          particleColor = isMagenta ? (isBassFlash ? '#f472b6' : '#ec4899') : (isBassFlash ? '#67e8f9' : '#06b6d4');
        } else if (colorMode === 'audio-reactive') {
          const reactiveHue = Math.floor((bassIntensity * 180 + trebleIntensity * 140 + p.hue) % 360);
          const lightness = isBassFlash ? Math.min(95, 65 + beatKick * 25) : 60;
          particleColor = `hsl(${reactiveHue}, 95%, ${lightness}%)`;
        } else {
          // Custom color
          if (isBassFlash && config.secondaryColor) {
            particleColor = config.secondaryColor;
          } else {
            particleColor = config.color || '#ffffff';
          }
        }

        // Particle alpha calculation
        const baseAlpha = p.alpha || p.baseAlpha || 0.6;
        const dynamicAlpha = Math.min(
          1.0,
          Math.max(
            0.15,
            baseAlpha + (config.bassReactiveColor ? beatKick * flashBoost * 0.45 : (config.reactiveToBeat ? beatKick * 0.3 : 0))
          )
        );

        ctx.globalAlpha = dynamicAlpha;

        // Glow effect
        const baseGlow = config.glowIntensity !== undefined ? config.glowIntensity : 10;
        const glowBlur = baseGlow + (isBassFlash ? beatKick * flashBoost * 20 : 0);
        if (glowBlur > 0) {
          ctx.shadowBlur = glowBlur;
          ctx.shadowColor = particleColor;
        }

        // Draw the exact geometric shape
        this.drawParticleShape(ctx, radius, shape, particleColor);

        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    ctx.restore();
  }

  /**
   * Helper to draw geometric particle shapes (Circle, Square, Star, Heart, Diamond, Ring)
   */
  private drawParticleShape(ctx: CanvasContext2D, radius: number, shape: ParticleShape, color: string) {
    ctx.beginPath();
    switch (shape) {
      case 'square':
        ctx.rect(-radius, -radius, radius * 2, radius * 2);
        ctx.fillStyle = color;
        ctx.fill();
        break;

      case 'star': {
        const spikes = 5;
        const outerRadius = radius * 1.35;
        const innerRadius = radius * 0.55;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
          let x = Math.cos(rot) * outerRadius;
          let y = Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;
          x = Math.cos(rot) * innerRadius;
          y = Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        break;
      }

      case 'heart': {
        const r = radius * 1.1;
        ctx.moveTo(0, r * 0.65);
        ctx.bezierCurveTo(-r * 1.25, -r * 0.25, -r * 1.25, -r * 1.1, 0, -r * 0.35);
        ctx.bezierCurveTo(r * 1.25, -r * 1.1, r * 1.25, -r * 0.25, 0, r * 0.65);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        break;
      }

      case 'diamond': {
        const r = radius * 1.25;
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.85, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.85, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        break;
      }

      case 'ring': {
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1.5, radius * 0.35);
        ctx.stroke();
        break;
      }

      case 'circle':
      default:
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        break;
    }
  }

  /**
   * Track Card / Spinning Vinyl / Album badge / Minimal tag
   */
  private renderTrackCard(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    track: TrackMetadata,
    bassIntensity: number,
    beatIntensity: number,
    isPlaying: boolean
  ) {
    ctx.save();
    const posXPercent = track.positionX !== undefined ? track.positionX : 50;
    const posYPercent = track.positionY !== undefined ? track.positionY : 28;
    const userScale = track.scale !== undefined ? track.scale : 1.0;

    const centerX = (width * posXPercent) / 100;
    const centerY = (height * posYPercent) / 100;

    if (isPlaying && track.rotateVinyl) {
      this.vinylRotation += 0.02 + bassIntensity * 0.015;
    }

    // Beat Reaction / Beat Jump calculations for Badge & Card
    const isBeatActive = isPlaying && track.badgeBeatJump !== false;
    const jumpIntensity = track.badgeBeatJumpIntensity !== undefined ? track.badgeBeatJumpIntensity : 0.18;
    const jumpStyle = track.badgeBeatJumpStyle || 'pulse';

    let scaleBoostX = 1.0;
    let scaleBoostY = 1.0;
    let offsetY = 0;
    let tiltAngle = 0;

    if (isBeatActive) {
      const combinedKick = Math.max(beatIntensity, bassIntensity * 0.9);
      
      switch (jumpStyle) {
        case 'bounce-up':
          // Bounces upward on each beat with rhythmic squash
          offsetY = -combinedKick * 36 * (jumpIntensity / 0.18);
          scaleBoostX = 1 + combinedKick * jumpIntensity * 0.6;
          scaleBoostY = 1 + combinedKick * jumpIntensity * 1.2;
          break;
        case 'scale-rotate':
          // Scales up and tilts gracefully with alternating rhythm
          scaleBoostX = 1 + combinedKick * jumpIntensity * 1.5;
          scaleBoostY = 1 + combinedKick * jumpIntensity * 1.5;
          tiltAngle = Math.sin(Date.now() * 0.007) * combinedKick * 0.15 * (jumpIntensity / 0.18);
          break;
        case 'jelly':
          // Elastic jelly squash and stretch
          scaleBoostX = 1 + combinedKick * jumpIntensity * 1.6;
          scaleBoostY = Math.max(0.65, 1 - combinedKick * jumpIntensity * 0.85);
          break;
        case 'shake':
          // High-energy bass vibration
          scaleBoostX = 1 + combinedKick * jumpIntensity * 1.2;
          scaleBoostY = 1 + combinedKick * jumpIntensity * 1.2;
          offsetY = (Math.random() - 0.5) * combinedKick * 18 * (jumpIntensity / 0.18);
          tiltAngle = (Math.random() - 0.5) * combinedKick * 0.1 * (jumpIntensity / 0.18);
          break;
        case 'pulse':
        default:
          // Smooth pulse zoom in and out with beat
          scaleBoostX = 1 + combinedKick * jumpIntensity * 1.7;
          scaleBoostY = 1 + combinedKick * jumpIntensity * 1.7;
          break;
      }
    }

    const cardScale = userScale;

    if (track.cardStyle === 'vinyl') {
      const vinylRadius = Math.min(width, height) * 0.18 * cardScale;

      ctx.save();
      ctx.translate(centerX, centerY + offsetY);
      if (tiltAngle !== 0) ctx.rotate(tiltAngle);
      ctx.scale(scaleBoostX, scaleBoostY);

      // Glow behind vinyl
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, vinylRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.shadowColor = track.accentColor || '#ec4899';
      ctx.shadowBlur = track.badgeBeatGlow ? 28 + beatIntensity * 32 : 24 + beatIntensity * 20;
      ctx.fill();
      ctx.restore();

      // Vinyl outer body
      ctx.save();
      ctx.rotate(this.vinylRotation);

      const vinylGrad = ctx.createRadialGradient(0, 0, vinylRadius * 0.4, 0, 0, vinylRadius);
      vinylGrad.addColorStop(0, '#1c1c1e');
      vinylGrad.addColorStop(0.3, '#111113');
      vinylGrad.addColorStop(0.6, '#232326');
      vinylGrad.addColorStop(0.85, '#0d0d0f');
      vinylGrad.addColorStop(1, '#050505');

      ctx.beginPath();
      ctx.arc(0, 0, vinylRadius, 0, Math.PI * 2);
      ctx.fillStyle = vinylGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.stroke();

      // Grooves lines
      for (let r = vinylRadius * 0.45; r < vinylRadius * 0.95; r += 7) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Vinyl Sheen reflection
      const sheenGrad = ctx.createConicGradient(0, 0, 0);
      sheenGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
      sheenGrad.addColorStop(0.25, 'rgba(255,255,255,0)');
      sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
      sheenGrad.addColorStop(0.75, 'rgba(255,255,255,0)');
      sheenGrad.addColorStop(1, 'rgba(255,255,255,0.08)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.arc(0, 0, vinylRadius, 0, Math.PI * 2);
      ctx.fill();

      // Center album artwork
      const centerRadius = vinylRadius * 0.38;
      ctx.beginPath();
      ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
      ctx.clip();

      if (this.coverImage && this.coverImage.complete && this.coverImage.naturalWidth > 0) {
        ctx.drawImage(this.coverImage, -centerRadius, -centerRadius, centerRadius * 2, centerRadius * 2);
      } else {
        ctx.fillStyle = track.accentColor || '#ec4899';
        ctx.fillRect(-centerRadius, -centerRadius, centerRadius * 2, centerRadius * 2);
      }

      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 6 * userScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

    } else if (track.cardStyle === 'glass-card') {
      const cardW = Math.min(width * 0.85, 420) * cardScale;
      const cardH = 90 * cardScale;
      const radius = 16 * cardScale;

      ctx.save();
      ctx.translate(centerX, centerY + offsetY);
      if (tiltAngle !== 0) ctx.rotate(tiltAngle);
      ctx.scale(scaleBoostX, scaleBoostY);

      const cardX = -cardW / 2;
      const cardY = -cardH / 2;

      // Glass background
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.shadowColor = track.badgeBeatGlow ? (track.accentColor || 'rgba(0, 0, 0, 0.5)') : 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = track.badgeBeatGlow ? 22 + beatIntensity * 26 : 20;
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Cover image inside card
      const imgSize = cardH - 20 * cardScale;
      const imgX = cardX + 10 * cardScale;
      const imgY = cardY + 10 * cardScale;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgSize, imgSize, 10 * cardScale);
      ctx.clip();
      if (this.coverImage && this.coverImage.complete) {
        ctx.drawImage(this.coverImage, imgX, imgY, imgSize, imgSize);
      } else {
        ctx.fillStyle = track.accentColor;
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
      }
      ctx.restore();

      // Texts
      const textX = imgX + imgSize + 16 * cardScale;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const titleSize = (track.titleFontSize || 18) * userScale;
      const artistSize = (track.artistFontSize || 14) * userScale;

      if (track.showTitle !== false) {
        ctx.font = `bold ${titleSize}px '${track.fontFamily}', sans-serif`;
        ctx.fillStyle = track.textColor || '#ffffff';
        ctx.fillText(track.title, textX, cardY + cardH * 0.38, cardW - imgSize - 30 * cardScale);
      }

      if (track.showArtist !== false) {
        ctx.font = `500 ${artistSize}px '${track.fontFamily}', sans-serif`;
        ctx.fillStyle = track.artistColor || 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(track.artist, textX, cardY + cardH * 0.68, cardW - imgSize - 30 * cardScale);
      }

      ctx.restore();

    } else if (track.cardStyle === 'circular-badge') {
      const badgeR = Math.min(width, height) * 0.14 * cardScale;
      ctx.save();
      ctx.translate(centerX, centerY + offsetY);
      if (tiltAngle !== 0) ctx.rotate(tiltAngle);
      ctx.scale(scaleBoostX, scaleBoostY);

      ctx.beginPath();
      ctx.arc(0, 0, badgeR, 0, Math.PI * 2);
      ctx.shadowColor = track.accentColor;
      ctx.shadowBlur = track.badgeBeatGlow ? 28 + beatIntensity * 28 : 20 + beatIntensity * 15;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, badgeR - 3 * userScale, 0, Math.PI * 2);
      ctx.clip();

      if (this.coverImage && this.coverImage.complete) {
        ctx.drawImage(this.coverImage, -badgeR, -badgeR, badgeR * 2, badgeR * 2);
      } else {
        ctx.fillStyle = track.accentColor;
        ctx.fillRect(-badgeR, -badgeR, badgeR * 2, badgeR * 2);
      }

      ctx.restore();

    } else if (track.cardStyle === 'rotating-badge') {
      // --- HUY HIỆU TRÒN XOAY 360° (Rotating Circular Vinyl Badge with Curved Title/Artist Ribbon & Center Art) ---
      const badgeR = Math.min(width, height) * 0.16 * cardScale;
      ctx.save();
      ctx.translate(centerX, centerY + offsetY);
      if (tiltAngle !== 0) ctx.rotate(tiltAngle);
      ctx.scale(scaleBoostX, scaleBoostY);

      // Smooth continuous spin angle driven by vinyl rotation
      const spinAngle = this.vinylRotation;

      // 1. Ambient Glow behind the badge (reacts to beat if badgeBeatGlow)
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, badgeR + 10, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowColor = track.accentColor || '#ec4899';
      ctx.shadowBlur = track.badgeBeatGlow ? 32 + beatIntensity * 36 : 22 + beatIntensity * 16;
      ctx.fill();
      ctx.restore();

      // 2. Outer Base Disc (Metallic dark vinyl base)
      const outerDiscGrad = ctx.createRadialGradient(0, 0, badgeR * 0.4, 0, 0, badgeR);
      outerDiscGrad.addColorStop(0, '#1c1c20');
      outerDiscGrad.addColorStop(0.55, '#121216');
      outerDiscGrad.addColorStop(0.85, '#0a0a0d');
      outerDiscGrad.addColorStop(1, '#050508');
      ctx.beginPath();
      ctx.arc(0, 0, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = outerDiscGrad;
      ctx.fill();

      // 3. Outer Golden / Neon rim border
      ctx.beginPath();
      ctx.arc(0, 0, badgeR, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, 3.5 * userScale);
      ctx.strokeStyle = track.accentColor || '#ec4899';
      ctx.stroke();

      // 4. Perimeter graduation tick dashes along the border
      ctx.save();
      ctx.rotate(spinAngle * 0.6);
      const tickCount = 40;
      for (let t = 0; t < tickCount; t++) {
        const a = (t / tickCount) * Math.PI * 2;
        const r1 = badgeR - 2;
        const r2 = badgeR - (t % 4 === 0 ? 9 : 5);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.strokeStyle = t % 4 === 0 ? (track.accentColor || '#ec4899') : 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = t % 4 === 0 ? 1.6 : 1;
        ctx.stroke();
      }
      ctx.restore();

      // 5. Curved 360° Rotating Track Title & Artist Ring Text
      const textRadius = badgeR * 0.81;
      const titleStr = (track.title || 'SONAWAVE PRO').trim().toUpperCase();
      const artistStr = (track.artist || 'STUDIO AUDIO').trim().toUpperCase();
      const bannerText = `✦  ${titleStr}  ✦  ${artistStr}  `;

      ctx.save();
      ctx.rotate(spinAngle);
      const totalChars = bannerText.length;
      const arcPerChar = (Math.PI * 2) / Math.max(16, totalChars);
      const bannerFontSize = Math.max(8, Math.min(15, badgeR * 0.115));
      ctx.font = `bold ${bannerFontSize}px '${track.fontFamily || 'Be Vietnam Pro'}', sans-serif`;
      ctx.fillStyle = track.textColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < totalChars; i++) {
        const char = bannerText[i];
        const charAngle = i * arcPerChar;
        ctx.save();
        ctx.rotate(charAngle);
        ctx.translate(0, -textRadius);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      // 6. Inner Dividing Metallic Ring
      const innerRingR = badgeR * 0.64;
      ctx.beginPath();
      ctx.arc(0, 0, innerRingR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 7. Center Spinning Artwork / Badge Image
      const centerR = innerRingR - 2.5;
      ctx.save();
      ctx.rotate(spinAngle); // artwork spins with the badge
      ctx.beginPath();
      ctx.arc(0, 0, centerR, 0, Math.PI * 2);
      ctx.clip();

      const activeImg = (this.badgePngImage && this.badgePngImage.complete && this.badgePngImage.naturalWidth > 0)
        ? this.badgePngImage
        : (this.coverImage && this.coverImage.complete && this.coverImage.naturalWidth > 0
            ? this.coverImage
            : (this.logoImage && this.logoImage.complete ? this.logoImage : null));

      if (activeImg) {
        ctx.drawImage(activeImg, -centerR, -centerR, centerR * 2, centerR * 2);
      } else {
        ctx.fillStyle = track.accentColor || '#ec4899';
        ctx.fillRect(-centerR, -centerR, centerR * 2, centerR * 2);
      }

      // Glossy Vinyl Sheen overlay over center
      const sheen = ctx.createLinearGradient(-centerR, -centerR, centerR, centerR);
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      sheen.addColorStop(0.45, 'rgba(255, 255, 255, 0.02)');
      sheen.addColorStop(0.55, 'rgba(0, 0, 0, 0.12)');
      sheen.addColorStop(1, 'rgba(255, 255, 255, 0.18)');
      ctx.fillStyle = sheen;
      ctx.fillRect(-centerR, -centerR, centerR * 2, centerR * 2);

      ctx.restore();

      // 8. Center Spindle Pin / Eyelet
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(4, 6.5 * userScale), 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

    } else if (track.cardStyle === 'logo-badge') {
      // --- PNG BADGE (Clean transparent rendering without any circular background disc) ---
      const logoSize = Math.min(width, height) * 0.24 * cardScale;
      ctx.save();
      ctx.translate(centerX, centerY + offsetY);
      if (tiltAngle !== 0) ctx.rotate(tiltAngle);
      ctx.scale(scaleBoostX, scaleBoostY);

      const activeImg = (this.badgePngImage && this.badgePngImage.complete && this.badgePngImage.naturalWidth > 0)
        ? this.badgePngImage
        : (this.coverImage && this.coverImage.complete && this.coverImage.naturalWidth > 0
            ? this.coverImage
            : (this.logoImage && this.logoImage.complete ? this.logoImage : null));

      if (activeImg) {
        ctx.save();
        ctx.globalAlpha = track.logoOpacity !== undefined ? track.logoOpacity : 1.0;
        const aspect = activeImg.naturalHeight / activeImg.naturalWidth || 1;
        const drawW = logoSize * (track.logoScale || 1.0);
        const drawH = drawW * aspect;

        // Glowing neon halo directly on transparent PNG Badge
        if (track.logoGlow !== false || track.badgeBeatGlow) {
          ctx.shadowColor = track.accentColor || '#ec4899';
          ctx.shadowBlur = (20 + (isBeatActive ? beatIntensity * 32 : 12)) * userScale;
        }

        ctx.drawImage(activeImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.roundRect(-logoSize / 2, -logoSize / 2, logoSize, logoSize, 16 * cardScale);
        ctx.strokeStyle = track.accentColor || '#ec4899';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `600 ${13 * userScale}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PNG BADGE', 0, 0);
      }

      ctx.restore();
    }

    // Render Title & Artist for vinyl, circular badge, rotating badge, logo badge, or minimal tag
    if (track.cardStyle === 'vinyl' || track.cardStyle === 'circular-badge' || track.cardStyle === 'rotating-badge' || track.cardStyle === 'logo-badge' || track.cardStyle === 'minimal-tag') {
      const offsetBelow = track.cardStyle === 'minimal-tag' 
        ? 0 
        : (track.cardStyle === 'vinyl' 
            ? Math.min(width, height) * 0.18 * cardScale + 30 * userScale 
            : (track.cardStyle === 'rotating-badge'
                ? Math.min(width, height) * 0.16 * cardScale + 28 * userScale
                : (track.cardStyle === 'logo-badge'
                    ? Math.min(width, height) * 0.14 * cardScale + 30 * userScale
                    : Math.min(width, height) * 0.14 * cardScale + 26 * userScale)));

      const textY = centerY + offsetBelow + (jumpStyle === 'bounce-up' ? offsetY * 0.45 : 0);
      const alignment = track.alignment || 'center';
      ctx.textAlign = alignment;
      ctx.textBaseline = 'middle';

      const titleSize = (track.titleFontSize || 22) * userScale;
      const artistSize = (track.artistFontSize || 15) * userScale;

      let drawX = centerX;
      if (alignment === 'left') drawX = centerX - (width * 0.4);
      if (alignment === 'right') drawX = centerX + (width * 0.4);

      // Optional Frosted Background Box for minimal tag or texts
      if (track.boxBackground) {
        ctx.save();
        ctx.font = `bold ${titleSize}px '${track.fontFamily}', sans-serif`;
        const tWidth = ctx.measureText(track.title).width;
        ctx.font = `500 ${artistSize}px '${track.fontFamily}', sans-serif`;
        const aWidth = ctx.measureText(track.artist).width;
        const maxW = Math.max(tWidth, aWidth) + 36 * userScale;
        const totalBoxH = (titleSize + artistSize + 24) * userScale;

        let boxLeft = drawX - maxW / 2;
        if (alignment === 'left') boxLeft = drawX - 16 * userScale;
        if (alignment === 'right') boxLeft = drawX - maxW + 16 * userScale;

        ctx.beginPath();
        ctx.roundRect(boxLeft, textY - totalBoxH * 0.4, maxW, totalBoxH, 12 * userScale);
        ctx.fillStyle = track.boxBgColor || 'rgba(0, 0, 0, 0.6)';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      // Title Text
      if (track.showTitle !== false) {
        ctx.font = `bold ${titleSize}px '${track.fontFamily}', sans-serif`;
        ctx.fillStyle = track.textColor || '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 10;
        ctx.fillText(track.title, drawX, textY, width * 0.85);
      }

      // Artist Text
      if (track.showArtist !== false) {
        const gap = track.showTitle !== false ? titleSize * 0.9 + 6 * userScale : 0;
        ctx.font = `500 ${artistSize}px '${track.fontFamily}', sans-serif`;
        ctx.fillStyle = track.artistColor || 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText(track.artist, drawX, textY + gap, width * 0.85);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  /**
   * Custom Logo PNG Watermark Renderer (Overlay corner or custom position)
   */
  private renderLogoWatermark(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    track: TrackMetadata,
    beatIntensity: number
  ) {
    if (!this.logoImage || !this.logoImage.complete || this.logoImage.naturalWidth === 0) return;
    ctx.save();
    const pos = track.logoPosition || 'top-left';
    const scale = track.logoScale || 1.0;
    const opacity = track.logoOpacity !== undefined ? track.logoOpacity : 1.0;
    const isBeatActive = track.badgeBeatJump !== false && beatIntensity > 0.02;
    const jumpScale = isBeatActive ? 1 + beatIntensity * (track.badgeBeatJumpIntensity || 0.18) * 0.8 : 1.0;
    const baseSize = Math.min(width, height) * 0.12 * scale;
    const aspect = this.logoImage.naturalHeight / this.logoImage.naturalWidth || 1;
    const logoW = baseSize * jumpScale;
    const logoH = baseSize * aspect * jumpScale;

    const margin = 28;
    let x = margin;
    let y = margin;

    if (pos === 'top-left') {
      x = margin;
      y = margin;
    } else if (pos === 'top-right') {
      x = width - margin - logoW;
      y = margin;
    } else if (pos === 'bottom-left') {
      x = margin;
      y = height - margin - logoH;
    } else if (pos === 'bottom-right') {
      x = width - margin - logoW;
      y = height - margin - logoH;
    } else if (pos === 'badge-center') {
      x = width / 2 - logoW / 2;
      y = height * 0.28 - logoH / 2;
    }

    ctx.globalAlpha = opacity;
    if (track.logoGlow || track.badgeBeatGlow) {
      ctx.shadowColor = track.accentColor || '#ec4899';
      ctx.shadowBlur = (18 + beatIntensity * 20) * scale;
    }
    ctx.drawImage(this.logoImage, x, y, logoW, logoH);
    ctx.restore();
  }

  /**
   * Custom Text Overlays / Watermarks / Notes Renderer with Wrap Text & Multi-Line support
   */
  private renderTextBoxes(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    textBoxes: TextBoxItem[],
    beatIntensity: number
  ) {
    ctx.save();
    for (const box of textBoxes) {
      if (!box.text || !box.text.trim()) continue;

      const posX = (width * box.positionX) / 100;
      const posY = (height * box.positionY) / 100;
      const maxAllowedWidth = (width * (box.maxWidth !== undefined ? box.maxWidth : 80)) / 100;
      const rawText = box.isUppercase ? box.text.toUpperCase() : box.text;

      ctx.save();
      ctx.globalAlpha = box.opacity !== undefined ? box.opacity : 1.0;
      const styleStr = box.fontStyle === 'italic' ? 'italic ' : '';
      const weightStr = box.fontWeight === '900' ? '900 ' : box.fontWeight === 'bold' ? 'bold ' : 'normal ';
      ctx.font = `${styleStr}${weightStr}${box.fontSize}px '${box.fontFamily || 'Be Vietnam Pro'}', sans-serif`;
      ctx.textAlign = box.alignment || 'center';
      ctx.textBaseline = 'middle';

      // Text wrapping / multi-line calculation
      const paragraphs = rawText.split('\n');
      const lines: string[] = [];

      if (box.wrapText) {
        for (const paragraph of paragraphs) {
          if (!paragraph) {
            lines.push('');
            continue;
          }
          const words = paragraph.split(' ');
          let currentLine = '';

          for (let w = 0; w < words.length; w++) {
            const word = words[w];
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = ctx.measureText(testLine).width;

            if (testWidth <= maxAllowedWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
                // If single word exceeds max width, split character by character
                if (ctx.measureText(word).width > maxAllowedWidth) {
                  let subWord = '';
                  for (const char of word) {
                    if (ctx.measureText(subWord + char).width <= maxAllowedWidth) {
                      subWord += char;
                    } else {
                      if (subWord) lines.push(subWord);
                      subWord = char;
                    }
                  }
                  currentLine = subWord;
                }
              } else {
                // Word alone exceeds max width
                let subWord = '';
                for (const char of word) {
                  if (ctx.measureText(subWord + char).width <= maxAllowedWidth) {
                    subWord += char;
                  } else {
                    if (subWord) lines.push(subWord);
                    subWord = char;
                  }
                }
                currentLine = subWord;
              }
            }
          }
          if (currentLine) {
            lines.push(currentLine);
          }
        }
      } else {
        lines.push(...paragraphs);
      }

      const lineHeightMultiplier = box.lineHeight !== undefined ? box.lineHeight : 1.35;
      const lineHeightPx = box.fontSize * lineHeightMultiplier;
      const totalTextH = (lines.length - 1) * lineHeightPx + box.fontSize;

      let maxMeasuredW = 0;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        if (w > maxMeasuredW) maxMeasuredW = w;
      }

      // Background pill / card if requested
      if (box.hasBackground) {
        const paddingX = box.fontSize * 0.75;
        const paddingY = box.fontSize * 0.45;
        const pillW = Math.min(width * 0.96, maxMeasuredW + paddingX * 2);
        const pillH = totalTextH + paddingY * 2;

        let pillX = posX - pillW / 2;
        if (box.alignment === 'left') pillX = posX - paddingX;
        if (box.alignment === 'right') pillX = posX - pillW + paddingX;
        const pillY = posY - pillH / 2;

        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, Math.min(16, pillH * 0.35));
        ctx.fillStyle = box.backgroundColor || 'rgba(0, 0, 0, 0.65)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 12;
        ctx.fill();
      }

      // Glow setup
      if (box.glowIntensity && box.glowIntensity > 0) {
        ctx.shadowColor = box.glowColor || box.color;
        ctx.shadowBlur = box.glowIntensity;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 6;
      }

      ctx.fillStyle = box.color || '#ffffff';

      // Draw all lines centered around posY
      const startY = posY - (totalTextH / 2) + (box.fontSize / 2);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const lineY = startY + i * lineHeightPx;
        ctx.fillText(line, posX, lineY, maxAllowedWidth);
      }

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Multi-Pass Bloom and Aura Line Renderer for Waveform Strokes
   */
  private strokeBloomPath(
    ctx: CanvasContext2D,
    pathFn: () => void,
    strokeStyle: string | CanvasGradient,
    glowTint: string,
    baseWidth: number,
    effectiveGlow: number,
    isBloomEnabled: boolean,
    bloomScale: number
  ) {
    if (!isBloomEnabled || effectiveGlow <= 2) {
      ctx.save();
      ctx.shadowBlur = effectiveGlow;
      ctx.shadowColor = glowTint;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = baseWidth;
      pathFn();
      ctx.stroke();
      ctx.restore();
      return;
    }

    // 1. Broad Ambient Bloom Aura Pass
    ctx.save();
    ctx.shadowBlur = effectiveGlow * 2.2;
    ctx.shadowColor = glowTint;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = baseWidth * (2.2 + bloomScale * 0.8);
    ctx.globalAlpha = Math.min(0.55, 0.2 + bloomScale * 0.2);
    pathFn();
    ctx.stroke();
    ctx.restore();

    // 2. Focused Neon Corona Pass
    ctx.save();
    ctx.shadowBlur = effectiveGlow * 0.9;
    ctx.shadowColor = glowTint;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = baseWidth * (1.1 + bloomScale * 0.2);
    ctx.globalAlpha = 0.95;
    pathFn();
    ctx.stroke();
    ctx.restore();

    // 3. White-Hot Intense Core Highlight Pass
    if (effectiveGlow > 8) {
      ctx.save();
      ctx.shadowBlur = Math.min(10, effectiveGlow * 0.4);
      ctx.shadowColor = '#ffffff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, baseWidth * 0.42);
      ctx.globalAlpha = Math.min(0.85, 0.4 + bloomScale * 0.35);
      pathFn();
      ctx.stroke();
      ctx.restore();
    }
  }

  private ensureVisBuffers(width: number, height: number) {
    if (!this.visBufferCanvas) {
      this.visBufferCanvas = document.createElement('canvas');
      this.visBufferCtx = this.visBufferCanvas.getContext('2d', { willReadFrequently: false });
    }
    if (this.visBufferCanvas.width !== width || this.visBufferCanvas.height !== height) {
      this.visBufferCanvas.width = width;
      this.visBufferCanvas.height = height;
    }

    if (!this.visRedCanvas) {
      this.visRedCanvas = document.createElement('canvas');
      this.visRedCtx = this.visRedCanvas.getContext('2d', { willReadFrequently: false });
    }
    if (this.visRedCanvas.width !== width || this.visRedCanvas.height !== height) {
      this.visRedCanvas.width = width;
      this.visRedCanvas.height = height;
    }

    if (!this.visCyanCanvas) {
      this.visCyanCanvas = document.createElement('canvas');
      this.visCyanCtx = this.visCyanCanvas.getContext('2d', { willReadFrequently: false });
    }
    if (this.visCyanCanvas.width !== width || this.visCyanCanvas.height !== height) {
      this.visCyanCanvas.width = width;
      this.visCyanCanvas.height = height;
    }
  }

  /**
   * Audio Visualizer Renderer with Chromatic Aberration & Frequency Glitch
   */
  private renderVisualizer(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    v: VisualizerConfig,
    freqData: Uint8Array,
    timeData: Uint8Array,
    bassIntensity: number,
    trebleIntensity: number,
    beatIntensity: number,
    currentTime: number
  ) {
    if (!v.chromaticAberration) {
      this.renderVisualizerCore(
        ctx,
        width,
        height,
        v,
        freqData,
        timeData,
        bassIntensity,
        trebleIntensity,
        beatIntensity,
        currentTime
      );
      return;
    }

    this.ensureVisBuffers(width, height);
    if (!this.visBufferCtx || !this.visRedCtx || !this.visCyanCtx || !this.visBufferCanvas || !this.visRedCanvas || !this.visCyanCanvas) {
      this.renderVisualizerCore(
        ctx,
        width,
        height,
        v,
        freqData,
        timeData,
        bassIntensity,
        trebleIntensity,
        beatIntensity,
        currentTime
      );
      return;
    }

    // 1. Clear intermediate offscreen buffers
    this.visBufferCtx.clearRect(0, 0, width, height);
    this.visRedCtx.clearRect(0, 0, width, height);
    this.visCyanCtx.clearRect(0, 0, width, height);

    // 2. Render the primary visualizer onto the offscreen buffer
    this.renderVisualizerCore(
      this.visBufferCtx,
      width,
      height,
      v,
      freqData,
      timeData,
      bassIntensity,
      trebleIntensity,
      beatIntensity,
      currentTime
    );

    // 3. Calculate dynamic frequency-reactive shift
    const intensity = v.chromaticAberrationIntensity !== undefined ? v.chromaticAberrationIntensity : 0.55;
    const freqEnergy = (bassIntensity * 0.65 + trebleIntensity * 0.35);
    const beatKick = beatIntensity > 0.28 ? Math.pow(beatIntensity, 1.4) * 14 * intensity : 0;
    const randomJitter = beatIntensity > 0.45 && Math.random() < 0.4 ? (Math.random() - 0.5) * 18 * intensity : 0;
    const baseOffset = 2.0 * intensity;
    const shiftX = Math.max(1, baseOffset + freqEnergy * 20 * intensity + beatKick + randomJitter);
    const shiftY = (Math.sin(currentTime * 10) * 1.5 + (Math.random() - 0.5) * 2) * intensity * (0.3 + freqEnergy * 0.7);

    // 4. Generate pure Red channel pass
    this.visRedCtx.drawImage(this.visBufferCanvas, 0, 0);
    this.visRedCtx.globalCompositeOperation = 'source-in';
    this.visRedCtx.fillStyle = '#ff0055';
    this.visRedCtx.fillRect(0, 0, width, height);
    this.visRedCtx.globalCompositeOperation = 'source-over';

    // 5. Generate pure Cyan channel pass
    this.visCyanCtx.drawImage(this.visBufferCanvas, 0, 0);
    this.visCyanCtx.globalCompositeOperation = 'source-in';
    this.visCyanCtx.fillStyle = '#00f0ff';
    this.visCyanCtx.fillRect(0, 0, width, height);
    this.visCyanCtx.globalCompositeOperation = 'source-over';

    // 6. Draw primary visualizer layer
    ctx.save();
    ctx.drawImage(this.visBufferCanvas, 0, 0);

    // 7. Composite Red & Cyan shifted layers with screen blend mode
    ctx.globalCompositeOperation = 'screen';
    const splitAlpha = Math.min(0.95, 0.45 + intensity * 0.5 + freqEnergy * 0.3);
    ctx.globalAlpha = splitAlpha;
    ctx.drawImage(this.visRedCanvas, -shiftX, -shiftY);
    ctx.drawImage(this.visCyanCanvas, shiftX, shiftY);

    // 8. Dynamic glitch horizontal slice displacement on peak beat/frequency spikes
    if (beatIntensity > 0.4 && Math.random() < 0.45 && intensity > 0.2) {
      const posY = (height * v.positionY) / 100;
      const numSlices = Math.min(4, Math.floor(2 + intensity * 3));
      for (let i = 0; i < numSlices; i++) {
        const sliceY = Math.max(0, posY - 100 + Math.random() * 200);
        const sliceH = Math.min(30, 6 + Math.random() * 18);
        const sliceShift = (Math.random() - 0.5) * 28 * intensity * beatIntensity;
        ctx.drawImage(
          this.visBufferCanvas,
          0,
          sliceY,
          width,
          sliceH,
          sliceShift,
          sliceY,
          width,
          sliceH
        );
      }
    }

    ctx.restore();
  }

  /**
   * Internal Core Visualizer Renderer
   */
  private renderVisualizerCore(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    v: VisualizerConfig,
    freqData: Uint8Array,
    timeData: Uint8Array,
    bassIntensity: number,
    trebleIntensity: number,
    beatIntensity: number,
    currentTime: number
  ) {
    ctx.save();

    const posY = (height * v.positionY) / 100;
    const posXPercent = v.positionX !== undefined ? v.positionX : 50;
    const centerX = (width * posXPercent) / 100;

    // Gradient Setup
    let strokeOrFillStyle: string | CanvasGradient = v.primaryColor;
    if (v.colorMode === 'gradient2') {
      const grad = ctx.createLinearGradient(0, posY - 160, 0, posY + 160);
      grad.addColorStop(0, v.primaryColor);
      grad.addColorStop(1, v.secondaryColor);
      strokeOrFillStyle = grad;
    } else if (v.colorMode === 'gradient3') {
      const grad = ctx.createLinearGradient(0, posY - 220, 0, posY + 220);
      grad.addColorStop(0, v.primaryColor);
      grad.addColorStop(0.5, v.secondaryColor);
      grad.addColorStop(1, v.tertiaryColor);
      strokeOrFillStyle = grad;
    } else if (v.colorMode === 'rainbow') {
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(0.2, '#f59e0b');
      grad.addColorStop(0.4, '#10b981');
      grad.addColorStop(0.6, '#06b6d4');
      grad.addColorStop(0.8, '#8b5cf6');
      grad.addColorStop(1, '#ec4899');
      strokeOrFillStyle = grad;
    }

    // Sync Visualizer Pulse Rate to Detected BPM
    let bpmPulse = 0;
    if (v.syncBpmPulse && v.bpm && v.bpm > 0) {
      const beatSec = 60 / v.bpm;
      const phase = (currentTime % beatSec) / beatSec;
      // Exponential decay impulse on each beat
      bpmPulse = Math.pow(Math.max(0, 1 - phase), 2.8);
    }

    const dynamicPulse = v.syncBpmPulse 
      ? Math.max(beatIntensity, bpmPulse * 0.9) 
      : beatIntensity;

    const baseGlow = v.glowIntensity !== undefined ? v.glowIntensity : 20;
    const isBloomEnabled = v.bloomEffect !== false;
    const bloomScale = isBloomEnabled ? (v.bloomIntensity !== undefined ? v.bloomIntensity / 50 : 1.3) : 0;
    const pulseBoost = v.dynamicBeatPulse ? dynamicPulse * 16 : 0;
    const effectiveGlow = Math.max(0, baseGlow * (0.5 + bloomScale * 0.6) + pulseBoost);
    const glowTint = v.glowColor || v.primaryColor;

    ctx.shadowBlur = effectiveGlow;
    ctx.shadowColor = glowTint;

    const dataLength = freqData.length || 128;
    const barCount = Math.min(v.barCount, 96);
    const bpmAmpMultiplier = v.syncBpmPulse ? (0.95 + bpmPulse * 0.2) : 1.0;
    const amp = v.amplitude * (v.bassBoost ? 1 + bassIntensity * 0.45 : 1) * bpmAmpMultiplier;

    // Initialize Peak Arrays
    if (this.peakBars.length !== barCount) {
      this.peakBars = new Array(barCount).fill(0);
      this.peakVelocities = new Array(barCount).fill(0);
    }

    switch (v.type) {
      // 1. Classic Spectrum Bars with Falling Gravity Peak Dots
      case 'bars-peaks': {
        const totalW = barCount * (v.barWidth + v.barGap) - v.barGap;
        const startX = centerX - totalW / 2;
        ctx.fillStyle = strokeOrFillStyle;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.35) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const barHeight = Math.max(3, (rawVal / 255) * 180 * amp * v.scale);

          // Realistic gravity physics for peak dot
          if (barHeight >= this.peakBars[i]) {
            this.peakBars[i] = barHeight;
            this.peakVelocities[i] = 0;
          } else {
            this.peakVelocities[i] += 0.38; // gravity acceleration
            this.peakBars[i] = Math.max(0, this.peakBars[i] - this.peakVelocities[i]);
          }

          const x = startX + i * (v.barWidth + v.barGap);
          const topY = posY - barHeight;

          // Main vertical bar
          ctx.beginPath();
          ctx.roundRect(x, topY, v.barWidth, barHeight, v.barRoundness);
          ctx.fill();

          // Falling Peak Cap / Glowing Dot on top
          if (this.peakBars[i] > 4) {
            const peakDotY = posY - this.peakBars[i] - 5;
            ctx.save();
            ctx.fillStyle = v.secondaryColor || '#ffffff';
            ctx.shadowColor = v.secondaryColor || v.primaryColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(x, peakDotY, v.barWidth, 3, 1.5);
            ctx.fill();
            ctx.restore();
          }
        }
        break;
      }

      // 2. Mirrored Bars with Dual Falling Peak Dots
      case 'bars-mirrored-peaks': {
        const totalW = barCount * (v.barWidth + v.barGap) - v.barGap;
        const startX = centerX - totalW / 2;
        ctx.fillStyle = strokeOrFillStyle;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.35) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const barHeight = Math.max(4, (rawVal / 255) * 160 * amp * v.scale);

          if (barHeight >= this.peakBars[i]) {
            this.peakBars[i] = barHeight;
            this.peakVelocities[i] = 0;
          } else {
            this.peakVelocities[i] += 0.35;
            this.peakBars[i] = Math.max(0, this.peakBars[i] - this.peakVelocities[i]);
          }

          const x = startX + i * (v.barWidth + v.barGap);
          const topY = posY - barHeight / 2;

          ctx.beginPath();
          ctx.roundRect(x, topY, v.barWidth, barHeight, v.barRoundness);
          ctx.fill();

          // Dual peak caps: Top & Bottom
          if (this.peakBars[i] > 6) {
            ctx.save();
            ctx.fillStyle = v.secondaryColor || '#ffffff';
            ctx.shadowColor = v.secondaryColor || v.primaryColor;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            // Top Cap
            ctx.roundRect(x, posY - this.peakBars[i] / 2 - 5, v.barWidth, 3, 1.5);
            // Bottom Cap
            ctx.roundRect(x, posY + this.peakBars[i] / 2 + 2, v.barWidth, 3, 1.5);
            ctx.fill();
            ctx.restore();
          }
        }
        break;
      }

      // 3. Smooth Area Spectrum Curve with Glowing Peak Points
      case 'spectrum-line': {
        const points = 56;
        const totalW = Math.min(width * 0.94, 900);
        const startX = centerX - totalW / 2;
        const step = totalW / (points - 1);

        const curvePoints: { x: number; y: number }[] = [];

        for (let i = 0; i < points; i++) {
          const mirror = 1 - Math.abs(i - points / 2) / (points / 2);
          const dataIdx = Math.min(dataLength - 1, Math.floor(mirror * (dataLength * 0.7)));
          const rawVal = freqData[dataIdx] || 0;
          const curveH = (rawVal / 255) * 140 * amp * v.scale;
          const x = startX + i * step;
          const y = posY - curveH;
          curvePoints.push({ x, y });
        }

        // Fill with gradient area
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, posY);
        for (let i = 0; i < curvePoints.length - 1; i++) {
          const xc = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
          const yc = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, xc, yc);
        }
        ctx.lineTo(startX + totalW, posY);
        ctx.closePath();

        const fillGrad = ctx.createLinearGradient(0, posY - 140 * amp, 0, posY);
        fillGrad.addColorStop(0, v.primaryColor);
        fillGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fillGrad;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.restore();

        // Glowing Multi-Pass Bloom Line on top
        const drawSpline = () => {
          ctx.beginPath();
          ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
          for (let i = 0; i < curvePoints.length - 1; i++) {
            const xc = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
            const yc = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
            ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, xc, yc);
          }
        };

        this.strokeBloomPath(
          ctx,
          drawSpline,
          strokeOrFillStyle,
          glowTint,
          v.lineThickness + 1.5,
          effectiveGlow,
          isBloomEnabled,
          bloomScale
        );

        // Glowing Peak Dots along curve
        for (let i = 0; i < curvePoints.length; i += 3) {
          if (posY - curvePoints[i].y > 10) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(curvePoints[i].x, curvePoints[i].y, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = v.secondaryColor || '#ffffff';
            ctx.shadowBlur = effectiveGlow * 0.8 + 8;
            ctx.shadowColor = v.secondaryColor || v.primaryColor;
            ctx.fill();
            ctx.restore();
          }
        }
        break;
      }

      // 4. Radial Spikes with Orbiting Peak Dots
      case 'radial-bars-peaks': {
        const radius = Math.min(width, height) * 0.22 * v.scale;
        const totalSpikes = v.barCount * 2;
        const angleStep = (Math.PI * 2) / totalSpikes;

        if (this.radialPeaks.length !== totalSpikes) {
          this.radialPeaks = new Array(totalSpikes).fill(0);
          this.radialVelocities = new Array(totalSpikes).fill(0);
        }

        ctx.fillStyle = strokeOrFillStyle;
        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = v.barWidth;
        ctx.lineCap = 'round';

        for (let i = 0; i < totalSpikes; i++) {
          const mirrorIdx = i < totalSpikes / 2 ? i : totalSpikes - i;
          const dataIndex = Math.min(dataLength - 1, Math.floor((mirrorIdx / (totalSpikes / 2)) * (dataLength * 0.7)));
          const rawVal = freqData[dataIndex] || 0;
          const spikeLen = Math.max(2, (rawVal / 255) * 95 * amp);

          if (spikeLen >= this.radialPeaks[i]) {
            this.radialPeaks[i] = spikeLen;
            this.radialVelocities[i] = 0;
          } else {
            this.radialVelocities[i] += 0.3;
            this.radialPeaks[i] = Math.max(0, this.radialPeaks[i] - this.radialVelocities[i]);
          }

          const angle = i * angleStep - Math.PI / 2;
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = posY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + spikeLen);
          const y2 = posY + Math.sin(angle) * (radius + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Orbit Peak Dot
          if (this.radialPeaks[i] > 8) {
            const dotX = centerX + Math.cos(angle) * (radius + this.radialPeaks[i] + 7);
            const dotY = posY + Math.sin(angle) * (radius + this.radialPeaks[i] + 7);
            ctx.save();
            ctx.beginPath();
            ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = v.secondaryColor || '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = v.secondaryColor || v.primaryColor;
            ctx.fill();
            ctx.restore();
          }
        }
        break;
      }

      case 'bars':
      case 'bars-mirrored': {
        const totalW = barCount * (v.barWidth + v.barGap) - v.barGap;
        const startX = centerX - totalW / 2;
        const isMirrored = v.type === 'bars-mirrored' || v.mirror;

        ctx.fillStyle = strokeOrFillStyle;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.4) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const barHeight = Math.max(4, (rawVal / 255) * 160 * amp * v.scale);

          const x = startX + i * (v.barWidth + v.barGap);

          if (isMirrored) {
            const topY = posY - barHeight / 2;
            ctx.beginPath();
            ctx.roundRect(x, topY, v.barWidth, barHeight, v.barRoundness);
            ctx.fill();
          } else {
            const topY = posY - barHeight;
            ctx.beginPath();
            ctx.roundRect(x, topY, v.barWidth, barHeight, v.barRoundness);
            ctx.fill();
          }
        }
        break;
      }

      case 'circular-spikes': {
        const radius = Math.min(width, height) * 0.22 * v.scale;
        const totalSpikes = v.barCount * 2;
        const angleStep = (Math.PI * 2) / totalSpikes;

        ctx.fillStyle = strokeOrFillStyle;
        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = v.barWidth;
        ctx.lineCap = 'round';

        for (let i = 0; i < totalSpikes; i++) {
          const mirrorIdx = i < totalSpikes / 2 ? i : totalSpikes - i;
          const dataIndex = Math.min(dataLength - 1, Math.floor((mirrorIdx / (totalSpikes / 2)) * (dataLength * 0.7)));
          const rawVal = freqData[dataIndex] || 0;
          const spikeLen = Math.max(2, (rawVal / 255) * 90 * amp);

          const angle = i * angleStep - Math.PI / 2;
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = posY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + spikeLen);
          const y2 = posY + Math.sin(angle) * (radius + spikeLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        break;
      }

      case 'smooth-wave': {
        const points = 64;
        const waveW = width * v.scale;
        const startX = centerX - waveW / 2;
        const step = waveW / (points - 1);

        for (let layer = 0; layer < 2; layer++) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(startX, height);
          ctx.lineTo(startX, posY);

          for (let i = 0; i < points; i++) {
            const dataIdx = Math.floor(Math.abs(i - points / 2) / (points / 2) * (dataLength * 0.6));
            const rawVal = freqData[dataIdx] || 0;
            const timeVal = (timeData[i % timeData.length] - 128) / 128;
            
            const offset = (rawVal / 255) * 90 * amp + timeVal * 30;
            const waveY = posY + (layer === 0 ? -offset : offset * 0.6) + Math.sin(currentTime * 3 + i * 0.2) * 10;
            const x = startX + i * step;

            if (i === 0) {
              ctx.lineTo(x, waveY);
            } else {
              const prevX = startX + (i - 1) * step;
              const cx = (prevX + x) / 2;
              ctx.quadraticCurveTo(prevX, waveY, cx, waveY);
            }
          }

          ctx.lineTo(startX + waveW, posY);
          ctx.lineTo(startX + waveW, height);
          ctx.closePath();

          ctx.fillStyle = strokeOrFillStyle;
          ctx.globalAlpha = layer === 0 ? 0.45 : 0.75;
          ctx.fill();
          ctx.restore();
        }
        break;
      }

      case 'cyber-matrix': {
        const totalW = barCount * (v.barWidth + v.barGap) - v.barGap;
        const startX = centerX - totalW / 2;
        const blockHeight = 5;
        const blockGap = 2;
        const maxBlocks = 24;

        ctx.fillStyle = strokeOrFillStyle;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.3) * (dataLength * 0.7)));
          const rawVal = freqData[dataIndex] || 0;
          const activeBlocks = Math.floor((rawVal / 255) * maxBlocks * amp);

          const x = startX + i * (v.barWidth + v.barGap);

          for (let b = 0; b < activeBlocks; b++) {
            const y = posY - b * (blockHeight + blockGap);
            ctx.beginPath();
            ctx.roundRect(x, y, v.barWidth, blockHeight, 1);
            ctx.fill();
          }
        }
        break;
      }

      case 'double-ribbon': {
        const points = 80;
        const ribbonW = Math.min(width * 1.1, 1200) * v.scale;
        const startX = centerX - ribbonW / 2;
        const step = ribbonW / (points - 1);

        for (let r = 0; r < 2; r++) {
          const phase = r * Math.PI;
          const drawRibbon = () => {
            ctx.beginPath();
            for (let i = 0; i < points; i++) {
              const mirrorDist = 1 - Math.abs(i - points / 2) / (points / 2);
              const dataIdx = Math.min(dataLength - 1, Math.floor(mirrorDist * (dataLength * 0.7)));
              const rawVal = freqData[dataIdx] || 0;
              const waveY = posY + Math.sin(currentTime * 4 + i * 0.15 + phase) * ((rawVal / 255) * 90 * amp + 15);
              const x = startX + i * step;

              if (i === 0) ctx.moveTo(x, waveY);
              else ctx.lineTo(x, waveY);
            }
          };

          this.strokeBloomPath(
            ctx,
            drawRibbon,
            strokeOrFillStyle,
            glowTint,
            v.lineThickness + 1,
            effectiveGlow,
            isBloomEnabled,
            bloomScale
          );
        }
        break;
      }

      case 'flame-spectrum': {
        const totalW = barCount * (v.barWidth + v.barGap) - v.barGap;
        const startX = centerX - totalW / 2;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.2) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const flameH = (rawVal / 255) * 180 * amp * (0.85 + Math.random() * 0.3);

          const x = startX + i * (v.barWidth + v.barGap);
          const grad = ctx.createLinearGradient(0, posY, 0, posY - flameH);
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(0.6, '#ef4444');
          grad.addColorStop(1, '#fbbf24');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(x, posY);
          ctx.lineTo(x + v.barWidth / 2, posY - flameH);
          ctx.lineTo(x + v.barWidth, posY);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'minimal-pulse': {
        const points = 48;
        const totalW = Math.min(width * 0.8, 500);
        const startX = centerX - totalW / 2;
        const step = totalW / (points - 1);

        ctx.strokeStyle = strokeOrFillStyle;
        ctx.fillStyle = strokeOrFillStyle;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(startX, posY);
        ctx.lineTo(startX + totalW, posY);
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        for (let i = 0; i < points; i++) {
          const mirror = 1 - Math.abs(i - points / 2) / (points / 2);
          const dataIdx = Math.min(dataLength - 1, Math.floor(mirror * (dataLength * 0.6)));
          const rawVal = freqData[dataIdx] || 0;
          const dotH = (rawVal / 255) * 50 * amp;

          const x = startX + i * step;
          ctx.beginPath();
          ctx.arc(x, posY - dotH, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // 17. 3D Neon DNA Double Helix with Frequency Ladder Rungs
      case 'dna-helix': {
        const points = 42;
        const helixW = Math.min(width * 0.9, 720) * v.scale;
        const startX = centerX - helixW / 2;
        const step = helixW / (points - 1);
        const baseAmp = 65 * amp * v.scale;
        const cycleSpeed = currentTime * 3.5;

        // Draw ladder rungs first (behind strands)
        for (let i = 0; i < points; i += 2) {
          const dataIdx = Math.min(dataLength - 1, Math.floor((i / points) * (dataLength * 0.7)));
          const rawVal = freqData[dataIdx] || 0;
          const rungAmp = baseAmp * (0.4 + (rawVal / 255) * 0.85);

          const angle = cycleSpeed + (i / points) * Math.PI * 4;
          const y1 = posY + Math.sin(angle) * rungAmp;
          const y2 = posY + Math.sin(angle + Math.PI) * rungAmp;
          const x = startX + i * step;

          const zDepth = Math.cos(angle);
          const rungAlpha = 0.35 + (zDepth + 1) * 0.3;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.strokeStyle = strokeOrFillStyle;
          ctx.lineWidth = Math.max(1.5, 2.5 * v.scale);
          ctx.globalAlpha = rungAlpha;
          ctx.stroke();

          // Glowing rung nodes / base pairs
          const nodeR = Math.max(2.5, (3 + (rawVal / 255) * 4) * v.scale);
          ctx.beginPath();
          ctx.arc(x, y1, nodeR, 0, Math.PI * 2);
          ctx.arc(x, y2, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = strokeOrFillStyle;
          ctx.fill();
          ctx.restore();
        }

        // Draw 2 continuous ribbon strands
        for (let strand = 0; strand < 2; strand++) {
          const phaseOffset = strand * Math.PI;
          const drawStrand = () => {
            ctx.beginPath();
            for (let i = 0; i < points; i++) {
              const dataIdx = Math.min(dataLength - 1, Math.floor((i / points) * (dataLength * 0.7)));
              const rawVal = freqData[dataIdx] || 0;
              const strandAmp = baseAmp * (0.4 + (rawVal / 255) * 0.85);

              const angle = cycleSpeed + (i / points) * Math.PI * 4 + phaseOffset;
              const x = startX + i * step;
              const y = posY + Math.sin(angle) * strandAmp;

              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          };

          this.strokeBloomPath(
            ctx,
            drawStrand,
            strokeOrFillStyle,
            glowTint,
            (v.lineThickness || 3) + 1,
            effectiveGlow,
            isBloomEnabled,
            bloomScale
          );
        }
        break;
      }

      // 18. Infinite 3D Concentric Portal Tunnel
      case 'tunnel-vortex': {
        const ringCount = 12;
        const maxRadius = Math.min(width, height) * 0.42 * v.scale;
        const spinAngle = currentTime * 0.8;
        const polygonSides = 8; // Octagon portal

        for (let r = 0; r < ringCount; r++) {
          // Perspective progression
          const progress = (r / ringCount + (currentTime * 0.35) % (1 / ringCount));
          const ringR = Math.pow(progress, 1.6) * maxRadius;
          if (ringR < 5) continue;

          const dataIdx = Math.min(dataLength - 1, Math.floor((r / ringCount) * (dataLength * 0.65)));
          const rawVal = freqData[dataIdx] || 0;
          const pulseR = ringR * (1 + (rawVal / 255) * 0.35 * amp + beatIntensity * 0.15);
          const ringAlpha = Math.sin(progress * Math.PI) * 0.85;

          ctx.save();
          ctx.globalAlpha = ringAlpha;
          ctx.lineWidth = Math.max(1.5, (1 + progress * 3) * (v.lineThickness || 2) * 0.7);
          ctx.strokeStyle = strokeOrFillStyle;
          ctx.beginPath();

          for (let s = 0; s <= polygonSides; s++) {
            const angle = spinAngle * (r % 2 === 0 ? 1 : -1) + (s / polygonSides) * Math.PI * 2;
            const vx = centerX + Math.cos(angle) * pulseR;
            const vy = posY + Math.sin(angle) * (pulseR * 0.75); // slight perspective tilt

            if (s === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      // 19. Stage EDM Concert Scanning Laser Beams
      case 'laser-beams': {
        const beamCount = 14;
        const baseOriginY = Math.min(height, posY + 220 * v.scale);
        const sweepSpeed = currentTime * 2.2;

        for (let i = 0; i < beamCount; i++) {
          const dataIdx = Math.min(dataLength - 1, Math.floor((i / beamCount) * (dataLength * 0.75)));
          const rawVal = freqData[dataIdx] || 0;
          const laserPower = (rawVal / 255) * amp;

          const normIndex = (i - beamCount / 2) / (beamCount / 2);
          const sweepAngle = Math.sin(sweepSpeed + i * 0.45) * 0.38 + normIndex * 0.65;
          const laserLength = Math.max(width, height) * (1.1 + beatIntensity * 0.3);

          const targetX = centerX + Math.sin(sweepAngle) * laserLength;
          const targetY = baseOriginY - Math.cos(sweepAngle) * laserLength;

          // A. Outer soft bloom beam
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(centerX, baseOriginY);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = strokeOrFillStyle;
          ctx.lineWidth = Math.max(4, (6 + laserPower * 16) * v.scale);
          ctx.globalAlpha = 0.25 + laserPower * 0.45;
          ctx.stroke();

          // B. Inner intense white-hot core
          ctx.beginPath();
          ctx.moveTo(centerX, baseOriginY);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1.5, (1.8 + laserPower * 3.5) * v.scale);
          ctx.globalAlpha = 0.8 + laserPower * 0.2;
          ctx.stroke();
          ctx.restore();

          // Laser floor emitter flare
          ctx.save();
          const flareR = Math.max(6, (8 + laserPower * 18 + beatIntensity * 12) * v.scale);
          const flareGrad = ctx.createRadialGradient(centerX, baseOriginY, 1, centerX, baseOriginY, flareR);
          flareGrad.addColorStop(0, '#ffffff');
          flareGrad.addColorStop(0.4, v.primaryColor);
          flareGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = flareGrad;
          ctx.beginPath();
          ctx.arc(centerX, baseOriginY, flareR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      }

      // 20. Multi-Point Pulsating Starburst Nova Core
      case 'starburst-core': {
        const rayCount = 48;
        const innerR = Math.min(width, height) * 0.08 * v.scale;
        const maxRayLen = Math.min(width, height) * 0.28 * v.scale;
        const rotOffset = currentTime * 0.6;

        // Pulsing core orb
        const corePulse = innerR * (1 + beatIntensity * 0.35 + (freqData[2] || 0) / 255 * 0.25);
        ctx.save();
        const coreGrad = ctx.createRadialGradient(centerX, posY, 2, centerX, posY, corePulse * 1.5);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, v.primaryColor);
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, posY, corePulse * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Radiating rays
        for (let i = 0; i < rayCount; i++) {
          const angle = rotOffset + (i / rayCount) * Math.PI * 2;
          const mirrorIdx = i < rayCount / 2 ? i : rayCount - i;
          const dataIdx = Math.min(dataLength - 1, Math.floor((mirrorIdx / (rayCount / 2)) * (dataLength * 0.7)));
          const rawVal = freqData[dataIdx] || 0;
          const rayLen = innerR + (rawVal / 255) * maxRayLen * amp;

          const x1 = centerX + Math.cos(angle) * innerR;
          const y1 = posY + Math.sin(angle) * innerR;
          const x2 = centerX + Math.cos(angle) * rayLen;
          const y2 = posY + Math.sin(angle) * rayLen;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = strokeOrFillStyle;
          ctx.lineWidth = Math.max(1.8, (2.5 * v.scale));
          ctx.stroke();

          // Diamond spark cap at end
          const sparkSize = Math.max(2, (2.5 + (rawVal / 255) * 4) * v.scale);
          ctx.beginPath();
          ctx.arc(x2, y2, sparkSize, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        break;
      }

      // 21. Multi-Tiered Floating Digital EQ Cascade Blocks
      case 'audio-equalizer-grid': {
        const columns = Math.min(barCount, 36);
        const rows = 12;
        const totalW = columns * (v.barWidth + v.barGap + 2) - (v.barGap + 2);
        const startX = centerX - totalW / 2;
        const colW = Math.max(4, v.barWidth);
        const blockH = Math.max(3, 7 * v.scale);
        const blockGap = Math.max(1.5, 2.5 * v.scale);

        for (let c = 0; c < columns; c++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(c / columns, 1.25) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const activeRows = Math.round((rawVal / 255) * rows * amp);

          const colX = startX + c * (colW + v.barGap + 2);

          for (let r = 0; r < rows; r++) {
            const blockY = posY - r * (blockH + blockGap);
            const isActive = r < activeRows;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(colX, blockY, colW, blockH, 2);

            if (isActive) {
              const rowProgress = r / rows;
              if (rowProgress > 0.8) {
                ctx.fillStyle = '#f43f5e'; // Red high peak
              } else if (rowProgress > 0.55) {
                ctx.fillStyle = '#fbbf24'; // Amber mid
              } else {
                ctx.fillStyle = strokeOrFillStyle;
              }
              ctx.globalAlpha = 0.95;
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
              ctx.globalAlpha = 0.35;
            }
            ctx.fill();
            ctx.restore();
          }

          // Top floating cap LED
          if (activeRows > 0) {
            const peakY = posY - activeRows * (blockH + blockGap) - 2;
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = v.primaryColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(colX, peakY, colW, 2.5);
            ctx.restore();
          }
        }
        break;
      }

      default:
        break;
    }

    ctx.restore();
  }

  /**
   * Helper to draw styled text with advanced visual effects (Neon glow, Double stroke, 3D shadow, Gradient fill, Metallic chrome, Comic pop)
   */
  private renderLyricTextWithEffect(
    ctx: CanvasContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lyrics: LyricsConfig,
    isActive: boolean,
    beatIntensity: number
  ) {
    const effect = lyrics.fontEffect || 'none';
    const effectColor = lyrics.fontEffectColor || lyrics.glowColor || '#ec4899';
    const baseColor = isActive ? (lyrics.activeColor || '#ffffff') : (lyrics.color || 'rgba(255,255,255,0.4)');

    ctx.save();

    if (effect === 'neon-glow') {
      const glowBlur = (lyrics.glowIntensity || 15) + (isActive ? beatIntensity * 16 : 0);
      ctx.shadowColor = effectColor;
      ctx.shadowBlur = glowBlur * 1.8;
      ctx.strokeStyle = effectColor;
      ctx.lineWidth = Math.max(2, (lyrics.strokeWidth || 2) * 1.5);
      ctx.strokeText(text, x, y, maxWidth);

      ctx.shadowBlur = glowBlur * 0.8;
      ctx.fillStyle = baseColor;
      ctx.fillText(text, x, y, maxWidth);

    } else if (effect === 'double-stroke') {
      ctx.strokeStyle = lyrics.strokeColor || '#000000';
      ctx.lineWidth = Math.max(4.5, (lyrics.strokeWidth || 3) * 2.2);
      ctx.strokeText(text, x, y, maxWidth);

      ctx.strokeStyle = effectColor;
      ctx.lineWidth = Math.max(2, lyrics.strokeWidth || 2);
      ctx.strokeText(text, x, y, maxWidth);

      ctx.fillStyle = baseColor;
      ctx.fillText(text, x, y, maxWidth);

    } else if (effect === '3d-shadow') {
      const depth = isActive ? 5 : 3;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      for (let d = depth; d >= 1; d--) {
        ctx.fillText(text, x + d * 1.5, y + d * 1.5, maxWidth);
      }
      ctx.fillStyle = effectColor;
      ctx.fillText(text, x + 1, y + 1, maxWidth);

      ctx.fillStyle = baseColor;
      ctx.fillText(text, x, y, maxWidth);

    } else if (effect === 'gradient-fill') {
      const metrics = ctx.measureText(text);
      const h = lyrics.fontSize || 24;
      const grad = ctx.createLinearGradient(x - metrics.width / 2, y - h / 2, x + metrics.width / 2, y + h / 2);
      grad.addColorStop(0, effectColor);
      grad.addColorStop(0.5, baseColor);
      grad.addColorStop(1, lyrics.activeColor || '#ffffff');

      ctx.shadowColor = effectColor;
      ctx.shadowBlur = isActive ? 14 : 0;
      ctx.fillStyle = grad;
      ctx.fillText(text, x, y, maxWidth);

    } else if (effect === 'metallic-chrome') {
      const h = lyrics.fontSize || 24;
      const chromeGrad = ctx.createLinearGradient(0, y - h * 0.6, 0, y + h * 0.6);
      chromeGrad.addColorStop(0, '#ffffff');
      chromeGrad.addColorStop(0.25, '#cbd5e1');
      chromeGrad.addColorStop(0.5, '#475569');
      chromeGrad.addColorStop(0.75, '#94a3b8');
      chromeGrad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeText(text, x, y, maxWidth);

      ctx.fillStyle = chromeGrad;
      ctx.fillText(text, x, y, maxWidth);

    } else if (effect === 'comic-pop') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.strokeText(text, x + 3, y + 3, maxWidth);
      ctx.strokeText(text, x, y, maxWidth);

      ctx.fillStyle = isActive ? (effectColor || '#facc15') : baseColor;
      ctx.fillText(text, x, y, maxWidth);

    } else {
      // 'none' or standard
      if (isActive && lyrics.glowIntensity > 0) {
        ctx.shadowColor = lyrics.glowColor || '#ec4899';
        ctx.shadowBlur = lyrics.glowIntensity + beatIntensity * 10;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 6;
      }
      ctx.fillStyle = baseColor;
      ctx.fillText(text, x, y, maxWidth);
    }

    // Underline option
    if (lyrics.textDecoration === 'underline') {
      const textMetrics = ctx.measureText(text);
      const lineW = Math.min(maxWidth, textMetrics.width);
      const lineY = y + (lyrics.fontSize || 24) * 0.55;
      let lineX = x - lineW / 2;
      if (ctx.textAlign === 'left') lineX = x;
      if (ctx.textAlign === 'right') lineX = x - lineW;

      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX + lineW, lineY);
      ctx.strokeStyle = isActive ? (lyrics.glowColor || baseColor) : baseColor;
      ctx.lineWidth = Math.max(2, (lyrics.fontSize || 24) * 0.08);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render Interactive Karaoke Cursor / Flying Indicator across words
   * Modes:
   * - 'color-only': Clean highlight sweep with no bouncing/flying indicator
   * - 'star-flying': Golden 5-point star flying & bouncing across words with sparkle trail
   * - 'bouncing-ball': Glowing 3D bouncy ball jumping rhythmically with squash & trail
   */
  private renderKaraokeCursor(
    ctx: CanvasContext2D,
    cursorX: number,
    cursorY: number,
    fontSize: number,
    beatIntensity: number,
    sweepMode: KaraokeSweepMode = 'star-flying',
    lyrics: LyricsConfig
  ) {
    if (sweepMode === 'color-only') {
      return;
    }

    const popScale = 1 + beatIntensity * 0.15;

    if (sweepMode === 'bouncing-ball') {
      // --- 1. QUẢ BÓNG NHỎ BAY + ĐỔI MÀU (Bouncing glowing 3D orb) ---
      const ballRadius = Math.max(6, fontSize * 0.32 * popScale);
      const glowColor = lyrics.glowColor || lyrics.activeColor || '#38bdf8';

      ctx.save();
      ctx.translate(cursorX, cursorY);

      // A. Dynamic Glow Halo
      ctx.shadowBlur = 14 + beatIntensity * 10;
      ctx.shadowColor = glowColor;

      // B. 3D Spherical Radial Gradient
      const ballGrad = ctx.createRadialGradient(
        -ballRadius * 0.35,
        -ballRadius * 0.35,
        ballRadius * 0.1,
        0,
        0,
        ballRadius
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.35, '#ec4899');
      ballGrad.addColorStop(0.75, glowColor);
      ballGrad.addColorStop(1, '#0f172a');

      ctx.beginPath();
      ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      ctx.fill();

      // C. Glossy Specular Top-Left Highlight
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.ellipse(-ballRadius * 0.3, -ballRadius * 0.3, ballRadius * 0.35, ballRadius * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

      // D. Trailing mini motion sparkles
      const trail1X = -ballRadius * 1.5;
      const trail1Y = ballRadius * 0.6;
      ctx.beginPath();
      ctx.arc(trail1X, trail1Y, ballRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      const trail2X = -ballRadius * 2.6;
      const trail2Y = ballRadius * 1.1;
      ctx.beginPath();
      ctx.arc(trail2X, trail2Y, ballRadius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      ctx.restore();
    } else {
      // --- 2. SAO VÀNG BAY + ĐỔI MÀU (Golden 5-Point Star with sparkle trail) ---
      const starRadius = Math.max(9, fontSize * 0.44 * popScale);
      const innerRadius = starRadius * 0.45;
      const rotAngle = Math.sin(Date.now() * 0.005) * 0.25;

      ctx.save();
      ctx.translate(cursorX, cursorY);
      ctx.rotate(rotAngle);

      // A. Golden Solar Glow
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16 + beatIntensity * 12;

      // B. 5-Point Star Path
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? starRadius : innerRadius;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const sx = Math.cos(angle) * r;
        const sy = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();

      // Golden Gradient Fill
      const starGrad = ctx.createLinearGradient(-starRadius, -starRadius, starRadius, starRadius);
      starGrad.addColorStop(0, '#fef08a');
      starGrad.addColorStop(0.5, '#facc15');
      starGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = starGrad;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // C. Central Sparkling Diamond Core
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(0, 0, starRadius * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // D. Trailing mini golden sparkle stars ✨
      ctx.rotate(-rotAngle);
      const sparkle1X = -starRadius * 1.5;
      const sparkle1Y = starRadius * 0.6;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sparkle1X, sparkle1Y, starRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      const sparkle2X = -starRadius * 2.5;
      const sparkle2Y = starRadius * 1.1;
      ctx.beginPath();
      ctx.arc(sparkle2X, sparkle2Y, starRadius * 0.16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Synchronized Lyrics Renderer (Supports Karaoke Single-Line, 4-Line Teleprompter, 3-Line & Effects)
   */
  private renderLyrics(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    lyrics: LyricsConfig,
    lyricsData: LyricLine[],
    currentTime: number,
    beatIntensity: number
  ) {
    const info = getActiveLyricInfo(lyricsData, currentTime);
    if (!info.activeLine && !info.prevLine && !info.nextLine && !info.nextLine2) return;

    ctx.save();
    const posY = (height * lyrics.positionY) / 100;
    const basePosX = (width * (lyrics.positionX !== undefined ? lyrics.positionX : 50)) / 100;

    const baseFontSize = lyrics.fontSize || 24;
    const fontFam = lyrics.fontFamily || 'Be Vietnam Pro';
    const fontWeight = lyrics.fontWeight || 'bold';
    const fontStyle = lyrics.fontStyle === 'italic' ? 'italic ' : '';

    const formatText = (text: string) => {
      if (lyrics.textTransform === 'uppercase') return text.toUpperCase();
      if (lyrics.textTransform === 'capitalize') {
        return text.replace(/\b\w/g, l => l.toUpperCase());
      }
      return text;
    };

    // Compute exact drawX (for ctx.fillText with ctx.textAlign) and textLeft (exact pixel start of text)
    const computeLyricCoords = (textW: number) => {
      let drawX = basePosX;
      let textLeft = basePosX - textW / 2;

      if (lyrics.alignment === 'center') {
        drawX = basePosX;
        textLeft = basePosX - textW / 2;
      } else if (lyrics.alignment === 'left') {
        const leftAnchor = (lyrics.positionX !== undefined && lyrics.positionX !== 50)
          ? basePosX
          : Math.max(width * 0.06, 24);
        drawX = leftAnchor;
        textLeft = leftAnchor;
      } else if (lyrics.alignment === 'right') {
        const rightAnchor = (lyrics.positionX !== undefined && lyrics.positionX !== 50)
          ? basePosX
          : Math.min(width * 0.94, width - 24);
        drawX = rightAnchor;
        textLeft = rightAnchor - textW;
      }
      return { drawX, textLeft };
    };

    // --- 1. KARAOKE 1 DÒNG (Single Line Focus) ---
    if (lyrics.style === 'karaoke-single') {
      const targetLine = info.activeLine || info.nextLine;
      if (targetLine) {
        const fullText = formatText(targetLine.text);
        const progress = info.activeLine ? Math.max(0, Math.min(1, info.lineProgress || 0)) : 0;
        const lineFontSize = baseFontSize * 1.15;
        const popScale = 1 + (info.activeLine ? beatIntensity * 0.06 : 0);

        ctx.font = `${fontStyle}${fontWeight} ${lineFontSize}px '${fontFam}', sans-serif`;
        const textMetrics = ctx.measureText(fullText);
        const textW = textMetrics.width;
        const { drawX, textLeft } = computeLyricCoords(textW);

        ctx.save();
        ctx.translate(drawX, posY);
        ctx.scale(popScale, popScale);
        ctx.translate(-drawX, -posY);

        // Frosted Container Pill
        if (lyrics.showBackgroundPill) {
          const pillW = Math.min(width * 0.94, textW + 48);
          const pillH = lineFontSize * 2.1;
          const pillX = textLeft - 24;
          ctx.beginPath();
          ctx.roundRect(pillX, posY - pillH / 2, pillW, pillH, pillH / 2);
          ctx.fillStyle = lyrics.pillColor || 'rgba(10, 14, 28, 0.7)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';

        // Dimmed Base Text Layer
        this.renderLyricTextWithEffect(ctx, fullText, drawX, posY, width * 0.88, lyrics, false, beatIntensity);

        // Sweeping Highlight Fill
        const fillWidth = textW * progress;

        if (fillWidth > 0.5 && info.activeLine) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(textLeft - 4, posY - lineFontSize * 1.6, fillWidth + 4, lineFontSize * 3.2);
          ctx.clip();

          this.renderLyricTextWithEffect(ctx, fullText, drawX, posY, width * 0.88, lyrics, true, beatIntensity);
          ctx.restore();

          // Animated Karaoke Flying Indicator / Ball / Star
          const cursorX = textLeft + fillWidth;
          const bounce = Math.abs(Math.sin(progress * Math.PI * 10)) * (9 + beatIntensity * 7);
          const cursorY = posY - lineFontSize * 0.72 - bounce;

          this.renderKaraokeCursor(
            ctx,
            cursorX,
            cursorY,
            lineFontSize,
            beatIntensity,
            lyrics.karaokeSweepMode || 'star-flying',
            lyrics
          );
        }

        ctx.restore();
      }

    // --- 2. MULTI-LINES 4 DÒNG TỰ CUỘN (Teleprompter 4-Lines Window) ---
    } else if (lyrics.style === 'teleprompter-4lines') {
      const lineGap = baseFontSize * 1.85;

      // Line 1: Previous line (faded top)
      if (info.prevLine) {
        const text = formatText(info.prevLine.text);
        ctx.font = `${fontStyle}500 ${baseFontSize * 0.76}px '${fontFam}', sans-serif`;
        const { drawX } = computeLyricCoords(ctx.measureText(text).width);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY - lineGap * 1.5, width * 0.88, lyrics, false, beatIntensity);
        ctx.restore();
      }

      // Line 2: Active Karaoke line (prominent center)
      if (info.activeLine) {
        const fullText = formatText(info.activeLine.text);
        const progress = Math.max(0, Math.min(1, info.lineProgress || 0));
        const popScale = 1 + (beatIntensity * 0.05);

        ctx.font = `${fontStyle}${fontWeight} ${baseFontSize * 1.05}px '${fontFam}', sans-serif`;
        const textMetrics = ctx.measureText(fullText);
        const textW = textMetrics.width;
        const { drawX, textLeft } = computeLyricCoords(textW);

        ctx.save();
        ctx.translate(drawX, posY);
        ctx.scale(popScale, popScale);
        ctx.translate(-drawX, -posY);

        // Optional Pill
        if (lyrics.showBackgroundPill) {
          const pillW = Math.min(width * 0.94, textW + 40);
          const pillH = baseFontSize * 1.9;
          const pillX = textLeft - 20;
          ctx.beginPath();
          ctx.roundRect(pillX, posY - pillH / 2, pillW, pillH, pillH / 2);
          ctx.fillStyle = lyrics.pillColor || 'rgba(10, 14, 28, 0.65)';
          ctx.fill();
        }

        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';

        // Base Layer
        this.renderLyricTextWithEffect(ctx, fullText, drawX, posY, width * 0.88, lyrics, false, beatIntensity);

        // Highlight Layer
        const fillWidth = textW * progress;
        if (fillWidth > 0.5) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(textLeft - 4, posY - baseFontSize * 1.5, fillWidth + 4, baseFontSize * 3);
          ctx.clip();
          this.renderLyricTextWithEffect(ctx, fullText, drawX, posY, width * 0.88, lyrics, true, beatIntensity);
          ctx.restore();

          // Animated Karaoke Indicator
          const cursorX = textLeft + fillWidth;
          const bounce = Math.abs(Math.sin(progress * Math.PI * 10)) * (7 + beatIntensity * 5);
          const cursorY = posY - baseFontSize * 0.7 - bounce;

          this.renderKaraokeCursor(
            ctx,
            cursorX,
            cursorY,
            baseFontSize,
            beatIntensity,
            lyrics.karaokeSweepMode || 'star-flying',
            lyrics
          );
        }

        ctx.restore();
      }

      // Line 3: Next line (faded bottom 1)
      if (info.nextLine) {
        const text = formatText(info.nextLine.text);
        ctx.font = `${fontStyle}500 ${baseFontSize * 0.82}px '${fontFam}', sans-serif`;
        const { drawX } = computeLyricCoords(ctx.measureText(text).width);
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY + lineGap * 1.1, width * 0.88, lyrics, false, beatIntensity);
        ctx.restore();
      }

      // Line 4: Next line 2 (faded bottom 2)
      if (info.nextLine2) {
        const text = formatText(info.nextLine2.text);
        ctx.font = `${fontStyle}500 ${baseFontSize * 0.72}px '${fontFam}', sans-serif`;
        const { drawX } = computeLyricCoords(ctx.measureText(text).width);
        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY + lineGap * 2.3, width * 0.88, lyrics, false, beatIntensity);
        ctx.restore();
      }

    // --- 3. KARAOKE 3 DÒNG (Standard) ---
    } else if (lyrics.style === 'karaoke') {
      const popScale = 1 + (beatIntensity * 0.05);

      // Previous Line
      if (info.prevLine) {
        const text = formatText(info.prevLine.text);
        ctx.font = `${fontStyle}500 ${baseFontSize * 0.74}px '${fontFam}', sans-serif`;
        const { drawX } = computeLyricCoords(ctx.measureText(text).width);
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY - baseFontSize * 2.1, width * 0.88, lyrics, false, beatIntensity);
        ctx.restore();
      }

      // Active Line
      if (info.activeLine) {
        const fullText = formatText(info.activeLine.text);
        const progress = Math.max(0, Math.min(1, info.lineProgress || 0));

        ctx.font = `${fontStyle}${fontWeight} ${baseFontSize}px '${fontFam}', sans-serif`;
        const textMetrics = ctx.measureText(fullText);
        const textW = textMetrics.width;
        const { drawX, textLeft } = computeLyricCoords(textW);

        ctx.save();
        ctx.translate(drawX, posY);
        ctx.scale(popScale, popScale);
        ctx.translate(-drawX, -posY);

        if (lyrics.showBackgroundPill) {
          const pillW = Math.min(width * 0.94, textW + 44);
          const pillH = baseFontSize * 2.0;
          const pillX = textLeft - 22;
          ctx.beginPath();
          ctx.roundRect(pillX, posY - pillH / 2, pillW, pillH, pillH / 2);
          ctx.fillStyle = lyrics.pillColor || 'rgba(10, 14, 28, 0.65)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';

        // Base Layer
        this.renderLyricTextWithEffect(ctx, fullText, drawX, posY, width * 0.88, lyrics, false, beatIntensity);

        // Sweeping Highlight
        const fillWidth = textW * progress;
        if (fillWidth > 0.5) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(textLeft - 4, posY - baseFontSize * 1.5, fillWidth + 4, baseFontSize * 3);
          ctx.clip();
          this.renderLyricTextWithEffect(ctx, fullText, drawX, posY, width * 0.88, lyrics, true, beatIntensity);
          ctx.restore();

          const cursorX = textLeft + fillWidth;
          const bounce = Math.abs(Math.sin(progress * Math.PI * 10)) * (8 + beatIntensity * 6);
          const cursorY = posY - baseFontSize * 0.7 - bounce;

          this.renderKaraokeCursor(
            ctx,
            cursorX,
            cursorY,
            baseFontSize,
            beatIntensity,
            lyrics.karaokeSweepMode || 'star-flying',
            lyrics
          );
        }

        ctx.restore();
      }

      // Next Line Preview
      if (info.nextLine) {
        const text = formatText(info.nextLine.text);
        ctx.font = `${fontStyle}500 ${baseFontSize * 0.74}px '${fontFam}', sans-serif`;
        const { drawX } = computeLyricCoords(ctx.measureText(text).width);
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY + baseFontSize * 2.1, width * 0.88, lyrics, false, beatIntensity);
        ctx.restore();
      }

    // --- 4. SUBTITLE BAR ---
    } else if (lyrics.style === 'subtitle-bar') {
      if (info.activeLine) {
        const text = formatText(info.activeLine.text);
        ctx.font = `${fontStyle}${fontWeight} ${baseFontSize}px '${fontFam}', sans-serif`;
        const textMetrics = ctx.measureText(text);
        const { drawX, textLeft } = computeLyricCoords(textMetrics.width);
        const barW = Math.min(width * 0.9, textMetrics.width + 48);
        const barH = baseFontSize * 2.2;
        const barX = textLeft - 24;
        const barY = posY - barH / 2;

        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 16);
        ctx.fillStyle = lyrics.pillColor || 'rgba(10, 15, 30, 0.75)';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY, width * 0.84, lyrics, true, beatIntensity);
      }

    // --- 5. MINIMAL GLOW / DEFAULT ---
    } else {
      if (info.activeLine) {
        const text = formatText(info.activeLine.text);
        ctx.font = `${fontStyle}${fontWeight} ${baseFontSize}px '${fontFam}', sans-serif`;
        const { drawX } = computeLyricCoords(ctx.measureText(text).width);
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        this.renderLyricTextWithEffect(ctx, text, drawX, posY, width * 0.9, lyrics, true, beatIntensity);
      }
    }

    ctx.restore();
  }

  /**
   * Film Light Effects Overlay (Vintage 35mm Light Leaks, Anamorphic Blue Flares, Prism Rainbow, Golden Hour, 8mm Projector, Dust & Scratches)
   */
  private renderFilmLight(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    filmLight: FilmLightConfig,
    bassIntensity: number,
    trebleIntensity: number,
    beatIntensity: number,
    currentTime: number,
    isPlaying: boolean
  ) {
    if (!filmLight || !filmLight.enabled) return;

    ctx.save();

    const speed = filmLight.speed !== undefined ? filmLight.speed : 1.0;
    const animTime = currentTime * speed;
    const beatKick = isPlaying && filmLight.reactiveToBeat ? beatIntensity * (filmLight.beatFlashBoost || 1.2) : 0;
    const baseIntensity = filmLight.intensity !== undefined ? filmLight.intensity : 0.65;
    const dynamicIntensity = Math.min(1.0, Math.max(0.05, baseIntensity + beatKick * 0.4));
    const scale = (filmLight.scale !== undefined ? filmLight.scale : 1.0) * (1 + beatKick * 0.22);
    const blendMode = filmLight.blendMode || 'screen';

    ctx.globalCompositeOperation = blendMode;
    ctx.globalAlpha = dynamicIntensity;

    const col1 = filmLight.primaryColor || '#ff7a00';
    const col2 = filmLight.secondaryColor || '#ff0055';
    const col3 = filmLight.tertiaryColor || '#ffd700';

    // Determine Anchor Origin based on Position
    let anchorX = 0;
    let anchorY = 0;
    const pos = filmLight.position || 'top-left';

    if (pos === 'top-left') {
      anchorX = 0;
      anchorY = 0;
    } else if (pos === 'top-right') {
      anchorX = width;
      anchorY = 0;
    } else if (pos === 'bottom-left') {
      anchorX = 0;
      anchorY = height;
    } else if (pos === 'bottom-right') {
      anchorX = width;
      anchorY = height;
    } else if (pos === 'top-edge') {
      anchorX = width / 2;
      anchorY = 0;
    } else if (pos === 'center') {
      anchorX = width / 2;
      anchorY = height / 2;
    } else {
      // 'dynamic-float'
      anchorX = width * (0.5 + Math.sin(animTime * 0.4) * 0.35);
      anchorY = height * (0.4 + Math.cos(animTime * 0.3) * 0.3);
    }

    const maxDim = Math.max(width, height);

    // --- 1. VINTAGE 35MM LEAK (Multi-lobe organic thermal burn) ---
    if (filmLight.style === 'vintage-leak') {
      const blobCount = 3;
      for (let b = 0; b < blobCount; b++) {
        const driftX = anchorX + Math.sin(animTime * 0.8 + b * 1.5) * (width * 0.15) * (pos === 'top-right' || pos === 'bottom-right' ? -1 : 1);
        const driftY = anchorY + Math.cos(animTime * 0.7 + b * 1.2) * (height * 0.15) * (pos === 'bottom-left' || pos === 'bottom-right' ? -1 : 1);
        const radius = (maxDim * (0.45 + b * 0.25)) * scale;

        const leakGrad = ctx.createRadialGradient(driftX, driftY, 5, driftX, driftY, radius);
        if (b === 0) {
          leakGrad.addColorStop(0, '#ffffff');
          leakGrad.addColorStop(0.2, col3);
          leakGrad.addColorStop(0.5, col1);
          leakGrad.addColorStop(0.85, col2);
          leakGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else if (b === 1) {
          leakGrad.addColorStop(0, col1);
          leakGrad.addColorStop(0.4, col2);
          leakGrad.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          leakGrad.addColorStop(0, col2);
          leakGrad.addColorStop(0.6, col1);
          leakGrad.addColorStop(1, 'rgba(0,0,0,0)');
        }

        ctx.fillStyle = leakGrad;
        ctx.beginPath();
        ctx.arc(driftX, driftY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

    // --- 2. ANAMORPHIC CINEMA FLARE (Horizontal wide blue/cyan laser streak) ---
    } else if (filmLight.style === 'anamorphic-flare') {
      const flareY = pos === 'center' ? height * (0.5 + Math.sin(animTime * 0.5) * 0.1) : anchorY;
      const flareX = anchorX;
      const beamHeight = (height * 0.08 + beatKick * (height * 0.06)) * scale;

      // Central core orb
      const coreR = Math.min(width, height) * 0.12 * scale;
      const coreGrad = ctx.createRadialGradient(flareX, flareY, 2, flareX, flareY, coreR);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, col1);
      coreGrad.addColorStop(0.7, col2);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal wide beam
      const horizGrad = ctx.createLinearGradient(0, flareY - beamHeight, 0, flareY + beamHeight);
      horizGrad.addColorStop(0, 'rgba(0,0,0,0)');
      horizGrad.addColorStop(0.4, col2);
      horizGrad.addColorStop(0.5, '#ffffff');
      horizGrad.addColorStop(0.6, col1);
      horizGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = horizGrad;
      ctx.fillRect(0, flareY - beamHeight, width, beamHeight * 2);

      // Slanted 45-deg subtle cross streak
      ctx.save();
      ctx.translate(flareX, flareY);
      ctx.rotate(Math.PI / 4 + Math.sin(animTime * 0.3) * 0.05);
      const crossGrad = ctx.createLinearGradient(-width * 0.4, 0, width * 0.4, 0);
      crossGrad.addColorStop(0, 'rgba(0,0,0,0)');
      crossGrad.addColorStop(0.5, col1);
      crossGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = crossGrad;
      ctx.fillRect(-width * 0.4, -beamHeight * 0.35, width * 0.8, beamHeight * 0.7);
      ctx.restore();

    // --- 3. PRISM RAINBOW (Chromatic dispersion diffraction beam) ---
    } else if (filmLight.style === 'prism-rainbow') {
      const beamAngle = Math.PI * 0.25 + Math.sin(animTime * 0.4) * 0.15;
      const beamWidth = maxDim * 0.65 * scale;
      const beamLen = maxDim * 1.5;

      ctx.save();
      ctx.translate(anchorX, anchorY);
      ctx.rotate(beamAngle);

      const prismGrad = ctx.createLinearGradient(0, -beamWidth / 2, 0, beamWidth / 2);
      prismGrad.addColorStop(0, 'rgba(255, 0, 0, 0)');
      prismGrad.addColorStop(0.15, 'rgba(255, 0, 60, 0.7)');
      prismGrad.addColorStop(0.3, 'rgba(255, 140, 0, 0.8)');
      prismGrad.addColorStop(0.45, 'rgba(255, 230, 0, 0.85)');
      prismGrad.addColorStop(0.6, 'rgba(0, 230, 120, 0.8)');
      prismGrad.addColorStop(0.75, 'rgba(0, 180, 255, 0.85)');
      prismGrad.addColorStop(0.9, 'rgba(170, 0, 255, 0.7)');
      prismGrad.addColorStop(1, 'rgba(255, 0, 200, 0)');

      ctx.fillStyle = prismGrad;
      ctx.fillRect(-beamLen * 0.1, -beamWidth / 2, beamLen, beamWidth);
      ctx.restore();

    // --- 4. GOLDEN HOUR (Warm sun rays & atmospheric haze) ---
    } else if (filmLight.style === 'golden-hour') {
      const rayCount = 9;
      const originX = anchorX;
      const originY = anchorY;
      const maxRayLen = maxDim * 1.4;

      // Big warm sun haze at corner
      const sunHaze = ctx.createRadialGradient(originX, originY, 10, originX, originY, maxDim * 0.65 * scale);
      sunHaze.addColorStop(0, '#ffffff');
      sunHaze.addColorStop(0.25, col3);
      sunHaze.addColorStop(0.6, col1);
      sunHaze.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunHaze;
      ctx.beginPath();
      ctx.arc(originX, originY, maxDim * 0.65 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Slanted sun ray bands
      for (let r = 0; r < rayCount; r++) {
        const rayAngle = (Math.PI / 4) + (r - rayCount / 2) * 0.12 + Math.sin(animTime * 0.5 + r) * 0.04;
        const rayWidth = (25 + r * 15 + beatKick * 20) * scale;

        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(rayAngle);

        const rayGrad = ctx.createLinearGradient(0, 0, maxRayLen, 0);
        rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        rayGrad.addColorStop(0.3, col3);
        rayGrad.addColorStop(0.7, col1);
        rayGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, -rayWidth / 2, maxRayLen, rayWidth);
        ctx.restore();
      }

    // --- 5. NEON CYBER LEAK (Magenta & Cyan dual corner leaks) ---
    } else if (filmLight.style === 'neon-cyber-leak') {
      // Corner 1: Magenta / Pink
      const r1 = maxDim * 0.55 * scale;
      const x1 = anchorX + Math.sin(animTime * 0.7) * (width * 0.1);
      const y1 = anchorY + Math.cos(animTime * 0.6) * (height * 0.1);
      const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, r1);
      grad1.addColorStop(0, '#ffffff');
      grad1.addColorStop(0.3, col1);
      grad1.addColorStop(0.7, '#ec4899');
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.fill();

      // Corner 2: Cyan / Blue (Opposite corner)
      const oppX = width - anchorX + Math.cos(animTime * 0.8) * (width * 0.1);
      const oppY = height - anchorY + Math.sin(animTime * 0.7) * (height * 0.1);
      const r2 = maxDim * 0.55 * scale;
      const grad2 = ctx.createRadialGradient(oppX, oppY, 10, oppX, oppY, r2);
      grad2.addColorStop(0, '#ffffff');
      grad2.addColorStop(0.3, col2);
      grad2.addColorStop(0.7, '#06b6d4');
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(oppX, oppY, r2, 0, Math.PI * 2);
      ctx.fill();

    // --- 6. RETRO 8MM PROJECTOR (Projector beam cone with shutter pulse) ---
    } else if (filmLight.style === 'retro-projector') {
      const projX = anchorX;
      const projY = anchorY;
      const beamR = maxDim * 0.9 * scale;

      const projGrad = ctx.createRadialGradient(projX, projY, 20, projX, projY, beamR);
      projGrad.addColorStop(0, '#ffffff');
      projGrad.addColorStop(0.2, col3);
      projGrad.addColorStop(0.55, col1);
      projGrad.addColorStop(0.85, col2);
      projGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = projGrad;
      ctx.fillRect(0, 0, width, height);

    // --- 7. LENS OPTICAL FLARE (Multi-ring optical reflection train) ---
    } else if (filmLight.style === 'lens-optical-flare') {
      const lightX = anchorX + Math.sin(animTime * 0.6) * (width * 0.15);
      const lightY = anchorY + Math.cos(animTime * 0.5) * (height * 0.12);
      const centerTargetX = width / 2;
      const centerTargetY = height / 2;
      const dirX = centerTargetX - lightX;
      const dirY = centerTargetY - lightY;

      // Main core starburst
      const coreR = Math.min(width, height) * 0.18 * scale;
      const coreGrad = ctx.createRadialGradient(lightX, lightY, 2, lightX, lightY, coreR);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, col1);
      coreGrad.addColorStop(0.7, col2);
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(lightX, lightY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Optical flare ghost rings along axis
      const ringPositions = [0.4, 0.75, 1.2, 1.6, 2.1];
      const ringSizes = [0.06, 0.12, 0.08, 0.16, 0.22];
      const ringColors = [col1, col2, col3, col1, col2];

      for (let i = 0; i < ringPositions.length; i++) {
        const ghostX = lightX + dirX * ringPositions[i];
        const ghostY = lightY + dirY * ringPositions[i];
        const ghostR = Math.min(width, height) * ringSizes[i] * scale;

        ctx.save();
        ctx.lineWidth = Math.max(1.5, 3 * scale);
        ctx.strokeStyle = ringColors[i];
        ctx.beginPath();
        ctx.arc(ghostX, ghostY, ghostR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = ringColors[i];
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.restore();
      }

    // --- 8. DYNAMIC FILM BURN CYCLE (Molten animated fire burn hot-spots) ---
    } else if (filmLight.style === 'film-burn-cycle') {
      const burnCount = 4;
      for (let k = 0; k < burnCount; k++) {
        const burnX = (width * ((k + 0.5) / burnCount) + Math.sin(animTime * 1.5 + k * 2) * (width * 0.15));
        const burnY = (height * 0.3 + Math.cos(animTime * 1.3 + k * 2.5) * (height * 0.25));
        const burnR = (maxDim * (0.2 + (k % 2) * 0.15) + beatKick * 80) * scale;

        const burnGrad = ctx.createRadialGradient(burnX, burnY, burnR * 0.1, burnX, burnY, burnR);
        burnGrad.addColorStop(0, '#ffffff');
        burnGrad.addColorStop(0.25, col3);
        burnGrad.addColorStop(0.55, col1);
        burnGrad.addColorStop(0.85, col2);
        burnGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = burnGrad;
        ctx.beginPath();
        ctx.arc(burnX, burnY, burnR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- EXTRA FILM OPTICAL ARTIFACTS ---

    // A. 35mm Film Dust & Hair Scratches
    if (filmLight.filmDustScratches) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const dustCount = Math.floor(15 * (filmLight.dustIntensity || 0.35));
      const frameSeed = Math.floor(currentTime * 14); // Shifts at 14fps like real celluloid

      for (let d = 0; d < dustCount; d++) {
        const randSeed = (frameSeed * 9301 + d * 49297) % 233280;
        const normSeed = randSeed / 233280;
        const dx = (normSeed * width * 1.3) % width;
        const dy = ((normSeed * 7.1) * height) % height;
        const dSize = ((normSeed * 3.5) % 2.5) + 0.8;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(dx, dy, dSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vertical hair scratch line
      if (Math.sin(frameSeed * 0.8) > 0.4) {
        const scratchX = (Math.abs(Math.sin(frameSeed * 1.7)) * width * 0.85) + width * 0.08;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(scratchX, 0);
        ctx.lineTo(scratchX + (Math.sin(frameSeed) * 4), height);
        ctx.stroke();
      }
      ctx.restore();
    }

    // B. Vintage Projector Shutter Flicker
    if (filmLight.lensFlicker) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      const flickerSpeed = filmLight.flickerSpeed || 1.0;
      const flickerVal = Math.sin(currentTime * 36 * flickerSpeed) * 0.08 + Math.cos(currentTime * 54 * flickerSpeed) * 0.04;
      if (flickerVal > 0) {
        ctx.fillStyle = `rgba(255, 240, 200, ${flickerVal * 1.2})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(flickerVal) * 0.8})`;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    }

    // C. Chromatic Aberration RGB Border Shift
    if (filmLight.chromaticAberration) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const borderW = maxDim * 0.12;

      // Cyan outer border
      const cyanGrad = ctx.createRadialGradient(width / 2, height / 2, maxDim * 0.4, width / 2, height / 2, maxDim * 0.7);
      cyanGrad.addColorStop(0, 'rgba(0,0,0,0)');
      cyanGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.15)');
      cyanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.45)');
      ctx.fillStyle = cyanGrad;
      ctx.fillRect(0, 0, width, height);

      // Red offset border
      const redGrad = ctx.createRadialGradient(width / 2 + 6, height / 2 + 4, maxDim * 0.4, width / 2 + 6, height / 2 + 4, maxDim * 0.7);
      redGrad.addColorStop(0, 'rgba(0,0,0,0)');
      redGrad.addColorStop(0.8, 'rgba(244, 63, 94, 0.15)');
      redGrad.addColorStop(1, 'rgba(244, 63, 94, 0.45)');
      ctx.fillStyle = redGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // D. Cinematic Warm Vignette
    if (filmLight.vignetteWarmth) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const vigGrad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.35, width / 2, height / 2, maxDim * 0.65);
      vigGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      vigGrad.addColorStop(0.65, 'rgba(255, 230, 200, 0.85)');
      vigGrad.addColorStop(1, 'rgba(60, 30, 15, 0.55)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    ctx.restore();
  }
}
