import React, { useRef, useEffect, useState } from 'react';
import { MasterEQConfig, MasterEQPreset, MasterEQBands, MasterEQCustomPreset } from '../types';
import { MASTER_EQ_BANDS_META, MASTER_EQ_PRESETS_DATA, DEFAULT_MASTER_EQ } from '../utils/presets';
import {
  getMasterEQCustomPresets,
  saveMasterEQCustomPreset,
  deleteMasterEQCustomPreset,
  renameMasterEQCustomPreset,
  MAX_CUSTOM_MASTER_EQ_PRESETS,
} from '../utils/projectStorage';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { 
  Sliders, 
  Activity, 
  RotateCcw, 
  Power, 
  Sparkles, 
  Volume2, 
  Zap, 
  Flame, 
  Music, 
  Radio, 
  Disc, 
  X,
  Check,
  HelpCircle,
  TrendingUp,
  Filter,
  BookmarkPlus,
  Trash2,
  Edit2,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock
} from 'lucide-react';

interface MasterEQModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: MasterEQConfig;
  onChange: (config: MasterEQConfig) => void;
  language: Language;
}

export const MasterEQModal: React.FC<MasterEQModalProps> = ({
  isOpen,
  onClose,
  config = DEFAULT_MASTER_EQ,
  onChange,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const safeConfig: MasterEQConfig = config ? {
    ...DEFAULT_MASTER_EQ,
    ...config,
    bands: { ...DEFAULT_MASTER_EQ.bands, ...(config.bands || {}) }
  } : DEFAULT_MASTER_EQ;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePreset, setActivePreset] = useState<MasterEQPreset>(safeConfig.preset || 'flat');
  
  // Custom Presets State (Max 5)
  const [customPresets, setCustomPresets] = useState<MasterEQCustomPreset[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savePresetName, setSavePresetName] = useState('');
  const [overwritePresetId, setOverwritePresetId] = useState<string | null>(null);
  
  // Rename Modal State
  const [renamingPreset, setRenamingPreset] = useState<MasterEQCustomPreset | null>(null);
  const [renameInput, setRenameInput] = useState('');
  
  // Delete confirmation State
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  // Toast / Feedback State
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((current) => (current?.text === text ? null : current));
    }, 3000);
  };

  // Sync custom presets from storage on open
  useEffect(() => {
    if (isOpen) {
      setCustomPresets(getMasterEQCustomPresets());
    }
  }, [isOpen]);

  // Sync active preset when config changes
  useEffect(() => {
    setActivePreset(safeConfig.preset);
  }, [safeConfig.preset]);

  // Update helper
  const updateConfig = (partial: Partial<MasterEQConfig>) => {
    onChange({ ...safeConfig, ...partial });
  };

  const updateBand = (bandKey: keyof MasterEQBands, value: number) => {
    const updatedBands = { ...safeConfig.bands, [bandKey]: value };
    onChange({
      ...safeConfig,
      preset: 'flat', // custom tweaked
      bands: updatedBands,
    });
    setActivePreset('flat');
  };

  const applyPreset = (presetId: MasterEQPreset) => {
    const preset = MASTER_EQ_PRESETS_DATA.find((p) => p.id === presetId);
    if (!preset) return;
    onChange({
      ...safeConfig,
      preset: presetId,
      preampGain: preset.preampGain,
      lowCutFreq: preset.lowCutFreq,
      highCutFreq: preset.highCutFreq,
      bands: { ...preset.bands },
    });
    setActivePreset(presetId);
  };

  const applyCustomPreset = (customPreset: MasterEQCustomPreset) => {
    onChange({
      ...safeConfig,
      preset: customPreset.id,
      preampGain: customPreset.preampGain,
      lowCutFreq: customPreset.lowCutFreq,
      highCutFreq: customPreset.highCutFreq,
      bands: { ...customPreset.bands },
    });
    setActivePreset(customPreset.id);
    showToast(
      language === 'vi' 
        ? `Đã áp dụng cấu hình "${customPreset.name}"` 
        : `Applied preset "${customPreset.name}"`, 
      'info'
    );
  };

  const handleResetFlat = () => {
    applyPreset('flat');
  };

  // Open Save Custom Preset Dialog
  const handleOpenSaveModal = (presetToOverwriteId?: string) => {
    if (presetToOverwriteId) {
      const target = customPresets.find((p) => p.id === presetToOverwriteId);
      setOverwritePresetId(presetToOverwriteId);
      setSavePresetName(target ? target.name : '');
    } else {
      setOverwritePresetId(null);
      // Auto-suggest default name
      const defaultName = language === 'vi' 
        ? `Tùy Chỉnh EQ #${customPresets.length + 1}` 
        : `Custom Master EQ #${customPresets.length + 1}`;
      setSavePresetName(defaultName);
    }
    setIsSaveModalOpen(true);
  };

  // Submit Save Custom Preset
  const handleConfirmSavePreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameToSave = savePresetName.trim() || (
      language === 'vi' 
        ? `Tùy Chỉnh EQ #${customPresets.length + 1}` 
        : `Custom Master EQ #${customPresets.length + 1}`
    );

    const res = saveMasterEQCustomPreset({
      name: nameToSave,
      preampGain: safeConfig.preampGain ?? 0,
      lowCutFreq: safeConfig.lowCutFreq ?? 0,
      highCutFreq: safeConfig.highCutFreq ?? 20000,
      bands: safeConfig.bands,
      id: overwritePresetId || undefined,
    });

    if (res.success && res.preset) {
      const updatedList = getMasterEQCustomPresets();
      setCustomPresets(updatedList);
      setActivePreset(res.preset.id);
      onChange({ ...safeConfig, preset: res.preset.id });
      setIsSaveModalOpen(false);
      setOverwritePresetId(null);
      showToast(
        overwritePresetId
          ? (language === 'vi' ? 'Đã cập nhật cấu hình EQ thành công!' : 'Custom preset updated successfully!')
          : (language === 'vi' ? `Đã lưu cấu hình "${nameToSave}" (${updatedList.length}/${MAX_CUSTOM_MASTER_EQ_PRESETS})` : `Saved "${nameToSave}" (${updatedList.length}/${MAX_CUSTOM_MASTER_EQ_PRESETS})`),
        'success'
      );
    } else {
      showToast(res.error || (language === 'vi' ? 'Không thể lưu cấu hình' : 'Failed to save preset'), 'error');
    }
  };

  // Delete Custom Preset
  const handleConfirmDelete = (id: string) => {
    const updated = deleteMasterEQCustomPreset(id);
    setCustomPresets(updated);
    setDeletingPresetId(null);
    if (activePreset === id) {
      setActivePreset('flat');
    }
    showToast(
      language === 'vi' ? 'Đã xóa cấu hình tùy chỉnh!' : 'Custom preset deleted!',
      'info'
    );
  };

  // Submit Rename
  const handleConfirmRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!renamingPreset || !renameInput.trim()) return;
    const updated = renameMasterEQCustomPreset(renamingPreset.id, renameInput.trim());
    setCustomPresets(updated);
    setRenamingPreset(null);
    showToast(
      language === 'vi' ? 'Đã đổi tên cấu hình thành công!' : 'Preset renamed successfully!',
      'success'
    );
  };

  // Draw Real-time Frequency Response Curve Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0c0a1a');
    bgGrad.addColorStop(1, '#05040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Logarithmic frequency mapping: 20Hz (x=0) to 20,000Hz (x=width)
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    const getXForFreq = (freq: number) => {
      const logVal = Math.log10(Math.max(20, Math.min(20000, freq)));
      return ((logVal - minLog) / (maxLog - minLog)) * width;
    };

    // dB to Y mapping: +15dB (y=0.15*h), 0dB (y=0.5*h), -15dB (y=0.85*h)
    const maxDb = 18;
    const getYForDb = (db: number) => {
      const clamped = Math.max(-maxDb, Math.min(maxDb, db));
      return (height / 2) - (clamped / maxDb) * (height * 0.42);
    };

    // Draw Grid Lines (dB: +12, +6, 0, -6, -12)
    ctx.lineWidth = 1;
    [-12, -6, 0, 6, 12].forEach((db) => {
      const y = getYForDb(db);
      ctx.beginPath();
      ctx.strokeStyle = db === 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.07)';
      ctx.setLineDash(db === 0 ? [] : [3, 4]);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Label
      ctx.fillStyle = db === 0 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px monospace';
      ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 6, y - 3);
    });

    // Draw Frequency Vertical Grid Lines (32, 64, 125, 250, 500, 1k, 2k, 4k, 8k, 16k)
    const freqMarkers = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    freqMarkers.forEach((freq) => {
      const x = getXForFreq(freq);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.setLineDash([2, 4]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Label at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
      ctx.fillText(label, x, height - 6);
    });
    ctx.setLineDash([]);

    // Calculate Combined Frequency Response Curve
    const pointsCount = 180;
    const curvePoints: { x: number; y: number; db: number }[] = [];

    const isEnabled = safeConfig.enabled;
    const preampDb = isEnabled ? (safeConfig.preampGain || 0) : 0;
    const lowCut = isEnabled ? (safeConfig.lowCutFreq || 0) : 0;
    const highCut = isEnabled ? (safeConfig.highCutFreq || 20000) : 20000;

    for (let i = 0; i <= pointsCount; i++) {
      const ratio = i / pointsCount;
      const freq = Math.pow(10, minLog + ratio * (maxLog - minLog));
      let totalDb = preampDb;

      if (isEnabled) {
        // Low cut rolloff (approx 12dB/octave highpass)
        if (lowCut > 10 && freq < lowCut) {
          const octavesBelow = Math.log2(lowCut / freq);
          totalDb -= Math.min(36, octavesBelow * 14);
        }

        // High cut rolloff (approx 12dB/octave lowpass)
        if (highCut < 20000 && freq > highCut) {
          const octavesAbove = Math.log2(freq / highCut);
          totalDb -= Math.min(36, octavesAbove * 14);
        }

        // 10-band Bell / Shelf contribution
        for (const meta of MASTER_EQ_BANDS_META) {
          const bandGain = safeConfig.bands?.[meta.id] || 0;
          if (bandGain !== 0) {
            const centerFreq = meta.frequency;
            // Octave distance
            const octaveDist = Math.abs(Math.log2(freq / centerFreq));
            // Q bandwidth curve (Gaussian bell)
            const bell = Math.exp(-Math.pow(octaveDist * 1.35, 2));
            totalDb += bandGain * bell;
          }
        }
      }

      const x = getXForFreq(freq);
      const y = getYForDb(totalDb);
      curvePoints.push({ x, y, db: totalDb });
    }

    // Draw Shaded Gradient Fill Under Curve
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    curvePoints.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineTo(width, height / 2);
    ctx.closePath();

    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isEnabled) {
      fillGrad.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
      fillGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.18)');
      fillGrad.addColorStop(1, 'rgba(6, 182, 212, 0.05)');
    } else {
      fillGrad.addColorStop(0, 'rgba(120, 120, 120, 0.15)');
      fillGrad.addColorStop(1, 'rgba(120, 120, 120, 0.02)');
    }
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw Main Frequency Response Stroke
    ctx.beginPath();
    curvePoints.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineWidth = isEnabled ? 2.5 : 1.5;
    ctx.strokeStyle = isEnabled ? '#f43f5e' : 'rgba(255, 255, 255, 0.4)';
    ctx.shadowColor = isEnabled ? '#f43f5e' : 'transparent';
    ctx.shadowBlur = isEnabled ? 8 : 0;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Control Nodes for the 10 Bands
    if (isEnabled) {
      MASTER_EQ_BANDS_META.forEach((band) => {
        const gain = safeConfig.bands?.[band.id] || 0;
        const x = getXForFreq(band.frequency);
        const y = getYForDb(gain + preampDb);

        // Halo
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gain > 0 ? '#38bdf8' : gain < 0 ? '#fb7185' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [isOpen, safeConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-rose-950/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <Sliders className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {t.masterEqTitle}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  safeConfig.enabled 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/20' 
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  {safeConfig.enabled ? t.eqActive : t.eqBypass}
                </span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1">
                {t.masterEqDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bypass / Active Switch */}
            <button
              onClick={() => updateConfig({ enabled: !safeConfig.enabled })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                safeConfig.enabled
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-sm'
                  : 'bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              <Power className={`w-3.5 h-3.5 ${safeConfig.enabled ? 'text-emerald-400' : 'text-neutral-500'}`} />
              <span>{safeConfig.enabled ? 'Active EQ' : 'Bypass'}</span>
            </button>

            {/* Reset to Flat */}
            <button
              onClick={handleResetFlat}
              title={t.resetFlat}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* 1. Real-time Frequency Response Canvas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                {t.interactiveCurve}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Preamp: {(safeConfig.preampGain || 0) > 0 ? `+${safeConfig.preampGain}` : (safeConfig.preampGain || 0)} dB
              </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={160}
                className="w-full h-36 sm:h-40 block"
              />
            </div>
          </div>

          {/* 2. Global Preamp, Low-Cut & High-Cut Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            {/* Preamp Master Gain */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  {t.preampGain}
                </span>
                <span className="font-mono font-bold text-cyan-400 text-xs">
                  {(safeConfig.preampGain || 0) > 0 ? `+${safeConfig.preampGain}` : (safeConfig.preampGain || 0)} dB
                </span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={safeConfig.preampGain || 0}
                onChange={(e) => updateConfig({ preampGain: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Low-Cut High-Pass Filter */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-300 block flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                {t.lowCutFilter}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Off', val: 0 },
                  { label: '20Hz', val: 20 },
                  { label: '40Hz', val: 40 },
                  { label: '80Hz', val: 80 },
                ].map((item) => {
                  const active = (safeConfig.lowCutFreq || 0) === item.val;
                  return (
                    <button
                      key={item.label}
                      onClick={() => updateConfig({ lowCutFreq: item.val })}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High-Cut Low-Pass Filter */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-300 block flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-rose-400" />
                {t.highCutFilter}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Off', val: 20000 },
                  { label: '18kHz', val: 18000 },
                  { label: '15kHz', val: 15000 },
                  { label: '12kHz', val: 12000 },
                ].map((item) => {
                  const active = (safeConfig.highCutFreq || 20000) === item.val;
                  return (
                    <button
                      key={item.label}
                      onClick={() => updateConfig({ highCutFreq: item.val })}
                      className={`flex-1 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-rose-600 text-white font-bold shadow-sm'
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. 10-Band Vertical Faders Strip */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                10-Band Graphic & Parametric Master Sliders (-15dB to +15dB)
              </label>
              <span className="text-[11px] text-neutral-400">
                Nhấp đúp vào thanh trượt để về 0dB
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 pt-2">
              {MASTER_EQ_BANDS_META.map((band, idx) => {
                const gain = safeConfig.bands?.[band.id] ?? 0;
                
                // Color theme per frequency register
                let accentColor = 'accent-rose-500 text-rose-400';
                if (idx < 2) accentColor = 'accent-indigo-500 text-indigo-400'; // Sub-bass
                else if (idx < 4) accentColor = 'accent-cyan-500 text-cyan-400'; // Low-mid
                else if (idx < 6) accentColor = 'accent-emerald-500 text-emerald-400'; // Mids
                else if (idx < 8) accentColor = 'accent-amber-500 text-amber-400'; // Presence
                else accentColor = 'accent-purple-500 text-purple-400'; // Air

                return (
                  <div 
                    key={band.id}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/70 hover:border-neutral-700 transition-colors"
                  >
                    {/* dB Value Badge */}
                    <span className={`text-[11px] font-mono font-bold ${
                      gain > 0 ? 'text-emerald-400' : gain < 0 ? 'text-rose-400' : 'text-neutral-400'
                    }`}>
                      {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                    </span>

                    {/* Vertical Slider Wrapper */}
                    <div className="h-32 sm:h-40 flex items-center justify-center relative py-1">
                      <input
                        type="range"
                        min={-15}
                        max={15}
                        step={0.5}
                        value={gain}
                        onDoubleClick={() => updateBand(band.id, 0)}
                        onChange={(e) => updateBand(band.id, parseFloat(e.target.value))}
                        className={`h-28 sm:h-36 w-2 appearance-none bg-neutral-800 rounded-lg cursor-pointer ${accentColor}`}
                        style={{
                          writingMode: 'vertical-lr',
                          direction: 'rtl',
                        }}
                      />
                    </div>

                    {/* Frequency Label */}
                    <span className="text-xs font-bold text-neutral-200 mt-1">
                      {band.label}
                    </span>

                    {/* Subtle Frequency Type */}
                    <span className="text-[9px] text-neutral-400 text-center leading-tight line-clamp-1">
                      {idx < 2 ? 'Sub' : idx < 4 ? 'Bass' : idx < 7 ? 'Mid' : 'Air'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Studio Mastering Presets Cards Grid */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  {t.eqPresets}
                </label>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  customPresets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {language === 'vi' ? `Tùy chỉnh: ${customPresets.length}/${MAX_CUSTOM_MASTER_EQ_PRESETS}` : `Custom: ${customPresets.length}/${MAX_CUSTOM_MASTER_EQ_PRESETS}`}
                </span>
              </div>

              {/* Save Current as Custom Preset Button */}
              <button
                type="button"
                onClick={() => handleOpenSaveModal()}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  customPresets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                    : 'bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-rose-600/20'
                }`}
                title={customPresets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS ? (language === 'vi' ? 'Đã đạt 5/5 cấu hình tùy chỉnh (Nhấp để ghi đè)' : 'Max 5 presets reached (Click to overwrite)') : (language === 'vi' ? 'Lưu cấu hình 10 cần gạt EQ hiện tại' : 'Save current 10-band EQ settings')}
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-rose-200" />
                <span>{t.saveAsCustomPreset}</span>
                {customPresets.length < MAX_CUSTOM_MASTER_EQ_PRESETS && (
                  <span className="text-[10px] opacity-80 font-normal">({customPresets.length}/{MAX_CUSTOM_MASTER_EQ_PRESETS})</span>
                )}
              </button>
            </div>

            {/* A. User Custom Presets Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <BookmarkPlus className="w-3 h-3 text-rose-400" />
                  {t.customMasterEqPresets}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {language === 'vi' ? `Tối đa ${MAX_CUSTOM_MASTER_EQ_PRESETS} cấu hình` : `Max ${MAX_CUSTOM_MASTER_EQ_PRESETS} presets`}
                </span>
              </div>

              {customPresets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {customPresets.map((cp) => {
                    const isSelected = activePreset === cp.id;
                    const dateFormatted = new Date(cp.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={cp.id}
                        onClick={() => applyCustomPreset(cp)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-gradient-to-br from-purple-950/60 via-neutral-900 to-rose-950/60 border-rose-400 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/60'
                            : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-200 hover:bg-neutral-900 hover:border-neutral-600'
                        }`}
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-1.5 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-rose-200' : 'text-neutral-100'}`}>
                                  {cp.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-neutral-400 mt-0.5">
                                <Clock className="w-2.5 h-2.5 text-neutral-500" />
                                <span>{dateFormatted}</span>
                              </div>
                            </div>

                            {/* Badge and Quick Action Buttons */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-300">
                                Custom
                              </span>

                              {/* Rename button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingPreset(cp);
                                  setRenameInput(cp.name);
                                }}
                                className="p-1 rounded-md text-neutral-400 hover:text-cyan-300 hover:bg-neutral-800 transition-colors"
                                title={t.editName}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>

                              {/* Overwrite current button */}
                              <button
                                type="button"
                                onClick={() => handleOpenSaveModal(cp.id)}
                                className="p-1 rounded-md text-neutral-400 hover:text-emerald-300 hover:bg-neutral-800 transition-colors"
                                title={t.updateCurrentPreset}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => setDeletingPresetId(cp.id)}
                                className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                                title={t.deleteProject || 'Xóa'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Filters & Preamp Mini Tag */}
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                            <span>Preamp: <strong className="text-neutral-200">{cp.preampGain > 0 ? `+${cp.preampGain}` : cp.preampGain}dB</strong></span>
                            {cp.lowCutFreq > 0 && (
                              <span className="text-indigo-400 font-mono text-[9px]">LC:{cp.lowCutFreq}Hz</span>
                            )}
                            {cp.highCutFreq < 20000 && (
                              <span className="text-purple-400 font-mono text-[9px]">HC:{cp.highCutFreq / 1000}k</span>
                            )}
                          </div>
                        </div>

                        {/* Mini Preset Curve Preview */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-800 text-[9px] font-mono text-neutral-400">
                          <span>Low: {cp.bands.b64 > 0 ? `+${cp.bands.b64}` : cp.bands.b64}dB</span>
                          <span>Mid: {cp.bands.b1k > 0 ? `+${cp.bands.b1k}` : cp.bands.b1k}dB</span>
                          <span>High: {cp.bands.b16k > 0 ? `+${cp.bands.b16k}` : cp.bands.b16k}dB</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Slot Card if < 5 */}
                  {customPresets.length < MAX_CUSTOM_MASTER_EQ_PRESETS && (
                    <button
                      type="button"
                      onClick={() => handleOpenSaveModal()}
                      className="p-3.5 rounded-2xl border border-dashed border-neutral-700/80 hover:border-rose-500/80 bg-neutral-900/30 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer min-h-[90px]"
                    >
                      <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">
                        {language === 'vi' ? '+ Lưu Cấu Hình EQ Mới' : '+ Save New Custom Preset'}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {language === 'vi' 
                          ? `(Còn trống ${MAX_CUSTOM_MASTER_EQ_PRESETS - customPresets.length}/${MAX_CUSTOM_MASTER_EQ_PRESETS} chỗ)` 
                          : `(${MAX_CUSTOM_MASTER_EQ_PRESETS - customPresets.length} slots remaining)`}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                /* Empty state when 0 custom presets */
                <div 
                  onClick={() => handleOpenSaveModal()}
                  className="p-4 rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 hover:bg-neutral-900/50 hover:border-rose-500/60 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                      <BookmarkPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-200">
                        {language === 'vi' ? 'Chưa có cấu hình tùy chỉnh nào' : 'No custom presets saved yet'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {t.noCustomPresetsPrompt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSaveModal();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-600 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Lưu Cấu Hình Đầu Tiên' : 'Save First Preset'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* B. Studio Standard Presets Grid */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {t.studioMasterEqPresets}
                </span>
                <span className="text-[10px] text-neutral-500">10 Presets</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {MASTER_EQ_PRESETS_DATA.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-rose-950/40 via-neutral-900 to-purple-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/50'
                          : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-rose-300' : 'text-neutral-200'}`}>
                            {language === 'vi' ? preset.nameVi : preset.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                            isSelected 
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                              : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-tight line-clamp-2">
                          {language === 'vi' ? preset.descVi : preset.descEn}
                        </p>
                      </div>

                      {/* Mini Preset Curve Preview */}
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-800/60 text-[9px] font-mono text-neutral-400">
                        <span>Low: {preset.bands.b64 > 0 ? `+${preset.bands.b64}` : preset.bands.b64}dB</span>
                        <span>Mid: {preset.bands.b1k > 0 ? `+${preset.bands.b1k}` : preset.bands.b1k}dB</span>
                        <span>High: {preset.bands.b16k > 0 ? `+${preset.bands.b16k}` : preset.bands.b16k}dB</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-neutral-900/95 border border-rose-500/60 text-white text-xs font-medium shadow-xl shadow-black/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
            {toastMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Dialog: Save Custom Preset Modal */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <BookmarkPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {overwritePresetId ? t.updateCurrentPreset : t.saveCustomPresetModalTitle}
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {overwritePresetId 
                        ? (language === 'vi' ? 'Cập nhật lại thông số cho cấu hình này' : 'Update settings for this custom preset') 
                        : t.saveCustomPresetModalDesc}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notice if 5/5 reached and not overwriting */}
              {customPresets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS && !overwritePresetId && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>{t.maxCustomPresetsReached} (5/5)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-tight">
                    {t.maxCustomPresetsNotice}
                  </p>
                  <div className="pt-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      {language === 'vi' ? 'Chọn cấu hình muốn ghi đè:' : 'Select preset to overwrite:'}
                    </label>
                    <div className="space-y-1">
                      {customPresets.map((cp) => (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => {
                            setOverwritePresetId(cp.id);
                            setSavePresetName(cp.name);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center justify-between transition-colors"
                        >
                          <span className="font-medium truncate">{cp.name}</span>
                          <span className="text-[10px] text-amber-300 font-semibold">{language === 'vi' ? 'Ghi đè' : 'Overwrite'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preset Name Form */}
              <form onSubmit={handleConfirmSavePreset} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    {t.presetNameLabel}
                  </label>
                  <input
                    type="text"
                    value={savePresetName}
                    onChange={(e) => setSavePresetName(e.target.value)}
                    placeholder={t.presetNamePlaceholder}
                    maxLength={40}
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* EQ Snapshot Summary */}
                <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Preamp Gain:</span>
                    <strong className="text-neutral-200">{safeConfig.preampGain > 0 ? `+${safeConfig.preampGain}` : safeConfig.preampGain} dB</strong>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Low-Cut / High-Cut:</span>
                    <span className="text-neutral-200 font-mono">
                      {safeConfig.lowCutFreq ? `${safeConfig.lowCutFreq}Hz` : 'Off'} / {safeConfig.highCutFreq < 20000 ? `${safeConfig.highCutFreq / 1000}kHz` : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 pt-1 border-t border-neutral-800">
                    <span>10 Băng Tần (Bands):</span>
                    <span className="text-rose-300 font-mono text-[10px]">
                      32Hz ({safeConfig.bands.b32}dB) → 16kHz ({safeConfig.bands.b16k}dB)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={customPresets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS && !overwritePresetId}
                    className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      customPresets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS && !overwritePresetId
                        ? 'bg-neutral-700 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 shadow-md shadow-rose-500/25'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{overwritePresetId ? (language === 'vi' ? 'Cập Nhật' : 'Update') : t.save}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog: Rename Custom Preset Modal */}
        {renamingPreset && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-cyan-400" />
                  <span>{t.editName}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setRenamingPreset(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmRename} className="space-y-3">
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  maxLength={40}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenamingPreset(null)}
                    className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog: Delete Confirmation Modal */}
        {deletingPresetId && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'vi' ? 'Xác Nhận Xóa Cấu Hình' : 'Confirm Delete Preset'}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {t.confirmDeletePreset}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPresetId(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(deletingPresetId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  {t.deleteProject || 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between shrink-0">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Master EQ xử lý trực tiếp cả khi nghe thử và xuất video HD</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
