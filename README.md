# 🎵 Sona Wave Pro - Trình Tạo Video Sóng Âm & Lyrics

A professional audio wave video generator with synchronized lyrics, diverse visualizer effects, and high-quality video export capabilities optimized for TikTok, YouTube Shorts, and Instagram Reels.

<img width="1920" height="896" alt="app1" src="https://github.com/user-attachments/assets/2c38e420-08e2-424f-8449-f07e194fa47e" />

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
- **Video Export**: MP4 with configurable quality and dimensions
- **Optimal Dimensions**: 
  - TikTok: 1080x1920 (9:16)
  - YouTube Shorts: 1080x1920 (9:16)
  - Instagram Reels: 1080x1920 (9:16)
  - 
<img width="526" height="518" alt="export" src="https://github.com/user-attachments/assets/e4484644-f8d4-42b3-8d44-d23903d05f49" />

### Visual Effects
- Dynamic waveform animations
- Customizable color schemes
- Background blur and overlay options
- Lyric highlighting and fade effects
- Multi-style visualizer modes (bars, wave, particles, etc.)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- Gemini API key (for AI-powered features)
- 2GB free disk space for video processing

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/haystudio73/HAYStudio73_SonaWave.git
   cd HAYStudio73_SonaWave
   ```

2. **Install Dependencies**
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

## 📁 Project Structure

```
HAYStudio73_SonaWave/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   ├── types.ts             # TypeScript type definitions
│   ├── components/          # Reusable React components
│   └── utils/               # Utility functions and helpers
├── assets/                  # Static assets (images, backgrounds)
├── index.html               # HTML template
├── package.json             # Project dependencies
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── metadata.json            # Project metadata
├── .env.example             # Environment variables template
└── README.md                # This file
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

### Example: Creating a TikTok Video

```
1. Upload: "my_song.mp3"
2. Add Lyrics: "lyrics.srt"
3. Select: Waveform Bars effect
4. Background: Upload "my_background.jpg"
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
