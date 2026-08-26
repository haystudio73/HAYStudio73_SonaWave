# 🎵 SonaWave - Trình Tạo Video Sóng Âm & Lyrics

A professional audio wave video generator with synchronized lyrics, diverse visualizer effects, and high-quality video export capabilities optimized for TikTok, YouTube Shorts, and Instagram Reels.<img width="1912" height="894" alt="interface 1" src="https://github.com/user-attachments/assets/71639b75-3318-4f7d-ac70-4d16739ef00a" />
<img width="440" height="832" alt="song am" src="https://github.com/user-attachments/assets/30f3cac1-b404-4aea-913d-623a1e4cf07c" />
<img width="435" height="838" alt="lyricstic" src="https://github.com/user-attachments/assets/ea7b00c3-d0a2-456b-9509-e2dd701571de" />
<img width="449" height="841" alt="bg" src="https://github.com/user-attachments/assets/1ca25bfe-6962-4486-a50e-46815ca99cb2" />
<img width="453" height="840" alt="style" src="https://github.com/user-attachments/assets/4e480081-fb2a-4125-9cbf-bf594139fb97" />
<img width="452" height="848" alt="textbox" src="https://github.com/user-attachments/assets/de7a7a7a-11a1-4078-af09-34e710fa68b3" />


## ✨ Features

### Core Functionality
- **Audio Wave Visualization**: Create stunning visual representations of audio waveforms
- **Lyrics Synchronization**: Support for SRT and LRC subtitle formats for precise lyric timing
- **Multiple Visualizer Effects**: Diverse animation styles to match different music genres and moods
- **Customizable Backgrounds**: Choose from a built-in library or upload custom background images
- **Professional Video Export**: High-quality MP4 output optimized for social media platforms

### Supported Formats
- **Audio Input**: MP3, WAV files
- **Subtitle Formats**: SRT (SubRip), LRC (LyRiCs)
- **Video Export**: MP4 with configurable quality and dimensions
- **Optimal Dimensions**: 
  - TikTok: 1080x1920 (9:16)
  - YouTube Shorts: 1080x1920 (9:16)
  - Instagram Reels: 1080x1920 (9:16)

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
   
   # Or using npm
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your configuration
   # GEMINI_API_KEY: Your Google Gemini API key (required)
   # APP_URL: The URL where the app is hosted
   ```

4. **Start Development Server**
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

3. **Customize Visualization**
   - Choose from available visualizer effects
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

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |
| `APP_URL` | Yes | Application hosting URL for callbacks |

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

## 📄 License

This project is provided as-is for personal and commercial use.

## 🙋 Support

For issues, questions, or feature requests:
- Open an [Issue](https://github.com/haystudio73/HAYStudio73_SonaWave/issues) on GitHub
- Check existing [Discussions](https://github.com/haystudio73/HAYStudio73_SonaWave/discussions)

## 🎯 Roadmap

- [ ] Real-time waveform preview
- [ ] Multiple audio track support
- [ ] Advanced color grading tools
- [ ] Video effect plugins
- [ ] Cloud storage integration
- [ ] Batch processing capability
- [ ] Mobile app version

## 📊 Project Stats

- **Language**: TypeScript
- **Frontend Framework**: React 19
- **Build Tool**: Vite 6
- **Node Version**: 18+
- **Package Manager**: Bun or npm

---

Made with ❤️ by HAYStudio73
