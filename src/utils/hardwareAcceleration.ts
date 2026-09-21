import { HardwareInfo, HardwareAccelerationConfig, HardwareAccelerationMode } from '../types';

export const DEFAULT_HARDWARE_CONFIG: HardwareAccelerationConfig = {
  mode: 'gpu-max', // Default to Hardware-Accelerated GPU
  desynchronized: true, // Direct GPU presentation bypassing compositor latency
  preferHardwareEncoder: true, // Hardware NVENC / VideoToolbox / QuickSync
  showOverlay: false, // Performance stats HUD overlay
  multiThreadedAudio: true, // Multi-core CPU audio processing
};

export const DEFAULT_LOW_HARDWARE_CONFIG: HardwareAccelerationConfig = {
  mode: 'cpu-safe', // Eco & CPU safe mode for low-end hardware, mobile, weak VGA
  desynchronized: false, // Direct GPU presentation can cause stutter on low-end iGPUs
  preferHardwareEncoder: false, // Reliable software fallback
  showOverlay: false,
  multiThreadedAudio: true,
};

const STORAGE_KEY = 'sonawave_hardware_accel_config';

/**
 * Format raw WebGL GPU strings into human-readable GPU names
 */
export function formatGpuName(raw: string): string {
  if (!raw || raw === 'Generic' || raw === 'Standard GPU Accelerator') {
    return 'GPU Hardware Accelerator';
  }

  // Handle ANGLE strings: e.g. "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Laptop GPU Direct3D11 vs_5_0 ps_5_0, D3D11)"
  const angleMatch = raw.match(/ANGLE \([^,]+,\s*([^,]+?)(?:\s+(?:Direct3D|vs_|ps_|OpenGL|Vulkan|Metal)[^)]*)?\)/i);
  if (angleMatch && angleMatch[1]) {
    return angleMatch[1].trim();
  }

  // Handle Apple Silicon: "Apple M1", "Apple M2 Max", "Apple M3 Pro"
  if (/Apple M[0-9]/i.test(raw)) {
    const appleMatch = raw.match(/(Apple M[0-9][a-zA-Z0-9\s]*)/i);
    if (appleMatch) return appleMatch[1].trim();
  }

  // Strip excessive technical suffixes
  const cleaned = raw
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*(?:Direct3D|OpenGL|Vulkan|Metal|Mesa|LLVMpipe).*$/i, '')
    .trim();

  return cleaned || raw;
}

let cachedHardwareInfo: HardwareInfo | null = null;

/**
 * Detect real device hardware capabilities (CPU logical cores, GPU renderer, WebGL2, WebGPU, etc.)
 */
export function detectHardwareInfo(): HardwareInfo {
  if (cachedHardwareInfo) return cachedHardwareInfo;

  let gpuRenderer = 'GPU Hardware Accelerator';
  let gpuVendor = 'Generic';
  let isWebGlSupported = false;

  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

      if (gl) {
        isWebGlSupported = true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rawRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const rawVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          if (rawRenderer) gpuRenderer = String(rawRenderer);
          if (rawVendor) gpuVendor = String(rawVendor);
        } else {
          const rawRenderer = gl.getParameter(gl.RENDERER);
          const rawVendor = gl.getParameter(gl.VENDOR);
          if (rawRenderer) gpuRenderer = String(rawRenderer);
          if (rawVendor) gpuVendor = String(rawVendor);
        }
      }
    }
  } catch {
    // Non-fatal GPU probe error
  }

  const cleanGpuName = formatGpuName(gpuRenderer);

  const isWebGpuSupported = typeof navigator !== 'undefined' && 'gpu' in navigator;
  const cpuCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
  const deviceMemoryGb = typeof navigator !== 'undefined' && (navigator as any).deviceMemory ? (navigator as any).deviceMemory : undefined;
  const hasOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';

  // Test desynchronized canvas context support (Zero-latency direct GPU presentation)
  let supportsDesynchronized = false;
  try {
    if (typeof document !== 'undefined') {
      const testCanvas = document.createElement('canvas');
      const testCtx = testCanvas.getContext('2d', { desynchronized: true } as any);
      if (testCtx) {
        const attrs = ((testCtx as any).getContextAttributes && (testCtx as any).getContextAttributes()) || {};
        supportsDesynchronized = attrs.desynchronized === true || true;
      }
    }
  } catch {
    supportsDesynchronized = false;
  }

  // Test hardware video encoding capabilities in MediaRecorder
  let supportsHardwareVideoEncoding = false;
  if (typeof MediaRecorder !== 'undefined') {
    const hwCodecs = [
      'video/mp4;codecs=avc1.640028,mp4a.40.2',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=h264,opus',
    ];
    supportsHardwareVideoEncoding = hwCodecs.some((c) => MediaRecorder.isTypeSupported(c));
  }

  cachedHardwareInfo = {
    gpuRenderer: cleanGpuName,
    gpuVendor,
    isWebGlSupported,
    isWebGpuSupported,
    cpuCores,
    deviceMemoryGb,
    hasOffscreenCanvas,
    supportsDesynchronized,
    supportsHardwareVideoEncoding,
  };

  return cachedHardwareInfo;
}

/**
 * Check if the device is a mobile device, low RAM (<=4GB), or lacks dedicated high-performance GPU
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Mobile or tablet user-agent check
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
  if (isMobile) return true;

  // 2. Low RAM check (deviceMemory <= 4 GB)
  const deviceMemory = (navigator as any).deviceMemory;
  if (typeof deviceMemory === 'number' && deviceMemory <= 4) {
    return true;
  }

  // 3. Low CPU logical cores (<= 4)
  const cpuCores = navigator.hardwareConcurrency || 4;

  // 4. Integrated / software GPU check
  const info = detectHardwareInfo();
  const gpu = (info.gpuRenderer || '').toLowerCase();
  const isWeakGpu =
    gpu.includes('llvmpipe') ||
    gpu.includes('swiftshader') ||
    gpu.includes('basic render') ||
    gpu.includes('mali') ||
    gpu.includes('adreno') ||
    gpu.includes('intel hd') ||
    gpu.includes('intel uhd') ||
    gpu.includes('microsoft basic');

  if (isWeakGpu || cpuCores <= 2) {
    return true;
  }

  return false;
}

/**
 * Retrieve saved hardware acceleration configuration
 */
export function getSavedHardwareConfig(): HardwareAccelerationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_HARDWARE_CONFIG,
        ...parsed,
      };
    }
    // Default to low-hardware eco mode if low-end device is detected
    if (isLowEndDevice()) {
      return { ...DEFAULT_LOW_HARDWARE_CONFIG };
    }
  } catch {
    // fallback
  }
  return { ...DEFAULT_HARDWARE_CONFIG };
}

/**
 * Persist hardware acceleration configuration
 */
export function saveHardwareConfig(config: HardwareAccelerationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Real-time Hardware Performance Metrics Tracker
 * Monitors frame rendering time (ms), live FPS, and dropped frames
 */
export class HardwarePerformanceTracker {
  private lastTime: number = performance.now();
  private frameCount: number = 0;
  private fps: number = 60;
  private renderDuration: number = 0;
  private lastFpsUpdate: number = performance.now();
  private droppedFrames: number = 0;

  public beginFrame(): number {
    return performance.now();
  }

  public endFrame(frameStartTime: number): void {
    const now = performance.now();
    this.renderDuration = now - frameStartTime;
    this.frameCount++;

    // Track frame drop (> 33.3ms for 30fps baseline or > 20ms for 60fps)
    if (this.renderDuration > 22) {
      this.droppedFrames++;
    }

    if (now - this.lastFpsUpdate >= 500) {
      const deltaSec = (now - this.lastFpsUpdate) / 1000;
      this.fps = Math.round(this.frameCount / deltaSec);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  public getMetrics() {
    return {
      fps: Math.min(120, Math.max(0, this.fps)),
      renderDurationMs: parseFloat(this.renderDuration.toFixed(1)),
      droppedFrames: this.droppedFrames,
    };
  }

  public resetDrops() {
    this.droppedFrames = 0;
  }
}
