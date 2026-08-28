import React, { useState, useEffect, useRef } from 'react';
import {
  AspectRatio,
  VisualizerConfig,
  LyricsConfig,
  LyricLine,
  BackgroundConfig,
  ParticleConfig,
  TrackMetadata,
  TextBoxItem,
} from '../types';
import {
  SavedProject,
  getSavedProjects,
  saveProject,
  deleteProject,
  clearAllProjects,
  exportProjectAsJSON,
  importProjectFromJSON,
  getAutoSave,
  hasAutoSave,
  clearAutoSave,
} from '../utils/projectStorage';
import {
  X,
  FolderOpen,
  Save,
  Trash2,
  Download,
  Upload,
  Clock,
  Music,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  Square,
  Tv,
  RotateCcw,
  Sparkles,
  Search,
  FileCode,
} from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: {
    aspectRatio: AspectRatio;
    visualizer: VisualizerConfig;
    lyricsConfig: LyricsConfig;
    lyricsData: LyricLine[];
    background: BackgroundConfig;
    particles: ParticleConfig;
    track: TrackMetadata;
    textBoxes: TextBoxItem[];
    audioFileName: string;
  };
  onLoadProject: (project: SavedProject) => void;
  onResetToDefaults: () => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onLoadProject,
  onResetToDefaults,
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [projectName, setProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [autoSaveData, setAutoSaveData] = useState<SavedProject | null>(null);

  // In-app confirmation dialog states (no window.confirm which fails in iframes)
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<{ id: string; name: string } | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmResetDefaults, setConfirmResetDefaults] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reload projects list on open
  useEffect(() => {
    if (isOpen) {
      const saved = getSavedProjects();
      setProjects(saved);
      setAutoSaveData(getAutoSave());
      setProjectName(currentConfig.track.title || 'Dự án SonaWave mới');
      setNotification(null);
      setConfirmDeleteProject(null);
      setConfirmClearAll(false);
      setConfirmResetDefaults(false);
    }
  }, [isOpen, currentConfig.track.title]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  if (!isOpen) return null;

  // Handle Save Current Project
  const handleSaveCurrent = (overrideId?: string) => {
    const trimmedName = projectName.trim() || currentConfig.track.title || 'Dự án chưa đặt tên';
    const saved = saveProject({
      id: overrideId,
      name: trimmedName,
      aspectRatio: currentConfig.aspectRatio,
      visualizer: currentConfig.visualizer,
      lyricsConfig: currentConfig.lyricsConfig,
      lyricsData: currentConfig.lyricsData,
      background: currentConfig.background,
      particles: currentConfig.particles,
      track: currentConfig.track,
      textBoxes: currentConfig.textBoxes,
      audioFileName: currentConfig.audioFileName,
    });

    setProjects(getSavedProjects());
    setSelectedProjectId(saved.id);
    showNotification('success', `Đã lưu dự án "${saved.name}" vào trình duyệt!`);
  };

  // Handle Load Project
  const handleLoad = (project: SavedProject) => {
    onLoadProject(project);
    showNotification('success', `Đã tải dự án "${project.name}" thành công!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Handle Delete Single Project (Confirmed)
  const executeDeleteProject = (id: string, name: string) => {
    const success = deleteProject(id);
    if (success) {
      const updated = getSavedProjects();
      setProjects(updated);
      if (selectedProjectId === id) setSelectedProjectId(null);
      setConfirmDeleteProject(null);
      showNotification('success', `Đã xóa vĩnh viễn dự án "${name}".`);
    } else {
      showNotification('error', `Không thể xóa dự án "${name}".`);
    }
  };

  // Handle Clear All Projects (Confirmed)
  const executeClearAll = () => {
    clearAllProjects();
    setProjects([]);
    setSelectedProjectId(null);
    setConfirmClearAll(false);
    showNotification('success', 'Đã xóa toàn bộ danh sách dự án lưu trong trình duyệt.');
  };

  // Handle Clear AutoSave
  const handleClearAutoSave = () => {
    clearAutoSave();
    setAutoSaveData(null);
    showNotification('success', 'Đã xóa phiên làm việc tự động lưu.');
  };

  // Handle Import JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const imported = await importProjectFromJSON(e.target.files[0]);
        saveProject(imported);
        setProjects(getSavedProjects());
        onLoadProject(imported);
        showNotification('success', `Đã nhập và mở dự án "${imported.name}"!`);
        setTimeout(() => {
          onClose();
        }, 800);
      } catch (err: any) {
        showNotification('error', err.message || 'Lỗi khi nhập file dự án JSON!');
      }
      e.target.value = '';
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Glow Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/90 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-rose-600/30 border border-purple-500/40 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Quản Lý Dự Án (Local Storage)</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-mono">
                  {projects.length} đã lưu
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Lưu cấu hình visualizer, background, lyrics, bài hát và tiếp tục bất cứ lúc nào
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

        {/* In-app Confirmation Dialog Overlay */}
        {confirmDeleteProject && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-600/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-rose-950/50">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Xác nhận xóa dự án "{confirmDeleteProject.name}"?
                </span>
                <span className="text-[11px] text-rose-300">
                  Dữ liệu dự án này sẽ bị xóa vĩnh viễn khỏi Local Storage của trình duyệt.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setConfirmDeleteProject(null)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => executeDeleteProject(confirmDeleteProject.id, confirmDeleteProject.name)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-900/40 active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        )}

        {confirmClearAll && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-600/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-rose-950/50">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Xóa tất cả {projects.length} dự án đã lưu?
                </span>
                <span className="text-[11px] text-rose-300">
                  Tất cả các bản lưu trong Local Storage sẽ bị dọn dẹp sạch sẽ.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={executeClearAll}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-900/40 active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Tất Cả</span>
              </button>
            </div>
          </div>
        )}

        {confirmResetDefaults && (
          <div className="p-3.5 bg-amber-950/70 border border-amber-600/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in shadow-lg shadow-amber-950/40">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Đặt lại toàn bộ về dự án mặc định ban đầu?
                </span>
                <span className="text-[11px] text-amber-200/80">
                  Mọi cài đặt chưa lưu sẽ được làm mới về cấu hình gốc của SonaWave.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => setConfirmResetDefaults(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setConfirmResetDefaults(false);
                  onResetToDefaults();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt Lại Ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* 1. Quick Save Bar */}
        <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 focus-within:border-rose-500">
            <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">Tên dự án:</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nhập tên dự án..."
              className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSaveCurrent()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Dự Án Mới</span>
            </button>

            <button
              onClick={() => {
                const currentAsProj: SavedProject = {
                  id: `temp_${Date.now()}`,
                  name: projectName || currentConfig.track.title,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  ...currentConfig,
                };
                exportProjectAsJSON(currentAsProj);
                showNotification('success', 'Đã tải file dự án .sonawave.json về máy!');
              }}
              title="Xuất file dự án (.json)"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.sonawave"
              className="hidden"
              onChange={handleImportFile}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Nhập file dự án (.json)"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Auto-save recovery banner if available */}
        {autoSaveData && (
          <div className="flex items-center justify-between bg-purple-950/40 border border-purple-800/60 rounded-xl px-3.5 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
              <div className="text-xs truncate">
                <span className="text-purple-200 font-semibold">Phiên làm việc tự động gần nhất: </span>
                <span className="text-neutral-300">{autoSaveData.track.title}</span>
                <span className="text-[10px] text-neutral-400 ml-2">({formatDate(autoSaveData.updatedAt)})</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleLoad(autoSaveData)}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-all"
              >
                Khôi phục
              </button>
              <button
                onClick={handleClearAutoSave}
                title="Xóa phiên tự động lưu này"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/60 text-neutral-400 hover:text-rose-300 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3. Search & List Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm dự án đã lưu..."
                className="w-full bg-neutral-950/70 border border-neutral-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {projects.length > 0 && (
                <button
                  onClick={() => setConfirmClearAll(true)}
                  title="Xóa tất cả dự án trong Local Storage"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-rose-950/60 border border-neutral-700/60 hover:border-rose-700/60 text-neutral-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa tất cả</span>
                </button>
              )}

              <button
                onClick={() => setConfirmResetDefaults(true)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dự án mới (Mặc định)</span>
                <span className="sm:hidden">Mặc định</span>
              </button>
            </div>
          </div>

          {/* Projects Scrollable List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[160px] max-h-[360px]">
            {filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
                <FolderOpen className="w-10 h-10 stroke-[1.2] text-neutral-600" />
                <p className="text-xs">
                  {searchQuery ? 'Không tìm thấy dự án nào khớp từ khóa.' : 'Chưa có dự án nào được lưu trong trình duyệt.'}
                </p>
                <p className="text-[11px] text-neutral-600">
                  Nhập tên và bấm "Lưu Dự Án Mới" ở trên để lưu lại công việc của bạn!
                </p>
              </div>
            ) : (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedProjectId === p.id
                      ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-900/10'
                      : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Thumbnail or Color Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden"
                      style={{
                        backgroundColor: p.visualizer.primaryColor || '#ec4899',
                      }}
                    >
                      {p.track.coverUrl ? (
                        <img
                          src={p.track.coverUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                        />
                      ) : (
                        <Music className="w-5 h-5 text-white drop-shadow" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                        {/* Aspect Ratio Badge */}
                        <span className="px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-mono text-neutral-300 flex items-center gap-1 shrink-0">
                          {p.aspectRatio === '9:16' && <Smartphone className="w-2.5 h-2.5 text-rose-400" />}
                          {p.aspectRatio === '1:1' && <Square className="w-2.5 h-2.5 text-purple-400" />}
                          {p.aspectRatio === '16:9' && <Tv className="w-2.5 h-2.5 text-cyan-400" />}
                          {p.aspectRatio}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {p.track.title} • {p.track.artist}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-mono">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span>{formatDate(p.updatedAt)}</span>
                        <span>•</span>
                        <span className="capitalize">{p.visualizer.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleLoad(p)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Mở dự án
                    </button>

                    <button
                      onClick={() => handleSaveCurrent(p.id)}
                      title="Ghi đè bằng cài đặt hiện tại"
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => exportProjectAsJSON(p)}
                      title="Tải file JSON"
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
                    >
                      <FileCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setConfirmDeleteProject({ id: p.id, name: p.name })}
                      title="Xóa dự án"
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-900/60 text-neutral-400 hover:text-rose-300 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
