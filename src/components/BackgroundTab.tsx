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
  BackgroundGlitchStyle 
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
  Flame, 
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
  Droplets
} from 'lucide-react';

interface BackgroundTabProps {
  background: BackgroundConfig;
  onBackgroundChange: (bg: BackgroundConfig) => void;
  particles: ParticleConfig;
  onParticlesChange: (pt: ParticleConfig) => void;
  language?: Language;
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
  { id: 'spinning-dashes', nameVi: 'Đường ngắn rơi & xoay', nameEn: 'Spinning Dashes', icon: Slash, badgeVi: 'Hot Trend', badgeEn: 'Trending' },
  { id: 'spaghetti', nameVi: 'Mưa Spaghetti Rơi', nameEn: 'Spaghetti Rain', icon: Waves, badgeVi: 'Mới & Độc Lạ', badgeEn: 'Unique' },
  { id: 'sound-sparks', nameVi: 'Tia lửa bốc (Sparks)', nameEn: 'Sound Sparks', icon: Flame, badgeVi: 'Rực Rỡ', badgeEn: 'Vibrant' },
  { id: 'rainbow-bubbles', nameVi: 'Bong bóng cầu vồng', nameEn: 'Rainbow Bubbles', icon: CircleDot, badgeVi: 'Mới & Đẹp', badgeEn: 'Prismatic' },
  { id: 'hyperspace', nameVi: 'Tăng tốc Hyperspace', nameEn: 'Hyperspace 3D', icon: Zap, badgeVi: 'Mới 3D', badgeEn: '3D Warp' },
  { id: 'dust', nameVi: 'Bụi lofi trôi', nameEn: 'Lofi Ambient Dust', icon: Sparkles },
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

export const BackgroundTab: React.FC<BackgroundTabProps> = ({
  background,
  onBackgroundChange,
  particles,
  onParticlesChange,
  language = 'vi',
}) => {
  const isVi = language === 'vi';
  const [activeCategory, setActiveCategory] = useState('all');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const updateBg = (partial: Partial<BackgroundConfig>) => {
    onBackgroundChange({ ...background, ...partial });
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

  const filteredPresets =
    activeCategory === 'all'
      ? BACKGROUND_PRESETS
      : BACKGROUND_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Background Source Selection (Preset, Custom Image / Video Upload) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {isVi ? 'Hình / Video Nền (Background Source)' : 'Background Image & Video Source'}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title={isVi ? 'Tải ảnh PNG/JPG từ máy tính' : 'Upload custom PNG/JPG image'}
            >
              <Upload className="w-3 h-3" />
              <span>{isVi ? 'Tải Ảnh' : 'Upload Image'}</span>
            </button>
            <button
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

        {/* Video Mode Active Notice */}
        {background.isVideo && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400 animate-pulse" />
              <span className="font-semibold">{isVi ? 'Đang phát nền Video MP4 động' : 'Active MP4 Video Background'}</span>
            </div>
            <button
              onClick={() => updateBg({ type: 'preset', isVideo: false, url: BACKGROUND_PRESETS[0].url })}
              className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-medium text-rose-300 transition-all cursor-pointer"
            >
              {isVi ? 'Trở về Preset Ảnh' : 'Return to Image Preset'}
            </button>
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
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
            const isSelected = !background.isVideo && background.url === preset.url;
            return (
              <button
                key={preset.id}
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
              </div>
            )}

            {/* A. Particle Shape Selector */}
            {particles.type !== 'snow' && particles.type !== 'rain' && particles.type !== 'hyperspace' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {isVi ? 'Hình Dáng Hạt (Particle Shape)' : 'Particle Geometry'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {PARTICLE_SHAPES.map((shapeItem) => {
                    const Icon = shapeItem.icon;
                    const currentShape = particles.shape || (particles.type === 'stars' ? 'star' : 'circle');
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
                  max={30}
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
