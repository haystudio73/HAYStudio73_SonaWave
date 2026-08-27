import { PresetTheme, BackgroundConfig, VisualizerConfig, LyricsConfig, ParticleConfig, TrackMetadata, TextBoxItem } from '../types';

export const AVAILABLE_FONTS = [
  { id: 'Be Vietnam Pro', name: 'Be Vietnam Pro (Tiêu chuẩn)' },
  { id: 'Montserrat', name: 'Montserrat (Mạnh mẽ)' },
  { id: 'Outfit', name: 'Outfit (Bo tròn)' },
  { id: 'Playfair Display', name: 'Playfair Display (Sang trọng)' },
  { id: 'Space Grotesk', name: 'Space Grotesk (Công nghệ)' },
  { id: 'Orbitron', name: 'Orbitron (Cyber / Sci-Fi)' },
  { id: 'Oswald', name: 'Oswald (Tiêu đề cao)' },
  { id: 'Pacifico', name: 'Pacifico (Uốn lượn)' },
  { id: 'Dancing Script', name: 'Dancing Script (Viết tay)' },
  { id: 'Caveat', name: 'Caveat (Tự nhiên)' },
  { id: 'Cinzel', name: 'Cinzel (Điện ảnh)' },
  { id: 'Fira Code', name: 'Fira Code (Code / Mono)' },
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
    url: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-cyberpunk-2',
    name: 'Cyber Alley Glow',
    nameVi: 'Hẻm Phố Ánh Sáng Cyber',
    category: 'cyberpunk',
    url: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-lofi-1',
    name: 'Lofi Bedroom Sunset',
    nameVi: 'Căn Phòng Lofi Hoàng Hôn',
    category: 'lofi',
    url: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-lofi-2',
    name: 'Cozy Coffee Study',
    nameVi: 'Góc Cà Phê Mưa',
    category: 'lofi',
    url: 'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-nature-1',
    name: 'Deep Pine Mist',
    nameVi: 'Rừng Thông Sương Mù',
    category: 'nature',
    url: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-nature-2',
    name: 'Ocean Sunset Horizon',
    nameVi: 'Biển Hoàng Hôn Tím',
    category: 'nature',
    url: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-space-1',
    name: 'Cosmic Nebula',
    nameVi: 'Tinh Vân Vũ Trụ',
    category: 'space',
    url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-dark-1',
    name: 'Concert Laser Stage',
    nameVi: 'Sân Khấu Laser EDM',
    category: 'dark',
    url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-dark-2',
    name: 'DJ Performance Stage',
    nameVi: 'Sân Khấu DJ Huyền Ảo',
    category: 'dark',
    url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-abstract-1',
    name: 'Fluid Neon Violet',
    nameVi: 'Sóng Màu Chuyển Động',
    category: 'abstract',
    url: 'https://images.pexels.com/photos/2477377/pexels-photo-2477377.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/2477377/pexels-photo-2477377.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'bg-abstract-2',
    name: 'Prism Light Tunnel',
    nameVi: 'Đường Hầm Ánh Sáng',
    category: 'abstract',
    url: 'https://images.pexels.com/photos/3780104/pexels-photo-3780104.jpeg?auto=compress&cs=tinysrgb&w=1920',
    thumbnail: 'https://images.pexels.com/photos/3780104/pexels-photo-3780104.jpeg?auto=compress&cs=tinysrgb&w=300',
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
  glowIntensity: 18,
  amplitude: 1.2,
  smoothing: 0.82,
  mirror: true,
  positionY: 72,
  scale: 1.0,
  bassBoost: true,
  dynamicBeatPulse: true,
  syncBpmPulse: true,
  bpm: 120,
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
  style: 'karaoke',
  letterSpacing: 0.5,
  textTransform: 'none',
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
  filmGrain: true,
};

export const DEFAULT_PARTICLES: ParticleConfig = {
  enabled: true,
  type: 'dust',
  count: 45,
  speed: 1.0,
  color: 'rgba(255, 255, 255, 0.6)',
  reactiveToBeat: true,
};

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
      type: 'galaxy-orbit',
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
      style: 'kinetic-pop',
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
