import React, { useEffect } from 'react';
import { RotateCcw, X, AlertTriangle, Music, Sliders, Image, Type } from 'lucide-react';
import { Language } from '../utils/i18n';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: Language;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  language = 'vi',
}) => {
  const isVi = language === 'vi';

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isVi ? 'Tạo Dự Án Mới' : 'Create New Project'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isVi ? 'Khôi phục cài đặt gốc về mặc định' : 'Reset all parameters to default'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-300">
                {isVi
                  ? 'Bạn có chắc chắn muốn tạo dự án mới?'
                  : 'Are you sure you want to start a new project?'}
              </p>
              <p className="text-neutral-300 leading-relaxed">
                {isVi
                  ? 'Mọi thông số hiện tại chưa lưu (sóng âm, ảnh/video nền, lời bài hát và playlist) sẽ được đặt lại về trạng thái mặc định của SonaWave.'
                  : 'All unsaved parameters (visualizer, background/video, lyrics, and playlist) will be reset to default SonaWave configuration.'}
              </p>
            </div>
          </div>

          {/* Quick list of what will be reset */}
          <div className="space-y-2 text-xs text-neutral-300 bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              {isVi ? 'Nội dung sẽ được làm mới:' : 'Items to be reset:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Sliders className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{isVi ? 'Sóng âm & Tỉ lệ 9:16' : 'Visualizer & 9:16 Ratio'}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Image className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{isVi ? 'Hình ảnh & Video nền' : 'Background & Video'}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{isVi ? 'Bài hát mẫu Demo' : 'Default Demo Track'}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Type className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isVi ? 'Lời bài hát & Hộp chữ' : 'Lyrics & Text Boxes'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-neutral-800/90 bg-neutral-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            {isVi ? 'Hủy bỏ' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Xác Nhận Tạo Mới' : 'Reset to Default'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
