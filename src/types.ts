export type AspectRatio = '9:16' | '1:1' | '16:9' | '4:5';

export type VisualizerType = 
  | 'bars-peaks'             // Classic spectrum bars with falling peak caps/gravity dots
  | 'bars-mirrored-peaks'    // Mirrored bars with dual falling peak dots
  | 'bars-mirrored'          // Top & bottom mirrored bars
  | 'bars'                   // Classic vertical audio spectrum bars
  | 'spectrum-line'          // Smooth filled gradient spectrum curve
  | 'radial-bars-peaks'      // Circular radial spikes with orbit peak dots
  | 'circular-spikes'        // Radial spikes around center
  | 'smooth-wave'            // Flowing continuous liquid sine wave
  | 'cyber-matrix'           // Segmented digital LED matrix
  | 'double-ribbon'          // Dual neon cyber ribbon waves
  | 'vinyl-visual'           // Spinning record with sonic aura
  | 'minimal-pulse'          // Clean audiophile line with frequency dots
  | 'flame-spectrum'         // Hot plasma gradient spikes
  | 'dna-helix'              // 3D Neon DNA double helix with frequency rungs
  | 'tunnel-vortex'          // Infinite 3D concentric portal tunnel
  | 'laser-beams'            // Stage EDM concert scanning laser beams
  | 'starburst-core'         // Multi-point pulsating starburst nova
  | 'audio-equalizer-grid';   // Multi-tiered floating digital EQ cascade blocks

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
  glowIntensity: number; // 0 to 50
  bloomEffect?: boolean;  // Multi-pass neon bloom / aura effect for waveform lines & bars
  bloomIntensity?: number; // 0 to 100 (%)
  glowColor?: string;     // Custom glow / bloom tint or auto
  amplitude: number;     // 0.2 to 3.0
  smoothing: number;     // 0.5 to 0.95
  mirror: boolean;
  positionX?: number;    // percentage 0 to 100, default 50
  positionY: number;     // percentage 0 to 100
  scale: number;         // 0.5 to 2.0
  bassBoost: boolean;
  dynamicBeatPulse: boolean;
  syncBpmPulse?: boolean; // Sync visualizer pulse & bounce to detected BPM
  bpm?: number;           // Detected or manual BPM (e.g. 120)
  chromaticAberration?: boolean; // Tách sắc sai kênh màu RGB Glitch phản hồi theo tần số âm thanh
  chromaticAberrationIntensity?: number; // 0.1 to 1.0 (Độ mạnh tách kênh màu)
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
  | 'karaoke-single'    // Karaoke 1 Dòng - chỉ hiện 1 câu đang hát quét màu mượt mà (Hot TikTok/Reels)
  | 'teleprompter-4lines' // Karaoke 4 Dòng - 4 dòng chữ chạy cuộn mượt mà tự động
  | 'karaoke'           // Karaoke 3 Dòng - Dòng đang hát phóng to, 2 dòng trước & sau mờ dần
  | 'subtitle-bar'      // Thanh phụ đề mờ - hộp frosted glass tối giản hiện đại
  | 'minimal-glow'      // Chữ phát sáng tối giản
  | 'duo-tone';         // Split colored text accent

export type KaraokeSweepMode = 
  | 'color-only'    // Chỉ Đổi Màu (Quét màu mượt mà không kèm hiệu ứng bay)
  | 'star-flying'   // Sao vàng bay+đổi màu (Ngôi sao vàng 5 cánh lướt bay nảy trên chữ)
  | 'bouncing-ball';// Quả bóng nhỏ bay+đổi màu (Quả bóng tròn nảy bồng bềnh nhịp nhàng trên chữ)

export type LyricsFontEffect = 
  | 'none'              // Chữ tiêu chuẩn sắc nét
  | 'neon-glow'         // Hào quang Laser Neon 2 lớp
  | 'double-stroke'     // Viền đôi nổi bật tương phản cao
  | '3d-shadow'         // Bóng đổ 3D chiều sâu khối
  | 'gradient-fill'     // Chuyển sắc Gradient đa màu
  | 'metallic-chrome'   // Ánh kim loại Chrome tráng gương
  | 'comic-pop';        // Phong cách truyện tranh Comic viền đậm

export interface LyricsConfig {
  enabled: boolean;
  fontFamily: string;
  fontSize: number;       // base font size
  color: string;           // inactive text color
  activeColor: string;     // active text color
  glowColor: string;       // glow color for active line
  glowIntensity: number;   // glow strength
  positionY: number;       // 0 - 100 percentage
  positionX?: number;      // 0 - 100 percentage (default 50)
  alignment: 'center' | 'left' | 'right';
  style: LyricsStyle;
  karaokeSweepMode?: KaraokeSweepMode;
  showRomajiOrTranslation?: boolean;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'capitalize';
  fontWeight?: 'normal' | 'medium' | 'bold' | '900';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontEffect?: LyricsFontEffect;
  fontEffectColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  showBackgroundPill: boolean;
  pillColor: string;
  pillOpacity: number;
  pillBlur: number;
}

export type BackgroundType = 'preset' | 'upload' | 'video' | 'gradient' | 'solid';

export type BackgroundZoomTrigger = 'bass' | 'beat' | 'hybrid';
export type BackgroundZoomStyle = 'pulse' | 'smooth' | 'shake' | 'breathe';

export type BackgroundGlitchTrigger = 'beat' | 'bass' | 'continuous' | 'random';
export type BackgroundGlitchStyle = 'rgb-shift' | 'slice-displacement' | 'vhs-tape' | 'cyber-digital';

export interface BackgroundConfig {
  type: BackgroundType;
  url: string;
  isVideo?: boolean;
  videoUrl?: string;
  color1: string;
  color2: string;
  gradientAngle: number;
  blur: number;         // px 0 to 30
  brightness: number;   // 0 to 200% (default 85%)
  contrast: number;     // 50 to 150%
  vignette: number;     // 0 to 100%
  beatZoom: boolean;    // Zooms in slightly on bass kick / music beat
  zoomTrigger?: BackgroundZoomTrigger; // 'bass' | 'beat' | 'hybrid'
  zoomIntensity?: number; // 0.01 to 0.15 (1% to 15% zoom, default 0.05)
  zoomSpeed?: number;     // 0.4 to 3.0 (Slow 0.4x to Fast/Instant 3.0x, default 1.0)
  zoomStyle?: BackgroundZoomStyle; // 'pulse' | 'smooth' | 'shake' | 'breathe'
  zoomInvert?: boolean;   // Zoom Out instead of Zoom In on beat
  glitchEffect?: boolean; // Hiệu ứng nhiễu sóng giật hình Glitch
  glitchIntensity?: number; // 0.1 to 1.0 (default 0.4)
  glitchTrigger?: BackgroundGlitchTrigger; // 'bass' | 'beat' | 'continuous' | 'random'
  glitchStyle?: BackgroundGlitchStyle; // 'rgb-shift' | 'slice-displacement' | 'vhs-tape' | 'cyber-digital'
  glitchColorSplit?: boolean; // Tách sắc sai RGB Chromatic Aberration
  filmGrain: boolean;
}

export type ParticleType = 
  | 'none' 
  | 'snow'             // Mưa tuyết rơi mùa đông (Snowfall with Wind Direction)
  | 'spinning-dashes'  // Đoạn thẳng ngắn vừa rơi vừa xoay 360° theo nhịp Bass
  | 'spaghetti'        // Sợi mì Spaghetti vàng óng / neon rơi mềm mại
  | 'sound-sparks'     // Tia lửa bốc cháy rực rỡ
  | 'rainbow-bubbles'  // Bong bóng xà phòng cầu vồng ngũ sắc lấp lánh
  | 'hyperspace'       // Tăng tốc vũ trụ Hyperspace warp-speed
  | 'dust' 
  | 'stars' 
  | 'bubbles' 
  | 'rain' 
  | 'audio-rings';

export type ParticleShape = 'circle' | 'square' | 'star' | 'heart' | 'diamond' | 'ring';
export type ParticleColorMode = 'custom' | 'rainbow' | 'fire' | 'neon-pulse' | 'audio-reactive';

export type SnowFlakeType = 'mixed' | 'crystal' | 'flurry' | 'glitter';
export type RainDropType = 'mixed' | 'streaks' | 'drizzle' | 'heavy' | 'neon-glow';

export interface ParticleConfig {
  enabled: boolean;
  type: ParticleType;
  count: number;
  speed: number;
  color: string;
  secondaryColor?: string;
  shape?: ParticleShape;
  colorMode?: ParticleColorMode;
  glowIntensity?: number; // 0 to 30
  sizeScale?: number;     // 0.5 to 3.0
  reactiveToBeat: boolean;
  bassReactiveColor?: boolean; // Dynamically link particle color to bass intensity & flash brighter on beat drops
  bassFlashBoost?: number;    // 0.5 to 2.5 multiplier

  // Snow & Wind Dynamics
  snowWindAngle?: number;     // -60 to +60 degrees (- left, + right, 0 straight down)
  snowWindSpeed?: number;     // 0.2 to 3.0 wind speed multiplier
  snowTurbulence?: number;    // 0 to 100% wind turbulence / sway
  snowFlakeType?: SnowFlakeType; // 'mixed' | 'crystal' | 'flurry' | 'glitter'

  // Rain & Wind Dynamics
  rainWindAngle?: number;     // -60 to +60 degrees (- left, + right, 0 straight down)
  rainWindSpeed?: number;     // 0.2 to 3.0 wind speed multiplier
  rainTurbulence?: number;    // 0 to 100% wind turbulence / sway
  rainDropType?: RainDropType; // 'mixed' | 'streaks' | 'drizzle' | 'heavy' | 'neon-glow'
  rainLengthScale?: number;   // 0.5 to 3.0 length multiplier of raindrops
  rainSplash?: boolean;       // Hiệu ứng giọt nước bắn tung tóe / ripple khi chạm đáy
}

export type FilmLightStyle = 
  | 'vintage-leak'       // Vệt Cháy Phim Vintage 35mm (Warm Amber / Red organic light leaks)
  | 'anamorphic-flare'   // Vệt Sáng Xanh Anamorphic Cinema (Horizontal wide blue/cyan anamorphic flare)
  | 'prism-rainbow'      // Tán Sắc Cầu Vồng Lăng Kính Prism (Dreamy chromatic rainbow light beam)
  | 'golden-hour'        // Ánh Nắng Hoàng Hôn Golden Hour (Rich warm sunny solar rays)
  | 'neon-cyber-leak'    // Cháy Sáng Neon Cyberpunk (Hot pink/magenta & electric cyan dual leaks)
  | 'retro-projector'    // Đèn Chiếu Phim Cổ Điển 8mm (Vintage film projector cone beam with shutter pulse)
  | 'lens-optical-flare' // Vệt Lóa Ống Kính Đa Điểm (Multi-ring optical lens flare with ghost discs)
  | 'film-burn-cycle';   // Vệt Cháy Lửa Dynamic Film Burn (Organic dynamic animated film burn hot-spots)

export type FilmLightPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'top-edge' | 'dynamic-float';
export type FilmLightBlendMode = 'screen' | 'lighter' | 'color-dodge' | 'overlay' | 'soft-light';

export interface FilmLightConfig {
  enabled: boolean;
  style: FilmLightStyle;
  intensity: number;      // 0.1 to 1.0 (default 0.65)
  speed: number;          // 0.2 to 3.0 (default 1.0)
  blendMode: FilmLightBlendMode;
  position: FilmLightPosition;
  primaryColor: string;   // e.g. '#ff7a00' or '#38bdf8'
  secondaryColor: string; // e.g. '#ff0055' or '#818cf8'
  tertiaryColor?: string; // e.g. '#ffd700'
  scale: number;          // 0.5 to 2.5 (default 1.0)
  reactiveToBeat: boolean;// Pulses flare intensity & size on bass/beat
  beatFlashBoost: number; // 0.2 to 2.5 (default 1.2)
  filmDustScratches: boolean; // 35mm film dust specks & hair scratches
  dustIntensity: number;  // 0.1 to 1.0 (default 0.35)
  lensFlicker: boolean;   // Vintage film shutter projector flicker
  flickerSpeed: number;   // 0.5 to 2.0 (default 1.0)
  chromaticAberration: boolean; // RGB color fringe at screen borders
  vignetteWarmth: boolean;// Warm golden film edge shading
}

export type ColorGradingLUT =
  | 'none'
  | 'teal-orange'
  | 'cinematic-warm'
  | 'bleach-bypass'
  | 'cyberpunk-neon'
  | 'vintage-70s'
  | 'golden-hour'
  | 'black-and-white'
  | 'faded-film'
  | 'retro-vhs'
  | 'matrix-green'
  | 'moody-blue'
  | 'candy-pop';

export interface ColorGradingConfig {
  enabled: boolean;
  lut: ColorGradingLUT;
  lutIntensity: number; // 0.0 to 1.0 (default 1.0)
  
  // Basic Tonal Adjustments (-100 to 100, default 0)
  brightness: number;  // -100 to +100
  contrast: number;    // -100 to +100
  saturation: number;  // -100 to +100
  exposure: number;    // -100 to +100
  
  // White Balance & Color Tone
  temperature: number; // -100 (Cool Cyan/Blue) to +100 (Warm Amber/Gold)
  tint: number;        // -100 (Green) to +100 (Magenta)
  hueRotate: number;   // -180 to +180 deg
  
  // Stylistic Film Tones
  sepia: number;       // 0 to 100
  shadowsLift: number; // 0 to 100 (Fade blacks / milky shadows)
  highlightsTint?: string; // Hex color for highlights split toning
  shadowsTint?: string;    // Hex color for shadows split toning
  splitToneIntensity: number; // 0 to 100
  
  // Film Optics & Grain
  vignette: number;        // 0 to 100
  vignetteFeather: number; // 20 to 100 (default 65)
  vignetteColor: string;   // Hex color (default '#000000')
  filmGrain: number;       // 0 to 100
  bloomGlow: number;       // 0 to 100 (Diffusion glow)
}

export type CardStyle = 'vinyl' | 'glass-card' | 'circular-badge' | 'rotating-badge' | 'logo-badge' | 'minimal-tag' | 'hidden';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'badge-center';

export type BadgeBeatJumpStyle = 'pulse' | 'bounce-up' | 'scale-rotate' | 'jelly' | 'shake';

export type TrackLayerOrder = 'behind-visualizer' | 'front-visualizer' | 'back-all' | 'front-all';

export interface TrackMetadata {
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  badgePngUrl?: string;      // Dedicated PNG badge image (independent of Brand Logo)
  logoUrl?: string;          // Custom uploaded transparent PNG logo
  showLogo?: boolean;         // Toggle logo watermark/brand
  logoPosition?: LogoPosition; // Position corner / center
  logoScale?: number;         // 0.3 to 2.5
  logoOpacity?: number;       // 0.1 to 1.0
  logoGlow?: boolean;         // Neon halo around logo
  badgeBeatJump?: boolean;    // Nhảy nảy theo nhịp Beat / Bass cho Badge & Thẻ bài hát
  badgeBeatJumpIntensity?: number; // Cường độ nảy (0.05 to 0.5, default 0.18)
  badgeBeatJumpStyle?: BadgeBeatJumpStyle; // 'pulse' | 'bounce-up' | 'scale-rotate' | 'jelly' | 'shake'
  badgeBeatGlow?: boolean;    // Tỏa hào quang rực rỡ bùng nổ theo nhịp Bass
  layerOrder?: TrackLayerOrder; // Thứ tự lớp hiển thị (Phía sau sóng âm, phía trước sóng âm, phía sau tất cả, trên cùng)
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

export type TextBoxLayerOrder = 
  | 'back-all'            // Behind everything (right above background)
  | 'behind-track'        // Behind Track Card / Album Vinyl
  | 'behind-visualizer'   // Behind Visualizer Wave Synth
  | 'behind-lyrics'       // Behind Lyrics text
  | 'front-all';          // In front of everything (topmost)

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
  layerOrder?: TextBoxLayerOrder; // Order layer: back/front of Wave, Lyrics, Title, etc.
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
  filmLight?: FilmLightConfig;
  colorGrading?: ColorGradingConfig;
  masterEq?: MasterEQConfig;
  track: TrackMetadata;
  textBoxes?: TextBoxItem[];
  isUserPreset?: boolean;
  createdAt?: number;
  sampleAudio?: {
    title: string;
    artist: string;
    type: 'lofi' | 'synthwave' | 'acoustic' | 'edm';
    lyrics: string;
  };
}

export type MasterEQPreset = 
  | 'flat'
  | 'bass-boost'
  | 'sub-punch'
  | 'vocal-clarity'
  | 'acoustic-warmth'
  | 'edm-club'
  | 'rock-metal'
  | 'lofi-vintage'
  | 'cinematic-air'
  | 'podcast-clean'
  | string;

export interface MasterEQCustomPreset {
  id: string;             // e.g. "custom-eq-1712345678"
  name: string;           // User provided name, e.g. "My Heavy Bass Boost"
  createdAt: number;      // Timestamp
  preampGain: number;     // -12 to +12 dB
  lowCutFreq: number;     // 0, 20, 40, 80 Hz
  highCutFreq: number;    // 20000, 18000, 15000, 12000 Hz
  bands: MasterEQBands;
}

export interface MasterEQBands {
  b32: number;   // 32 Hz (-15 to +15 dB)
  b64: number;   // 64 Hz (-15 to +15 dB)
  b125: number;  // 125 Hz (-15 to +15 dB)
  b250: number;  // 250 Hz (-15 to +15 dB)
  b500: number;  // 500 Hz (-15 to +15 dB)
  b1k: number;   // 1 kHz (-15 to +15 dB)
  b2k: number;   // 2 kHz (-15 to +15 dB)
  b4k: number;   // 4 kHz (-15 to +15 dB)
  b8k: number;   // 8 kHz (-15 to +15 dB)
  b16k: number;  // 16 kHz (-15 to +15 dB)
}

export interface MasterEQConfig {
  enabled: boolean;        // Active vs Bypassed
  preset: MasterEQPreset;  // Current selected preset or 'custom'
  preampGain: number;      // -12 to +12 dB (default 0)
  lowCutFreq: number;      // 0 (off), 20, 40, 80 Hz
  highCutFreq: number;     // 20000 (off), 18000, 15000, 12000 Hz
  bands: MasterEQBands;
}
