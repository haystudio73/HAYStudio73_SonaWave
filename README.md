# 🎵 Sona Wave Pro - Trình Tạo Video Sóng Âm & Lyrics

A professional audio wave video generator with synchronized lyrics, diverse visualizer effects, and high-quality video export capabilities optimized for TikTok, YouTube Shorts, and Instagram Reels.

Link demo: <a href="https://hay-studio73-sona-wave.vercel.app/" target="_blank">https://hay-studio73-sona-wave.vercel.app/</a>

<img width="1914" height="892" alt="image" src="https://github.com/user-attachments/assets/2cf2be46-7b38-48ba-864d-4d6219e07591" />

## ✨ Features

### Core Functionality
- **Audio Wave Visualization**: Create stunning visual representations of audio waveforms
- **Lyrics Synchronization**: Support for SRT and LRC subtitle formats for precise lyric timing
- **Multiple Visualizer Effects**: Diverse animation styles to match different music genres and moods
- **Customizable Backgrounds**: Choose from a built-in library or upload custom background images
- **Professional Video Export**: High-quality MP4 output optimized for social media platforms
<img width="457" height="830" alt="tab1" src="https://github.com/user-attachments/assets/ccc6673b-5aaa-4cbb-9fc3-23f1fbeedde3" />

<img width="456" height="834" alt="tab2" src="https://github.com/user-attachments/assets/c8623d2b-30c6-499f-b07f-a817dbc58b3b" />

<img width="458" height="830" alt="tab3" src="https://github.com/user-attachments/assets/d18b9265-99e2-489f-9c4b-8b9edc02d70f" />

<img width="457" height="828" alt="tab4" src="https://github.com/user-attachments/assets/77b1dac1-245b-479c-857f-d6df59d5402b" />

<img width="456" height="828" alt="tab5" src="https://github.com/user-attachments/assets/7c8fde73-6ac8-4fbe-bd7b-8c2aef77d82d" />

### New & Upcoming Features
These are planned enhancements and newly introduced features to improve workflow, customization, and automation. If you'd like to help implement or test any of them, see the Contributing section below.

- **Real-time Waveform Preview** — Instant visual feedback while adjusting effects and lyrics timing.
- **Multiple Audio Track Support** — Mix and visualize multiple audio tracks in a single video (stem support).
- **Batch Processing & CLI** — Command-line batch export for processing multiple songs/videos automatically.
- **Cloud Export & Storage Integration** — Upload finished videos to S3-compatible storage or Google Drive automatically.
- **Plugin System & Visualizer Marketplace** — Allow third-party visualizers, transitions, and export plugins.
- **Advanced Color Grading Tools** — Per-effect color controls and LUT support for professional results.
- **Auto-Captioning (AI)** — Generate initial lyric timing suggestions from audio using the Gemini API (post-edit recommended).
- **Webhooks & Export Callbacks** — Configure callbacks to notify your service when an export finishes.
- **Template Presets** — Save and apply presets (dimensions, colors, effects) for consistent branding.
- **Undo/Redo & History** — Non-destructive editing with history states during a session.
- **Docker Image & Reproducible Exports** — Official Dockerfile for consistent server-side rendering environments.
- **Mobile App (Planned)** — Lightweight mobile companion for previewing and triggering exports remotely.

> Note: Items listed here marked as "Upcoming" may be in planning, in development, or available as experimental features. Check issues and PRs for current status.

### Supported Formats
- **Audio Input**: MP3, WAV files
- **Subtitle Formats**: SRT (SubRip), LRC (LyRiCs)
- **Background Input Formats**: JPG / PNG / MP4
- **Video Export**: MP4 with configurable quality and dimensions
- **Optimal Dimensions**: 
  - TikTok: 1080x1920 (9:16)
  - YouTube Shorts: 1080x1920 (9:16)
  - Instagram Reels: 1080x1920 (9:16)
  - 
<img width="526" height="518" alt="export" src="https://github.com/user-attachments/assets/e4484644-f8d4-42b3-8d44-d23903d05f49" />

### Visual Effects
- Dynamic waveform animations & 17 visualizer styles
- Customizable color schemes (Solid, Gradient 2/3, Rainbow, Neon)
- Background blur, overlay, beat zoom & glitch options
- 6 Lyric styles & advanced karaoke timing editor
- 8 Cinematic Film Light & burn effects
- 13 Professional Color Grading LUT presets
- 8 Track info badge styles with beat jumping dynamics
- And more ...

---

## 🎨 Danh Sách Hiệu Ứng & Tính Năng Chi Tiết

### 1. 🌊 Danh Sách Sóng Âm Hiện Có (Visualizer Waves)
Ứng dụng tích hợp **17 phong cách sóng âm** đa dạng từ cổ điển đến hiện đại 3D không gian:

1. **Spectrum Cột Hạt Rơi (`bars-peaks` - Spectrum Peak Drops)**: Thanh phổ âm equalizer kèm hạt đỉnh rơi vật lý siêu thực phong cách Winamp kinh điển. *(Hot)*
2. **Sóng Đối Xứng Hạt Đỉnh (`bars-mirrored-peaks` - Mirrored Peaks)**: Cột đối xứng 2 đầu kèm hạt rơi lơ lửng phía trên và dưới theo nhịp đập.
3. **Dải Phổ Gradient Mịn (`spectrum-line` - Smooth Area Curve)**: Đường cong sóng mềm mại phủ màu gradient với các đỉnh sáng phát quang mượt mà.
4. **Vòng Tròn Hạt Bay Tỏa (`radial-bars-peaks` - Radial Peak Orbit)**: Tia sóng xoay tròn 360° với hạt đỉnh bắn bung ra xung quanh theo nhịp Bass.
5. **Chuỗi Xoắn Kép DNA 3D (`dna-helix` - DNA Neon Helix)**: Hai dải xoắn kép đan xen kèm bậc thang tần số phát sáng 3D chuyển động đa chiều. *(Stunning 3D)*
6. **Đường Hầm Không Gian 3D (`tunnel-vortex` - Vortex Portal 3D)**: Cổng đa giác xoay vô cực chuyển động xoáy sâu theo dải tần âm trầm Sub-bass. *(3D Tunnel)*
7. **Tia Laser Sân Khấu EDM (`laser-beams` - EDM Concert Lasers)**: Dàn chùm tia laser quét góc rộng bùng nổ theo nhịp kick drum sân khấu lễ hội âm nhạc.
8. **Lõi Siêu Tân Tinh Tỏa Sáng (`starburst-core` - Starburst Nova Core)**: Vụ nổ hạt sao đa giác 360° với tâm phát quang năng lượng vũ trụ.
9. **Ma Trận EQ Khối Nổi (`audio-equalizer-grid` - Cyber EQ Matrix Grid)**: Lưới tầng bậc LED đa sắc màu xếp chồng phản ứng cực nhạy theo từng dải tần số.
10. **Sóng Cột Đối Xứng (`bars-mirrored` - Mirrored Bars)**: Thanh equalizer đối xứng trục giữa trên và dưới bắt mắt, cân đối.
11. **Cột Cổ Điển EQ (`bars` - Classic Bars)**: Equalizer truyền thống dạng cột đứng vươn từ dưới lên trên.
12. **Tia Tròn Tỏa Sáng (`circular-spikes` - Radial Spikes)**: Tia sóng xoay tròn quanh tâm đĩa phát sáng phong cách đĩa nhạc điện tử.
13. **Sóng Nước Mềm Mại (`smooth-wave` - Liquid Wave)**: Dạng sóng dao động chất lỏng mềm mại, êm ái thích hợp cho bản nhạc Lofi & Acoustic.
14. **Ma Trận LED Cyber (`cyber-matrix` - Cyber Matrix)**: Khối gạch LED kỹ thuật số nhảy theo từng quãng tần số âm thanh.
15. **Ngọn Lửa Plasma (`flame-spectrum` - Plasma Fire)**: Ngọn lửa âm nhạc rực cháy bốc cao theo nhịp kick drum và bass drop mạnh mẽ.
16. **Dải Ruy Băng Đôi (`double-ribbon` - Dual Ribbon)**: Hai dải neon sóng uốn lượn đan xen mềm mại và uyển chuyển.
17. **Chấm Tối Giản (`minimal-pulse` - Minimal Dots)**: Đường ngang ma trận chấm tần số tinh gọn dành cho người theo đuổi phong cách audiophile tối giản.

*Các tùy chỉnh chuyên sâu cho sóng âm*:
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

#### E. Hệ Thống Hạt Rơi Tương Tác Âm Nhạc (Audio-Reactive Particle System)
- **10 Dạng hạt độc đáo**:
  1. **Mưa Rơi Tự Nhiên (`rain`)**: Mô phỏng vật lý mưa rơi chân thực với 5 kiểu hạt (Hỗn hợp, Vệt dài Cinematic, Mưa phùn li ti, Mưa rào xối xả, Mưa phát sáng Neon), góc nghiêng gió, độ chao đảo và hiệu ứng giọt nước bắn tung tóe (Splash) khi chạm đáy.
  2. **Tuyết Rơi Mùa Đông (`snow`)**: 4 kiểu bông tuyết (Hỗn hợp tự nhiên, Tinh thể lục giác 6 cánh, Đốm mờ Bokeh lãng mạn, Kim cương băng lấp lánh) kèm tùy chỉnh hướng gió và tốc độ gió.
  3. **Đoạn Thẳng Rơi & Xoay 360° (`spinning-dashes`)**: Hot trend lofi chill bắt mắt.
  4. **Mưa Spaghetti Rơi (`spaghetti`)**: Sợi mì neon vàng óng rơi mềm mại độc lạ.
  5. **Tia Lửa Bốc Cháy (`sound-sparks`)**: Bốc cháy rực rỡ và nảy sáng theo nhịp beat.
  6. **Bong Bóng Cầu Vồng (`rainbow-bubbles`)**: Bong bóng ngũ sắc phản chiếu ánh sáng lấp lánh.
  7. **Tăng Tốc Hyperspace 3D (`hyperspace`)**: Hiệu ứng phi thuyền lao qua không gian với vận tốc ánh sáng.
  8. **Bụi Lofi Trôi (`dust`)**: Hạt bụi lơ lửng êm đềm phong cách vintage.
  9. **Sao Lấp Lánh (`stars`)**: Bầu trời ngàn sao lung linh.
  10. **Bong Bóng Nổi (`bubbles`)**: Bong bóng khí nổi bồng bềnh từ dưới lên.
- **Hình dạng hạt**: Hình tròn, Khối vuông, Ngôi sao, Trái tim, Kim cương, Vòng tròn khuyên.
- **Chế độ màu hạt**: Tùy chỉnh, Cầu vồng Gradient, Lửa rực Fire Glow, Neon Cyber, Phản hồi theo tần số âm thanh (Audio-Reactive).
- **Phản ứng Bass Flash Boost**: Hạt tự động bùng sáng rực rỡ và phóng to kích thước mỗi khi có tiếng trống trầm hoặc bass drop.

---

### 3. 🎤 Danh Sách Các Tính Năng Lyrics (Lời Bài Hát & Karaoke)

#### A. Định dạng hỗ trợ & Nhập liệu
- Hỗ trợ nhập file phụ đề tiêu chuẩn `.SRT`, file lời nhạc chạy thời gian `.LRC`, hoặc tự do soạn thảo / thêm / sửa từng câu trực tiếp trên giao diện trực quan.

#### B. 6 Kiểu hiển thị lời bài hát (Lyrics Styles)
1. **Karaoke 1 Dòng Nổi Bật (`karaoke-single`)**: Chỉ hiển thị 1 câu đang hát với hiệu ứng quét chữ mượt mà và hạt bay lượn (Tối ưu tuyệt đối cho video ngắn TikTok, YouTube Shorts, Facebook Reels).
2. **Karaoke 4 Dòng Tự Cuộn (`teleprompter-4lines`)**: 4 dòng chữ hiển thị liên tục, tự động cuộn mượt mà như máy nhắc chữ teleprompter chuyên nghiệp.
3. **Karaoke 3 Dòng Kinh Điển (`karaoke`)**: Dòng đang hát được phóng to nổi bật nhất ở giữa, dòng trước đó và dòng kế tiếp được làm mờ nhẹ tạo chiều sâu không gian.
4. **Thanh Phụ Đề Kính Mờ (`subtitle-bar`)**: Hộp kính mờ frosted glass tối giản, thanh lịch phong cách giao diện hiện đại.
5. **Phát Sáng Tối Giản (`minimal-glow`)**: Chữ sắc nét với hào quang neon tỏa nhẹ mà không có khung viền hộp gò bó.
6. **Hai Tông Màu Tương Phản (`duo-tone`)**: Phối màu tách đôi độc đáo giữa vế đầu và vế sau của câu hát.

#### C. 3 Hiệu ứng chuyển động quét chữ Karaoke (`karaokeSweepMode`)
1. **Chỉ Đổi Màu (`color-only`)**: Quét chuyển đổi màu chữ mượt mà chuẩn xác từ trái sang phải theo tiến độ câu hát.
2. **Sao Vàng Bay + Đổi Màu (`star-flying`)**: Ngôi sao vàng 5 cánh phát sáng bay lướt và nảy tưng tưng trên đầu từng chữ đang được hát.
3. **Quả Bóng Nhỏ Bay + Đổi Màu (`bouncing-ball`)**: Quả bóng tròn phát sáng 3D nảy bồng bềnh nhịp nhàng trên chữ theo phong cách karaoke vui nhộn.

#### D. Tính năng Chỉnh Thời Gian Quét Màu Karaoke Độc Lập (Karaoke Timing Editor)
- **Tách biệt hiển thị và quét màu**: Cho phép người dùng chỉnh thời gian quét màu karaoke độc lập với thời gian câu hiển thị trên màn hình (Ví dụ: Câu hiển thị từ `00:10.0` đến `00:14.8` [4.8 giây], nhưng ca sĩ hát xong lúc `00:12.8` [2.8 giây] thì chữ sẽ quét màu xong trong 2.8s và giữ nguyên trạng thái đổi màu đẹp mắt trên màn hình trong 2 giây còn lại cho đến khi chuyển câu).
- **Thanh trượt thời lượng Karaoke**: Kéo chỉnh thời lượng quét màu trực quan với tỷ lệ phần trăm hiển thị tức thì.
- **Phím tắt nhanh thời lượng**: Chọn nhanh các mức `-0.5s`, `-1.0s`, `-1.5s`, `-2.0s` hoặc khôi phục `100%`.
- **Nút gắn mốc phát hiện tại (`= Hiện tại`)**: Nhấn để gán ngay mốc thời gian bài hát đang chạy vào điểm kết thúc câu hát của ca sĩ.
- **Phím vi chỉnh siêu chính xác**: Tăng/giảm bước nhảy `±0.05s`, `±0.2s`, `±1.0s` cho cả thời gian bắt đầu và kết thúc.
- **Căn chỉnh hàng loạt (Batch Actions)**: Rút ngắn thời lượng karaoke cho tất cả câu hát (`-0.5s`, `-1.0s`) hoặc khôi phục đồng loạt chỉ với 1 click.
- **Huy hiệu trực quan**: Badge trạng thái hiển thị rõ ràng câu nào đã được chỉnh thời gian karaoke riêng.

#### E. Bộ công cụ xử lý lời bài hát thông minh
- **Tách câu tự động**: Phân tách nhanh các câu dài thành câu ngắn vừa vặn màn hình điện thoại dựa trên dấu phẩy (`,`) hoặc dấu chấm (`.`).
- **Tự động sửa chồng lấn thời gian (Auto-fix Overlaps)**: Quét và tự động triệt tiêu các khoảng thời gian bị lấn cấn giữa các câu liền kề.
- **Cảnh báo lỗi đảo thời gian**: Phát hiện và đánh dấu câu có thời gian bắt đầu lớn hơn thời gian kết thúc.
- **Sắp xếp theo mốc thời gian**: Tự động đưa các câu về đúng trật tự thời gian phát của bài hát.
- **Dịch chuyển mốc thời gian toàn bài (Shift Time)**: Tịnh tiến tiến hoặc lùi toàn bộ phụ đề bài hát với các bước `±0.5s`, `±1.0s`.
- **Tìm kiếm câu hát nhanh**: Ô tìm kiếm lọc câu hát theo từ khóa ngay lập tức.
- **Phát nhạc ngay từ câu đang chọn**: Nhấn nút phát để tua bài hát đến đúng vị trí câu cần nghe thử.
- **Quản lý câu linh hoạt**: Thêm câu mới, nhân bản câu (Duplicate), xóa câu hát.

#### F. Tùy biến kiểu chữ & Hiệu ứng chữ (Typography)
- Thư viện 20+ phông chữ tuyển chọn hỗ trợ tiếng Việt đầy đủ dấu.
- Tùy chỉnh cỡ chữ (Font Size), độ đậm (Font Weight: Normal, Medium, Bold, 900), chữ nghiêng (Italic), gạch chân (Underline), viết hoa toàn bộ (All Caps), khoảng cách chữ (Letter Spacing), căn lề (Trái, Giữa, Phải).
- **7 Hiệu ứng chữ (Font Effects)**:
  1. Chữ tiêu chuẩn sắc nét (`none`)
  2. Hào quang Laser Neon 2 lớp (`neon-glow`)
  3. Viền đôi nổi bật tương phản cao (`double-stroke`)
  4. Đổ bóng 3D chiều sâu khối (`3d-shadow`)
  5. Chuyển sắc Gradient đa màu (`gradient-fill`)
  6. Ánh kim loại Chrome tráng gương (`metallic-chrome`)
  7. Phong cách truyện tranh Comic viền đậm (`comic-pop`)
- **Tùy chỉnh màu sắc chi tiết**: Màu chữ chờ, màu chữ đang hát (Active Color), màu hào quang phát sáng (Glow Color & Intensity), màu viền nét chữ (Stroke Width/Color).
- **Hộp nền chữ (Background Pill)**: Bật/tắt hộp nền, chỉnh màu sắc, độ mờ đục (Opacity) và độ nhòe kính mờ (Pill Blur).

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
  - Đặt vị trí tùy ý (4 góc màn hình hoặc chính giữa tâm huy hiệu).
  - Tùy chỉnh kích thước (Scale), độ mờ (Opacity) và hiệu ứng vòng sáng Neon bao quanh Logo.

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

3. **Customize Visualization**n   - Choose from available visualizer effects
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

This project is provided as-is for personal and commercial use.

## 🙋 Support

For issues, questions, or feature requests:
- Open an [Issue](https://github.com/haystudio73/HAYStudio73_SonaWave/issues) on GitHub
- Check existing [Discussions](https://github.com/haystudio73/HAYStudio73_SonaWave/discussions)

## 🎯 Roadmap

- [x] Real-time waveform preview (experimental)
- [x] Advanced color grading tools (basic)
- [x] Video effect plugins
- [ ] Cloud storage integration
- [ ] Batch processing capability
- [x] Mobile UIX version support
- [x] Multi lang VI/EN 

## 📊 Project Stats

- **Language**: TypeScript
- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Node Version**: 18+
- **Package Manager**: Bun or npm

---

Made with ❤️ by HAYStudio73
