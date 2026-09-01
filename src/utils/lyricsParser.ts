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
 * Format seconds to mm:ss.d with 1 decimal place (e.g. 01:23.4)
 */
export function formatTimeSub(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const totalTenths = Math.max(0, Math.floor(seconds * 10));
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`;
}

export interface LyricTimingIssue {
  lineId: string;
  type: 'overlap' | 'inverted' | 'gap';
  message: string;
  diffSeconds: number;
}

/**
 * Validate timing across all lyric lines
 */
export function validateLyricsTimings(lyrics: LyricLine[]): {
  hasIssues: boolean;
  overlapCount: number;
  errorCount: number;
  issueMap: Record<string, LyricTimingIssue>;
} {
  const issueMap: Record<string, LyricTimingIssue> = {};
  let overlapCount = 0;
  let errorCount = 0;

  for (let i = 0; i < lyrics.length; i++) {
    const cur = lyrics[i];

    // 1. Inverted time check: Start >= End
    if (cur.startTime >= cur.endTime) {
      issueMap[cur.id] = {
        lineId: cur.id,
        type: 'inverted',
        message: 'Lỗi: Time End phải lớn hơn Time Start',
        diffSeconds: cur.startTime - cur.endTime,
      };
      errorCount++;
      continue;
    }

    // 2. Overlap with previous line
    if (i > 0) {
      const prev = lyrics[i - 1];
      if (cur.startTime < prev.endTime) {
        const overlap = prev.endTime - cur.startTime;
        issueMap[cur.id] = {
          lineId: cur.id,
          type: 'overlap',
          message: `Chồng lấn ${overlap.toFixed(1)}s với câu trước (#${i})`,
          diffSeconds: overlap,
        };
        overlapCount++;
      }
    }
  }

  return {
    hasIssues: overlapCount > 0 || errorCount > 0,
    overlapCount,
    errorCount,
    issueMap,
  };
}

/**
 * Auto-fix all timing overlaps and inverted durations
 */
export function autoFixLyricsOverlaps(lyrics: LyricLine[], bufferSeconds = 0.05): LyricLine[] {
  if (!lyrics || lyrics.length === 0) return [];

  // Sort by startTime
  const sorted = [...lyrics].sort((a, b) => a.startTime - b.startTime);
  const result: LyricLine[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const cur = { ...sorted[i] };
    const prev = i > 0 ? result[i - 1] : null;

    // Fix inverted duration if invalid
    if (cur.endTime <= cur.startTime) {
      cur.endTime = cur.startTime + 3.0;
    }

    // Fix overlap with previous line
    if (prev && cur.startTime < prev.endTime) {
      // Adjust previous line's endTime to end just before this line
      const adjustedPrevEnd = Math.max(prev.startTime + 0.5, cur.startTime - bufferSeconds);
      prev.endTime = adjustedPrevEnd;

      // If current still starts before prev.endTime, push current start
      if (cur.startTime < prev.endTime) {
        cur.startTime = prev.endTime + bufferSeconds;
        if (cur.endTime <= cur.startTime) {
          cur.endTime = cur.startTime + 2.5;
        }
      }
    }

    result.push(cur);
  }

  return result;
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
 * Get active lyric info with previous & next lines and 4-line window
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
  const prevLine2 = activeIndex > 1 ? lyrics[activeIndex - 2] : null;
  const nextLine = activeIndex !== -1 && activeIndex < lyrics.length - 1 ? lyrics[activeIndex + 1] : null;
  const nextLine2 = activeIndex !== -1 && activeIndex < lyrics.length - 2 ? lyrics[activeIndex + 2] : null;
  const nextLine3 = activeIndex !== -1 && activeIndex < lyrics.length - 3 ? lyrics[activeIndex + 3] : null;

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
    prevLine2,
    prevLine,
    nextLine,
    nextLine2,
    nextLine3,
    lineProgress,
  };
}
