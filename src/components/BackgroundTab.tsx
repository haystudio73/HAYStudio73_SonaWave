import React, { useRef, useState } from 'react';
import { 
  BackgroundConfig, 
  ParticleConfig, 
  ParticleType, 
  ParticleShape, 
  ParticleColorMode, 
  SnowFlakeType,
  RainDropType,
  BackgroundZoomTrigger, 
  BackgroundZoomStyle,
  BackgroundGlitchTrigger,
  BackgroundGlitchStyle,
  PlaylistConfig,
} from '../types';
import { BACKGROUND_PRESETS } from '../utils/presets';
import { Language } from '../utils/i18n';
import { 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Sliders, 
  CloudRain, 
  Eye, 
  Sun, 
  Maximize, 
  CircleDot, 
  Zap, 
  Video, 
  Film, 
  Circle, 
  Square, 
  Star, 
  Heart, 
  Gem, 
  Palette, 
  Activity, 
  Gauge, 
  Waves, 
  Radio, 
  Music2, 
  Move3d, 
  Disc, 
  Tv, 
  Layers, 
  Split, 
  ScanLine, 
  Slash, 
  CloudSnow,
  Wind,
  Snowflake,
  Compass,
  Droplet,
  Droplets,
  ListMusic,
  Music,
  Globe,
  Check,
  Trash2,
  Copy,
  Feather,
  ArrowRightLeft,
  RotateCw,
  Paintbrush
} from 'lucide-react';

interface BackgroundTabProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  particles: ParticleConfig;
  onParticlesChange: (pt: ParticleConfig) => void;
  language?: Language;
  playlist?: PlaylistConfig;
  defaultBackground?: BackgroundConfig;
  onUpdateTrackBackground?: (trackId: string, bg: BackgroundConfig | undefined) => void;
  onApplyBackgroundToAllTracks?: (bg: BackgroundConfig) => void;
  onSelectTrackForPlayback?: (index: number) => void;
}

const CATEGORIES = [
  { id: 'all', nameVi: 'Tất cả', nameEn: 'All' },
  { id: 'cyberpunk', nameVi: 'Cyberpunk', nameEn: 'Cyberpunk' },
  { id: 'lofi', nameVi: 'Lofi & Chill', nameEn: 'Lofi & Chill' },
  { id: 'space', nameVi: 'Vũ Trụ', nameEn: 'Deep Space' },
  { id: 'nature', nameVi: 'Thiên Nhiên', nameEn: 'Nature' },
  { id: 'abstract', nameVi: 'Nghệ Thuật', nameEn: 'Abstract Art' },
];

const PARTICLE_TYPES: { id: ParticleType; nameVi: string; nameEn: string; icon: React.ComponentType<{ className?: string }>; badgeVi?: string; badgeEn?: string }[] = [
  { id: 'none', nameVi: 'Tắt hạt', nameEn: 'Off', icon: Eye },
  { id: 'rain', nameVi: 'Mưa Rơi Tự Nhiên', nameEn: 'Natural Rain', icon: CloudRain, badgeVi: 'Vật Lý Mưa 🌧️', badgeEn: 'Rain Physics 🌧️' },
  { id: 'snow', nameVi: 'Tuyết Rơi Mùa Đông', nameEn: 'Winter Snowfall', icon: CloudSnow, badgeVi: 'Mùa Đông ❄️', badgeEn: 'Winter ❄️' },
  { id: 'speed-lines', nameVi: 'Vệt Tốc Độ (Speed Lines)', nameEn: 'Speed Lines', icon: Zap, badgeVi: 'Anime ⚡', badgeEn: 'Speed FX ⚡' },
  { id: 'spaghetti', nameVi: 'Mưa mảnh ruy băng lụa', nameEn: 'Silk Ribbon Rain', icon: Waves, badgeVi: 'Mềm Mại 🎀', badgeEn: 'Silky 🎀' },
  { id: 'spinning-dashes', nameVi: 'Đường ngắn rơi & xoay', nameEn: 'Spinning Dashes', icon: Slash, badgeVi: 'Hot Trend', badgeEn: 'Trending' },
  { id: 'rainbow-bubbles', nameVi: 'Bong bóng cầu vồng', nameEn: 'Rainbow Bubbles', icon: CircleDot, badgeVi: 'Mới & Đẹp', badgeEn: 'Prismatic' },
  { id: 'hyperspace', nameVi: 'Tăng tốc Hyperspace', nameEn: 'Hyperspace 3D', icon: Zap, badgeVi: 'Mới 3D', badgeEn: '3D Warp' },
  { id: 'dust', nameVi: 'Bụi lofi trôi', nameEn: 'Lofi Ambient Dust', icon: Sparkles, badgeVi: 'Bóng Tơ ✨', badgeEn: 'Soft Fluff ✨' },
  { id: 'stars', nameVi: 'Sao lấp lánh', nameEn: 'Twinkling Stars', icon: Sparkles },
];

const SNOWFLAKE_TYPES: { id: SnowFlakeType; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'mixed', nameVi: 'Hỗn Hợp Tự Nhiên', nameEn: 'Natural Mixed', descVi: 'Pha trộn cả tinh thể, đốm tròn & ánh sáng', descEn: 'Mix of crystals, soft bokeh dots & glitter' },
  { id: 'crystal', nameVi: 'Tinh Thể 6 Cánh', nameEn: 'Hexagonal Crystal', descVi: 'Hoa tuyết lục giác đan nhánh tinh xảo', descEn: 'Intricate 6-pointed hexagonal snowflakes' },
  { id: 'flurry', nameVi: 'Đốm Mờ Bokeh', nameEn: 'Bokeh Flurry', descVi: 'Hạt bông tuyết tròn mờ ảo lãng mạn', descEn: 'Romantic soft-focused floating flakes' },
  { id: 'glitter', nameVi: 'Kim Cương Băng', nameEn: 'Glitter Ice Cross', descVi: 'Chữ thập 4 cánh lấp lánh ánh kim', descEn: '4-pointed cross star ice reflections' },
];

const RAINDROP_TYPES: { id: RainDropType; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'mixed', nameVi: 'Hỗn Hợp Tự Nhiên', nameEn: 'Natural Mixed', descVi: 'Pha trộn giọt nước, vệt dài cinematic & mưa nhẹ', descEn: 'Balanced mix of raindrops, cinematic streaks & mist' },
  { id: 'streaks', nameVi: 'Vệt Dài Cinematic', nameEn: 'Cinematic Streaks', descVi: 'Dải nước dài trong suốt lấp lánh phong cách điện ảnh', descEn: 'High-speed glass streaks with water bead heads' },
  { id: 'drizzle', nameVi: 'Mưa Phùn Li Ti', nameEn: 'Fine Drizzle', descVi: 'Hạt mưa bụi li ti bay lơ lửng bồng bềnh', descEn: 'Micro droplets drifting gently through the air' },
  { id: 'heavy', nameVi: 'Mưa Rào Bão Tố', nameEn: 'Heavy Downpour', descVi: 'Mưa to xối xả tốc độ cao, vệt nước đậm nét', descEn: 'Dense torrential rainfall with bright water ribbons' },
  { id: 'neon-glow', nameVi: 'Mưa Phát Sáng Neon', nameEn: 'Neon Glow Laser Rain', descVi: 'Tia mưa phát quang rực rỡ theo dải âm thanh', descEn: 'Luminous laser rain lines reacting to music' },
];

const PARTICLE_SHAPES: { id: ParticleShape; nameVi: string; nameEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'circle', nameVi: 'Hình tròn', nameEn: 'Circle', icon: Circle },
  { id: 'silk-fluff', nameVi: 'Bóng tơ mềm', nameEn: 'Fluffy Silk Ball', icon: Feather },
  { id: 'square', nameVi: 'Khối vuông', nameEn: 'Square', icon: Square },
  { id: 'star', nameVi: 'Ngôi sao', nameEn: 'Star', icon: Star },
  { id: 'heart', nameVi: 'Trái tim', nameEn: 'Heart', icon: Heart },
  { id: 'diamond', nameVi: 'Kim cương', nameEn: 'Diamond', icon: Gem },
  { id: 'ring', nameVi: 'Vòng tròn', nameEn: 'Ring', icon: CircleDot },
];

const COLOR_MODES: { id: ParticleColorMode; nameVi: string; nameEn: string; descVi: string; descEn: string }[] = [
  { id: 'custom', nameVi: 'Tùy chọn màu', nameEn: 'Custom Color', descVi: 'Màu tùy chỉnh theo bảng màu', descEn: 'Palette-selected solid / dual tones' },
  { id: 'rainbow', nameVi: 'Cầu vồng (Rainbow)', nameEn: 'Rainbow Gradient', descVi: 'Chuyển sắc ngũ sắc huyền ảo', descEn: 'Shifting multi-hue spectrum' },
  { id: 'fire', nameVi: 'Lửa rực (Fire Glow)', nameEn: 'Fire Glow', descVi: 'Tông cam vàng rực rỡ', descEn: 'Warm amber & solar flare tones' },
  { id: 'neon-pulse', nameVi: 'Neon Cyber', nameEn: 'Neon Cyber', descVi: 'Hồng & Xanh Cyan đối lập', descEn: 'Cyberpunk magenta and cyan pulse' },
  { id: 'audio-reactive', nameVi: 'Phổ âm thanh', nameEn: 'Audio Reactive', descVi: 'Đổi dải màu theo tần số nhạc', descEn: 'Color adapts directly to audio frequencies' },
];

const QUICK_COLORS = [
  { nameVi: 'Trắng tuyết', nameEn: 'Pure White', color: '#ffffff' },
  { nameVi: 'Hồng Neon', nameEn: 'Neon Pink', color: '#ec4899' },
  { nameVi: 'Xanh Cyan', nameEn: 'Cyan Blue', color: '#06b6d4' },
  { nameVi: 'Vàng Kim', nameEn: 'Golden Yellow', color: '#eab308' },
  { nameVi: 'Tím Cyber', nameEn: 'Cyber Purple', color: '#a855f7' },
  { nameVi: 'Cam Lửa', nameEn: 'Flame Orange', color: '#f97316' },
  { nameVi: 'Xanh Ngọc', nameEn: 'Emerald Green', color: '#10b981' },
];

const ZOOM_TRIGGERS: { id: BackgroundZoomTrigger; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bass', nameVi: 'Nhịp Bass / Trống Kick', nameEn: 'Bass Kick Drum', descVi: 'Bắt nhịp tiếng trống trầm, nhịp drop mạnh', descEn: 'Trigger on deep low-end thuds & drops', icon: Disc },
  { id: 'beat', nameVi: 'Nhịp Điệu Tổng Thể (Beat)', nameEn: 'Overall Beat / Snare', descVi: 'Bắt nhịp điệu bài hát, snare & tempo', descEn: 'Follows musical rhythm and percussion', icon: Music2 },
  { id: 'hybrid', nameVi: 'Kết Hợp Bass & Beat', nameEn: 'Hybrid Bass + Beat', descVi: 'Phản hồi toàn dải nhịp sống động nhất', descEn: 'Full-spectrum dynamic response', icon: Waves },
];

const ZOOM_STYLES: { id: BackgroundZoomStyle; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pulse', nameVi: 'Nảy Nhịp (Pulse)', nameEn: 'Pulse Kick', descVi: 'Giật nảy tức thì theo từng tiếng trống', descEn: 'Instant energetic punch on each hit', icon: Zap },
  { id: 'smooth', nameVi: 'Mượt Mà (Cinematic)', nameEn: 'Cinematic Smooth', descVi: 'Co giãn điện ảnh êm dịu, uyển chuyển', descEn: 'Fluid gradual breathing expansion', icon: Waves },
  { id: 'shake', nameVi: 'Rung Lắc (EDM Shake)', nameEn: 'EDM Bass Shake', descVi: 'Rung giật điện tử bùng nổ theo giọt bass', descEn: 'High-energy shudder on heavy drops', icon: Activity },
  { id: 'breathe', nameVi: 'Thở Nhịp (Breathe)', nameEn: 'Rhythmic Breathe', descVi: 'Co giãn tuần hoàn theo tần số thấp', descEn: 'Slow cyclical respiratory movement', icon: Move3d },
];

const SPEED_PRESETS = [
  { labelVi: 'Chậm êm', labelEn: 'Gentle', value: 0.5 },
  { labelVi: 'Chuẩn', labelEn: 'Standard', value: 1.0 },
  { labelVi: 'Nhanh', labelEn: 'Fast', value: 1.8 },
  { labelVi: 'Cực nhanh', labelEn: 'Ultra', value: 2.6 },
];

const GLITCH_TRIGGERS: { id: BackgroundGlitchTrigger; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bass', nameVi: 'Bass Kick', nameEn: 'Bass Kick', descVi: 'Nhiễu giật mạnh mỗi khi đập trống trầm', descEn: 'Fires intense glitch on deep sub bass', icon: Disc },
  { id: 'beat', nameVi: 'Nhịp Beat', nameEn: 'Track Beat', descVi: 'Nhiễu theo nhịp điệu bài hát & tempo', descEn: 'Syncs with musical tempo & snare hits', icon: Music2 },
  { id: 'random', nameVi: 'Bất Chợt', nameEn: 'Random', descVi: 'Nhiễu giật ngẫu nhiên tạo cảm giác bí ẩn', descEn: 'Unpredictable occasional glitch cuts', icon: Zap },
  { id: 'continuous', nameVi: 'Liên Tục', nameEn: 'Continuous', descVi: 'Hiệu ứng nhiễu sóng chạy liên hồi không ngừng', descEn: 'Constantly rolling scanlines & distortion', icon: Activity },
];

const GLITCH_STYLES: { id: BackgroundGlitchStyle; nameVi: string; nameEn: string; descVi: string; descEn: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'rgb-shift', nameVi: 'Tách Màu RGB (Chromatic)', nameEn: 'RGB Chromatic Shift', descVi: 'Tách sắc quang Red/Cyan & Blue ma mị', descEn: 'Anaglyph red-cyan displacement fringing', icon: Split },
  { id: 'slice-displacement', nameVi: 'Cắt Lát Tearing (Glitch)', nameEn: 'Slice Displacement', descVi: 'Xé rách dịch chuyển lát ngang màn hình', descEn: 'Horizontal screen tearing and slicing blocks', icon: Layers },
  { id: 'vhs-tape', nameVi: 'Băng VHS Retro (Scanline)', nameEn: 'VHS Retro Scanlines', descVi: 'Vạch nhiễu quét băng video & gợn sóng', descEn: 'Magnetic tape tracking lines & roll wave', icon: ScanLine },
  { id: 'cyber-digital', nameVi: 'Cyber Data Matrix', nameEn: 'Cyber Data Matrix', descVi: 'Số hóa dữ liệu khối giật chớp Cyberpunk', descEn: 'Digital pixelation block artifacts', icon: Tv },
];

const SOLID_COLOR_PALETTES = [
  {
    categoryVi: 'AMOLED & Tối Sâu (Dark Studio)',
    categoryEn: 'AMOLED & Deep Studio',
    colors: [
      { nameVi: 'Đen Tuyệt Đối', nameEn: 'Pure Black', hex: '#000000' },
      { nameVi: 'Đá Obsidian', nameEn: 'Obsidian Night', hex: '#0a0a0f' },
      { nameVi: 'Xanh Đêm Slate', nameEn: 'Midnight Slate', hex: '#0f172a' },
      { nameVi: 'Tím Đen Velvet', nameEn: 'Velvet Violet', hex: '#13091f' },
      { nameVi: 'Xanh Đại Dương', nameEn: 'Deep Navy', hex: '#071a2c' },
      { nameVi: 'Xám Than Ấm', nameEn: 'Warm Charcoal', hex: '#1c1917' },
      { nameVi: 'Rượu Vang Đen', nameEn: 'Wine Noir', hex: '#1c070f' },
    ],
  },
  {
    categoryVi: 'Sắc Màu Neon & Sôi Động (Neon & Mood)',
    categoryEn: 'Neon & Mood Vibrance',
    colors: [
      { nameVi: 'Chàm Điện Tử', nameEn: 'Electric Indigo', hex: '#1e1b4b' },
      { nameVi: 'Tím Laser', nameEn: 'Laser Violet', hex: '#2e1065' },
      { nameVi: 'Ngọc Lục Bảo', nameEn: 'Deep Emerald', hex: '#022c22' },
      { nameVi: 'Đỏ Nhung', nameEn: 'Crimson Velvet', hex: '#3f0713' },
      { nameVi: 'Lam Hoàng Gia', nameEn: 'Royal Sapphire', hex: '#172554' },
      { nameVi: 'Mận Cyberpunk', nameEn: 'Cyberpunk Plum', hex: '#3b0764' },
    ],
  },
  {
    categoryVi: 'Tối Giản & Sáng (Light & Clean)',
    categoryEn: 'Light & Clean Minimal',
    colors: [
      { nameVi: 'Trắng Tinh Khiết', nameEn: 'Pure White', hex: '#ffffff' },
      { nameVi: 'Xám Khói Sáng', nameEn: 'Clean Slate', hex: '#f8fafc' },
      { nameVi: 'Cát Ấm', nameEn: 'Warm Sand', hex: '#f5f5f4' },
      { nameVi: 'Cánh Hoa Pastel', nameEn: 'Pastel Iris', hex: '#fdf4ff' },
      { nameVi: 'Băng Xanh Nhạt', nameEn: 'Soft Aqua', hex: '#ecfeff' },
    ],
  },
];

const GRADIENT_PRESETS = [
  {
    id: 'sunset-horizon',
    nameVi: 'Hoàng Hôn Cam Tím',
    nameEn: 'Sunset Horizon',
    color1: '#ea580c',
    color2: '#3b0764',
    color3: '#ec4899',
    useThreeColors: true,
    angle: 135,
    type: 'linear' as const,
  },
  {
    id: 'deep-ocean',
    nameVi: 'Biển Đêm Huyền Bí',
    nameEn: 'Deep Ocean Blue',
    color1: '#0f172a',
    color2: '#06b6d4',
    color3: '#1e3a8a',
    useThreeColors: true,
    angle: 160,
    type: 'linear' as const,
  },
  {
    id: 'cyberpunk-neon',
    nameVi: 'Neon Cyberpunk',
    nameEn: 'Cyberpunk Neon',
    color1: '#3b0764',
    color2: '#06b6d4',
    color3: '#ec4899',
    useThreeColors: true,
    angle: 135,
    type: 'linear' as const,
  },
  {
    id: 'aurora-borealis',
    nameVi: 'Cực Quang Xanh',
    nameEn: 'Aurora Borealis',
    color1: '#022c22',
    color2: '#06b6d4',
    color3: '#059669',
    useThreeColors: true,
    angle: 120,
    type: 'linear' as const,
  },
  {
    id: 'velvet-luxury',
    nameVi: 'Tím Nhung Sang Trọng',
    nameEn: 'Velvet Luxury',
    color1: '#000000',
    color2: '#831843',
    color3: '#2e1065',
    useThreeColors: true,
    angle: 135,
    type: 'linear' as const,
  },
  {
    id: 'midnight-blue',
    nameVi: 'Đêm Xanh Vô Tận',
    nameEn: 'Midnight Twilight',
    color1: '#090d16',
    color2: '#31103f',
    color3: '#1e1b4b',
    useThreeColors: true,
    angle: 180,
    type: 'linear' as const,
  },
  {
    id: 'fire-amber',
    nameVi: 'Lửa Đỏ Rực Cháy',
    nameEn: 'Fire & Amber',
    color1: '#450a0a',
    color2: '#facc15',
    color3: '#ea580c',
    useThreeColors: true,
    angle: 45,
    type: 'linear' as const,
  },
  {
    id: 'emerald-forest',
    nameVi: 'Rừng Ngọc Bích',
    nameEn: 'Emerald Forest',
    color1: '#022c22',
    color2: '#10b981',
    color3: '#064e3b',
    useThreeColors: true,
    angle: 135,
    type: 'linear' as const,
  },
  {
    id: 'cosmic-galaxy',
    nameVi: 'Ngân Hà Vũ Trụ',
    nameEn: 'Cosmic Galaxy',
    color1: '#05050a',
    color2: '#0e2a47',
    color3: '#1e112a',
    useThreeColors: true,
    angle: 225,
    type: 'linear' as const,
  },
  {
    id: 'monochrome-noir',
    nameVi: 'Đen Trắng Điện Ảnh',
    nameEn: 'Monochrome Noir',
    color1: '#000000',
    color2: '#374151',
    color3: '#1f2937',
    useThreeColors: true,
    angle: 90,
    type: 'linear' as const,
  },
  {
    id: 'pastel-dawn',
    nameVi: 'Bình Minh Pastel',
    nameEn: 'Pastel Dawn',
    color1: '#fdf4ff',
    color2: '#cffafe',
    color3: '#e0e7ff',
    useThreeColors: true,
    angle: 135,
    type: 'linear' as const,
  },
  {
    id: 'minimal-dark',
    nameVi: 'Tối Giản Hiện Đại',
    nameEn: 'Minimalist Stealth',
    color1: '#0a0a0c',
    color2: '#27272a',
    color3: '#18181b',
    useThreeColors: true,
    angle: 180,
    type: 'linear' as const,
  },
];

const GRADIENT_ANGLES = [
  { angle: 0, label: '0°', arrow: '↑', nameVi: 'Dưới lên' },
  { angle: 45, label: '45°', arrow: '↗', nameVi: 'Chéo phải lên' },
  { angle: 90, label: '90°', arrow: '→', nameVi: 'Trái sang phải' },
  { angle: 135, label: '135°', arrow: '↘', nameVi: 'Chéo phải xuống' },
  { angle: 180, label: '180°', arrow: '↓', nameVi: 'Trên xuống' },
  { angle: 225, label: '225°', arrow: '↙', nameVi: 'Chéo trái xuống' },
  { angle: 270, label: '270°', arrow: '←', nameVi: 'Phải sang trái' },
  { angle: 315, label: '315°', arrow: '↖', nameVi: 'Chéo trái lên' },
];

export const BackgroundTab: React.FC<BackgroundTabProps> = ({
  background,
  onBackgroundChange,
  particles,
  onParticlesChange,
  language = 'vi',
  playlist,
  defaultBackground,
  onUpdateTrackBackground,
  onApplyBackgroundToAllTracks,
  onSelectTrackForPlayback,
}) => {
  const isVi = language === 'vi';
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTargetId, setSelectedTargetId] = useState<'global' | string>('global');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Active targeted track (if targeting a specific track)
  const activeTargetTrack = playlist?.tracks.find((t) => t.id === selectedTargetId);

  const updateBg = (partial: Partial<BackgroundConfig>) => {
    const newBg = { ...background, ...partial };
    onBackgroundChange(newBg);

    if (selectedTargetId !== 'global' && onUpdateTrackBackground) {
      onUpdateTrackBackground(selectedTargetId, newBg);
    }
  };

  const handleSelectTarget = (targetId: 'global' | string) => {
    setSelectedTargetId(targetId);
    if (targetId === 'global') {
      if (defaultBackground) {
        onBackgroundChange(defaultBackground);
      }
    } else {
      const track = playlist?.tracks.find((t) => t.id === targetId);
      if (track) {
        if (track.background) {
          onBackgroundChange(track.background);
        } else if (defaultBackground) {
          onBackgroundChange(defaultBackground);
        }
      }
    }
  };

  const handleResetTrackBackground = () => {
    if (selectedTargetId !== 'global' && onUpdateTrackBackground) {
      onUpdateTrackBackground(selectedTargetId, undefined);
      if (defaultBackground) {
        onBackgroundChange(defaultBackground);
      }
    }
  };

  const handleCreateTrackCustomBackground = () => {
    if (selectedTargetId !== 'global' && onUpdateTrackBackground) {
      const customBg = { ...background };
      onUpdateTrackBackground(selectedTargetId, customBg);
      onBackgroundChange(customBg);
    }
  };

  const updatePt = (partial: Partial<ParticleConfig>) => {
    onParticlesChange({ ...particles, ...partial });
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    updateBg({
      type: 'upload',
      isVideo: false,
      url,
    });
  };

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    updateBg({
      type: 'video',
      isVideo: true,
      url,
      videoUrl: url,
    });
  };

  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleHexChange = (key: 'color1' | 'color2' | 'color3', val: string) => {
    let hex = val.trim();
    if (hex && !hex.startsWith('#')) hex = '#' + hex;
    updateBg({ [key]: hex });
  };

  const handleSwapColors = () => {
    updateBg({
      color1: background.color2 || '#312e81',
      color2: background.color1 || '#0f172a',
    });
  };

  const isColorMode = background.type === 'solid' || background.type === 'gradient';

  const filteredPresets =
    activeCategory === 'all'
      ? BACKGROUND_PRESETS
      : BACKGROUND_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 0. Target Scope Selector: Global vs Specific Playlist Track */}
      {playlist && playlist.tracks.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                <ListMusic className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isVi ? 'Phạm Vi Áp Dụng Hình Nền' : 'Background Target Scope'}
                </span>
                <p className="text-[10px] text-neutral-400">
                  {isVi 
                    ? 'Tải ảnh/video hoặc chỉnh hiệu ứng nền riêng cho từng bài hát'
                    : 'Upload & customize individual backgrounds for each track'}
                </p>
              </div>
            </div>

            {activeTargetTrack && activeTargetTrack.background && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <Check className="w-3 h-3" />
                <span>{isVi ? 'Có Nền Riêng' : 'Custom BG'}</span>
              </span>
            )}
          </div>

          {/* Target Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => handleSelectTarget('global')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTargetId === 'global'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/40'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isVi ? '🌐 Nền Chung Dự Án' : '🌐 Project Default'}</span>
            </button>

            {playlist.tracks.map((t, idx) => {
              const isTarget = selectedTargetId === t.id;
              const hasCustomBg = !!t.background;
              const isCurrentlyPlaying = idx === playlist.currentIndex;

              return (
                <button
                  key={`${t.id || 'track'}-${idx}`}
                  type="button"
                  onClick={() => handleSelectTarget(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isTarget
                      ? 'bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-md shadow-purple-600/30 ring-1 ring-white/20'
                      : hasCustomBg
                      ? 'bg-neutral-800/90 text-neutral-200 border border-purple-500/40 hover:bg-neutral-700'
                      : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[130px]">
                    {idx + 1}. {t.title}
                  </span>
                  {hasCustomBg && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title={isVi ? 'Bài này có nền riêng' : 'Has custom background'} />
                  )}
                  {isCurrentlyPlaying && (
                    <span className="text-[9px] px-1 rounded bg-rose-500/30 text-rose-300 font-bold uppercase shrink-0">
                      {isVi ? 'Đang phát' : 'Playing'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active target track info and action banner */}
          {activeTargetTrack && (
            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {activeTargetTrack.background ? (
                  <div className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                    <span>{isVi ? 'Đang chỉnh nền riêng cho:' : 'Custom background for:'}</span>
                    <strong className="text-white truncate max-w-[200px]">"{activeTargetTrack.title}"</strong>
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-400 font-medium">
                    {isVi ? 'Bài này đang dùng nền chung. Bấm bên phải để tạo nền riêng.' : 'Track using project default background. Click to create custom.'}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {activeTargetTrack.background ? (
                  <>
                    <button
                      type="button"
                      onClick={handleResetTrackBackground}
                      title={isVi ? 'Xóa nền riêng, dùng nền mặc định' : 'Reset to default background'}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 text-neutral-300 hover:text-rose-300 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>{isVi ? 'Dùng Nền Chung' : 'Reset to Default'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyBackgroundToAllTracks && onApplyBackgroundToAllTracks(background)}
                      title={isVi ? 'Sao chép nền này cho tất cả các bài' : 'Apply this background to all tracks'}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>{isVi ? 'Áp Dụng Cho Tất Cả' : 'Apply to All'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateTrackCustomBackground}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90 text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isVi ? 'Tạo Nền Riêng Cho Bài Này' : 'Create Custom BG'}</span>
                  </button>
                )}

                {onSelectTrackForPlayback && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = playlist.tracks.findIndex((t) => t.id === selectedTargetId);
                      if (idx >= 0) onSelectTrackForPlayback(idx);
                    }}
                    title={isVi ? 'Phát bài này trên sân khấu' : 'Play this track on stage'}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-[11px] font-medium border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Disc className="w-3 h-3" />
                    <span>{isVi ? 'Phát Thử' : 'Play'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. Background Source Selection (Preset, Custom Color: Solid & Gradient, Custom Image / Video Upload) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {isVi ? 'Hình / Video Nền (Background Source)' : 'Background Image & Video Source'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title={isVi ? 'Tải ảnh PNG/JPG từ máy tính' : 'Upload custom PNG/JPG image'}
            >
              <Upload className="w-3 h-3" />
              <span>{isVi ? 'Tải Ảnh' : 'Upload Image'}</span>
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title={isVi ? 'Tải video MP4 làm nền chuyển động' : 'Upload custom MP4 video background'}
            >
              <Video className="w-3 h-3 text-rose-400" />
              <span>{isVi ? 'Tải Video MP4' : 'Upload MP4'}</span>
            </button>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCustomImageUpload}
        />

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/*,.mp4,.mov,.webm"
          className="hidden"
          onChange={handleCustomVideoUpload}
        />

        {/* Source Mode Primary Switcher: Preset Images / Video vs Custom Color (Solid & Gradient) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-neutral-900/90 border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              if (isColorMode) {
                updateBg({
                  type: 'preset',
                  isVideo: false,
                  url: background.url || BACKGROUND_PRESETS[0].url,
                });
              }
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isColorMode && !background.isVideo
                ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{isVi ? 'Ảnh Mẫu (Presets)' : 'Image Presets'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isColorMode) {
                updateBg({
                  type: background.type === 'solid' ? 'solid' : 'gradient',
                  isVideo: false,
                  color1: background.color1 || '#0f172a',
                  color2: background.color2 || '#312e81',
                  color3: background.color3 || '#7c3aed',
                  gradientAngle: background.gradientAngle ?? 135,
                  gradientType: background.gradientType || 'linear',
                  radialOrigin: background.radialOrigin || 'center',
                  useThreeColors: background.useThreeColors ?? false,
                });
              }
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isColorMode
                ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{isVi ? 'Màu Tùy Chỉnh (Solid & Gradient)' : 'Custom Color (Solid & Gradient)'}</span>
          </button>
        </div>

        {/* --- VIEW 1: IMAGE PRESETS & UPLOADS --- */}
        {!isColorMode && (
          <div className="space-y-3">
            {/* Video Mode Active Notice */}
            {background.isVideo && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="font-semibold">{isVi ? 'Đang phát nền Video MP4 động' : 'Active MP4 Video Background'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateBg({ type: 'preset', isVideo: false, url: BACKGROUND_PRESETS[0].url })}
                  className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-medium text-rose-300 transition-all cursor-pointer"
                >
                  {isVi ? 'Trở về Preset Ảnh' : 'Return to Image Preset'}
                </button>
              </div>
            )}

            {/* Custom Uploaded Image Active Notice */}
            {background.type === 'upload' && !background.isVideo && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-neutral-800 shrink-0 border border-cyan-500/40">
                    <img src={background.url} alt="Uploaded" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-semibold truncate">{isVi ? 'Đang dùng Ảnh tải lên từ máy tính' : 'Active Custom Uploaded Image'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateBg({ type: 'preset', isVideo: false, url: BACKGROUND_PRESETS[0].url })}
                  className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[11px] font-medium text-cyan-300 transition-all cursor-pointer shrink-0"
                >
                  {isVi ? 'Về Preset Ảnh' : 'Return to Presets'}
                </button>
              </div>
            )}

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {isVi ? cat.nameVi : cat.nameEn}
                </button>
              ))}
            </div>

            {/* Preset Gallery Grid */}
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl custom-scrollbar">
              {filteredPresets.map((preset) => {
                const isSelected = !background.isVideo && background.type === 'preset' && background.url === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => updateBg({ type: 'preset', isVideo: false, url: preset.url })}
                    className={`relative aspect-video rounded-xl overflow-hidden border transition-all group cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 scale-[0.98]'
                        : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <img
                      src={preset.thumbnail}
                      alt={isVi ? preset.nameVi : (preset.nameEn || preset.name)}
                      loading="lazy"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-medium text-white truncate drop-shadow">
                        {isVi ? preset.nameVi : (preset.nameEn || preset.name)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Discover Banner for Custom Color & Gradient */}
            <button
              type="button"
              onClick={() => {
                updateBg({
                  type: 'gradient',
                  isVideo: false,
                  color1: background.color1 || '#0f172a',
                  color2: background.color2 || '#312e81',
                  color3: background.color3 || '#7c3aed',
                  gradientAngle: background.gradientAngle ?? 135,
                  gradientType: background.gradientType || 'linear',
                  radialOrigin: background.radialOrigin || 'center',
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-indigo-950/40 hover:from-cyan-900/50 hover:to-indigo-900/50 border border-cyan-500/30 hover:border-cyan-400/50 text-xs text-neutral-300 hover:text-white flex items-center justify-between transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Palette className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-white block text-xs">
                    {isVi ? 'Màu Nền Tùy Chỉnh (Solid & Gradient)' : 'Custom Color & Gradient Background'}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    {isVi ? 'Tùy biến màu đơn AMOLED hoặc dải chuyển sắc 360°' : 'Set solid AMOLED colors or multi-color 360° gradients'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        )}

        {/* --- VIEW 2: CUSTOM COLOR SETTINGS (SOLID & GRADIENT) --- */}
        {isColorMode && (
          <div className="space-y-3.5 p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
            {/* Sub-type Mode Toggle: Solid Color vs Gradient */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => updateBg({ type: 'solid', isVideo: false })}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  background.type === 'solid'
                    ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: background.color1 || '#0f172a' }}
                />
                <span>{isVi ? 'Màu Đơn (Solid Color)' : 'Solid Color'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateBg({ type: 'gradient', isVideo: false })}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  background.type === 'gradient'
                    ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                  style={{
                    background: `linear-gradient(135deg, ${background.color1 || '#0f172a'}, ${
                      background.useThreeColors && background.color3 ? background.color3 + ', ' : ''
                    }${background.color2 || '#312e81'})`,
                  }}
                />
                <span>{isVi ? 'Chuyển Sắc (Gradient)' : 'Gradient'}</span>
              </button>
            </div>

            {/* Live Visual Preview Card */}
            <div
              className="relative h-20 rounded-xl border border-neutral-700/60 shadow-inner overflow-hidden flex items-end p-2 transition-all"
              style={{
                background:
                  background.type === 'solid'
                    ? background.color1 || '#0f172a'
                    : background.gradientType === 'radial'
                    ? `radial-gradient(circle at ${
                        background.radialOrigin === 'top' ? 'top' : background.radialOrigin === 'bottom' ? 'bottom' : 'center'
                      }, ${background.color1 || '#0f172a'}, ${
                        background.useThreeColors && background.color3 ? background.color3 + ', ' : ''
                      }${background.color2 || '#312e81'})`
                    : `linear-gradient(${background.gradientAngle ?? 135}deg, ${background.color1 || '#0f172a'}, ${
                        background.useThreeColors && background.color3 ? background.color3 + ', ' : ''
                      }${background.color2 || '#312e81'})`,
              }}
            >
              <div className="flex items-center justify-between w-full bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-white">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold uppercase tracking-wider">
                    {background.type === 'solid'
                      ? (background.color1 || '#0f172a')
                      : `${background.color1 || '#0f172a'} ➔ ${background.color2 || '#312e81'}`}
                  </span>
                  {background.type === 'gradient' && (
                    <span className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] text-cyan-300 font-sans font-medium">
                      {background.gradientType === 'radial'
                        ? (isVi ? 'Tỏa tròn' : 'Radial')
                        : `${background.gradientAngle ?? 135}°`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-300 font-medium">
                    {background.type === 'solid'
                      ? (isVi ? 'Màu Đơn' : 'Solid')
                      : (isVi ? 'Chuyển Sắc' : 'Gradient')}
                  </span>
                </div>
              </div>
            </div>

            {/* === CONTROLS FOR SOLID COLOR === */}
            {background.type === 'solid' && (
              <div className="space-y-3">
                {/* Color Picker & Hex Input */}
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-neutral-950/70 border border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <label className="relative cursor-pointer group">
                      <input
                        type="color"
                        value={background.color1 || '#0f172a'}
                        onChange={(e) => updateBg({ color1: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className="w-9 h-9 rounded-xl border border-white/20 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: background.color1 || '#0f172a' }}
                      >
                        <Paintbrush className="w-4 h-4 text-white/70 drop-shadow" />
                      </div>
                    </label>
                    <div>
                      <span className="text-xs font-semibold text-neutral-200 block">
                        {isVi ? 'Màu Nền Chính' : 'Main Color'}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {background.color1 || '#0f172a'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={background.color1 || '#0f172a'}
                      onChange={(e) => handleHexChange('color1', e.target.value)}
                      placeholder="#0f172a"
                      maxLength={7}
                      className="w-24 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-cyan-300 uppercase focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyHex(background.color1 || '#0f172a')}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                      title={isVi ? 'Sao chép mã HEX' : 'Copy HEX code'}
                    >
                      {copiedHex === (background.color1 || '#0f172a') ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Curated Solid Color Swatches */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {isVi ? 'Bảng Màu Đơn Chuẩn Studio (Curated Palettes)' : 'Curated Studio Palettes'}
                  </label>
                  {SOLID_COLOR_PALETTES.map((palette, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[10px] text-neutral-400 font-medium block">
                        {isVi ? palette.categoryVi : palette.categoryEn}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {palette.colors.map((c) => {
                          const isPicked = (background.color1 || '#0f172a').toLowerCase() === c.hex.toLowerCase();
                          return (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => updateBg({ color1: c.hex })}
                              title={`${isVi ? c.nameVi : c.nameEn} (${c.hex})`}
                              className={`relative w-7 h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                                isPicked
                                  ? 'border-cyan-400 ring-2 ring-cyan-500/60 scale-110'
                                  : 'border-neutral-700 hover:border-neutral-400 hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {isPicked && <Check className="w-3 h-3 text-white drop-shadow-md" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === CONTROLS FOR GRADIENT COLOR === */}
            {background.type === 'gradient' && (
              <div className="space-y-3.5">
                {/* Gradient Style (Linear vs Radial) & Stops Count */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Style */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {isVi ? 'Kiểu Gradient' : 'Gradient Type'}
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => updateBg({ gradientType: 'linear' })}
                        className={`py-1 text-center rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          background.gradientType !== 'radial'
                            ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isVi ? 'Tuyến tính' : 'Linear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBg({ gradientType: 'radial' })}
                        className={`py-1 text-center rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          background.gradientType === 'radial'
                            ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isVi ? 'Tỏa tròn' : 'Radial'}
                      </button>
                    </div>
                  </div>

                  {/* Stop count (2 Colors vs 3 Colors) */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {isVi ? 'Số Lượng Màu' : 'Color Stops'}
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
                      <button
                        type="button"
                        onClick={() => updateBg({ useThreeColors: false })}
                        className={`py-1 text-center rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          !background.useThreeColors
                            ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isVi ? '2 Màu' : '2 Colors'}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBg({ useThreeColors: true, color3: background.color3 || '#7c3aed' })}
                        className={`py-1 text-center rounded text-[11px] font-semibold transition-all cursor-pointer ${
                          background.useThreeColors
                            ? 'bg-neutral-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isVi ? '3 Màu' : '3 Colors'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Color Pickers Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      {isVi ? 'Các Điểm Màu Chuyển' : 'Color Stops'}
                    </label>
                    <button
                      type="button"
                      onClick={handleSwapColors}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-[11px] font-medium transition-all cursor-pointer"
                      title={isVi ? 'Đảo ngược vị trí Màu 1 và Màu 2' : 'Swap Color 1 and Color 2'}
                    >
                      <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                      <span>{isVi ? 'Đảo Chiều' : 'Swap Colors'}</span>
                    </button>
                  </div>

                  <div className={`grid gap-2 ${background.useThreeColors ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {/* Color 1 (Start) */}
                    <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          {isVi ? 'Màu 1 (Đầu)' : 'Color 1'}
                        </span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: background.color1 || '#0f172a' }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="relative cursor-pointer shrink-0">
                          <input
                            type="color"
                            value={background.color1 || '#0f172a'}
                            onChange={(e) => updateBg({ color1: e.target.value })}
                            className="sr-only"
                          />
                          <div
                            className="w-7 h-7 rounded-lg border border-white/20 shadow-xs hover:scale-105 transition-transform"
                            style={{ backgroundColor: background.color1 || '#0f172a' }}
                          />
                        </label>
                        <input
                          type="text"
                          value={background.color1 || '#0f172a'}
                          onChange={(e) => handleHexChange('color1', e.target.value)}
                          className="w-full px-1.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-cyan-300 uppercase focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Color 3 (Middle) - Only if 3-color mode */}
                    {background.useThreeColors && (
                      <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">
                            {isVi ? 'Màu Giữa' : 'Color 3'}
                          </span>
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: background.color3 || '#7c3aed' }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="relative cursor-pointer shrink-0">
                            <input
                              type="color"
                              value={background.color3 || '#7c3aed'}
                              onChange={(e) => updateBg({ color3: e.target.value })}
                              className="sr-only"
                            />
                            <div
                              className="w-7 h-7 rounded-lg border border-white/20 shadow-xs hover:scale-105 transition-transform"
                              style={{ backgroundColor: background.color3 || '#7c3aed' }}
                            />
                          </label>
                          <input
                            type="text"
                            value={background.color3 || '#7c3aed'}
                            onChange={(e) => handleHexChange('color3', e.target.value)}
                            className="w-full px-1.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-cyan-300 uppercase focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Color 2 (End) */}
                    <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          {isVi ? 'Màu 2 (Cuối)' : 'Color 2'}
                        </span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: background.color2 || '#312e81' }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <label className="relative cursor-pointer shrink-0">
                          <input
                            type="color"
                            value={background.color2 || '#312e81'}
                            onChange={(e) => updateBg({ color2: e.target.value })}
                            className="sr-only"
                          />
                          <div
                            className="w-7 h-7 rounded-lg border border-white/20 shadow-xs hover:scale-105 transition-transform"
                            style={{ backgroundColor: background.color2 || '#312e81' }}
                          />
                        </label>
                        <input
                          type="text"
                          value={background.color2 || '#312e81'}
                          onChange={(e) => handleHexChange('color2', e.target.value)}
                          className="w-full px-1.5 py-1 rounded bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-cyan-300 uppercase focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linear Angle Slider & Direction Shortcuts (Only if Linear) */}
                {background.gradientType !== 'radial' && (
                  <div className="space-y-2 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs font-semibold text-neutral-200">
                          {isVi ? 'Góc Xoay Dải Màu (Linear Angle)' : 'Linear Gradient Angle'}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                        {background.gradientAngle ?? 135}°
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={background.gradientAngle ?? 135}
                      onChange={(e) => updateBg({ gradientAngle: Number(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />

                    {/* Quick Direction Buttons */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
                      {GRADIENT_ANGLES.map((d) => {
                        const isCurrent = (background.gradientAngle ?? 135) === d.angle;
                        return (
                          <button
                            key={d.angle}
                            type="button"
                            onClick={() => updateBg({ gradientAngle: d.angle })}
                            title={`${d.label} - ${d.nameVi}`}
                            className={`py-1 rounded text-center transition-all cursor-pointer text-[11px] font-semibold flex items-center justify-center gap-0.5 ${
                              isCurrent
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                            }`}
                          >
                            <span>{d.arrow}</span>
                            <span>{d.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Radial Origin Controls (Only if Radial) */}
                {background.gradientType === 'radial' && (
                  <div className="space-y-2 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
                    <label className="block text-xs font-semibold text-neutral-200">
                      {isVi ? 'Vị Trí Tâm Tỏa Tròn (Radial Origin)' : 'Radial Center Origin'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'center', labelVi: 'Tâm Giữa', labelEn: 'Center' },
                        { id: 'top', labelVi: 'Đỉnh Trên', labelEn: 'Top' },
                        { id: 'bottom', labelVi: 'Đáy Dưới', labelEn: 'Bottom' },
                      ].map((pos) => {
                        const isPos = (background.radialOrigin || 'center') === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => updateBg({ radialOrigin: pos.id as 'center' | 'top' | 'bottom' })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                              isPos
                                ? 'bg-neutral-800 text-cyan-300 border border-cyan-500/40 shadow-xs'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                            }`}
                          >
                            {isVi ? pos.labelVi : pos.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Curated Gradient Presets */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      {isVi ? 'Mẫu Gradient Chuẩn Studio (Presets)' : 'Studio Gradient Presets'}
                    </label>
                    <span className="text-[10px] text-neutral-500 font-medium">12 presets</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GRADIENT_PRESETS.map((gp) => {
                      const isApplied =
                        background.color1 === gp.color1 &&
                        background.color2 === gp.color2 &&
                        (!gp.useThreeColors || background.color3 === gp.color3);

                      return (
                        <button
                          key={gp.id}
                          type="button"
                          onClick={() => {
                            updateBg({
                              type: 'gradient',
                              isVideo: false,
                              color1: gp.color1,
                              color2: gp.color2,
                              color3: gp.color3,
                              useThreeColors: gp.useThreeColors,
                              gradientAngle: gp.angle,
                              gradientType: gp.type,
                            });
                          }}
                          className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer group ${
                            isApplied
                              ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-neutral-800/80 scale-[0.98]'
                              : 'border-neutral-800 hover:border-neutral-600 bg-neutral-950/60'
                          }`}
                        >
                          <div
                            className="h-8 rounded-lg mb-1.5 border border-white/10 group-hover:scale-102 transition-transform shadow-inner"
                            style={{
                              background: `linear-gradient(${gp.angle}deg, ${gp.color1}, ${
                                gp.useThreeColors && gp.color3 ? gp.color3 + ', ' : ''
                              }${gp.color2})`,
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-neutral-200 truncate group-hover:text-cyan-300">
                              {isVi ? gp.nameVi : gp.nameEn}
                            </span>
                            {isApplied && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Switch back to Preset Gallery */}
            <div className="pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => {
                  updateBg({
                    type: 'preset',
                    isVideo: false,
                    url: background.url || BACKGROUND_PRESETS[0].url,
                  });
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isVi ? 'Quay Lại Thư Viện Ảnh (Preset Gallery)' : 'Return to Image Presets'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Image Filters & Adjustments */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
          {isVi ? 'Bộ Lọc & Hiệu Ứng Nền (Filters)' : 'Background Filters & FX'}
        </label>

        {/* Blur slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">{isVi ? 'Độ làm mờ (Blur)' : 'Blur Radius'}</span>
            <span className="text-cyan-400 font-mono">{background.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={background.blur}
            onChange={(e) => updateBg({ blur: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">{isVi ? 'Độ sáng (Brightness)' : 'Brightness'}</span>
            <span className="text-cyan-400 font-mono">{background.brightness}%</span>
          </div>
          <input
            type="range"
            min={30}
            max={130}
            value={background.brightness}
            onChange={(e) => updateBg({ brightness: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Vignette Shadow */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-400">{isVi ? 'Viền đen nghệ thuật (Vignette)' : 'Artistic Vignette'}</span>
            <span className="text-cyan-400 font-mono">{background.vignette}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={85}
            value={background.vignette}
            onChange={(e) => updateBg({ vignette: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Beat & Bass Zoom Settings Panel */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-cyan-500/30 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block">
                  {isVi ? 'Zoom Nền Theo Nhịp (Beat & Bass Zoom)' : 'Beat & Bass Zoom Dynamics'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Phóng to co giãn nền theo nhịp trống Kick & giai điệu' : 'Pumps and scales background in sync with kicks and tempo'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={background.beatZoom}
                onChange={(e) => updateBg({ beatZoom: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          {background.beatZoom && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              {/* 1. Nguồn nhịp (Trigger Audio Source) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Disc className="w-3 h-3 text-cyan-400" />
                  {isVi ? 'Nguồn bắt nhịp âm thanh (Audio Source)' : 'Audio Detection Source'}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {ZOOM_TRIGGERS.map((trig) => {
                    const Icon = trig.icon;
                    const isSelected = (background.zoomTrigger || 'bass') === trig.id;
                    return (
                      <button
                        key={trig.id}
                        type="button"
                        onClick={() => updateBg({ zoomTrigger: trig.id })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-neutral-500'}`} />
                          <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-cyan-200' : 'text-neutral-300'}`}>
                            {isVi ? trig.nameVi : trig.nameEn}
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-400 line-clamp-2 leading-tight">
                          {isVi ? trig.descVi : trig.descEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Kiểu chuyển động (Motion Style) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  {isVi ? 'Kiểu chuyển động Zoom (Motion Style)' : 'Motion Curve Style'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ZOOM_STYLES.map((st) => {
                    const Icon = st.icon;
                    const isSelected = (background.zoomStyle || 'pulse') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateBg({ zoomStyle: st.id })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-neutral-500'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-cyan-200' : 'text-neutral-300'}`}>
                            {isVi ? st.nameVi : st.nameEn}
                          </span>
                          <span className="text-[9px] text-neutral-400 block leading-tight">
                            {isVi ? st.descVi : st.descEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Tốc độ Zoom (Speed Setting: Slow to Fast) */}
              <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    {isVi ? 'Tốc độ phản hồi (Slow → Fast)' : 'Response Speed (Slow → Fast)'}
                  </span>
                  <span className="text-cyan-400 font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {(background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0).toFixed(1)}x{' '}
                    {(background.zoomSpeed || 1.0) <= 0.6 ? (isVi ? '(Chậm êm)' : '(Smooth)') : (background.zoomSpeed || 1.0) >= 2.0 ? (isVi ? '(Cực nhanh)' : '(Ultra)') : (isVi ? '(Chuẩn)' : '(Normal)')}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.0}
                  step={0.1}
                  value={background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0}
                  onChange={(e) => updateBg({ zoomSpeed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                
                {/* Speed Quick Presets */}
                <div className="flex items-center gap-1 pt-1">
                  {SPEED_PRESETS.map((sp) => {
                    const currentSpeed = background.zoomSpeed !== undefined ? background.zoomSpeed : 1.0;
                    const isActive = Math.abs(currentSpeed - sp.value) < 0.05;
                    return (
                      <button
                        key={sp.value}
                        type="button"
                        onClick={() => updateBg({ zoomSpeed: sp.value })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500 text-white font-bold shadow-sm'
                            : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isVi ? sp.labelVi : sp.labelEn} ({sp.value}x)
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Biên độ Zoom (Zoom Intensity Scale) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">{isVi ? 'Độ phóng to (Zoom Scale / Intensity)' : 'Zoom Intensity Scale'}</span>
                  <span className="text-cyan-400 font-mono">
                    {((background.zoomIntensity !== undefined ? background.zoomIntensity : 0.05) * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={0.15}
                  step={0.005}
                  value={background.zoomIntensity !== undefined ? background.zoomIntensity : 0.05}
                  onChange={(e) => updateBg({ zoomIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[9px] text-neutral-500 mt-0.5">
                  <span>{isVi ? 'Nhẹ nhàng (1%)' : 'Subtle (1%)'}</span>
                  <span>{isVi ? 'Vừa phải (5%)' : 'Balanced (5%)'}</span>
                  <span>{isVi ? 'Mạnh mẽ (15%)' : 'Intense (15%)'}</span>
                </div>
              </div>

              {/* 5. Invert Zoom Direction */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                <div>
                  <span className="text-[11px] font-medium text-neutral-300 block">
                    {isVi ? 'Đảo chiều Zoom (Zoom Out khi có beat)' : 'Invert Zoom (Zoom Out on beat)'}
                  </span>
                  <span className="text-[9px] text-neutral-500">
                    {isVi ? 'Mặc định là phóng to ra (Zoom In), bật lên để thu nhỏ lại khi đập nhịp' : 'Default scales outward; enable to compress inward on beats'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={!!background.zoomInvert}
                  onChange={(e) => updateBg({ zoomInvert: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 ml-2"
                />
              </label>
            </div>
          )}
        </div>

        {/* 2.2 Hiệu Ứng Nhiễu Sóng Nền (Background Glitch Effect) */}
        <div className="p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Tv className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-200 block">
                  {isVi ? 'Hiệu Ứng Nhiễu Sóng Nền (Glitch Effect)' : 'Background Glitch & Scanline Effect'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Tách màu RGB, cắt lát xé hình & quét vạch VHS theo nhịp nhạc' : 'RGB chromatic displacement, tearing slices & VHS scanlines on beat'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={background.glitchEffect || false}
                onChange={(e) => updateBg({ glitchEffect: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>

          {background.glitchEffect && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              {/* 1. Nguồn kích hoạt Glitch (Trigger) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Disc className="w-3 h-3 text-rose-400" />
                  {isVi ? 'Thời điểm kích hoạt giật nhiễu (Trigger)' : 'Glitch Trigger Event'}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {GLITCH_TRIGGERS.map((trig) => {
                    const Icon = trig.icon;
                    const isSelected = (background.glitchTrigger || 'bass') === trig.id;
                    return (
                      <button
                        key={trig.id}
                        type="button"
                        onClick={() => updateBg({ glitchTrigger: trig.id })}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-300' : 'text-neutral-500'}`} />
                        <span className={`text-[10px] font-semibold truncate ${isSelected ? 'text-rose-200' : 'text-neutral-300'}`}>
                          {isVi ? trig.nameVi : trig.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Kiểu nhiễu (Glitch Style) */}
              <div>
                <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-rose-400" />
                  {isVi ? 'Kiểu hiệu ứng Glitch (Glitch Style)' : 'Glitch Visual Style'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {GLITCH_STYLES.map((st) => {
                    const Icon = st.icon;
                    const isSelected = (background.glitchStyle || 'rgb-shift') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateBg({ glitchStyle: st.id })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isSelected
                            ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/40'
                            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-rose-300' : 'text-neutral-500'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-rose-200' : 'text-neutral-300'}`}>
                            {isVi ? st.nameVi : st.nameEn}
                          </span>
                          <span className="text-[9px] text-neutral-400 block leading-tight">
                            {isVi ? st.descVi : st.descEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Cường độ Glitch (Intensity Slider) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-300 font-medium">{isVi ? 'Cường độ xé hình & giật nhiễu' : 'Glitch Intensity & Tearing'}</span>
                  <span className="text-rose-400 font-mono font-bold">
                    {Math.round((background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45}
                  onChange={(e) => updateBg({ glitchIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                
                {/* Intensity Quick Presets */}
                <div className="flex items-center gap-1 pt-1">
                  {[
                    { labelVi: 'Nhẹ êm', labelEn: 'Subtle', val: 0.25 },
                    { labelVi: 'Vừa phải', labelEn: 'Medium', val: 0.45 },
                    { labelVi: 'Mạnh mẽ', labelEn: 'Strong', val: 0.75 },
                    { labelVi: 'Bùng nổ', labelEn: 'Extreme', val: 1.0 },
                  ].map((p) => {
                    const cur = background.glitchIntensity !== undefined ? background.glitchIntensity : 0.45;
                    const active = Math.abs(cur - p.val) < 0.05;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => updateBg({ glitchIntensity: p.val })}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-rose-500 text-white font-bold shadow-sm'
                            : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isVi ? p.labelVi : p.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Tách màu RGB (Chromatic Aberration Split) */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Split className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[11px] font-medium text-neutral-300 block">
                      {isVi ? 'Tách sắc sai quang học RGB (Color Split)' : 'RGB Chromatic Color Split'}
                    </span>
                    <span className="text-[9px] text-neutral-500">
                      {isVi ? 'Tạo viền bóng đỏ và xanh lam (Anaglyph 3D) khi có chấn động' : 'Creates red and blue 3D anaglyph borders on heavy impact'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={background.glitchColorSplit !== false}
                  onChange={(e) => updateBg({ glitchColorSplit: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 ml-2"
                />
              </label>
            </div>
          )}
        </div>

        {/* NEW: Circle Ripple Effect (Gợn Sóng Tròn Đồng Tâm) */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
                <Radio className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    {isVi ? 'Hiệu Ứng Sóng Gợn Tròn (Circle Ripple)' : 'Circle Ripple Effect'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {isVi ? 'Mới' : 'New'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {isVi 
                    ? 'Các vòng tròn đồng tâm lan tỏa mượt mà từ tâm hoặc đĩa nhạc, co giãn theo nhịp bass'
                    : 'Smooth concentric ripple waves expanding outward and pulsing to bass kicks'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={background.circleRipple === true}
                onChange={(e) => updateBg({ circleRipple: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {background.circleRipple && (
            <div className="space-y-3 pt-1 border-t border-neutral-800/80">
              {/* Origin Selection */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                  {isVi ? 'Tâm Điểm Lan Tỏa Sóng (Origin Point)' : 'Ripple Center Origin'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'center', labelVi: 'Giữa màn hình', labelEn: 'Canvas Center' },
                    { id: 'cover', labelVi: 'Tâm Đĩa / Badge', labelEn: 'Cover Art / Badge' },
                    { id: 'bottom', labelVi: 'Chân màn hình', labelEn: 'Bottom Canvas' },
                  ].map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => updateBg({ circleRippleOrigin: org.id as any })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer truncate ${
                        (background.circleRippleOrigin || 'center') === org.id
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {isVi ? org.labelVi : org.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { nameVi: 'Mặt nước êm', nameEn: 'Gentle', count: 3, speed: 0.8, op: 0.3, width: 2, glow: false },
                  { nameVi: 'Radar âm nhạc', nameEn: 'Sonar', count: 4, speed: 1.1, op: 0.45, width: 2.5, glow: true },
                  { nameVi: 'EDM Pulse', nameEn: 'EDM', count: 6, speed: 1.6, op: 0.65, width: 3.5, glow: true },
                  { nameVi: 'Mega Bass', nameEn: 'Bass Wave', count: 8, speed: 2.2, op: 0.85, width: 4.5, glow: true },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateBg({ 
                      circleRippleCount: p.count, 
                      circleRippleSpeed: p.speed, 
                      circleRippleOpacity: p.op, 
                      circleRippleLineWidth: p.width,
                      circleRippleGlow: p.glow
                    })}
                    className="py-1 px-1 rounded-lg text-[10px] font-medium bg-neutral-950/60 border border-neutral-800 text-neutral-400 hover:text-teal-300 hover:border-teal-500/40 transition-all cursor-pointer truncate"
                  >
                    {isVi ? p.nameVi : p.nameEn}
                  </button>
                ))}
              </div>

              {/* Color Picker & Quick Palette */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-neutral-400">{isVi ? 'Màu gợn sóng' : 'Ripple Color'}</span>
                  <span className="font-mono text-[11px] text-teal-400">{background.circleRippleColor || '#ffffff'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={background.circleRippleColor || '#ffffff'}
                    onChange={(e) => updateBg({ circleRippleColor: e.target.value })}
                    className="w-8 h-8 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap flex-1">
                    {[
                      { name: 'Trắng', hex: '#ffffff' },
                      { name: 'Xanh Cyan', hex: '#06b6d4' },
                      { name: 'Xanh Teal', hex: '#14b8a6' },
                      { name: 'Hồng Neon', hex: '#f43f5e' },
                      { name: 'Vàng Kim', hex: '#fbbf24' },
                      { name: 'Tím Cyber', hex: '#a855f7' },
                      { name: 'Cam Lửa', hex: '#f97316' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => updateBg({ circleRippleColor: col.hex })}
                        style={{ backgroundColor: col.hex }}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                          (background.circleRippleColor || '#ffffff').toLowerCase() === col.hex.toLowerCase()
                            ? 'border-white scale-110 shadow-md ring-2 ring-teal-500/50'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sliders: Opacity, Count, Speed, Line Width */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ mờ đục' : 'Opacity'}</span>
                    <span className="text-teal-400 font-mono">
                      {Math.round((background.circleRippleOpacity ?? 0.4) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={1.0}
                    step={0.05}
                    value={background.circleRippleOpacity ?? 0.4}
                    onChange={(e) => updateBg({ circleRippleOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Số lượng vòng' : 'Ring Count'}</span>
                    <span className="text-teal-400 font-mono">{background.circleRippleCount ?? 4}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={background.circleRippleCount ?? 4}
                    onChange={(e) => updateBg({ circleRippleCount: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Tốc độ lan tỏa' : 'Expansion Speed'}</span>
                    <span className="text-teal-400 font-mono">{(background.circleRippleSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.1}
                    value={background.circleRippleSpeed ?? 1.0}
                    onChange={(e) => updateBg({ circleRippleSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">{isVi ? 'Độ dày nét viền' : 'Line Width'}</span>
                    <span className="text-teal-400 font-mono">{(background.circleRippleLineWidth ?? 2.5).toFixed(1)}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={background.circleRippleLineWidth ?? 2.5}
                    onChange={(e) => updateBg({ circleRippleLineWidth: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>

              {/* Toggles: Audio Reactive & Neon Glow */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                  <span className="text-[11px] font-medium text-neutral-300">
                    {isVi ? 'Nảy nở theo nhịp Bass' : 'Bass Beat Reactive'}
                  </span>
                  <input
                    type="checkbox"
                    checked={background.circleRippleReactive !== false}
                    onChange={(e) => updateBg({ circleRippleReactive: e.target.checked })}
                    className="rounded text-teal-500 focus:ring-teal-500 bg-neutral-800 border-neutral-700 ml-2"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
                  <span className="text-[11px] font-medium text-neutral-300">
                    {isVi ? 'Hào quang Neon phát sáng' : 'Neon Luminous Glow'}
                  </span>
                  <input
                    type="checkbox"
                    checked={background.circleRippleGlow !== false}
                    onChange={(e) => updateBg({ circleRippleGlow: e.target.checked })}
                    className="rounded text-teal-500 focus:ring-teal-500 bg-neutral-800 border-neutral-700 ml-2"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Particle Overlays */}
      <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {isVi ? 'Hiệu Ứng Hạt Lơ Lửng (Particles)' : 'Floating Particle Overlays'}
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={particles.enabled}
              onChange={(e) => updatePt({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Particle Type Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {PARTICLE_TYPES.map((pt) => {
            const Icon = pt.icon;
            const isSelected = particles.type === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => updatePt({ type: pt.id, enabled: pt.id !== 'none' })}
                className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                  <span className="text-xs font-semibold truncate">{isVi ? pt.nameVi : pt.nameEn}</span>
                </div>
                {(pt.badgeVi || pt.badgeEn) && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    {isVi ? pt.badgeVi : pt.badgeEn}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Particle Controls & Customization */}
        {particles.enabled && particles.type !== 'none' && (
          <div className="space-y-4 pt-1">
            {/* 1. DEDICATED SNOWFALL & WIND DIRECTION CONTROLS */}
            {particles.type === 'snow' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/40 via-neutral-900 to-cyan-950/30 border border-sky-500/30 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                  <div className="flex items-center gap-2">
                    <CloudSnow className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-sky-200">
                      {isVi ? 'Tùy Chỉnh Tuyết Rơi & Hướng Gió (Snow & Wind Dynamics)' : 'Snowfall & Wind Dynamics'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {isVi ? 'Vật Lý Gió ❄️' : 'Wind Physics ❄️'}
                  </span>
                </div>

                {/* Snowflake Type Selector */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                    <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                    {isVi ? 'Kiểu Bông Tuyết (Snowflake Type)' : 'Snowflake Geometry'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SNOWFLAKE_TYPES.map((st) => {
                      const isSelected = (particles.snowFlakeType || 'mixed') === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => updatePt({ snowFlakeType: st.id })}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/40'
                              : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-sky-200' : 'text-neutral-300'}`}>
                            {isVi ? st.nameVi : st.nameEn}
                          </span>
                          <span className="text-[9px] text-neutral-400 block leading-tight">
                            {isVi ? st.descVi : st.descEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wind Direction Angle (-60° to +60°) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      {isVi ? 'Hướng gió thổi (Wind Angle)' : 'Wind Direction Angle'}
                    </span>
                    <span className="text-sky-400 font-mono font-bold">
                      {(particles.snowWindAngle !== undefined ? particles.snowWindAngle : 15) > 0 ? `+${particles.snowWindAngle ?? 15}° ${isVi ? '(Sang Phải)' : '(Rightward)'}` : (particles.snowWindAngle ?? 15) < 0 ? `${particles.snowWindAngle}° ${isVi ? '(Sang Trái)' : '(Leftward)'}` : `0° ${isVi ? '(Thẳng Đứng)' : '(Vertical)'}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={60}
                    step={5}
                    value={particles.snowWindAngle !== undefined ? particles.snowWindAngle : 15}
                    onChange={(e) => updatePt({ snowWindAngle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                  
                  {/* Wind Direction Quick Presets */}
                  <div className="flex items-center gap-1 pt-1.5">
                    {[
                      { labelVi: 'Gió Trái (-35°)', labelEn: 'Left (-35°)', val: -35 },
                      { labelVi: 'Thẳng đứng (0°)', labelEn: 'Vertical (0°)', val: 0 },
                      { labelVi: 'Gió Nhẹ (+15°)', labelEn: 'Breeze (+15°)', val: 15 },
                      { labelVi: 'Gió Mạnh (+45°)', labelEn: 'Gale (+45°)', val: 45 },
                    ].map((wp) => {
                      const cur = particles.snowWindAngle !== undefined ? particles.snowWindAngle : 15;
                      const active = cur === wp.val;
                      return (
                        <button
                          key={wp.val}
                          type="button"
                          onClick={() => updatePt({ snowWindAngle: wp.val })}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                            active
                              ? 'bg-sky-500 text-white font-bold shadow-sm'
                              : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {isVi ? wp.labelVi : wp.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wind Speed Multiplier & Turbulence */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Wind className="w-3 h-3 text-sky-400" />
                        {isVi ? 'Tốc độ gió' : 'Wind Velocity'}
                      </span>
                      <span className="text-sky-400 font-mono">
                        {(particles.snowWindSpeed !== undefined ? particles.snowWindSpeed : 1.0).toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={2.5}
                      step={0.1}
                      value={particles.snowWindSpeed !== undefined ? particles.snowWindSpeed : 1.0}
                      onChange={(e) => updatePt({ snowWindSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Độ chao đảo (Turbulence)' : 'Turbulence'}</span>
                      <span className="text-sky-400 font-mono">
                        {particles.snowTurbulence !== undefined ? particles.snowTurbulence : 40}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={particles.snowTurbulence !== undefined ? particles.snowTurbulence : 40}
                      onChange={(e) => updatePt({ snowTurbulence: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 1.5 DEDICATED RAINFALL & WIND DIRECTION CONTROLS */}
            {particles.type === 'rain' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-neutral-900 to-cyan-950/40 border border-blue-500/30 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-200">
                      {isVi ? 'Tùy Chỉnh Mưa Rơi & Hướng Gió (Rain & Wind Dynamics)' : 'Rain & Wind Dynamics'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {isVi ? 'Vật Lý Mưa 🌧️' : 'Rain Physics 🌧️'}
                  </span>
                </div>

                {/* Raindrop Type Selector */}
                <div>
                  <span className="text-[11px] font-semibold text-neutral-300 block mb-1.5 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    {isVi ? 'Kiểu Hạt Mưa (Raindrop Type)' : 'Raindrop Geometry & Streaks'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {RAINDROP_TYPES.map((rt) => {
                      const isSelected = (particles.rainDropType || 'mixed') === rt.id;
                      return (
                        <button
                          key={rt.id}
                          type="button"
                          onClick={() => updatePt({ rainDropType: rt.id })}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-500/25 border-blue-400 text-white shadow-sm ring-1 ring-blue-500/40'
                              : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <span className={`text-xs font-semibold block ${isSelected ? 'text-blue-200' : 'text-neutral-300'}`}>
                            {isVi ? rt.nameVi : rt.nameEn}
                          </span>
                          <span className="text-[9px] text-neutral-400 block leading-tight">
                            {isVi ? rt.descVi : rt.descEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wind Direction Angle (-60° to +60°) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      {isVi ? 'Hướng gió thổi & góc nghiêng (Wind Angle)' : 'Wind Tilt Angle'}
                    </span>
                    <span className="text-blue-400 font-mono font-bold">
                      {(particles.rainWindAngle !== undefined ? particles.rainWindAngle : 10) > 0 ? `+${particles.rainWindAngle ?? 10}° ${isVi ? '(Sang Phải)' : '(Rightward)'}` : (particles.rainWindAngle ?? 10) < 0 ? `${particles.rainWindAngle}° ${isVi ? '(Sang Trái)' : '(Leftward)'}` : `0° ${isVi ? '(Thẳng Đứng)' : '(Vertical)'}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-60}
                    max={60}
                    step={5}
                    value={particles.rainWindAngle !== undefined ? particles.rainWindAngle : 10}
                    onChange={(e) => updatePt({ rainWindAngle: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                  />
                  
                  {/* Wind Direction Quick Presets */}
                  <div className="flex items-center gap-1 pt-1.5">
                    {[
                      { labelVi: 'Gió Trái (-35°)', labelEn: 'Left (-35°)', val: -35 },
                      { labelVi: 'Thẳng đứng (0°)', labelEn: 'Vertical (0°)', val: 0 },
                      { labelVi: 'Gió Nhẹ (+10°)', labelEn: 'Breeze (+10°)', val: 10 },
                      { labelVi: 'Gió Bão (+40°)', labelEn: 'Storm (+40°)', val: 40 },
                    ].map((wp) => {
                      const cur = particles.rainWindAngle !== undefined ? particles.rainWindAngle : 10;
                      const active = cur === wp.val;
                      return (
                        <button
                          key={wp.val}
                          type="button"
                          onClick={() => updatePt({ rainWindAngle: wp.val })}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                            active
                              ? 'bg-blue-500 text-white font-bold shadow-sm'
                              : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          {isVi ? wp.labelVi : wp.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wind Speed Multiplier & Turbulence */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Wind className="w-3 h-3 text-blue-400" />
                        {isVi ? 'Tốc độ gió' : 'Wind Velocity'}
                      </span>
                      <span className="text-blue-400 font-mono">
                        {(particles.rainWindSpeed !== undefined ? particles.rainWindSpeed : 1.2).toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.3}
                      max={2.5}
                      step={0.1}
                      value={particles.rainWindSpeed !== undefined ? particles.rainWindSpeed : 1.2}
                      onChange={(e) => updatePt({ rainWindSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{isVi ? 'Độ chao đảo (Turbulence)' : 'Turbulence'}</span>
                      <span className="text-blue-400 font-mono">
                        {particles.rainTurbulence !== undefined ? particles.rainTurbulence : 25}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={particles.rainTurbulence !== undefined ? particles.rainTurbulence : 25}
                      onChange={(e) => updatePt({ rainTurbulence: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>
                </div>

                {/* Raindrop Length Scale & Splash Toggle */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-blue-500/20">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400 flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-blue-400" />
                        {isVi ? 'Độ dài vệt giọt mưa' : 'Streak Length Scale'}
                      </span>
                      <span className="text-blue-400 font-mono">
                        {(particles.rainLengthScale !== undefined ? particles.rainLengthScale : 1.2).toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={3.0}
                      step={0.1}
                      value={particles.rainLengthScale !== undefined ? particles.rainLengthScale : 1.2}
                      onChange={(e) => updatePt({ rainLengthScale: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <Waves className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[11px] font-medium text-neutral-300">{isVi ? 'Tóe nước đáy' : 'Ground Splash Ripples'}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={particles.rainSplash !== false}
                        onChange={(e) => updatePt({ rainSplash: e.target.checked })}
                        className="rounded text-blue-500 focus:ring-blue-500 bg-neutral-800 border-neutral-700"
                      />
                    </label>
                  </div>
                </div>

                {/* Three.js Water on Glass (Raindrops on Glass Pane / Window Lens) */}
                <div className="pt-2.5 border-t border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={particles.waterOnGlass || false}
                        onChange={(e) => updatePt({ waterOnGlass: e.target.checked })}
                        className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                      />
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                        {isVi ? 'Mưa Bám Mặt Kính (Three.js Water on Glass)' : 'Water on Glass (Three.js Lens Beads)'}
                      </span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      WebGL Glass
                    </span>
                  </div>

                  {particles.waterOnGlass && (
                    <div className="space-y-2.5 pl-2 pt-1 border-l-2 border-cyan-500/40">
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Droplets Count Slider */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">{isVi ? 'Số giọt nước' : 'Droplets Count'}</span>
                            <span className="text-cyan-400 font-mono">{particles.waterGlassCount ?? 75}</span>
                          </div>
                          <input
                            type="range"
                            min={20}
                            max={180}
                            step={5}
                            value={particles.waterGlassCount ?? 75}
                            onChange={(e) => updatePt({ waterGlassCount: parseInt(e.target.value) })}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>

                        {/* Trickle Speed Slider */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-neutral-400">{isVi ? 'Tốc độ trượt chảy' : 'Trickle Speed'}</span>
                            <span className="text-cyan-400 font-mono">{(particles.waterGlassTrickleSpeed ?? 1.0).toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min={0.2}
                            max={3.0}
                            step={0.1}
                            value={particles.waterGlassTrickleSpeed ?? 1.0}
                            onChange={(e) => updatePt({ waterGlassTrickleSpeed: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                      </div>

                      {/* Glass Refraction Slider */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-400">{isVi ? 'Độ khúc xạ & lúp cầu giọt nước' : 'Refraction Index'}</span>
                          <span className="text-cyan-400 font-mono">{(particles.waterGlassRefraction ?? 1.0).toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={0.4}
                          max={2.5}
                          step={0.05}
                          value={particles.waterGlassRefraction ?? 1.0}
                          onChange={(e) => updatePt({ waterGlassRefraction: parseFloat(e.target.value) })}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Glass Reflection Ambiance Lighting */}
                      <div>
                        <div className="text-xs text-neutral-400 mb-1">
                          {isVi ? 'Ánh sáng môi trường phản chiếu (Bokeh / Ambiance)' : 'Lighting Environment'}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'cinematic-blue', label: isVi ? 'Xanh Đêm Điện Ảnh' : 'Cinematic Blue', color: '#38bdf8' },
                            { id: 'golden-bokeh', label: isVi ? 'Bokeh Vàng Ấm' : 'Warm Golden Bokeh', color: '#f59e0b' },
                            { id: 'neon-glow', label: isVi ? 'Neon Tím Hồng' : 'Cyber Neon', color: '#ec4899' },
                            { id: 'pure-clear', label: isVi ? 'Trong Suốt Tự Nhiên' : 'Natural Clear', color: '#e2e8f0' },
                          ].map((light) => {
                            const active = (particles.waterGlassLighting || 'cinematic-blue') === light.id;
                            return (
                              <button
                                key={light.id}
                                type="button"
                                onClick={() => updatePt({ waterGlassLighting: light.id as any })}
                                className={`px-2 py-1.5 rounded text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
                                  active
                                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                                    : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-400 hover:text-neutral-200'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: light.color }} />
                                <span className="truncate">{light.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Wipe Mist & Micro-Condensation Toggle */}
                      <label className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-800/60 border border-neutral-700/60 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={particles.waterGlassWipeMist !== false}
                          onChange={(e) => updatePt({ waterGlassWipeMist: e.target.checked })}
                          className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
                        />
                        <span className="text-xs font-semibold text-neutral-300">
                          {isVi ? 'Lớp Hơi Nước Sương Mù & Bụi Nước Li Ti' : 'Window Mist & Micro-Condensation'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SPEED LINES DEDICATED CONTROLS */}
            {particles.type === 'speed-lines' && (
              <div className="p-3.5 bg-gradient-to-br from-sky-950/40 to-neutral-900/80 border border-sky-500/30 rounded-2xl space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isVi ? 'Tùy Chỉnh Vệt Tốc Độ (Speed Lines)' : 'Speed Lines Dynamics'}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {isVi ? 'Vệt line tốc độ cao phong cách Anime / Manga' : 'High-speed action streak overlays'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                    {particles.speedLineMode === 'converge-center' ? (isVi ? 'Về tâm' : 'Converge') : (isVi ? 'Song song ngang' : 'Horizontal')}
                  </span>
                </div>

                {/* 1. Mode selection: Horizontal vs Converge to Center */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 block">
                    {isVi ? 'Kiểu Đường Chạy (Speed Line Motion)' : 'Speed Line Motion Pattern'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updatePt({ speedLineMode: 'horizontal' })}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        (particles.speedLineMode || 'horizontal') === 'horizontal'
                          ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{isVi ? '1. Song Song Chiều Ngang' : '1. Horizontal Parallel'}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{isVi ? 'Chạy ngang khung hình' : 'Lateral speed streaks'}</div>
                    </button>
                    <button
                      onClick={() => updatePt({ speedLineMode: 'converge-center' })}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        particles.speedLineMode === 'converge-center'
                          ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">{isVi ? '2. Chiều Đứng Về Tâm' : '2. Inward to Center'}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{isVi ? 'Tụ về tâm như phác thảo' : 'Anime focal warp lines'}</div>
                    </button>
                  </div>
                </div>

                {/* 1B. Direction & Tilt Angle selector for Horizontal mode */}
                {(!particles.speedLineMode || particles.speedLineMode === 'horizontal') && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-300 block mb-1.5">
                        {isVi ? 'Hướng Chạy Chiều Ngang' : 'Horizontal Direction'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineDirection: 'right-to-left' })}
                          className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            (particles.speedLineDirection || 'right-to-left') === 'right-to-left'
                              ? 'bg-sky-500/20 border-sky-500 text-sky-200 font-bold'
                              : 'bg-neutral-900/70 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {isVi ? '← Phải sang Trái' : '← Right to Left'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineDirection: 'left-to-right' })}
                          className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            particles.speedLineDirection === 'left-to-right'
                              ? 'bg-sky-500/20 border-sky-500 text-sky-200 font-bold'
                              : 'bg-neutral-900/70 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {isVi ? 'Trái sang Phải →' : 'Left to Right →'}
                        </button>
                      </div>
                    </div>

                    {/* Speed Line Tilt (Độ nghiêng -45 -> 45 độ) */}
                    <div className="pt-1">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-300 font-medium">{isVi ? 'Độ nghiêng vệt line (Tilt Angle)' : 'Line Tilt Angle'}</span>
                          {(particles.speedLineTilt !== undefined && particles.speedLineTilt !== 0) && (
                            <button
                              type="button"
                              onClick={() => updatePt({ speedLineTilt: 0 })}
                              className="text-[10px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                            >
                              {isVi ? 'Đặt lại 0°' : 'Reset 0°'}
                            </button>
                          )}
                        </div>
                        <span className="text-sky-400 font-mono font-bold">
                          {(particles.speedLineTilt || 0) > 0 ? `+${particles.speedLineTilt}°` : `${particles.speedLineTilt || 0}°`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-45}
                        max={45}
                        step={1}
                        value={particles.speedLineTilt || 0}
                        onChange={(e) => updatePt({ speedLineTilt: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5 font-mono">
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineTilt: -45 })}
                          className="hover:text-sky-300 cursor-pointer transition-colors"
                        >
                          -45° {isVi ? '(Lên)' : '(Up)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineTilt: 0 })}
                          className="hover:text-sky-300 cursor-pointer transition-colors"
                        >
                          0° {isVi ? '(Ngang)' : '(Flat)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineTilt: 45 })}
                          className="hover:text-sky-300 cursor-pointer transition-colors"
                        >
                          +45° {isVi ? '(Xuống)' : '(Down)'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1C. Inward to Center settings: Vertical Center & Horizontal Center */}
                {particles.speedLineMode === 'converge-center' && (
                  <div className="space-y-3 pt-1 border-t border-sky-500/20">
                    {/* Vertical Center */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          {isVi ? 'Tâm Tụ Chiều Đứng (Vertical Center)' : 'Vertical Center Position'}
                        </label>
                        <span className="text-[11px] text-sky-400 font-mono">
                          {particles.speedLineCenterY !== undefined
                            ? particles.speedLineCenterY
                            : (particles.speedLineVerticalCenter === 'top' ? 25 : particles.speedLineVerticalCenter === 'bottom' ? 75 : 50)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineVerticalCenter: 'top', speedLineCenterY: 25 })}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                            (particles.speedLineVerticalCenter === 'top' || (particles.speedLineCenterY !== undefined && particles.speedLineCenterY <= 35))
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{isVi ? 'Top Center' : 'Top Center'}</div>
                          <div className="text-[10px] text-neutral-400">{isVi ? 'Phía trên (25%)' : 'Upper (25%)'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineVerticalCenter: 'center', speedLineCenterY: 50 })}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                            ((particles.speedLineVerticalCenter || 'center') === 'center' && (particles.speedLineCenterY === undefined || (particles.speedLineCenterY > 35 && particles.speedLineCenterY < 65)))
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{isVi ? 'Center Center' : 'Center Center'}</div>
                          <div className="text-[10px] text-neutral-400">{isVi ? 'Ở giữa (50%)' : 'Middle (50%)'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineVerticalCenter: 'bottom', speedLineCenterY: 75 })}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                            (particles.speedLineVerticalCenter === 'bottom' || (particles.speedLineCenterY !== undefined && particles.speedLineCenterY >= 65))
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{isVi ? 'Bottom Center' : 'Bottom Center'}</div>
                          <div className="text-[10px] text-neutral-400">{isVi ? 'Phía dưới (75%)' : 'Lower (75%)'}</div>
                        </button>
                      </div>

                      {/* Fine-tune Center Y % slider */}
                      <div className="pt-1">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-400">{isVi ? 'Tinh chỉnh vị trí tâm theo % chiều cao (Fine-tune Center Y %)' : 'Fine-tune Center Y %'}</span>
                          <span className="text-sky-400 font-mono">
                            {particles.speedLineCenterY !== undefined
                              ? particles.speedLineCenterY
                              : (particles.speedLineVerticalCenter === 'top' ? 25 : particles.speedLineVerticalCenter === 'bottom' ? 75 : 50)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={90}
                          step={5}
                          value={particles.speedLineCenterY !== undefined
                            ? particles.speedLineCenterY
                            : (particles.speedLineVerticalCenter === 'top' ? 25 : particles.speedLineVerticalCenter === 'bottom' ? 75 : 50)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            let vCenter: 'top' | 'center' | 'bottom' = 'center';
                            if (val <= 35) vCenter = 'top';
                            else if (val >= 65) vCenter = 'bottom';
                            updatePt({ speedLineCenterY: val, speedLineVerticalCenter: vCenter });
                          }}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    </div>

                    {/* Horizontal Center Position */}
                    <div className="space-y-1.5 pt-2 border-t border-sky-500/15">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-neutral-300 block">
                          {isVi ? 'Tâm Tụ Chiều Ngang (Horizontal Center)' : 'Horizontal Center Position'}
                        </label>
                        <span className="text-[11px] text-sky-400 font-mono">
                          {particles.speedLineCenterX !== undefined
                            ? particles.speedLineCenterX
                            : (particles.speedLineHorizontalCenter === 'left' ? 25 : particles.speedLineHorizontalCenter === 'right' ? 75 : 50)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineHorizontalCenter: 'left', speedLineCenterX: 25 })}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                            (particles.speedLineHorizontalCenter === 'left' || (particles.speedLineCenterX !== undefined && particles.speedLineCenterX <= 35))
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{isVi ? 'Left Center' : 'Left Center'}</div>
                          <div className="text-[10px] text-neutral-400">{isVi ? 'Bên trái (25%)' : 'Left (25%)'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineHorizontalCenter: 'center', speedLineCenterX: 50 })}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                            ((particles.speedLineHorizontalCenter || 'center') === 'center' && (particles.speedLineCenterX === undefined || (particles.speedLineCenterX > 35 && particles.speedLineCenterX < 65)))
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{isVi ? 'Center Center' : 'Center Center'}</div>
                          <div className="text-[10px] text-neutral-400">{isVi ? 'Ở giữa (50%)' : 'Middle (50%)'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePt({ speedLineHorizontalCenter: 'right', speedLineCenterX: 75 })}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                            (particles.speedLineHorizontalCenter === 'right' || (particles.speedLineCenterX !== undefined && particles.speedLineCenterX >= 65))
                              ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm ring-1 ring-sky-500/50'
                              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold">{isVi ? 'Right Center' : 'Right Center'}</div>
                          <div className="text-[10px] text-neutral-400">{isVi ? 'Bên phải (75%)' : 'Right (75%)'}</div>
                        </button>
                      </div>

                      {/* Fine-tune Center X % slider */}
                      <div className="pt-1">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-neutral-400">{isVi ? 'Tinh chỉnh vị trí tâm theo % chiều rộng (Fine-tune Center X %)' : 'Fine-tune Center X %'}</span>
                          <span className="text-sky-400 font-mono">
                            {particles.speedLineCenterX !== undefined
                              ? particles.speedLineCenterX
                              : (particles.speedLineHorizontalCenter === 'left' ? 25 : particles.speedLineHorizontalCenter === 'right' ? 75 : 50)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={90}
                          step={5}
                          value={particles.speedLineCenterX !== undefined
                            ? particles.speedLineCenterX
                            : (particles.speedLineHorizontalCenter === 'left' ? 25 : particles.speedLineHorizontalCenter === 'right' ? 75 : 50)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            let hCenter: 'left' | 'center' | 'right' = 'center';
                            if (val <= 35) hCenter = 'left';
                            else if (val >= 65) hCenter = 'right';
                            updatePt({ speedLineCenterX: val, speedLineHorizontalCenter: hCenter });
                          }}
                          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sliders: Speed, Length, Random Length, Width, Blur */}
                <div className="space-y-3 pt-1 border-t border-sky-500/20">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">{isVi ? 'Tốc độ vệt line' : 'Line Speed'}</span>
                      <span className="text-sky-400 font-mono">{(particles.speedLineSpeed !== undefined ? particles.speedLineSpeed : 1.0).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={3.5}
                      step={0.1}
                      value={particles.speedLineSpeed !== undefined ? particles.speedLineSpeed : 1.0}
                      onChange={(e) => updatePt({ speedLineSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">{isVi ? 'Chiều dài vệt line' : 'Line Length'}</span>
                      <span className="text-sky-400 font-mono">{particles.speedLineLength || 140}px</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={420}
                      step={5}
                      value={particles.speedLineLength || 140}
                      onChange={(e) => updatePt({ speedLineLength: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-300 font-medium">{isVi ? 'Độ dài ngẫu nhiên' : 'Random Length Variance'}</span>
                      <span className="text-sky-400 font-mono">{particles.speedLineRandomLength !== undefined ? particles.speedLineRandomLength : 55}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={particles.speedLineRandomLength !== undefined ? particles.speedLineRandomLength : 55}
                      onChange={(e) => updatePt({ speedLineRandomLength: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-300 font-medium">{isVi ? 'Độ dày nét line' : 'Line Width'}</span>
                        <span className="text-sky-400 font-mono">{particles.speedLineWidth || 2.5}px</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        step={0.5}
                        value={particles.speedLineWidth || 2.5}
                        onChange={(e) => updatePt({ speedLineWidth: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-300 font-medium">{isVi ? 'Độ nhòe mờ (Blur)' : 'Motion Blur'}</span>
                        <span className="text-sky-400 font-mono">{particles.speedLineBlur !== undefined ? particles.speedLineBlur : 5}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={particles.speedLineBlur !== undefined ? particles.speedLineBlur : 5}
                        onChange={(e) => updatePt({ speedLineBlur: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SILK RIBBON RAIN DEDICATED CONTROLS */}
            {(particles.type === 'spaghetti' || (particles.type as any) === 'silk-ribbon') && (
              <div className="p-3.5 bg-gradient-to-br from-pink-950/40 to-neutral-900/80 border border-pink-500/30 rounded-2xl space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
                      <Waves className="w-3.5 h-3.5 text-pink-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isVi ? 'Mưa Mảnh Ruy Băng Lụa (Silk Ribbon)' : 'Silk Ribbon Rain Dynamics'}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {isVi ? 'Dải ruy băng lụa óng ánh uốn lượn bồng bềnh' : 'Flowing glossy silk ribbon strips'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-semibold">
                    {isVi ? 'Mềm Mại 🎀' : 'Silky 🎀'}
                  </span>
                </div>

                <div className="space-y-3 pt-1 border-t border-pink-500/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-300 font-medium">{isVi ? 'Độ dài ruy băng' : 'Ribbon Length'}</span>
                        <span className="text-pink-400 font-mono">{particles.ribbonLength || 160}px</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={480}
                        step={10}
                        value={particles.ribbonLength || 160}
                        onChange={(e) => updatePt({ ribbonLength: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-300 font-medium">{isVi ? 'Bản rộng / Độ dày' : 'Thickness'}</span>
                        <span className="text-pink-400 font-mono">{particles.ribbonThickness || 8}px</span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={30}
                        step={1}
                        value={particles.ribbonThickness || 8}
                        onChange={(e) => updatePt({ ribbonThickness: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-300 font-medium">{isVi ? 'Độ xoắn uốn lượn' : '3D Twist Amount'}</span>
                        <span className="text-pink-400 font-mono">{particles.ribbonTwist !== undefined ? particles.ribbonTwist : 1.8}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={4.0}
                        step={0.1}
                        value={particles.ribbonTwist !== undefined ? particles.ribbonTwist : 1.8}
                        onChange={(e) => updatePt({ ribbonTwist: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-300 font-medium">{isVi ? 'Độ phát sáng dạ quang' : 'Silk Sheen Glow'}</span>
                        <span className="text-pink-400 font-mono">{particles.ribbonGlow !== undefined ? particles.ribbonGlow : 15}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={35}
                        step={1}
                        value={particles.ribbonGlow !== undefined ? particles.ribbonGlow : 15}
                        onChange={(e) => updatePt({ ribbonGlow: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* A. Particle Shape Selector */}
            {particles.type !== 'snow' && particles.type !== 'rain' && particles.type !== 'hyperspace' && particles.type !== 'speed-lines' && particles.type !== 'spaghetti' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {isVi ? 'Hình Dáng Hạt (Particle Shape)' : 'Particle Geometry'}
                  </label>
                  {(particles.type === 'dust' || particles.type === 'stars') && (
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      {isVi ? 'Mở khóa hình học cho Lofi & Stars' : 'Unlocked for Lofi & Stars'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PARTICLE_SHAPES.map((shapeItem) => {
                    const Icon = shapeItem.icon;
                    const defaultShape = particles.type === 'dust' ? 'silk-fluff' : (particles.type === 'stars' ? 'star' : 'circle');
                    const currentShape = particles.shape || defaultShape;
                    const isSelected = currentShape === shapeItem.id;
                    return (
                      <button
                        key={shapeItem.id}
                        onClick={() => updatePt({ shape: shapeItem.id })}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                            : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                        <span>{isVi ? shapeItem.nameVi : shapeItem.nameEn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Fluffy Silk Ball & Glow enhancement for Lofi / Stars / Custom shapes */}
                {(particles.type === 'dust' || particles.type === 'stars' || particles.shape === 'silk-fluff' || particles.shape === 'circle') && (
                  <div className="mt-2.5 p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={particles.silkFluffGlow !== undefined ? particles.silkFluffGlow : true}
                          onChange={(e) => updatePt({ silkFluffGlow: e.target.checked })}
                          className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-neutral-200">
                          {isVi ? 'Hiệu ứng quả bóng tơ mờ viền (Fluffy Silk Ball)' : 'Fluffy Silk Ball Glow Effect'}
                        </span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          (particles.silkFluffGlow !== undefined ? particles.silkFluffGlow : true)
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}>
                          {(particles.silkFluffGlow !== undefined ? particles.silkFluffGlow : true)
                            ? (isVi ? 'BẬT' : 'ON')
                            : (isVi ? 'TẮT' : 'OFF')}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          {(particles.silkFluffGlow !== undefined ? particles.silkFluffGlow : true)
                            ? `${particles.particleGlowRadius !== undefined ? particles.particleGlowRadius : 18}px`
                            : '0px'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      {isVi
                        ? 'Tăng độ mờ viền sâu và vầng phát sáng bồng bềnh xung quanh hạt nhìn giống quả bóng tơ xốp mịn.'
                        : 'Softens particle edges with multi-layered feathered glow aura for a fluffy silk pom-pom aesthetic.'}
                    </p>
                    <div className={(particles.silkFluffGlow !== undefined ? particles.silkFluffGlow : true) ? 'opacity-100' : 'opacity-40'}>
                      <input
                        type="range"
                        min={0}
                        max={45}
                        step={1}
                        value={particles.particleGlowRadius !== undefined ? particles.particleGlowRadius : 18}
                        onChange={(e) => updatePt({ particleGlowRadius: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. Color Mode Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  {isVi ? 'Phong Cách & Màu Sắc Hạt' : 'Particle Color Palette & Palette Theme'}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {COLOR_MODES.map((mode) => {
                  const currentMode = particles.colorMode || 'custom';
                  const isSelected = currentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => updatePt({ colorMode: mode.id })}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{isVi ? mode.nameVi : mode.nameEn}</span>
                      <span className="text-[10px] text-neutral-400 block truncate">{isVi ? mode.descVi : mode.descEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Pickers and Swatches */}
              {(!particles.colorMode || particles.colorMode === 'custom') && (
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">{isVi ? 'Màu chính của hạt:' : 'Primary Particle Color:'}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={particles.color || '#ffffff'}
                        onChange={(e) => updatePt({ color: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-400 uppercase">{particles.color || '#ffffff'}</span>
                    </div>
                  </div>

                  {/* Secondary Flash Color */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                    <span className="text-xs text-neutral-300">{isVi ? 'Màu chớp sáng (Flash):' : 'Secondary Flash Color:'}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={particles.secondaryColor || '#ec4899'}
                        onChange={(e) => updatePt({ secondaryColor: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-neutral-700 bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-400 uppercase">{particles.secondaryColor || '#ec4899'}</span>
                    </div>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {QUICK_COLORS.map((c) => (
                      <button
                        key={c.color}
                        onClick={() => updatePt({ color: c.color })}
                        title={isVi ? c.nameVi : c.nameEn}
                        className="w-5 h-5 rounded-full border border-neutral-700 hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* C. Dynamic Bass-Reactive Color & Flash on Beat Drop */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-neutral-900/90 to-cyan-950/30 border border-cyan-500/30 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-neutral-100 block">
                      {isVi ? 'Đổi Màu & Chớp Sáng Theo Bass (Bass Reactive Color)' : 'Bass Reactive Color & Flash'}
                    </span>
                    <span className="text-[10px] text-neutral-400 leading-relaxed block">
                      {isVi ? 'Hạt bừng sáng rực rỡ và chuyển màu flash theo từng nhịp drop của bài hát' : 'Particles flash brightly and burst into secondary accents on beat drops'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={particles.bassReactiveColor ?? true}
                  onChange={(e) => updatePt({ bassReactiveColor: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700 w-4 h-4 ml-2"
                />
              </label>

              {(particles.bassReactiveColor ?? true) && (
                <div className="pt-2 border-t border-cyan-500/20">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-300">{isVi ? 'Độ bùng nổ chớp sáng (Flash Boost)' : 'Flash Explosion Boost'}</span>
                    <span className="text-cyan-400 font-mono">{(particles.bassFlashBoost || 1.5).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={particles.bassFlashBoost || 1.5}
                    onChange={(e) => updatePt({ bassFlashBoost: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* D. Size Scale & Glow Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Kích thước hạt' : 'Particle Scale'}</span>
                  <span className="text-cyan-400 font-mono">{(particles.sizeScale || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={particles.sizeScale || 1.0}
                  onChange={(e) => updatePt({ sizeScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Độ phát sáng (Glow)' : 'Glow Radius'}</span>
                  <span className="text-cyan-400 font-mono">{particles.glowIntensity !== undefined ? particles.glowIntensity : 12}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={particles.glowIntensity !== undefined ? particles.glowIntensity : 12}
                  onChange={(e) => updatePt({ glowIntensity: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* E. Particle Density & Speed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Số lượng hạt' : 'Particle Count'}</span>
                  <span className="text-cyan-400 font-mono">{particles.count}</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  value={particles.count}
                  onChange={(e) => updatePt({ count: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Tốc độ bay' : 'Flight Velocity'}</span>
                  <span className="text-cyan-400 font-mono">{particles.speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.5}
                  step={0.1}
                  value={particles.speed}
                  onChange={(e) => updatePt({ speed: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* F. Reactive Movement to Beat */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={particles.reactiveToBeat}
                onChange={(e) => updatePt({ reactiveToBeat: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-cyan-500 bg-neutral-800 border-neutral-700"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  {isVi ? 'Chuyển động & Kích thước giật theo nhịp Bass' : 'Beat-Synchronized Size & Velocity Pulse'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isVi ? 'Hạt tăng tốc và phóng to khi trống kick dồn dập' : 'Particles accelerate and enlarge on punchy kick impacts'}
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
