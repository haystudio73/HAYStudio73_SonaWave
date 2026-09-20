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
  TrackDetailElement,
  TrackFontStyle,
  TrackFontWeight,
  TrackFontEffect,
  SceneTransitionsConfig,
  SceneTransitionType,
  SlideImageItem,
  TimelineSceneItem,
  LottieItem,
} from '../types';
import { getActiveLyricInfo } from './lyricsParser';
import { threeDVisualizerEngine } from './threeDVisualizerEngine';
import { threeStereoRainEngine } from './threeStereoRainEngine';
import { lottieCanvasManager } from './lottieCanvasManager';

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
  speedLineAngle?: number;
  speedLineSlope?: number;
  randFactor?: number;
}

export type CanvasContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export class VisualizerRenderer {
  private particles: Particle[] = [];

  private bgImage: HTMLImageElement | null = null;
  private bgImageSrc = '';
  private bgVideo: HTMLVideoElement | null = null;
  private bgVideoSrc = '';
  private isAudioPlaying = false;
  private hiddenVideoContainer: HTMLDivElement | null = null;

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

  // Visualizer Chromatic Aberration & Reflection Offscreen Buffers
  private visBufferCanvas: HTMLCanvasElement | null = null;
  private visBufferCtx: CanvasRenderingContext2D | null = null;
  private visRedCanvas: HTMLCanvasElement | null = null;
  private visRedCtx: CanvasRenderingContext2D | null = null;
  private visCyanCanvas: HTMLCanvasElement | null = null;
  private visCyanCtx: CanvasRenderingContext2D | null = null;
  private visReflectCanvas: HTMLCanvasElement | null = null;
  private visReflectCtx: CanvasRenderingContext2D | null = null;

  // Global Color Grading Offscreen Buffers & Grain Cache
  private gradingCanvas: HTMLCanvasElement | null = null;
  private gradingCtx: CanvasRenderingContext2D | null = null;
  private grainNoiseCanvas: HTMLCanvasElement | null = null;
  private grainNoiseCtx: CanvasRenderingContext2D | null = null;

  // High Performance Render Path (Simplifies particle calculations and canvas drawing for lower-end devices during editing)
  private highPerformanceMode = false;

  public setHighPerformanceMode(enabled: boolean) {
    this.highPerformanceMode = enabled;
  }

  public getHighPerformanceMode(): boolean {
    return this.highPerformanceMode;
  }

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
        this.bgVideo.removeAttribute('src');
        this.bgVideo.load();
        if (this.bgVideo.parentNode) {
          this.bgVideo.parentNode.removeChild(this.bgVideo);
        }
        this.bgVideo = null;
      }
      return;
    }

    // Clean up previous video element if existing
    if (this.bgVideo) {
      this.bgVideo.pause();
      this.bgVideo.removeAttribute('src');
      this.bgVideo.load();
      if (this.bgVideo.parentNode) {
        this.bgVideo.parentNode.removeChild(this.bgVideo);
      }
      this.bgVideo = null;
    }

    const video = document.createElement('video');
    // For blob: and data: URLs, crossOrigin must NOT be set to prevent CORS errors or decoding stalls
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      video.crossOrigin = 'anonymous';
    }
    video.src = url;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.autoplay = true;
    video.preload = 'auto';
    video.disablePictureInPicture = true;

    // Attach to hidden DOM host: prevents Chromium from throttling decoding of off-DOM video elements
    if (typeof document !== 'undefined') {
      if (!this.hiddenVideoContainer) {
        let host = document.getElementById('sonawave-hidden-video-host') as HTMLDivElement | null;
        if (!host) {
          host = document.createElement('div');
          host.id = 'sonawave-hidden-video-host';
          host.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0.001;pointer-events:none;overflow:hidden;z-index:-9999;';
          document.body.appendChild(host);
        }
        this.hiddenVideoContainer = host;
      }
      if (this.hiddenVideoContainer) {
        this.hiddenVideoContainer.appendChild(video);
      }
    }

    // Event listeners to ensure continuous smooth playback & zero-gap looping
    video.addEventListener('canplay', () => {
      if (this.isAudioPlaying && video.paused) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener('ended', () => {
      video.currentTime = 0;
      if (this.isAudioPlaying) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener('waiting', () => {
      // Auto-recovery if buffer stalled
      if (this.isAudioPlaying && video.paused) {
        video.play().catch(() => {});
      }
    });

    video.addEventListener('error', (e) => {
      console.warn('Background video loading error:', e);
    });

    if (this.isAudioPlaying) {
      video.play().catch(() => {});
    }

    this.bgVideo = video;
  }

  public syncVideoPlayback(isPlaying: boolean, currentTime?: number) {
    this.isAudioPlaying = isPlaying;
    if (!this.bgVideo) return;
    if (isPlaying) {
      if (this.bgVideo.paused) {
        this.bgVideo.play().catch(() => {});
      }
      if (currentTime !== undefined) {
        this.syncVideoSeek(currentTime);
      }
    } else {
      if (!this.bgVideo.paused) {
        this.bgVideo.pause();
      }
    }
  }

  /**
   * Keep background video in sync with audio track playback time.
   * Jumps smoothly without thrashing decoder pipeline.
   */
  public syncVideoSeek(currentTime: number) {
    if (!this.bgVideo || !this.bgVideo.duration || !Number.isFinite(this.bgVideo.duration) || this.bgVideo.duration <= 0) return;
    try {
      const targetTime = currentTime % this.bgVideo.duration;
      // Only seek if drift exceeds 0.6 seconds to avoid decoder stall
      if (Math.abs(this.bgVideo.currentTime - targetTime) > 0.6) {
        this.bgVideo.currentTime = targetTime;
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Rewinds the background video to the beginning (or specific start offset) and starts playback.
   * Called automatically when starting HD video export/rendering.
   */
  public replayBackgroundVideo(startTime: number = 0) {
    if (!this.bgVideo) return;
    try {
      if (this.bgVideo.duration && Number.isFinite(this.bgVideo.duration) && this.bgVideo.duration > 0) {
        this.bgVideo.currentTime = startTime % this.bgVideo.duration;
      } else {
        this.bgVideo.currentTime = 0;
      }
      this.bgVideo.play().catch(() => {});
    } catch (e) {
      console.warn('Unable to replay background video:', e);
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

  // Slide & Scene Transitions Image Cache
  private slideImageCache: Map<string, HTMLImageElement> = new Map();

  public getOrCreateSlideImage(url: string): HTMLImageElement | null {
    if (!url) return null;
    let img = this.slideImageCache.get(url);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      this.slideImageCache.set(url, img);
    }
    return img;
  }

  /**
   * Calculates the current Scene Transition state based on time, slider images, and timeline scenes
   */
  private getTransitionState(
    transitions: SceneTransitionsConfig | undefined,
    baseBg: BackgroundConfig,
    baseVis: VisualizerConfig,
    currentTime: number
  ): {
    isTransitioning: boolean;
    progress: number;
    type: SceneTransitionType;
    fromImageUrl: string;
    toImageUrl: string;
    activeVis: VisualizerConfig;
    nextVis?: VisualizerConfig;
    kenBurns: boolean;
  } {
    if (!transitions || !transitions.enabled) {
      return {
        isTransitioning: false,
        progress: 0,
        type: 'fade',
        fromImageUrl: baseBg.url,
        toImageUrl: baseBg.url,
        activeVis: baseVis,
        kenBurns: false,
      };
    }

    const {
      mode = 'slider',
      images = [],
      scenes = [],
      sliderInterval = 8,
      defaultTransition = 'fade',
      transitionDuration = 1.2,
      sliderLoop = true,
      kenBurnsEffect = true,
    } = transitions;

    // Mode 1: Timeline Cued Scenes
    if ((mode === 'timeline' || (mode === 'both' && scenes.length > 0)) && scenes.length > 0) {
      const sortedScenes = [...scenes].sort((a, b) => a.time - b.time);
      let activeIdx = 0;
      for (let i = 0; i < sortedScenes.length; i++) {
        if (sortedScenes[i].time <= currentTime) {
          activeIdx = i;
        } else {
          break;
        }
      }

      const curScene = sortedScenes[activeIdx];
      const prevScene = activeIdx > 0 ? sortedScenes[activeIdx - 1] : null;

      const getSceneImg = (sc: TimelineSceneItem | null): string => {
        if (!sc) return baseBg.url;
        if (sc.imageUrl) return sc.imageUrl;
        if (sc.imageId) {
          const found = images.find((img) => img.id === sc.imageId);
          if (found) return found.url;
        }
        return baseBg.url;
      };

      const getSceneVis = (sc: TimelineSceneItem | null): VisualizerConfig => {
        if (!sc) return baseVis;
        return {
          ...baseVis,
          type: sc.visualizerType || baseVis.type,
          primaryColor: sc.visualizerPrimaryColor || baseVis.primaryColor,
          secondaryColor: sc.visualizerSecondaryColor || baseVis.secondaryColor,
          colorMode: sc.visualizerColorMode || baseVis.colorMode,
          barCount: sc.barCount || baseVis.barCount,
        };
      };

      const tDur = Math.max(0.2, curScene.transitionDuration || transitionDuration);
      const timeSinceSceneStart = currentTime - curScene.time;

      if (prevScene && timeSinceSceneStart >= 0 && timeSinceSceneStart < tDur) {
        const p = Math.min(1, Math.max(0, timeSinceSceneStart / tDur));
        return {
          isTransitioning: true,
          progress: p,
          type: curScene.transitionType || defaultTransition,
          fromImageUrl: getSceneImg(prevScene),
          toImageUrl: getSceneImg(curScene),
          activeVis: getSceneVis(prevScene),
          nextVis: getSceneVis(curScene),
          kenBurns: kenBurnsEffect,
        };
      }

      return {
        isTransitioning: false,
        progress: 0,
        type: curScene.transitionType || defaultTransition,
        fromImageUrl: getSceneImg(curScene),
        toImageUrl: getSceneImg(curScene),
        activeVis: getSceneVis(curScene),
        kenBurns: kenBurnsEffect,
      };
    }

    // Mode 2: Multi-Image Slider
    if (images.length > 0) {
      if (images.length === 1) {
        return {
          isTransitioning: false,
          progress: 0,
          type: defaultTransition,
          fromImageUrl: images[0].url,
          toImageUrl: images[0].url,
          activeVis: baseVis,
          kenBurns: kenBurnsEffect,
        };
      }

      const N = images.length;
      const interval = Math.max(2, sliderInterval);
      const tDur = Math.min(transitionDuration, interval * 0.5);

      const totalSlideIdx = Math.floor(currentTime / interval);
      const tInSlide = currentTime % interval;

      let idxA = totalSlideIdx % N;
      let idxB = (totalSlideIdx + 1) % N;

      if (!sliderLoop && totalSlideIdx >= N - 1) {
        idxA = N - 1;
        idxB = N - 1;
        return {
          isTransitioning: false,
          progress: 0,
          type: defaultTransition,
          fromImageUrl: images[idxA].url,
          toImageUrl: images[idxA].url,
          activeVis: baseVis,
          kenBurns: kenBurnsEffect,
        };
      }

      const transStart = interval - tDur;
      if (tInSlide >= transStart) {
        const p = Math.min(1, Math.max(0, (tInSlide - transStart) / tDur));
        return {
          isTransitioning: true,
          progress: p,
          type: defaultTransition,
          fromImageUrl: images[idxA].url,
          toImageUrl: images[idxB].url,
          activeVis: baseVis,
          kenBurns: kenBurnsEffect,
        };
      } else {
        return {
          isTransitioning: false,
          progress: 0,
          type: defaultTransition,
          fromImageUrl: images[idxA].url,
          toImageUrl: images[idxA].url,
          activeVis: baseVis,
          kenBurns: kenBurnsEffect,
        };
      }
    }

    return {
      isTransitioning: false,
      progress: 0,
      type: 'fade',
      fromImageUrl: baseBg.url,
      toImageUrl: baseBg.url,
      activeVis: baseVis,
      kenBurns: false,
    };
  }

  /**
   * Helper to draw a single image fitted to canvas aspect ratio with optional bleed & scale/pan
   */
  private drawSingleImage(
    ctx: CanvasContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    bg: BackgroundConfig,
    scaleMod: number = 1.0,
    panX: number = 0,
    panY: number = 0
  ) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;
    let sx = 0,
      sy = 0,
      sw = img.naturalWidth,
      sh = img.naturalHeight;

    if (imgAspect > canvasAspect) {
      sw = img.naturalHeight * canvasAspect;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / canvasAspect;
      sy = (img.naturalHeight - sh) / 2;
    }

    const bleed = bg.blur * 2;
    const baseW = width + bleed * 2;
    const baseH = height + bleed * 2;
    const destW = baseW * scaleMod;
    const destH = baseH * scaleMod;

    const destX = -bleed + panX - (destW - baseW) / 2;
    const destY = -bleed + panY - (destH - baseH) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, destX, destY, destW, destH);
  }

  /**
   * Renders background with active transitions (Fade, Slide Left/Right/Up/Down, Zoom In/Out) and Ken Burns motion
   */
  private renderTransitionBackground(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    bg: BackgroundConfig,
    fromImgUrl: string,
    toImgUrl: string,
    isTransitioning: boolean,
    progress: number,
    type: SceneTransitionType,
    kenBurns: boolean,
    currentTime: number
  ) {
    const fromImg = this.getOrCreateSlideImage(fromImgUrl);
    const toImg = this.getOrCreateSlideImage(toImgUrl);

    // Subtle Ken Burns organic pan & breathe
    let kbScale = 1.0;
    let kbPanX = 0;
    let kbPanY = 0;
    if (kenBurns) {
      kbScale = 1.0 + Math.sin(currentTime * 0.18) * 0.035;
      kbPanX = Math.cos(currentTime * 0.14) * 12;
      kbPanY = Math.sin(currentTime * 0.16) * 8;
    }

    ctx.save();
    ctx.filter = `blur(${bg.blur}px) brightness(${bg.brightness}%) contrast(${bg.contrast}%)`;

    if (!isTransitioning || !toImg || fromImgUrl === toImgUrl) {
      if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
        this.drawSingleImage(ctx, fromImg, width, height, bg, kbScale, kbPanX, kbPanY);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.filter = 'none';
      ctx.restore();
      return;
    }

    // Active Transition Rendering
    switch (type) {
      case 'fade': {
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          this.drawSingleImage(ctx, fromImg, width, height, bg, kbScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, progress));
          this.drawSingleImage(ctx, toImg, width, height, bg, kbScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }

      case 'slide-left': {
        const ease = progress * progress * (3 - 2 * progress);
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(-ease * width, 0);
          this.drawSingleImage(ctx, fromImg, width, height, bg, kbScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate((1 - ease) * width, 0);
          this.drawSingleImage(ctx, toImg, width, height, bg, kbScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }

      case 'slide-right': {
        const ease = progress * progress * (3 - 2 * progress);
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(ease * width, 0);
          this.drawSingleImage(ctx, fromImg, width, height, bg, kbScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(-(1 - ease) * width, 0);
          this.drawSingleImage(ctx, toImg, width, height, bg, kbScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }

      case 'slide-up': {
        const ease = progress * progress * (3 - 2 * progress);
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(0, -ease * height);
          this.drawSingleImage(ctx, fromImg, width, height, bg, kbScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(0, (1 - ease) * height);
          this.drawSingleImage(ctx, toImg, width, height, bg, kbScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }

      case 'slide-down': {
        const ease = progress * progress * (3 - 2 * progress);
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(0, ease * height);
          this.drawSingleImage(ctx, fromImg, width, height, bg, kbScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.translate(0, -(1 - ease) * height);
          this.drawSingleImage(ctx, toImg, width, height, bg, kbScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }

      case 'zoom-in': {
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          const outScale = kbScale * (1.0 + progress * 0.22);
          this.drawSingleImage(ctx, fromImg, width, height, bg, outScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, progress));
          const inScale = kbScale * (0.86 + progress * 0.14);
          this.drawSingleImage(ctx, toImg, width, height, bg, inScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }

      case 'zoom-out': {
        if (fromImg && fromImg.complete && fromImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          const outScale = kbScale * (1.0 - progress * 0.18);
          this.drawSingleImage(ctx, fromImg, width, height, bg, outScale, kbPanX, kbPanY);
          ctx.restore();
        }
        if (toImg && toImg.complete && toImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, progress));
          const inScale = kbScale * (1.20 - progress * 0.20);
          this.drawSingleImage(ctx, toImg, width, height, bg, inScale, -kbPanX, -kbPanY);
          ctx.restore();
        }
        break;
      }
    }

    ctx.filter = 'none';
    ctx.restore();
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
        randFactor: Math.random(),
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
    colorGrading?: ColorGradingConfig,
    sceneTransitions?: SceneTransitionsConfig,
    highPerformanceMode?: boolean,
    lotties: LottieItem[] = []
  ) {
    if (highPerformanceMode !== undefined) {
      this.highPerformanceMode = highPerformanceMode;
    }
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Sync active Lottie animations with offscreen canvas manager
    if (lotties) {
      lottieCanvasManager.syncItems(lotties);
    }

    // Calculate Scene Transitions & Multi-Image Slider State
    const transState = this.getTransitionState(sceneTransitions, background, visualizer, currentTime);

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
      const filtered = textBoxes.filter((b) => (b.layerOrder || 'front-all') === layer && b.visible !== false);
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

    // 1. Render Background (Image / Video / Gradient / Scene Transitions)
    this.renderBackground(sceneCtx, width, height, background, bassIntensity, beatIntensity, isPlaying, currentTime, track, transState);

    // 1.2 Render Track Card if configured 'back-all'
    renderTrackCardIfSlot('back-all');

    // 1.5 Render Text Boxes: 'back-all' (Phía sau cùng - ngay trên background)
    renderTextBoxesForLayer('back-all');

    // 1.8 Render Lottie Animations: 'back-all' (Phía sau cùng)
    lottieCanvasManager.renderLottieLayer(sceneCtx, width, height, lotties, 'back-all', beatIntensity);

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

    // 3.8 Render Lottie Animations: 'behind-visualizer' (Phía sau Sóng âm)
    lottieCanvasManager.renderLottieLayer(sceneCtx, width, height, lotties, 'behind-visualizer', beatIntensity);

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

    // 5. Render Waveform / Audio Visualizer (with Scene Transitions & Visibility support)
    const isVisVisible = visualizer.visible !== false && transState.activeVis?.visible !== false;
    if (this.visualizerOpacity > 0.005 && isVisVisible) {
      const activeVis = transState.activeVis;
      const nextVis = transState.nextVis;

      if (transState.isTransitioning && nextVis && (nextVis.type !== activeVis.type || nextVis.primaryColor !== activeVis.primaryColor)) {
        // Smooth morphing crossfade between active and incoming visualizers
        sceneCtx.save();
        sceneCtx.globalAlpha = this.visualizerOpacity * (1 - transState.progress);
        this.renderVisualizer(
          sceneCtx,
          width,
          height,
          activeVis,
          freqData,
          timeData,
          bassIntensity,
          trebleIntensity,
          beatIntensity,
          currentTime
        );
        sceneCtx.restore();

        sceneCtx.save();
        sceneCtx.globalAlpha = this.visualizerOpacity * transState.progress;
        this.renderVisualizer(
          sceneCtx,
          width,
          height,
          nextVis,
          freqData,
          timeData,
          bassIntensity,
          trebleIntensity,
          beatIntensity,
          currentTime
        );
        sceneCtx.restore();
      } else {
        sceneCtx.save();
        sceneCtx.globalAlpha = this.visualizerOpacity;
        this.renderVisualizer(
          sceneCtx,
          width,
          height,
          activeVis,
          freqData,
          timeData,
          bassIntensity,
          trebleIntensity,
          beatIntensity,
          currentTime
        );
        sceneCtx.restore();
      }
    }

    // 5.2 Render Track Card if configured 'front-visualizer'
    renderTrackCardIfSlot('front-visualizer');

    // 5.5 Render Text Boxes: 'behind-lyrics' (Phía sau Lời bài hát)
    renderTextBoxesForLayer('behind-lyrics');

    // 5.8 Render Lottie Animations: 'front-visualizer' (Phía trước Sóng âm)
    lottieCanvasManager.renderLottieLayer(sceneCtx, width, height, lotties, 'front-visualizer', beatIntensity);

    // 6. Render Synchronized Lyrics
    if (lyrics.enabled && lyricsData.length > 0) {
      this.renderLyrics(sceneCtx, width, height, lyrics, lyricsData, currentTime, beatIntensity);
    }

    // 6.3 Render Track Card if configured 'front-all'
    renderTrackCardIfSlot('front-all');

    // 6.5 Render Text Boxes: 'front-all' (Phía trước tất cả - Trên cùng)
    renderTextBoxesForLayer('front-all');

    // 6.7 Render Lottie Animations: 'front-all' (Phía trước tất cả)
    lottieCanvasManager.renderLottieLayer(sceneCtx, width, height, lotties, 'front-all', beatIntensity);

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
    isPlaying: boolean,
    currentTime: number = 0,
    track?: TrackMetadata,
    transitionState?: {
      isTransitioning: boolean;
      progress: number;
      type: SceneTransitionType;
      fromImageUrl: string;
      toImageUrl: string;
      kenBurns: boolean;
    }
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
    if (bg.isVideo || bg.type === 'video') {
      const vid = this.bgVideo;
      if (vid && vid.readyState >= 2) {
        // Auto-resume video if it stalled or was paused while audio is active
        if (isPlaying && vid.paused) {
          vid.play().catch(() => {});
        }

        // Only compute & apply ctx.filter if values differ from defaults (massive performance optimization)
        const needBlur = bg.blur > 0;
        const needBrightness = bg.brightness !== undefined && bg.brightness !== 100;
        const needContrast = bg.contrast !== undefined && bg.contrast !== 100;
        const hasFilter = needBlur || needBrightness || needContrast;

        if (hasFilter) {
          const filters: string[] = [];
          if (needBlur) {
            // In high performance mode, cap heavy blur to avoid GPU lockup
            const safeBlur = this.highPerformanceMode ? Math.min(bg.blur, 10) : bg.blur;
            filters.push(`blur(${safeBlur}px)`);
          }
          if (needBrightness) filters.push(`brightness(${bg.brightness}%)`);
          if (needContrast) filters.push(`contrast(${bg.contrast}%)`);
          ctx.filter = filters.join(' ');
        }

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

        const bleed = needBlur ? bg.blur * 2 : 0;
        ctx.drawImage(vid, sx, sy, sw, sh, -bleed, -bleed, width + bleed * 2, height + bleed * 2);

        if (hasFilter) {
          ctx.filter = 'none';
        }
      } else {
        // Fallback while video is loading or buffering: smooth dark gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

    } else if (bg.type === 'preset' || bg.type === 'upload') {
      if (transitionState && (transitionState.fromImageUrl || transitionState.isTransitioning)) {
        this.renderTransitionBackground(
          ctx,
          width,
          height,
          bg,
          transitionState.fromImageUrl,
          transitionState.toImageUrl,
          transitionState.isTransitioning,
          transitionState.progress,
          transitionState.type,
          transitionState.kenBurns,
          currentTime
        );
      } else if (this.bgImage && this.bgImage.complete && this.bgImage.naturalWidth > 0) {
        const needBlur = bg.blur > 0;
        const needBrightness = bg.brightness !== undefined && bg.brightness !== 100;
        const needContrast = bg.contrast !== undefined && bg.contrast !== 100;
        const hasFilter = needBlur || needBrightness || needContrast;

        if (hasFilter) {
          const filters: string[] = [];
          if (needBlur) filters.push(`blur(${bg.blur}px)`);
          if (needBrightness) filters.push(`brightness(${bg.brightness}%)`);
          if (needContrast) filters.push(`contrast(${bg.contrast}%)`);
          ctx.filter = filters.join(' ');
        }
        
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

        const bleed = needBlur ? bg.blur * 2 : 0;
        ctx.drawImage(img, sx, sy, sw, sh, -bleed, -bleed, width + bleed * 2, height + bleed * 2);

        if (hasFilter) {
          ctx.filter = 'none';
        }
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

    // Circle Ripple Effect in Background
    if (bg.circleRipple) {
      this.renderCircleRipple(ctx, width, height, bg, bassIntensity, beatIntensity, currentTime, track);
    }

    // Glitch Effect in Background
    if (bg.glitchEffect) {
      this.applyBackgroundGlitch(ctx, width, height, bg, bassIntensity, beatIntensity, isPlaying);
    }

    ctx.restore();
  }

  /**
   * Circle Ripple Effect for background (Gợn sóng tròn đồng tâm phản ứng nhịp nhạc)
   */
  private renderCircleRipple(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    bg: BackgroundConfig,
    bassIntensity: number,
    beatIntensity: number,
    currentTime: number,
    track?: TrackMetadata
  ) {
    if (!bg.circleRipple) return;

    ctx.save();
    const count = Math.max(1, Math.min(12, bg.circleRippleCount || 4));
    const speed = bg.circleRippleSpeed !== undefined ? bg.circleRippleSpeed : 1.0;
    const baseOpacity = bg.circleRippleOpacity !== undefined ? bg.circleRippleOpacity : 0.4;
    const lineWidth = bg.circleRippleLineWidth !== undefined ? bg.circleRippleLineWidth : 2.5;
    const color = bg.circleRippleColor || '#ffffff';
    const isReactive = bg.circleRippleReactive !== false;
    const glow = bg.circleRippleGlow !== false;
    const origin = bg.circleRippleOrigin || 'center';

    let originX = width / 2;
    let originY = height / 2;

    if (origin === 'bottom') {
      originX = width / 2;
      originY = height;
    } else if (origin === 'cover' && track) {
      originX = (width * (track.positionX !== undefined ? track.positionX : 50)) / 100;
      originY = (height * (track.positionY !== undefined ? track.positionY : 28)) / 100;
    }

    // Maximum ripple propagation radius
    const maxRadius = Math.sqrt(width * width + height * height) * 0.65;
    const reactiveKick = isReactive ? Math.max(bassIntensity * 1.3, beatIntensity * 1.1) : 0;
    const t = currentTime > 0 ? currentTime : performance.now() / 1000;

    for (let i = 0; i < count; i++) {
      // Stagger phases between rings
      const phaseOffset = i / count;
      const progress = ((t * 0.22 * speed) + phaseOffset) % 1.0;

      // Expansion radius with non-linear ease-out and audio reactive bounce
      const easeRadius = Math.pow(progress, 0.85);
      const radius = Math.max(8, easeRadius * maxRadius + reactiveKick * 40 * (1 - progress));

      // Opacity fades out smoothly towards outer perimeter
      const alphaFade = Math.sin(progress * Math.PI);
      const ringAlpha = Math.max(0, Math.min(1.0, alphaFade * baseOpacity * (isReactive ? (0.75 + reactiveKick * 0.5) : 1.0)));

      if (ringAlpha <= 0.01) continue;

      ctx.save();
      ctx.beginPath();
      ctx.arc(originX, originY, radius, 0, Math.PI * 2);

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, lineWidth * (1 - progress * 0.4) + (isReactive ? reactiveKick * 2.2 : 0));
      ctx.globalAlpha = ringAlpha;

      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 14 + reactiveKick * 20;
      }

      ctx.stroke();

      // Delicate inner specular ring
      if (glow && ringAlpha > 0.15) {
        ctx.beginPath();
        ctx.arc(originX, originY, Math.max(4, radius - 2), 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(0.8, lineWidth * 0.35);
        ctx.globalAlpha = ringAlpha * 0.6;
        ctx.stroke();
      }

      ctx.restore();
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

    // WebGL Stereo 3D Rain Rendering & Water on Glass (threejs.org/examples/#webgl_effects_stereo)
    if (config.type === 'rain' && (config.stereoRainEnabled || config.waterOnGlass)) {
      const stereoCanvas = threeStereoRainEngine.render(
        width,
        height,
        config,
        bassIntensity,
        trebleIntensity,
        beatIntensity,
        currentTime,
        isPlaying
      );
      if (stereoCanvas) {
        ctx.drawImage(stereoCanvas, 0, 0, width, height);
        // If only waterOnGlass is active without stereo rain, let 2D particles render underneath if wanted, or return if stereo is on
        if (config.stereoRainEnabled) {
          return;
        }
      }
    }

    if (this.particles.length !== config.count) {
      this.initParticles(config.count);
    }

    ctx.save();
    const speedMult = isPlaying ? config.speed : 0.35 * config.speed;
    const beatKick = isPlaying && config.reactiveToBeat ? beatIntensity * 2.5 : 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const isHighPerf = this.highPerformanceMode;
    const particleLimit = isHighPerf ? Math.min(this.particles.length, 60) : this.particles.length;

    // Special backdrop glow for Hyperspace (skipped in high-performance mode to reduce canvas fill load)
    if (config.type === 'hyperspace' && !isHighPerf) {
      const warpGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, Math.min(width, height) * 0.4);
      warpGlow.addColorStop(0, `rgba(56, 189, 248, ${0.15 + beatKick * 0.2})`);
      warpGlow.addColorStop(0.5, `rgba(139, 92, 246, ${0.08 + beatKick * 0.12})`);
      warpGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = warpGlow;
      ctx.fillRect(0, 0, width, height);
    }

    // Precalculated wind angles for Rain & Snow to avoid repetitive trigonometric calls inside the loop
    const rainAngleDeg = config.rainWindAngle !== undefined ? config.rainWindAngle : 10;
    const rainWindRad = (rainAngleDeg * Math.PI) / 180;
    const rainWindSpeedMult = config.rainWindSpeed !== undefined ? config.rainWindSpeed : 1.2;
    const rainCos = Math.cos(rainWindRad) * rainWindSpeedMult;
    const rainSin = Math.sin(rainWindRad) * rainWindSpeedMult;
    const rainTurbulence = (config.rainTurbulence !== undefined ? config.rainTurbulence : 25) / 100;
    const rainLenScale = config.rainLengthScale !== undefined ? config.rainLengthScale : 1.2;

    const snowAngleDeg = config.snowWindAngle !== undefined ? config.snowWindAngle : 15;
    const snowWindRad = (snowAngleDeg * Math.PI) / 180;
    const snowWindSpeedMult = config.snowWindSpeed !== undefined ? config.snowWindSpeed : 1.0;
    const snowCos = Math.cos(snowWindRad) * snowWindSpeedMult;
    const snowSin = Math.sin(snowWindRad) * snowWindSpeedMult;
    const snowTurbulence = (config.snowTurbulence !== undefined ? config.snowTurbulence : 40) / 100;

    for (let pi = 0; pi < particleLimit; pi++) {
      const p = this.particles[pi];
      if (config.type === 'rain') {
        let baseFall: number;
        let baseDrift: number;

        if (isHighPerf) {
          // High-performance direct linear ballistic trajectory
          baseFall = rainCos * ((p.speed || 8) * 1.8 + 6) + beatKick * 6.5;
          baseDrift = rainSin * ((p.speed || 8) * 1.8 + 6);
          p.x += baseDrift * speedMult;
          p.y += Math.max(3.5, baseFall) * speedMult;
        } else {
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.04);
          const flutter = Math.sin(p.wobble) * (0.8 + beatKick * 0.8) * rainTurbulence;
          baseFall = rainCos * ((p.speed || 8) * 1.8 + 6) + beatKick * 6.5;
          baseDrift = rainSin * ((p.speed || 8) * 1.8 + 6);
          p.x += (baseDrift + flutter + (p.vx || 0) * 0.4) * speedMult;
          p.y += Math.max(3.5, baseFall) * speedMult;
        }

        const margin = 80;
        if (p.y > height + margin) {
          p.y = -margin - Math.random() * 50;
          p.x = Math.random() * (width + margin * 2) - margin;
          p.speed = Math.random() * 6 + 6;
          p.size = Math.random() * 2.8 + 1.2;
          p.length = (Math.random() * 32 + 20) * rainLenScale;
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
        p.alpha = isHighPerf ? p.baseAlpha + beatKick * 0.2 : (p.baseAlpha + Math.sin(Date.now() * 0.003 + p.x) * 0.25 + beatKick * 0.3);
        p.x += p.vx * speedMult;
        p.y += p.vy * speedMult;
      } else if (config.type === 'spinning-dashes') {
        const spinBoost = 1 + (config.reactiveToBeat ? beatKick * 2.2 : 0);
        p.angle = ((p.angle || 0) + (p.rotSpeed || 0.045) * spinBoost * speedMult);
        p.y += ((p.speed || 5) * 0.85 + 2.6) * speedMult + beatKick * 6.2;
        p.x += isHighPerf ? p.vx * speedMult : (Math.sin(p.wobble || 0) * (1.2 + beatKick * 1.5) + p.vx * speedMult);
        if (!isHighPerf) p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.035);

        if (p.y > height + 60) {
          p.y = -50 - Math.random() * 60;
          p.x = Math.random() * width;
          p.speed = Math.random() * 4 + 4;
          p.length = Math.random() * 24 + 16;
          p.rotSpeed = (Math.random() - 0.5) * 0.09 + (Math.random() > 0.5 ? 0.04 : -0.04);
          p.hue = Math.random() * 360;
          p.baseAlpha = Math.random() * 0.4 + 0.6;
        }
      } else if (config.type === 'spaghetti' || config.type === 'silk-ribbon') {
        p.y += ((p.speed || 4) * 0.9 + 2.8) * speedMult + beatKick * 6.5;
        if (!isHighPerf) {
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.035);
          p.x += Math.sin(p.wobble) * 1.5;
        }

        const baseRibbonLen = config.ribbonLength !== undefined ? config.ribbonLength : 160;
        const maxResetLen = baseRibbonLen * 1.3 + 80;
        if (p.y > height + maxResetLen) {
          p.y = -maxResetLen - Math.random() * 80;
          p.x = Math.random() * width;
          p.wobble = Math.random() * Math.PI * 2;
          p.hue = Math.random() * 25 + 38;
          p.randFactor = Math.random();
          p.baseAlpha = Math.random() * 0.3 + 0.7;
        }
      } else if (config.type === 'speed-lines') {
        const isCenterMode = config.speedLineMode === 'converge-center';
        const baseLen = config.speedLineLength || 140;
        const randRange = (config.speedLineRandomLength !== undefined ? config.speedLineRandomLength : 55) / 100;
        const lineLen = Math.max(25, baseLen * (1 + ((p.randFactor || 0.5) - 0.5) * 2 * randRange));
        const lineSpeedFactor = config.speedLineSpeed !== undefined ? config.speedLineSpeed : 1.0;
        const lineSpeed = (((p.speed || 8) * 4.2 + 18) * speedMult * lineSpeedFactor) + beatKick * (26 * Math.min(2.0, lineSpeedFactor));

        if (isCenterMode) {
          // 2. Theo chiều đứng về tâm (Anime Action Focus Lines với Vertical Center & Horizontal Center)
          const vCenter = config.speedLineVerticalCenter || 'center';
          let targetYRatio = 0.50;
          if (config.speedLineCenterY !== undefined) {
            targetYRatio = Math.max(0.1, Math.min(0.9, config.speedLineCenterY / 100));
          } else if (vCenter === 'top') {
            targetYRatio = 0.25;
          } else if (vCenter === 'bottom') {
            targetYRatio = 0.75;
          } else {
            targetYRatio = 0.50;
          }

          const hCenter = config.speedLineHorizontalCenter || 'center';
          let targetXRatio = 0.50;
          if (config.speedLineCenterX !== undefined) {
            targetXRatio = Math.max(0.1, Math.min(0.9, config.speedLineCenterX / 100));
          } else if (hCenter === 'left') {
            targetXRatio = 0.25;
          } else if (hCenter === 'right') {
            targetXRatio = 0.75;
          } else {
            targetXRatio = 0.50;
          }

          const targetX = width * targetXRatio;
          const targetY = height * targetYRatio;
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);
          p.speedLineAngle = angle;

          p.x += Math.cos(angle) * lineSpeed;
          p.y += Math.sin(angle) * lineSpeed;

          if (dist < 35 || p.y > height + 160 || p.y < -160 || p.x < -160 || p.x > width + 160) {
            const edge = Math.random();
            if (edge < 0.35) {
              // Top
              p.y = -Math.random() * 140 - 20;
              p.x = Math.random() * (width + 240) - 120;
            } else if (edge < 0.70) {
              // Bottom
              p.y = height + Math.random() * 140 + 20;
              p.x = Math.random() * (width + 240) - 120;
            } else if (edge < 0.85) {
              // Left
              p.x = -Math.random() * 120 - 20;
              p.y = Math.random() * (height + 240) - 120;
            } else {
              // Right
              p.x = width + Math.random() * 120 + 20;
              p.y = Math.random() * (height + 240) - 120;
            }
            p.speed = Math.random() * 6 + 6;
            p.randFactor = Math.random();
            p.baseAlpha = Math.random() * 0.4 + 0.6;
          }
        } else {
          // 1. Chạy song song chiều ngang ảnh (có hỗ trợ độ nghiêng Tilt Angle -45 -> 45 độ)
          const isLeftToRight = config.speedLineDirection === 'left-to-right';
          const tiltDeg = Math.max(-45, Math.min(45, config.speedLineTilt || 0));
          const tiltRad = (tiltDeg * Math.PI) / 180;
          const cosTilt = Math.cos(tiltRad);
          const sinTilt = Math.sin(tiltRad);

          const outOfBoundsY = (tiltDeg > 0 && p.y > height + 140) || (tiltDeg < 0 && p.y < -140);

          if (isLeftToRight) {
            p.x += cosTilt * lineSpeed;
            p.y += sinTilt * lineSpeed;
            if (p.x > width + 100 || outOfBoundsY) {
              p.x = -lineLen - Math.random() * 200 - 20;
              p.y = Math.random() * (height + 280) - 140;
              p.speed = Math.random() * 6 + 6;
              p.randFactor = Math.random();
              p.baseAlpha = Math.random() * 0.4 + 0.6;
            }
          } else {
            p.x -= cosTilt * lineSpeed;
            p.y += sinTilt * lineSpeed;
            if (p.x + lineLen < -100 || outOfBoundsY) {
              p.x = width + Math.random() * 200 + 20;
              p.y = Math.random() * (height + 280) - 140;
              p.speed = Math.random() * 6 + 6;
              p.randFactor = Math.random();
              p.baseAlpha = Math.random() * 0.4 + 0.6;
            }
          }
        }
      } else if (config.type === 'rainbow-bubbles' || config.type === 'bubbles') {
        p.y -= (p.speed * 0.4 + 1.2) * speedMult + beatKick * 1.8;
        p.x += isHighPerf ? p.vx * speedMult * 0.5 : (Math.sin(p.wobble || 0) * 1.2 + p.vx * speedMult * 0.5);
        if (!isHighPerf) p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.03);
        p.hue = (p.hue + 0.6) % 360;

        if (p.y < -60) {
          p.y = height + 40;
          p.x = Math.random() * width;
          p.hue = Math.random() * 360;
        }
      } else if (config.type === 'snow') {
        let baseDrift: number;
        let baseFall: number;

        if (isHighPerf) {
          // High-performance linear snowfall trajectory
          baseDrift = snowSin * ((p.speed || 3.2) * 1.4 + 1.2);
          baseFall = snowCos * ((p.speed || 3.2) * 0.45 + 1.2) + beatKick * 2.5;
          p.x += baseDrift * speedMult;
          p.y += Math.max(0.6, baseFall) * speedMult;
        } else {
          p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.025);
          p.angle = ((p.angle || 0) + (p.rotSpeed || 0.012) * speedMult);
          baseDrift = snowSin * ((p.speed || 3.2) * 1.4 + 1.2);
          const flutter = Math.sin(p.wobble) * (1.6 + beatKick * 1.4) * snowTurbulence;
          baseFall = snowCos * ((p.speed || 3.2) * 0.45 + 1.2) + beatKick * 2.5;
          p.x += (baseDrift + flutter + (p.vx || 0) * 0.4) * speedMult;
          p.y += Math.max(0.6, baseFall) * speedMult;
        }

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
        config.type !== 'spaghetti' &&
        config.type !== 'silk-ribbon' &&
        config.type !== 'speed-lines' &&
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

        if (isHighPerf) {
          // Ultra-fast clean direct line stroke without allocating gradients in the loop and zero shadowBlur
          const dropL = Math.max(12, (p.length || 24) * 0.9 * rainLenScale);
          const dx = rainSin * dropL;
          const dy = rainCos * dropL;
          ctx.beginPath();
          ctx.strokeStyle = rainColor;
          ctx.lineWidth = Math.max(1, p.size * 0.75 * sizeScale);
          ctx.lineCap = 'round';
          ctx.moveTo(p.x - dx, p.y - dy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.restore();
          continue;
        }

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

        if (isHighPerf) {
          // High-performance bubble: 1 translucent fill + 1 crisp stroke + 1 glint dot (skips expensive nested gradients)
          ctx.beginPath();
          ctx.arc(0, 0, bubbleRadius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${currentHue}, 80%, 75%, 0.18)`;
          ctx.fill();
          ctx.strokeStyle = `hsla(${currentHue}, 90%, 75%, 0.75)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Single small white glint dot
          ctx.beginPath();
          ctx.arc(-bubbleRadius * 0.35, -bubbleRadius * 0.35, Math.max(1, bubbleRadius * 0.1), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();
          continue;
        }

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
        if (!isHighPerf) {
          ctx.shadowColor = streakColor;
          ctx.shadowBlur = Math.min(15, depthRatio * 12 + beatKick * 8);
        }
        ctx.stroke();
        if (!isHighPerf) {
          ctx.shadowBlur = 0;
        }

        // Glowing Star Point Head
        ctx.beginPath();
        const headRadius = Math.max(0.8, depthRatio * 2.6);
        ctx.arc(screenX, screenY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

      } else if (config.type === 'spaghetti' || config.type === 'silk-ribbon') {
        // --- 3.5 MƯA MẢNH RUY BĂNG LỤA (SILK RIBBON RAIN - UPGRADED FROM SPAGHETTI) ---
        const baseRibbonLen = config.ribbonLength !== undefined ? config.ribbonLength : 160;
        const ribbonLength = Math.max(25, (baseRibbonLen * (0.8 + (p.randFactor || 0.5) * 0.4) + p.size * 10) * (config.sizeScale || 1.0) * (1 + (config.reactiveToBeat ? beatKick * 0.25 : 0)));
        const thickness = Math.max(3, (config.ribbonThickness || 8) * (config.sizeScale || 1.0));
        const twistMult = config.ribbonTwist !== undefined ? config.ribbonTwist : 1.8;
        const phase = p.wobble || 0;
        const colorMode = config.colorMode || 'custom';

        let ribbonColor = config.color || '#f472b6';
        let glowColor = config.secondaryColor || '#ec4899';
        if (colorMode === 'rainbow') {
          ribbonColor = `hsl(${p.hue}, 95%, 68%)`;
          glowColor = `hsl(${p.hue}, 90%, 55%)`;
        } else if (colorMode === 'fire') {
          ribbonColor = `hsl(${Math.min(50, 18 + (p.hue % 30))}, 100%, 65%)`;
          glowColor = '#ef4444';
        } else if (colorMode === 'neon-pulse') {
          ribbonColor = '#38bdf8';
          glowColor = '#ec4899';
        } else if (colorMode === 'audio-reactive') {
          const reactiveHue = Math.floor((bassIntensity * 180 + trebleIntensity * 140 + p.hue) % 360);
          ribbonColor = `hsl(${reactiveHue}, 95%, 65%)`;
          glowColor = `hsl(${reactiveHue}, 90%, 50%)`;
        }

        const startY = p.y - ribbonLength;
        const endY = p.y;
        const segments = isHighPerf ? 6 : Math.min(18, Math.max(10, Math.floor(ribbonLength / 22)));

        if (isHighPerf) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, startY);
          ctx.quadraticCurveTo(p.x + Math.sin(phase) * 14, (startY + endY) / 2, p.x, endY);
          ctx.strokeStyle = ribbonColor;
          ctx.lineWidth = thickness;
          ctx.stroke();
          ctx.restore();
          continue;
        }

        ctx.save();
        const glowAmount = (config.ribbonGlow !== undefined ? config.ribbonGlow : (config.glowIntensity !== undefined ? config.glowIntensity : 15)) + beatKick * 12;
        if (glowAmount > 0) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = glowAmount;
        }

        // Build 3D twisting silk ribbon quad strip
        const leftPoints: { x: number; y: number }[] = [];
        const rightPoints: { x: number; y: number }[] = [];

        for (let s = 0; s <= segments; s++) {
          const t = s / segments;
          const curY = startY + t * ribbonLength;
          const wave = Math.sin(phase + t * Math.PI * 2.5 * twistMult) * (15 + beatKick * 8);
          const twistAngle = phase * 1.5 + t * Math.PI * 3.5 * twistMult;
          // Flattening factor simulating 3D rotation of a flat ribbon band
          const curWidth = thickness * (0.3 + 0.7 * Math.abs(Math.cos(twistAngle))) * (1 - Math.pow(t - 0.5, 2) * 0.35);
          const centerX = p.x + wave;

          leftPoints.push({ x: centerX - curWidth * 0.5, y: curY });
          rightPoints.push({ x: centerX + curWidth * 0.5, y: curY });
        }

        // Draw flowing silk ribbon body
        ctx.beginPath();
        if (leftPoints.length > 0) {
          ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
          for (let i = 1; i < leftPoints.length; i++) {
            ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
          }
          for (let i = rightPoints.length - 1; i >= 0; i--) {
            ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
          }
          ctx.closePath();
        }

        // Luxurious silky sheen linear gradient
        const ribbonGrad = ctx.createLinearGradient(p.x, startY, p.x, endY);
        ribbonGrad.addColorStop(0, ribbonColor);
        ribbonGrad.addColorStop(0.5, glowColor);
        ribbonGrad.addColorStop(1, ribbonColor);
        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Edge hem lines for high-end silk fabric effect
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let i = 0; i < leftPoints.length; i++) {
          if (i === 0) ctx.moveTo(leftPoints[i].x, leftPoints[i].y);
          else ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
        }
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < rightPoints.length; i++) {
          if (i === 0) ctx.moveTo(rightPoints[i].x, rightPoints[i].y);
          else ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
        }
        ctx.stroke();

        ctx.restore();
      } else if (config.type === 'speed-lines') {
        // --- 3.5B ĐƯỜNG VẠCH TỐC ĐỘ (SPEED LINES) LẶP LẠI ---
        const isCenterMode = config.speedLineMode === 'converge-center';
        const baseLen = config.speedLineLength || 140;
        const randRange = (config.speedLineRandomLength !== undefined ? config.speedLineRandomLength : 55) / 100;
        const lineLen = Math.max(25, baseLen * (1 + ((p.randFactor || 0.5) - 0.5) * 2 * randRange));
        const lineWidth = Math.max(1, (config.speedLineWidth || 2.5) * (config.sizeScale || 1.0));
        const blurAmount = config.speedLineBlur !== undefined ? config.speedLineBlur : 5;
        const colorMode = config.colorMode || 'custom';

        let lineColor = config.color || '#38bdf8';
        let glowColor = config.secondaryColor || '#0284c7';
        if (colorMode === 'rainbow') {
          lineColor = `hsl(${p.hue}, 95%, 68%)`;
          glowColor = `hsl(${p.hue}, 90%, 55%)`;
        } else if (colorMode === 'fire') {
          lineColor = `hsl(${Math.min(50, 15 + (p.hue % 35))}, 100%, 65%)`;
          glowColor = '#ef4444';
        } else if (colorMode === 'neon-pulse') {
          lineColor = '#38bdf8';
          glowColor = '#ec4899';
        } else if (colorMode === 'audio-reactive') {
          const reactiveHue = Math.floor((bassIntensity * 180 + trebleIntensity * 140 + p.hue) % 360);
          lineColor = `hsl(${reactiveHue}, 95%, 65%)`;
          glowColor = `hsl(${reactiveHue}, 90%, 50%)`;
        }

        ctx.save();
        ctx.lineCap = 'round';

        if (!isHighPerf && blurAmount > 0) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = blurAmount + beatKick * 6;
        }

        if (isCenterMode) {
          // 2. Chạy theo chiều đứng về tâm (Anime Action Focus Lines)
          const angle = p.speedLineAngle !== undefined ? p.speedLineAngle : Math.PI / 2;
          const headX = p.x;
          const headY = p.y;
          const tailX = p.x - Math.cos(angle) * lineLen;
          const tailY = p.y - Math.sin(angle) * lineLen;

          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.4, glowColor);
          grad.addColorStop(1, lineColor);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          // Bright laser head dot
          if (!isHighPerf && lineWidth > 2) {
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(headX, headY, lineWidth * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        } else {
          // 1. Chạy song song chiều ngang ảnh (Horizontal Parallel Lines có hỗ trợ góc nghiêng Tilt Angle -45 -> 45 độ)
          const isLeftToRight = config.speedLineDirection === 'left-to-right';
          const tiltDeg = Math.max(-45, Math.min(45, config.speedLineTilt || 0));
          const tiltRad = (tiltDeg * Math.PI) / 180;
          const cosTilt = Math.cos(tiltRad);
          const sinTilt = Math.sin(tiltRad);

          const headX = p.x;
          const headY = p.y;
          const tailX = isLeftToRight ? p.x - cosTilt * lineLen : p.x + cosTilt * lineLen;
          const tailY = p.y - sinTilt * lineLen;

          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.35, glowColor);
          grad.addColorStop(1, lineColor);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          // High-speed leading streak highlight
          if (!isHighPerf && lineWidth > 2) {
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(headX, headY, lineWidth * 0.55, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          }
        }

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

        if (!isHighPerf) {
          const baseGlow = config.glowIntensity !== undefined ? config.glowIntensity : 14;
          const glowBlur = baseGlow + (isBassFlash ? beatKick * flashBoost * 18 : beatKick * 10);
          if (glowBlur > 0) {
            ctx.shadowBlur = glowBlur;
            ctx.shadowColor = glowColor;
          }
        }

        // Draw outer neon stroke dash with rounded caps
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.moveTo(-dashLen / 2, 0);
        ctx.lineTo(dashLen / 2, 0);
        ctx.strokeStyle = dashColor;
        ctx.lineWidth = thickness;
        ctx.stroke();

        if (!isHighPerf) {
          // Draw inner bright intense core highlight
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(-dashLen * 0.32, 0);
          ctx.lineTo(dashLen * 0.32, 0);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = Math.max(1, thickness * 0.4);
          ctx.stroke();
        }

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

        if (isHighPerf) {
          // Fast snow rendering: simple soft circle or 4-point crosslet without multi-branching fractals or radial gradients
          const currentFlakeType = p.flakeType || (config.snowFlakeType === 'mixed' || !config.snowFlakeType ? 'crystal' : config.snowFlakeType);
          if (currentFlakeType === 'crystal' || currentFlakeType === 'glitter') {
            const crossR = Math.max(2.5, flakeR * 0.85);
            ctx.strokeStyle = flakeColor;
            ctx.lineWidth = Math.max(1, 1.4 * sizeScale);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-crossR, 0);
            ctx.lineTo(crossR, 0);
            ctx.moveTo(0, -crossR);
            ctx.lineTo(0, crossR);
            ctx.stroke();
            // Tiny center bead
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(1, crossR * 0.25), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          } else {
            // Soft flurry disc
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(2, flakeR * 0.85), 0, Math.PI * 2);
            ctx.fillStyle = flakeColor;
            ctx.fill();
          }
          ctx.restore();
          continue;
        }

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
        const defaultShape: ParticleShape = config.type === 'dust' ? 'silk-fluff' : (config.type === 'stars' ? 'star' : 'circle');
        const shape: ParticleShape = config.shape || defaultShape;
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

        // Glow effect & Fluffy Silk Ball halo
        const isFluffExplicitlyDisabled = config.silkFluffGlow === false;
        const isFluff = !isFluffExplicitlyDisabled && (
          Boolean(config.silkFluffGlow) ||
          shape === 'silk-fluff' ||
          ((config.type === 'dust' || (config.type === 'stars' && shape === 'circle')) && shape === 'circle')
        );

        const baseGlow = isFluffExplicitlyDisabled
          ? 0
          : (config.particleGlowRadius !== undefined ? config.particleGlowRadius : (config.glowIntensity !== undefined ? config.glowIntensity : 18));
        const glowBlur = (isFluff ? baseGlow * 1.5 : baseGlow) + (isBassFlash ? beatKick * flashBoost * 22 : 0);

        if (!isHighPerf && glowBlur > 0 && !isFluffExplicitlyDisabled) {
          ctx.shadowBlur = glowBlur;
          ctx.shadowColor = particleColor;
        } else {
          ctx.shadowBlur = 0;
        }

        // Render Fluffy Silk Ball or Standard Geometric Particle Shape
        if (isFluff && !isFluffExplicitlyDisabled && (shape === 'silk-fluff' || shape === 'circle')) {
          // --- FLUFFY SILK BALL (QUẢ BÓNG TƠ PHÁT SÁNG MỜ VIỀN MỀM MẠI) ---
          const fluffRadius = Math.max(radius * 1.4, radius + baseGlow * 0.75);
          const fluffGrad = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, fluffRadius);
          fluffGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          fluffGrad.addColorStop(0.25, particleColor);
          fluffGrad.addColorStop(0.6, particleColor);
          fluffGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.22)');
          fluffGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = fluffGrad;
          ctx.beginPath();
          ctx.arc(0, 0, fluffRadius, 0, Math.PI * 2);
          ctx.fill();

          // Delicate fine silk fuzz wisps for realistic wool/silk pompom appearance
          if (!isHighPerf && baseGlow >= 6) {
            ctx.shadowBlur = 0;
            const strands = 7;
            const wobbleAng = (p.wobble || 0) * 0.4;
            ctx.lineWidth = 0.75;
            for (let si = 0; si < strands; si++) {
              const ang = (si * Math.PI * 2) / strands + wobbleAng;
              ctx.beginPath();
              ctx.moveTo(Math.cos(ang) * radius * 0.35, Math.sin(ang) * radius * 0.35);
              const cpX = Math.cos(ang + 0.4) * (radius * 1.25);
              const cpY = Math.sin(ang + 0.4) * (radius * 1.25);
              const endX = Math.cos(ang + 0.15) * (fluffRadius * 0.9);
              const endY = Math.sin(ang + 0.15) * (fluffRadius * 0.9);
              ctx.quadraticCurveTo(cpX, cpY, endX, endY);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.stroke();
            }
          }
        } else {
          // Draw the selected geometric shape cleanly without fluffy aura
          this.drawParticleShape(ctx, radius, shape, particleColor);
        }

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

      case 'silk-fluff': {
        const fluffGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.8);
        fluffGrad.addColorStop(0, '#ffffff');
        fluffGrad.addColorStop(0.25, color);
        fluffGrad.addColorStop(0.6, color);
        fluffGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.2)');
        fluffGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fluffGrad;
        ctx.arc(0, 0, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
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
      const items = this.getTrackDetailItems(track, userScale);
      let totalTextHeight = 0;
      const lineHeights: number[] = [];
      for (let i = 0; i < items.length; i++) {
        const lh = items[i].fontSize * 1.25;
        lineHeights.push(lh);
        totalTextHeight += lh + (i < items.length - 1 ? 4 * userScale : 0);
      }

      const cardH = Math.max(90 * cardScale, totalTextHeight + 24 * cardScale);
      const cardW = Math.min(width * 0.85, 440) * cardScale;
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
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
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
      const maxTextW = cardW - imgSize - 30 * cardScale;
      let curTextY = cardY + (cardH - totalTextHeight) / 2;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const lh = lineHeights[i];
        this.renderTrackTextLine(
          ctx,
          item.text,
          textX,
          curTextY + lh / 2,
          maxTextW,
          {
            fontFamily: item.fontFamily,
            fontStyle: item.fontStyle,
            fontSize: item.fontSize,
            fontEffect: item.fontEffect,
            color: item.color,
            accentColor: track.accentColor || '#f97316',
            beatIntensity,
            alignment: 'left',
          }
        );
        curTextY += lh + 4 * userScale;
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

        const logoAnim = track.logoAnimation || 'none';
        const logoSpeed = track.logoAnimationSpeed !== undefined ? track.logoAnimationSpeed : 1.0;
        if (logoAnim === 'circular-spin') {
          const angle = (performance.now() / 1000) * logoSpeed * 1.5;
          ctx.rotate(angle);
        } else if (logoAnim === 'vertical-spin-3d') {
          const angle = (performance.now() / 1000) * logoSpeed * 2.0;
          ctx.scale(Math.cos(angle), 1);
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
    } else if (track.cardStyle === 'horizontal-rounded-card') {
      // --- NEW BADGE STYLE: Horizontal Card with Thick Rounded Cover Frame & 3-Tier Track Details ---
      const items = this.getTrackDetailItems(track, userScale);
      const boxSize = Math.min(width, height) * 0.20 * cardScale;
      const radius = Math.min(boxSize * 0.38, (track.badgeBorderRadius !== undefined ? track.badgeBorderRadius : 26) * userScale);
      const borderW = Math.max(2, (track.badgeBorderWidth !== undefined ? track.badgeBorderWidth : 6) * userScale);
      const borderColor = track.badgeBorderColor || track.accentColor || '#f97316';
      const gap = (track.badgeTextGap !== undefined ? track.badgeTextGap : 24) * userScale;

      ctx.save();
      ctx.translate(centerX, centerY + offsetY);
      if (tiltAngle !== 0) ctx.rotate(tiltAngle);
      ctx.scale(scaleBoostX, scaleBoostY);

      // Measure max text width and calculate heights
      let maxTextW = 0;
      let totalTextH = 0;
      const itemSpacings: number[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const { font, isUpper } = this.getCanvasFont(item.fontStyle, item.fontSize, item.fontFamily, item.fontWeight, item.isItalic, item.isUppercase);
        ctx.font = font;
        const measureText = isUpper ? item.text.toUpperCase() : item.text;
        const m = ctx.measureText(measureText).width;
        if (m > maxTextW) maxTextW = m;

        const lineH = item.fontSize * 1.25;
        totalTextH += lineH;
        if (i < items.length - 1) {
          const spacing = this.getItemGap(items[i].key, items[i + 1].key, track, userScale);
          totalTextH += spacing;
          itemSpacings.push(spacing);
        }
      }

      const totalCardW = boxSize + gap + Math.max(maxTextW, 80 * userScale);
      const startX = -totalCardW / 2;

      // Optional backdrop container if boxBackground is enabled
      if (track.boxBackground) {
        const padX = 18 * userScale;
        const padY = 16 * userScale;
        const bgW = totalCardW + padX * 2;
        const bgH = Math.max(boxSize, totalTextH) + padY * 2;
        ctx.beginPath();
        ctx.roundRect(startX - padX, -bgH / 2, bgW, bgH, 18 * userScale);
        ctx.fillStyle = track.boxBgColor || 'rgba(0, 0, 0, 0.65)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 16;
        ctx.fill();
      }

      // 1. Cover Box on the Left
      const coverX = startX;
      const coverY = -boxSize / 2;

      // Outer glow for beat jump / accent
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, boxSize, boxSize, radius);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowColor = borderColor;
      ctx.shadowBlur = track.badgeBeatGlow ? 28 + beatIntensity * 32 : 20 + beatIntensity * 14;
      ctx.fill();
      ctx.restore();

      // Clipped Cover Image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, boxSize, boxSize, radius);
      ctx.clip();

      const activeImg = (this.coverImage && this.coverImage.complete && this.coverImage.naturalWidth > 0)
        ? this.coverImage
        : ((this.badgePngImage && this.badgePngImage.complete && this.badgePngImage.naturalWidth > 0) ? this.badgePngImage : null);

      if (activeImg) {
        ctx.drawImage(activeImg, coverX, coverY, boxSize, boxSize);
      } else {
        const grad = ctx.createLinearGradient(coverX, coverY, coverX + boxSize, coverY + boxSize);
        grad.addColorStop(0, borderColor);
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(coverX, coverY, boxSize, boxSize);

        // Placeholder icon
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${28 * userScale}px sans-serif`;
        ctx.fillText('♪', coverX + boxSize / 2, coverY + boxSize / 2);
      }
      ctx.restore();

      // Outer Rounded Border
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(coverX, coverY, boxSize, boxSize, radius);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderW;
      ctx.stroke();
      ctx.restore();

      // 2. Track Details on the Right (Left-aligned, vertically centered with the cover)
      const textX = coverX + boxSize + gap;
      let curY = -totalTextH / 2;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const lineH = item.fontSize * 1.25;
        const lineCenterY = curY + lineH / 2;

        this.renderTrackTextLine(
          ctx,
          item.text,
          textX,
          lineCenterY,
          width * 0.6,
          {
            fontFamily: item.fontFamily,
            fontStyle: item.fontStyle,
            fontWeight: item.fontWeight,
            isItalic: item.isItalic,
            isUppercase: item.isUppercase,
            fontSize: item.fontSize,
            fontEffect: item.fontEffect,
            color: item.color,
            accentColor: track.accentColor || borderColor,
            beatIntensity,
            alignment: 'left',
          }
        );

        curY += lineH + (itemSpacings[i] || 0);
      }

      ctx.restore();
    }

    // Render Title, Subtitle, & Artist for vinyl, circular badge, rotating badge, logo badge, or minimal tag
    if (track.cardStyle === 'vinyl' || track.cardStyle === 'circular-badge' || track.cardStyle === 'rotating-badge' || track.cardStyle === 'logo-badge' || track.cardStyle === 'minimal-tag') {
      const items = this.getTrackDetailItems(track, userScale);

      if (items.length > 0) {
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

        let drawX = centerX;
        if (alignment === 'left') drawX = centerX - (width * 0.38);
        if (alignment === 'right') drawX = centerX + (width * 0.38);

        // Measure heights & widths for layout
        let maxW = 0;
        let totalH = 0;
        const lineHeights: number[] = [];
        const gaps: number[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const { font, isUpper } = this.getCanvasFont(item.fontStyle, item.fontSize, item.fontFamily, item.fontWeight, item.isItalic, item.isUppercase);
          ctx.font = font;
          const measureText = isUpper ? item.text.toUpperCase() : item.text;
          const w = ctx.measureText(measureText).width;
          if (w > maxW) maxW = w;

          const lh = item.fontSize * 1.25;
          lineHeights.push(lh);
          totalH += lh;
          if (i < items.length - 1) {
            const g = this.getItemGap(items[i].key, items[i + 1].key, track, userScale);
            gaps.push(g);
            totalH += g;
          }
        }

        // Optional Frosted Background Box for minimal tag or texts
        if (track.boxBackground) {
          ctx.save();
          const boxPadX = 32 * userScale;
          const boxPadY = 16 * userScale;
          const boxW = maxW + boxPadX;
          const boxH = totalH + boxPadY;

          let boxLeft = drawX - boxW / 2;
          if (alignment === 'left') boxLeft = drawX - 16 * userScale;
          if (alignment === 'right') boxLeft = drawX - boxW + 16 * userScale;

          ctx.beginPath();
          ctx.roundRect(boxLeft, textY - boxH / 2, boxW, boxH, 14 * userScale);
          ctx.fillStyle = track.boxBgColor || 'rgba(0, 0, 0, 0.65)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.restore();
        }

        // Render each item in order
        let curY = textY - totalH / 2;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const lh = lineHeights[i];
          const lineCenterY = curY + lh / 2;

          this.renderTrackTextLine(
            ctx,
            item.text,
            drawX,
            lineCenterY,
            width * 0.85,
            {
              fontFamily: item.fontFamily,
              fontStyle: item.fontStyle,
              fontWeight: item.fontWeight,
              isItalic: item.isItalic,
              isUppercase: item.isUppercase,
              fontSize: item.fontSize,
              fontEffect: item.fontEffect,
              color: item.color,
              accentColor: track.accentColor || '#f97316',
              beatIntensity,
              alignment,
            }
          );

          curY += lh + (gaps[i] || 0);
        }
      }
    }

    ctx.restore();
  }

  /**
   * Helper to retrieve dynamic gap between track detail items (subtitle, title, artist)
   */
  private getItemGap(
    keyA: TrackDetailElement,
    keyB: TrackDetailElement,
    track: TrackMetadata,
    userScale: number
  ): number {
    const pair = `${keyA}-${keyB}`;
    const subTitleGap = (track.subtitleTitleGap !== undefined ? track.subtitleTitleGap : 6) * userScale;
    const titleArtGap = (track.titleArtistGap !== undefined ? track.titleArtistGap : 8) * userScale;

    if (pair === 'subtitle-title' || pair === 'title-subtitle') {
      return subTitleGap;
    }
    if (pair === 'title-artist' || pair === 'artist-title') {
      return titleArtGap;
    }
    return Math.max(subTitleGap, titleArtGap);
  }

  /**
   * Helper to retrieve track detail items according to trackDetailsOrder
   */
  private getTrackDetailItems(track: TrackMetadata, userScale: number): {
    key: TrackDetailElement;
    text: string;
    fontFamily: string;
    fontStyle: TrackFontStyle;
    fontWeight?: TrackFontWeight | string;
    isItalic?: boolean;
    isUppercase?: boolean;
    fontSize: number;
    fontEffect: TrackFontEffect;
    color: string;
  }[] {
    const order: TrackDetailElement[] = track.trackDetailsOrder && track.trackDetailsOrder.length > 0
      ? track.trackDetailsOrder
      : ['subtitle', 'title', 'artist'];

    const items: {
      key: TrackDetailElement;
      text: string;
      fontFamily: string;
      fontStyle: TrackFontStyle;
      fontWeight?: TrackFontWeight | string;
      isItalic?: boolean;
      isUppercase?: boolean;
      fontSize: number;
      fontEffect: TrackFontEffect;
      color: string;
    }[] = [];

    for (const key of order) {
      if (key === 'subtitle' && track.showSubtitle !== false && track.subtitle) {
        items.push({
          key: 'subtitle',
          text: track.subtitle,
          fontFamily: track.subtitleFontFamily || track.fontFamily || 'Be Vietnam Pro',
          fontStyle: track.subtitleFontStyle || 'normal',
          fontWeight: track.subtitleFontWeight || (track.subtitleFontStyle === 'bold' || track.subtitleFontStyle === 'bold-italic' ? 'bold' : 'normal'),
          isItalic: track.subtitleItalic !== undefined ? track.subtitleItalic : (track.subtitleFontStyle === 'italic' || track.subtitleFontStyle === 'bold-italic'),
          isUppercase: track.subtitleUppercase !== undefined ? track.subtitleUppercase : (track.subtitleFontStyle === 'uppercase'),
          fontSize: (track.subtitleFontSize || 13) * userScale,
          fontEffect: track.subtitleFontEffect || 'none',
          color: track.subtitleColor || track.accentColor || '#fb923c',
        });
      } else if (key === 'title' && track.showTitle !== false && track.title) {
        items.push({
          key: 'title',
          text: track.title,
          fontFamily: track.titleFontFamily || track.fontFamily || 'Be Vietnam Pro',
          fontStyle: track.titleFontStyle || 'bold',
          fontWeight: track.titleFontWeight || (track.titleFontStyle === 'bold' || track.titleFontStyle === 'bold-italic' || track.titleFontStyle === 'uppercase' ? 'bold' : 'normal'),
          isItalic: track.titleItalic !== undefined ? track.titleItalic : (track.titleFontStyle === 'italic' || track.titleFontStyle === 'bold-italic'),
          isUppercase: track.titleUppercase !== undefined ? track.titleUppercase : (track.titleFontStyle === 'uppercase'),
          fontSize: (track.titleFontSize || 24) * userScale,
          fontEffect: track.titleFontEffect || 'none',
          color: track.textColor || '#ffffff',
        });
      } else if (key === 'artist' && track.showArtist !== false && track.artist) {
        items.push({
          key: 'artist',
          text: track.artist,
          fontFamily: track.artistFontFamily || track.fontFamily || 'Be Vietnam Pro',
          fontStyle: track.artistFontStyle || 'normal',
          fontWeight: track.artistFontWeight || (track.artistFontStyle === 'bold' || track.artistFontStyle === 'bold-italic' ? 'bold' : 'normal'),
          isItalic: track.artistItalic !== undefined ? track.artistItalic : (track.artistFontStyle === 'italic' || track.artistFontStyle === 'bold-italic'),
          isUppercase: track.artistUppercase !== undefined ? track.artistUppercase : (track.artistFontStyle === 'uppercase'),
          fontSize: (track.artistFontSize || 15) * userScale,
          fontEffect: track.artistFontEffect || 'none',
          color: track.artistColor || 'rgba(255, 255, 255, 0.8)',
        });
      }
    }

    return items;
  }

  /**
   * Helper to construct valid CSS font string for canvas 2D context
   * Ensures 100% compliance with CSS font shorthand standard
   */
  private getCanvasFont(
    fontStyle: TrackFontStyle | string | undefined,
    fontSize: number,
    fontFamily: string,
    customWeight?: TrackFontWeight | string,
    customItalic?: boolean,
    customUppercase?: boolean
  ): { font: string; isUpper: boolean; weight: string; style: string } {
    let style = 'normal';
    let weight = '400';
    let isUpper = false;

    if (customWeight) {
      switch (customWeight) {
        case 'normal': weight = '400'; break;
        case '500': weight = '500'; break;
        case '600': weight = '600'; break;
        case 'bold': weight = '700'; break;
        case '900': weight = '900'; break;
        default: weight = String(customWeight); break;
      }
    } else {
      switch (fontStyle) {
        case 'italic':
          style = 'italic';
          weight = '400';
          break;
        case 'bold':
          style = 'normal';
          weight = '700';
          break;
        case 'bold-italic':
          style = 'italic';
          weight = '700';
          break;
        case 'uppercase':
          style = 'normal';
          weight = '700';
          isUpper = true;
          break;
        default:
          style = 'normal';
          weight = '400';
          break;
      }
    }

    if (customItalic !== undefined) {
      style = customItalic ? 'italic' : 'normal';
    }
    if (customUppercase !== undefined) {
      isUpper = !!customUppercase;
    }

    const safeSize = Math.max(6, Math.round(fontSize));
    const safeFamily = fontFamily || 'Be Vietnam Pro';
    const font = `${style} ${weight} ${safeSize}px '${safeFamily}', sans-serif`;
    return { font, isUpper, weight, style };
  }

  /**
   * Helper to render a single track text line with custom font style, effect, and colors
   */
  private renderTrackTextLine(
    ctx: CanvasContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    options: {
      fontFamily: string;
      fontStyle: TrackFontStyle;
      fontWeight?: TrackFontWeight | string;
      isItalic?: boolean;
      isUppercase?: boolean;
      fontSize: number;
      fontEffect: TrackFontEffect;
      color: string;
      accentColor: string;
      beatIntensity: number;
      alignment: 'left' | 'center' | 'right';
    }
  ) {
    if (!text) return;
    const { fontFamily, fontStyle, fontWeight, isItalic, isUppercase, fontSize, fontEffect, color, accentColor, beatIntensity, alignment } = options;

    ctx.save();
    ctx.textAlign = alignment;
    ctx.textBaseline = 'middle';

    const { font, isUpper } = this.getCanvasFont(fontStyle, fontSize, fontFamily, fontWeight, isItalic, isUppercase);
    const displayText = isUpper ? text.toUpperCase() : text;

    ctx.font = font;

    switch (fontEffect) {
      case 'neon-glow': {
        ctx.shadowColor = accentColor || color;
        ctx.shadowBlur = 14 + beatIntensity * 18;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(displayText, x, y, maxWidth);

        ctx.shadowBlur = 26 + beatIntensity * 22;
        ctx.fillStyle = color;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
      }

      case 'double-stroke': {
        ctx.lineWidth = Math.max(3.5, fontSize * 0.22);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineJoin = 'round';
        ctx.strokeText(displayText, x, y, maxWidth);

        ctx.lineWidth = Math.max(1.6, fontSize * 0.09);
        ctx.strokeStyle = accentColor || '#f97316';
        ctx.strokeText(displayText, x, y, maxWidth);

        ctx.fillStyle = color;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
      }

      case '3d-shadow': {
        const shadowSteps = 5;
        for (let s = shadowSteps; s >= 1; s--) {
          ctx.fillStyle = s === 1 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.22)';
          ctx.fillText(displayText, x + s * 1.5, y + s * 1.5, maxWidth);
        }
        ctx.fillStyle = color;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
      }

      case 'gradient': {
        const grad = ctx.createLinearGradient(0, y - fontSize * 0.5, 0, y + fontSize * 0.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.45, color);
        grad.addColorStop(1, accentColor || '#f97316');
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 8;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
      }

      case 'comic-pop': {
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.lineWidth = Math.max(4, fontSize * 0.24);
        ctx.strokeStyle = '#000000';
        ctx.strokeText(displayText, x, y, maxWidth);
        ctx.fillStyle = color;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
      }

      case 'metallic-chrome': {
        const chromeGrad = ctx.createLinearGradient(0, y - fontSize * 0.55, 0, y + fontSize * 0.45);
        chromeGrad.addColorStop(0, '#ffffff');
        chromeGrad.addColorStop(0.45, '#94a3b8');
        chromeGrad.addColorStop(0.52, '#0f172a');
        chromeGrad.addColorStop(1, '#e2e8f0');
        ctx.lineWidth = Math.max(2, fontSize * 0.12);
        ctx.strokeStyle = '#0f172a';
        ctx.strokeText(displayText, x, y, maxWidth);
        ctx.fillStyle = chromeGrad;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
      }

      case 'none':
      default: {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.fillText(displayText, x, y, maxWidth);
        break;
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

    if (pos === 'custom' || (track.logoPositionX !== undefined && track.logoPositionY !== undefined)) {
      const posX = track.logoPositionX !== undefined ? track.logoPositionX : 10;
      const posY = track.logoPositionY !== undefined ? track.logoPositionY : 10;
      x = (width * posX) / 100 - logoW / 2;
      y = (height * posY) / 100 - logoH / 2;
    } else if (pos === 'top-left') {
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

    const logoAnim = track.logoAnimation || 'none';
    const logoSpeed = track.logoAnimationSpeed !== undefined ? track.logoAnimationSpeed : 1.0;
    const centerX = x + logoW / 2;
    const centerY = y + logoH / 2;

    ctx.translate(centerX, centerY);

    if (logoAnim === 'circular-spin') {
      // 2D 360 degree circular rotation around center
      const angle = (performance.now() / 1000) * logoSpeed * 1.5;
      ctx.rotate(angle);
    } else if (logoAnim === 'vertical-spin-3d') {
      // 360 degree vertical axis spin (3D flip effect)
      const angle = (performance.now() / 1000) * logoSpeed * 2.0;
      const scaleX = Math.cos(angle);
      ctx.scale(scaleX, 1);
    }

    ctx.drawImage(this.logoImage, -logoW / 2, -logoH / 2, logoW, logoH);
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
      if (box.visible === false) continue;
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

        // Highlight playing track marked with '▶'
        if (line.startsWith('▶')) {
          ctx.save();
          ctx.fillStyle = box.glowColor || '#38bdf8';
          ctx.shadowColor = box.glowColor || '#38bdf8';
          ctx.shadowBlur = Math.max(8, (box.glowIntensity || 4) * 1.5);
          ctx.fillText(line, posX, lineY, maxAllowedWidth);
          ctx.restore();
        } else {
          ctx.fillText(line, posX, lineY, maxAllowedWidth);
        }
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
    if (!isBloomEnabled || effectiveGlow <= 2 || this.highPerformanceMode) {
      ctx.save();
      ctx.shadowBlur = this.highPerformanceMode ? 0 : effectiveGlow;
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

    if (!this.visReflectCanvas) {
      this.visReflectCanvas = document.createElement('canvas');
      this.visReflectCtx = this.visReflectCanvas.getContext('2d', { willReadFrequently: false });
    }
    if (this.visReflectCanvas.width !== width || this.visReflectCanvas.height !== height) {
      this.visReflectCanvas.width = width;
      this.visReflectCanvas.height = height;
    }
  }

  /**
   * Audio Visualizer Renderer with Chromatic Aberration & Vertical Reflection
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
    if (v.visible === false) return;

    const hasAberration = !!v.chromaticAberration;
    const hasReflection = !!v.verticalReflection;

    // Fast path: direct draw if neither chromatic aberration nor reflection is enabled
    if (!hasAberration && !hasReflection) {
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
    if (!this.visBufferCtx || !this.visBufferCanvas) {
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

    // 1. Clear primary offscreen buffer
    this.visBufferCtx.clearRect(0, 0, width, height);

    // 2. Render visualizer (with or without chromatic aberration) into visBufferCanvas
    if (hasAberration && this.visRedCtx && this.visCyanCtx && this.visRedCanvas && this.visCyanCanvas) {
      this.visRedCtx.clearRect(0, 0, width, height);
      this.visCyanCtx.clearRect(0, 0, width, height);

      // Render the primary visualizer onto the offscreen buffer
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

      // Calculate dynamic frequency-reactive shift
      const intensity = v.chromaticAberrationIntensity !== undefined ? v.chromaticAberrationIntensity : 0.55;
      const freqEnergy = (bassIntensity * 0.65 + trebleIntensity * 0.35);
      const beatKick = beatIntensity > 0.28 ? Math.pow(beatIntensity, 1.4) * 14 * intensity : 0;
      const randomJitter = beatIntensity > 0.45 && Math.random() < 0.4 ? (Math.random() - 0.5) * 18 * intensity : 0;
      const baseOffset = 2.0 * intensity;
      const shiftX = Math.max(1, baseOffset + freqEnergy * 20 * intensity + beatKick + randomJitter);
      const shiftY = (Math.sin(currentTime * 10) * 1.5 + (Math.random() - 0.5) * 2) * intensity * (0.3 + freqEnergy * 0.7);

      // Generate pure Red channel pass
      this.visRedCtx.drawImage(this.visBufferCanvas, 0, 0);
      this.visRedCtx.globalCompositeOperation = 'source-in';
      this.visRedCtx.fillStyle = '#ff0055';
      this.visRedCtx.fillRect(0, 0, width, height);
      this.visRedCtx.globalCompositeOperation = 'source-over';

      // Generate pure Cyan channel pass
      this.visCyanCtx.drawImage(this.visBufferCanvas, 0, 0);
      this.visCyanCtx.globalCompositeOperation = 'source-in';
      this.visCyanCtx.fillStyle = '#00f0ff';
      this.visCyanCtx.fillRect(0, 0, width, height);
      this.visCyanCtx.globalCompositeOperation = 'source-over';

      // Composite RGB into visBufferCtx
      this.visBufferCtx.save();
      this.visBufferCtx.globalCompositeOperation = 'screen';
      const splitAlpha = Math.min(0.95, 0.45 + intensity * 0.5 + freqEnergy * 0.3);
      this.visBufferCtx.globalAlpha = splitAlpha;
      this.visBufferCtx.drawImage(this.visRedCanvas, -shiftX, -shiftY);
      this.visBufferCtx.drawImage(this.visCyanCanvas, shiftX, shiftY);

      // Dynamic glitch horizontal slice displacement
      if (beatIntensity > 0.4 && Math.random() < 0.45 && intensity > 0.2) {
        const posY = (height * v.positionY) / 100;
        const numSlices = Math.min(4, Math.floor(2 + intensity * 3));
        for (let i = 0; i < numSlices; i++) {
          const sliceY = Math.max(0, posY - 100 + Math.random() * 200);
          const sliceH = Math.min(30, 6 + Math.random() * 18);
          const sliceShift = (Math.random() - 0.5) * 28 * intensity * beatIntensity;
          this.visBufferCtx.drawImage(
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
      this.visBufferCtx.restore();
    } else {
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
    }

    // 3. Draw primary visualizer to main canvas
    ctx.save();
    ctx.drawImage(this.visBufferCanvas, 0, 0);
    ctx.restore();

    // 4. Render Vertical Reflection if enabled
    if (hasReflection) {
      const axisY = (height * (v.reflectionPositionY !== undefined ? v.reflectionPositionY : v.positionY)) / 100;
      const opacity = Math.max(0.05, Math.min(1.0, v.reflectionOpacity !== undefined ? v.reflectionOpacity : 0.35));
      const useFade = v.reflectionFade !== false;

      if (this.visReflectCtx && this.visReflectCanvas && useFade) {
        this.visReflectCtx.clearRect(0, 0, width, height);

        // Draw flipped vertically across axisY
        this.visReflectCtx.save();
        this.visReflectCtx.translate(0, 2 * axisY);
        this.visReflectCtx.scale(1, -1);
        this.visReflectCtx.drawImage(this.visBufferCanvas, 0, 0);
        this.visReflectCtx.restore();

        // Clear anything above reflection axis
        this.visReflectCtx.save();
        this.visReflectCtx.globalCompositeOperation = 'destination-out';
        this.visReflectCtx.fillRect(0, 0, width, axisY);

        // Apply smooth linear gradient fade downwards from axis
        this.visReflectCtx.globalCompositeOperation = 'destination-in';
        const fadeDist = Math.max(80, height * 0.35);
        const grad = this.visReflectCtx.createLinearGradient(0, axisY, 0, Math.min(height, axisY + fadeDist));
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.6)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.visReflectCtx.fillStyle = grad;
        this.visReflectCtx.fillRect(0, axisY, width, height - axisY);
        this.visReflectCtx.restore();

        // Draw reflection buffer to main canvas
        ctx.save();
        ctx.globalAlpha = (ctx.globalAlpha || 1.0) * opacity;
        ctx.drawImage(this.visReflectCanvas, 0, 0);
        ctx.restore();
      } else {
        // Direct clipped flipped draw
        ctx.save();
        ctx.globalAlpha = (ctx.globalAlpha || 1.0) * opacity;
        ctx.beginPath();
        ctx.rect(0, axisY, width, height - axisY);
        ctx.clip();
        ctx.translate(0, 2 * axisY);
        ctx.scale(1, -1);
        ctx.drawImage(this.visBufferCanvas, 0, 0);
        ctx.restore();
      }
    }
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
    // Cap shadowBlur in high performance mode to avoid GPU rasterization overhead
    const effectiveGlow = this.highPerformanceMode
      ? Math.min(6, baseGlow * 0.25)
      : Math.max(0, baseGlow * (0.5 + bloomScale * 0.6) + pulseBoost);
    const glowTint = v.glowColor || v.primaryColor;

    ctx.shadowBlur = effectiveGlow;
    ctx.shadowColor = glowTint;

    const dataLength = freqData.length || 128;
    const barCount = Math.max(8, Math.min(v.barCount || 48, 160));
    const barWidth = Math.max(1, v.barWidth !== undefined ? v.barWidth : 6);
    const barGap = Math.max(0, v.barGap !== undefined ? v.barGap : 3);
    const barRoundness = Math.max(0, v.barRoundness !== undefined ? v.barRoundness : 2);
    const bpmAmpMultiplier = v.syncBpmPulse ? (0.95 + bpmPulse * 0.2) : 1.0;
    const amp = v.amplitude * (v.bassBoost ? 1 + bassIntensity * 0.45 : 1) * bpmAmpMultiplier;

    // Initialize Peak Arrays
    if (this.peakBars.length !== barCount) {
      this.peakBars = new Array(barCount).fill(0);
      this.peakVelocities = new Array(barCount).fill(0);
    }

    switch (v.type) {
      // 0. Simple Column Spectrum (Spectrum Cột Simple) - Clean minimalist vertical bars
      case 'spectrum-bars-simple': {
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;
        ctx.fillStyle = strokeOrFillStyle;
        ctx.beginPath();

        const roundRadius = Math.min(barRoundness, barWidth / 2);
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.25) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const barHeight = Math.max(3, (rawVal / 255) * 190 * amp * v.scale);

          const x = startX + i * (barWidth + barGap);
          const topY = posY - barHeight;
          ctx.roundRect(x, topY, barWidth, barHeight, roundRadius);
        }
        ctx.fill();
        break;
      }

      // 1. Classic Spectrum Bars with Falling Gravity Peak Dots
      case 'bars-peaks': {
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;
        ctx.fillStyle = strokeOrFillStyle;
        ctx.beginPath();

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

          const x = startX + i * (barWidth + barGap);
          const topY = posY - barHeight;
          ctx.roundRect(x, topY, barWidth, barHeight, barRoundness);
        }
        ctx.fill();

        // Batch falling peak caps in a single path
        ctx.save();
        ctx.fillStyle = v.secondaryColor || '#ffffff';
        ctx.shadowColor = v.secondaryColor || v.primaryColor;
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 8;
        ctx.beginPath();
        for (let i = 0; i < barCount; i++) {
          if (this.peakBars[i] > 4) {
            const x = startX + i * (barWidth + barGap);
            const peakDotY = posY - this.peakBars[i] - 5;
            ctx.roundRect(x, peakDotY, barWidth, 3, 1.5);
          }
        }
        ctx.fill();
        ctx.restore();
        break;
      }

      // 2. Mirrored Bars with Dual Falling Peak Dots
      case 'bars-mirrored-peaks': {
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;
        ctx.fillStyle = strokeOrFillStyle;
        ctx.beginPath();

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

          const x = startX + i * (barWidth + barGap);
          const topY = posY - barHeight / 2;
          ctx.roundRect(x, topY, barWidth, barHeight, barRoundness);
        }
        ctx.fill();

        // Dual peak caps: Top & Bottom batched in single path
        ctx.save();
        ctx.fillStyle = v.secondaryColor || '#ffffff';
        ctx.shadowColor = v.secondaryColor || v.primaryColor;
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 8;
        ctx.beginPath();
        for (let i = 0; i < barCount; i++) {
          if (this.peakBars[i] > 6) {
            const x = startX + i * (barWidth + barGap);
            // Top Cap
            ctx.roundRect(x, posY - this.peakBars[i] / 2 - 5, barWidth, 3, 1.5);
            // Bottom Cap
            ctx.roundRect(x, posY + this.peakBars[i] / 2 + 2, barWidth, 3, 1.5);
          }
        }
        ctx.fill();
        ctx.restore();
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

        // Glowing Peak Dots along curve batched in 1 path
        ctx.save();
        ctx.fillStyle = v.secondaryColor || '#ffffff';
        ctx.shadowBlur = this.highPerformanceMode ? 0 : Math.min(10, effectiveGlow * 0.8 + 4);
        ctx.shadowColor = v.secondaryColor || v.primaryColor;
        ctx.beginPath();
        for (let i = 0; i < curvePoints.length; i += 3) {
          if (posY - curvePoints[i].y > 10) {
            ctx.moveTo(curvePoints[i].x + 3.2, curvePoints[i].y);
            ctx.arc(curvePoints[i].x, curvePoints[i].y, 3.2, 0, Math.PI * 2);
          }
        }
        ctx.fill();
        ctx.restore();
        break;
      }

      // 4. Radial Spikes with Orbiting Peak Dots
      case 'radial-bars-peaks': {
        const radius = Math.min(width, height) * 0.22 * v.scale;
        const totalSpikes = barCount * 2;
        const angleStep = (Math.PI * 2) / totalSpikes;

        if (this.radialPeaks.length !== totalSpikes) {
          this.radialPeaks = new Array(totalSpikes).fill(0);
          this.radialVelocities = new Array(totalSpikes).fill(0);
        }

        ctx.fillStyle = strokeOrFillStyle;
        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = barWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();

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

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();

        // Orbit Peak Dots batched in 1 path
        ctx.save();
        ctx.fillStyle = v.secondaryColor || '#ffffff';
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 8;
        ctx.shadowColor = v.secondaryColor || v.primaryColor;
        ctx.beginPath();
        for (let i = 0; i < totalSpikes; i++) {
          if (this.radialPeaks[i] > 8) {
            const angle = i * angleStep - Math.PI / 2;
            const dotX = centerX + Math.cos(angle) * (radius + this.radialPeaks[i] + 7);
            const dotY = posY + Math.sin(angle) * (radius + this.radialPeaks[i] + 7);
            ctx.moveTo(dotX + 2.5, dotY);
            ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          }
        }
        ctx.fill();
        ctx.restore();
        break;
      }

      // 1. Classic Hardware Audio Equalizer (Mọc từ đáy lên trên, LED phân tầng cổ điển Studio Rack)
      case 'bars': {
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;

        // Glowing base ground rail with rack-mount look
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(startX - 10, posY, totalW + 20, 3, 1.5);
        ctx.fillStyle = v.primaryColor || '#ec4899';
        ctx.shadowColor = v.primaryColor || '#ec4899';
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 8;
        ctx.fill();

        // Floor reflection baseline (subtle mirror ground)
        ctx.beginPath();
        ctx.roundRect(startX - 4, posY + 4, totalW + 8, 1.5, 1);
        ctx.fillStyle = v.secondaryColor || '#8b5cf6';
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.restore();

        const pColor = v.primaryColor || '#10b981'; // Classic green/teal base
        const sColor = v.secondaryColor || '#f59e0b'; // Amber/yellow mid
        const tColor = v.tertiaryColor || '#ef4444'; // Red/crimson peak

        const segH = Math.max(3, Math.min(6, barWidth * 0.9));
        const segGap = 1.5;
        const totalSegStep = segH + segGap;
        const roundR = Math.min(barRoundness, 1.5);

        // Path batching for 3 LED segment tiers and peak caps
        const pPath = new Path2D();
        const sPath = new Path2D();
        const tPath = new Path2D();
        const peakPath = new Path2D();

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.35) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const barHeight = Math.max(5, (rawVal / 255) * 190 * amp * v.scale);

          // Update peak bar animation
          if (barHeight >= this.peakBars[i]) {
            this.peakBars[i] = barHeight;
            this.peakVelocities[i] = 0;
          } else {
            this.peakVelocities[i] += 0.38;
            this.peakBars[i] = Math.max(0, this.peakBars[i] - this.peakVelocities[i]);
          }

          const x = startX + i * (barWidth + barGap);
          const numSegments = Math.max(1, Math.floor(barHeight / totalSegStep));

          for (let s = 0; s < numSegments; s++) {
            const segY = posY - (s + 1) * totalSegStep;
            const progress = s / Math.max(1, numSegments);

            if (progress > 0.82) {
              tPath.roundRect(x, segY, barWidth, segH, roundR);
            } else if (progress > 0.48) {
              sPath.roundRect(x, segY, barWidth, segH, roundR);
            } else {
              pPath.roundRect(x, segY, barWidth, segH, roundR);
            }
          }

          // Floating Peak Cap Line
          if (this.peakBars[i] > 6) {
            const peakY = posY - this.peakBars[i] - 4;
            peakPath.roundRect(x, peakY, barWidth, 2.5, 1);
          }
        }

        ctx.fillStyle = pColor;
        ctx.fill(pPath);

        ctx.fillStyle = sColor;
        ctx.fill(sPath);

        ctx.save();
        ctx.fillStyle = tColor;
        ctx.shadowColor = tColor;
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 6;
        ctx.fill(tPath);

        ctx.fillStyle = tColor || '#ffffff';
        ctx.shadowColor = tColor || '#ffffff';
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 8;
        ctx.fill(peakPath);
        ctx.restore();
        break;
      }

      // 2. Symmetrical Dual-Sided Waveform (Sóng cột đối xứng trên dưới tách đôi từ trục phát quang)
      case 'bars-mirrored': {
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;
        const centerGap = 6; // Distinct separation gap between upper and lower halves

        // Glowing center symmetry axis beam running across the middle
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(startX - 12, posY - 1.5, totalW + 24, 3, 1.5);
        ctx.fillStyle = v.secondaryColor || '#38bdf8';
        ctx.shadowColor = v.secondaryColor || '#38bdf8';
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 10 + beatIntensity * 8;
        ctx.fill();

        // Inner laser core wire
        ctx.beginPath();
        ctx.roundRect(startX - 6, posY - 0.5, totalW + 12, 1, 0.5);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Pre-create gradients once outside the loop instead of 96 allocations per frame
        const maxExpectedH = Math.max(80, 110 * amp * v.scale);
        const upperGrad = ctx.createLinearGradient(0, posY - centerGap / 2, 0, posY - centerGap / 2 - maxExpectedH);
        upperGrad.addColorStop(0, v.primaryColor || '#ec4899');
        upperGrad.addColorStop(0.65, v.secondaryColor || '#8b5cf6');
        upperGrad.addColorStop(1, v.tertiaryColor || '#38bdf8');

        const lowerGrad = ctx.createLinearGradient(0, posY + centerGap / 2, 0, posY + centerGap / 2 + maxExpectedH);
        lowerGrad.addColorStop(0, v.primaryColor || '#ec4899');
        lowerGrad.addColorStop(0.65, v.secondaryColor || '#8b5cf6');
        lowerGrad.addColorStop(1, v.tertiaryColor || '#38bdf8');

        const upperPath = new Path2D();
        const lowerPath = new Path2D();
        const dotPath = new Path2D();
        const dotR = Math.max(1.2, Math.min(2.5, barWidth * 0.3));

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.35) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const halfHeight = Math.max(3, (rawVal / 255) * 110 * amp * v.scale);
          const x = startX + i * (barWidth + barGap);

          // Upper Mirrored Bar
          const upperTopY = posY - centerGap / 2 - halfHeight;
          upperPath.roundRect(x, upperTopY, barWidth, halfHeight, [barRoundness, barRoundness, 1, 1]);

          // Lower Mirrored Bar
          const lowerStartY = posY + centerGap / 2;
          lowerPath.roundRect(x, lowerStartY, barWidth, halfHeight, [1, 1, barRoundness, barRoundness]);

          // Center symmetry node pulse
          dotPath.moveTo(x + barWidth / 2 + dotR, posY);
          dotPath.arc(x + barWidth / 2, posY, dotR, 0, Math.PI * 2);
        }

        ctx.fillStyle = upperGrad;
        ctx.fill(upperPath);

        ctx.fillStyle = lowerGrad;
        ctx.fill(lowerPath);

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.85;
        ctx.fill(dotPath);
        ctx.restore();
        break;
      }

      case 'circular-spikes': {
        const radius = Math.min(width, height) * 0.22 * v.scale;
        const totalSpikes = barCount * 2;
        const angleStep = (Math.PI * 2) / totalSpikes;

        ctx.fillStyle = strokeOrFillStyle;
        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = barWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();

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

          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        ctx.stroke();
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
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;
        const blockHeight = 5;
        const blockGap = 2;
        const maxBlocks = 24;

        ctx.fillStyle = strokeOrFillStyle;
        ctx.beginPath();

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.3) * (dataLength * 0.7)));
          const rawVal = freqData[dataIndex] || 0;
          const activeBlocks = Math.floor((rawVal / 255) * maxBlocks * amp);

          const x = startX + i * (barWidth + barGap);

          for (let b = 0; b < activeBlocks; b++) {
            const y = posY - b * (blockHeight + blockGap);
            ctx.roundRect(x, y, barWidth, blockHeight, 1);
          }
        }
        ctx.fill();
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
        const totalW = barCount * (barWidth + barGap) - barGap;
        const startX = centerX - totalW / 2;
        const maxFlameH = Math.max(60, 180 * amp * 1.15);

        const grad = ctx.createLinearGradient(0, posY, 0, posY - maxFlameH);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.6, '#ef4444');
        grad.addColorStop(1, '#fbbf24');

        ctx.fillStyle = grad;
        ctx.beginPath();

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(i / barCount, 1.2) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const flameH = (rawVal / 255) * 180 * amp * (0.85 + Math.random() * 0.3);
          const x = startX + i * (barWidth + barGap);

          ctx.moveTo(x, posY);
          ctx.lineTo(x + barWidth / 2, posY - flameH);
          ctx.lineTo(x + barWidth, posY);
          ctx.closePath();
        }
        ctx.fill();
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

        const rayPath = new Path2D();
        const sparkPath = new Path2D();

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

          rayPath.moveTo(x1, y1);
          rayPath.lineTo(x2, y2);

          const sparkSize = Math.max(2, (2.5 + (rawVal / 255) * 4) * v.scale);
          sparkPath.moveTo(x2 + sparkSize, y2);
          sparkPath.arc(x2, y2, sparkSize, 0, Math.PI * 2);
        }

        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = Math.max(1.8, (2.5 * v.scale));
        ctx.stroke(rayPath);

        ctx.fillStyle = '#ffffff';
        ctx.fill(sparkPath);
        break;
      }

      // 21. Multi-Tiered Floating Digital EQ Cascade Blocks
      case 'audio-equalizer-grid': {
        const columns = Math.min(barCount, 48);
        const rows = 12;
        const totalW = columns * (barWidth + barGap + 2) - (barGap + 2);
        const startX = centerX - totalW / 2;
        const colW = Math.max(3, barWidth);
        const blockH = Math.max(3, 7 * v.scale);
        const blockGap = Math.max(1.5, 2.5 * v.scale);

        const inactivePath = new Path2D();
        const pPath = new Path2D();
        const sPath = new Path2D();
        const tPath = new Path2D();
        const capPath = new Path2D();

        for (let c = 0; c < columns; c++) {
          const dataIndex = Math.min(dataLength - 1, Math.floor(Math.pow(c / columns, 1.25) * (dataLength * 0.75)));
          const rawVal = freqData[dataIndex] || 0;
          const activeRows = Math.round((rawVal / 255) * rows * amp);
          const colX = startX + c * (colW + barGap + 2);

          for (let r = 0; r < rows; r++) {
            const blockY = posY - r * (blockH + blockGap);
            const isActive = r < activeRows;

            if (isActive) {
              const rowProgress = r / rows;
              if (rowProgress > 0.8) {
                tPath.roundRect(colX, blockY, colW, blockH, 2);
              } else if (rowProgress > 0.55) {
                sPath.roundRect(colX, blockY, colW, blockH, 2);
              } else {
                pPath.roundRect(colX, blockY, colW, blockH, 2);
              }
            } else {
              inactivePath.roundRect(colX, blockY, colW, blockH, 2);
            }
          }

          // Top floating cap LED
          if (activeRows > 0) {
            const peakY = posY - activeRows * (blockH + blockGap) - 2;
            capPath.rect(colX, peakY, colW, 2.5);
          }
        }

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.globalAlpha = 0.35;
        ctx.fill(inactivePath);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = strokeOrFillStyle;
        ctx.fill(pPath);

        ctx.fillStyle = '#fbbf24'; // Amber mid
        ctx.fill(sPath);

        ctx.fillStyle = '#f43f5e'; // Red high peak
        ctx.fill(tPath);

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = v.primaryColor;
        ctx.shadowBlur = this.highPerformanceMode ? 0 : 8;
        ctx.fill(capPath);
        ctx.restore();
        break;
      }

      // 3D.js WebGL Visualizers (Three.js Engine)
      case '3d-cube-matrix':
      case '3d-sphere-waveform':
      case '3d-wave-terrain':
      case '3d-solar-system':
      case '3d-fluid-shape':
      case '3d-bezier-mesh':
      case '3d-raycaster':
      case '3d-spiral-galaxy': {
        // Sync background image/video for realistic 3D reflections (e.g. Cyberpunk Wave Terrain)
        if (this.bgImage || this.bgVideo) {
          threeDVisualizerEngine.setBackgroundImage(this.bgImage || this.bgVideo);
        } else {
          threeDVisualizerEngine.setBackgroundImage(null);
        }

        const threeCanvas = threeDVisualizerEngine.render(
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

        if (threeCanvas) {
          ctx.save();
          // Offset if user shifted positionX or positionY away from default 50%
          const offX = (width * ((v.positionX !== undefined ? v.positionX : 50) - 50)) / 100;
          const offY = (height * (v.positionY - 50)) / 100;
          ctx.translate(offX, offY);

          // Apply visualizer scale & mirror if enabled
          if (v.scale !== 1.0) {
            ctx.translate(width / 2, height / 2);
            ctx.scale(v.scale, v.scale);
            ctx.translate(-width / 2, -height / 2);
          }

          ctx.drawImage(threeCanvas, 0, 0, width, height);
          ctx.restore();
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
