import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio, MasterEQConfig } from '../types';
import { DEFAULT_MASTER_EQ } from '../utils/presets';
import { Language, getTranslation, setSavedLanguage, SUPPORTED_LANGUAGES } from '../utils/i18n';
import { 
  Sparkles, 
  Download, 
  Camera, 
  Smartphone, 
  Square, 
  Tv, 
  Music, 
  FolderOpen, 
  Check, 
  RotateCcw, 
  Sliders, 
  Settings, 
  Globe,
  FilePlus2,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onSelectAspectRatio: (ar: AspectRatio) => void;
  onOpenExportModal: () => void;
  onCaptureSnapshot: () => void;
  onOpenPresetsModal: () => void;
  onOpenProjectsModal: () => void;
  onNewProject: () => void;
  onOpenMasterEqModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAboutModal?: () => void;
  onLoadDemoTrack: (type: 'lofi' | 'synthwave' | 'acoustic' | 'edm') => void;
  isLoadingAudio: boolean;
  savedIndicator?: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  masterEqConfig?: MasterEQConfig;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onSelectAspectRatio,
  onOpenExportModal,
  onCaptureSnapshot,
  onOpenPresetsModal,
  onOpenProjectsModal,
  onNewProject,
  onOpenMasterEqModal,
  onOpenSettingsModal,
  onOpenAboutModal,
  onLoadDemoTrack,
  isLoadingAudio,
  savedIndicator = false,
  language,
  onLanguageChange,
  masterEqConfig = DEFAULT_MASTER_EQ,
}) => {
  const t = getTranslation(language);
  const isMasterEqActive = Boolean(masterEqConfig?.enabled);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const demoMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target as Node)) {
        setDemoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const toggleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    const nextLang = SUPPORTED_LANGUAGES[nextIndex].code;
    onLanguageChange(nextLang);
    setSavedLanguage(nextLang);
  };

  return (
    <header className="h-14 sm:h-16 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md px-2 sm:px-4 flex items-center justify-between z-30 sticky top-0 gap-1 sm:gap-3">
      {/* Brand Zone */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
          <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
          </div>
        </div>
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              {t.appTitle}
            </span>
            {savedIndicator && (
              <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-medium text-emerald-300">
                <Check className="w-2.5 h-2.5" />
                {t.autoSaved}
              </span>
            )}
          </div>
          <span className="text-[10px] text-rose-400/90 font-medium tracking-wider uppercase">
            {t.appSubtitle}
          </span>
        </div>
      </div>

      {/* Center Zone: New, Projects, Presets, Master EQ, Demo & Aspect Ratio */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* New Project (Reset to Defaults) Button */}
        <button
          id="btn-header-new-project"
          onClick={onNewProject}
          title={language === 'vi' ? 'Dự án mới: Reset toàn bộ thông số về mặc định' : 'New Project: Reset all parameters to defaults'}
          className="flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-rose-500/60 text-xs font-semibold text-neutral-200 transition-all cursor-pointer shadow-sm hover:text-white"
        >
          <FilePlus2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">New</span>
        </button>

        {/* Projects / Save / Load Button */}
        <button
          onClick={onOpenProjectsModal}
          title={t.projectsAndSave}
          className="flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 hover:border-purple-500 text-xs font-semibold text-purple-200 transition-all cursor-pointer shadow-sm shadow-purple-950"
        >
          <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">{t.projectsAndSave}</span>
        </button>

        {/* Preset Templates Button */}
        <button
          onClick={onOpenPresetsModal}
          title={t.presetTemplates}
          className="flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/60 text-xs font-medium text-neutral-200 transition-all cursor-pointer hover:border-rose-500/50"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden lg:inline">{t.presetTemplates}</span>
        </button>

        {/* Pro Master Audio Equalizer (EQ) Button */}
        <button
          onClick={onOpenMasterEqModal}
          title={t.masterEqTitle}
          className={`flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            isMasterEqActive
              ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/50 text-cyan-200 shadow-sm shadow-cyan-950/40'
              : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700/60 text-neutral-400'
          }`}
        >
          <Sliders className={`w-3.5 h-3.5 ${isMasterEqActive ? 'text-cyan-400' : 'text-neutral-400'}`} />
          <span className="hidden sm:inline">{t.masterEq}</span>
          {isMasterEqActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline-block" />
          )}
        </button>

        {/* Demo Tracks Dropdown / Selector (Seamless bridge without physical gap) */}
        <div ref={demoMenuRef} className="relative group">
          <button
            type="button"
            disabled={isLoadingAudio}
            onClick={() => setDemoDropdownOpen((prev) => !prev)}
            title={t.selectDemo}
            className={`flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 md:px-3 sm:py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              demoDropdownOpen
                ? 'bg-neutral-800 border-rose-500/70 text-white shadow-sm ring-1 ring-rose-500/30'
                : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700/60 text-neutral-200'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">{t.demoMusic}</span>
          </button>
          
          {/* Dropdown container anchored with pt-1.5 to maintain seamless hover bridge */}
          <div className={`absolute top-full right-0 pt-1 w-52 z-50 ${demoDropdownOpen ? 'block' : 'hidden group-hover:block'}`}>
            <div className="bg-neutral-900 border border-neutral-800/90 rounded-xl shadow-2xl shadow-black/90 py-1.5 overflow-hidden backdrop-blur-md">
              <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60 mb-0.5">
                {t.selectDemo}
              </div>
              <button
                type="button"
                onClick={() => {
                  onLoadDemoTrack('synthwave');
                  setDemoDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-rose-500/15 hover:text-rose-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="font-medium">⚡ Neon Synthwave</span>
                <span className="text-[10px] text-neutral-400 font-mono">120 BPM</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoadDemoTrack('lofi');
                  setDemoDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-rose-500/15 hover:text-rose-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="font-medium">☕ Lofi Sunset Chill</span>
                <span className="text-[10px] text-neutral-400 font-mono">85 BPM</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoadDemoTrack('acoustic');
                  setDemoDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-rose-500/15 hover:text-rose-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="font-medium">🎸 Acoustic Romance</span>
                <span className="text-[10px] text-neutral-400 font-mono">95 BPM</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLoadDemoTrack('edm');
                  setDemoDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-rose-500/15 hover:text-rose-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <span className="font-medium">🌌 Deep Space EDM</span>
                <span className="text-[10px] text-neutral-400 font-mono">128 BPM</span>
              </button>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Selector Pills */}
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 p-0.5 rounded-lg">
          <button
            onClick={() => onSelectAspectRatio('9:16')}
            title="TikTok, Reels, Shorts (9:16)"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">9:16</span>
          </button>
          <button
            onClick={() => onSelectAspectRatio('1:1')}
            title="Instagram Square (1:1)"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '1:1'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">1:1</span>
          </button>
          <button
            onClick={() => onSelectAspectRatio('16:9')}
            title="YouTube Landscape (16:9)"
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">16:9</span>
          </button>
        </div>
      </div>

      {/* Action Zone: Language Quick Toggle, Settings, Snapshot & Export Video */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Instant Language Switcher Pill (Flag icon only on mobile, flag + code on desktop) */}
        <button
          onClick={toggleLanguage}
          title={currentLangMeta.description || currentLangMeta.name}
          className="flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-200 transition-all cursor-pointer shadow-sm"
        >
          <span className="text-sm leading-none">{currentLangMeta.flag}</span>
          <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">{currentLangMeta.code}</span>
        </button>

        {/* Global Settings Modal Trigger */}
        <button
          onClick={onOpenSettingsModal}
          title={t.globalSettings}
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:border-purple-500/50"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
        </button>

        {/* About Modal Trigger (? icon only) */}
        <button
          type="button"
          onClick={onOpenAboutModal}
          title={language === 'vi' ? 'Thông tin ứng dụng (About)' : 'About Sona Wave Pro'}
          aria-label={language === 'vi' ? 'Thông tin ứng dụng' : 'About'}
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:border-cyan-500/50"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
        </button>

        {/* Snapshot */}
        <button
          onClick={onCaptureSnapshot}
          title={t.snapshot}
          className="p-1.5 sm:p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Export Video */}
        <button
          onClick={onOpenExportModal}
          title={t.exportVideo}
          className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t.exportVideo}</span>
        </button>
      </div>
    </header>
  );
};

