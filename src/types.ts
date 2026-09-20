export type AspectRatio = '9:16' | '1:1' | '16:9' | '4:5';

export type VisualizerType = 
  | 'bars-peaks'             // Classic spectrum bars with falling peak caps/gravity dots
  | 'bars-mirrored-peaks'    // Mirrored bars with dual falling peak dots
  | 'bars-mirrored'          // Top & bottom mirrored bars
  | 'bars'                   // Classic vertical audio spectrum bars
  | 'spectrum-bars-simple'   // Simple column spectrum (clean minimalist vertical bars)
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
  | 'audio-equalizer-grid'   // Multi-tiered floating digital EQ cascade blocks
  // 3D.js (Three.js WebGL) Visualizers:
  | '3d-cube-matrix'         // 3D Audio Cube Equalizer Matrix Field
  | '3d-sphere-waveform'     // 3D Cyber Wireframe Audio Sphere / Icosahedron
  | '3d-wave-terrain'        // 3D Synthwave Cyberpunk Wireframe Landscape
  | '3d-solar-system'        // 3D Cosmic Solar Planetary Galaxy System
  | '3d-fluid-shape'         // 3D Transparent Fluid Morphing Shape Pulsing to Music Rhythm
  | '3d-bezier-mesh'         // 3D Bezier Polygon Line Network (Plexus/Constellation Web)
  | '3d-raycaster'           // 3D Ray Caster Field with Line and Head Dots (Stanford Bunny / Mesh Normal Rays)
  | '3d-spiral-galaxy';      // 3D Particle Spiral Galaxy with Glowing Core, Nebula Arms & Audio Star Pulses

export interface ThreeDVisualizerSettings {
  [key: string]: any;
  // Universal 3D Viewport Controls
  cameraDistance?: number;     // 15 to 80 (default 38)
  cameraAngleX?: number;       // -80 to +80 deg (tilt)
  cameraAngleY?: number;       // -180 to +180 deg (orbit)
  autoRotate?: boolean;        // default true
  autoRotateSpeed?: number;    // 0.2 to 5.0 (default 1.0)
  wireframe?: boolean;         // wireframe vs solid mesh
  lightIntensity?: number;     // 0.2 to 3.0 (default 1.5)
  lightColor?: string;         // Point light tint
  depthScale?: number;         // 0.5 to 3.0 (z-scale)

  // 3D Spatial Position Offset (Move X, Y, Z)
  moveX?: number;              // -50 to +50 (default 0)
  moveY?: number;              // -50 to +50 (default 0)
  moveZ?: number;              // -50 to +50 (default 0)

  // 3D Spatial Rotation Angles (Rotate X, Y, Z in degrees)
  rotateX?: number;            // -180 to +180 deg (default 0)
  rotateY?: number;            // -180 to +180 deg (default 0)
  rotateZ?: number;            // -180 to +180 deg (default 0)

  // Global Post-Processing Bloom Effect (Hào Quang Phát Sáng Hậu Kỳ Three.js)
  bloomEnabled?: boolean;      // Bật/tắt hiệu ứng Bloom phát quang toàn cục (default true)
  bloomStrength?: number;     // 0.2 to 3.5 (default 1.6)
  bloomRadius?: number;       // 0.1 to 1.5 (default 0.75)
  bloomThreshold?: number;    // 0.0 to 0.8 (default 0.15)
  bloomBassBoost?: boolean;   // Tăng cường phát sáng chói lóa cực mạnh theo âm bass / beat kicks (default true)

  // Universal Flowing Light Feature (Tính năng Ánh Sáng Chạy / Flowing Wave)
  flowingLight?: boolean;      // Bật/tắt dải sáng luân chuyển / sóng ánh sáng chạy (default true)
  flowingLightSpeed?: number;  // 0.2 to 4.0 (default 1.5)
  flowingLightIntensity?: number; // 0.2 to 3.0 (default 1.6)
  flowingLightColor?: string;  // Custom tint or auto
  flowingLightMode?: 'neon-wave' | 'rainbow-stream' | 'laser-pulse' | 'audio-reactive'; // Chế độ luồng sáng
  flowingLightWidth?: number;  // 0.5 to 3.0 (default 1.2)

  // 1. 3D Cube Matrix Settings
  cubeGridSize?: number;       // 6, 8, 10, 12 (default 8)
  cubeSpacing?: number;        // 0.1 to 1.0 (default 0.35)
  cubeHeightScale?: number;    // 0.5 to 3.5 (default 1.6)
  cubeShading?: 'metallic' | 'phong' | 'wireframe' | 'glow-edges';

  // 2. 3D Sphere Waveform Settings (Quả Cầu Tần Số 3D)
  sphereRadius?: number;       // 6 to 25 (default 13)
  sphereDetail?: number;       // 1 to 4 (default 2)
  sphereSpikeIntensity?: number; // 0.2 to 3.0 (default 1.4)
  sphereStyle?: 'solid-facets' | 'wireframe' | 'particles' | 'dual-shell';
  sphereOpacity?: number;      // 0.05 to 1.0 (default 0.85) - Độ trong suốt / opacity của đa giác
  sphereRoughness?: number;    // 0.0 to 1.0 (default 0.25)
  sphereMetalness?: number;    // 0.0 to 1.0 (default 0.6)
  sphereMaterial?: 'crystal-glass' | 'neon-glow' | 'metallic-poly' | 'matte-clay' | 'hologram';
  sphereColorMode?: 'gradient-duo' | 'primary-single' | 'audio-reactive' | 'rainbow-flow';
  sphereWireframeEdges?: boolean; // Hiển thị viền cạnh đa giác sắc nét
  sphereCorePulse?: boolean;   // deprecated

  // 3. 3D Wave Terrain Settings (Địa Hình Cyberpunk 3D)
  terrainResolution?: number;  // 20 to 60 (default 36)
  terrainSpeed?: number;       // 0.2 to 3.0 (default 1.0)
  terrainHeightScale?: number; // 0.5 to 3.0 (default 1.4)
  terrainRenderMode?: 'solid' | 'wireframe' | 'solid-wireframe'; // Dạng đặc (solid fill), dạng lưới (wireframe), hoặc kết hợp cả 2
  terrainEnvReflection?: boolean; // Bật phản chiếu môi trường / ảnh background
  terrainReflectionIntensity?: number; // 0.0 to 1.0 (default 0.85)
  terrainRoughness?: number;   // 0.0 to 1.0 (default 0.18) - Độ nhám mờ / gương bóng
  terrainMetalness?: number;   // 0.0 to 1.0 (default 0.75) - Độ phản xạ kim loại
  terrainOpacity?: number;     // 0.2 to 1.0 (default 0.95) - Độ trong suốt mặt địa hình
  terrainCyberSun?: boolean;   // Deprecated / removed as requested
  terrainSunColor?: string;

  // 4. 3D Solar System & Planetary Galaxy Settings (Hệ Thiên Hà 3D)
  solarSunSize?: number;       // 3 to 10 (default 5.5)
  solarOrbitSpeed?: number;    // 0.2 to 3.0 (default 1.0)
  solarPlanetCount?: number;   // 4 to 8 (default 6)
  solarPlanetSizeScale?: number; // 0.5 to 2.5 (default 1.0)
  solarShowOrbits?: boolean;   // default true
  solarAsteroidBelt?: boolean; // default true
  solarSaturnRings?: boolean;  // default true
  solarSunPulse?: number;      // 0.5 to 3.0 (default 1.5)
  solarAsteroidSize?: number;  // 0.6 to 4.0 (default 1.8 - Cỡ vì sao khối tròn)
  solarAsteroidCount?: number; // 200 to 1200 (default 550)
  solarStarShape?: 'circle' | 'celestial-ray'; // Dạng tròn (mặc định) hoặc dạng tròn có tia sáng

  // 5. 3D Transparent Fluid Shape Settings (Khối Chất Lỏng 3D Trong Suốt)
  fluidRadius?: number;        // 6 to 22 (default 12)
  fluidDetail?: number;        // 3 to 6 (default 4)
  fluidTurbulence?: number;    // 0.4 to 3.0 (default 1.5)
  fluidSpeed?: number;         // 0.4 to 3.0 (default 1.2)
  fluidOpacity?: number;       // 0.0 to 1.0 (default 0.72)
  fluidRoughness?: number;     // 0.02 to 0.7 (default 0.1)
  fluidMetalness?: number;     // 0.0 to 0.9 (default 0.25)
  fluidTransmission?: number;  // 0.0 to 1.0 (default 0.65)
  fluidDroplets?: boolean;     // default true (giọt nước li ti xung quanh)
  fluidWireframe?: boolean;    // default false (chế độ khung dây)
  fluidEnvReflection?: boolean; // default true (phản chiếu môi trường)
  fluidReflectionIntensity?: number; // 0.0 to 2.0 (default 0.85)
  fluidStyle?: 'translucent-glass' | 'iridescent' | 'neon-plasma' | 'liquid-chrome' | 'ocean-water';

  // 6. 3D Bezier Polygon Line Network Settings (Mạng Lưới Đa Giác Bezier 3D / Plexus)
  bezierNodeCount?: number;     // 80 to 300 (default 150)
  bezierMaxDistance?: number;   // 6 to 18 (default 10)
  bezierBoxSize?: number;       // 20 to 60 (default 36)
  bezierLineWidth?: number;     // 1 to 4 (default 1.5)
  bezierSpeed?: number;         // 0.2 to 3.0 (default 1.0)
  bezierAudioDisplace?: number; // 0.2 to 3.0 (default 1.4)
  bezierShowPoints?: boolean;   // default true (hiển thị hạt đỉnh)
  bezierPointSize?: number;     // 1 to 6 (default 2.5)

  // 7. 3D Ray Caster Field Settings (Tia Phóng / Normal Ray Caster có Hạt Đỉnh)
  rayCount?: number;            // 60 to 350 (default 160)
  rayLength?: number;           // 5 to 35 (default 16)
  rayHeadDotSize?: number;      // 1 to 8 (default 3.0)
  rayDotShape?: 'square' | 'circle' | 'star'; // default 'circle' (Vuông, tròn, sao 5 cánh)
  rayModelShape?: 'bunny' | 'torus-knot' | 'sphere' | 'cylinder'; // (deprecated)
  rayAudioPulse?: number;       // 0.2 to 3.0 (default 1.5)
  rayCoreOpacity?: number;      // 0.1 to 1.0 (default 0.9)
  rayShowCore?: boolean;        // default true (hiển thị mô hình vật thể lõi)

  // 8. 3D Spiral Galaxy Settings (Dải Ngân Hà Xoắn Ốc Vũ Trụ)
  galaxyStarCount?: number;     // 2000 to 20000 (default 8500)
  galaxyParticleCount?: number; // alias for galaxyStarCount
  galaxyArms?: number;          // 2 to 8 (default 4)
  galaxyRadius?: number;        // 15 to 45 (default 26)
  galaxySpin?: number;          // 0.4 to 3.0 (default 1.2)
  galaxyRandomness?: number;    // 0.1 to 1.5 (default 0.45)
  galaxyPower?: number;         // 2.0 to 6.0 (default 3.5 - radial power distribution)
  galaxyPointSize?: number;     // 0.8 to 6.5 (default 2.4)
  galaxyParticleSize?: number;  // alias for galaxyPointSize
  galaxyCoreBrightness?: number;// (deprecated / removed)
  galaxyCoreColor?: string;     // '#fff7ed' / warm golden core
  galaxyAudioDisplace?: number; // 0.2 to 3.0 (default 1.4)
  galaxySwirlSpeed?: number;    // 0.2 to 3.0 (default 1.0)
}

export type VisualizerColorMode = 'solid' | 'gradient2' | 'gradient3' | 'rainbow' | 'neon-glow';

export interface VisualizerConfig {
  visible?: boolean;     // Bật / tắt hiển thị sóng âm Visualizer (default true)
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
  verticalReflection?: boolean; // Bật bóng phản chiếu dọc của sóng âm (Vertical Reflection)
  reflectionOpacity?: number;   // Độ mờ phản chiếu: 0.05 to 1.0 (mặc định 0.35)
  reflectionPositionY?: number; // Vị trí trục phản chiếu dọc: 0 to 100% (mặc định theo positionY hoặc 75%)
  reflectionFade?: boolean;     // Mờ dần theo khoảng cách Gradient Fade (mặc định true)
  lineThickness: number;
  fillOpacity: number;
  // 3D.js Visualizer Custom Settings
  threeDSettings?: ThreeDVisualizerSettings;
}

export interface LyricLine {
  id: string;
  startTime: number; // seconds (thời gian bắt đầu hiển thị câu trên màn hình)
  endTime: number;   // seconds (thời gian kết thúc hiển thị câu trên màn hình)
  text: string;
  // Karaoke timing riêng cho từng câu (thời gian hát / quét màu):
  karaokeStartTime?: number; // seconds (thời gian bắt đầu quét màu karaoke, mặc định = startTime)
  karaokeEndTime?: number;   // seconds (thời gian kết thúc quét màu karaoke, ví dụ: 00:12.8 thay vì 00:14.8)
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
  // Circle Ripple Effect (Gợn sóng tròn đồng tâm phản hồi theo nhịp nhạc)
  circleRipple?: boolean;             // Bật hiệu ứng sóng gợn tròn (Circle Ripple)
  circleRippleColor?: string;          // Màu gợn sóng (Hex, mặc định '#ffffff' hoặc neon)
  circleRippleOpacity?: number;        // Độ mờ đục 0.05 to 1.0 (mặc định 0.4)
  circleRippleCount?: number;          // Số lượng vòng tròn đồng tâm (1 đến 8, mặc định 4)
  circleRippleSpeed?: number;          // Tốc độ lan tỏa (0.2x đến 3.0x, mặc định 1.0)
  circleRippleLineWidth?: number;      // Độ dày nét viền (1px đến 12px, mặc định 2.5)
  circleRippleReactive?: boolean;      // Phản ứng nảy nở theo nhịp Bass / Beat
  circleRippleGlow?: boolean;          // Hào quang phát sáng Neon cho viền sóng
  circleRippleOrigin?: 'center' | 'bottom' | 'cover'; // Tâm lan tỏa sóng
}

export type ParticleType = 
  | 'none' 
  | 'rain'             // Mưa Rơi Tự Nhiên
  | 'snow'             // Mưa tuyết rơi mùa đông (Snowfall with Wind Direction)
  | 'speed-lines'      // Đường vạch tốc độ (Speed Lines) lặp lại: song song ngang hoặc hướng tâm
  | 'spaghetti'        // Mưa mảnh ruy băng lụa mềm mại (Silk Ribbon Rain - formerly Spaghetti)
  | 'silk-ribbon'      // Alias for Mưa mảnh ruy băng lụa
  | 'spinning-dashes'  // Đoạn thẳng ngắn vừa rơi vừa xoay 360° theo nhịp Bass
  | 'rainbow-bubbles'  // Bong bóng xà phòng cầu vồng ngũ sắc lấp lánh
  | 'hyperspace'       // Tăng tốc vũ trụ Hyperspace warp-speed
  | 'dust' 
  | 'stars' 
  | 'bubbles' 
  | 'audio-rings';

export type ParticleShape = 'circle' | 'square' | 'star' | 'heart' | 'diamond' | 'ring' | 'silk-fluff';
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
  glowIntensity?: number; // 0 to 50
  sizeScale?: number;     // 0.5 to 3.0
  reactiveToBeat: boolean;
  bassReactiveColor?: boolean; // Dynamically link particle color to bass intensity & flash brighter on beat drops
  bassFlashBoost?: number;    // 0.5 to 2.5 multiplier

  // 1. Speed Lines Dynamics (Đường vạch tốc độ lặp lại)
  speedLineMode?: 'horizontal' | 'converge-center'; // 1. Chạy song song chiều ngang ảnh, 2. Theo chiều đứng về tâm (như ảnh vẽ tay)
  speedLineLength?: number;       // Chiều dài cơ sở (30 đến 450, mặc định 140)
  speedLineRandomLength?: number; // Độ dài ngẫu nhiên / phân tán (0 đến 100%, mặc định 55%)
  speedLineWidth?: number;        // Độ dày nét (1px đến 14px, mặc định 2.5px)
  speedLineBlur?: number;         // Độ nhòe mờ vệt tốc độ / motion blur (0px đến 22px, mặc định 5px)
  speedLineDirection?: 'left-to-right' | 'right-to-left'; // Hướng chạy song song ngang
  speedLineTilt?: number;          // Độ nghiêng vệt line từ -45 đến 45 độ (mặc định 0°)
  speedLineVerticalCenter?: 'top' | 'center' | 'bottom';  // Vị trí tâm tụ theo chiều đứng: top center, center center, bottom center
  speedLineCenterY?: number;       // Tinh chỉnh tọa độ tâm tụ theo % chiều cao (10% đến 90%, mặc định 50%)
  speedLineHorizontalCenter?: 'left' | 'center' | 'right'; // Vị trí tâm tụ theo chiều ngang: left center, center center, right center
  speedLineCenterX?: number;       // Tinh chỉnh tọa độ tâm tụ theo % chiều rộng (10% đến 90%, mặc định 50%)
  speedLineSpeed?: number;         // Tốc độ chuyển động vệt line (0.2x đến 3.5x, mặc định 1.0x)

  // 2. Silk Ribbon Rain Dynamics (Mưa Mảnh Ruy Băng Lụa - nâng cấp từ Spaghetti)
  ribbonLength?: number;          // Độ dài / ngắn của dải ruy băng lụa (50px đến 500px, mặc định 160px)
  ribbonThickness?: number;       // Độ dày / bản dẹt ruy băng lụa (2px đến 32px, mặc định 8px)
  ribbonTwist?: number;           // Độ xoắn lượn sóng 3D (0.5 đến 4.5, mặc định 1.8)
  ribbonGlow?: number;            // Vầng sáng phát quang dạ quang lụa (0px đến 35px, mặc định 15px)

  // 3. Fluffy Silk Ball & Bokeh Particle Settings (Bóng Tơ Mềm / Lofi / Stars)
  silkFluffGlow?: boolean;        // Bật chế độ bóng tơ mềm viền phát sáng mờ êm
  particleGlowRadius?: number;    // Bán kính phát sáng mở rộng (0 đến 50px)

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

  // WebGL Stereo 3D Rain Effect (threejs.org/examples/#webgl_effects_stereo)
  stereoRainEnabled?: boolean; // Bật hiệu ứng Stereo 3D WebGL cho mưa
  stereoRain?: boolean;        // Alias for stereoRainEnabled
  stereoMode?: 'split-screen' | 'anaglyph' | 'depth-parallax'; // Chế độ Stereo VR (Chia đôi màn hình Trái/Phải), Kính 3D Đỏ-Xanh (Anaglyph), hoặc Depth Parallax
  stereoRainMode?: 'split-screen' | 'anaglyph' | 'depth-parallax'; // Alias for stereoMode
  stereoEyeSeparation?: number; // 0.01 to 0.2 (khoảng cách 2 mắt, mặc định 0.064)
  stereoRainEyeSeparation?: number; // Alias for stereoEyeSeparation
  stereoFocalLength?: number;   // 10 to 60 (tiêu cự hội tụ 3D, mặc định 25)
  stereoRainGlow?: boolean;     // Hiệu ứng phát sáng 3D cho giọt mưa

  // Three.js Water on Glass (Raindrops on Window / Camera Lens)
  waterOnGlass?: boolean;       // Bật hiệu ứng giọt nước mưa bám mặt kính chân thực (Three.js WebGL Glass Beads)
  waterGlassCount?: number;     // 30 to 200 (số lượng giọt nước đọng trên kính)
  waterGlassRefraction?: number; // 0.2 to 2.5 (độ khúc xạ & lúp cầu ánh sáng của giọt nước)
  waterGlassTrickleSpeed?: number; // 0.2 to 3.0 (tốc độ giọt nước trượt chảy xuống mặt kính)
  waterGlassWipeMist?: boolean; // Hiệu ứng mờ hơi nước sương mù nhẹ trên kính
  waterGlassLighting?: 'cinematic-blue' | 'golden-bokeh' | 'neon-glow' | 'pure-clear'; // Ánh sáng môi trường phản chiếu trên giọt nước kính
  waterGlassBlur?: number;      // 0 to 10 (độ mờ nhòe quang học của nền phía sau kính)
  waterGlassTrailTrails?: boolean; // Vệt nước trượt kéo dài đằng sau giọt nước chảy
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

export type CardStyle = 
  | 'vinyl' 
  | 'glass-card' 
  | 'circular-badge' 
  | 'rotating-badge' 
  | 'logo-badge' 
  | 'minimal-tag' 
  | 'horizontal-rounded-card' // Thẻ Bo Góc Viền Đậm 3 Dòng (Bìa bo góc bên trái, Subtitle, Title, Artist bên phải)
  | 'hidden';

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'badge-center' | 'custom';

export type BadgeBeatJumpStyle = 'pulse' | 'bounce-up' | 'scale-rotate' | 'jelly' | 'shake';

export type TrackLayerOrder = 'behind-visualizer' | 'front-visualizer' | 'back-all' | 'front-all';

export type TrackDetailElement = 'subtitle' | 'title' | 'artist';

export type TrackFontWeight = 'normal' | '500' | '600' | 'bold' | '900';

export type TrackFontStyle = 'normal' | 'italic' | 'bold' | 'bold-italic' | 'uppercase';

export type LogoAnimation = 'none' | 'vertical-spin-3d' | 'circular-spin';

export type TrackFontEffect = 
  | 'none' 
  | 'neon-glow' 
  | 'double-stroke' 
  | '3d-shadow' 
  | 'gradient' 
  | 'comic-pop' 
  | 'metallic-chrome';

export interface TrackMetadata {
  title: string;
  artist: string;
  subtitle?: string;         // Phụ đề / thông điệp nằm trên tiêu đề chính (hoặc theo thứ tự tùy chọn)
  album?: string;
  coverUrl: string;
  badgePngUrl?: string;      // Dedicated PNG badge image (independent of Brand Logo)
  logoUrl?: string;          // Custom uploaded transparent PNG logo
  showLogo?: boolean;         // Toggle logo watermark/brand
  logoPosition?: LogoPosition; // Position corner / center / custom
  logoPositionX?: number;     // 0 to 100% (horizontal position)
  logoPositionY?: number;     // 0 to 100% (vertical position)
  logoScale?: number;         // 0.3 to 2.5
  logoOpacity?: number;       // 0.1 to 1.0
  logoGlow?: boolean;         // Neon halo around logo
  logoAnimation?: LogoAnimation; // 'none' | 'vertical-spin-3d' (xoay 360 trục đứng) | 'circular-spin' (xoay tròn)
  logoAnimationSpeed?: number;   // 0.2 to 3.0 (default 1.0)
  badgeBeatJump?: boolean;    // Nhảy nảy theo nhịp Beat / Bass cho Badge & Thẻ bài hát
  badgeBeatJumpIntensity?: number; // Cường độ nảy (0.05 to 0.5, default 0.18)
  badgeBeatJumpStyle?: BadgeBeatJumpStyle; // 'pulse' | 'bounce-up' | 'scale-rotate' | 'jelly' | 'shake'
  badgeBeatGlow?: boolean;    // Tỏa hào quang rực rỡ bùng nổ theo nhịp Bass
  layerOrder?: TrackLayerOrder; // Thứ tự lớp hiển thị (Phía sau sóng âm, phía trước sóng âm, phía sau tất cả, trên cùng)
  showTrackCard: boolean;
  showTitle: boolean;
  showArtist: boolean;
  showSubtitle?: boolean;     // Bật/tắt hiển thị Phụ đề (Subtitle)
  cardStyle: CardStyle;
  positionX: number; // 0 to 100% (default 50)
  positionY: number; // 0 to 100% (default 30)
  scale: number;     // 0.4 to 2.5 (default 1.0)
  fontFamily: string; // Base / default font family
  
  // Custom font names for each of the 3 elements
  subtitleFontFamily?: string;
  titleFontFamily?: string;
  artistFontFamily?: string;

  // Custom font styles & weights for each element
  subtitleFontStyle?: TrackFontStyle;
  titleFontStyle?: TrackFontStyle;
  artistFontStyle?: TrackFontStyle;

  subtitleFontWeight?: TrackFontWeight;
  titleFontWeight?: TrackFontWeight;
  artistFontWeight?: TrackFontWeight;

  subtitleItalic?: boolean;
  titleItalic?: boolean;
  artistItalic?: boolean;

  subtitleUppercase?: boolean;
  titleUppercase?: boolean;
  artistUppercase?: boolean;

  // Spacing gaps between titles
  subtitleTitleGap?: number; // Khoảng cách giữa Subtitle và Main Title (px, default 6)
  titleArtistGap?: number;    // Khoảng cách giữa Main Title và Artist (px, default 8)

  // Font sizes for each element
  subtitleFontSize?: number;  // px (default 13)
  titleFontSize: number;      // px (default 22)
  artistFontSize: number;     // px (default 15)

  // Font effects for each element
  subtitleFontEffect?: TrackFontEffect;
  titleFontEffect?: TrackFontEffect;
  artistFontEffect?: TrackFontEffect;

  // Colors
  subtitleColor?: string;     // Color for subtitle
  textColor: string;          // Color for main title
  artistColor: string;        // Color for artist
  accentColor: string;        // Accent / highlight color (e.g. orange #f97316)

  // Layout order of the 3 elements (Default: ['subtitle', 'title', 'artist'])
  trackDetailsOrder?: TrackDetailElement[];

  // Options for Horizontal Rounded Card (Badge Style)
  badgeBorderColor?: string;   // Màu viền bo góc (mặc định theo accentColor hoặc #f97316)
  badgeBorderWidth?: number;   // Độ dày viền (mặc định 6px)
  badgeBorderRadius?: number;  // Bán kính bo góc viền (mặc định 24px)
  badgeTextGap?: number;       // Khoảng cách giữa ảnh bìa và khối chữ (mặc định 24px)

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

export type TracklistTextFormat = 
  | 'title-duration'        // 01. Song Title (03:45)
  | 'duration-title'        // 01. [03:45] Song Title
  | 'timestamp-title'       // 00:00 - Song Title (Timeline Start Timestamp)
  | 'title-artist-duration' // 01. Song Title - Artist (03:45)
  | 'compact-bullet';       // 1. Song Title • 03:45

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
  visible?: boolean;      // Toggle hidden/show on canvas (default true)

  // Auto Audio Tracklist features
  isTracklist?: boolean;
  tracklistFormat?: TracklistTextFormat;
  tracklistAutoSync?: boolean; // When true, automatically stays in sync with playlist tracks
  tracklistHighlightCurrent?: boolean; // Highlight active playing song with cursor ▶ or accent
  tracklistIncludeHeader?: boolean; // Include 'TRACKLIST' title
  tracklistCustomHeader?: string;
}

export type HardwareAccelerationMode = 'gpu-max' | 'balanced' | 'cpu-safe';

export interface HardwareInfo {
  gpuRenderer: string;
  gpuVendor: string;
  isWebGlSupported: boolean;
  isWebGpuSupported: boolean;
  cpuCores: number;
  deviceMemoryGb?: number;
  hasOffscreenCanvas: boolean;
  supportsDesynchronized: boolean;
  supportsHardwareVideoEncoding: boolean;
}

export interface HardwareAccelerationConfig {
  mode: HardwareAccelerationMode;
  desynchronized: boolean;
  preferHardwareEncoder: boolean;
  showOverlay: boolean;
  multiThreadedAudio: boolean;
}

export type PlaylistRepeatMode = 'off' | 'repeat-all' | 'repeat-one' | 'shuffle';

export interface AudioTrackItem {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  url: string; // Object URL or static URL
  duration: number; // in seconds
  fadeInSec: number; // Fade-in duration (0.0 to 10.0s, default 1.5s)
  fadeOutSec: number; // Fade-out duration (0.0 to 10.0s, default 2.0s)
  volume: number; // Volume trimming multiplier (0.0 to 1.0, default 1.0)
  bpm?: number;
  coverUrl?: string;
  file?: File;
  blob?: Blob;
  lyrics?: LyricLine[];
  rawLyrics?: string;
  lyricsFileName?: string;
  background?: BackgroundConfig; // Custom per-track background image/video & settings
}

export interface PlaylistConfig {
  tracks: AudioTrackItem[];
  currentIndex: number;
  repeatMode: PlaylistRepeatMode;
  crossfadeDuration: number; // 0 to 8 seconds
  autoPlayNext: boolean;
  enableFadeInOut: boolean; // Global toggle for fade-in / fade-out processing
  defaultFadeInSec: number; // Default fade-in for newly imported tracks
  defaultFadeOutSec: number; // Default fade-out for newly imported tracks
}

export type ExportAudioTarget = 'current-track' | 'full-playlist';

export interface ExportSettings {
  resolution: '1080p' | '720p' | '4k';
  fps: 30 | 60;
  qualityBitrate: 'high' | 'ultra' | 'medium';
  startTime: number;
  endTime: number;
  fullSong: boolean;
  hardwareAcceleration?: 'prefer-hardware' | 'auto' | 'software';
  exportAudioTarget?: ExportAudioTarget;
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
  sceneTransitions?: SceneTransitionsConfig;
  track: TrackMetadata;
  textBoxes?: TextBoxItem[];
  lotties?: LottieItem[];
  isUserPreset?: boolean;
  createdAt?: number;
  sampleAudio?: {
    title: string;
    artist: string;
    type: 'lofi' | 'synthwave' | 'acoustic' | 'edm';
    lyrics: string;
  };
}

export type SceneTransitionType = 
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out';

export interface SlideImageItem {
  id: string;
  url: string;
  name: string;
  duration?: number; // Optional individual slide duration override in seconds
}

export interface TimelineSceneItem {
  id: string;
  time: number;                   // Timestamp in seconds (e.g. 0, 15, 30, 45)
  name: string;                   // Scene title (e.g. "Intro", "Drop 1", "Chorus")
  imageId?: string;               // Reference to SlideImageItem ID or custom image
  imageUrl?: string;              // Custom direct image URL
  transitionType: SceneTransitionType;
  transitionDuration: number;     // Seconds (e.g. 1.0)
  // Optional Visualizer preset overrides for this scene
  visualizerType?: VisualizerType;
  visualizerPrimaryColor?: string;
  visualizerSecondaryColor?: string;
  visualizerColorMode?: VisualizerColorMode;
  barCount?: number;
}

export type SceneTransitionsMode = 'slider' | 'timeline' | 'both';

export interface SceneTransitionsConfig {
  enabled: boolean;
  mode: SceneTransitionsMode; // 'slider' = automatic interval slideshow, 'timeline' = cued scenes, 'both' = mixed
  // Multi-image slider
  images: SlideImageItem[];
  sliderInterval: number; // Seconds per slide (default 8s)
  defaultTransition: SceneTransitionType; // Default transition (fade, slide-left, etc.)
  transitionDuration: number; // Transition duration in seconds (default 1.2s)
  sliderLoop: boolean;
  kenBurnsEffect: boolean; // Gentle Ken Burns motion / pan-zoom on background
  // Timeline Cued Scenes
  scenes: TimelineSceneItem[];
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

// ==========================================
// LOTTIE ANIMATIONS & STICKERS TYPES
// ==========================================
export type LottieLayerOrder = 
  | 'back-all'           // Phía sau cùng (ngay trên Background, dưới tất cả)
  | 'behind-visualizer'  // Phía sau Sóng âm (giữa đĩa nhạc và sóng âm)
  | 'front-visualizer'   // Phía trước Sóng âm (trên sóng âm, dưới lời bài hát)
  | 'front-all';         // Phía trước tất cả (lên trên cùng màn hình)

export interface LottieItem {
  id: string;
  name: string;
  category?: 'music' | 'neon' | 'lofi' | 'effects' | 'custom';
  url: string;              // Đường dẫn file Lottie JSON / dotLottie (.lottie, lottie.host)
  format?: 'json' | 'dotlottie'; // Định dạng hoạt họa Lottie JSON hoặc dotLottie
  animationData?: any;      // Dữ liệu JSON trực tiếp nếu được tải lên
  x: number;                // Tọa độ X theo % chiều rộng (0 - 100)
  y: number;                // Tọa độ Y theo % chiều cao (0 - 100)
  scale: number;            // Tỷ lệ phóng to/thu nhỏ (0.2 đến 3.0, mặc định 1.0)
  width?: number;           // Chiều rộng cơ sở px (mặc định 240)
  height?: number;          // Chiều cao cơ sở px (mặc định 240)
  opacity: number;          // Độ trong suốt (0.05 đến 1.0, mặc định 1.0)
  rotation: number;         // Góc xoay (-180° đến +180°, mặc định 0)
  speed: number;            // Tốc độ hoạt họa (0.25x đến 2.5x, mặc định 1.0)
  loop: boolean;            // Tự động lặp lại (mặc định true)
  visible: boolean;         // Hiển thị (mặc định true)
  layerOrder: LottieLayerOrder; // Thứ tự lớp hiển thị trước / sau
  audioReactive?: boolean;  // Nhún nhảy / phóng to theo nhịp Beat Bass
}

export interface LottieLibraryItem {
  id: string;
  nameVi: string;
  nameEn: string;
  category: 'music' | 'neon' | 'lofi' | 'effects';
  tags: string[];
  url: string;
  format?: 'json' | 'dotlottie';
  previewUrl?: string;
  defaultScale?: number;
  defaultLayerOrder?: LottieLayerOrder;
  animationData?: any;
}

export const DEFAULT_LOTTIES: LottieItem[] = [
  {
    id: 'vinyl-record-spin',
    name: 'Đĩa Than Cổ Điển Xoay (Vinyl Spin)',
    category: 'music',
    url: '',
    x: 50,
    y: 50,
    scale: 1.0,
    width: 240,
    height: 240,
    opacity: 0.9,
    rotation: 0,
    speed: 1.0,
    loop: true,
    visible: true,
    layerOrder: 'behind-visualizer',
    audioReactive: true,
  },
];


