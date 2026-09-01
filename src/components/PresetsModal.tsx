import React from 'react';
import { PresetTheme } from '../types';
import { PRESET_THEMES } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { X, Sparkles, Smartphone, Square, Tv } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: PresetTheme) => void;
  language?: Language;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  language = 'vi',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.presetsTitle}</h3>
              <p className="text-xs text-neutral-400">
                {t.presetsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar max-h-[65vh]">
          {PRESET_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onSelectTheme(theme);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/90 hover:border-rose-500/60 hover:bg-neutral-900/60 transition-all text-left group flex flex-col gap-3 cursor-pointer shadow-lg hover:shadow-rose-500/10"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                <img
                  src={theme.thumbnail}
                  alt={language === 'vi' ? theme.nameVi : theme.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-200 flex items-center gap-1">
                  {theme.aspectRatio === '9:16' && <Smartphone className="w-3 h-3 text-rose-400" />}
                  {theme.aspectRatio === '1:1' && <Square className="w-3 h-3 text-purple-400" />}
                  {theme.aspectRatio === '16:9' && <Tv className="w-3 h-3 text-cyan-400" />}
                  <span>{theme.aspectRatio}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  {language === 'vi' ? theme.nameVi : theme.name}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                  {theme.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800/80">
                <div
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.visualizer.primaryColor }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.visualizer.secondaryColor }}
                />
                <span className="text-[10px] text-neutral-500 ml-auto capitalize">
                  {theme.visualizer.type.replace('-', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
