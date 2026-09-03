import React, { useState, useEffect, useRef } from 'react';
import { PresetTheme, AspectRatio, VisualizerConfig, LyricsConfig, BackgroundConfig, ParticleConfig, FilmLightConfig, ColorGradingConfig, TrackMetadata, TextBoxItem } from '../types';
import { PRESET_THEMES, getUserPresets, saveUserPreset, deleteUserPreset, clearAllUserPresets, exportUserPresetsJson, importUserPresets, DEFAULT_TRACK } from '../utils/presets';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { X, Sparkles, Smartphone, Square, Tv, Plus, Trash2, Download, Upload, Check, Bookmark, Layers, AlertTriangle } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: PresetTheme) => void;
  language?: Language;
  currentConfig?: {
    aspectRatio: AspectRatio;
    visualizer: VisualizerConfig;
    lyrics?: LyricsConfig;
    background: BackgroundConfig;
    particles: ParticleConfig;
    filmLight?: FilmLightConfig;
    colorGrading?: ColorGradingConfig;
    track?: TrackMetadata;
    textBoxes?: TextBoxItem[];
  };
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  language = 'vi',
  currentConfig,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['vi'];
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const [userPresets, setUserPresets] = useState<PresetTheme[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeletePreset, setConfirmDeletePreset] = useState<{ id: string; name: string } | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user presets on open
  useEffect(() => {
    if (isOpen) {
      setUserPresets(getUserPresets());
      setIsCreating(false);
      setConfirmDeletePreset(null);
      setConfirmClearAll(false);
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (!isOpen) return null;

  const handleSaveCurrentPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) {
      showToast(language === 'vi' ? 'Vui lòng nhập tên cho preset!' : 'Please enter a preset name!');
      return;
    }

    if (!currentConfig) {
      showToast(language === 'vi' ? 'Không có cấu hình để lưu!' : 'No configuration available to save!');
      return;
    }

    const newId = `user-preset-${Date.now()}`;
    const newPreset: PresetTheme = {
      id: newId,
      name: presetName.trim(),
      nameVi: presetName.trim(),
      description: presetDesc.trim() || (language === 'vi' ? 'Preset tùy chỉnh của bạn' : 'Your custom preset'),
      aspectRatio: currentConfig.aspectRatio || '9:16',
      visualizer: { ...currentConfig.visualizer },
      lyrics: currentConfig.lyrics ? { ...currentConfig.lyrics } : undefined,
      background: { ...currentConfig.background },
      particles: { ...currentConfig.particles },
      filmLight: currentConfig.filmLight ? { ...currentConfig.filmLight } : undefined,
      colorGrading: currentConfig.colorGrading ? { ...currentConfig.colorGrading } : undefined,
      track: currentConfig.track ? { ...currentConfig.track } : { ...DEFAULT_TRACK },
      textBoxes: currentConfig.textBoxes ? [...currentConfig.textBoxes] : undefined,
      thumbnail: currentConfig.background.type === 'image' && currentConfig.background.imageUrl
        ? currentConfig.background.imageUrl
        : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      isUserPreset: true,
      createdAt: Date.now(),
    };

    const updated = saveUserPreset(newPreset);
    setUserPresets(updated);
    setPresetName('');
    setPresetDesc('');
    setIsCreating(false);
    setActiveTab('custom');
    showToast(t.presetSavedSuccess || (language === 'vi' ? 'Đã lưu Preset thành công!' : 'Preset saved successfully!'));
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setConfirmDeletePreset({ id, name });
  };

  const executeDelete = () => {
    if (!confirmDeletePreset) return;
    const { id, name } = confirmDeletePreset;
    const updated = deleteUserPreset(id);
    setUserPresets(updated);
    setConfirmDeletePreset(null);
    showToast(
      t.presetDeletedSuccess ||
        (language === 'vi' ? `Đã xóa Preset "${name}"!` : `Preset "${name}" deleted!`)
    );
  };

  const executeClearAll = () => {
    const updated = clearAllUserPresets();
    setUserPresets(updated);
    setConfirmClearAll(false);
    showToast(language === 'vi' ? 'Đã xóa toàn bộ Preset tùy chỉnh!' : 'All custom presets deleted!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const { count, presets } = importUserPresets(parsed);
        setUserPresets(presets);
        setActiveTab('custom');
        showToast(
          language === 'vi'
            ? `Đã nhập thành công ${count} preset!`
            : `Imported ${count} presets successfully!`
        );
      } catch (err: any) {
        showToast(language === 'vi' ? 'File JSON không hợp lệ!' : 'Invalid JSON file!');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 max-h-[92vh]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
            <Check className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {t.presetsTitle || (language === 'vi' ? 'Thư Viện Presets Sóng Nhạc' : 'Visualizer Presets Library')}
              </h3>
              <p className="text-xs text-neutral-400">
                {t.presetsSubtitle || (language === 'vi' ? 'Chọn phong cách có sẵn hoặc tự tạo preset của riêng bạn' : 'Select built-in styles or manage your own presets')}
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

        {/* Navigation Tabs & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
            <button
              onClick={() => {
                setActiveTab('builtin');
                setIsCreating(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'builtin'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.builtInPresets || (language === 'vi' ? 'Mẫu Có Sẵn' : 'Built-in')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {PRESET_THEMES.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('custom')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t.myCustomPresets || (language === 'vi' ? 'Preset Của Tôi' : 'My Presets')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                {userPresets.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isCreating
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                  : 'bg-gradient-to-r from-rose-500 to-amber-500 border-transparent text-white shadow-md shadow-rose-500/20 hover:brightness-110'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.saveAsNewPreset || (language === 'vi' ? 'Lưu Cấu Hình Hiện Tại' : 'Save Current Settings')}</span>
            </button>
          </div>
        </div>

        {/* Create / Save Preset Form Drawer */}
        {isCreating && (
          <form
            onSubmit={handleSaveCurrentPreset}
            className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-3 animate-fade-in shadow-xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t.savePresetModalTitle || (language === 'vi' ? 'Tạo Preset Mới Từ Cấu Hình Hiện Tại' : 'Create New Preset from Current Settings')}
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  {t.presetName || (language === 'vi' ? 'Tên Preset' : 'Preset Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'vi' ? 'Ví dụ: Sóng Neon EDM Hoàng Hôn...' : 'E.g., Neon Sunset Chill...'}
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  {t.presetDescription || (language === 'vi' ? 'Mô tả ngắn (tùy chọn)' : 'Description (optional)')}
                </label>
                <input
                  type="text"
                  placeholder={language === 'vi' ? 'Mô tả phong cách, thể loại nhạc phù hợp...' : 'Genre, mood, or purpose...'}
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {currentConfig && (
              <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
                <span>{language === 'vi' ? 'Tỷ lệ khung hình:' : 'Aspect Ratio:'} <strong className="text-white">{currentConfig.aspectRatio}</strong></span>
                <span>•</span>
                <span>{language === 'vi' ? 'Kiểu visualizer:' : 'Visualizer:'} <strong className="text-white capitalize">{currentConfig.visualizer.type.replace('-', ' ')}</strong></span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>{language === 'vi' ? 'Màu:' : 'Colors:'}</span>
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: currentConfig.visualizer.primaryColor }} />
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: currentConfig.visualizer.secondaryColor }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                {t.cancel || (language === 'vi' ? 'Hủy' : 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                {t.saveAsNewPreset || (language === 'vi' ? 'Lưu Vào Preset Của Tôi' : 'Save To My Presets')}
              </button>
            </div>
          </form>
        )}

        {/* Preset Cards Display Area */}
        <div className="overflow-y-auto pr-1 custom-scrollbar max-h-[58vh]">
          {activeTab === 'builtin' ? (
            /* Built-in Presets Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      referrerPolicy="no-referrer"
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
          ) : (
            /* User Custom Presets */
            <div>
              {userPresets.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {t.noUserPresets || (language === 'vi' ? 'Chưa có preset tùy chỉnh nào' : 'No custom presets yet')}
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-sm mt-1">
                      {language === 'vi'
                        ? 'Bạn có thể tinh chỉnh các thông số sóng nhạc, hạt, ánh sáng và lưu lại thành Preset để áp dụng nhanh cho các bài hát sau.'
                        : 'Adjust wave shapes, particles, and colors, then click "Save Current Settings" to create your first preset.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Tạo Preset Đầu Tiên' : 'Create First Preset'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userPresets.map((theme) => (
                    <div
                      key={theme.id}
                      className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/90 hover:border-amber-500/60 transition-all flex flex-col gap-3 shadow-lg"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                        {theme.thumbnail ? (
                          <img
                            src={theme.thumbnail}
                            alt={theme.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${theme.visualizer.primaryColor}44, ${theme.visualizer.secondaryColor}44)`,
                            }}
                          >
                            <Sparkles className="w-8 h-8 text-white/50" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-200 flex items-center gap-1">
                          {theme.aspectRatio === '9:16' && <Smartphone className="w-3 h-3 text-rose-400" />}
                          {theme.aspectRatio === '1:1' && <Square className="w-3 h-3 text-purple-400" />}
                          {theme.aspectRatio === '16:9' && <Tv className="w-3 h-3 text-cyan-400" />}
                          <span>{theme.aspectRatio}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">
                            {theme.name}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {theme.createdAt ? new Date(theme.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                          {theme.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.visualizer.primaryColor }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border border-white/20"
                            style={{ backgroundColor: theme.visualizer.secondaryColor }}
                          />
                          <span className="text-[10px] text-neutral-500 capitalize">
                            {theme.visualizer.type.replace('-', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, theme.id, theme.name)}
                            title={language === 'vi' ? 'Xóa preset này' : 'Delete this preset'}
                            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectTheme(theme);
                              onClose();
                            }}
                            className="flex items-center gap-1 py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            <Check className="w-3 h-3" />
                            <span>{t.applyPreset || (language === 'vi' ? 'Áp Dụng' : 'Apply')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Import, Export, and Clear Tools for User Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.importPresetsJson || (language === 'vi' ? 'Nhập Presets (JSON)' : 'Import JSON')}</span>
            </button>

            <button
              type="button"
              onClick={exportUserPresetsJson}
              disabled={userPresets.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportPresetsJson || (language === 'vi' ? 'Xuất Presets (JSON)' : 'Export JSON')}</span>
            </button>

            {activeTab === 'custom' && userPresets.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 text-xs font-medium border border-neutral-700 hover:border-rose-500/40 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'Xóa Hết' : 'Clear All'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer ml-auto"
          >
            {language === 'vi' ? 'Đóng' : 'Close'}
          </button>
        </div>

        {/* Delete Single Preset Confirmation Dialog (No window.confirm to support sandboxed iframes) */}
        {confirmDeletePreset && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'vi' ? 'Xác Nhận Xóa Preset' : 'Confirm Delete Preset'}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {language === 'vi'
                      ? `Bạn có chắc chắn muốn xóa vĩnh viễn preset "${confirmDeletePreset.name}" không?`
                      : `Are you sure you want to delete preset "${confirmDeletePreset.name}"?`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setConfirmDeletePreset(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {t.cancel || (language === 'vi' ? 'Hủy' : 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-rose-900/30"
                >
                  {language === 'vi' ? 'Xóa Vĩnh Viễn' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Custom Presets Confirmation Dialog */}
        {confirmClearAll && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'vi' ? 'Xóa Toàn Bộ Preset' : 'Clear All Presets'}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {language === 'vi'
                      ? 'Thao tác này sẽ xóa toàn bộ các preset tùy chỉnh bạn đã lưu trong trình duyệt. Bạn có chắc không?'
                      : 'This will delete all custom presets stored in your browser. Are you sure?'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {t.cancel || (language === 'vi' ? 'Hủy' : 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={executeClearAll}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-rose-900/30"
                >
                  {language === 'vi' ? 'Xóa Hết' : 'Clear All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
