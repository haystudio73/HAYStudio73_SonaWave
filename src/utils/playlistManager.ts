import { AudioTrackItem, PlaylistConfig, PlaylistRepeatMode, TracklistTextFormat } from '../types';
import { formatTime, parseAnyLyrics } from './lyricsParser';
import { SAMPLE_SRT_SYNTHWAVE, SAMPLE_SRT_LOFI, SAMPLE_SRT_ACOUSTIC } from './presets';

export const DEFAULT_PLAYLIST_CONFIG: PlaylistConfig = {
  tracks: [
    {
      id: 'track-default-1',
      title: 'Neon Synthwave Dream',
      artist: 'SonaWave Master Studio',
      fileName: 'Neon_Synthwave_Demo.wav',
      url: '',
      duration: 30,
      fadeInSec: 1.5,
      fadeOutSec: 2.0,
      volume: 1.0,
      bpm: 120,
      lyrics: parseAnyLyrics(SAMPLE_SRT_SYNTHWAVE, 30),
      rawLyrics: SAMPLE_SRT_SYNTHWAVE,
      lyricsFileName: 'Neon_Synthwave_Lyrics.srt',
    },
    {
      id: 'track-default-2',
      title: 'Midnight Lo-Fi Chill',
      artist: 'SonaWave Master Studio',
      fileName: 'Midnight_Lofi_Beat.wav',
      url: '',
      duration: 30,
      fadeInSec: 1.5,
      fadeOutSec: 2.0,
      volume: 1.0,
      bpm: 85,
      lyrics: parseAnyLyrics(SAMPLE_SRT_LOFI, 30),
      rawLyrics: SAMPLE_SRT_LOFI,
      lyricsFileName: 'Midnight_Lofi_Lyrics.srt',
    },
    {
      id: 'track-default-3',
      title: 'Acoustic Sunset Romance',
      artist: 'Golden Melodies Live',
      fileName: 'Acoustic_Sunset_Romance.wav',
      url: '',
      duration: 30,
      fadeInSec: 1.5,
      fadeOutSec: 2.0,
      volume: 1.0,
      bpm: 95,
      lyrics: parseAnyLyrics(SAMPLE_SRT_ACOUSTIC, 30),
      rawLyrics: SAMPLE_SRT_ACOUSTIC,
      lyricsFileName: 'Acoustic_Sunset_Lyrics.srt',
    },
  ],
  currentIndex: 0,
  repeatMode: 'repeat-all',
  crossfadeDuration: 2.0,
  autoPlayNext: true,
  enableFadeInOut: true,
  defaultFadeInSec: 1.5,
  defaultFadeOutSec: 2.0,
};

const STORAGE_KEY = 'sonawave_playlist_config_v1';

/**
 * Calculates current gain multiplier (0.0 to 1.0) based on fade-in and fade-out envelope
 */
export function calculateFadeMultiplier(
  currentTime: number,
  duration: number,
  fadeInSec: number,
  fadeOutSec: number,
  enabled: boolean = true
): number {
  if (!enabled || duration <= 0) return 1.0;

  // Safe clamping for ultra short audio files
  const effectiveFadeIn = Math.min(fadeInSec, duration * 0.45);
  const effectiveFadeOut = Math.min(fadeOutSec, duration * 0.45);

  let multiplier = 1.0;

  // 1. Fade-in envelope
  if (effectiveFadeIn > 0 && currentTime < effectiveFadeIn) {
    multiplier = Math.min(1.0, Math.max(0.0, currentTime / effectiveFadeIn));
  }
  // 2. Fade-out envelope
  else if (effectiveFadeOut > 0 && currentTime > duration - effectiveFadeOut) {
    const remaining = Math.max(0.0, duration - currentTime);
    multiplier = Math.min(1.0, Math.max(0.0, remaining / effectiveFadeOut));
  }

  return multiplier;
}

/**
 * Ensures all audio track items in an array have unique, non-empty, collision-free IDs.
 */
export function ensureUniqueTrackIds(tracks: AudioTrackItem[]): AudioTrackItem[] {
  if (!Array.isArray(tracks)) return [];
  const seenIds = new Set<string>();
  return tracks.map((track, idx) => {
    let rawId = (track && typeof track.id === 'string' && track.id.trim().length > 0)
      ? track.id.trim()
      : `track-${idx + 1}`;

    // If id has already been encountered in this tracklist, generate an unambiguous unique id
    if (seenIds.has(rawId)) {
      rawId = `${rawId}-${idx + 1}-${Math.random().toString(36).slice(2, 6)}`;
    }
    seenIds.add(rawId);
    return {
      ...track,
      id: rawId,
    };
  });
}

/**
 * Loads saved playlist configuration from localStorage
 */
export function getSavedPlaylist(): PlaylistConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tracks) && parsed.tracks.length > 0) {
        const sanitizedTracks = ensureUniqueTrackIds(parsed.tracks);
        return {
          ...DEFAULT_PLAYLIST_CONFIG,
          ...parsed,
          tracks: sanitizedTracks,
          // Guarantee currentIndex is valid
          currentIndex: Math.max(0, Math.min(parsed.currentIndex || 0, sanitizedTracks.length - 1)),
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved playlist:', e);
  }
  return {
    ...DEFAULT_PLAYLIST_CONFIG,
    tracks: ensureUniqueTrackIds(DEFAULT_PLAYLIST_CONFIG.tracks),
  };
}

/**
 * Saves playlist configuration into localStorage (excluding large blobs/files to save quota)
 */
export function savePlaylist(config: PlaylistConfig): void {
  try {
    const uniqueTracks = ensureUniqueTrackIds(config.tracks);
    const lightweightTracks = uniqueTracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      fileName: t.fileName,
      url: t.url && t.url.startsWith('blob:') ? '' : (t.url || ''),
      duration: t.duration,
      fadeInSec: t.fadeInSec,
      fadeOutSec: t.fadeOutSec,
      volume: t.volume,
      bpm: t.bpm,
      coverUrl: t.coverUrl,
      background: t.background,
      lyrics: t.lyrics,
      rawLyrics: t.rawLyrics,
      lyricsFileName: t.lyricsFileName,
    }));

    const toStore: PlaylistConfig = {
      ...config,
      tracks: lightweightTracks,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.warn('Failed to save playlist to localStorage:', e);
  }
}

/**
 * Intelligently matches a batch of uploaded lyrics files (.lrc, .srt, .txt)
 * to playlist audio tracks based on filename, title, or sequential queue.
 */
export function matchLyricsFilesToTracks(
  tracks: AudioTrackItem[],
  lyricsFiles: { name: string; content: string }[]
): { updatedTracks: AudioTrackItem[]; matchedCount: number } {
  let matchedCount = 0;
  const usedFileIndices = new Set<number>();

  const normalize = (str: string) =>
    str.toLowerCase().replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/g, '');

  const updatedTracks = tracks.map((track) => {
    const trackNormName = normalize(track.fileName || track.title || '');
    const trackNormTitle = normalize(track.title || '');

    // 1. Try finding best match by name
    let foundIdx = -1;
    for (let i = 0; i < lyricsFiles.length; i++) {
      if (usedFileIndices.has(i)) continue;
      const fileNorm = normalize(lyricsFiles[i].name);
      if (
        fileNorm === trackNormName ||
        fileNorm === trackNormTitle ||
        (trackNormTitle.length > 3 && fileNorm.includes(trackNormTitle)) ||
        (fileNorm.length > 3 && trackNormTitle.includes(fileNorm))
      ) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== -1) {
      usedFileIndices.add(foundIdx);
      matchedCount++;
      const matched = lyricsFiles[foundIdx];
      const parsed = parseAnyLyrics(matched.content, track.duration || 60);
      return {
        ...track,
        lyrics: parsed,
        rawLyrics: matched.content,
        lyricsFileName: matched.name,
      };
    }

    return track;
  });

  // 2. Sequential fallback for any unmatched lyric files to tracks that still lack lyrics
  for (let i = 0; i < lyricsFiles.length; i++) {
    if (usedFileIndices.has(i)) continue;
    const emptyTrackIdx = updatedTracks.findIndex((t) => !t.lyrics || t.lyrics.length === 0);
    if (emptyTrackIdx !== -1) {
      usedFileIndices.add(i);
      matchedCount++;
      const matched = lyricsFiles[i];
      const target = updatedTracks[emptyTrackIdx];
      const parsed = parseAnyLyrics(matched.content, target.duration || 60);
      updatedTracks[emptyTrackIdx] = {
        ...target,
        lyrics: parsed,
        rawLyrics: matched.content,
        lyricsFileName: matched.name,
      };
    }
  }

  return { updatedTracks, matchedCount };
}

/**
 * Extracts audio metadata (duration, title, artist) from an uploaded File or Blob
 */
export function extractAudioMetadata(file: File): Promise<{
  duration: number;
  title: string;
  artist: string;
}> {
  return new Promise((resolve) => {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    let artist = 'Unknown Artist';
    let title = cleanName;

    const parts = cleanName.split('-');
    if (parts.length > 1) {
      artist = parts[0].trim();
      title = parts.slice(1).join('-').trim();
    }

    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const dur = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) ? audio.duration : 30;
      cleanup();
      resolve({
        duration: dur,
        title,
        artist,
      });
    };

    const onError = () => {
      cleanup();
      resolve({
        duration: 30,
        title,
        artist,
      });
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.load();

    // Fallback timeout in case browser never fires loadedmetadata
    setTimeout(() => {
      cleanup();
      resolve({
        duration: 30,
        title,
        artist,
      });
    }, 2500);
  });
}

/**
 * Re-orders array by moving item from fromIndex to toIndex
 */
export function reorderTracks(
  tracks: AudioTrackItem[],
  fromIndex: number,
  toIndex: number
): AudioTrackItem[] {
  if (fromIndex < 0 || fromIndex >= tracks.length || toIndex < 0 || toIndex >= tracks.length) {
    return tracks;
  }
  const result = [...tracks];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Shuffles track list, keeping track of active item's new position
 */
export function shuffleTracks(
  tracks: AudioTrackItem[],
  currentIndex: number
): { tracks: AudioTrackItem[]; newIndex: number } {
  if (tracks.length <= 1) return { tracks, newIndex: currentIndex };

  const activeId = tracks[currentIndex]?.id;
  const copy = [...tracks];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  const newIndex = activeId ? copy.findIndex((t) => t.id === activeId) : 0;
  return {
    tracks: copy,
    newIndex: newIndex !== -1 ? newIndex : 0,
  };
}

/**
 * Reverses track list order, adjusting current index
 */
export function reverseTracks(
  tracks: AudioTrackItem[],
  currentIndex: number
): { tracks: AudioTrackItem[]; newIndex: number } {
  if (tracks.length <= 1) return { tracks, newIndex: currentIndex };
  const activeId = tracks[currentIndex]?.id;
  const copy = [...tracks].reverse();
  const newIndex = activeId ? copy.findIndex((t) => t.id === activeId) : 0;
  return {
    tracks: copy,
    newIndex: newIndex !== -1 ? newIndex : 0,
  };
}

/**
 * Generates formatted text from audio playlist tracklist info (time and title)
 */
export function generateTracklistContent(
  tracks: AudioTrackItem[],
  format: TracklistTextFormat = 'title-duration',
  options?: {
    includeHeader?: boolean;
    headerTitle?: string;
    currentIndex?: number;
    highlightCurrent?: boolean;
  }
): string {
  if (!tracks || tracks.length === 0) {
    return '🎵 Tracklist (Empty)';
  }

  const lines: string[] = [];
  if (options?.includeHeader) {
    const header = options.headerTitle || '🎵 TRACKLIST';
    lines.push(header);
    lines.push('────────────────────────');
  }

  let cumulativeSeconds = 0;

  tracks.forEach((track, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const title = (track.title || track.fileName || `Track ${idx + 1}`).trim();
    const artist = (track.artist || '').trim();
    const durStr = formatTime(track.duration || 0);
    const timeStampStr = formatTime(cumulativeSeconds);
    const isPlaying = options?.highlightCurrent && options?.currentIndex === idx;
    const prefix = isPlaying ? '▶ ' : (options?.highlightCurrent ? '   ' : '');

    let lineText = '';
    switch (format) {
      case 'timestamp-title':
        lineText = `${prefix}${timeStampStr} - ${title}${artist ? ` (${artist})` : ''}`;
        break;
      case 'duration-title':
        lineText = `${prefix}${num}. [${durStr}] ${title}`;
        break;
      case 'title-artist-duration':
        lineText = `${prefix}${num}. ${title}${artist ? ` - ${artist}` : ''} (${durStr})`;
        break;
      case 'compact-bullet':
        lineText = `${prefix}${idx + 1}. ${title} • ${durStr}`;
        break;
      case 'title-duration':
      default:
        lineText = `${prefix}${num}. ${title} (${durStr})`;
        break;
    }

    lines.push(lineText);
    cumulativeSeconds += (track.duration || 0);
  });

  return lines.join('\n');
}
