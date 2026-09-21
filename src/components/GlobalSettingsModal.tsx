import React from 'react';
import { Language, getTranslation, setSavedLanguage, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { MasterEQConfig, AspectRatio, HardwareAccelerationConfig, HardwareInfo, HardwareAccelerationMode } from '../types';
import { DEFAULT_MASTER_EQ } from '../utils/presets';
import { DEFAULT_HARDWARE_CONFIG } from '../utils/hardwareAcceleration';
import { 
  Settings, 
  Globe, 
  Sliders, 
  Keyboard, 
  Cpu, 
  Check, 
  X, 
  HardDrive,
  Monitor,
  Smartphone,
  Square,
  Tv,
  Zap,
  Gauge,
  Activity,
  Layers,
  Film,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  masterEqConfig?: MasterEQConfig;
  onOpenMasterEq?: () => void;
  aspectRatio?: AspectRatio;
  onSelectAspectRatio?: (ar: AspectRatio) => void;
  highPerformanceRender?: boolean;
  onToggleHighPerformanceRender?: (enabled: boolean) => void;
  hardwareConfig?: HardwareAccelerationConfig;
  onUpdateHardwareConfig?: (config: HardwareAccelerationConfig) => void;
  hardwareInfo?: HardwareInfo;
  autoSaveEnabled?: boolean;
  onToggleAutoSave?: (enabled: boolean) => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  masterEqConfig = DEFAULT_MASTER_EQ,
  onOpenMasterEq,
  aspectRatio,
  onSelectAspectRatio,
  highPerformanceRender = false,
  onToggleHighPerformanceRender,
  hardwareConfig = DEFAULT_HARDWARE_CONFIG,
  onUpdateHardwareConfig,
  hardwareInfo,
  autoSaveEnabled = true,
  onToggleAutoSave,
}) => {
  const t = getTranslation(language);
  const safeEq = masterEqConfig || DEFAULT_MASTER_EQ;

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: Language) => {
    onLanguageChange(lang);
    setSavedLanguage(lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-purple-950/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-neutral-400 line-clamp-1">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* 1. Interface Language Switcher (Dynamically generated from SUPPORTED_LANGUAGES) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-pink-400" />
              <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {t.interfaceLanguage}
              </label>
            </div>
            <p className="text-xs text-neutral-400">
              {t.interfaceLanguageDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-950/40 to-neutral-900 border-rose-500 ring-1 ring-rose-500/50 shadow-md'
                        : 'bg-neutral-900/60 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.nativeName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold uppercase">
                            {item.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-1">
                          {item.description || item.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Audio Engine & Master EQ Quick Setting */}
          <div className="space-y-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  {t.audioEngineSettings}
                </label>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                safeEq.enabled
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400'
              }`}>
                {safeEq.enabled ? t.eqActive : t.eqBypass}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              {t.audioEngineDesc}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-neutral-300">
                <span className="text-neutral-400">{t.activePresetLabel}: </span>
                <span className="font-semibold text-rose-300 uppercase">{safeEq.preset || 'flat'}</span>
              </div>
              {onOpenMasterEq && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMasterEq();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t.openMasterEq}</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Aspect Ratio Selection if available */}
          {aspectRatio && onSelectAspectRatio && (
            <div className="space-y-3 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-400" />
                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  {t.defaultAspectRatio}
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: '16:9' as AspectRatio, label: '16:9 YouTube', icon: Tv },
                  { id: '9:16' as AspectRatio, label: '9:16 TikTok / Reels', icon: Smartphone },
                  { id: '1:1' as AspectRatio, label: '1:1 Square', icon: Square },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = aspectRatio === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectAspectRatio(item.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSel
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                          : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Keyboard Shortcuts Reference */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                {t.keyboardShortcuts}
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-300">{t.shortcutSpace}</span>
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[11px] text-amber-300 font-bold">Space</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-300">{t.shortcutF}</span>
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[11px] text-amber-300 font-bold">F</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-300">{t.shortcutM}</span>
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[11px] text-amber-300 font-bold">M</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-300">{t.shortcutArrows}</span>
                <kbd className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[11px] text-amber-300 font-bold">← / →</kbd>
              </div>
            </div>
          </div>

          {/* 5. Hardware Acceleration (CPU / GPU) Engine */}
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  {t.hardwareAcceleration}
                </label>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border bg-emerald-500/15 border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>GPU Active</span>
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.hardwareAccelerationDesc}
            </p>

            {/* Hardware Diagnostics Card */}
            {hardwareInfo && (
              <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/90 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    {t.gpuDeviceDetected}:
                  </span>
                  <span className="font-mono text-cyan-300 font-bold text-[11px] truncate max-w-[280px]">
                    {hardwareInfo.gpuRenderer}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-900">
                  <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-rose-400" />
                    {t.cpuCoresDetected}:
                  </span>
                  <span className="font-mono text-neutral-200 text-[11px]">
                    {hardwareInfo.cpuCores} Logical Cores {hardwareInfo.deviceMemoryGb ? `• ${hardwareInfo.deviceMemoryGb}GB RAM` : ''}
                  </span>
                </div>

                {/* Hardware Feature Capability Pills */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> WebGL 2.0 Direct
                  </span>
                  {hardwareInfo.hasOffscreenCanvas && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> OffscreenCanvas VRAM
                    </span>
                  )}
                  {hardwareInfo.supportsHardwareVideoEncoding && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> GPU Video Encoder (NVENC/QSV)
                    </span>
                  )}
                  {hardwareInfo.isWebGpuSupported && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> WebGPU Pipeline
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Hardware Acceleration Mode Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                Chế độ tăng tốc phần cứng (Acceleration Mode)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'gpu-max' as HardwareAccelerationMode,
                    title: t.hardwareModeGpuMax,
                    desc: t.hardwareModeGpuMaxDesc,
                    icon: Zap,
                    badge: '60 FPS',
                    color: 'rose',
                  },
                  {
                    id: 'balanced' as HardwareAccelerationMode,
                    title: t.hardwareModeBalanced,
                    desc: t.hardwareModeBalancedDesc,
                    icon: Sliders,
                    badge: 'Hybrid',
                    color: 'cyan',
                  },
                  {
                    id: 'cpu-safe' as HardwareAccelerationMode,
                    title: t.hardwareModeCpuSafe,
                    desc: t.hardwareModeCpuSafeDesc,
                    icon: HardDrive,
                    badge: 'Eco',
                    color: 'emerald',
                  },
                ].map((modeItem) => {
                  const isSel = hardwareConfig.mode === modeItem.id;
                  const Icon = modeItem.icon;
                  return (
                    <button
                      key={modeItem.id}
                      type="button"
                      onClick={() => {
                        if (onUpdateHardwareConfig) {
                          onUpdateHardwareConfig({
                            ...hardwareConfig,
                            mode: modeItem.id,
                          });
                        }
                        if (onToggleHighPerformanceRender) {
                          onToggleHighPerformanceRender(modeItem.id === 'cpu-safe');
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSel
                          ? 'bg-neutral-900 border-rose-500 ring-1 ring-rose-500/50 shadow-md shadow-rose-950/20'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1 rounded-lg ${isSel ? 'bg-rose-500/20 text-rose-400' : 'bg-neutral-800 text-neutral-400'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          isSel ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {modeItem.badge}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-white block">
                          {modeItem.title}
                        </span>
                        <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">
                          {modeItem.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-grained Toggles */}
            <div className="space-y-2 pt-1 border-t border-neutral-800/70">
              {/* 1. Direct GPU Presentation (Desynchronized Canvas) */}
              <div 
                onClick={() => {
                  if (onUpdateHardwareConfig) {
                    onUpdateHardwareConfig({
                      ...hardwareConfig,
                      desynchronized: !hardwareConfig.desynchronized,
                    });
                  }
                }}
                className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-neutral-200 block">
                    {t.directGpuPresentation}
                  </span>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {t.directGpuPresentationDesc}
                  </p>
                </div>
                <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                  hardwareConfig.desynchronized ? 'bg-rose-600' : 'bg-neutral-800'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hardwareConfig.desynchronized ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* 2. GPU Hardware Video Encoding */}
              <div 
                onClick={() => {
                  if (onUpdateHardwareConfig) {
                    onUpdateHardwareConfig({
                      ...hardwareConfig,
                      preferHardwareEncoder: !hardwareConfig.preferHardwareEncoder,
                    });
                  }
                }}
                className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-neutral-200 block">
                    {t.hardwareVideoEncoding}
                  </span>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {t.hardwareVideoEncodingDesc}
                  </p>
                </div>
                <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                  hardwareConfig.preferHardwareEncoder ? 'bg-rose-600' : 'bg-neutral-800'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hardwareConfig.preferHardwareEncoder ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* 3. Real-time Performance HUD Overlay */}
              <div 
                onClick={() => {
                  if (onUpdateHardwareConfig) {
                    onUpdateHardwareConfig({
                      ...hardwareConfig,
                      showOverlay: !hardwareConfig.showOverlay,
                    });
                  }
                }}
                className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-neutral-200 block">
                    {t.performanceOverlay}
                  </span>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    {t.performanceOverlayDesc}
                  </p>
                </div>
                <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
                  hardwareConfig.showOverlay ? 'bg-rose-600' : 'bg-neutral-800'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    hardwareConfig.showOverlay ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Auto-save Status & Interactive Turn On/Off Toggle */}
            <div 
              onClick={() => {
                if (onToggleAutoSave) {
                  onToggleAutoSave(!autoSaveEnabled);
                }
              }}
              className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <HardDrive className={`w-3.5 h-3.5 transition-colors ${autoSaveEnabled ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span className="text-xs font-semibold text-neutral-200">
                    {t.autoSaveEnabled}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  {t.autoSaveDesc}
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                  autoSaveEnabled 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-neutral-500 bg-neutral-800/50 border-neutral-700/50'
                }`}>
                  {autoSaveEnabled ? t.autoSaveActive : t.autoSaveDisabled}
                </span>
                <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  autoSaveEnabled ? 'bg-emerald-600' : 'bg-neutral-800'
                }`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoSaveEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
