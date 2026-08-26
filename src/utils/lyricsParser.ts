import { LyricLine } from '../types';

/**
 * Parse time string to seconds
 * Formats: "00:01:23,456" (SRT), "00:01:23.456", "01:23.45" (LRC), "01:23"
 */
export function timeStringToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(',', '.');
  const parts = clean.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else {
    return parseFloat(clean) || 0;
  }
}

/**
 * Format seconds to SRT time format: 00:01:23,450
 */
export function secondsToSRTTime(seconds: number): string {
  const totalMs = Math.max(0, Math.floor(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

/**
 * Format seconds to standard mm:ss display
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Parse SRT Subtitle format
 */
export function parseSRT(srtContent: string): LyricLine[] {
  const lines = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const result: LyricLine[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // Check if line is index (number)
    if (/^\d+$/.test(line)) {
      i++;
      if (i >= lines.length) break;
      const timeLine = lines[i].trim();
      const match = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})/);
      
      if (match) {
        const startTime = timeStringToSeconds(match[1]);
        const endTime = timeStringToSeconds(match[2]);
        i++;

        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '' && !/^\d+$/.test(lines[i].trim())) {
          textLines.push(lines[i].trim());
          i++;
        }

        const text = textLines.join(' ').replace(/<[^>]*>/g, ''); // strip HTML tags
        if (text) {
          result.push({
            id: `srt_${result.length}_${Date.now()}`,
            startTime,
            endTime: endTime > startTime ? endTime : startTime + 4,
            text,
          });
        }
      } else {
        i++;
      }
    } else if (line.includes('-->')) {
      const match = line.match(/(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})/);
      if (match) {
        const startTime = timeStringToSeconds(match[1]);
        const endTime = timeStringToSeconds(match[2]);
        i++;
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i].trim());
          i++;
        }
        const text = textLines.join(' ').replace(/<[^>]*>/g, '');
        if (text) {
          result.push({
            id: `srt_${result.length}_${Date.now()}`,
            startTime,
            endTime: endTime > startTime ? endTime : startTime + 4,
            text,
          });
        }
      } else {
        i++;
      }
    } else {
      i++;
    }
  }

  return result.sort((a, b) => a.startTime - b.startTime);
}

/**
 * Parse LRC Lyrics format
 */
export function parseLRC(lrcContent: string): LyricLine[] {
  const lines = lrcContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const tempItems: { time: number; text: string }[] = [];

  const timeRegex = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]/g;

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const matches = Array.from(cleanLine.matchAll(timeRegex));
    if (matches.length > 0) {
      const text = cleanLine.replace(timeRegex, '').trim();
      for (const m of matches) {
        const time = timeStringToSeconds(m[1]);
        tempItems.push({ time, text });
      }
    }
  }

  tempItems.sort((a, b) => a.time - b.time);

  const result: LyricLine[] = [];
  for (let i = 0; i < tempItems.length; i++) {
    const cur = tempItems[i];
    if (!cur.text) continue;
    const next = tempItems[i + 1];
    const endTime = next ? next.time : cur.time + 4.5;
    result.push({
      id: `lrc_${i}_${Date.now()}`,
      startTime: cur.time,
      endTime: endTime > cur.time ? endTime : cur.time + 3.5,
      text: cur.text,
    });
  }

  return result;
}

/**
 * Automatically parse SRT or LRC or Plain text
 */
export function parseAnyLyrics(content: string, totalAudioDuration = 60): LyricLine[] {
  const trimmed = content.trim();
  if (trimmed.includes('-->')) {
    return parseSRT(trimmed);
  }
  if (/\[\d{1,2}:\d{2}/.test(trimmed)) {
    return parseLRC(trimmed);
  }

  // Fallback: Plain text - distribute lines across audio duration
  const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  const step = Math.max(2.5, totalAudioDuration / Math.max(lines.length, 1));
  return lines.map((text, idx) => ({
    id: `plain_${idx}_${Date.now()}`,
    startTime: idx * step,
    endTime: (idx + 1) * step,
    text,
  }));
}

/**
 * Export lyrics list back to SRT format
 */
export function exportToSRT(lyrics: LyricLine[]): string {
  return lyrics
    .map((item, index) => {
      const start = secondsToSRTTime(item.startTime);
      const end = secondsToSRTTime(item.endTime);
      return `${index + 1}\n${start} --> ${end}\n${item.text}\n`;
    })
    .join('\n');
}

/**
 * Get active lyric info with previous & next lines
 */
export function getActiveLyricInfo(lyrics: LyricLine[], currentTime: number) {
  let activeIndex = -1;

  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].startTime && currentTime <= lyrics[i].endTime) {
      activeIndex = i;
      break;
    }
  }

  // If between lines, find closest upcoming or past line
  if (activeIndex === -1 && lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime < lyrics[i].startTime) {
        // Just before this line
        if (i > 0 && currentTime - lyrics[i - 1].endTime < 1.5) {
          activeIndex = i - 1;
        }
        break;
      }
    }
  }

  const activeLine = activeIndex !== -1 ? lyrics[activeIndex] : null;
  const prevLine = activeIndex > 0 ? lyrics[activeIndex - 1] : null;
  const nextLine = activeIndex !== -1 && activeIndex < lyrics.length - 1 ? lyrics[activeIndex + 1] : null;

  // Calculate progress of current line (0 to 1)
  let lineProgress = 0;
  if (activeLine) {
    const duration = activeLine.endTime - activeLine.startTime;
    if (duration > 0) {
      lineProgress = Math.min(1, Math.max(0, (currentTime - activeLine.startTime) / duration));
    }
  }

  return {
    activeIndex,
    activeLine,
    prevLine,
    nextLine,
    lineProgress,
  };
}
