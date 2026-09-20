import lottie, { AnimationItem } from 'lottie-web';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import { LottieItem, LottieLayerOrder } from '../types';
import { getEmbeddedLottieData, EMBEDDED_LOTTIE_DATA } from '../data/embeddedLottieData';
import { loadLottieSource, isDotLottieSource, sanitizeLottieUrl } from './lottieLoader';

interface LoadedLottie {
  id: string;
  url: string;
  container: HTMLDivElement;
  animation: AnimationItem | null;
  dotLottie?: DotLottie | null;
  canvas: HTMLCanvasElement | null;
  error?: boolean;
  proceduralType?: string;
}

class LottieCanvasManager {
  private instances: Map<string, LoadedLottie> = new Map();
  private hostElement: HTMLDivElement | null = null;
  private rotationTicker = 0;

  constructor() {
    this.ensureHost();
  }

  private ensureHost() {
    if (typeof document === 'undefined') return;
    if (!this.hostElement) {
      const el = document.createElement('div');
      el.id = 'lottie-offscreen-host';
      el.style.position = 'fixed';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.width = '320px';
      el.style.height = '320px';
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.001';
      el.style.zIndex = '-9999';
      el.style.overflow = 'hidden';
      document.body.appendChild(el);
      this.hostElement = el;
    }
  }

  public syncItems(items: LottieItem[]) {
    if (typeof document === 'undefined') return;
    this.ensureHost();

    const activeIds = new Set(items.map((i) => i.id));

    // 1. Destroy and cleanup removed items
    for (const [id, instance] of this.instances.entries()) {
      if (!activeIds.has(id)) {
        try {
          if (instance.dotLottie) {
            instance.dotLottie.destroy();
          }
          if (instance.animation) {
            instance.animation.destroy();
          }
          if (instance.container && instance.container.parentNode) {
            instance.container.parentNode.removeChild(instance.container);
          }
        } catch (e) {
          // ignore cleanup errors
        }
        this.instances.delete(id);
      }
    }

    // 2. Load or update current items
    for (const item of items) {
      const existing = this.instances.get(item.id);

      // If url or animationData changed, reload
      const needsReload =
        !existing ||
        existing.url !== item.url ||
        (!existing.animation && Boolean(item.animationData));

      if (needsReload) {
        if (existing) {
          try {
            if (existing.dotLottie) existing.dotLottie.destroy();
            if (existing.animation) existing.animation.destroy();
            if (existing.container && existing.container.parentNode) {
              existing.container.parentNode.removeChild(existing.container);
            }
          } catch (e) {
            // ignore
          }
          this.instances.delete(item.id);
        }

        this.createInstance(item);
      } else {
        // Update speed / loop on existing instance
        try {
          if (existing.dotLottie) {
            existing.dotLottie.setSpeed(item.speed || 1.0);
            existing.dotLottie.setLoop(item.loop !== false);
          }
          if (existing.animation) {
            existing.animation.setSpeed(item.speed || 1.0);
            existing.animation.loop = item.loop !== false;
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }

  private createInstance(item: LottieItem) {
    if (!this.hostElement || typeof document === 'undefined') return;

    const container = document.createElement('div');
    container.style.width = '320px';
    container.style.height = '320px';
    container.style.position = 'relative';
    this.hostElement.appendChild(container);

    const effectiveUrl = item.url ? sanitizeLottieUrl(item.url) : '';
    const isDotLottie =
      item.format === 'dotlottie' ||
      isDotLottieSource(effectiveUrl);

    const loadedEntry: LoadedLottie = {
      id: item.id,
      url: effectiveUrl,
      container,
      animation: null,
      dotLottie: null,
      canvas: null,
      error: false,
      proceduralType: this.detectProceduralType(item),
    };
    this.instances.set(item.id, loadedEntry);

    // Helper to initialize lottie-web canvas animation
    const initLottieCanvas = (animData: any) => {
      try {
        if (loadedEntry.dotLottie) {
          try { loadedEntry.dotLottie.destroy(); } catch {}
          loadedEntry.dotLottie = null;
        }
        if (loadedEntry.animation) {
          try { loadedEntry.animation.destroy(); } catch {}
          loadedEntry.animation = null;
        }
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const anim = lottie.loadAnimation({
          container,
          renderer: 'canvas',
          loop: item.loop !== false,
          autoplay: true,
          animationData: animData,
          rendererSettings: {
            clearCanvas: true,
            progressiveLoad: false,
            preserveAspectRatio: 'xMidYMid meet',
          },
        });

        loadedEntry.animation = anim;
        loadedEntry.error = false;

        const syncCvs = () => {
          const cvs = container.querySelector('canvas') as HTMLCanvasElement;
          if (cvs) {
            loadedEntry.canvas = cvs;
            loadedEntry.error = false;
          }
        };

        syncCvs();
        anim.addEventListener('DOMLoaded', syncCvs);
        anim.addEventListener('data_ready', syncCvs);
        anim.addEventListener('config_ready', syncCvs);
      } catch (err) {
        console.warn('Error initializing Lottie canvas:', err);
      }
    };

    // Prefer high-performance embedded Lottie data
    let embeddedData: any = null;
    if (
      item.animationData &&
      typeof item.animationData === 'object' &&
      ((item.animationData as any).v || (item.animationData as any).layers)
    ) {
      try {
        embeddedData = JSON.parse(JSON.stringify(item.animationData));
      } catch {
        embeddedData = null;
      }
    }
    // Only check embedded presets if no custom URL was provided, or if this item's ID explicitly matches a preset
    if (!embeddedData && !effectiveUrl) {
      embeddedData = getEmbeddedLottieData(item.id) || getEmbeddedLottieData(item.name || '');
    } else if (!embeddedData && item.id && EMBEDDED_LOTTIE_DATA[item.id]) {
      embeddedData = getEmbeddedLottieData(item.id);
    }

    if (embeddedData) {
      initLottieCanvas(embeddedData);
      return;
    }

    if (isDotLottie && effectiveUrl) {
      // 1. Asynchronously extract animation JSON via fflate as backup if DotLottie canvas fails or for webgl/2d export
      loadLottieSource(effectiveUrl).then(({ animationData: extracted }) => {
        if (extracted && this.instances.has(item.id)) {
          item.animationData = extracted;
          // If DotLottie didn't start or errored, initialize lottie-web canvas
          if (!loadedEntry.dotLottie || loadedEntry.error || !loadedEntry.canvas) {
            initLottieCanvas(extracted);
          }
        }
      }).catch((err) => {
        console.warn('loadLottieSource extraction failed:', err);
        if (!loadedEntry.dotLottie || loadedEntry.error || !loadedEntry.canvas) {
          const fallbackData = getEmbeddedLottieData(item.id) || getEmbeddedLottieData('vinyl-record-spin');
          initLottieCanvas(fallbackData);
        }
      });

      // 2. Initialize DotLottie player with freezeOnOffscreen disabled
      try {
        const cvs = document.createElement('canvas');
        cvs.width = item.width || 320;
        cvs.height = item.height || 320;
        container.appendChild(cvs);

        const dotLottie = new DotLottie({
          canvas: cvs,
          src: effectiveUrl,
          loop: item.loop !== false,
          autoplay: true,
          speed: item.speed || 1.0,
          renderConfig: {
            freezeOnOffscreen: false,
            autoResize: false,
          },
        });

        loadedEntry.dotLottie = dotLottie;
        loadedEntry.canvas = cvs;
        loadedEntry.error = false;

        dotLottie.addEventListener('load', () => {
          loadedEntry.canvas = cvs;
          loadedEntry.error = false;
          try {
            if (!dotLottie.isPlaying) {
              dotLottie.play();
            }
          } catch {}
        });

        dotLottie.addEventListener('ready', () => {
          loadedEntry.canvas = cvs;
          loadedEntry.error = false;
          try {
            if (!dotLottie.isPlaying) {
              dotLottie.play();
            }
          } catch {}
        });

        dotLottie.addEventListener('play', () => {
          loadedEntry.canvas = cvs;
          loadedEntry.error = false;
        });

        dotLottie.addEventListener('loadError', async () => {
          try {
            const { animationData: extracted } = await loadLottieSource(effectiveUrl);
            if (extracted) {
              item.animationData = extracted;
              initLottieCanvas(extracted);
              return;
            }
          } catch {}

          const fallbackData = getEmbeddedLottieData(item.id) || getEmbeddedLottieData('vinyl-record-spin');
          initLottieCanvas(fallbackData);
        });

        dotLottie.addEventListener('renderError', () => {
          if (!loadedEntry.animation) {
            loadedEntry.error = true;
          }
        });
      } catch (err) {
        // DotLottie fallback handled by loadLottieSource
      }

      return;
    }

    try {
      const hasValidExternalPath =
        effectiveUrl &&
        !effectiveUrl.includes('assets2.lottiefiles.com/packages/lf20_m6cuL6') &&
        (effectiveUrl.startsWith('http://') || effectiveUrl.startsWith('https://') || effectiveUrl.startsWith('data:') || effectiveUrl.startsWith('/'));

      const anim = lottie.loadAnimation({
        container,
        renderer: 'canvas',
        loop: item.loop !== false,
        autoplay: true,
        ...(embeddedData
          ? { animationData: embeddedData }
          : hasValidExternalPath
          ? { path: effectiveUrl }
          : { animationData: getEmbeddedLottieData('vinyl-record-spin') }),
        rendererSettings: {
          clearCanvas: true,
          progressiveLoad: false,
          preserveAspectRatio: 'xMidYMid meet',
        },
      });

      loadedEntry.animation = anim;

      const syncCanvas = () => {
        try {
          const cvs = container.querySelector('canvas') as HTMLCanvasElement;
          if (cvs) {
            loadedEntry.canvas = cvs;
            loadedEntry.error = false;
          }
        } catch {
          // ignore
        }
      };

      // Query canvas immediately and on all lifecycle events
      syncCanvas();
      anim.addEventListener('DOMLoaded', syncCanvas);
      anim.addEventListener('data_ready', syncCanvas);
      anim.addEventListener('config_ready', syncCanvas);

      anim.addEventListener('data_failed', () => {
        // Fallback gracefully to embedded Lottie data if network URL returned 403 or failed!
        try {
          const fallbackData =
            getEmbeddedLottieData(item.id) ||
            getEmbeddedLottieData(item.name) ||
            getEmbeddedLottieData('vinyl-record-spin');
          anim.destroy();
          const fallbackAnim = lottie.loadAnimation({
            container,
            renderer: 'canvas',
            loop: item.loop !== false,
            autoplay: true,
            animationData: fallbackData,
            rendererSettings: {
              clearCanvas: true,
              progressiveLoad: false,
              preserveAspectRatio: 'xMidYMid meet',
            },
          });
          loadedEntry.animation = fallbackAnim;
          loadedEntry.error = false;
          syncCanvas();
          fallbackAnim.addEventListener('DOMLoaded', syncCanvas);
        } catch {
          loadedEntry.error = true;
        }
      });

      anim.addEventListener('error', () => {
        loadedEntry.error = true;
      });
    } catch (err) {
      loadedEntry.error = true;
    }
  }

  private detectProceduralType(item: LottieItem): string {
    const text = (item.id + ' ' + (item.name || '') + ' ' + (item.url || '')).toLowerCase();
    if (text.includes('vinyl') || text.includes('record') || text.includes('disc')) return 'vinyl';
    if (text.includes('equalizer') || text.includes('spectrum') || text.includes('wave')) return 'equalizer';
    if (text.includes('heart') || text.includes('love')) return 'heart';
    if (text.includes('headphone')) return 'headphones';
    if (text.includes('star') || text.includes('sparkle')) return 'star';
    if (text.includes('fire') || text.includes('flame')) return 'fire';
    if (text.includes('cat') || text.includes('chill')) return 'cat';
    if (text.includes('lightning') || text.includes('bolt')) return 'lightning';
    return 'circle-pulse';
  }

  public renderLottieLayer(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    items: LottieItem[] = [],
    targetLayer: LottieLayerOrder,
    beatIntensity = 0
  ) {
    if (!items || items.length === 0) return;

    // Filter items belonging to this specific layer
    const layerItems = items.filter(
      (item) => (item.layerOrder || 'front-visualizer') === targetLayer && item.visible !== false
    );
    if (layerItems.length === 0) return;

    this.rotationTicker += 0.03;

    for (const item of layerItems) {
      const instance = this.instances.get(item.id);
      const canvas =
        instance?.canvas ||
        (instance?.container?.querySelector('canvas') as HTMLCanvasElement | null);

      const posX = (item.x / 100) * width;
      const posY = (item.y / 100) * height;

      const beatScaleMult = item.audioReactive ? 1 + beatIntensity * 0.28 : 1;
      const effectiveScale = (item.scale || 1.0) * beatScaleMult;
      const baseW = item.width || 240;
      const baseH = item.height || 240;
      const drawW = baseW * effectiveScale;
      const drawH = baseH * effectiveScale;

      ctx.save();
      ctx.translate(posX, posY);
      if (item.rotation) {
        ctx.rotate((item.rotation * Math.PI) / 180);
      }
      ctx.globalAlpha = Math.max(0, Math.min(1, item.opacity ?? 1.0));

      // 1. If lottie-web canvas is active and rendering
      if (canvas && canvas.width > 0 && canvas.height > 0 && !instance?.error) {
        try {
          ctx.drawImage(canvas, -drawW / 2, -drawH / 2, drawW, drawH);
        } catch (e) {
          this.renderProceduralFallback(ctx, item, drawW, drawH, beatIntensity);
        }
      } else {
        // 2. High-aesthetic procedural animated fallback (zero-fail guarantee)
        this.renderProceduralFallback(ctx, item, drawW, drawH, beatIntensity);
      }

      ctx.restore();
    }
  }

  // Smooth procedural fallback graphics when offline or waiting for CDN json
  private renderProceduralFallback(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    item: LottieItem,
    w: number,
    h: number,
    beatIntensity: number
  ) {
    const type = this.detectProceduralType(item);
    const r = Math.min(w, h) / 2;

    ctx.save();
    if (type === 'vinyl') {
      // Spinning Vinyl Graphic
      const spinAngle = this.rotationTicker * 1.5;
      ctx.rotate(spinAngle);

      // Outer Vinyl Grooves
      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(0.35, '#1f2937');
      grad.addColorStop(0.7, '#111827');
      grad.addColorStop(1, '#030712');

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sound grooves
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
      ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Center Sticker
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();

      // Center Hole
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#030712';
      ctx.fill();
    } else if (type === 'equalizer') {
      // Dynamic Animated Equalizer Bars
      const bars = 7;
      const barW = (w * 0.7) / bars;
      const startX = -((bars * barW) / 2);

      for (let i = 0; i < bars; i++) {
        const timeOffset = Date.now() * 0.008 + i * 0.9;
        const barH = (Math.sin(timeOffset) * 0.35 + 0.55 + beatIntensity * 0.35) * (h * 0.65);
        const bx = startX + i * barW + barW * 0.15;
        const bw = barW * 0.7;

        const bGrad = ctx.createLinearGradient(0, barH / 2, 0, -barH / 2);
        bGrad.addColorStop(0, '#ec4899');
        bGrad.addColorStop(1, '#38bdf8');

        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, -barH / 2, bw, barH, 4) : ctx.rect(bx, -barH / 2, bw, barH);
        ctx.fill();
      }
    } else if (type === 'heart') {
      // Pulsing Neon Heart
      const pulse = 1 + Math.sin(Date.now() * 0.007) * 0.12 + beatIntensity * 0.2;
      ctx.scale(pulse, pulse);

      ctx.beginPath();
      const topCurveHeight = r * 0.45;
      ctx.moveTo(0, r * 0.4);
      ctx.bezierCurveTo(-r * 0.7, -r * 0.3, -r * 0.9, r * 0.2, 0, r * 0.85);
      ctx.bezierCurveTo(r * 0.9, r * 0.2, r * 0.7, -r * 0.3, 0, r * 0.4);
      ctx.closePath();

      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (type === 'star') {
      // Sparkling Rotating Star
      ctx.rotate(this.rotationTicker * 0.8);
      const points = 5;
      const outerR = r * 0.8;
      const innerR = r * 0.35;

      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const rad = (i * Math.PI) / points;
        const dist = i % 2 === 0 ? outerR : innerR;
        const sx = Math.cos(rad) * dist;
        const sy = Math.sin(rad) * dist;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Glowing Energy Rings
      const ringPulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7 + ringPulse * 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#818cf8';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  public destroy() {
    for (const instance of this.instances.values()) {
      try {
        if (instance.animation) instance.animation.destroy();
        if (instance.container && instance.container.parentNode) {
          instance.container.parentNode.removeChild(instance.container);
        }
      } catch (e) {
        // ignore
      }
    }
    this.instances.clear();
    if (this.hostElement && this.hostElement.parentNode) {
      this.hostElement.parentNode.removeChild(this.hostElement);
      this.hostElement = null;
    }
  }
}

export const lottieCanvasManager = new LottieCanvasManager();
