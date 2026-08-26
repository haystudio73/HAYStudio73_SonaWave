export type AspectRatio = '9:16' | '1:1' | '16:9' | '4:5';

export type VisualizerType = 
  | 'bars-peaks'             // Classic spectrum bars with falling peak caps/gravity dots
  | 'bars-mirrored-peaks'    // Mirrored bars with dual falling peak dots
  | 'bars-mirrored'          // Top & bottom mirrored bars
  | 'bars'                   // Classic vertical audio spectrum bars
  | 'spectrum-line'          // Smooth filled gradient spectrum curve
  | 'radial-bars-peaks'      // Circular radial spikes with orbit peak dots
  | 'circular-spikes'        // Radial spikes around center
  | 'circular-ring'          // Smooth circular neon ring wave
  | 'smooth-wave'            // Flowing continuous liquid sine wave
  | 'cyber-matrix'           // Segmented digital LED matrix
  | 'galaxy-orbit'           // Swirling particles galaxy reacting to frequencies
  | 'double-ribbon'          // Dual neon cyber ribbon waves
  | 'vinyl-visual'           // Spinning record with sonic aura
  | 'minimal-pulse'          // Clean audiophile line with frequency dots
  | 'flame-spectrum'         // Hot plasma gradient spikes
  | 'blob-morph';            // Organic beat-reactive blob

export type VisualizerColorMode = 'solid' | 'gradient2' | 'gradient3' | 'rainbow' | 'neon-glow';

export interface VisualizerConfig {
  type: VisualizerType;
  colorMode: VisualizerColorMode;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  barCount: number;
  barWidth: number;
  barGap: number;
  barRoundness: number;
  glowIntensity: number; // 0 to 40
  amplitude: number;     // 0.2 to 3.0
  smoothing: number;     // 0.5 to 0.95
  mirror: boolean;
  positionY: number;     // percentage 0 to 100
  scale: number;         // 0.5 to 2.0
  bassBoost: boolean;
  dynamicBeatPulse: boolean;
  syncBpmPulse?: boolean; // Sync visualizer pulse & bounce to detected BPM
  bpm?: number;           // Detected or manual BPM (e.g. 120)
  lineThickness: number;
  fillOpacity: number;
}

export interface LyricLine {
  id: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
}

export type LyricsStyle = 
  | 'karaoke'         // Large active line with previous & next lines dimmed
  | 'subtitle-bar'    // Modern frosted dark pill / bar with glowing text
  | 'teleprompter'    // 3-line smooth scrolling flow
  | 'minimal-glow'    // Clean bold text with glowing drop-shadow
  | 'kinetic-pop'     // Text pulses on beat
  | 'duo-tone';       // Split colored text accent

export interface LyricsConfig {
  enabled: boolean;
  fontFamily: string;
  fontSize: number;       // base font size
  color: string;           // inactive text color
  activeColor: string;     // active text color
  glowColor: string;       // glow color for active line
  glowIntensity: number;   // glow strength
  positionY: number;       // 0 - 100 percentage
  alignment: 'center' | 'left' | 'right';
  style: LyricsStyle;
  showRomajiOrTranslation?: boolean;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'capitalize';
  showBackgroundPill: boolean;
  pillColor: string;
  pillOpacity: number;
  pillBlur: number;
}

export type BackgroundType = 'preset' | 'upload' | 'gradient' | 'solid';

export interface BackgroundConfig {
  type: BackgroundType;
  url: string;
  color1: string;
  color2: string;
  gradientAngle: number;
  blur: number;         // px 0 to 30
  brightness: number;   // 0 to 200% (default 85%)
  contrast: number;     // 50 to 150%
  vignette: number;     // 0 to 100%
  beatZoom: boolean;    // Zooms in slightly on bass kick
  filmGrain: boolean;
}

export type ParticleType = 
  | 'none' 
  | 'dust' 
  | 'stars' 
  | 'rainbow-bubbles'  // Bong bóng xà phòng cầu vồng ngũ sắc lấp lánh
  | 'hyperspace'       // Tăng tốc vũ trụ Hyperspace warp-speed
  | 'bubbles' 
  | 'rain' 
  | 'audio-rings' 
  | 'sound-sparks';

export interface ParticleConfig {
  enabled: boolean;
  type: ParticleType;
  count: number;
  speed: number;
  color: string;
  reactiveToBeat: boolean;
}

export type CardStyle = 'vinyl' | 'glass-card' | 'circular-badge' | 'minimal-tag' | 'hidden';

export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  showTrackCard: boolean;
  showTitle: boolean;
  showArtist: boolean;
  cardStyle: CardStyle;
  positionX: number; // 0 to 100% (default 50)
  positionY: number; // 0 to 100% (default 30)
  scale: number;     // 0.4 to 2.5 (default 1.0)
  fontFamily: string;
  titleFontSize: number;
  artistFontSize: number;
  textColor: string;
  artistColor: string;
  accentColor: string;
  rotateVinyl: boolean;
  alignment: 'center' | 'left' | 'right';
  boxBackground: boolean;
  boxBgColor: string;
  boxOpacity: number;
}

export interface TextBoxItem {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;       // 12 to 72
  color: string;
  hasBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  glowColor: string;
  glowIntensity: number;  // 0 to 40
  positionX: number;      // 0 to 100%
  positionY: number;      // 0 to 100%
  alignment: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold' | '900';
  fontStyle: 'normal' | 'italic';
  letterSpacing: number;  // 0 to 10
  isUppercase: boolean;
  opacity: number;        // 0.1 to 1.0
  wrapText?: boolean;     // Enable auto-wrapping long lines
  maxWidth?: number;      // Max width in % of stage (20 to 95, default 80)
  lineHeight?: number;    // Line height multiplier (1.1 to 2.0, default 1.35)
}

export interface ExportSettings {
  resolution: '1080p' | '720p' | '4k';
  fps: 30 | 60;
  qualityBitrate: 'high' | 'ultra' | 'medium';
  startTime: number;
  endTime: number;
  fullSong: boolean;
}

export interface PresetTheme {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  thumbnail: string;
  aspectRatio: AspectRatio;
  visualizer: VisualizerConfig;
  lyrics: LyricsConfig;
  background: BackgroundConfig;
  particles: ParticleConfig;
  track: TrackMetadata;
  sampleAudio?: {
    title: string;
    artist: string;
    type: 'lofi' | 'synthwave' | 'acoustic' | 'edm';
    lyrics: string;
  };
}
