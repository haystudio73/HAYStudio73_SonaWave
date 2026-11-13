# 🎵 Sona Wave Pro (version 2.0) - Trình Tạo Video Sóng Âm & Lyrics

A professional audio wave video generator with synchronized lyrics, diverse visualizer effects, and high-quality video export capabilities optimized for TikTok, YouTube Shorts, and Instagram Reels.

Link demo: <a href="https://hay-studio73-sona-wave.vercel.app/" target="_blank">https://hay-studio73-sona-wave.vercel.app/</a>

<img width="1920" height="909" alt="image" src="https://github.com/user-attachments/assets/73a33db1-221b-4d2e-a3ae-d880c6a9b387" />

---

## ⚡ Quick Install (Start Here)

Get **Sona Wave Pro** running locally in under 1 minute:

### 1. Prerequisites
- **Node.js 18+** ([Download Node.js](https://nodejs.org/)) or **Bun** ([Download Bun](https://bun.sh/))
- **Git**

### 2. Clone & Install
```bash
git clone https://github.com/haystudio73/HAYStudio73_SonaWave.git
cd HAYStudio73_SonaWave

# Using Bun (recommended, fastest)
bun install

# Or using npm
npm install
```

### 3. Run Development Server
```bash
bun run dev
# or: npm run dev
```
Open **http://localhost:3000** in your browser — no `.env` setup required!

### 4. Update & Production Build
```bash
git pull origin main
bun install && bun run build
```

---

## ✨ Features

### Core Functionality
- **Audio Wave Visualization**: Create stunning 2D and real-time 3D WebGL representations of audio waveforms (26 visualizer styles).
- **Lyrics Synchronization**: Support for SRT and LRC subtitle formats with independent karaoke timing editor and auto-overlap repair.
- **3D Three.js WebGL Engine**: Full 3D spatial visualizers with post-processing bloom, flowing neon wave lights, and free camera orbits.
- **Scene Transitions & Multi-Slide Timeline**: Seamless image slideshow transitions and per-timestamp scene/visualizer switching.
- **Multi-Layer Text Boxes & Smart Tracklist**: Freely place animated custom text, titles, timestamps, and auto-generated playlist tracklists.
- **Audio-Reactive Lottie & DotLottie Stickers**: Overlay scalable vector animations with beat-responsive bounce and custom blending.
- **10-Band Studio Master Graphic EQ**: Hardware-grade 10-band audio equalizer with real-time spectrum and custom sound presets.
- **Multi-Track Audio Playlist**: Continuous background playback, track queue management, and individual song metadata.
- **Customizable Backgrounds**: High-resolution curated library, custom image (JPG/PNG), dynamic video (MP4), gradients, and 11 multi-layer particle systems.
- **Professional Video Export**: High-quality MP4 output (9:16, 1:1, 16:9, 4:5) up to 60FPS optimized for TikTok, YouTube Shorts, and Instagram Reels.

### New & Enhanced Features
- **Direct Canvas Drag & Drop & Track Info 2D Position Controls** — Tương tác kéo thả trực tiếp ngay trên khung hình xem trước:
  1. **Khung kéo thả trực tiếp trên màn hình xem trước (Live Canvas Overlays)**: Cho phép dùng chuột kéo rê vị trí tự do trực tiếp trên khung video cho **Track Badge**, **Logo PNG Watermark**, **Track Details Typography**, **Playlist Track Title**, **Text Boxes**, **Lottie Stickers** và **Visualizer Sóng âm 2D**, hiển thị tọa độ X/Y thời gian thực (Live Coordinates Badge) cùng nút bật/tắt khung kéo trên thanh công cụ.
  2. **Sắp xếp thứ tự chi tiết bài hát (Track Details Layout Order Drag & Drop)**: Hỗ trợ kéo thả trực quan để thay đổi thứ tự hiển thị giữa 3 thành phần thông tin bài hát (Phụ đề / Tiêu đề chính / Ca sĩ).
  3. **Giao diện 2D Visualizer Tinh Gọn & Thông Minh**: Loại bỏ bảng kéo phụ trùng lặp (`Vị Trí & Nét Vẽ Trên Màn Hình 2D`) để ưu tiên kéo thả trực tiếp trên Stage kèm thanh trượt X/Y gọn gàng; đồng thời thanh **Độ dày nét vẽ sóng âm 2D (Line Thickness)** chỉ tự động hiển thị ở những kiểu sóng thực sự sử dụng (`spectrum-line`, `smooth-wave`, `double-ribbon`, `minimal-pulse`, `dna-helix`, `tunnel-vortex`).
- **Specialized Private Studio Settings for All 2D Spectrum Styles (Tùy Chỉnh Chuyên Biệt & Đồng Bộ Preview 100%)** — Bảng điều khiển chuyên sâu riêng cho từng phong cách sóng âm 2D:
  - **Cột Phổ Sóng Cổ Điển (`bars`)**: Kiểu đầu vát cột (Bo tròn, Vuông phẳng, Vát nhọn), Kết cấu cột (Khối LED tầng vs Liền khối mượt), 4 kiểu Hình dáng phân bố cột (Bình thường, Phải ➔ Trái, Đỉnh ở giữa, Đỉnh 2 bên), Giữ vạch đỉnh rơi chậm và chọn màu vạch đỉnh.
  - **Spectrum Cột (Simple) & Spectrum Cột Hạt Rơi (`spectrum-bars-simple`, `bars-peaks`)**: Tinh giản bỏ cấu trúc chia tầng thừa; bổ sung **4 Hình dáng cột** (`Bình thường`, `Phải ➔ Trái`, `Đỉnh ở giữa`, `Đỉnh 2 bên`), **Kiểu dáng đầu cột** (`Bo tròn`, `Vuông phẳng`, `Vát nhọn`), và tùy chỉnh hạt đỉnh rơi trọng lực.
  - **Sóng Cột Đối Xứng & Sóng Đối Xứng Hạt Đỉnh (`bars-mirrored`, `bars-mirrored-peaks`)**: Cập nhật live preview đầy đủ cho **Khoảng cách khe giữa 2 nửa (Center Gap 0–24px)**, **Phong cách đối xứng** (`Bo tròn`, `Vuông`, `Tầng LED`), và **Giữ vạch đỉnh 2 đầu** rơi trọng lực.
  - **Sóng Nước Mềm Mại (`smooth-wave`)**: Số tầng sóng xếp lớp (1–4 tầng), Đổ màu mờ chân sóng kết hợp nét viền contour chỉnh độ dày trực tiếp, Độ uốn lượn Bezier (Wave Tension 0.1–1.0), Đối xứng 2 chiều qua trục.
  - **Tia Tròn Tỏa Sáng & Vòng Tròn Hạt Bay Tỏa (`circular-spikes`, `radial-bars-peaks`)**: Bán kính lõi trong (10%–55%), Hướng tia tỏa (`Tỏa ngoài`, `Thu tâm`, `Hai chiều`), Phóng tia bùng nổ theo Bass Kick.
  - **Ma Trận LED Cyber (`cyber-matrix`)**: Số hàng LED dọc (8–32 hàng), Hình dạng khối LED (Chữ nhật, Vuông, Bo tròn Pill), Đèn LED đỏ cảnh báo quá tải ở đỉnh.
  - **Ma Trận EQ Khối Nổi (`audio-equalizer-grid`)**: Số tầng ma trận (6–24 tầng), Đỉnh LED rơi chậm trọng lực, Độ phát sáng LED (20%–100%), Bảng màu dải tần (Cổ điển Xanh-Vàng-Đỏ, Cyber Cyan-Magenta, Tùy chỉnh).
  - **Ngọn Lửa Plasma (`flame-spectrum`)**: Độ cuộn xoáy ngọn lửa (Turbulence 0.5–3.0x), Tăng chiều cao bốc cháy theo Bass Kick (1.0–2.5x), và 4 tông màu Plasma (Fire, Plasma Violet, Ice Blue, Toxic Green) sạch nét.
  - **Dải Ruy Băng Đôi (`double-ribbon`)**: Tần số uốn lượn (1–5x), Độ rộng bản ruy băng kết hợp độ dày nét, Xoắn 3D lồng ghép, Đổ lưới mờ kết nối giữa 2 dải.
  - **Tia Laser Sân Khấu EDM (`laser-beams`)**: Số lượng chùm tia (6–32 tia), Góc quét quạt Laser (45°–180°), Nguồn phát tia (Đáy sàn, Giữa màn hình, Đỉnh trần), Chớp nháy Strobe theo nhịp Bass.
  - **Lõi Siêu Tân Tinh (`starburst-core`)**: Số lượng tia sao tỏa sáng (16–72 tia), Bán kính lõi năng lượng (6–50px), Hào quang vầng sáng quanh lõi (Halo Bloom), Bắn hạt năng lượng theo Bass Kick.
- **About & Open-Source License Dialog (`?`)** — Nút **About (`?`)** đặt ngay cạnh nút Cài Đặt (Settings) trên thanh công cụ trên cùng, hiển thị phiên bản ứng dụng (`v2.0.0`), thông tin giấy phép mã nguồn mở (MIT License) và liên kết trực tiếp tới kênh **Facebook** & **YouTube** của tác giả **HAY Studio73**.
- **Curated Lofi & Chill Image Presets Expansion** — Bổ sung thêm các ảnh nền nghệ thuật mới vào danh mục **Lofi & Chill** trong thư viện Ảnh Nền & Slide Preset Library.
- **Playlist Track Queue: Tinh Giản Phím Mũi Tên (Remove Drag/Drop) & Bố Cục Gọn Nhẹ** — Loại bỏ kéo thả, phần Background riêng từng track và trường Artist riêng trong hàng đợi Playlist (`TITLE` ➔ `TRACK TITLE`), thay bằng nút mũi tên lên/xuống (▲/▼) chuẩn xác 100%.
- **100% Comprehensive Bilingual Studio (Chuẩn Hóa Song Ngữ EN / VI)** — Toàn bộ giao diện phòng thu từ nhãn, tiêu đề, nút bấm, chú thích, menu ngữ cảnh và bảng thiết lập chuyên biệt đều được bản địa hóa song ngữ trọn vẹn giữa Tiếng Việt (VI) và Tiếng Anh (EN), phản hồi tức thì khi chuyển đổi ngôn ngữ.
- **Multi-Layer Floating Particle Overlays (Max 5 Lớp & Đàn Bướm Phát Sáng - Butterflies)** — Hệ thống hiệu ứng hạt lơ lửng đa lớp chuyên nghiệp: cho phép xếp chồng tối đa **5 lớp hiệu ứng hạt độc lập** trên cùng một video; mỗi lớp có thể tự do chỉnh sửa, bật/tắt hiển thị (Show/Hide qua nút Mắt) và xóa bỏ (Delete); hỗ trợ đầy đủ **11 phong cách hạt** (Mưa Tự Nhiên, Tuyết Mùa Đông, Vệt Tốc Độ, Mưa Ruy Băng Lụa, Đoạn Ngắn Xoay 360°, Bong Bóng Cầu Vồng, Tăng Tốc Hyperspace 3D, Bụi Lofi Trôi, Sao Lấp Lánh, Những Hạt Lửa, và **Đàn Bướm Phát Sáng 2D** bay dập dờn co giãn cánh phối cảnh kèm vệt bụi tiên); hai tính năng tương tác âm thanh **Tăng tốc theo nhịp Beat (Accelerate on Beats)** và **Bừng sáng rực rỡ theo Bass Drop (Flash Brighter)** áp dụng đồng bộ toàn cục cho tất cả các lớp hạt.
- **TikTok/Shorts Multi-Duration MP4 Export (15s, 30s, 60s, 90s, 120s, 180s)** — Mở rộng tùy chọn độ dài xuất video ngắn cho TikTok / YouTube Shorts / Reels: hỗ trợ đầy đủ 6 mốc thời lượng linh hoạt (15s, 30s, 60s / 1m, 90s / 1.5m, 120s / 2m, 180s / 3m) chuẩn theo chính sách video ngắn mới nhất của TikTok và YouTube Shorts (lên đến 3 phút). Giao diện trực quan kèm thanh trượt kéo chọn đoạn phát chính xác, tự động giới hạn theo độ dài bài hát hoặc toàn bộ playlist.
- **Multi-Image Slideshow Enforced Across Entire Playlist** — Khi thiết lập tính năng Multi-Image Slideshow (`mode === 'slides'`), hiệu ứng Slideshow tự động áp đặt lên toàn bộ Playlist khi có nhiều bài. Trục thời gian trình chiếu sử dụng đồng hồ lũy kế toàn dự án (`cumulativePlaylistTime`), giúp các slide chuyển cảnh mượt mà xuyên suốt qua các bài hát khác nhau mà không bị ngắt quãng, không bị giật lùi về slide đầu tiên, và không bị ghi đè bởi ảnh nền đơn khi chuyển track.
- **Smart Display Hierarchy & Auto Remove Track Title on Single Audio** — Tách biệt rõ ràng Tiêu đề chính của toàn bộ dự án/Album (`Main Title of Playlist`) và Tên bài hát đang phát (`Track Title`). Đặc biệt, hệ thống **tự động loại bỏ / ẩn hoàn toàn Tên bài hát (Track Title)** khi playlist chỉ có 1 file nhạc duy nhất để tránh dư thừa trùng lặp thông tin trên video; khi danh sách có từ 2 bài hát trở lên, tính năng Track Title tự động kích hoạt hiển thị và cập nhật tên bài hát theo từng track đang phát.
- **Slide Preset Library Full Viewer & Categories** — Mở rộng thư viện ảnh mẫu cho từng Slide: duyệt toàn bộ ảnh mẫu với bộ lọc danh mục (Tất cả, Cyberpunk, Lofi & Chill, Vũ Trụ, Sân Khấu DJ, Thiên Nhiên, Nghệ Thuật) và cửa sổ Modal xem/chọn ảnh nhanh chóng, hiển thị đầy đủ 100% kho ảnh.
- **Seamless Demo Music Menu** — Loại bỏ hoàn toàn khoảng hở vật lý giữa nút Demo Music và menu thả xuống, tích hợp cầu nối hover liền mạch và hỗ trợ nhấn chuột để mở menu chọn nhạc demo ổn định, không bị tắt khi di chuyển chuột.
- **Track Info: Rotating Vinyl Badge Spacing** — Xóa bỏ mẫu thẻ trùng lặp "360° Spinning Vinyl", bổ sung thanh trượt tùy chỉnh khoảng cách (`vinylTextSpacing`) giữa Huy hiệu đĩa Vinyl tròn xoay 360° và khối thông tin bài hát (Subtitle, Title, Artist) từ 0px đến 120px.
- **Ken Burns Organic Motion per Slide** — Cài đặt chuyển động Pan & Zoom hữu cơ độc lập cho từng Slide (9 hướng chuyển động, Zoom Scale 1.05x–1.35x, Pan Speed 0.3x–2.5x, cosine smoothstep chống giật hở viền).
- **2D Visualizer Rotation & Auto-Rotate** — Xoay góc tự do cho sóng âm 2D (0°, 90°, 180°, 270°, thanh trượt 0°–360°) và tính năng Tự động xoay quanh tâm (Auto-Rotate 360°) với tốc độ xoay đa chiều.
- **2D Floating Particle Upgrades** — Bụi Lofi trôi 2D sắc nét từ 1px với bộ chọn hình dáng (Tròn, Vuông, Sao, Ngẫu Nhiên); Sao lấp lánh lóe sáng tia 4 góc (4-Corner Flare Bursts); Những hạt lửa bay nguội dần sang tàn tro (Tròn, Vuông, Thoi, Ngẫu Nhiên); Giọt nước mưa chảy trên bề mặt kính tự tan biến; Vệt tốc độ Speed Lines hỗ trợ chiều xuôi/ngược; Đàn bướm phát sáng với vệt bụi tiên.
- **Multi-Format Slide Studio & Video MP4** — Mỗi slide hỗ trợ đầy đủ 4 định dạng (Ảnh mẫu, Upload ảnh, Video MP4, Màu sắc/Gradient 2-3 màu/Radial); Nút điều khiển Play/Pause preview MP4 độc lập, không autoplay gây lag; Tự động cắt/loop video khớp thời lượng slide.
- **3D WebGL Particle & Mesh Visualizers** — 8 ultra-realistic 3D soundscapes powered by Three.js with hardware-accelerated Post-Processing Bloom.
- **Independent 2D & 3D Positioning** — 2D position controls strictly affect 2D waveforms, leaving 3D spatial camera coordinates completely clean and centered.
- **Multi-Slide Background Transitions** — Smooth crossfade, directional slides, and zoom pushes for lyric video slideshows.
- **Studio Master Graphic EQ** — Live 10-band equalizer with +12dB boost, Preamp gain, and audio-reactive spectrum analyzer.
- **Lottie & DotLottie Vector Engine** — Import and animate lightweight JSON/dotLottie stickers synchronized with beat drops.
- **Karaoke Timing Fine-Tuning** — Split-second independent color sweep timing detached from sentence display lifespans.
- **In-App Sandboxed Dialogs** — Safe confirmation modals for resetting and project operations fully compatible with web iframes.
- **Multi-Project Management & Local AutoSave** — Real-time crash protection, JSON backup/restore, and instant project switcher.

### Supported Formats
- **Audio Input**: MP3, WAV, AAC, OGG files (Single or Multi-track Playlist)
- **Subtitle Formats**: SRT (SubRip), LRC (LyRiCs with millisecond precision)
- **Background Input Formats**: JPG / PNG / WebP / MP4 Video
- **Vector Animation Formats**: Lottie (.json) & dotLottie (.lottie)
- **Video Export**: MP4 (H.264 / AAC) with configurable resolution, framerate (30/60 FPS), and bitrate
- **Optimal Dimensions**: 
  - TikTok / Reels / Shorts: 1080x1920 (9:16 Vertical)
  - Instagram Feed / Square: 1080x1080 (1:1 Square)
  - YouTube / Facebook Video: 1920x1080 (16:9 Landscape)
  - Facebook / Instagram Portrait: 1080x1350 (4:5 Portrait)
  
### Visual Effects Overview
- 26 Visualizer styles: 18 advanced 2D waveforms & 8 cutting-edge 3D WebGL scenes
- Post-processing Bloom glow & Universal flowing neon wave lights
- Customizable color palettes (Solid, Gradient 2/3, Rainbow, Neon Glow, Audio-Reactive)
- Background optical filters, Beat Zoom dynamics & 4 Glitch distortion styles
- 11 Audio-reactive particle systems across up to 5 independent overlay layers (Rain, Snow, Spinning Dashes, Silk Ribbon, Sparks, Butterflies, Hyperspace 3D, etc.)
- 6 Lyric styles, 3 karaoke sweep modes & advanced timing micro-editor
- 8 Cinematic Film Light & vintage 35mm burn effects
- 13 Professional Color Grading LUT presets
- 8 Track info badge styles with vinyl 360° spin & beat jumping dynamics
- Unlimited draggable Text Boxes with smart playlist tracklist formatting
- Multi-scene timeline transitions & curated image slideshows

---

## 🎨 Danh Sách Hiệu Ứng & Tính Năng Chi Tiết

### 1. 🌊 Danh Sách Sóng Âm Hiện Có (2D & 3D WebGL Visualizers)
Ứng dụng tích hợp tổng cộng **26 phong cách sóng âm đỉnh cao** gồm **18 phong cách sóng 2D** siêu mượt và **8 không gian 3D Three.js WebGL** thời gian thực:

#### A. 18 Phong Cách Sóng Âm 2D Nghệ Thuật
1. **Spectrum Cột Hạt Rơi (`bars-peaks` - Spectrum Peak Drops)**: Thanh phổ âm equalizer kèm hạt đỉnh rơi vật lý siêu thực phong cách Winamp kinh điển. *(Hot)*
2. **Sóng Đối Xứng Hạt Đỉnh (`bars-mirrored-peaks` - Mirrored Peaks)**: Cột đối xứng 2 đầu kèm hạt rơi lơ lửng phía trên và dưới theo nhịp đập.
3. **Dải Phổ Gradient Mịn (`spectrum-line` - Smooth Area Curve)**: Đường cong sóng mềm mại phủ màu gradient với các đỉnh sáng phát quang mượt mà.
4. **Vòng Tròn Hạt Bay Tỏa (`radial-bars-peaks` - Radial Peak Orbit)**: Tia sóng xoay tròn 360° với hạt đỉnh bắn bung ra xung quanh theo nhịp Bass.
5. **Chuỗi Xoắn Kép DNA 3D (`dna-helix` - DNA Neon Helix)**: Hai dải xoắn kép đan xen kèm bậc thang tần số phát sáng 3D chuyển động đa chiều. *(Stunning 3D)*
6. **Đường Hầm Không Gian 3D (`tunnel-vortex` - Vortex Portal 3D)**: Cổng đa giác xoay vô cực chuyển động xoáy sâu theo dải tần âm trầm Sub-bass. *(3D Tunnel)*
7. **Tia Laser Sân Khấu EDM (`laser-beams` - EDM Concert Lasers)**: Dàn chùm tia laser quét góc rộng bùng nổ theo nhịp kick drum sân khấu lễ hội âm nhạc.
8. **Lõi Siêu Tân Tinh Tỏa Sáng (`starburst-core` - Starburst Nova Core)**: Vụ nổ hạt sao đa giác 360° với tâm phát quang năng lượng vũ trụ.
9. **Ma Trận EQ Khối Nổi (`audio-equalizer-grid` - Cyber EQ Matrix Grid)**: Lưới tầng bậc LED đa sắc màu xếp chồng phản ứng cực nhạy theo từng dải tần số.
10. **Sóng Cột Đối Xứng (`bars-mirrored` - Twin Mirrored Beams)**: Chùm sóng đối xứng trục giữa 2 hướng trên - dưới với lõi laser phát sáng trung tâm (laser core), vạch phân tách trục rõ rệt và dải màu gradient đối xứng độc đáo.
11. **Cột Cổ Điển EQ (`bars` - Classic Studio Hardware EQ)**: Dạng thang đèn LED ngắt tầng cổ điển (segmented LED ladder) của các thiết bị âm thanh phòng thu chuyên nghiệp, có bóng đổ phản chiếu mặt sàn và vạch đỉnh riêng biệt.
12. **Cột Phổ Tối Giản (`spectrum-bars-simple` - Simple Column Spectrum)**: Các cột thẳng đứng thanh lịch, tinh giản cho phong cách hiện đại.
13. **Tia Tròn Tỏa Sáng (`circular-spikes` - Radial Spikes)**: Tia sóng xoay tròn quanh tâm đĩa phát sáng phong cách đĩa nhạc điện tử.
14. **Sóng Nước Mềm Mại (`smooth-wave` - Liquid Wave)**: Dạng sóng dao động chất lỏng mềm mại, êm ái thích hợp cho bản nhạc Lofi & Acoustic.
15. **Ma Trận LED Cyber (`cyber-matrix` - Cyber Matrix)**: Khối gạch LED kỹ thuật số nhảy theo từng quãng tần số âm thanh.
16. **Ngọn Lửa Plasma (`flame-spectrum` - Plasma Fire)**: Ngọn lửa âm nhạc rực cháy bốc cao theo nhịp kick drum và bass drop mạnh mẽ.
17. **Dải Ruy Băng Đôi (`double-ribbon` - Dual Ribbon)**: Hai dải neon sóng uốn lượn đan xen mềm mại và uyển chuyển.
18. **Chấm Tối Giản (`minimal-pulse` - Minimal Dots)**: Đường ngang ma trận chấm tần số tinh gọn dành cho người theo đuổi phong cách audiophile tối giản.

#### B. 8 Không Gian Visualizer 3D Three.js WebGL Siêu Thực
1. **Ma Trận Khối Lập Phương 3D (`3d-cube-matrix` - 3D Cube Equalizer Matrix)**: Lưới khối lập phương kim loại 3D nhấp nhô theo phổ tần số, hỗ trợ chất liệu Kim loại (Metallic), Phong bóng bẩy, Khung dây (Wireframe) và Viền phát sáng Neon.
2. **Quả Cầu Tần Số 3D (`3d-sphere-waveform` - 3D Cyber Wireframe & Crystal Audio Sphere)**: Khối cầu đa diện Icosahedron biến dạng lồi lõm theo nhịp nhạc, chất liệu Thủy tinh pha lê (Crystal Glass), Neon huỳnh quang hoặc Kim loại phản chiếu.
3. **Địa Hình Cyberpunk 3D (`3d-wave-terrain` - 3D Synthwave Landscape)**: Bình nguyên lưới neon trải dài vô tận uốn lượn sóng cuộn, hỗ trợ phản chiếu môi trường hình nền sống động.
4. **Hệ Mặt Trời & Thiên Hà 3D (`3d-solar-system` - Cosmic Planetary System)**: Mặt trời trung tâm phập phồng theo tiếng Bass, các hành tinh quay trên quỹ đạo elip, vành đai tiểu hành tinh và vành đai Sao Thổ rực sáng.
5. **Khối Chất Lỏng Biến Hình 3D (`3d-fluid-shape` - Morphing Glass Fluid Blob)**: Khối chất lỏng trong suốt khúc xạ ánh sáng với các hạt nước li ti văng xung quanh, uốn lượn biến hình theo từng tiết tấu giai điệu.
6. **Mạng Lưới Đa Giác Bezier 3D (`3d-bezier-mesh` - Plexus Constellation Web)**: Mạng lưới chòm sao không gian liên kết các điểm nút phát sáng bằng sợi dây mạng nhện 3D nảy bung theo tần số.
7. **Trường Tia Phóng Phổ Âm 3D (`3d-raycaster` - Stanford Mesh & Normal Ray Field)**: Mô hình lõi 3D phóng ra hàng trăm tia laser hướng tâm kèm hạt đỉnh đầu (vuông, tròn, sao 5 cánh) phản hồi theo xung nhịp âm thanh.
8. **Dải Ngân Hà Xoắn Ốc 3D (`3d-spiral-galaxy` - Spiral Nebula Particle Galaxy)**: Hàng nghìn hạt sao xoay tròn quanh tâm hố đen rực sáng, các cánh tay xoắn ốc tinh vân bung tỏa và nhấp nháy theo âm sắc.

#### C. Công Nghệ Quang Học 3D & Phân Tách Không Gian Độc Lập
- **Hào quang hậu kỳ Three.js (Global Post-Processing Bloom)**: Thuật toán Bloom quang học đa tầng làm rực sáng các vật thể 3D, tích hợp cơ chế **Bass Boost Bloom** tự động bùng sáng chói lóa khi có cú Kick drum hoặc Bass Drop.
- **Sóng Ánh Sáng Chạy (Universal Flowing Light)**: Luồng sáng neon, laser pulse hoặc cầu vồng luân chuyển liên tục quét dọc bề mặt các mô hình 3D.
- **Camera Không Gian Đa Hướng**: Điều khiển góc nghiêng Tilt X, góc xoay Orbit Y, cự ly Camera Distance, tự động xoay quanh tâm (Auto-Rotate) với tốc độ tùy biến.
- **Tọa Độ & Dịch Chuyển Không Gian 3D**: Tự do dịch chuyển vật thể theo 3 trục X, Y, Z (`moveX`, `moveY`, `moveZ`) và xoay lật 3 chiều (`rotateX`, `rotateY`, `rotateZ`).
- **Phân Tách Tuyệt Đối 2D & 3D**: Thanh trượt căn chỉnh vị trí 2D (X, Y) chỉ điều khiển sóng 2D, hoàn toàn không làm lệch tâm khung cảnh 3D.

#### D. Tùy Chỉnh Chuyên Sâu Cho Sóng Âm 2D
- **Góc Xoay Visualizer 2D & Tự Động Xoay (Rotation & Auto-Rotate)**:
  - Phím xoay nhanh: **0°** (Ngang chuẩn), **90°** (Dọc đứng), **180°** (Lộn ngược), **270°** (Dọc ngược).
  - Thanh trượt xoay góc thủ công tự do từ **0° đến 360°** quanh tâm sóng âm `(centerX, posY)`.
  - Tính năng **Tự động xoay quanh tâm (Auto Rotate 360°)** liên tục theo thời gian phát nhạc với thanh trượt tốc độ đa chiều từ **-3.0x** (ngược chiều kim đồng hồ) đến **+3.0x** (thuận chiều kim đồng hồ) kèm phím chọn tốc độ nhanh.
- **Chế độ màu**: Màu đơn (Solid), Gradient 2 màu, Gradient 3 màu, Cầu vồng (Rainbow), Neon Glow.
- **Hào quang đa tầng (Bloom & Glow)**: Công nghệ Multi-pass Neon Bloom làm rực sáng viền sóng âm.
- **Tách sắc sai RGB Glitch (Chromatic Aberration)**: Tách kênh màu quang học phản hồi trực tiếp theo biên độ âm thanh.
- **Bóng phản chiếu dọc (Vertical Reflection)**: Tạo hiệu ứng mặt gương phản chiếu sóng âm xuống mặt đáy với độ mờ và Gradient Fade tùy chỉnh.
- **Đồng bộ nhịp BPM**: Tự động phát hiện BPM của bản nhạc hoặc chỉnh tay để sóng âm nảy đồng bộ tuyệt đối với tempo bài hát.

---

### 2. 🌌 Danh Sách Background Effect (Hiệu Ứng Hình Nền & Hạt Rơi)

#### A. Định dạng nền & Xử lý quang học
- **Định dạng hỗ trợ**: Kho ảnh nền chất lượng cao sẵn có (Cyberpunk, Lofi, Vũ trụ, Thiên nhiên, Trừu tượng), tải ảnh cá nhân (JPG, PNG), tải video nền động (MP4), Gradient 2 màu tùy biến góc quay, Nền màu đơn (Solid).
- **Bộ lọc quang học**: Làm mờ hậu cảnh (Blur 0-30px), Độ sáng (Brightness), Độ tương phản (Contrast), Viền tối nghệ thuật (Vignette).

#### B. Thu Phóng Theo Nhịp (Beat Zoom)
- **Nguồn nhịp kích hoạt (Zoom Trigger)**: Nhịp Bass / Kick Drum, Nhịp điệu tổng thể (Beat / Snare), hoặc Kết hợp cả hai (Hybrid).
- **Phong cách chuyển động (Zoom Style)**:
  - **Nảy Nhịp (Pulse)**: Giật nảy tức thì theo từng tiếng trống.
  - **Mượt Mà (Smooth Cinematic)**: Co giãn điện ảnh êm dịu, mềm mại.
  - **Rung Lắc (EDM Shake)**: Rung giật bùng nổ theo các đoạn Bass Drop.
  - **Thở Nhịp (Breathe)**: Co giãn tuần hoàn chậm rãi theo dải tần thấp.
- **Tùy chỉnh**: Cường độ thu phóng (1% - 15%), Tốc độ chuyển động (0.4x - 3.0x), và chế độ Thu nhỏ thay vì Phóng to (Zoom Invert).

#### C. Nhiễu Sóng Kỹ Thuật Số (Background Glitch Effect)
- **Cơ chế kích hoạt**: Theo nhịp Bass, Theo nhịp Beat, Xuất hiện bất chợt ngẫu nhiên (Random), hoặc Quét liên tục (Continuous).
- **4 Phong cách Glitch đặc sắc**:
  1. **Tách Màu RGB Chromatic Shift (`rgb-shift`)**: Tách sắc quang Red/Cyan & Blue ma mị.
  2. **Cắt Lát Tearing (`slice-displacement`)**: Xé rách dịch chuyển các lát ngang màn hình.
  3. **Băng VHS Retro Scanlines (`vhs-tape`)**: Vạch nhiễu quét băng từ video thập niên 90 và gợn sóng ngang.
  4. **Cyber Data Matrix (`cyber-digital`)**: Số hóa dữ liệu pixel khối giật chớp phong cách tương lai Cyberpunk.

#### D. Gợn Sóng Tròn Đồng Tâm (Circle Ripple Effect)
- Hiệu ứng các vòng tròn sóng nước lan tỏa từ tâm, nhún nhảy và bừng nở theo từng nhịp trống Bass/Beat.
- Tùy chỉnh màu sắc viền sóng, độ mờ (Opacity), số lượng vòng (1 - 8 vòng), tốc độ lan tỏa, độ dày nét viền, hào quang Neon và chọn tâm phát sóng (Chính giữa, Cạnh đáy, hoặc Trọng tâm thẻ bài hát).

#### E. Hệ Thống Hạt Lơ Lửng Đa Lớp Tương Tác Âm Nhạc (Multi-Layer Particle Overlay System)
- **Hệ Thống Đa Lớp Chuyên Nghiệp (Max 5 Layers On Video)**:
  - Cho phép người dùng xếp chồng tối đa **5 lớp hiệu ứng hạt độc lập** trên cùng một khung hình video.
  - **Quản lý từng lớp riêng biệt**: Mỗi lớp có thanh điều khiển riêng với tên tùy chỉnh, nút bật/tắt hiển thị tức thì (Show/Hide qua icon Mắt) và nút xóa (Delete, bảo vệ luôn giữ lại ít nhất 1 lớp).
  - **Tùy biến thông số độc lập cho từng lớp**: Mỗi lớp sở hữu một kiểu hiệu ứng hạt riêng trong số 11 phong cách, với đầy đủ các thiết lập về số lượng hạt (10–250), tốc độ bay (0.01x–3.0x kèm các phím tắt nhanh), độ trong suốt Opacity (10%–100%), kích thước hạt pixel (1px–36px), kích thước ngẫu nhiên (Random Size), màu sắc tự chọn hoặc nhóm màu swatches, và cường độ phát sáng Neon Glow.
  - **Cài đặt tương tác âm thanh toàn cục (Global Reactivity)**:
    - **⚡ Tăng tốc theo nhịp Beat (Accelerate on Beats)**: Áp dụng đồng bộ cho toàn bộ các lớp hạt đang chạy.
    - **🔥 Bừng sáng rực rỡ theo Bass Drop (Flash Brighter on Bass Drop)**: Tăng vọt độ rực sáng và hào quang phát quang cho tất cả các lớp khi có nhịp sub-bass kick dồn dập, kèm thanh trượt điều chỉnh cường độ khuếch đại Bass Flash Boost (0.5x–2.5x).

- **Thư Viện 11 Phong Cách Hiệu Ứng Hạt 2D Canvas Tinh Xảo**:
  1. **Mưa Rơi Tự Nhiên (`rain`)**: Mô phỏng vật lý mưa rơi chân thực với 5 kiểu hạt (Hỗn hợp, Vệt dài Cinematic, Mưa phùn li ti, Mưa rào xối xả, Mưa phát sáng Neon), góc nghiêng gió, độ chao đảo, hướng gió biến thiên tự nhiên (`rainRandomWind`) và **Hạt nước chảy trên bề mặt kính (`waterOnGlass`)** tự động trôi nhẹ và bốc hơi / tan biến sau thời gian ngẫu nhiên (1.2s – 4.5s).
  2. **Tuyết Rơi Mùa Đông (`snow`)**: Bông tuyết tinh khiết với bộ chọn hình dạng (Lục giác 6 cánh, Kim cương băng, Ngôi sao, Chấm tròn, Flurry hoặc Ngẫu nhiên), tùy chỉnh góc gió và tốc độ gió.
  3. **Đường Vạch Tốc Độ Anime (`speed-lines`)**: Vệt tốc độ không gian với tùy chọn **Chiều xuôi / Chiều ngược (Reverse direction)**, đa dạng góc xoay (ngang, dọc, chéo 45°, chéo 135°, đồng quy tâm hoặc nửa trên/dưới), độ dài ngẫu nhiên và độ nhòe Motion Blur.
  4. **Mưa Băng Lụa Ruy Băng (`silk-ribbon` / `spaghetti`)**: Dải lụa mềm mại uốn lượn sóng 3D rực rỡ dạ quang khi rơi.
  5. **Bụi Lofi Trôi 2D (`dust`)**: Hạt bụi lơ lửng êm đềm phong cách vintage, vẽ 2D sắc nét tinh khiết (loại bỏ viền mờ), kích thước hạt siêu mịn từ **1px**, tích hợp bộ chọn hình dáng hạt bụi: **⚪ Tròn (Mặc định)**, **⬛ Vuông**, **⭐ Ngôi Sao**, và **🎲 Ngẫu Nhiên các loại**.
  6. **Sao Lấp Lánh (`stars`)**: Bầu trời ngàn sao lung linh cố định, tích hợp tính năng **Ngẫu nhiên lóe sáng tia 4 góc (4-Corner Flare Bursts)** tự động phóng ra các tia hào quang chữ thập và lõi tia lấp lánh khi đạt đỉnh nhấp nháy, kèm thanh trượt điều chỉnh cường độ tia lóe sáng (0.2x – 2.5x) và chọn shape sao (Sao 4 tia, Sao 5 cánh, Chấm tròn sáng, Ngẫu nhiên).
  7. **Những Hạt Lửa & Tàn Tro Bay (`fire-embers`)**: Hiệu ứng các pixel lửa rực cháy bay từ đáy màn hình lên trên, tỏa ra nhiều hướng ngẫu nhiên rồi nguội dần theo chuỗi màu quang phổ (Trắng/Vàng → Cam lửa → Đỏ thẫm → Tro xám → Đen tàn) trước khi tan biến; tích hợp bộ chọn hình dáng hạt lửa: **⚪ Tròn**, **⬛ Vuông**, **🔷 Hình Thoi**, hoặc **🎲 Ngẫu Nhiên**, thanh trượt độ tỏa rộng ngang và tốc độ nguội tro.
  8. **Tăng Tốc Hyperspace 3D (`hyperspace`)**: Hiệu ứng phi thuyền warp-speed lao qua không gian với vận tốc ánh sáng và hào quang lóa sáng.
  9. **Đoạn Thẳng Rơi & Xoay 360° (`spinning-dashes`)**: Các đoạn thẳng ngắn vừa rơi vừa xoay 360° nảy theo nhịp Bass.
  10. **Bong Bóng Cầu Vồng (`rainbow-bubbles`)**: Bong bóng ngũ sắc phản chiếu ánh sáng lấp lánh.
  11. **Đàn Bướm Phát Sáng 2D (`butterflies` - Mới 🦋)**: Đàn bướm 2D bay lượn dập dờn sinh động trong không gian với thuật toán chuyển động hữu cơ; mô phỏng cánh vỗ co giãn chiều ngang theo góc nhìn phối cảnh (foreshortening physics); cơ thể thanh mảnh có râu và mắt điểm nhấn; tích hợp **6 tông màu nghệ thuật**:
      - 🦋 *Monarch Amber*: Cánh cam hổ phách viền đen đốm trắng kinh điển.
      - ⚡ *Cyberpunk Neon*: Cánh phát sáng điện tử Cyan & Magenta tương lai.
      - 🌿 *Emerald Glow*: Cánh ngọc lục bảo dạ quang thanh khiết.
      - ✨ *Golden Sun*: Cánh vàng hoàng kim ấm áp óng ả.
      - 🌈 *Prismatic Rainbow*: Cánh chuyển sắc cầu vồng ngũ sắc theo thời gian.
      - 🎨 *Custom Palette*: Tự chọn màu chính và màu phụ độc quyền.
      - Tùy chỉnh tần số đập cánh (0.5x–3.0x), kích thước bướm sải cánh (12px–56px) và **Vệt bụi tiên lấp lánh (Sparkle Dust Trail)** tự động tuôn rơi lấp lánh phía sau đường bay của bướm.

---

### 3. 🎤 Danh Sách Các Tính Năng Lyrics (Lời Bài Hát & Karaoke)

#### A. Định dạng hỗ trợ & Nhập liệu
- Hỗ trợ nhập file phụ đề tiêu chuẩn `.SRT`, file lời nhạc chạy thời gian `.LRC` với độ chính xác mili-giây, hoặc tự do soạn thảo / thêm / sửa từng câu trực tiếp trên giao diện trực quan.
- Tự động chuẩn hóa timing LRC/SRT để tránh gián đoạn hoặc ngưng trệ khi có đoạn dạo nhạc dài giữa các câu.

#### B. Các Kiểu Hiển Thị Lời Bài Hát (Lyrics Styles)
1. **Karaoke 2 Dòng Song Ca / So Le (`karaoke-duo` - Mới ⭐)**: 
   - **Tự động căn Timing 2 dòng hiển thị đồng thời (Hiện cùng lúc & Chữ chờ lót - Cover Text)**: Khi chọn chế độ Karaoke 2 dòng, hệ thống tự động tính toán lại thời gian hiển thị: Dòng 0 và Dòng 1 xuất hiện cùng lúc trên màn hình ngay từ đầu bài hát; Dòng 1 đóng vai trò chữ chờ lót với màu mặc định `#FFFFFF`. Khi Dòng 0 hát xong và Dòng 1 bắt đầu quét màu, Dòng 2 lập tức xuất hiện thế chỗ trên hàng đối diện.
   - **Tự động khôi phục timing gốc**: Khi chuyển từ Karaoke 2 dòng về 1 dòng (`karaoke-single`), 3 dòng (`karaoke`) hoặc 4 dòng (`teleprompter-4lines`), hệ thống tự động hoàn trả lại mốc timing đơn ban đầu (`originalStartTime`/`originalEndTime`), không làm sai lệch phụ đề gốc.
   - **Tùy chỉnh vị trí & bố cục độc lập**: Hỗ trợ tinh chỉnh tọa độ dọc/ngang riêng cho từng dòng (`Line 1 Y/X`, `Line 2 Y/X`), khoảng cách giữa 2 dòng (`Line Gap` từ 10px đến 80px) và 4 chế độ căn lề: Căn giữa (Center), So le trái-phải (Left-Right Staggered), Căn trái (Left), Căn phải (Right).
   - Tích hợp nút hành động nhanh: *Căn lại Timing 2 Dòng* và *Khôi phục Timing Gốc*.
2. **Karaoke 1 Dòng Nổi Bật (`karaoke-single`)**: Chỉ hiển thị 1 câu đang hát với hiệu ứng quét chữ mượt mà và hạt bay lượn (Tối ưu tuyệt đối cho video ngắn TikTok, YouTube Shorts, Facebook Reels).
3. **Karaoke 4 Dòng Tự Cuộn (`teleprompter-4lines`)**: 4 dòng chữ hiển thị liên tục, tự động cuộn mượt mà như máy nhắc chữ teleprompter chuyên nghiệp.
4. **Karaoke 3 Dòng Kinh Điển (`karaoke`)**: Dòng đang hát được phóng to nổi bật nhất ở giữa, dòng trước đó và dòng kế tiếp được làm mờ nhẹ tạo chiều sâu không gian.
5. **Thanh Phụ Đề Kính Mờ (`subtitle-bar`)**: Hộp kính mờ frosted glass tối giản, thanh lịch phong cách giao diện hiện đại.
6. **Phát Sáng Tối Giản (`minimal-glow` - Hỗ trợ Tự Động Chia 2 Dòng Cho Khung Dọc 9:16 ⭐)**:
   - Chữ sắc nét với hào quang neon tỏa nhẹ phong cách hiện đại mà không có khung viền hộp gò bó.
   - **Tùy chọn Tự Động Chia 1 Câu Thành 2 Dòng (`minimalGlowAutoTwoLines`)**: Khi bật tùy chọn này, hệ thống sử dụng thuật toán ngắt câu cân đối thông minh (dựa trên dấu ngắt dòng `\n`, phân cách ` / `, ` | `, dấu phẩy `,`, chấm phẩy `;`, gạch nối `-`, hoặc khoảng trắng giữa các từ gần tâm) để tự động tách 1 câu dài thành 2 dòng ngắn hiển thị cùng lúc trên màn hình (dòng trên & dòng dưới).
   - **Tối ưu hóa chuyên biệt cho video dọc 9:16 (TikTok, YouTube Shorts, Facebook Reels)**: Giúp lời bài hát luôn vừa vặn trong màn hình hẹp, loại bỏ hoàn toàn tình trạng chữ bị tràn mép hoặc phải hạ cỡ chữ quá nhỏ; giữ chữ luôn to rõ, cân đối và thẩm mỹ.
   - **Tùy chỉnh khoảng cách 2 dòng (`Line Gap`)**: Thanh trượt từ 18px đến 80px (mặc định 36px) để căn chỉnh độ thoáng giữa 2 dòng theo ý muốn.

#### C. Quản Lý Lyrics Presets (Tối Đa 10 Presets & Định Dạng `.lyrics`)
- **Lưu Preset Cá Nhân**: Cho phép lưu cấu hình phong cách lyrics hiện tại thành preset có tên riêng (tối đa 10 presets lưu trữ an toàn trong trình duyệt).
- **Áp dụng 1-Click**: Chọn nhanh từ các preset cá nhân hoặc 5 preset mẫu phòng thu có sẵn (Studio Duo Karaoke, Gold Luxury 3D, Cyber Gradient Pop, Minimal Glow, Frosted Subtitle Bar).
- **Xuất File `.lyrics`**: Xuất từng preset riêng lẻ hoặc xuất toàn bộ gói preset thành file JSON mang đuôi mở rộng `.lyrics`.
- **Nạp File `.lyrics`**: Tải file `.lyrics` hoặc `.json` từ máy tính lên để khôi phục hoặc áp dụng tức thì vào video.

#### D. 3 Hiệu ứng chuyển động quét chữ Karaoke (`karaokeSweepMode`)
1. **Chỉ Đổi Màu (`color-only`)**: Quét chuyển đổi màu chữ mượt mà chuẩn xác từ trái sang phải theo tiến độ câu hát.
2. **Sao Vàng Bay + Đổi Màu (`star-flying`)**: Ngôi sao vàng 5 cánh phát sáng bay lướt và nảy tưng tưng trên đầu từng chữ đang được hát.
3. **Quả Bóng Nhỏ Bay + Đổi Màu (`bouncing-ball`)**: Quả bóng tròn phát sáng 3D nảy bồng bềnh nhịp nhàng trên chữ theo phong cách karaoke vui nhộn.

#### E. Tùy Biến Đổ Bóng Nổi 3D & Dải Màu Gradient Nâng Cao
- **Đổ Bóng Nổi 3D (`3d-shadow`)**:
  - Tùy chỉnh độ sâu khối 3D (`threeDDepth`: 1px đến 25px).
  - Tùy chỉnh góc đổ bóng 3D (`threeDAngle`: 0° đến 360°) với các nút hướng nhanh: `↘ Dưới-Phải (135°)`, `↓ Thẳng Dưới (90°)`, `↙ Dưới-Trái (45°)`, `↗ Trên-Phải (225°)`.
  - Chọn màu sắc bóng nổi 3D (`threeDColor`).
  - Tùy chọn viền ngoài nổi khối sắc nét (`threeDStroke`: Bevel Outline).
- **Dải Màu Gradient (`gradient-fill`)**:
  - Tích hợp sẵn 9 chủ đề màu sắc tuyển chọn: Sunset Gold, Cyber Neon, Golden Luxury, Emerald Aurora, Fire Ember, Ocean Breeze, Pastel Candy, Silver Chrome, Rainbow Prism.
  - Bảng chọn 3 điểm dừng màu sắc (Màu 1 Đỉnh, Màu 2 Giữa, Màu 3 Cuối).
  - Thanh trượt chỉnh góc xoay hướng dải màu từ 0° đến 360°.

#### F. Hiệu Ứng Xuất Hiện & Biến Mất Của Lời Bài Hát (In / Out Transitions)
- **Hiệu ứng Xuất hiện (In-Effect)**: `none` (Tức thì), `fade` (Mờ dần), `slide-up` (Trượt từ dưới lên), `slide-down` (Trượt từ trên xuống), `slide-left` (Trượt từ trái sang), `slide-right` (Trượt từ phải sang), `zoom-in` (Phóng to từ tâm), `char-drop` (Rơi chữ theo ký tự), `dissolve` (Hòa tan biến hình), `bounce` (Nảy đàn hồi).
- **Hiệu ứng Biến mất (Out-Effect)**: `none` (Tức thì), `fade` (Mờ dần), `slide-up` (Trượt lên trên tan biến), `slide-down` (Trượt xuống dưới tan biến), `zoom-out` (Thu nhỏ dần vào tâm), `dissolve` (Hòa tan biến mất).
- **Thời lượng chuyển cảnh (Duration)**: Điều chỉnh linh hoạt từ 0.10s đến 1.00s.

#### G. Tùy Biến Phông Chữ & Màu Sắc Typography
- Thư viện 20+ phông chữ tuyển chọn hỗ trợ tiếng Việt đầy đủ dấu (Montserrat, Be Vietnam Pro, Quicksand, Playfair Display, Space Grotesk, Oswald, Lobster...).
- **Màu Chữ Mặc Định (Default Lyrics Text Color)**: Luôn mặc định là `#FFFFFF` (trắng thuần sắc nét), đảm bảo khả năng đọc tốt nhất trên mọi nền và làm chữ chờ lót hoàn hảo trong chế độ Karaoke 2 dòng.
- **3 Bảng Chọn Màu Trực Quan (3-Column Layout)**:
  1. `Lyric Text Color`: Màu chữ gốc / chờ hát (`config.color`, mặc định `#FFFFFF`), cho phép đặt màu cơ bản trước khi ca sĩ hát đến.
  2. `Active Singing Text Color`: Màu chữ đang hát (`config.activeColor`).
  3. `Lyrics Glow Tint`: Màu hào quang phát sáng xung quanh chữ (`config.glowColor`).
- Cỡ chữ (Font Size), độ đậm (Font Weight: 400, 500, 600, 700 Bold, 900 Black), chữ nghiêng (Italic), gạch chân (Underline), viết hoa toàn bộ (All Caps), căn lề (Trái, Giữa, Phải).
- **Hộp nền chữ (Background Pill)**: Bật/tắt khung nền bo góc (Pill) trong suốt chống chìm chữ trên nền sáng/tối.

#### H. Tính năng Chỉnh Thời Gian Quét Màu Karaoke Độc Lập (Karaoke Timing Editor)
- **Tách biệt hiển thị và quét màu**: Cho phép người dùng chỉnh thời gian quét màu karaoke độc lập với thời gian câu hiển thị trên màn hình.
- **Thanh trượt thời lượng Karaoke**: Kéo chỉnh thời lượng quét màu trực quan với tỷ lệ phần trăm hiển thị tức thì.
- **Phím tắt nhanh thời lượng**: Chọn nhanh các mức `-0.5s`, `-1.0s`, `-1.5s`, `-2.0s` hoặc khôi phục `100%`.
- **Nút gắn mốc phát hiện tại (`= Hiện tại`)**: Nhấn để gán ngay mốc thời gian bài hát đang chạy vào điểm kết thúc câu hát của ca sĩ.
- **Phím vi chỉnh siêu chính xác**: Tăng/giảm bước nhảy `±0.05s`, `±0.2s`, `±1.0s` cho cả thời gian bắt đầu và kết thúc.
- **Căn chỉnh hàng loạt (Batch Actions)**: Rút ngắn thời lượng karaoke cho tất cả câu hát (`-0.5s`, `-1.0s`) hoặc khôi phục đồng loạt chỉ với 1 click.

#### I. Bộ công cụ xử lý lời bài hát thông minh
- **Tách câu tự động**: Phân tách nhanh các câu dài thành câu ngắn vừa vặn màn hình điện thoại dựa trên dấu phẩy (`,`) hoặc dấu chấm (`.`).
- **Tự động sửa chồng lấn thời gian (Auto-fix Overlaps)**: Quét và tự động triệt tiêu các khoảng thời gian bị lấn cấn giữa các câu liền kề.
- **Cảnh báo lỗi đảo thời gian**: Phát hiện và đánh dấu câu có thời gian bắt đầu lớn hơn thời gian kết thúc.
- **Sắp xếp theo mốc thời gian**: Tự động đưa các câu về đúng trật tự thời gian phát của bài hát.
- **Dịch chuyển mốc thời gian toàn bài (Shift Time)**: Tịnh tiến tiến hoặc lùi toàn bộ phụ đề bài hát với các bước `±0.5s`, `±1.0s`.
- **Tìm kiếm câu hát nhanh**: Ô tìm kiếm lọc câu hát theo từ khóa ngay lập tức.
- **Phát nhạc ngay từ câu đang chọn**: Nhấn nút phát để tua bài hát đến đúng vị trí câu cần nghe thử.
- **Quản lý câu linh hoạt**: Thêm câu mới, nhân bản câu (Duplicate), xóa câu hát.

---

### 4. 📽️ Danh Sách Film Light Effect (Hiệu Ứng Ánh Sáng & Cháy Phim)
Tái hiện không gian quang học chân thực với **8 phong cách ánh sáng điện ảnh cao cấp**:

1. **Cháy Phim 35mm Cổ Điển (`vintage-leak` - Vintage 35mm Burn)**: Vệt lóa ấm áp cam hổ phách, đỏ hồng ngọc và vàng kim lan tỏa tự nhiên từ góc khung hình. *(Kinh Điển)*
2. **Vệt Sáng Xanh Điện Ảnh (`anamorphic-flare` - Anamorphic Cinema Flare)**: Tia sáng laser xanh cyan Anamorphic quét ngang khung hình chuẩn phim bom tấn Hollywood. *(Cinema 4K)*
3. **Tán Sắc Lăng Kính Prism (`prism-rainbow` - Prism Rainbow Beam)**: Dải quang phổ 7 sắc cầu vồng mềm mại lấp lánh phản xạ ánh sáng mơ màng. *(Mơ Màng)*
4. **Nắng Chiều Hoàng Hôn (`golden-hour` - Golden Hour Sunbeams)**: Luồng nắng vàng óng ả ấm áp rọi xiên qua khung hình với các hạt bụi nắng li ti. *(Ấm Áp)*
5. **Cháy Sáng Neon Cyber (`neon-cyber-leak` - Cyberpunk Neon Leak)**: Đèn Neon Hồng Magenta & Xanh Cyan đối lập nồng nhiệt phong cách tương lai. *(Cyberpunk)*
6. **Máy Chiếu Phim 8mm (`retro-projector` - Retro 8mm Projector)**: Ánh đèn máy chiếu rung lắc nhẹ kèm bụi xước, nhấp nháy màn chập phim nhựa cổ. *(Vintage 8mm)*
7. **Vệt Lóa Ống Kính Đa Vòng (`lens-optical-flare` - Optical Ring Flare)**: Hào quang ống kính máy quay với chuỗi vòng tròn quang học và đĩa khúc xạ phản xạ chân thực. *(Quang Học)*
8. **Cháy Phim Bốc Lửa Động (`film-burn-cycle` - Dynamic Film Fire Burn)**: Đám cháy phim nhựa bùng nổ chuyển động ngẫu nhiên theo nhịp điệu âm nhạc. *(Bùng Nổ)*

*Tùy biến chi tiết ánh sáng & phim nhựa*:
- **Vị trí nguồn sáng**: Trái trên, Phải trên, Trái dưới, Phải dưới, Cạnh trên, Chính giữa, hoặc Trôi nổi tự do (Dynamic Float).
- **Chế độ hòa trộn (Blend Modes)**: Screen, Lighter, Color-Dodge, Overlay, Soft-Light.
- **Bụi & xước phim 35mm (Film Dust & Scratches)**: Giả lập hạt bụi và sợi xước phim nhựa cổ điển.
- **Nhấp nháy màn chập máy chiếu (Lens Shutter Flicker)**: Rung giật nhấp nháy ánh sáng theo tần số máy quay phim nhựa.
- **Tách sắc sai quang học (Chromatic Aberration)**: Tách dải viền màu quang sai ở rìa khung hình.
- **Viền tối ấm áp (Warm Vignette)**: Tạo sắc độ chuyển tối ấm áp quanh 4 góc video.
- **Phản ứng theo nhịp Beat (Beat Flash Boost)**: Tăng vọt độ rực rỡ và kích thước của vệt sáng mỗi khi có tiếng trống Bass/Beat.

---

### 5. 🎞️ Danh Sách Color Grading Effect (Hiệu Chỉnh Màu Toàn Cục & Bộ Lọc LUT)
Tích hợp **13 bộ lọc màu LUT chuyên nghiệp** được phân theo từng thể loại nghệ thuật:

1. **Nguyên Bản / Tự Nhiên (`none` - Original / Neutral)**: Giữ nguyên màu sắc gốc trung thực không áp dụng bộ lọc. *(Raw)*
2. **Xanh Teal & Cam Hollywood (`teal-orange` - Teal & Orange Hollywood)**: Tông màu điện ảnh kinh điển: Da cam ấm áp tương phản bóng tối xanh đại dương sâu thẳm. *(Blockbuster Cinema)*
3. **Điện Ảnh Kodachrome Ấm (`cinematic-warm` - Cinematic Kodachrome)**: Màu phim ấm áp sang trọng, độ tương phản sâu với ánh sáng vàng mật ong. *(Warm Film)*
4. **Bleach Bypass Bạc Hành Động (`bleach-bypass` - Bleach Bypass Action)**: Độ tương phản cực mạnh, khử bão hòa màu sắc mang cảm giác bụi bặm gai góc. *(Gritty Action)*
5. **Cyberpunk Neon Tương Lai (`cyberpunk-neon` - Cyberpunk Neon 2077)**: Hồng cánh sen rực rỡ hòa quyện cùng sắc xanh tím huỳnh quang bí ẩn. *(Synthwave)*
6. **Hoài Niệm Vintage 70s (`vintage-70s` - Vintage 70s Polaroid)**: Tông màu máy ảnh phim xưa ố vàng cổ điển, đen nhạt khói nhẹ và hạt phim mịn. *(Nostalgia)*
7. **Hoàng Hôn Nắng Vàng (`golden-hour` - Golden Hour Sunset)**: Khoảnh khắc giờ vàng hoàng hôn thơ mộng ngập tràn sắc vàng cam rực rỡ. *(Sunset)*
8. **Đen Trắng Nghệ Thuật B&W (`black-and-white` - Noir Monochrome Classic)**: Tông đen trắng sâu thẳm, loại bỏ phân tâm màu sắc để nổi bật hình khối & cảm xúc. *(Monochrome)*
9. **Phim Mờ Matte Faded (`faded-film` - Matte Faded Film)**: Vùng đen được nâng sáng mềm mại tạo hiệu ứng phim rửa analog nhẹ nhàng. *(Indie Matte)*
10. **Băng Từ VHS Thập Niên 90 (`retro-vhs` - Retro 90s VHS Tape)**: Hiệu ứng băng từ gia đình thập niên 90 với màu sắc hơi lệch và hạt nhiễu cổ điển. *(Analog VHS)*
11. **Xanh Ma Trận Matrix (`matrix-green` - Matrix Cyber Emerald)**: Sắc xanh ngọc lục bảo huyền bí công nghệ không gian số Cyberpunk. *(Matrix)*
12. **Xanh Đêm Lạnh Tối Giản (`moody-blue` - Midnight Moody Blue)**: Tông xanh băng giá trầm lắng phong cách điện ảnh Bắc Âu huyền bí. *(Nordic Dark)*
13. **Kẹo Ngọt Candy Pop Rực Rỡ (`candy-pop` - Vibrant Candy Pop)**: Độ bão hòa cao đầy năng lượng, bắt mắt thích hợp cho nhạc Pop, Kpop & EDM. *(Pop EDM)*

*Bảng điều khiển cân chỉnh màu chuyên sâu*:
- **Thanh trượt cường độ LUT**: Tùy chỉnh mức độ áp dụng bộ lọc từ 0% đến 100%.
- **Cân chỉnh ánh sáng**: Độ sáng (Brightness), Độ tương phản (Contrast), Độ bão hòa màu (Saturation), Phơi sáng (Exposure).
- **Cân bằng trắng & sắc thái**: Nhiệt độ màu (Temperature: Xanh lạnh sang Vàng ấm), Sắc thái (Tint: Xanh lục sang Đỏ tím), Đảo vòng góc màu (Hue Rotate).
- **Hiệu ứng phim nhựa & bóng mờ**: Tông màu Sepia cổ điển, Nâng sáng vùng tối (Shadows Lift / Milky Shadows), Tách màu vùng sáng & vùng tối (Split Toning Highlights & Shadows).
- **Quang học & hạt phim**: Tối góc Vignette (tùy chỉnh màu đen/màu tùy ý và độ chuyển mượt), Hạt phim 35mm (Film Grain), Hào quang phát sáng khuếch tán (Diffusion Bloom Glow).

---

### 6. 🏷️ Danh Sách Track Info Badge Style (Kiểu Thẻ Thông Tin Bài Hát)
Cung cấp **8 phong cách hiển thị thẻ bài hát & bìa đĩa**:

1. **Thẻ Ngang Bo Tròn - Badge Mới (`horizontal-rounded-card` - Horizontal Rounded Card Badge)**: Thẻ hiện đại với khung ảnh bìa bo tròn viền dày nổi bật bên trái, kết hợp 3 tầng thông tin (Tiêu đề phụ, Tên bài hát, Ca sĩ) được bố trí ngay ngắn, thanh lịch bên phải.
2. **Đĩa Than Vinyl Xoay 360° (`vinyl` - 360° Spinning Vinyl)**: Đĩa than cổ điển với vân rãnh chân thực, ánh phản quang tinh xảo và ảnh bìa xoay tròn liên tục 360° theo thời gian bài hát.
3. **Huy Hiệu Tròn Xoay 360° (`rotating-badge` - Rotating Vinyl Badge 360°)**: Huy hiệu tròn xoay 360° với viền chữ uốn cong chạy vòng tròn quanh chu vi và tâm ảnh bìa đĩa hát.
4. **Thẻ Kính Mờ (`glass-card` - Frosted Glass Badge)**: Thẻ bo góc phủ kính acrylic bán trong suốt hiện đại kèm ảnh bìa, tên bài hát và nghệ sĩ trình bày.
5. **Huy Hiệu PNG / Sticker (`logo-badge` - PNG Badge)**: Hình ảnh PNG trong suốt hoặc sticker riêng biệt làm tâm điểm nổi bật không bị gò bó bởi khung tròn, nhún nhảy theo nhạc.
6. **Huy Hiệu Tròn Phát Sáng (`circular-badge` - Circular Avatar Badge)**: Vòng tròn ảnh đại diện tinh tế với đường viền hào quang phát sáng neon rực rỡ.
7. **Chữ Tối Giản Không Khung (`minimal-tag` - Minimalist Typography)**: Chỉ hiển thị tên bài hát và ca sĩ bay tự do trên khung hình, không viền ngăn cách.
8. **Ẩn Thẻ Bìa (`hidden` - Hidden / Off)**: Ẩn hoàn toàn thẻ thông tin bài hát trên video khi muốn nhường trọn không gian cho sóng âm và lời bài hát.

*Các tính năng tùy biến mạnh mẽ cho Track Info*:
- **Bố cục 3 dòng linh hoạt (Subtitle - Title - Artist)**:
  - Bật/tắt hiển thị từng thành phần riêng lẻ (Tiêu đề phụ, Tiêu đề chính, Tên nghệ sĩ).
  - Tự do thay đổi thứ tự hiển thị sắp xếp giữa các dòng theo ý thích (Ví dụ: Subtitle nằm trên, Title ở giữa, Artist ở dưới hoặc tùy chỉnh).
- **Tùy chỉnh Typography độc lập cho từng dòng**:
  - Tùy chỉnh riêng biệt Phông chữ, Cỡ chữ (Size), Màu sắc cho từng dòng.
  - Kiểu chữ: Bình thường (Normal), Đậm nét (Bold), Nghiêng (Italic), Đậm & Nghiêng (Bold Italic), VIẾT HOA (Uppercase).
  - 7 hiệu ứng chữ độc lập: Mặc định, Hào quang Neon, Viền nét đôi, Bóng đổ 3D, Gradient, Kim loại Chrome ánh kim, Hoạt hình Comic Pop.
- **Hiệu ứng Nảy theo nhịp Beat / Bass (Badge Beat Jump)**:
  - Tự động bắt nhịp trống để giật nảy thẻ bài hát và huy hiệu.
  - **5 Kiểu nảy sinh động**:
    1. **Phóng to co giãn (Pulse)**: Thu phóng mượt mà theo nhịp trống.
    2. **Nảy bật lên trên (Bounce Up)**: Bật nảy lên phía trên theo từng cú Kick drum.
    3. **Lắc lư nghiêng góc (Tilt & Rock)**: Nghiêng góc nhịp nhàng kết hợp phóng to.
    4. **Đàn hồi thạch (Jelly)**: Co ép đàn hồi tưng tưng như thạch rau câu.
    5. **Rung giật Bass (Shake)**: Rung giật điện ảnh cực mạnh theo âm trầm Sub-bass.
  - Tùy chỉnh cường độ nảy và hiệu ứng bùng nổ hào quang phát sáng theo nhịp trống (Badge Beat Glow).
- **Thứ tự lớp hiển thị (Layer Order)**:
  - Phía Sau Sóng Âm (Mặc định)
  - Phía Trước Sóng Âm
  - Phía Sau Cùng (Nằm dưới cả các hạt bay rơi)
  - Lớp Trên Cùng (Topmost - Hiển thị đè lên tất cả các lớp khác)
- **Tùy biến Logo / Watermark thương hiệu cá nhân**:
  - Tải lên hình ảnh Logo PNG trong suốt.
  - Tự do di dời Logo theo tọa độ X, Y bất kỳ trên màn hình (0% - 100%) hoặc chọn nhanh các góc đặt sẵn (4 góc màn hình hoặc chính giữa tâm huy hiệu).
  - Tùy chỉnh kích thước (Scale), độ mờ (Opacity) và hiệu ứng vòng sáng Neon bao quanh Logo.
- **Tùy chọn Ẩn / Hiện Hộp Chữ (Text & Titles Box Show/Hide)**:
  - Cho phép bật/tắt hiển thị toàn bộ phần Text Box (Tiêu đề, Nghệ sĩ) theo nhu cầu.
- **Bộ Công Cụ Cân Chỉnh Phông Chữ Chi Tiết (Typography Stepper & Preview)**:
  - Chỉnh độc lập Phông chữ (Font Family), Kiểu chữ (Font Style: Thường, Nghiêng, Đậm, Đậm & Nghiêng, Viết Hoa), và Cỡ chữ (Font Size) cho từng dòng Sub Title, Main Title và Artist Info.
  - Nút bấm tăng giảm cỡ chữ nhanh (+ / -), thanh trượt mượt mà và thẻ xem trước (Live Font Preview) trực quan ngay trên bảng điều khiển.

---

### 7. 🔀 Hệ Thống Chuyển Cảnh & Trình Chiếu Ảnh (Scene Transitions & Multi-Slide Timeline)
Hỗ trợ tạo video âm nhạc với nhiều hình ảnh và phân cảnh biến đổi đa dạng xuyên suốt bài hát:

#### A. Chế Độ Trình Chiếu Ảnh Nhiều Slide (Slide Presentation Mode)
- **Tự động chuyển đổi hình nền**: Luân phiên hiển thị danh sách nhiều ảnh nền theo chu kỳ giây hoặc tự động chia đều theo tổng thời lượng bài hát.
- **Tùy chỉnh riêng cho Ken Burns Organic Motion trong từng Slide**:
  - Bật/tắt hiệu ứng Ken Burns độc lập cho từng slide card.
  - **9 Hướng chuyển động (Motion Direction)**:
    1. Tự động ngẫu nhiên (`auto`)
    2. Thu phóng vào giữa (`zoom-in`)
    3. Thu phóng ra xa (`zoom-out`)
    4. Lướt sang trái (`pan-left`)
    5. Lướt sang phải (`pan-right`)
    6. Lướt lên trên (`pan-up`)
    7. Lướt xuống dưới (`pan-down`)
    8. Chéo: Trái Trên → Phải Dưới (`diagonal-tl-br`)
    9. Chéo: Phải Trên → Trái Dưới (`diagonal-tr-bl`)
  - **Tỷ lệ Zoom (Zoom Scale)**: Thanh trượt từ **1.05x đến 1.35x**.
  - **Tốc độ lướt (Pan Speed)**: Thanh trượt từ **0.3x đến 2.5x**.
  - **Chuyển động mượt mà (Smoothing)**: Thuật toán Cosine Smoothstep kết hợp overscale bleed chống giật cục và chống hở viền đen, chỉ kích hoạt chuyển động sau khi quá trình transition hoàn tất.
- **Hỗ trợ đầy đủ 4 định dạng nguồn trong mỗi Slide**:
  1. **Ảnh Mẫu (Curated Presets)**: Chọn ảnh độ phân giải cao từ thư viện tuyển chọn sẵn có.
  2. **Tải Ảnh (Upload Image)**: Tải ảnh cá nhân (JPG, PNG, WebP) từ máy tính.
  3. **Video MP4 / WebM (Slide Video)**:
     - Nút Play/Pause preview nhỏ gọn độc lập ngay trên thumbnail từng Slide MP4 để nghe/xem thử.
     - **Không autoplay MP4 khi upload** trong slide, ngăn ngừa tình trạng quá tải và giật lag app.
     - **Khung Preview chính chỉ bắt đầu phát video nền khi nhấn Play nhạc**, dừng lại khi tạm dừng.
     - Tự động phát lặp loop mượt mà nếu thời lượng video MP4 ngắn hơn thời lượng Slide, tự động cắt video nếu thời lượng video dài hơn Slide.
  4. **Studio Màu Sắc (Solid & Gradients)**:
     - Màu Đơn (Solid): Chọn mã màu tùy ý.
     - Linear Gradient: Dải màu chuyển tiếp 2 hoặc 3 màu tùy biến góc xoay (0°–360°).
     - Radial Gradient: Dải màu tỏa tròn với tâm tỏa linh hoạt (Chính giữa, Đỉnh, Đáy, Trái, Phải).
- **Tính toán thời lượng thông minh (Auto-Sync Duration)**:
  - Tự động nhận diện và hiển thị thời lượng của file MP4 tải lên.
  - Nút bấm 1 chạm tự động tính toán và điền thời lượng cho Slide cuối cùng khớp 100% với bài MP3 đang phát hoặc tổng thời lượng toàn bộ Playlist.
- **Các hiệu ứng chuyển cảnh mượt mà**:
  1. **Mờ dần chồng ảnh (Crossfade)**: Hòa quyện êm ái giữa 2 bức ảnh không bị giật.
  2. **Mờ qua nền tối (Fade In / Out)**: Chuyển êm ái qua sắc đen điện ảnh.
  3. **Trượt sang trái (Slide Left)**: Ảnh mới lướt từ phải sang trái.
  4. **Trượt sang phải (Slide Right)**: Ảnh mới lướt từ trái sang phải.
  5. **Trượt lên trên (Slide Up)**: Ảnh mới đẩy từ dưới lên trên.
  6. **Trượt xuống dưới (Slide Down)**: Ảnh mới đẩy từ trên xuống dưới.
  7. **Thu phóng vào trong (Zoom In)**: Đẩy thu phóng ảnh mới ra trước.
  8. **Thu nhỏ ra ngoài (Zoom Out)**: Thu nhỏ ảnh cũ để lộ ảnh mới.
- **Tùy chỉnh thời gian chuyển tiếp (Transition Duration)**: Tinh chỉnh tốc độ hòa trộn từ 0.2 giây đến 3.0 giây.

#### B. Chế Độ Dòng Thời Gian Phân Cảnh (Timeline Scenes Mode)
- Đặt các mốc thời gian cụ thể (theo giây) để tự động thay đổi:
  - Hình nền mới tương ứng với từng đoạn nhạc (Intro, Verse, Chorus, Drop, Outro).
  - Tự động đổi kiểu sóng âm Visualizer (ví dụ: Verse dùng sóng dải lụa mềm, Điệp khúc bùng nổ chuyển sang Ma trận 3D hoặc Laser EDM).
  - Tự động thay đổi bảng màu sắc sóng âm theo cao trào của bản nhạc.

---

### 8. 📝 Hộp Văn Bản Nhiều Lớp & Tạo Tracklist Tự Động (Multi-Layer TextBox & Smart Tracklist)
Công cụ dàn trang văn bản tự do, chuyên nghiệp cho video âm nhạc:

- **Thêm không giới hạn hộp chữ (Multiple Text Boxes)**: Tạo bao nhiêu hộp chữ tùy ý để ghi lời nhắn, lời chúc, danh sách bài hát, mạng xã hội, ngày tháng hoặc trích dẫn ý nghĩa.
- **Tự động tạo danh sách bài hát thông minh (Smart Tracklist Generator)**:
  - Đồng bộ 1 chạm với Danh sách phát nhạc (Audio Playlist).
  - **3 định dạng hiển thị thông dụng**:
    1. Số thứ tự + Tiêu đề + Thời lượng: `01. Tên Bài Hát (03:45)`
    2. Mốc thời gian phát: `00:00 - Tên Bài Hát`
    3. Tên bài hát kèm Ca sĩ trình bày: `01. Tên Bài Hát - Ca Sĩ`
- **Tùy biến vị trí & bố cục tự do**:
  - Tọa độ X (0% - 100%), Tọa độ Y (0% - 100%), độ rộng tối đa giới hạn (Max Width).
  - Căn chỉnh dòng: Căn lề Trái (Left), Căn Giữa (Center), Căn Lề Phải (Right).
- **Thứ tự lớp hiển thị (Layer Ordering)**:
  - Nằm sau sóng âm (Behind Wave)
  - Nằm trước sóng âm (In Front of Wave)
  - Nằm dưới hạt rơi (Below Particles)
  - Lớp trên cùng tuyệt đối (Topmost Overlay)
- **Tùy biến Typography & Hiệu ứng chữ phong phú**:
  - Hỗ trợ đầy đủ phông chữ tiếng Việt Unicode.
  - Cỡ chữ, độ đậm, in nghiêng, viết hoa, màu chữ và 7 hiệu ứng chữ nghệ thuật (Neon Glow, Double Stroke, 3D Shadow, Chrome, Comic Pop).
  - Khung nền hộp (Background Pill Box) với tùy chỉnh màu sắc, độ mờ đục và độ nhòe kính mờ (Frosted Blur).

---

### 9. 🎭 Hoạt Họa Lottie & Sticker Vector Phản Hồi Âm Nhạc (Lottie & DotLottie Engine)
Tích hợp trực tiếp công nghệ hoạt họa vector cao cấp hàng đầu thế giới:

- **Hỗ trợ đa định dạng vector**: Nhập trực tiếp tệp Lottie `.json` truyền thống và định dạng nén siêu nhẹ `.lottie` (dotLottie) mà không bị vỡ hạt hay giảm chất lượng khi phóng to.
- **Thư viện Sticker hoạt họa tuyển chọn sẵn**:
  - Đĩa DJ xoay tròn, Tai nghe rung nhịp, Mèo chill lofi, Ngôi sao nhấp nháy, Trái tim đập, Ngọn lửa âm nhạc, Dải sóng neon, v.v.
- **Nhập từ máy tính & URL trực tuyến**: Tải tệp từ thiết bị hoặc dán trực tiếp liên kết hoạt họa từ kho LottieFiles.
- **Phản hồi nhịp âm thanh (Audio-Reactive Bounce)**: Sticker tự động co giãn, phóng to và giật nảy đồng bộ tuyệt đối theo từng nhịp trống Bass / Beat Kick của bài hát.
- **Chế độ hòa trộn màu sắc (Blend Modes)**: Tích hợp các chế độ Screen, Add, Overlay, Multiply giúp sticker tan vào hình nền cực kỳ nghệ thuật.
- **Điều khiển kích thước & vị trí**: Tự do kéo chỉnh tọa độ X/Y, xoay góc, phóng to/thu nhỏ (Scale), độ trong suốt (Opacity) và tốc độ chuyển động (Playback Speed).

---

### 10. 🎚️ Bàn Trộn Âm Thanh Equalizer 10 Băng Tần (Studio Master Graphic EQ)
Bộ tinh chỉnh chất lượng âm thanh chuẩn phần cứng phòng thu chuyên nghiệp:

- **10 Băng tần cân bằng âm học**: Điều chỉnh chi tiết các dải tần số `31Hz`, `62Hz`, `125Hz`, `250Hz`, `500Hz`, `1kHz`, `2kHz`, `4kHz`, `8kHz`, `16kHz` với khoảng khuếch đại rộng từ `-12dB` đến `+12dB`.
- **Đồng hồ phân tích phổ thời gian thực (Real-time Spectrum Canvas)**: Đồ thị hiển thị trực quan các đỉnh sóng âm thanh phản hồi tức thì theo bài hát đang phát.
- **Bộ tiền khuếch đại (Preamp Gain)**: Tăng giảm âm lượng tổng thể an toàn chống vỡ tiếng (-12dB đến +12dB).
- **Tăng cường âm trầm sâu (Bass Boost Kick)**: Kích hoạt mạch tăng âm bass cho tiếng trống chắc khỏe, uy lực.
- **Bộ Presets âm thanh chuyên nghiệp cài sẵn**:
  - **Bass Boost**: Tăng cường âm trầm cho nhạc Remix, Vinahouse, EDM.
  - **EDM Club**: Đẩy mạnh dải trầm và dải cao cho không khí lễ hội.
  - **Rock Energy**: Tăng lực dải trung và âm cao cho tiếng guitar điện và trống rock.
  - **Vocal Clarity**: Nâng sáng dải âm trung giúp giọng hát ca sĩ trong trẻo, rõ nét.
  - **Acoustic Air**: Âm thanh mộc mạc, chi tiết, thoáng đãng cho nhạc cụ acoustic.
  - **Flat Studio**: Cân bằng tuyến tính chuẩn kiểm âm phòng thu.
- **Hệ thống Preset cá nhân**: Cho phép người dùng tự lưu các cấu hình EQ yêu thích, đặt tên, chỉnh sửa và tải lại bất cứ lúc nào.

---

### 11. 🎶 Danh Sách Phát Nhiều Bài Hát (Audio Playlist & Continuous Playback)
Không chỉ dừng lại ở việc làm video cho 1 bài đơn lẻ, Sona Wave Pro hỗ trợ danh sách phát hoàn chỉnh:

- **Hàng đợi phát nhạc liên tục (Audio Queue)**: Tải lên cùng lúc nhiều bài hát, hệ thống sẽ tự động phát nối tiếp từng bài mượt mà không bị ngắt quãng.
- **Quản lý siêu dữ liệu từng bài**: Đặt tên bài hát, nghệ sĩ và gán ảnh bìa riêng biệt cho từng bản nhạc trong danh sách phát.
- **Chế độ phát linh hoạt**: Phát tuần tự, lặp lại toàn bộ danh sách phát (Loop All), hoặc lặp lại một bài duy nhất (Loop One).
- **Liên kết với Thẻ bài hát & Tracklist**: Khi chuyển bài, thông tin trên Track Info Badge và Hộp văn bản danh sách phát sẽ tự động cập nhật đồng bộ tức thì.

---

### 12. 💾 Hệ Thống Quản Lý Dự Án, AutoSave & Tùy Chọn Cấu Hình Cho Máy Yếu (New Project & Low Hardware Defaults)
Bảo vệ tuyệt đối công sức sáng tạo của người dùng và tối ưu tài nguyên:

- **Tự động lưu dự phòng (AutoSave Engine - Có thể Bật/Tắt)**: Mọi thao tác chỉnh sửa sóng âm, lời bài hát, màu sắc, hình nền đều được tự động lưu vào bộ nhớ máy; dễ dàng bật hoặc tắt tính năng tự động lưu trong mục Cài Đặt (Global Settings) tùy theo nhu cầu làm việc.
- **Quản lý đa dự án (Projects Manager)**: Lưu lại nhiều video khác nhau với tên gọi riêng, dễ dàng chuyển đổi giữa các dự án đang làm dở chỉ trong 1 giây.
- **Sao lưu & Nhập dự án (Export/Import JSON)**: Xuất toàn bộ cấu hình dự án ra tệp tin JSON để lưu trữ lâu dài hoặc chia sẻ cho người khác cùng làm việc.
- **Thư viện mẫu dựng sẵn (Presets Modal)**: Lưu các bộ giao diện ưng ý thành mẫu (Template) và áp dụng nhanh cho các bài hát mới.
- **Tùy chọn cấu hình mặc định khi Tạo Mới (New Project Hardware Profile)**: Hộp thoại tạo mới dự án cung cấp bộ chọn cấu hình phần cứng ngay lập tức:
  - **⚡ Cấu hình Thấp / Tiết Kiệm (Mobile, PC VGA yếu, RAM thấp) [Mặc định & Khuyên dùng]**: Tự động kích hoạt *Chế độ Render Hiệu Năng Cao* (giảm 60% tải GPU fill), tắt các hiệu ứng phát sáng Bloom nặng, sử dụng 36 dải sóng tối ưu, chuyển cơ chế gia tốc sang *Eco CPU-Safe* để chống tràn RAM/VGA trên các thiết bị di động hoặc máy tính văn phòng.
  - **🚀 Cấu hình Tiêu Chuẩn / Đồ Họa Cao (PC Mạnh, Card VGA Rời)**: Chế độ chất lượng cao đầy đủ hiệu ứng Neon Bloom đa tầng, 48 dải sóng âm sắc nét, phục vụ máy tính có card đồ họa chuyên dụng.
- **Hộp thoại xác nhận nội bộ In-App (NewProjectModal)**: Thay thế hoàn toàn các hộp thoại mặc định của trình duyệt (`alert`, `confirm`) bằng Modal tùy biến mượt mà, hỗ trợ phím ESC, tương thích hoàn toàn môi trường iframe sandboxed.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime: -> https://nodejs.org/en/download/current
- 2GB free disk space for video processing

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/haystudio73/HAYStudio73_SonaWave.git
   cd HAYStudio73_SonaWave
   ```
2. **Update new features**
   ```bash
   cd HAYStudio73_SonaWave
   git pull origin main
   ```

3. **Install Dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   ```
   
   # Or using npm
   ```bash
   npm install
   ```

4. **Configure Environment Variables**
   No need ENV variable

5. **Start Development Server**
   ```bash
   bun run dev
   # The app will be available at http://localhost:3000
   ```
  # Or
  ```bash
   npm run dev
   # The app will be available at http://localhost:3000
  ```
## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern UI framework with latest features
- **TypeScript**: Type-safe JavaScript development
- **Vite 6**: Lightning-fast build tool and dev server
- **Tailwind CSS 4**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Motion**: Advanced animation library

### Backend & AI
- **Express.js**: Web server framework
- **Google Gemini API 2.4**: AI-powered features
- **Canvas Confetti**: Celebratory animations

### Development Tools
- **TSX**: TypeScript executor for Node.js
- **ESBuild**: Extremely fast JavaScript bundler
- **Autoprefixer**: CSS vendor prefix tool

## 📖 Usage Guide

### Creating a Video

1. **Upload Audio File**
   - Select an MP3 or WAV file from your device
   - The waveform will be analyzed and displayed

2. **Add Lyrics (Optional)**
   - Upload SRT or LRC subtitle file
   - Lyrics will be synchronized with the audio timeline
   - Preview timing before export

3. **Customize Visualization**
   - Choose from available visualizer effects
   - Select colors and animation speed
   - Pick a background or upload custom image

4. **Export Video**
   - Select output quality and dimensions
   - Choose export format (MP4)
   - Click export and download your video
  
And more ...

### Example: Creating a TikTok Video

```
1. Upload: "my_song.mp3"
2. Add Lyrics: "lyrics.srt"
3. Select: Waveform Bars effect
4. Background: Upload "my_background.jpg" / "my_clip.mp4"
5. Export: 1080x1920 quality HD
```

## 🎨 Customization

### Background Library
Access `assets/` directory to browse available backgrounds or add your own:
- Minimum resolution: 1080x1920
- Supported formats: JPG, PNG
- Maximum file size: 10MB

### Color Schemes
Modify color configurations in `src/components/` for different visualization themes:
- Primary wave color
- Secondary accent color
- Text/lyrics color
- Background overlay opacity

## 🔧 Build & Deployment

### Development
```bash
bun run dev
```

### Build for Production
```bash
bun run build
```

### Preview Build
```bash
bun run preview
```

### Clean Build Artifacts
```bash
bun run clean
```

### Type Checking
```bash
bun run lint
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: Audio file not recognized
- **Solution**: Ensure file is in MP3 or WAV format and not corrupted

**Issue**: Lyrics not syncing
- **Solution**: Verify SRT/LRC file format and timing values

**Issue**: Video export fails
- **Solution**: Check disk space (minimum 2GB), ensure audio duration < 15 minutes

**Issue**: High CPU usage
- **Solution**: Reduce visualizer complexity or lower export quality

## 📚 API Reference

### Audio Processing
- Waveform analysis and extraction
- Audio normalization
- Frequency analysis for visualizer synchronization

### Subtitle Handling
- SRT parser and converter
- LRC timing synchronization
- Subtitle rendering on video

### Video Export
- MP4 encoding with H.264 codec
- Custom resolution support
- Quality presets (SD, HD, Full HD)

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Contributing guidelines for new features

- When proposing a new feature, open an Issue describing the problem, proposed solution, and any UI/UX mockups.
- Link any related PRs or dependencies in the issue.
- Provide a short developer checklist in the PR description:
  - [ ] Add unit tests where applicable
  - [ ] Update README with usage examples
  - [ ] Add e2e test or manual verification steps
  - [ ] Document environment/configuration changes

How to test feature branches locally

1. Checkout the feature branch
   ```bash
   git checkout feature/your-feature
   bun install
   bun run dev
   ```
2. Use sample assets in `assets/` for local testing
3. For batch or CLI features, run `node ./scripts/batch-export.js --input ./samples --output ./exports`

## 📄 License

This project is open-source under the **MIT License** — provided as-is for personal and commercial use.

## 🙋 Author & Support

Created by **HAY Studio73**:
- **Facebook**: [https://www.facebook.com/HAY.Studio73](https://www.facebook.com/HAY.Studio73)
- **YouTube**: [https://www.youtube.com/@HAY.Studio73](https://www.youtube.com/@HAY.Studio73)

For issues, questions, or feature requests:
- Open an [Issue](https://github.com/haystudio73/HAYStudio73_SonaWave/issues) on GitHub
- Check existing [Discussions](https://github.com/haystudio73/HAYStudio73_SonaWave/discussions)

## 🎯 Roadmap & Completed Milestones

- [x] Real-time waveform preview & 60FPS canvas rendering
- [x] 18 Advanced 2D audio spectrum & visualizer styles with specialized private settings
- [x] 8 Real-time 3D WebGL scenes with Three.js & Post-Processing Bloom
- [x] Independent 2D and 3D positioning separation + Direct Canvas Drag & Drop overlays
- [x] Multi-layer Floating Particle Overlays (max 5 layers, 11 particle styles including Butterflies)
- [x] 13 Professional Color Grading LUT presets & film grain tools
- [x] 8 Cinematic Film Light & vintage 35mm burn optical leaks
- [x] Karaoke 2-line Duo mode, Minimal Glow 9:16 auto 2-line wrap, 3D shadow, In/Out FX & `.lyrics` Presets
- [x] Scene transitions & multi-slide timeline slideshow across entire playlist
- [x] Multi-layer text boxes with automated playlist tracklist generator
- [x] Audio-reactive Lottie & DotLottie vector animation engine
- [x] 10-band studio master graphic equalizer & custom preset manager
- [x] Multi-track audio playlist & continuous background player with smart single-track title handling
- [x] TikTok / Shorts MP4 export presets (15s, 30s, 60s, 90s, 120s, 180s)
- [x] Multi-project management, JSON backup, and local AutoSave recovery
- [x] Safe in-app confirmation dialogs, About (`?`) license/author modal & Bilingual EN/VI UI
- [ ] Cloud storage export integration (Google Drive / S3)
- [ ] Server-side batch processing CLI 

## 📊 Project Stats

- **Language**: TypeScript
- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Node Version**: 18+
- **Package Manager**: Bun or npm

## Buy me a coffee!!

❤️❤️❤️ Nếu bạn yêu thích mã nguồn này ❤️❤️❤️ HÃY MỜI TÔI 1 LY CAFE (Momo QR)!

<img width="390" height="422" alt="image" src="https://github.com/user-attachments/assets/ba0993b0-264f-4c49-9f05-d8fd3050902a" />

## Thanks, and good luck!
