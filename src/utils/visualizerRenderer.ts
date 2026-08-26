import {
  VisualizerConfig,
  BackgroundConfig,
  LyricsConfig,
  ParticleConfig,
  TrackMetadata,
  LyricLine,
  TextBoxItem,
  AspectRatio,
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
  orbitRadius?: number;
  wobble?: number;
  wobbleSpeed?: number;
}

export type CanvasContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export class VisualizerRenderer {
  private particles: Particle[] = [];
  private bgImage: HTMLImageElement | null = null;
  private bgImageSrc = '';
  private coverImage: HTMLImageElement | null = null;
  private coverImageSrc = '';

  private vinylRotation = 0;
  private peakBars: number[] = [];
  private peakVelocities: number[] = [];
  private radialPeaks: number[] = [];
  private radialVelocities: number[] = [];

  constructor() {
    this.initParticles(60);
  }

  public setBackgroundImage(url: string) {
    if (this.bgImageSrc === url && this.bgImage) return;
    this.bgImageSrc = url;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.bgImage = img;
    };
  }

  public setCoverImage(url: string) {
    if (this.coverImageSrc === url && this.coverImage) return;
    this.coverImageSrc = url;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      this.coverImage = img;
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
        orbitRadius: Math.random() * 250 + 50,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
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
    isPlaying: boolean
  ) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Render Background
    this.renderBackground(ctx, width, height, background, beatIntensity, isPlaying);

    // 2. Render Particles Overlay
    if (particlesConfig.enabled) {
      this.renderParticles(ctx, width, height, particlesConfig, bassIntensity, trebleIntensity, beatIntensity, isPlaying);
    }

    // 3. Render Track Cover / Badge (if enabled)
    if (track.showTrackCard && track.cardStyle !== 'hidden') {
      this.renderTrackCard(ctx, width, height, track, bassIntensity, beatIntensity, isPlaying);
    }

    // 4. Render Custom Text Boxes
    if (textBoxes && textBoxes.length > 0) {
      this.renderTextBoxes(ctx, width, height, textBoxes, beatIntensity);
    }

    // 5. Render Waveform / Audio Visualizer
    this.renderVisualizer(
      ctx,
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

    // 6. Render Synchronized Lyrics
    if (lyrics.enabled && lyricsData.length > 0) {
      this.renderLyrics(ctx, width, height, lyrics, lyricsData, currentTime, beatIntensity);
    }

    ctx.restore();
  }

  /**
   * Background renderer
   */
  private renderBackground(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    bg: BackgroundConfig,
    beatIntensity: number,
    isPlaying: boolean
  ) {
    ctx.save();

    // Beat zoom effect
    const zoom = bg.beatZoom && isPlaying ? 1 + beatIntensity * 0.03 : 1;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);

    if (bg.type === 'preset' || bg.type === 'upload') {
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
    isPlaying: boolean
  ) {
    if (this.particles.length !== config.count) {
      this.initParticles(config.count);
    }

    ctx.save();
    const speedMult = isPlaying ? config.speed : 0.1;
    const beatKick = config.reactiveToBeat ? beatIntensity * 2.5 : 0;
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
      if (isPlaying) {
        if (config.type === 'rain') {
          p.y += (p.speed || 8) * speedMult + beatKick * 4;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else if (config.type === 'stars') {
          p.alpha = p.baseAlpha + Math.sin(Date.now() * 0.003 + p.x) * 0.25 + beatKick * 0.3;
          p.x += p.vx * speedMult;
          p.y += p.vy * speedMult;
        } else if (config.type === 'sound-sparks') {
          p.y -= (2 + Math.random() * 3) * speedMult + beatKick * 3;
          p.x += Math.sin(Date.now() * 0.005 + p.y * 0.05) * 1.5;
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
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

        if (config.type !== 'hyperspace' && config.type !== 'rainbow-bubbles' && config.type !== 'bubbles') {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }
      }

      // --- RENDERING PARTICLE STYLES ---

      if (config.type === 'rain') {
        ctx.beginPath();
        ctx.strokeStyle = config.color || 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + 12 + beatKick * 8);
        ctx.stroke();
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
      } else {
        ctx.beginPath();
        const radius = Math.max(1, p.size * (1 + beatKick * 0.5));
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = config.color || 'rgba(255,255,255,0.6)';
        ctx.globalAlpha = Math.min(1, Math.max(0.1, p.alpha + (config.reactiveToBeat ? beatKick * 0.3 : 0)));
        ctx.shadowBlur = 8;
        ctx.shadowColor = config.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
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

    const cardScale = userScale * (1 + (isPlaying ? beatIntensity * 0.04 : 0));

    if (track.cardStyle === 'vinyl') {
      const vinylRadius = Math.min(width, height) * 0.18 * cardScale;

      // Glow behind vinyl
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, vinylRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.shadowColor = track.accentColor || '#ec4899';
      ctx.shadowBlur = 24 + beatIntensity * 20;
      ctx.fill();
      ctx.restore();

      // Vinyl outer body
      ctx.save();
      ctx.translate(centerX, centerY);
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
      ctx.arc(centerX, centerY, 6 * userScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (track.cardStyle === 'glass-card') {
      const cardW = Math.min(width * 0.85, 420) * cardScale;
      const cardH = 90 * cardScale;
      const cardX = centerX - cardW / 2;
      const cardY = centerY - cardH / 2;
      const radius = 16 * cardScale;

      ctx.save();
      // Glass background
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
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
      ctx.beginPath();
      ctx.arc(centerX, centerY, badgeR, 0, Math.PI * 2);
      ctx.shadowColor = track.accentColor;
      ctx.shadowBlur = 20 + beatIntensity * 15;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, badgeR - 3 * userScale, 0, Math.PI * 2);
      ctx.clip();

      if (this.coverImage && this.coverImage.complete) {
        ctx.drawImage(this.coverImage, centerX - badgeR, centerY - badgeR, badgeR * 2, badgeR * 2);
      } else {
        ctx.fillStyle = track.accentColor;
        ctx.fillRect(centerX - badgeR, centerY - badgeR, badgeR * 2, badgeR * 2);
      }

      ctx.restore();
    }

    // Render Title & Artist for vinyl, circular badge, or minimal tag
    if (track.cardStyle === 'vinyl' || track.cardStyle === 'circular-badge' || track.cardStyle === 'minimal-tag') {
      const offsetBelow = track.cardStyle === 'minimal-tag' 
        ? 0 
        : (track.cardStyle === 'vinyl' ? Math.min(width, height) * 0.18 * cardScale + 30 * userScale : Math.min(width, height) * 0.14 * cardScale + 26 * userScale);

      const textY = centerY + offsetBelow;
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
   * Audio Visualizer Renderer
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
    ctx.save();

    const posY = (height * v.positionY) / 100;
    const centerX = width / 2;

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

    ctx.shadowBlur = v.glowIntensity + (v.dynamicBeatPulse ? dynamicPulse * 14 : 0);
    ctx.shadowColor = v.primaryColor;

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

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, posY);

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

        // Draw Spline
        for (let i = 0; i < curvePoints.length - 1; i++) {
          const xc = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
          const yc = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, xc, yc);
        }
        ctx.lineTo(startX + totalW, posY);
        ctx.closePath();

        // Fill with gradient
        const fillGrad = ctx.createLinearGradient(0, posY - 140 * amp, 0, posY);
        fillGrad.addColorStop(0, v.primaryColor);
        fillGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fillGrad;
        ctx.globalAlpha = 0.65;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Glowing stroke line on top
        ctx.beginPath();
        ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
        for (let i = 0; i < curvePoints.length - 1; i++) {
          const xc = (curvePoints[i].x + curvePoints[i + 1].x) / 2;
          const yc = (curvePoints[i].y + curvePoints[i + 1].y) / 2;
          ctx.quadraticCurveTo(curvePoints[i].x, curvePoints[i].y, xc, yc);
        }
        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = v.lineThickness + 1.5;
        ctx.stroke();

        // Glowing Peak Dots along curve
        for (let i = 0; i < curvePoints.length; i += 3) {
          if (posY - curvePoints[i].y > 10) {
            ctx.beginPath();
            ctx.arc(curvePoints[i].x, curvePoints[i].y, 3, 0, Math.PI * 2);
            ctx.fillStyle = v.secondaryColor || '#ffffff';
            ctx.shadowBlur = 12;
            ctx.shadowColor = v.secondaryColor || v.primaryColor;
            ctx.fill();
          }
        }

        ctx.restore();
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

      case 'circular-ring': {
        const radius = Math.min(width, height) * 0.22 * v.scale;
        const totalPoints = 120;
        const angleStep = (Math.PI * 2) / totalPoints;

        ctx.strokeStyle = strokeOrFillStyle;
        ctx.lineWidth = v.lineThickness + 1;
        ctx.beginPath();

        for (let i = 0; i <= totalPoints; i++) {
          const idx = i % totalPoints;
          const mirrorIdx = idx < totalPoints / 2 ? idx : totalPoints - idx;
          const dataIndex = Math.min(dataLength - 1, Math.floor((mirrorIdx / (totalPoints / 2)) * (dataLength * 0.65)));
          const rawVal = freqData[dataIndex] || 0;
          const waveR = radius + (rawVal / 255) * 60 * amp;

          const angle = idx * angleStep;
          const x = centerX + Math.cos(angle) * waveR;
          const y = posY + Math.sin(angle) * waveR;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case 'smooth-wave': {
        const points = 64;
        const step = width / (points - 1);

        for (let layer = 0; layer < 2; layer++) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, posY);

          for (let i = 0; i < points; i++) {
            const dataIdx = Math.floor(Math.abs(i - points / 2) / (points / 2) * (dataLength * 0.6));
            const rawVal = freqData[dataIdx] || 0;
            const timeVal = (timeData[i % timeData.length] - 128) / 128;
            
            const offset = (rawVal / 255) * 90 * amp + timeVal * 30;
            const waveY = posY + (layer === 0 ? -offset : offset * 0.6) + Math.sin(currentTime * 3 + i * 0.2) * 10;
            const x = i * step;

            if (i === 0) {
              ctx.lineTo(x, waveY);
            } else {
              const prevX = (i - 1) * step;
              const cx = (prevX + x) / 2;
              ctx.quadraticCurveTo(prevX, waveY, cx, waveY);
            }
          }

          ctx.lineTo(width, posY);
          ctx.lineTo(width, height);
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

      case 'galaxy-orbit': {
        const numStars = 80;
        const baseRadius = Math.min(width, height) * 0.24 * v.scale;

        for (let i = 0; i < numStars; i++) {
          const dataIdx = i % dataLength;
          const rawVal = freqData[dataIdx] || 0;
          const angle = (i / numStars) * Math.PI * 2 + currentTime * 0.8;
          const r = baseRadius + (rawVal / 255) * 80 * amp + Math.sin(i * 12) * 20;

          const x = centerX + Math.cos(angle) * r;
          const y = posY + Math.sin(angle) * (r * 0.55);

          const dotSize = 2 + (rawVal / 255) * 4;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = strokeOrFillStyle;
          ctx.fill();
        }
        break;
      }

      case 'double-ribbon': {
        const points = 80;
        const step = width / (points - 1);

        ctx.lineWidth = v.lineThickness + 1;
        ctx.strokeStyle = strokeOrFillStyle;

        for (let r = 0; r < 2; r++) {
          ctx.beginPath();
          const phase = r * Math.PI;

          for (let i = 0; i < points; i++) {
            const mirrorDist = 1 - Math.abs(i - points / 2) / (points / 2);
            const dataIdx = Math.min(dataLength - 1, Math.floor(mirrorDist * (dataLength * 0.7)));
            const rawVal = freqData[dataIdx] || 0;
            const waveY = posY + Math.sin(currentTime * 4 + i * 0.15 + phase) * ((rawVal / 255) * 90 * amp + 15);
            const x = i * step;

            if (i === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
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

      case 'blob-morph': {
        const radius = Math.min(width, height) * 0.2 * v.scale;
        const numPoints = 16;
        const angleStep = (Math.PI * 2) / numPoints;

        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
          const dataIdx = i % dataLength;
          const rawVal = freqData[dataIdx] || 0;
          const dist = radius + (rawVal / 255) * 60 * amp + Math.sin(currentTime * 2 + i) * 10;
          const angle = i * angleStep;
          const x = centerX + Math.cos(angle) * dist;
          const y = posY + Math.sin(angle) * dist;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = strokeOrFillStyle;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        break;
      }

      default:
        break;
    }

    ctx.restore();
  }

  /**
   * Synchronized Lyrics Renderer
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
    if (!info.activeLine && !info.prevLine && !info.nextLine) return;

    ctx.save();
    const posY = (height * lyrics.positionY) / 100;
    const centerX = width / 2;

    const baseFontSize = lyrics.fontSize || 24;
    const fontFam = lyrics.fontFamily || 'Be Vietnam Pro';

    const formatText = (text: string) => {
      if (lyrics.textTransform === 'uppercase') return text.toUpperCase();
      if (lyrics.textTransform === 'capitalize') {
        return text.replace(/\b\w/g, l => l.toUpperCase());
      }
      return text;
    };

    if (lyrics.style === 'karaoke') {
      const popScale = 1 + (beatIntensity * 0.05);

      if (info.prevLine) {
        ctx.font = `500 ${baseFontSize * 0.75}px '${fontFam}', sans-serif`;
        ctx.fillStyle = lyrics.color;
        ctx.textAlign = lyrics.alignment;
        ctx.fillText(formatText(info.prevLine.text), centerX, posY - baseFontSize * 1.8, width * 0.88);
      }

      if (info.activeLine) {
        ctx.save();
        ctx.translate(centerX, posY);
        ctx.scale(popScale, popScale);
        ctx.translate(-centerX, -posY);

        if (lyrics.showBackgroundPill) {
          ctx.font = `bold ${baseFontSize}px '${fontFam}', sans-serif`;
          const textMetrics = ctx.measureText(formatText(info.activeLine.text));
          const pillW = Math.min(width * 0.92, textMetrics.width + 36);
          const pillH = baseFontSize * 1.8;
          ctx.beginPath();
          ctx.roundRect(centerX - pillW / 2, posY - pillH / 2, pillW, pillH, pillH / 2);
          ctx.fillStyle = lyrics.pillColor || 'rgba(0,0,0,0.5)';
          ctx.fill();
        }

        ctx.font = `bold ${baseFontSize}px '${fontFam}', sans-serif`;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';

        ctx.shadowColor = lyrics.glowColor || '#ec4899';
        ctx.shadowBlur = lyrics.glowIntensity + beatIntensity * 10;
        ctx.fillStyle = lyrics.activeColor || '#ffffff';
        ctx.fillText(formatText(info.activeLine.text), centerX, posY, width * 0.88);
        ctx.restore();
      }

      if (info.nextLine) {
        ctx.font = `500 ${baseFontSize * 0.75}px '${fontFam}', sans-serif`;
        ctx.fillStyle = lyrics.color;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        ctx.fillText(formatText(info.nextLine.text), centerX, posY + baseFontSize * 1.8, width * 0.88);
      }

    } else if (lyrics.style === 'subtitle-bar') {
      if (info.activeLine) {
        const text = formatText(info.activeLine.text);
        ctx.font = `600 ${baseFontSize}px '${fontFam}', sans-serif`;
        const textMetrics = ctx.measureText(text);
        const barW = Math.min(width * 0.9, textMetrics.width + 48);
        const barH = baseFontSize * 2.2;
        const barX = centerX - barW / 2;
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
        ctx.shadowColor = lyrics.glowColor;
        ctx.shadowBlur = lyrics.glowIntensity;
        ctx.fillStyle = lyrics.activeColor;
        ctx.fillText(text, centerX, posY, width * 0.84);
      }

    } else if (lyrics.style === 'kinetic-pop') {
      if (info.activeLine) {
        const text = formatText(info.activeLine.text);
        const scale = 1 + beatIntensity * 0.12;

        ctx.save();
        ctx.translate(centerX, posY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -posY);

        ctx.font = `900 ${baseFontSize * 1.15}px '${fontFam}', sans-serif`;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        ctx.shadowColor = lyrics.glowColor;
        ctx.shadowBlur = lyrics.glowIntensity + beatIntensity * 16;
        ctx.fillStyle = lyrics.activeColor;
        ctx.fillText(text, centerX, posY, width * 0.9);
        ctx.restore();
      }

    } else {
      if (info.activeLine) {
        const text = formatText(info.activeLine.text);
        ctx.font = `bold ${baseFontSize}px '${fontFam}', sans-serif`;
        ctx.textAlign = lyrics.alignment;
        ctx.textBaseline = 'middle';
        ctx.shadowColor = lyrics.glowColor;
        ctx.shadowBlur = lyrics.glowIntensity;
        ctx.fillStyle = lyrics.activeColor;
        ctx.fillText(text, centerX, posY, width * 0.9);
      }
    }

    ctx.restore();
  }
}
