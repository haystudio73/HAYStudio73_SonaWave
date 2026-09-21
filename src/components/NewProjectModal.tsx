import React, { useEffect, useState } from 'react';
import { RotateCcw, X, AlertTriangle, Music, Sliders, Image, Type, Smartphone, Zap, CheckCircle2, Cpu } from 'lucide-react';
import { Language } from '../utils/i18n';

export type NewProjectHardwareProfile = 'low-hardware' | 'standard';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profile: NewProjectHardwareProfile) => void;
  language: Language;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  language = 'vi',
}) => {
  const isVi = language === 'vi';
  // Default to low-hardware settings first for mobile, low VGA, low RAM devices
  const [selectedProfile, setSelectedProfile] = useState<NewProjectHardwareProfile>('low-hardware');

  // Handle ESC key press and reset to low-hardware on open
  useEffect(() => {
    if (!isOpen) return;
    setSelectedProfile('low-hardware');

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
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isVi ? 'Tạo Dự Án Mới' : 'Create New Project'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isVi ? 'Khôi phục cài đặt gốc và tối ưu hiệu năng thiết bị' : 'Reset to defaults & optimize hardware profile'}
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

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-300">
                {isVi
                  ? 'Xác nhận tạo mới dự án?'
                  : 'Start a fresh project?'}
              </p>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                {isVi
                  ? 'Mọi thông số hiện tại chưa lưu (sóng âm, ảnh/video nền, lời bài hát và danh sách phát) sẽ được thiết lập lại từ đầu.'
                  : 'All unsaved parameters (visualizer, background/video, lyrics, and playlist) will be reset.'}
              </p>
            </div>
          </div>

          {/* Hardware Performance Profile Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
                <span>{isVi ? 'Cấu hình phần cứng (Ưu tiên máy yếu/mobile):' : 'Hardware Performance Mode:'}</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                {isVi ? 'Tùy chọn nhẹ mặc định' : 'Low-spec first'}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Low Hardware (Mobile / Low VGA / Low RAM) - FIRST & DEFAULT */}
              <div
                onClick={() => setSelectedProfile('low-hardware')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedProfile === 'low-hardware'
                    ? 'bg-rose-950/20 border-rose-500 ring-1 ring-rose-500/50 shadow-md shadow-rose-950/30'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      selectedProfile === 'low-hardware'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {isVi
                            ? 'Cấu hình Thấp / Tiết Kiệm (Mobile, PC VGA yếu, RAM thấp)'
                            : 'Low Hardware Profile (Mobile, Low VGA, Low RAM)'}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          {isVi ? 'Mặc định khuyên dùng' : 'Default & Recommended'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        {isVi
                          ? 'Bật Chế độ Render Hiệu Năng Cao (giảm 60% tải GPU), tắt Bloom nặng, tối ưu 36 cột sóng nhẹ. Giúp xem trước và xuất video siêu mượt 60 FPS, không bị giật lag trên điện thoại, máy không có card VGA rời hoặc RAM ≤ 4GB/8GB.'
                          : 'Enables High-Performance render path (-60% GPU fill load), disables heavy bloom blur, optimizes with 36 lightweight bars. Ensures silky-smooth 60 FPS on mobile, integrated iGPU/VGA, and low RAM.'}
                      </p>
                      <div className="flex items-center gap-2.5 pt-1 text-[10px] text-neutral-400 flex-wrap">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {isVi ? 'Eco CPU-Safe' : 'Eco CPU-Safe'}
                        </span>
                        <span>•</span>
                        <span className="text-neutral-300">{isVi ? 'Tắt đổ bóng nặng' : 'Skip heavy shadow blur'}</span>
                        <span>•</span>
                        <span className="text-emerald-400/90">{isVi ? 'Mượt 60 FPS' : 'Smooth 60 FPS'}</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="hardwareProfile"
                    checked={selectedProfile === 'low-hardware'}
                    onChange={() => setSelectedProfile('low-hardware')}
                    className="mt-1 text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Option 2: High-End GPU / Full Graphics */}
              <div
                onClick={() => setSelectedProfile('standard')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedProfile === 'standard'
                    ? 'bg-rose-950/20 border-rose-500 ring-1 ring-rose-500/50 shadow-md shadow-rose-950/30'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      selectedProfile === 'standard'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {isVi
                            ? 'Cấu hình Tiêu Chuẩn / Đồ Họa Cao (PC Mạnh, Card VGA Rời)'
                            : 'Standard / High-End GPU (Dedicated Graphics, High RAM)'}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                          {isVi ? 'Full GPU' : 'Full GPU'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        {isVi
                          ? 'Độ phân giải hiển thị gốc 100%, hiệu ứng phát sáng Neon Bloom đa tầng và 48 dải sóng. Thích hợp cho máy tính để bàn hoặc laptop có card đồ họa rời (NVIDIA, AMD hoặc Apple Silicon M-series).'
                          : 'Full 100% native preview resolution, multi-pass Neon Bloom glow, and 48 frequency bars. Recommended for PCs with dedicated GPUs (NVIDIA/AMD/Apple Silicon).'}
                      </p>
                      <div className="flex items-center gap-2.5 pt-1 text-[10px] text-neutral-400 flex-wrap">
                        <span className="text-rose-400 font-semibold">GPU Max Mode</span>
                        <span>•</span>
                        <span className="text-neutral-300">{isVi ? 'Đầy đủ Bloom phát sáng' : 'Full Neon Bloom Glow'}</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="hardwareProfile"
                    checked={selectedProfile === 'standard'}
                    onChange={() => setSelectedProfile('standard')}
                    className="mt-1 text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
              </div>
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

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-neutral-800/90 bg-neutral-950/60 shrink-0">
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
              onConfirm(selectedProfile);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {isVi
                ? (selectedProfile === 'low-hardware' ? 'Xác Nhận Tạo Mới (Cấu Hình Nhẹ)' : 'Xác Nhận Tạo Mới (Đồ Họa Cao)')
                : (selectedProfile === 'low-hardware' ? 'Reset to Default (Low-Spec)' : 'Reset to Default (Full GPU)')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
