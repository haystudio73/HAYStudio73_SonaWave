import { PresetTheme, BackgroundConfig, VisualizerConfig, LyricsConfig, ParticleConfig, TrackMetadata, TextBoxItem, FilmLightConfig, ColorGradingConfig, ColorGradingLUT, MasterEQConfig, MasterEQPreset, MasterEQBands } from '../types';

export const DEFAULT_MASTER_EQ: MasterEQConfig = {
  enabled: true,
  preset: 'flat',
  preampGain: 0, // 0 dB
  lowCutFreq: 0, // Off
  highCutFreq: 20000, // Off
  bands: {
    b32: 0,
    b64: 0,
    b125: 0,
    b250: 0,
    b500: 0,
    b1k: 0,
    b2k: 0,
    b4k: 0,
    b8k: 0,
    b16k: 0,
  },
};

export interface MasterEQBandMeta {
  id: keyof MasterEQBands;
  frequency: number;
  label: string;
  nameKey: string;
  desc: string;
}

export const MASTER_EQ_BANDS_META: MasterEQBandMeta[] = [
  { id: 'b32', frequency: 32, label: '32Hz', nameKey: 'eqBandSubBass', desc: 'Sub-bass rumble & feel' },
  { id: 'b64', frequency: 64, label: '64Hz', nameKey: 'eqBandBass', desc: 'Kick drum thud & bass weight' },
  { id: 'b125', frequency: 125, label: '125Hz', nameKey: 'eqBandLowMid', desc: 'Bass warmth & upper punch' },
  { id: 'b250', frequency: 250, label: '250Hz', nameKey: 'eqBandMid1', desc: 'Body & vocal fullness (mud check)' },
  { id: 'b500', frequency: 500, label: '500Hz', nameKey: 'eqBandMid2', desc: 'Lower harmonic balance' },
  { id: 'b1k', frequency: 1000, label: '1kHz', nameKey: 'eqBandHighMid', desc: 'Instrument presence & core vocal' },
  { id: 'b2k', frequency: 2000, label: '2kHz', nameKey: 'eqBandPresence', desc: 'Attack, speech clarity & bite' },
  { id: 'b4k', frequency: 4000, label: '4kHz', nameKey: 'eqBandBrilliance', desc: 'Vocal edge & percussion snap' },
  { id: 'b8k', frequency: 8000, label: '8kHz', nameKey: 'eqBandTreble', desc: 'Cymbals, hi-hats & shimmer' },
  { id: 'b16k', frequency: 16000, label: '16kHz', nameKey: 'eqBandAir', desc: 'Ultra-high sparkle & studio air' },
];

export interface MasterEQPresetItem {
  id: MasterEQPreset;
  name: string;
  nameVi: string;
  descVi: string;
  descEn: string;
  iconName: string;
  badge: string;
  preampGain: number;
  lowCutFreq: number;
  highCutFreq: number;
  bands: MasterEQBands;
}

export const MASTER_EQ_PRESETS_DATA: MasterEQPresetItem[] = [
  {
    id: 'flat',
    name: 'Flat / Bypass',
    nameVi: 'Mặc Định Gốc (Flat)',
    descVi: 'Giữ nguyên chất âm tự nhiên trong suốt không biến dạng',
    descEn: 'Uncolored natural transparent frequency response',
    iconName: 'Activity',
    badge: 'Standard',
    preampGain: 0,
    lowCutFreq: 0,
    highCutFreq: 20000,
    bands: { b32: 0, b64: 0, b125: 0, b250: 0, b500: 0, b1k: 0, b2k: 0, b4k: 0, b8k: 0, b16k: 0 },
  },
  {
    id: 'bass-boost',
    name: 'Bass Booster',
    nameVi: 'Tăng Cường Bass (Bass Booster)',
    descVi: 'Tăng cường lực đập sub-bass uy lực cho nhạc EDM & Điện tử',
    descEn: 'Deep sub-bass kick punch for EDM & Electronic',
    iconName: 'Zap',
    badge: 'Heavy Bass',
    preampGain: -2,
    lowCutFreq: 20,
    highCutFreq: 20000,
    bands: { b32: 6.5, b64: 8.0, b125: 4.5, b250: 1.5, b500: 0, b1k: 0, b2k: 1.0, b4k: 2.0, b8k: 3.5, b16k: 2.0 },
  },
  {
    id: 'sub-punch',
    name: 'Sub-Punch',
    nameVi: 'Trống Sub Nặng (Sub-Punch)',
    descVi: 'Nhấn mạnh dải 64Hz tạo lực nẩy chắc nịch cho Hip-Hop & Trap',
    descEn: 'Heavy 64Hz low-end for Hip-Hop and Trap',
    iconName: 'Flame',
    badge: 'Hip-Hop / Trap',
    preampGain: -2.5,
    lowCutFreq: 20,
    highCutFreq: 20000,
    bands: { b32: 8.5, b64: 9.0, b125: 3.5, b250: -1.0, b500: 0, b1k: 0.5, b2k: 1.5, b4k: 3.0, b8k: 2.5, b16k: 1.5 },
  },
  {
    id: 'vocal-clarity',
    name: 'Vocal Clarity & Air',
    nameVi: 'Sáng Giọng Ca (Vocal Clarity)',
    descVi: 'Tôn giọng ca sĩ rõ nét, trong trẻo và nổi bật trên nền nhạc',
    descEn: 'Crisp presence and karaoke voice enhancement',
    iconName: 'Music',
    badge: 'Karaoke / Vocal',
    preampGain: -1.0,
    lowCutFreq: 40,
    highCutFreq: 20000,
    bands: { b32: -3.0, b64: -2.0, b125: -1.5, b250: 1.0, b500: 2.0, b1k: 3.5, b2k: 5.5, b4k: 6.0, b8k: 4.5, b16k: 3.5 },
  },
  {
    id: 'acoustic-warmth',
    name: 'Acoustic Warmth',
    nameVi: 'Ấm Áp Mộc (Acoustic Warmth)',
    descVi: 'Tạo độ dày và ấm áp mộc mạc cho đàn Guitar & Piano',
    descEn: 'Rich woody organic mids for guitar & piano',
    iconName: 'Radio',
    badge: 'Organic',
    preampGain: 0,
    lowCutFreq: 0,
    highCutFreq: 18000,
    bands: { b32: 1.0, b64: 2.5, b125: 4.0, b250: 3.5, b500: 1.5, b1k: 0, b2k: -1.0, b4k: -1.5, b8k: 1.5, b16k: 2.5 },
  },
  {
    id: 'edm-club',
    name: 'EDM Festival Punch',
    nameVi: 'Đại Tiệc EDM Sôi Động',
    descVi: 'Đường cong chữ V tăng mạnh tiếng trống kick và dải treble lung linh',
    descEn: 'V-shaped curve with massive kick and shimmering highs',
    iconName: 'Sparkles',
    badge: 'Festival',
    preampGain: -3.0,
    lowCutFreq: 20,
    highCutFreq: 20000,
    bands: { b32: 7.0, b64: 8.5, b125: 4.0, b250: -2.0, b500: -2.5, b1k: 0, b2k: 2.5, b4k: 4.5, b8k: 6.5, b16k: 7.0 },
  },
  {
    id: 'rock-metal',
    name: 'Rock / Metal Drive',
    nameVi: 'Rock / Metal Mạnh Mẽ',
    descVi: 'Cắt nhẹ dải trung và đẩy mạnh âm trầm cùng độ sắc bén dải cao',
    descEn: 'Solid punch with scooped mids and aggressive bite',
    iconName: 'Zap',
    badge: 'Heavy Rock',
    preampGain: -2.0,
    lowCutFreq: 30,
    highCutFreq: 20000,
    bands: { b32: 4.5, b64: 6.0, b125: 3.5, b250: -1.5, b500: -3.0, b1k: -1.5, b2k: 2.5, b4k: 4.5, b8k: 5.5, b16k: 4.0 },
  },
  {
    id: 'lofi-vintage',
    name: 'Lofi Vintage Warmth',
    nameVi: 'Lofi Cổ Điển Băng Từ',
    descVi: 'Tông âm trầm ấm áp cùng hiệu ứng cắt nhẹ dải treble kiểu băng cassette',
    descEn: 'Warm low-end with retro cassette high-frequency roll-off',
    iconName: 'Disc',
    badge: 'Retro Lofi',
    preampGain: 0.5,
    lowCutFreq: 30,
    highCutFreq: 14000,
    bands: { b32: 3.0, b64: 4.5, b125: 3.5, b250: 2.5, b500: 1.0, b1k: -1.0, b2k: -2.5, b4k: -4.5, b8k: -7.0, b16k: -10.0 },
  },
  {
    id: 'cinematic-air',
    name: 'Cinematic Master',
    nameVi: 'Điện Ảnh Không Gian (Cinematic)',
    descVi: 'Dải động rộng mở với âm siêu trầm hoành tráng và âm cao thoáng đãng',
    descEn: 'Wide dynamic range with majestic sub and airy treble',
    iconName: 'Sparkles',
    badge: 'Cinematic',
    preampGain: -1.5,
    lowCutFreq: 0,
    highCutFreq: 20000,
    bands: { b32: 6.0, b64: 5.0, b125: 2.0, b250: 0, b500: 1.0, b1k: 2.0, b2k: 2.5, b4k: 4.0, b8k: 6.0, b16k: 7.5 },
  },
  {
    id: 'podcast-clean',
    name: 'Podcast / Clean Speech',
    nameVi: 'Thu Âm / Giọng Nói Sạch',
    descVi: 'Loại bỏ tiếng ồn ù rền tần số thấp và làm nổi bật phụ âm giọng nói',
    descEn: 'Low-frequency mud rumble cut with crisp vocal presence',
    iconName: 'Music',
    badge: 'Speech Clean',
    preampGain: 0,
    lowCutFreq: 80,
    highCutFreq: 16000,
    bands: { b32: -12.0, b64: -8.0, b125: -3.0, b250: -2.0, b500: 1.0, b1k: 2.5, b2k: 4.0, b4k: 4.5, b8k: 2.0, b16k: 0 },
  },
];

export const AVAILABLE_FONTS = [
  { id: 'Be Vietnam Pro', name: 'Be Vietnam Pro (Tiêu chuẩn Việt Nam)' },
  { id: 'Montserrat', name: 'Montserrat (Mạnh mẽ, Hiện đại)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Tinh tế, Sang trọng)' },
  { id: 'Outfit', name: 'Outfit (Bo tròn, Dễ thương)' },
  { id: 'Lexend', name: 'Lexend (Rõ nét, Dễ đọc)' },
  { id: 'Comfortaa', name: 'Comfortaa (Bo tròn mềm mại)' },
  { id: 'Playfair Display', name: 'Playfair Display (Quý phái, Cổ điển)' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Công nghệ, Tương lai)' },
  { id: 'Syne', name: 'Syne (Nghệ thuật, Độc bản)' },
  { id: 'Orbitron', name: 'Orbitron (Cyber / Sci-Fi EDM)' },
  { id: 'Oswald', name: 'Oswald (Tiêu đề cao cô đọng)' },
  { id: 'Anton', name: 'Anton (Siêu dày, Poster)' },
  { id: 'Lobster', name: 'Lobster (Cổ điển phong cách Mỹ)' },
  { id: 'Bangers', name: 'Bangers (Truyện tranh bùng nổ)' },
  { id: 'Lemonada', name: 'Lemonada (Vui tươi năng động)' },
  { id: 'Pacifico', name: 'Pacifico (Uốn lượn Vintage)' },
  { id: 'Dancing Script', name: 'Dancing Script (Chữ viết tay bay bổng)' },
  { id: 'Caveat', name: 'Caveat (Bút dạ tự nhiên)' },
  { id: 'Kalam', name: 'Kalam (Viết tay mộc mạc)' },
  { id: 'Playball', name: 'Playball (Thư pháp thể thao)' },
  { id: 'Sacramento', name: 'Sacramento (Chữ ký thanh mảnh)' },
  { id: 'Cinzel', name: 'Cinzel (Điện ảnh La Mã)' },
  { id: 'Fira Code', name: 'Fira Code (Code Monospace)' },
];

export const DEFAULT_TEXT_BOXES: TextBoxItem[] = [];

export interface BackgroundPresetItem {
  id: string;
  name: string;
  nameVi: string;
  category: 'cyberpunk' | 'lofi' | 'nature' | 'dark' | 'abstract' | 'space';
  url: string;
  thumbnail: string;
}

export const BACKGROUND_PRESETS: BackgroundPresetItem[] = [
  {
    id: 'bg-cyberpunk-1',
    name: 'Neo Tokyo Rain',
    nameVi: 'Tokyo Mưa Đêm Neon',
    category: 'cyberpunk',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-cyberpunk-2',
    name: 'Cyber Alley Glow',
    nameVi: 'Hẻm Phố Ánh Sáng Cyber',
    category: 'cyberpunk',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-lofi-1',
    name: 'Lofi Bedroom Sunset',
    nameVi: 'Căn Phòng Lofi Hoàng Hôn',
    category: 'lofi',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-lofi-2',
    name: 'Cozy Coffee Study',
    nameVi: 'Góc Cà Phê Mưa',
    category: 'lofi',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-nature-1',
    name: 'Deep Pine Mist',
    nameVi: 'Rừng Thông Sương Mù',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-nature-2',
    name: 'Ocean Sunset Horizon',
    nameVi: 'Biển Hoàng Hôn Tím',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-space-1',
    name: 'Cosmic Nebula',
    nameVi: 'Tinh Vân Vũ Trụ',
    category: 'space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-dark-1',
    name: 'Concert Laser Stage',
    nameVi: 'Sân Khấu Laser EDM',
    category: 'dark',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-dark-2',
    name: 'DJ Performance Stage',
    nameVi: 'Sân Khấu DJ Huyền Ảo',
    category: 'dark',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-abstract-1',
    name: 'Fluid Neon Wave',
    nameVi: 'Sóng Màu Chuyển Động',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'bg-abstract-2',
    name: 'Prism Light Tunnel',
    nameVi: 'Đường Hầm Ánh Sáng',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80',
  }
];

export const SAMPLE_SRT_LOFI = `1
00:00:01,000 --> 00:00:05,200
Từng góc phố quen đêm nay lặng im nghe gió hát

2
00:00:05,500 --> 00:00:09,800
Giọt cà phê đắng rơi theo nhịp tim từng phím đàn

3
00:00:10,200 --> 00:00:14,600
Dù ngàn khoảng cách chẳng thể phai nhòa ký ức xưa

4
00:00:15,000 --> 00:00:19,800
Sóng âm ngân vang đưa tâm hồn phiêu du miền nhớ

5
00:00:20,200 --> 00:00:24,500
Gửi theo ngàn vì sao sáng trên bầu trời cao

6
00:00:25,000 --> 00:00:29,500
Một khúc ca ru êm đêm dài bình yên...`;

export const SAMPLE_SRT_SYNTHWAVE = `1
00:00:01,000 --> 00:00:04,800
NEON LIGHTS ARE FLASHING THROUGH THE NIGHT

2
00:00:05,000 --> 00:00:08,900
Chạy theo ánh sáng giữa đại lộ vô tận

3
00:00:09,200 --> 00:00:13,400
BASSLINE DROPPING HEAVY IN MY VEINS

4
00:00:13,800 --> 00:00:18,200
Nhịp đập điện tử rực cháy đam mê không hồi kết

5
00:00:18,500 --> 00:00:23,000
FEEL THE RETRO PULSE ELECTRIC HIGHWAY

6
00:00:23,500 --> 00:00:28,000
Chúng ta là những tia sáng giữa màn đêm!`;

export const SAMPLE_SRT_ACOUSTIC = `1
00:00:01,000 --> 00:00:05,000
Nắng chiều buông nhẹ vương trên mái tóc em

2
00:00:05,500 --> 00:00:09,500
Khúc guitar mộc mạc ru êm hoàng hôn vàng

3
00:00:10,000 --> 00:00:14,800
Chỉ cần có nhau mọi âu lo tan biến đi

4
00:00:15,200 --> 00:00:19,800
Giữ trọn từng khoảnh khắc ngọt ngào trong tim

5
00:00:20,200 --> 00:00:25,000
Tình yêu đơn sơ như nốt nhạc trong lành...`;

export const DEFAULT_VISUALIZER: VisualizerConfig = {
  type: 'bars-mirrored',
  colorMode: 'gradient2',
  primaryColor: '#ec4899',   // Pink rose
  secondaryColor: '#8b5cf6', // Purple
  tertiaryColor: '#3b82f6',  // Blue
  barCount: 48,
  barWidth: 6,
  barGap: 3,
  barRoundness: 4,
  glowIntensity: 22,
  bloomEffect: true,
  bloomIntensity: 65,
  amplitude: 1.2,
  smoothing: 0.82,
  mirror: true,
  positionX: 50,
  positionY: 72,
  scale: 1.0,
  bassBoost: true,
  dynamicBeatPulse: true,
  syncBpmPulse: true,
  bpm: 120,
  chromaticAberration: false,
  chromaticAberrationIntensity: 0.55,
  lineThickness: 3,
  fillOpacity: 0.85,
};

export const DEFAULT_LYRICS: LyricsConfig = {
  enabled: true,
  fontFamily: 'Be Vietnam Pro',
  fontSize: 24,
  color: 'rgba(255, 255, 255, 0.45)',
  activeColor: '#ffffff',
  glowColor: '#ec4899',
  glowIntensity: 15,
  positionY: 48,
  alignment: 'center',
  style: 'karaoke-single',
  karaokeSweepMode: 'star-flying',
  letterSpacing: 0.5,
  textTransform: 'none',
  fontWeight: 'bold',
  fontStyle: 'normal',
  textDecoration: 'none',
  fontEffect: 'none',
  fontEffectColor: '#ec4899',
  strokeColor: '#000000',
  strokeWidth: 2,
  showBackgroundPill: true,
  pillColor: 'rgba(0, 0, 0, 0.5)',
  pillOpacity: 0.6,
  pillBlur: 12,
};

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'preset',
  url: BACKGROUND_PRESETS[0].url,
  color1: '#0f172a',
  color2: '#312e81',
  gradientAngle: 135,
  blur: 4,
  brightness: 80,
  contrast: 110,
  vignette: 45,
  beatZoom: true,
  zoomTrigger: 'bass',
  zoomIntensity: 0.05,
  zoomSpeed: 1.0,
  zoomStyle: 'pulse',
  zoomInvert: false,
  glitchEffect: false,
  glitchIntensity: 0.45,
  glitchTrigger: 'bass',
  glitchStyle: 'rgb-shift',
  glitchColorSplit: true,
  filmGrain: true,
};

export const DEFAULT_PARTICLES: ParticleConfig = {
  enabled: true,
  type: 'dust',
  count: 45,
  speed: 1.0,
  color: '#ffffff',
  secondaryColor: '#ec4899',
  shape: 'circle',
  colorMode: 'custom',
  glowIntensity: 12,
  sizeScale: 1.0,
  reactiveToBeat: true,
  bassReactiveColor: true,
  bassFlashBoost: 1.5,
  // Snow & Wind defaults
  snowWindAngle: 15,
  snowWindSpeed: 1.0,
  snowTurbulence: 40,
  snowFlakeType: 'mixed',
  // Rain & Wind defaults
  rainWindAngle: 10,
  rainWindSpeed: 1.2,
  rainTurbulence: 25,
  rainDropType: 'mixed',
  rainLengthScale: 1.2,
  rainSplash: true,
};

export const DEFAULT_FILM_LIGHT: FilmLightConfig = {
  enabled: false,
  style: 'vintage-leak',
  intensity: 0.65,
  speed: 1.0,
  blendMode: 'screen',
  position: 'top-left',
  primaryColor: '#ff7a00',
  secondaryColor: '#ff0055',
  tertiaryColor: '#ffd700',
  scale: 1.0,
  reactiveToBeat: true,
  beatFlashBoost: 1.2,
  filmDustScratches: true,
  dustIntensity: 0.35,
  lensFlicker: false,
  flickerSpeed: 1.0,
  chromaticAberration: false,
  vignetteWarmth: true,
};

export interface FilmLightPresetItem {
  id: string;
  name: string;
  nameVi: string;
  descVi: string;
  config: Partial<FilmLightConfig>;
}

export const FILM_LIGHT_PRESETS: FilmLightPresetItem[] = [
  {
    id: 'vintage-35mm',
    name: 'Vintage 35mm Burn',
    nameVi: 'Cháy Phim 35mm Cổ Điển',
    descVi: 'Vệt lóa ấm áp cam hổ phách & hồng ngọc lan tỏa từ góc phim',
    config: {
      style: 'vintage-leak',
      blendMode: 'screen',
      position: 'top-left',
      primaryColor: '#ff7a00',
      secondaryColor: '#ff0055',
      tertiaryColor: '#ffd700',
      intensity: 0.7,
      speed: 1.0,
      filmDustScratches: true,
      dustIntensity: 0.4,
      vignetteWarmth: true,
    }
  },
  {
    id: 'anamorphic-blue',
    name: 'Anamorphic Cinema Flare',
    nameVi: 'Vệt Sáng Xanh Điện Ảnh',
    descVi: 'Tia sáng laser xanh biển Anamorphic quét ngang chuẩn phim Hollywood',
    config: {
      style: 'anamorphic-flare',
      blendMode: 'screen',
      position: 'center',
      primaryColor: '#00d4ff',
      secondaryColor: '#3b82f6',
      tertiaryColor: '#ffffff',
      intensity: 0.75,
      speed: 0.8,
      filmDustScratches: false,
      chromaticAberration: true,
    }
  },
  {
    id: 'prism-rainbow-wash',
    name: 'Prism Rainbow Beam',
    nameVi: 'Tán Sắc Lăng Kính Prism',
    descVi: 'Dải quang phổ 7 sắc cầu vồng mềm mại lấp lánh ảo diệu',
    config: {
      style: 'prism-rainbow',
      blendMode: 'screen',
      position: 'top-right',
      primaryColor: '#ec4899',
      secondaryColor: '#06b6d4',
      tertiaryColor: '#facc15',
      intensity: 0.65,
      speed: 1.1,
      filmDustScratches: false,
      chromaticAberration: true,
    }
  },
  {
    id: 'golden-hour-sun',
    name: 'Golden Hour Sunbeams',
    nameVi: 'Nắng Chiều Hoàng Hôn',
    descVi: 'Luồng nắng vàng óng ả ấm áp rọi xiên qua khung hình với bụi sáng',
    config: {
      style: 'golden-hour',
      blendMode: 'screen',
      position: 'top-left',
      primaryColor: '#fbbf24',
      secondaryColor: '#f97316',
      tertiaryColor: '#ffffff',
      intensity: 0.7,
      speed: 0.7,
      filmDustScratches: true,
      dustIntensity: 0.3,
      vignetteWarmth: true,
    }
  },
  {
    id: 'cyber-neon-leak',
    name: 'Cyberpunk Neon Leak',
    nameVi: 'Cháy Sáng Neon Cyber',
    descVi: 'Đèn Neon Hồng Magenta & Xanh Cyan đối lập nồng nhiệt',
    config: {
      style: 'neon-cyber-leak',
      blendMode: 'screen',
      position: 'dynamic-float',
      primaryColor: '#f43f5e',
      secondaryColor: '#06b6d4',
      tertiaryColor: '#a855f7',
      intensity: 0.75,
      speed: 1.3,
      filmDustScratches: false,
      chromaticAberration: true,
    }
  },
  {
    id: 'retro-8mm-projector',
    name: 'Retro 8mm Projector',
    nameVi: 'Máy Chiếu Phim 8mm',
    descVi: 'Ánh đèn chiếu rung lắc nhẹ kèm bụi xước và nhấp nháy màn chập',
    config: {
      style: 'retro-projector',
      blendMode: 'screen',
      position: 'center',
      primaryColor: '#fde68a',
      secondaryColor: '#f59e0b',
      tertiaryColor: '#d97706',
      intensity: 0.6,
      speed: 1.2,
      filmDustScratches: true,
      dustIntensity: 0.6,
      lensFlicker: true,
      flickerSpeed: 1.2,
      vignetteWarmth: true,
    }
  },
  {
    id: 'lens-optical-rings',
    name: 'Optical Ring Flare',
    nameVi: 'Vệt Lóa Ống Kính Đa Vòng',
    descVi: 'Hào quang ống kính máy quay với chuỗi vòng tròn quang học phản xạ',
    config: {
      style: 'lens-optical-flare',
      blendMode: 'screen',
      position: 'top-right',
      primaryColor: '#38bdf8',
      secondaryColor: '#a855f7',
      tertiaryColor: '#ffffff',
      intensity: 0.7,
      speed: 0.9,
      filmDustScratches: false,
    }
  },
  {
    id: 'film-burn-flash',
    name: 'Dynamic Film Burn Fire',
    nameVi: 'Cháy Phim Bốc Lửa Động',
    descVi: 'Đám cháy phim nhựa bùng nổ chuyển động ngẫu nhiên theo nhịp beat',
    config: {
      style: 'film-burn-cycle',
      blendMode: 'screen',
      position: 'dynamic-float',
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      tertiaryColor: '#fef08a',
      intensity: 0.8,
      speed: 1.5,
      reactiveToBeat: true,
      beatFlashBoost: 1.8,
      filmDustScratches: true,
      dustIntensity: 0.45,
    }
  }
];

export const DEFAULT_COLOR_GRADING: ColorGradingConfig = {
  enabled: false,
  lut: 'none',
  lutIntensity: 1.0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  hueRotate: 0,
  sepia: 0,
  shadowsLift: 0,
  highlightsTint: '#ffedd5',
  shadowsTint: '#083344',
  splitToneIntensity: 0,
  vignette: 0,
  vignetteFeather: 65,
  vignetteColor: '#000000',
  filmGrain: 0,
  bloomGlow: 0,
};

export interface LUTPresetItem {
  id: ColorGradingLUT;
  name: string;
  nameVi: string;
  category: 'cinema' | 'vintage' | 'creative' | 'moody' | 'clean';
  descVi: string;
  previewGradient: string;
  badgeText: string;
  config: Partial<ColorGradingConfig>;
}

export const LUT_PRESET_ITEMS: LUTPresetItem[] = [
  {
    id: 'none',
    name: 'Original / Neutral',
    nameVi: 'Nguyên Bản (Tự Nhiên)',
    category: 'clean',
    descVi: 'Giữ nguyên màu sắc gốc không áp dụng hiệu chỉnh màu',
    previewGradient: 'from-neutral-700 via-neutral-600 to-neutral-800',
    badgeText: 'Raw',
    config: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      temperature: 0,
      tint: 0,
      hueRotate: 0,
      sepia: 0,
      shadowsLift: 0,
      splitToneIntensity: 0,
      vignette: 0,
      filmGrain: 0,
      bloomGlow: 0,
    }
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange Hollywood',
    nameVi: 'Xanh Teal & Cam Hollywood',
    category: 'cinema',
    descVi: 'Tông màu điện ảnh kinh điển: Da cam ấm áp tương phản bóng tối xanh đại dương',
    previewGradient: 'from-cyan-600 via-teal-800 to-amber-500',
    badgeText: 'Blockbuster',
    config: {
      brightness: 0,
      contrast: 18,
      saturation: 15,
      exposure: 0,
      temperature: 15,
      tint: -6,
      hueRotate: 0,
      sepia: 0,
      shadowsLift: 5,
      highlightsTint: '#fed7aa',
      shadowsTint: '#083344',
      splitToneIntensity: 55,
      vignette: 25,
      vignetteFeather: 60,
      vignetteColor: '#000000',
      filmGrain: 0,
      bloomGlow: 0,
    }
  },
  {
    id: 'cinematic-warm',
    name: 'Cinematic Kodachrome',
    nameVi: 'Điện Ảnh Kodachrome Ấm',
    category: 'cinema',
    descVi: 'Màu phim ấm áp sang trọng, độ tương phản sâu với ánh sáng vàng mật ong',
    previewGradient: 'from-amber-600 via-orange-800 to-yellow-500',
    badgeText: 'Warm Film',
    config: {
      brightness: 2,
      contrast: 20,
      saturation: 10,
      exposure: 0,
      temperature: 32,
      tint: 6,
      sepia: 8,
      shadowsLift: 0,
      highlightsTint: '#fef08a',
      shadowsTint: '#451a03',
      splitToneIntensity: 45,
      vignette: 30,
      filmGrain: 10,
      bloomGlow: 10,
    }
  },
  {
    id: 'bleach-bypass',
    name: 'Bleach Bypass Action',
    nameVi: 'Bleach Bypass Bạc (Hành Động)',
    category: 'creative',
    descVi: 'Độ tương phản cực mạnh, khử bão hòa màu sắc mang cảm giác bụi bặm gai góc',
    previewGradient: 'from-zinc-400 via-stone-700 to-zinc-900',
    badgeText: 'Gritty',
    config: {
      brightness: -4,
      contrast: 42,
      saturation: -45,
      exposure: 5,
      temperature: -10,
      tint: 0,
      shadowsLift: 15,
      vignette: 40,
      filmGrain: 25,
      bloomGlow: 0,
    }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon 2077',
    nameVi: 'Cyberpunk Neon Tương Lai',
    category: 'creative',
    descVi: 'Hồng cánh sen rực rỡ hòa quyện cùng sắc xanh tím huỳnh quang bí ẩn',
    previewGradient: 'from-rose-500 via-purple-900 to-cyan-400',
    badgeText: 'Synthwave',
    config: {
      brightness: 2,
      contrast: 26,
      saturation: 45,
      exposure: 0,
      temperature: -12,
      tint: 38,
      hueRotate: 0,
      shadowsLift: 0,
      highlightsTint: '#f43f5e',
      shadowsTint: '#06b6d4',
      splitToneIntensity: 65,
      vignette: 35,
      bloomGlow: 30,
    }
  },
  {
    id: 'vintage-70s',
    name: 'Vintage 70s Polaroid',
    nameVi: 'Hoài Niệm Vintage 70s',
    category: 'vintage',
    descVi: 'Tông màu máy ảnh phim xưa ố vàng cổ điển, đen nhạt khói nhẹ và hạt phim mịn',
    previewGradient: 'from-yellow-700 via-amber-900 to-stone-800',
    badgeText: 'Nostalgia',
    config: {
      brightness: 4,
      contrast: -8,
      saturation: -15,
      temperature: 28,
      tint: -6,
      sepia: 30,
      shadowsLift: 28,
      vignette: 35,
      filmGrain: 35,
      bloomGlow: 15,
    }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunset',
    nameVi: 'Hoàng Hôn Nắng Vàng',
    category: 'cinema',
    descVi: 'Khoảnh khắc giờ vàng hoàng hôn thơ mộng ngập tràn ánh nắng ấm áp',
    previewGradient: 'from-amber-500 via-orange-600 to-rose-700',
    badgeText: 'Sunset',
    config: {
      brightness: 6,
      contrast: 10,
      saturation: 22,
      temperature: 55,
      tint: 10,
      highlightsTint: '#f59e0b',
      shadowsTint: '#78350f',
      splitToneIntensity: 50,
      vignette: 20,
      bloomGlow: 25,
    }
  },
  {
    id: 'black-and-white',
    name: 'Noir Monochrome Classic',
    nameVi: 'Đen Trắng Nghệ Thuật (B&W)',
    category: 'clean',
    descVi: 'Tông đen trắng sâu thẳm, loại bỏ phân tâm màu sắc để nổi bật hình khối & cảm xúc',
    previewGradient: 'from-white via-neutral-500 to-black',
    badgeText: 'Monochrome',
    config: {
      brightness: 0,
      contrast: 38,
      saturation: -100,
      exposure: 0,
      temperature: 0,
      tint: 0,
      shadowsLift: 10,
      vignette: 45,
      filmGrain: 25,
    }
  },
  {
    id: 'faded-film',
    name: 'Matte Faded Film',
    nameVi: 'Phim Mờ Matte Faded',
    category: 'vintage',
    descVi: 'Vùng đen được nâng sáng mềm mại tạo hiệu ứng phim rửa analog nhẹ nhàng',
    previewGradient: 'from-stone-500 via-zinc-600 to-stone-800',
    badgeText: 'Indie Matte',
    config: {
      brightness: 6,
      contrast: -15,
      saturation: -18,
      temperature: 12,
      shadowsLift: 45,
      vignette: 25,
      filmGrain: 20,
    }
  },
  {
    id: 'retro-vhs',
    name: 'Retro 90s VHS Tape',
    nameVi: 'Băng Từ VHS Thập Niên 90',
    category: 'vintage',
    descVi: 'Hiệu ứng băng từ gia đình thập niên 90 với màu sắc hơi lệch và hạt nhiễu',
    previewGradient: 'from-indigo-600 via-purple-700 to-pink-600',
    badgeText: 'Analog VHS',
    config: {
      brightness: 2,
      contrast: 15,
      saturation: 25,
      temperature: 10,
      tint: 18,
      hueRotate: 8,
      shadowsLift: 22,
      vignette: 30,
      filmGrain: 45,
    }
  },
  {
    id: 'matrix-green',
    name: 'Matrix Cyber Emerald',
    nameVi: 'Xanh Ma Trận Matrix',
    category: 'creative',
    descVi: 'Sắc xanh ngọc lục bảo huyền bí công nghệ không gian số Cyberpunk',
    previewGradient: 'from-emerald-500 via-teal-900 to-green-950',
    badgeText: 'Matrix',
    config: {
      brightness: -5,
      contrast: 22,
      saturation: -12,
      temperature: -15,
      tint: -70,
      highlightsTint: '#86efac',
      shadowsTint: '#064e3b',
      splitToneIntensity: 70,
      vignette: 35,
      filmGrain: 15,
    }
  },
  {
    id: 'moody-blue',
    name: 'Midnight Moody Blue',
    nameVi: 'Xanh Đêm Lạnh Tối Giản',
    category: 'moody',
    descVi: 'Tông xanh băng giá trầm lắng phong cách điện ảnh Bắc Âu huyền bí',
    previewGradient: 'from-sky-500 via-blue-900 to-slate-950',
    badgeText: 'Nordic Dark',
    config: {
      brightness: -8,
      contrast: 22,
      saturation: -8,
      temperature: -65,
      tint: 12,
      highlightsTint: '#e0f2fe',
      shadowsTint: '#082f49',
      splitToneIntensity: 65,
      vignette: 40,
      filmGrain: 10,
    }
  },
  {
    id: 'candy-pop',
    name: 'Vibrant Candy Pop',
    nameVi: 'Kẹo Ngọt Candy Pop Rực Rỡ',
    category: 'creative',
    descVi: 'Độ bão hòa cao đầy năng lượng, bắt mắt thích hợp cho nhạc Pop, Kpop & EDM',
    previewGradient: 'from-pink-500 via-rose-500 to-yellow-400',
    badgeText: 'Pop EDM',
    config: {
      brightness: 6,
      contrast: 18,
      saturation: 55,
      temperature: 8,
      tint: 12,
      bloomGlow: 20,
      vignette: 15,
    }
  }
];

export const DEFAULT_TRACK: TrackMetadata = {
  title: 'Đêm Lặng (Chill Vibes)',
  artist: 'SonaWave Sessions ft. Mây',
  album: 'Midnight Echoes',
  coverUrl: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=400',
  showTrackCard: true,
  showTitle: true,
  showArtist: true,
  cardStyle: 'vinyl',
  positionX: 50,
  positionY: 26,
  scale: 1.0,
  fontFamily: 'Be Vietnam Pro',
  titleFontSize: 24,
  artistFontSize: 15,
  textColor: '#ffffff',
  artistColor: 'rgba(255, 255, 255, 0.8)',
  accentColor: '#ec4899',
  rotateVinyl: true,
  badgeBeatJump: true,
  badgeBeatJumpIntensity: 0.18,
  badgeBeatJumpStyle: 'pulse',
  badgeBeatGlow: true,
  alignment: 'center',
  boxBackground: false,
  boxBgColor: 'rgba(0, 0, 0, 0.6)',
  boxOpacity: 0.7,
};

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'theme-cyber-tiktok',
    name: 'Cyberpunk Neon 9:16',
    nameVi: 'Cyberpunk Neon (TikTok/Reels)',
    description: 'Phong cách tương lai cực ngầu với sóng đối xứng phát sáng neon rực rỡ và đĩa xoay.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=70',
    aspectRatio: '9:16',
    visualizer: {
      ...DEFAULT_VISUALIZER,
      type: 'bars-mirrored',
      colorMode: 'gradient2',
      primaryColor: '#f43f5e',
      secondaryColor: '#06b6d4',
      tertiaryColor: '#a855f7',
      barCount: 42,
      barWidth: 7,
      barGap: 3,
      glowIntensity: 22,
      positionY: 74,
    },
    lyrics: {
      ...DEFAULT_LYRICS,
      fontSize: 22,
      activeColor: '#38bdf8',
      glowColor: '#0ea5e9',
      style: 'karaoke',
      positionY: 48,
    },
    background: {
      ...DEFAULT_BACKGROUND,
      url: BACKGROUND_PRESETS[0].url,
      blur: 3,
      brightness: 75,
      vignette: 50,
    },
    particles: {
      enabled: true,
      type: 'sound-sparks',
      count: 40,
      speed: 1.2,
      color: 'rgba(56, 189, 248, 0.7)',
      reactiveToBeat: true,
    },
    track: {
      ...DEFAULT_TRACK,
      title: 'Neon Pulse Highway',
      artist: 'Retro Synthwave Vol. 2',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
      cardStyle: 'vinyl',
      positionY: 24,
    },
    sampleAudio: {
      title: 'Neon Pulse Highway',
      artist: 'Retro Synthwave Vol. 2',
      type: 'synthwave',
      lyrics: SAMPLE_SRT_SYNTHWAVE,
    }
  },
  {
    id: 'theme-lofi-chill',
    name: 'Lofi Bedroom Square',
    nameVi: 'Lofi Chill Hoàng Hôn (1:1 Vuông)',
    description: 'Thư giãn, ấm áp với sóng âm mịn lượn sóng và hạt bụi trôi nhẹ.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=70',
    aspectRatio: '1:1',
    visualizer: {
      ...DEFAULT_VISUALIZER,
      type: 'smooth-wave',
      colorMode: 'gradient2',
      primaryColor: '#fb923c',
      secondaryColor: '#f43f5e',
      tertiaryColor: '#e879f9',
      amplitude: 1.4,
      glowIntensity: 12,
      positionY: 76,
    },
    lyrics: {
      ...DEFAULT_LYRICS,
      fontSize: 24,
      fontFamily: 'Be Vietnam Pro',
      activeColor: '#ffedd5',
      glowColor: '#fb923c',
      style: 'subtitle-bar',
      positionY: 48,
    },
    background: {
      ...DEFAULT_BACKGROUND,
      url: BACKGROUND_PRESETS[2].url,
      blur: 5,
      brightness: 82,
      vignette: 40,
    },
    particles: {
      enabled: true,
      type: 'dust',
      count: 35,
      speed: 0.8,
      color: 'rgba(254, 215, 170, 0.6)',
      reactiveToBeat: true,
    },
    track: {
      ...DEFAULT_TRACK,
      title: 'Góc Cà Phê Mưa',
      artist: 'Acoustic Lofi & Chillout',
      coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
      cardStyle: 'glass-card',
      positionY: 22,
    },
    sampleAudio: {
      title: 'Góc Cà Phê Mưa',
      artist: 'Acoustic Lofi & Chillout',
      type: 'lofi',
      lyrics: SAMPLE_SRT_LOFI,
    }
  },
  {
    id: 'theme-galaxy-radial',
    name: 'Cosmic Radial 9:16',
    nameVi: 'Vòng Tròn Vũ Trụ Radial (9:16)',
    description: 'Vòng hào quang tròn tỏa tia theo tần số âm bass cực kỳ hút mắt.',
    thumbnail: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&q=70',
    aspectRatio: '9:16',
    visualizer: {
      ...DEFAULT_VISUALIZER,
      type: 'circular-spikes',
      colorMode: 'gradient2',
      primaryColor: '#c084fc',
      secondaryColor: '#38bdf8',
      tertiaryColor: '#ec4899',
      barCount: 64,
      barWidth: 4,
      glowIntensity: 24,
      positionY: 38,
      scale: 1.1,
    },
    lyrics: {
      ...DEFAULT_LYRICS,
      fontSize: 22,
      activeColor: '#ffffff',
      glowColor: '#c084fc',
      style: 'karaoke',
      positionY: 72,
    },
    background: {
      ...DEFAULT_BACKGROUND,
      url: BACKGROUND_PRESETS[6].url,
      blur: 2,
      brightness: 85,
      vignette: 55,
    },
    particles: {
      enabled: true,
      type: 'stars',
      count: 60,
      speed: 1.1,
      color: 'rgba(216, 180, 254, 0.8)',
      reactiveToBeat: true,
    },
    track: {
      ...DEFAULT_TRACK,
      title: 'Lost in the Andromeda',
      artist: 'Deep Space EDM',
      coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80',
      cardStyle: 'circular-badge',
      positionY: 38,
    },
    sampleAudio: {
      title: 'Lost in the Andromeda',
      artist: 'Deep Space EDM',
      type: 'edm',
      lyrics: SAMPLE_SRT_SYNTHWAVE,
    }
  },
  {
    id: 'theme-youtube-landscape',
    name: 'Studio Master 16:9',
    nameVi: 'Studio Chuyên Nghiệp (16:9 YouTube)',
    description: 'Chuẩn tỉ lệ ngang YouTube với dải phổ EQ đa tầng và thẻ bài hát tinh tế.',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=70',
    aspectRatio: '16:9',
    visualizer: {
      ...DEFAULT_VISUALIZER,
      type: 'cyber-matrix',
      colorMode: 'gradient3',
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
      tertiaryColor: '#6366f1',
      barCount: 56,
      barWidth: 8,
      barGap: 4,
      glowIntensity: 16,
      positionY: 78,
    },
    lyrics: {
      ...DEFAULT_LYRICS,
      fontSize: 26,
      activeColor: '#6ee7b7',
      glowColor: '#10b981',
      style: 'karaoke',
      positionY: 48,
    },
    background: {
      ...DEFAULT_BACKGROUND,
      url: BACKGROUND_PRESETS[7].url,
      blur: 4,
      brightness: 75,
      vignette: 45,
    },
    particles: {
      enabled: true,
      type: 'dust',
      count: 40,
      speed: 0.9,
      color: 'rgba(110, 231, 183, 0.6)',
      reactiveToBeat: true,
    },
    track: {
      ...DEFAULT_TRACK,
      title: 'Acoustic Sunset Romance',
      artist: 'Golden Melodies Live',
      coverUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=400&q=80',
      cardStyle: 'glass-card',
      positionY: 22,
    },
    sampleAudio: {
      title: 'Acoustic Sunset Romance',
      artist: 'Golden Melodies Live',
      type: 'acoustic',
      lyrics: SAMPLE_SRT_ACOUSTIC,
    }
  },
  {
    id: 'theme-galaxy-orbit',
    name: 'Galaxy Nebula 9:16',
    nameVi: 'Dải Ngân Hà Galaxy Swirl',
    description: 'Hàng ngàn hạt ánh sáng xoay quanh tâm đĩa vinyl phản hồi theo dải âm thanh.',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=70',
    aspectRatio: '9:16',
    visualizer: {
      ...DEFAULT_VISUALIZER,
      type: 'starburst-core',
      colorMode: 'rainbow',
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      tertiaryColor: '#06b6d4',
      glowIntensity: 25,
      positionY: 40,
      scale: 1.15,
    },
    lyrics: {
      ...DEFAULT_LYRICS,
      fontSize: 22,
      activeColor: '#fbcfe8',
      glowColor: '#ec4899',
      style: 'karaoke-single',
      positionY: 76,
    },
    background: {
      ...DEFAULT_BACKGROUND,
      url: BACKGROUND_PRESETS[8].url,
      blur: 3,
      brightness: 78,
      vignette: 50,
    },
    particles: {
      enabled: true,
      type: 'stars',
      count: 65,
      speed: 1.3,
      color: 'rgba(244, 114, 182, 0.8)',
      reactiveToBeat: true,
    },
    track: {
      ...DEFAULT_TRACK,
      title: 'Starry Night Dreamer',
      artist: 'Cyber Dreamland',
      coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
      cardStyle: 'vinyl',
      positionY: 40,
    },
    sampleAudio: {
      title: 'Starry Night Dreamer',
      artist: 'Cyber Dreamland',
      type: 'synthwave',
      lyrics: SAMPLE_SRT_SYNTHWAVE,
    }
  }
];

export const COLOR_PALETTES = [
  { name: 'Neon Rose & Cyan', primary: '#f43f5e', secondary: '#06b6d4', tertiary: '#a855f7' },
  { name: 'Cyber Violet & Pink', primary: '#ec4899', secondary: '#8b5cf6', tertiary: '#3b82f6' },
  { name: 'Emerald Sunset Gold', primary: '#10b981', secondary: '#f59e0b', tertiary: '#ef4444' },
  { name: 'Deep Ocean Blue', primary: '#0ea5e9', secondary: '#3b82f6', tertiary: '#6366f1' },
  { name: 'Lofi Warm Amber', primary: '#fb923c', secondary: '#f43f5e', tertiary: '#d946ef' },
  { name: 'Electric Lime Matrix', primary: '#84cc16', secondary: '#10b981', tertiary: '#06b6d4' },
  { name: 'Monochrome Silver Glow', primary: '#f8fafc', secondary: '#94a3b8', tertiary: '#475569' },
  { name: 'Fire Plasma', primary: '#ef4444', secondary: '#f97316', tertiary: '#facc15' },
];
