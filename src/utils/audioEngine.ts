/**
 * SonaWave Web Audio Engine
 * Handles real-time frequency analysis, beat detection, audio file decoding,
 * and audio stream routing for video recording.
 */

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private exportGainNode: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private isInitialized = false;

  private freqData: Uint8Array = new Uint8Array(128);
  private timeData: Uint8Array = new Uint8Array(128);

  // Beat tracking
  private prevBassEnergy = 0;
  public beatIntensity = 0;
  public smoothedVolume = 0;
  public detectedBpm = 120;

  constructor() {
    // Lazy init on first user interaction
  }

  public init() {
    if (this.isInitialized && this.audioCtx && this.audioCtx.state !== 'closed') {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512; // 256 frequency bins
    this.analyser.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1.0;

    // Dedicated unmuted 1.0 gain node specifically for export recording
    this.exportGainNode = this.audioCtx.createGain();
    this.exportGainNode.gain.value = 1.0;

    this.streamDest = this.audioCtx.createMediaStreamDestination();

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

    this.isInitialized = true;
  }

  public attachAudioElement(audio: HTMLAudioElement) {
    this.init();
    if (!this.audioCtx || !this.analyser || !this.gainNode || !this.exportGainNode || !this.streamDest) return;

    this.audioElement = audio;

    if (!this.sourceNode) {
      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(audio);
        // Connect to analyser for FFT visualizer analysis
        this.sourceNode.connect(this.analyser);
        // Analyser -> preview gain -> destination (speakers)
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        // Analyser -> export gain (fixed 100% volume) -> stream destination (video recorder)
        this.analyser.connect(this.exportGainNode);
        this.exportGainNode.connect(this.streamDest);
      } catch (e) {
        console.warn('Audio source node already attached or error:', e);
      }
    }
  }

  public setSmoothing(smoothing: number) {
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = Math.min(0.95, Math.max(0.1, smoothing));
    }
  }

  public setFftSize(fftSize: number) {
    if (this.analyser) {
      this.analyser.fftSize = fftSize;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  public getAudioStream(): MediaStream | null {
    return this.streamDest ? this.streamDest.stream : null;
  }

  /**
   * Generates a guaranteed fresh, live MediaStream with active audio tracks
   * ensuring that stopping previous recording sessions never kills the audio stream.
   */
  public getFreshAudioStream(): MediaStream | null {
    if (!this.audioCtx || !this.exportGainNode) {
      this.init();
    }
    if (this.audioCtx && this.exportGainNode) {
      try {
        if (this.streamDest) {
          this.exportGainNode.disconnect(this.streamDest);
        }
      } catch {
        // Ignore disconnect errors
      }
      this.streamDest = this.audioCtx.createMediaStreamDestination();
      this.exportGainNode.connect(this.streamDest);
      return this.streamDest.stream;
    }
    return this.streamDest ? this.streamDest.stream : null;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioCtx;
  }

  /**
   * Updates frequency and time domain data and calculates beat/bass pulse
   */
  public updateData(): {
    freqData: Uint8Array;
    timeData: Uint8Array;
    bassIntensity: number;
    trebleIntensity: number;
    overallVolume: number;
    isBeat: boolean;
  } {
    if (!this.analyser) {
      return {
        freqData: this.freqData,
        timeData: this.timeData,
        bassIntensity: 0,
        trebleIntensity: 0,
        overallVolume: 0,
        isBeat: false,
      };
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    // Compute bass (bins 0 to 8 approx 0 - 250Hz)
    let bassSum = 0;
    const bassBins = Math.min(10, this.freqData.length);
    for (let i = 0; i < bassBins; i++) {
      bassSum += this.freqData[i];
    }
    const bassAvg = bassSum / bassBins / 255;

    // Compute treble (bins from 30% to 80%)
    let trebleSum = 0;
    const trebleStart = Math.floor(this.freqData.length * 0.4);
    const trebleEnd = Math.floor(this.freqData.length * 0.8);
    for (let i = trebleStart; i < trebleEnd; i++) {
      trebleSum += this.freqData[i];
    }
    const trebleAvg = (trebleSum / (trebleEnd - trebleStart)) / 255;

    // Overall volume
    let totalSum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      totalSum += this.freqData[i];
    }
    const overallVolume = totalSum / this.freqData.length / 255;

    // Beat detection
    const bassDelta = bassAvg - this.prevBassEnergy;
    let isBeat = false;
    if (bassDelta > 0.15 && bassAvg > 0.35) {
      this.beatIntensity = 1.0;
      isBeat = true;
    } else {
      this.beatIntensity *= 0.88; // decay
    }
    this.prevBassEnergy = bassAvg;

    this.smoothedVolume = this.smoothedVolume * 0.7 + overallVolume * 0.3;

    return {
      freqData: this.freqData,
      timeData: this.timeData,
      bassIntensity: bassAvg,
      trebleIntensity: trebleAvg,
      overallVolume,
      isBeat,
    };
  }

  public async resume(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn('AudioContext resume warning:', e);
      }
    }
  }

  public async ensureContextRunning(): Promise<void> {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn('Failed to resume AudioContext:', e);
      }
    }
  }

  /**
   * Analyzes an uploaded audio file to automatically detect its BPM tempo
   */
  public async detectBpmFromFile(file: File): Promise<{ bpm: number; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const offlineCtx = new AudioContextClass();
      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0));
      const result = detectBpmFromAudioBuffer(audioBuffer);
      try { await offlineCtx.close(); } catch {}
      this.detectedBpm = result.bpm;
      return result;
    } catch (err) {
      console.warn('BPM detection error from file:', err);
      return { bpm: 120, confidence: 0.5 };
    }
  }

  /**
   * Analyzes audio from URL or Blob to detect its BPM tempo
   */
  public async detectBpmFromUrl(url: string): Promise<{ bpm: number; confidence: number }> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const offlineCtx = new AudioContextClass();
      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer.slice(0));
      const result = detectBpmFromAudioBuffer(audioBuffer);
      try { await offlineCtx.close(); } catch {}
      this.detectedBpm = result.bpm;
      return result;
    } catch (err) {
      console.warn('BPM detection error from URL:', err);
      return { bpm: 120, confidence: 0.5 };
    }
  }

  public async generateDemoAudio(type: 'lofi' | 'synthwave' | 'acoustic' | 'edm', durationSeconds = 30): Promise<Blob> {
    const blob = await generateDemoAudioBlob(type, durationSeconds);
    let demoBpm = 85;
    if (type === 'synthwave') demoBpm = 120;
    if (type === 'edm') demoBpm = 128;
    if (type === 'acoustic') demoBpm = 95;
    this.detectedBpm = demoBpm;
    return blob;
  }

  public dispose() {
    this.destroy();
  }

  public destroy() {
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // Ignore context closing errors
      }
    }
  }
}

/**
 * Fast & robust tempo (BPM) detection algorithm for AudioBuffer
 * Uses low-band spectral flux energy envelopes and autocorrelation
 */
export function detectBpmFromAudioBuffer(audioBuffer: AudioBuffer): { bpm: number; confidence: number } {
  try {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Analyze up to 60 seconds (sampling 100 frames/second)
    const framesPerSec = 100;
    const windowSize = Math.floor(sampleRate / framesPerSec); // ~441 samples
    const totalWindows = Math.min(Math.floor(channelData.length / windowSize), framesPerSec * 60);
    
    if (totalWindows < 300) {
      return { bpm: 120, confidence: 0.5 };
    }

    // Extract low-pass / bass envelope (focus on kick & rhythm transients)
    const energyEnvelope = new Float32Array(totalWindows);
    let prevSample = 0;
    
    for (let w = 0; w < totalWindows; w++) {
      const offset = w * windowSize;
      let sum = 0;
      for (let i = 0; i < windowSize; i++) {
        const s = channelData[offset + i];
        const lp = (s + prevSample) * 0.5;
        prevSample = s;
        sum += lp * lp;
      }
      energyEnvelope[w] = Math.sqrt(sum / windowSize);
    }

    // Onset detection curve (positive half-wave rectified derivative)
    const onsetCurve = new Float32Array(totalWindows);
    for (let i = 1; i < totalWindows; i++) {
      const diff = energyEnvelope[i] - energyEnvelope[i - 1];
      onsetCurve[i] = diff > 0.002 ? diff : 0;
    }

    // Autocorrelation across BPM lag range: 60 BPM to 185 BPM
    const minBpm = 65;
    const maxBpm = 180;
    const minLag = Math.floor((60 / maxBpm) * framesPerSec);
    const maxLag = Math.floor((60 / minBpm) * framesPerSec);

    let bestLag = minLag;
    let maxCorr = -1;
    const corrScores: { bpm: number; score: number }[] = [];

    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < totalWindows - lag; i++) {
        sum += onsetCurve[i] * onsetCurve[i + lag];
        count++;
      }
      const score = count > 0 ? sum / count : 0;
      const bpm = Math.round((60 * framesPerSec) / lag);
      corrScores.push({ bpm, score });

      if (score > maxCorr) {
        maxCorr = score;
        bestLag = lag;
      }
    }

    let calculatedBpm = Math.round((60 * framesPerSec) / bestLag);

    // Harmonic octave checks (half / double tempo correction)
    if (calculatedBpm < 70) {
      calculatedBpm *= 2;
    } else if (calculatedBpm > 165) {
      const halfLag = bestLag * 2;
      if (halfLag <= maxLag) {
        const halfScore = corrScores.find((c) => Math.abs(c.bpm - calculatedBpm / 2) <= 2)?.score || 0;
        if (halfScore > maxCorr * 0.75) {
          calculatedBpm = Math.round(calculatedBpm / 2);
        }
      }
    }

    const meanScore = corrScores.reduce((acc, c) => acc + c.score, 0) / (corrScores.length || 1);
    const confidence = maxCorr > 0 ? Math.min(1.0, Math.max(0.2, (maxCorr - meanScore) / (maxCorr + 0.0001))) : 0.6;

    return {
      bpm: Math.min(200, Math.max(60, calculatedBpm)),
      confidence
    };
  } catch (e) {
    console.warn('detectBpmFromAudioBuffer fallback:', e);
    return { bpm: 120, confidence: 0.5 };
  }
}

/**
 * Creates high quality procedural audio tracks as a WAV Blob
 */
export function generateDemoAudioBlob(type: 'lofi' | 'synthwave' | 'acoustic' | 'edm', durationSeconds = 30): Promise<Blob> {
  return new Promise((resolve) => {
    const sampleRate = 44100;
    const totalSamples = sampleRate * durationSeconds;
    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

    // BPM and tempo
    let bpm = 85;
    if (type === 'synthwave') bpm = 120;
    if (type === 'edm') bpm = 128;
    if (type === 'acoustic') bpm = 95;

    const beatDuration = 60 / bpm;
    const numBeats = Math.floor(durationSeconds / beatDuration);

    // Scales (Frequencies in Hz)
    const lofiChords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    const synthChords = [
      [130.81, 164.81, 196.00, 246.94], // C
      [110.00, 130.81, 164.81, 196.00], // A
      [87.31, 110.00, 130.81, 164.81],  // F
      [98.00, 123.47, 146.83, 174.61],  // G
    ];

    const chords = type === 'synthwave' ? synthChords : lofiChords;

    // Master Compressor / Limiter
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-14, 0);
    compressor.knee.setValueAtTime(40, 0);
    compressor.ratio.setValueAtTime(8, 0);
    compressor.attack.setValueAtTime(0.005, 0);
    compressor.release.setValueAtTime(0.2, 0);
    compressor.connect(offlineCtx.destination);

    // Reverb simulation / Delay
    const delay = offlineCtx.createDelay();
    delay.delayTime.setValueAtTime(beatDuration * 0.75, 0);
    const delayFeedback = offlineCtx.createGain();
    delayFeedback.gain.setValueAtTime(0.35, 0);
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(compressor);

    // Schedule chords and beats
    for (let beat = 0; beat < numBeats; beat++) {
      const time = beat * beatDuration;
      const chordIdx = Math.floor(beat / 4) % chords.length;
      const chord = chords[chordIdx];

      // Kick drum on 1 and 3 (or 4 on floor for EDM/synth)
      const isKick = (type === 'synthwave' || type === 'edm') ? true : (beat % 2 === 0);
      if (isKick) {
        const kickOsc = offlineCtx.createOscillator();
        const kickGain = offlineCtx.createGain();
        kickOsc.frequency.setValueAtTime(140, time);
        kickOsc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
        kickGain.gain.setValueAtTime(0.9, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        kickOsc.connect(kickGain);
        kickGain.connect(compressor);
        kickOsc.start(time);
        kickOsc.stop(time + 0.25);
      }

      // Snare / Clap on beat 2 and 4
      if (beat % 2 === 1) {
        const snareOsc = offlineCtx.createOscillator();
        const snareGain = offlineCtx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(180, time);
        snareOsc.frequency.exponentialRampToValueAtTime(80, time + 0.15);
        snareGain.gain.setValueAtTime(0.4, time);
        snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        snareOsc.connect(snareGain);
        snareGain.connect(compressor);
        snareOsc.start(time);
        snareOsc.stop(time + 0.18);
      }

      // Hi-hat every beat and sub-beat
      const hatOsc = offlineCtx.createOscillator();
      const hatGain = offlineCtx.createGain();
      hatOsc.type = 'sawtooth';
      hatOsc.frequency.setValueAtTime(8000, time + beatDuration * 0.5);
      hatGain.gain.setValueAtTime(0.08, time + beatDuration * 0.5);
      hatGain.gain.exponentialRampToValueAtTime(0.0001, time + beatDuration * 0.5 + 0.05);
      hatOsc.connect(hatGain);
      hatGain.connect(compressor);
      hatOsc.start(time + beatDuration * 0.5);
      hatOsc.stop(time + beatDuration * 0.5 + 0.05);

      // Pad / Keys on chord change
      if (beat % 4 === 0) {
        chord.forEach((freq) => {
          const osc = offlineCtx.createOscillator();
          const gain = offlineCtx.createGain();
          osc.type = (type === 'synthwave') ? 'sawtooth' : (type === 'edm' ? 'sawtooth' : 'sine');
          osc.frequency.setValueAtTime(freq * (type === 'synthwave' ? 2 : 1), time);

          // Gentle filter
          const filter = offlineCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(type === 'lofi' ? 1200 : 2500, time);

          gain.gain.setValueAtTime(0.01, time);
          gain.gain.linearRampToValueAtTime(0.12, time + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.01, time + beatDuration * 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(compressor);
          gain.connect(delay);

          osc.start(time);
          osc.stop(time + beatDuration * 4);
        });

        // Bass Note
        const bassOsc = offlineCtx.createOscillator();
        const bassGain = offlineCtx.createGain();
        bassOsc.type = (type === 'synthwave') ? 'sawtooth' : 'sine';
        bassOsc.frequency.setValueAtTime(chord[0] * 0.5, time);
        bassGain.gain.setValueAtTime(0.35, time);
        bassGain.gain.exponentialRampToValueAtTime(0.15, time + beatDuration * 3.5);
        bassGain.gain.linearRampToValueAtTime(0.001, time + beatDuration * 4);

        bassOsc.connect(bassGain);
        bassGain.connect(compressor);
        bassOsc.start(time);
        bassOsc.stop(time + beatDuration * 4);
      }

      // Arpeggio / Melody note
      const arpNotes = [chord[beat % chord.length] * 2, chord[(beat + 2) % chord.length] * 2];
      arpNotes.forEach((arpFreq, aIdx) => {
        const leadOsc = offlineCtx.createOscillator();
        const leadGain = offlineCtx.createGain();
        leadOsc.type = type === 'lofi' ? 'triangle' : 'square';
        leadOsc.frequency.setValueAtTime(arpFreq, time + aIdx * (beatDuration / 2));
        leadGain.gain.setValueAtTime(0.08, time + aIdx * (beatDuration / 2));
        leadGain.gain.exponentialRampToValueAtTime(0.001, time + (aIdx + 1) * (beatDuration / 2) - 0.02);

        leadOsc.connect(leadGain);
        leadGain.connect(delay);
        leadGain.connect(compressor);

        leadOsc.start(time + aIdx * (beatDuration / 2));
        leadOsc.stop(time + (aIdx + 1) * (beatDuration / 2));
      });
    }

    offlineCtx.startRendering().then((renderedBuffer) => {
      const wavBlob = audioBufferToWavBlob(renderedBuffer);
      resolve(wavBlob);
    });
  });
}

/**
 * Creates high quality procedural audio tracks (WAV URL string) for demo/instant playback!
 */
export async function generateDemoAudioBuffer(type: 'lofi' | 'synthwave' | 'acoustic' | 'edm', durationSeconds = 30): Promise<string> {
  const wavBlob = await generateDemoAudioBlob(type, durationSeconds);
  return URL.createObjectURL(wavBlob);
}

/**
 * Converts AudioBuffer to standard WAV Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // 16-bit signed int
      out.setInt16(offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  function setUint16(data: number) {
    out.setUint16(offset, data, true);
    offset += 2;
  }

  function setUint32(data: number) {
    out.setUint32(offset, data, true);
    offset += 4;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
