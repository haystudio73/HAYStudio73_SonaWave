# 🎵 Sona Wave Pro

English | [Tiếng Việt](./README.vi.md)

A professional audio wave video generator with synchronized lyrics, immersive visual effects, and high-quality export tools for TikTok, YouTube Shorts, and Instagram Reels.

Live demo: https://hay-studio73-sona-wave.vercel.app/

<img width="1914" height="892" alt="Sona Wave Pro preview" src="https://github.com/user-attachments/assets/2cf2be46-7b38-48ba-864d-4d6219e07591" />

## ✨ Features

### Core capabilities
- Real-time audio waveform visualization with 26 visualizer styles
- Lyrics support for SRT and LRC with independent karaoke timing controls
- 3D WebGL scenes powered by Three.js
- Multi-slide timeline and scene transitions
- Multi-layer text boxes and smart tracklist generation
- Audio-reactive Lottie and dotLottie sticker support
- 10-band studio EQ and live spectrum analyzer
- Multi-track audio playlist with continuous playback
- Custom backgrounds, gradients, and particle systems
- MP4 export in common social media aspect ratios and frame rates

### Highlights
- Ken Burns motion for each slide
- 2D visualizer rotation and auto-rotate
- Background beat zoom and glitch effects
- Audio-reactive particle systems
- 3D film light and cinematic color grading tools
- Track info badges and cover art layouts
- Multi-project autosave and JSON project backup

### Supported formats
- Audio: MP3, WAV, AAC, OGG
- Subtitles: SRT, LRC
- Backgrounds: JPG, PNG, WebP, MP4
- Vector animation: Lottie (.json), dotLottie (.lottie)
- Export: MP4 (H.264 / AAC)

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- 2GB free disk space for video processing

### Install

```bash
git clone https://github.com/haystudio73/HAYStudio73_SonaWave.git
cd HAYStudio73_SonaWave
```

Using Bun:

```bash
bun install
bun run dev
```

Using npm:

```bash
npm install
npm run dev
```

The app will be available at http://localhost:3000

## 🛠️ Tech stack

### Frontend
- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Lucide React
- Motion

### Backend & AI
- Express.js
- Google Gemini API 2.4
- Canvas Confetti

### Development tools
- TSX
- ESBuild
- Autoprefixer

## 📖 Usage guide

1. Upload an audio file
2. Add lyrics in SRT or LRC format (optional)
3. Choose a visualizer, background, and animation settings
4. Adjust timing, text, transitions, and branding
5. Export the final MP4 video

### Example: TikTok video

```text
1. Upload: my_song.mp3
2. Add Lyrics: lyrics.srt
3. Select: Waveform Bars effect
4. Background: my_background.jpg or my_clip.mp4
5. Export: 1080x1920 HD
```

## 🎨 Customization

### Background library
Access the `assets/` folder or upload your own images and video clips.

### Color schemes
Customize wave colors, accent colors, text styling, and overlay opacity in the app UI.

## 🔧 Build & deployment

### Development
```bash
bun run dev
```

### Production build
```bash
bun run build
```

### Preview build
```bash
bun run preview
```

### Clean artifacts
```bash
bun run clean
```

### Type checks / lint
```bash
bun run lint
```

## 🐛 Troubleshooting

**Audio file not recognized**
- Ensure the file is in MP3, WAV, AAC, or OGG format and is not corrupted.

**Lyrics not syncing**
- Check subtitle format and exact timing values in the SRT/LRC file.

**Video export fails**
- Ensure enough disk space and keep the audio duration within supported limits.

**High CPU usage**
- Reduce visual complexity or lower export quality.

## 🤝 Contributing

We welcome contributions.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

## 📄 License

This project is provided as-is for personal and commercial use.

## 🙋 Support

- Issues: https://github.com/haystudio73/HAYStudio73_SonaWave/issues
- Discussions: https://github.com/haystudio73/HAYStudio73_SonaWave/discussions

## 🌍 Language

English | [Tiếng Việt](./README.vi.md)

---

If you want the Vietnamese version, click [README.vi.md](./README.vi.md).
