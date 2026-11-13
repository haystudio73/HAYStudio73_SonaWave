import React, { useEffect } from 'react';
import { Language } from '../utils/i18n';
import {
  HelpCircle,
  X,
  Music,
  ShieldCheck,
  Code2,
  User,
  ExternalLink,
  Youtube,
  Globe,
  Sparkles,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const APP_VERSION = '2.0.0';

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isVi = language === 'vi';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-rose-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {isVi ? 'Thông Tin Ứng Dụng' : 'About Sona Wave Pro'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isVi
                  ? 'Phiên bản phần mềm, giấy phép mã nguồn mở & tác giả'
                  : 'Software version, open-source license & author info'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {/* App Identity & Version */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-purple-950/20 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-[1.5px] shrink-0">
                <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
                  <Music className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Sona Wave Pro</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                    <Sparkles className="w-2.5 h-2.5" />
                    v{APP_VERSION}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {isVi
                    ? 'Studio Tạo Video Sóng Âm & Lyrics Chuyên Nghiệp'
                    : 'Audio & Lyrics Video Studio for Shorts, Reels & YouTube'}
                </p>
              </div>
            </div>
          </div>

          {/* Open Source License */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {isVi ? 'Giấy Phép Mã Nguồn Mở' : 'Open Source License'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 font-mono">
                MIT / Open Source
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {isVi
                ? 'Dự án được cung cấp miễn phí theo giấy phép mã nguồn mở (MIT License) cho mục đích sử dụng cá nhân, học tập và sáng tạo nội dung thương mại.'
                : 'This project is provided open-source under the MIT License, free for personal, educational, and commercial video creation.'}
            </p>

            <div className="pt-2 border-t border-neutral-800/80 flex items-start gap-2">
              <Code2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {isVi
                  ? 'Công nghệ mã nguồn mở sử dụng: React, TypeScript, Vite, Tailwind CSS, Three.js (WebGL), Lucide Icons, Lottie Web / dotLottie, fflate & Canvas 2D Engine.'
                  : 'Built with open-source libraries: React, TypeScript, Vite, Tailwind CSS, Three.js (WebGL), Lucide Icons, Lottie Web / dotLottie, fflate & Canvas 2D Engine.'}
              </p>
            </div>
          </div>

          {/* Author Info */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/90 space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isVi ? 'Thông Tin Tác Giả' : 'Author Information'}
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <span className="text-xs text-neutral-400">
                {isVi ? 'Nhà phát triển' : 'Creator / Studio'}
              </span>
              <span className="text-xs font-bold text-white">HAY Studio73</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Facebook Link */}
              <a
                href="https://www.facebook.com/HAY.Studio73"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/30 hover:border-blue-400/60 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-blue-200 block">Facebook</span>
                    <span className="text-[10px] text-blue-300/70 truncate block">
                      /HAY.Studio73
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>

              {/* YouTube Link */}
              <a
                href="https://www.youtube.com/@HAY.Studio73"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 hover:border-red-400/60 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-red-200 block">YouTube</span>
                    <span className="text-[10px] text-red-300/70 truncate block">
                      /@HAY.Studio73
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">
            © {new Date().getFullYear()} HAY Studio73 • v{APP_VERSION}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
