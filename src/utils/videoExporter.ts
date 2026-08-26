/**
 * SonaWave Video Exporter
 * Exports high-definition video with canvas visualizer + synchronized audio stream
 */

export interface ExportProgress {
  progress: number; // 0 to 100
  currentSeconds: number;
  totalSeconds: number;
  status: 'rendering' | 'encoding' | 'completed' | 'error';
  errorMessage?: string;
}

export class VideoExporter {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private activeStream: MediaStream | null = null;

  /**
   * Get optimal supported MIME type (Prefers MP4/H264 format)
   */
  public static getSupportedMimeType(): string {
    const types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=h264,opus',
      'video/mp4',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/mp4';
  }

  /**
   * Start recording session with canvas and audio stream
   */
  public startRecording(
    canvas: HTMLCanvasElement,
    audioStream: MediaStream | null,
    fps: number = 60,
    bitrateMultiplier: 'high' | 'ultra' | 'medium' = 'high'
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.recordedChunks = [];

      try {
        // Capture canvas stream at exact requested FPS
        const canvasStream = canvas.captureStream(fps);
        const combinedStream = new MediaStream();
        this.activeStream = combinedStream;

        // Add video tracks from canvas
        const videoTracks = canvasStream.getVideoTracks();
        if (videoTracks.length === 0) {
          throw new Error('Không thể thu nhận luồng video từ canvas!');
        }
        videoTracks.forEach((track) => {
          combinedStream.addTrack(track);
        });

        // Add audio tracks from Web Audio engine
        if (audioStream) {
          const audioTracks = audioStream.getAudioTracks();
          audioTracks.forEach((track) => {
            if (track.readyState === 'live') {
              combinedStream.addTrack(track);
            }
          });
        }

        const mimeType = VideoExporter.getSupportedMimeType();

        let videoBitrate = 14000000; // 14 Mbps for High Quality
        if (bitrateMultiplier === 'ultra') videoBitrate = 24000000;
        if (bitrateMultiplier === 'medium') videoBitrate = 8000000;

        const options: MediaRecorderOptions = {
          videoBitsPerSecond: videoBitrate,
          audioBitsPerSecond: 320000,
        };

        if (mimeType) {
          options.mimeType = mimeType;
        }

        try {
          this.mediaRecorder = new MediaRecorder(combinedStream, options);
        } catch {
          // If specified options fail on some platforms, fallback to default MediaRecorder
          this.mediaRecorder = new MediaRecorder(combinedStream);
        }

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          try {
            // ONLY stop the canvas video tracks generated for this specific recording session!
            // Do NOT call stop() on Web Audio tracks as that breaks future recordings.
            videoTracks.forEach((t) => {
              try {
                t.stop();
              } catch {
                // Ignore track stop cleanup errors
              }
            });
          } catch {
            // Ignore cleanup errors
          }
          const actualMime = this.mediaRecorder?.mimeType || mimeType || 'video/mp4';
          const blob = new Blob(this.recordedChunks, { type: actualMime });
          resolve(blob);
        };

        this.mediaRecorder.onerror = (err) => {
          console.error('MediaRecorder error:', err);
          reject(err);
        };

        // Slice data in 100ms chunks to ensure continuous flushing without buffer congestion
        this.mediaRecorder.start(100);
      } catch (err) {
        console.error('Failed to initialize MediaRecorder:', err);
        reject(err);
      }
    });
  }

  /**
   * Stops active recording and requests final data slice
   */
  public stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        // Request any buffered data before closing
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.requestData();
        }
        this.mediaRecorder.stop();
      } catch (err) {
        console.warn('MediaRecorder stop warning:', err);
      }
    }
  }

  public isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  /**
   * Helper to download blob as video file
   */
  public static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2500);
  }

  /**
   * Capture high-res PNG Snapshot
   */
  public static captureSnapshot(canvas: HTMLCanvasElement, filename = 'sonawave-cover.png') {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 2500);
  }
}
