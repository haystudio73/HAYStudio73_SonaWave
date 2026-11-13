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

    // Clamp karaoke timing if present
    if (cur.karaokeEndTime !== undefined && cur.karaokeEndTime > cur.endTime) {
      cur.karaokeEndTime = cur.endTime;
    }
    if (cur.karaokeStartTime !== undefined && cur.karaokeStartTime < cur.startTime) {
      cur.karaokeStartTime = cur.startTime;
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
    const gap = next ? next.time - cur.time : 4.5;
    // Smarter end time calculation: if there's a long gap (e.g. guitar solo / interlude), cap duration
    const calculatedEnd = next ? (gap > 7.0 ? cur.time + Math.min(6.0, gap * 0.75) : next.time) : cur.time + 4.5;
    const endTime = calculatedEnd > cur.time ? calculatedEnd : cur.time + 3.5;
    result.push({
      id: `lrc_${i}_${Date.now()}`,
      startTime: cur.time,
      endTime,
      text: cur.text,
      karaokeStartTime: cur.time,
      karaokeEndTime: endTime,
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
    const kStart = activeLine.karaokeStartTime !== undefined ? activeLine.karaokeStartTime : activeLine.startTime;
    const kEnd = activeLine.karaokeEndTime !== undefined ? activeLine.karaokeEndTime : activeLine.endTime;
    const kDuration = kEnd - kStart;
    if (kDuration > 0) {
      if (currentTime < kStart) {
        lineProgress = 0;
      } else if (currentTime >= kEnd) {
        lineProgress = 1;
      } else {
        lineProgress = Math.min(1, Math.max(0, (currentTime - kStart) / kDuration));
      }
    } else {
      lineProgress = currentTime >= kStart ? 1 : 0;
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

/**
 * Tách một câu lời bài hát thành các phân đoạn nhỏ dựa trên ký tự ngăn cách (mặc định là dấu phẩy ',' hoặc chấm '.')
 * Tự động phân bổ thời lượng (Start Time, End Time) tỷ lệ thuận theo độ dài số ký tự của từng đoạn.
 */
export function splitLyricLineByChars(
  line: LyricLine, 
  delimiters: string[] = [',', '.']
): LyricLine[] {
  if (!line || !line.text) return line ? [line] : [];

  const escaped = delimiters.map((d) => (d === '.' ? '\\.' : d === ',' ? '\\,' : '\\' + d)).join('');
  const regex = new RegExp(`[${escaped}]`);

  if (!regex.test(line.text)) {
    return [line];
  }

  // Tách câu theo dấu ngăn cách
  const splitRegex = new RegExp(`[${escaped}]+`);
  const rawSegments = line.text.split(splitRegex);
  const segments = rawSegments.map((s) => s.trim()).filter((s) => s.length > 0);

  if (segments.length <= 1) {
    return [line];
  }

  const totalDuration = Math.max(0.4, line.endTime - line.startTime);
  const totalChars = segments.reduce((sum, s) => sum + s.length, 0);

  const hasKaraoke = line.karaokeEndTime !== undefined || line.karaokeStartTime !== undefined;
  const kStart = line.karaokeStartTime !== undefined ? line.karaokeStartTime : line.startTime;
  const kEnd = line.karaokeEndTime !== undefined ? line.karaokeEndTime : line.endTime;
  const totalKDuration = Math.max(0.2, kEnd - kStart);

  const result: LyricLine[] = [];
  let currentStart = line.startTime;
  let currentKStart = kStart;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const fraction = totalChars > 0 ? seg.length / totalChars : 1 / segments.length;
    const isLast = i === segments.length - 1;
    const segDuration = isLast 
      ? Math.max(0.2, line.endTime - currentStart) 
      : Math.max(0.2, totalDuration * fraction);
    const segEnd = isLast ? Math.max(currentStart + 0.2, line.endTime) : currentStart + segDuration;

    let segKStartOut: number | undefined;
    let segKEndOut: number | undefined;
    if (hasKaraoke) {
      const segKDuration = isLast 
        ? Math.max(0.2, kEnd - currentKStart) 
        : Math.max(0.2, totalKDuration * fraction);
      const segKEnd = isLast ? Math.max(currentKStart + 0.2, kEnd) : currentKStart + segKDuration;
      segKStartOut = Math.round(currentKStart * 1000) / 1000;
      segKEndOut = Math.round(segKEnd * 1000) / 1000;
      currentKStart = segKEnd;
    }

    result.push({
      id: `${line.id}_split_${i}_${Date.now()}`,
      startTime: Math.round(currentStart * 1000) / 1000,
      endTime: Math.round(segEnd * 1000) / 1000,
      text: seg,
      ...(hasKaraoke && segKStartOut !== undefined && segKEndOut !== undefined ? {
        karaokeStartTime: segKStartOut,
        karaokeEndTime: segKEndOut,
      } : {}),
    });

    currentStart = segEnd;
  }

  return result;
}

/**
 * Tách toàn bộ danh sách câu lời bài hát theo các ký tự ngăn cách đã chọn (ví dụ: [',', '.'])
 */
export function splitAllLyricsByChars(
  lyrics: LyricLine[], 
  delimiters: string[] = [',', '.']
): LyricLine[] {
  if (!lyrics || lyrics.length === 0) return [];
  const result: LyricLine[] = [];
  for (const line of lyrics) {
    const splitLines = splitLyricLineByChars(line, delimiters);
    result.push(...splitLines);
  }
  return result;
}

/**
 * Tự động chuyển đổi timing danh sách câu sang định dạng Karaoke 2 dòng:
 * - 2 dòng hiển thị đồng thời (cover text) để người hát chuẩn bị sẵn.
 * - Giữ nguyên mốc timing gốc (originalStartTime/originalEndTime) để phục hồi khi chuyển về 1/3/4 dòng.
 * - KaraokeStartTime/KaraokeEndTime giữ nguyên thời gian quét chữ chính xác của từng câu.
 */
export function convertLyricsTo2LineKaraokeTiming(lyrics: LyricLine[]): LyricLine[] {
  if (!lyrics || lyrics.length === 0) return [];

  // Sort by original start time
  const sorted = [...lyrics].sort((a, b) => {
    const aStart = a.originalStartTime !== undefined ? a.originalStartTime : a.startTime;
    const bStart = b.originalStartTime !== undefined ? b.originalStartTime : b.startTime;
    return aStart - bStart;
  });

  const n = sorted.length;
  if (n === 1) {
    const l = sorted[0];
    const oStart = l.originalStartTime !== undefined ? l.originalStartTime : l.startTime;
    const oEnd = l.originalEndTime !== undefined ? l.originalEndTime : l.endTime;
    const oKStart = l.originalKaraokeStartTime !== undefined ? l.originalKaraokeStartTime : (l.karaokeStartTime ?? oStart);
    const oKEnd = l.originalKaraokeEndTime !== undefined ? l.originalKaraokeEndTime : (l.karaokeEndTime ?? oEnd);
    return [{
      ...l,
      originalStartTime: oStart,
      originalEndTime: oEnd,
      originalKaraokeStartTime: oKStart,
      originalKaraokeEndTime: oKEnd,
    }];
  }

  const result: LyricLine[] = [];

  for (let i = 0; i < n; i++) {
    const cur = sorted[i];

    // Backup original timing if not already stored
    const origStart = cur.originalStartTime !== undefined ? cur.originalStartTime : cur.startTime;
    const origEnd = cur.originalEndTime !== undefined ? cur.originalEndTime : cur.endTime;
    const origKStart = cur.originalKaraokeStartTime !== undefined 
      ? cur.originalKaraokeStartTime 
      : (cur.karaokeStartTime !== undefined ? cur.karaokeStartTime : origStart);
    const origKEnd = cur.originalKaraokeEndTime !== undefined 
      ? cur.originalKaraokeEndTime 
      : (cur.karaokeEndTime !== undefined ? cur.karaokeEndTime : origEnd);

    let newStart = origStart;
    let newEnd = origEnd;

    if (i === 0) {
      // Dòng 0 (Hàng 1 - Even):
      // Bắt đầu hiển thị từ mốc bắt đầu bài hát
      // Kéo dài hiển thị đến khi Dòng 1 bắt đầu hát hoặc kết thúc (để Dòng 2 thế chỗ)
      const line1Start = sorted[1].originalStartTime !== undefined ? sorted[1].originalStartTime : sorted[1].startTime;
      newEnd = Math.max(origEnd, line1Start);
    } else if (i === 1) {
      // Dòng 1 (Hàng 2 - Odd):
      // QUAN TRỌNG: Hiển thị NGAY TỪ ĐẦU cùng với Dòng 0 (cover text chờ hát)
      const line0Start = sorted[0].originalStartTime !== undefined ? sorted[0].originalStartTime : sorted[0].startTime;
      newStart = line0Start;

      // Kéo dài đến khi Dòng 2 bắt đầu hát (để Dòng 3 thế chỗ)
      if (n > 2) {
        const line2Start = sorted[2].originalStartTime !== undefined ? sorted[2].originalStartTime : sorted[2].startTime;
        newEnd = Math.max(origEnd, line2Start);
      } else {
        newEnd = Math.max(origEnd, origStart + 4);
      }
    } else {
      // Dòng i >= 2:
      // Xuất hiện ngay khi dòng liền trước (i-1) trên hàng đối diện bắt đầu hát
      const prevStart = sorted[i - 1].originalStartTime !== undefined ? sorted[i - 1].originalStartTime : sorted[i - 1].startTime;
      const prevEnd = sorted[i - 1].originalEndTime !== undefined ? sorted[i - 1].originalEndTime : sorted[i - 1].endTime;
      const gap = origStart - prevEnd;

      if (gap > 6) {
        // Nếu có đoạn dạo nhạc dài > 6s, cho câu xuất hiện trước 2.5s
        newStart = Math.max(prevEnd + 0.5, origStart - 2.5);
      } else {
        newStart = prevStart;
      }

      // Biến mất khi dòng kế tiếp (i+1) bắt đầu hát
      if (i + 1 < n) {
        const nextStart = sorted[i + 1].originalStartTime !== undefined ? sorted[i + 1].originalStartTime : sorted[i + 1].startTime;
        newEnd = Math.max(origEnd, nextStart);
      } else {
        newEnd = Math.max(origEnd, origStart + 3.5);
      }
    }

    // Đảm bảo newEnd luôn lớn hơn newStart
    if (newEnd <= newStart) {
      newEnd = newStart + Math.max(2.0, origEnd - origStart);
    }

    result.push({
      ...cur,
      startTime: parseFloat(newStart.toFixed(2)),
      endTime: parseFloat(newEnd.toFixed(2)),
      karaokeStartTime: parseFloat(origKStart.toFixed(2)),
      karaokeEndTime: parseFloat(origKEnd.toFixed(2)),
      originalStartTime: origStart,
      originalEndTime: origEnd,
      originalKaraokeStartTime: origKStart,
      originalKaraokeEndTime: origKEnd,
    });
  }

  return result;
}

/**
 * Khôi phục lại mốc timing lời bài hát gốc khi chuyển từ Karaoke 2 dòng về 1 dòng, 3 dòng hoặc 4 dòng
 */
export function restoreOriginalLyricsTiming(lyrics: LyricLine[]): LyricLine[] {
  if (!lyrics || lyrics.length === 0) return [];
  return lyrics.map(line => {
    if (line.originalStartTime === undefined) return line;
    return {
      ...line,
      startTime: line.originalStartTime,
      endTime: line.originalEndTime !== undefined ? line.originalEndTime : line.endTime,
      karaokeStartTime: line.originalKaraokeStartTime !== undefined ? line.originalKaraokeStartTime : line.karaokeStartTime,
      karaokeEndTime: line.originalKaraokeEndTime !== undefined ? line.originalKaraokeEndTime : line.karaokeEndTime,
    };
  });
}

export interface KaraokeDuoLineState {
  line: LyricLine | null;
  text: string;
  isSinging: boolean;
  progress: number;
  lineIndex: number;
}

export interface KaraokeDuoInfo {
  line1: KaraokeDuoLineState;
  line2: KaraokeDuoLineState;
}

/**
 * Returns state for 2-line karaoke (Karaoke 2 dòng):
 * Line 1 (top) and Line 2 (bottom) alternate singing and previewing the upcoming line.
 * Both lines are displayed clearly and fully without collision.
 */
export function getKaraokeDuoInfo(
  lyrics: LyricLine[],
  currentTime: number
): KaraokeDuoInfo {
  const emptyState: KaraokeDuoLineState = {
    line: null,
    text: '',
    isSinging: false,
    progress: 0,
    lineIndex: -1,
  };

  if (!lyrics || lyrics.length === 0) {
    return { line1: { ...emptyState }, line2: { ...emptyState } };
  }

  if (lyrics.length === 1) {
    const l0 = lyrics[0];
    const kStart = l0.karaokeStartTime !== undefined ? l0.karaokeStartTime : l0.startTime;
    const kEnd = l0.karaokeEndTime !== undefined ? l0.karaokeEndTime : l0.endTime;
    const isSinging = currentTime >= kStart && currentTime <= kEnd;
    const dur = Math.max(0.1, kEnd - kStart);
    const prog = isSinging
      ? Math.min(1, Math.max(0, (currentTime - kStart) / dur))
      : (currentTime > kEnd ? 1 : 0);
    return {
      line1: { line: l0, text: l0.text, isSinging, progress: prog, lineIndex: 0 },
      line2: { ...emptyState },
    };
  }

  // Find currently active singing index based on karaokeStartTime & karaokeEndTime
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    const l = lyrics[i];
    const kStart = l.karaokeStartTime !== undefined ? l.karaokeStartTime : l.startTime;
    const kEnd = l.karaokeEndTime !== undefined ? l.karaokeEndTime : l.endTime;
    if (currentTime >= kStart && currentTime <= kEnd) {
      activeIndex = i;
      break;
    }
  }

  // Case A: Before the first line starts singing
  const firstKStart = lyrics[0].karaokeStartTime !== undefined ? lyrics[0].karaokeStartTime : lyrics[0].startTime;
  if (currentTime < firstKStart) {
    return {
      line1: {
        line: lyrics[0],
        text: lyrics[0].text,
        isSinging: false,
        progress: 0,
        lineIndex: 0,
      },
      line2: {
        line: lyrics[1] || null,
        text: lyrics[1]?.text || '',
        isSinging: false,
        progress: 0,
        lineIndex: lyrics[1] ? 1 : -1,
      },
    };
  }

  // Case B: In a gap between lines or past the song
  if (activeIndex === -1) {
    let nextIdx = -1;
    for (let i = 0; i < lyrics.length; i++) {
      const kStart = lyrics[i].karaokeStartTime !== undefined ? lyrics[i].karaokeStartTime : lyrics[i].startTime;
      if (currentTime < kStart) {
        nextIdx = i;
        break;
      }
    }

    if (nextIdx !== -1) {
      if (nextIdx % 2 === 1) {
        const line1Target = nextIdx + 1 < lyrics.length ? lyrics[nextIdx + 1] : lyrics[nextIdx - 1];
        const line1Idx = nextIdx + 1 < lyrics.length ? nextIdx + 1 : nextIdx - 1;
        return {
          line1: {
            line: line1Target || null,
            text: line1Target?.text || '',
            isSinging: false,
            progress: nextIdx + 1 < lyrics.length ? 0 : 1,
            lineIndex: line1Idx,
          },
          line2: {
            line: lyrics[nextIdx],
            text: lyrics[nextIdx].text,
            isSinging: false,
            progress: 0,
            lineIndex: nextIdx,
          },
        };
      } else {
        const line2Target = nextIdx + 1 < lyrics.length ? lyrics[nextIdx + 1] : lyrics[nextIdx - 1];
        const line2Idx = nextIdx + 1 < lyrics.length ? nextIdx + 1 : nextIdx - 1;
        return {
          line1: {
            line: lyrics[nextIdx],
            text: lyrics[nextIdx].text,
            isSinging: false,
            progress: 0,
            lineIndex: nextIdx,
          },
          line2: {
            line: line2Target || null,
            text: line2Target?.text || '',
            isSinging: false,
            progress: nextIdx + 1 < lyrics.length ? 0 : 1,
            lineIndex: line2Idx,
          },
        };
      }
    } else {
      const last = lyrics.length - 1;
      const secondLast = Math.max(0, last - 1);
      const isLastEven = last % 2 === 0;
      return {
        line1: {
          line: isLastEven ? lyrics[last] : lyrics[secondLast],
          text: (isLastEven ? lyrics[last] : lyrics[secondLast]).text,
          isSinging: false,
          progress: 1,
          lineIndex: isLastEven ? last : secondLast,
        },
        line2: {
          line: isLastEven ? lyrics[secondLast] : lyrics[last],
          text: (isLastEven ? lyrics[secondLast] : lyrics[last]).text,
          isSinging: false,
          progress: 1,
          lineIndex: isLastEven ? secondLast : last,
        },
      };
    }
  }

  // Case C: Active line being sung
  const activeLine = lyrics[activeIndex];
  const kStart = activeLine.karaokeStartTime !== undefined ? activeLine.karaokeStartTime : activeLine.startTime;
  const kEnd = activeLine.karaokeEndTime !== undefined ? activeLine.karaokeEndTime : activeLine.endTime;
  const kDur = Math.max(0.1, kEnd - kStart);
  let progress = 0;
  if (currentTime < kStart) {
    progress = 0;
  } else if (currentTime >= kEnd) {
    progress = 1;
  } else {
    progress = Math.min(1, Math.max(0, (currentTime - kStart) / kDur));
  }

  const isEven = activeIndex % 2 === 0;
  if (isEven) {
    const nextLine = activeIndex + 1 < lyrics.length ? lyrics[activeIndex + 1] : null;
    return {
      line1: {
        line: activeLine,
        text: activeLine.text,
        isSinging: true,
        progress,
        lineIndex: activeIndex,
      },
      line2: {
        line: nextLine,
        text: nextLine?.text || '',
        isSinging: false,
        progress: 0,
        lineIndex: nextLine ? activeIndex + 1 : -1,
      },
    };
  } else {
    const nextLine = activeIndex + 1 < lyrics.length ? lyrics[activeIndex + 1] : (activeIndex - 1 >= 0 ? lyrics[activeIndex - 1] : null);
    return {
      line1: {
        line: nextLine,
        text: nextLine?.text || '',
        isSinging: false,
        progress: activeIndex + 1 < lyrics.length ? 0 : 1,
        lineIndex: nextLine ? (activeIndex + 1 < lyrics.length ? activeIndex + 1 : activeIndex - 1) : -1,
      },
      line2: {
        line: activeLine,
        text: activeLine.text,
        isSinging: true,
        progress,
        lineIndex: activeIndex,
      },
    };
  }
}

/**
 * Split a single lyric line into two balanced lines for vertical video displays (e.g. 9:16 TikTok/Shorts)
 * Balances based on explicit delimiters (\n, " / ", " | "), mid-sentence punctuation (, ; -), or center whitespace.
 */
export function splitIntoTwoBalancedLines(text: string): [string, string] {
  const trimmed = (text || '').trim();
  if (!trimmed) return ['', ''];

  // 1. Explicit line break or separator
  if (trimmed.includes('\n')) {
    const parts = trimmed.split('\n');
    return [parts[0].trim(), parts.slice(1).join(' ').trim()];
  }
  if (trimmed.includes(' / ')) {
    const parts = trimmed.split(' / ');
    return [parts[0].trim(), parts.slice(1).join(' / ').trim()];
  }
  if (trimmed.includes(' | ')) {
    const parts = trimmed.split(' | ');
    return [parts[0].trim(), parts.slice(1).join(' | ').trim()];
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 1) {
    return [trimmed, ''];
  }

  // 2. Check for natural punctuation near middle (comma, semicolon, dash, hyphen)
  const punctRegex = /([,;\-–—~]\s+)/g;
  let match: RegExpExecArray | null;
  let bestPunctIdx = -1;
  let minPunctDist = Infinity;
  const halfLen = trimmed.length / 2;

  while ((match = punctRegex.exec(trimmed)) !== null) {
    const splitPoint = match.index + match[1].length;
    // Only accept if within 25% to 75% of string length
    if (splitPoint >= trimmed.length * 0.25 && splitPoint <= trimmed.length * 0.75) {
      const dist = Math.abs(splitPoint - halfLen);
      if (dist < minPunctDist) {
        minPunctDist = dist;
        bestPunctIdx = splitPoint;
      }
    }
  }

  if (bestPunctIdx !== -1) {
    return [trimmed.slice(0, bestPunctIdx).trim(), trimmed.slice(bestPunctIdx).trim()];
  }

  // 3. Find whitespace closest to center
  let bestSpaceIdx = -1;
  let minSpaceDist = Infinity;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === ' ') {
      const dist = Math.abs(i - halfLen);
      if (dist < minSpaceDist) {
        minSpaceDist = dist;
        bestSpaceIdx = i;
      }
    }
  }

  if (bestSpaceIdx !== -1) {
    return [trimmed.slice(0, bestSpaceIdx).trim(), trimmed.slice(bestSpaceIdx + 1).trim()];
  }

  // 4. Word boundary fallback
  const midWord = Math.ceil(words.length / 2);
  return [words.slice(0, midWord).join(' '), words.slice(midWord).join(' ')];
}

