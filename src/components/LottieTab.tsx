import React, { useState, useId, useRef, useEffect } from 'react';
import lottie from 'lottie-web';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LottieItem, LottieLayerOrder, LottieLibraryItem } from '../types';
import { FREE_LOTTIE_PRESETS } from '../data/freeLotties';
import { getEmbeddedLottieData } from '../data/embeddedLottieData';
import { loadLottieSource, isDotLottieSource, sanitizeLottieUrl } from '../utils/lottieLoader';
import { Language } from '../utils/i18n';
import {
  Sparkles,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Move,
  Maximize2,
  Layers,
  Search,
  Upload,
  Link as LinkIcon,
  RotateCw,
  Activity,
  Check,
  Music,
  Zap,
  Coffee,
  Flame,
  ArrowUp,
  ArrowDown,
  X,
  Compass,
  Loader2
} from 'lucide-react';

const LottieThumbnail: React.FC<{ item: LottieLibraryItem | LottieItem }> = ({ item }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const rawUrl = item.url || '';
  const url = rawUrl ? sanitizeLottieUrl(rawUrl) : '';
  const isDotLottie =
    item.format === 'dotlottie' ||
    isDotLottieSource(url);

  // If no animation data and we have a url, extract via background worker/zip
  useEffect(() => {
    let active = true;
    if (!item.animationData && url) {
      loadLottieSource(url)
        .then(({ animationData }) => {
          if (active) {
            if (animationData) {
              setExtractedData(animationData);
              setLoadFailed(false);
            } else if (!isDotLottie) {
              setLoadFailed(true);
            }
          }
        })
        .catch(() => {
          if (active && !isDotLottie) {
            setLoadFailed(true);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [url, item.animationData, isDotLottie]);

  // Standard lottie-web SVG render when animationData is available
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean previous elements to avoid duplicate SVGs
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    setLoadFailed(false);

    let rawData =
      item.animationData ||
      extractedData ||
      getEmbeddedLottieData(item.id) ||
      getEmbeddedLottieData((item as any).name || '');

    if (!rawData) {
      if (!isDotLottie && !url) {
        setLoadFailed(true);
      }
      return;
    }

    let clonedData: any = null;
    try {
      clonedData = JSON.parse(JSON.stringify(rawData));
    } catch {
      setLoadFailed(true);
      return;
    }

    let anim: any = null;
    try {
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: clonedData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
        },
      });

      anim.addEventListener('error', () => {
        if (!isDotLottie) setLoadFailed(true);
      });
      anim.addEventListener('data_failed', () => {
        if (!isDotLottie) setLoadFailed(true);
      });
    } catch {
      if (!isDotLottie) setLoadFailed(true);
    }

    return () => {
      try {
        if (anim) anim.destroy();
      } catch {
        // ignore
      }
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [item.id, item.animationData, extractedData, isDotLottie, url]);

  // If DotLottie format and we have a direct url and haven't extracted json yet
  if (isDotLottie && url && !extractedData && !item.animationData && !loadFailed) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <DotLottieReact
          src={url}
          loop
          autoplay
          className="w-full h-full object-contain pointer-events-none"
          onError={() => {
            if (!extractedData) setLoadFailed(true);
          }}
        />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="w-full h-full flex items-center justify-center text-indigo-400">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center pointer-events-none overflow-hidden"
    />
  );
};

interface LottieTabProps {
  lotties: LottieItem[];
  onChangeLotties: (lotties: LottieItem[]) => void;
  selectedLottieId: string | null;
  onSelectLottieId: (id: string | null) => void;
  language?: Language;
}

export const LottieTab: React.FC<LottieTabProps> = ({
  lotties = [],
  onChangeLotties,
  selectedLottieId,
  onSelectLottieId,
  language = 'vi',
}) => {
  const isVi = language === 'vi';
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputId = useId();

  // Find currently active Lottie
  const selectedLottie = lotties.find((i) => i.id === selectedLottieId) || lotties[0] || null;

  // Auto-sync selectedLottieId if it's null but lotties exist
  useEffect(() => {
    if (!selectedLottieId && lotties.length > 0) {
      onSelectLottieId(lotties[0].id);
    }
  }, [selectedLottieId, lotties, onSelectLottieId]);

  const updateLottie = (id: string, partial: Partial<LottieItem>) => {
    const updated = lotties.map((item) => (item.id === id ? { ...item, ...partial } : item));
    onChangeLotties(updated);
  };

  const removeLottie = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = lotties.filter((item) => item.id !== id);
    onChangeLotties(updated);
    if (selectedLottieId === id || !updated.some((item) => item.id === selectedLottieId)) {
      onSelectLottieId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const duplicateLottie = (item: LottieItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const animData = item.animationData || getEmbeddedLottieData(item.id) || undefined;
    const copy: LottieItem = {
      ...item,
      id: `lottie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${item.name} (${isVi ? 'Bản sao' : 'Copy'})`,
      animationData: animData,
      x: Math.min(90, item.x + 5),
      y: Math.min(90, item.y + 5),
    };
    const updated = [...lotties, copy];
    onChangeLotties(updated);
    onSelectLottieId(copy.id);
  };

  const addFromLibrary = (preset: LottieLibraryItem) => {
    const animData = preset.animationData || getEmbeddedLottieData(preset.id);
    const newItem: LottieItem = {
      id: `lottie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: isVi ? preset.nameVi : preset.nameEn,
      category: preset.category,
      url: preset.url || '',
      format: preset.url && isDotLottieSource(preset.url) ? 'dotlottie' : 'json',
      animationData: animData || undefined,
      x: 50,
      y: 50,
      scale: preset.defaultScale || 1.0,
      width: 240,
      height: 240,
      opacity: 1.0,
      rotation: 0,
      speed: 1.0,
      loop: true,
      visible: true,
      layerOrder: preset.defaultLayerOrder || 'front-visualizer',
      audioReactive: false,
    };
    onChangeLotties([...lotties, newItem]);
    onSelectLottieId(newItem.id);
    setShowLibraryModal(false);
  };

  const handleCustomUrlAdd = async () => {
    const rawInput = customUrlInput.trim();
    if (!rawInput) return;

    // Check if user accidentally pasted a Lottiefiles web page URL
    if (
      (rawInput.includes('lottiefiles.com/free-animation') ||
       rawInput.includes('lottiefiles.com/animations')) &&
      !rawInput.includes('.json') &&
      !rawInput.includes('.lottie')
    ) {
      setUrlError(
        isVi
          ? 'Đây là liên kết trang web LottieFiles. Vui lòng bấm Download/Share để lấy link file (.lottie hoặc .json) hoặc mã nhúng (embed) từ trang đó.'
          : 'This is a LottieFiles web page link. Please use the direct .lottie/.json asset link or embed code.'
      );
      return;
    }

    // Check if user pasted a LottieFiles handoff URL
    if (rawInput.includes('lottiefiles.com/handoff') && !rawInput.includes('39100344-698c-488d-b54b-e60433576d1f')) {
      // If user pasted another handoff URL
      setUrlError(
        isVi
          ? 'Bạn đang dán link trang Handoff của LottieFiles. Trong giao diện Handoff đó, vui lòng bấm tab Web/React và copy đường dẫn Asset (.lottie) hoặc mã nhúng để dán vào đây.'
          : 'You entered a LottieFiles Handoff link. Please open the Web/React tab on that page and copy the direct .lottie Asset link or embed code.'
      );
      return;
    }

    // Sanitize any embed links, iframe code, or URLs with query parameters
    const trimmed = sanitizeLottieUrl(rawInput) || rawInput;

    setIsProcessingUrl(true);
    setUrlError(null);

    try {
      const isDotLottie = isDotLottieSource(trimmed);
      const { animationData } = await loadLottieSource(trimmed);

      if (!animationData && !isDotLottie) {
        setUrlError(
          isVi
            ? 'Không thể tải animation từ liên kết này. Vui lòng kiểm tra lại URL.'
            : 'Failed to load animation from this URL. Please verify the link.'
        );
        setIsProcessingUrl(false);
        return;
      }

      // Infer an elegant readable name
      let itemName = isVi
        ? isDotLottie
          ? 'dotLottie Hoạt Họa'
          : 'Lottie Hoạt Họa'
        : isDotLottie
        ? 'dotLottie Animation'
        : 'Lottie Animation';

      if (animationData?.nm && typeof animationData.nm === 'string' && animationData.nm.trim()) {
        itemName = animationData.nm.trim();
      } else {
        const urlMatch = trimmed.match(/\/([^/?#]+\.(?:lottie|json))/i);
        if (urlMatch && urlMatch[1]) {
          itemName = decodeURIComponent(urlMatch[1]).replace(/\.(lottie|json)$/i, '');
        }
      }

      const newItem: LottieItem = {
        id: `lottie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: itemName,
        category: 'custom',
        url: trimmed,
        format: isDotLottie ? 'dotlottie' : 'json',
        animationData: animationData || undefined,
        x: 50,
        y: 50,
        scale: 1.0,
        width: 240,
        height: 240,
        opacity: 1.0,
        rotation: 0,
        speed: 1.0,
        loop: true,
        visible: true,
        layerOrder: 'front-visualizer',
        audioReactive: false,
      };

      onChangeLotties([...lotties, newItem]);
      onSelectLottieId(newItem.id);
      setCustomUrlInput('');
      setShowUrlInput(false);
    } catch (err: any) {
      console.error('Error adding custom Lottie URL:', err);
      setUrlError(
        isVi
          ? 'Không thể tải animation từ liên kết này. Vui lòng kiểm tra lại URL.'
          : 'Failed to load animation from this URL. Please verify the link.'
      );
    } finally {
      setIsProcessingUrl(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isDotLottie =
        file.name.toLowerCase().endsWith('.lottie') || isDotLottieSource(file.name);
      const { animationData } = await loadLottieSource(file);
      const blobUrl = URL.createObjectURL(file);

      if (!animationData && !isDotLottie) {
        setUrlError(
          isVi
            ? 'Không thể đọc tệp hoạt họa Lottie này. Vui lòng thử tệp .json hoặc .lottie khác!'
            : 'Failed to read this Lottie file. Please try another .json or .lottie file!'
        );
        e.target.value = '';
        return;
      }

      const newItem: LottieItem = {
        id: `lottie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name.replace(/\.(lottie|json)$/i, ''),
        category: 'custom',
        url: blobUrl,
        format: isDotLottie ? 'dotlottie' : 'json',
        animationData: animationData || undefined,
        x: 50,
        y: 50,
        scale: 1.0,
        width: 240,
        height: 240,
        opacity: 1.0,
        rotation: 0,
        speed: 1.0,
        loop: true,
        visible: true,
        layerOrder: 'front-visualizer',
        audioReactive: false,
      };
      onChangeLotties([...lotties, newItem]);
      onSelectLottieId(newItem.id);
    } catch (err) {
      console.error('File upload error:', err);
      setUrlError(isVi ? 'Không thể đọc tệp hoạt họa Lottie này!' : 'Failed to read this Lottie file!');
    }
    e.target.value = '';
  };

  // Filter library presets
  const filteredPresets = FREE_LOTTIE_PRESETS.filter((preset) => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesText =
      preset.nameVi.toLowerCase().includes(q) ||
      preset.nameEn.toLowerCase().includes(q) ||
      preset.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesText;
  });

  return (
    <div className="space-y-6 text-neutral-200">
      {/* 1. Header Banner & Quick Add Buttons */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-neutral-900/90 to-neutral-950 border border-indigo-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100">
                  {isVi ? 'Lottie Animation & Sticker Động' : 'Free Lottie Animations & Stickers'}
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {lotties.length} {isVi ? 'lớp hoạt họa' : 'layers'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isVi
                  ? 'Chèn hoạt họa Lottie miễn phí, di chuyển tự do, phóng to thu nhỏ và xếp thứ tự lớp'
                  : 'Add free Lottie animations, move freely, scale and arrange front/back layer order'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-500/20">
          <button
            type="button"
            onClick={() => setShowLibraryModal(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/50 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isVi ? 'Thư Viện Mẫu' : 'Free Presets'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>{isVi ? 'Dán Link URL' : 'Paste URL'}</span>
          </button>

          <label
            htmlFor={fileInputId}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isVi ? 'Tải File JSON/.lottie' : 'Upload File'}</span>
            <input
              id={fileInputId}
              type="file"
              accept=".json,.lottie,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Inline URL or JS Code Input */}
        {showUrlInput && (
          <div className="pt-2 space-y-2">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <textarea
                  rows={customUrlInput.includes('\n') || customUrlInput.includes('<') ? 4 : 2}
                  placeholder={
                    isVi
                      ? 'Dán mã HTML/JS nhúng (new DotLottie({...})) hoặc link URL (.lottie / .json / lottie.host)...'
                      : 'Paste HTML/JS snippet (new DotLottie({...})) or direct URL (.lottie / .json / lottie.host)...'
                  }
                  value={customUrlInput}
                  disabled={isProcessingUrl}
                  onChange={(e) => {
                    setCustomUrlInput(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px] disabled:opacity-60 resize-y"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-neutral-500">
                  {isVi
                    ? 'Hỗ trợ: Link trực tiếp, mã JS DotLottie, hoặc thẻ <canvas>'
                    : 'Supports: Direct URL, DotLottie JS snippet, or <canvas> tag'}
                </span>
                <button
                  type="button"
                  disabled={isProcessingUrl || !customUrlInput.trim()}
                  onClick={handleCustomUrlAdd}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isProcessingUrl && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{isVi ? (isProcessingUrl ? 'Đang phân tích...' : 'Thêm Hoạt Họa') : (isProcessingUrl ? 'Processing...' : 'Add Animation')}</span>
                </button>
              </div>
            </div>
            {urlError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg px-2.5 py-1">
                {urlError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Active Layers List (Select / Re-order / Visibility) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            {isVi ? 'Danh Sách Animation Đang Chèn' : 'Active Lottie Overlays'}
          </span>
          {lotties.length > 0 && (
            <span className="text-[10px] text-neutral-500">
              {isVi ? 'Nhấp chọn để chỉnh sửa' : 'Click to select & edit'}
            </span>
          )}
        </div>

        {lotties.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-neutral-900/40 border border-dashed border-neutral-800 space-y-2">
            <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400 font-medium">
              {isVi ? 'Chưa có animation nào được chèn' : 'No animations added yet'}
            </p>
            <p className="text-[11px] text-neutral-500">
              {isVi
                ? 'Nhấp "Thư Viện Mẫu" ở trên để chọn đĩa than xoay, tai nghe neon, trái tim, sóng âm...'
                : 'Click "Free Presets" above to add spinning vinyl, neon heart, wavebars, cat and more'}
            </p>
            <button
              type="button"
              onClick={() => setShowLibraryModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {isVi ? 'Mở Thư Viện Animation Miễn Phí' : 'Open Free Preset Library'}
            </button>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {lotties.map((item) => {
              const isSelected = selectedLottie?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectLottieId(item.id)}
                  className={`p-2 rounded-xl flex items-center justify-between gap-2 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                      : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                      <LottieThumbnail item={item} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-neutral-200 truncate">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-400">
                        <span className="capitalize">
                          {item.layerOrder === 'back-all' && (isVi ? '🌌 Sau cùng' : '🌌 Back-all')}
                          {item.layerOrder === 'behind-visualizer' && (isVi ? '🎵 Sau sóng âm' : '🎵 Behind visualizer')}
                          {item.layerOrder === 'front-visualizer' && (isVi ? '⚡ Trước sóng âm' : '⚡ Front visualizer')}
                          {item.layerOrder === 'front-all' && (isVi ? '👑 Trước tất cả' : '👑 Front-all')}
                        </span>
                        <span>•</span>
                        <span>{item.scale}x</span>
                        <span>•</span>
                        <span>X:{Math.round(item.x)}% Y:{Math.round(item.y)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLottie(item.id, { visible: !item.visible });
                      }}
                      title={item.visible ? (isVi ? 'Ẩn animation' : 'Hide') : (isVi ? 'Hiện animation' : 'Show')}
                      className={`p-1.5 rounded-lg transition ${
                        item.visible
                          ? 'text-indigo-400 hover:bg-indigo-500/20'
                          : 'text-neutral-500 hover:bg-neutral-800'
                      }`}
                    >
                      {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => duplicateLottie(item, e)}
                      title={isVi ? 'Nhân bản' : 'Duplicate'}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => removeLottie(item.id, e)}
                      title={isVi ? 'Xóa' : 'Delete'}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Selected Lottie Detail Controls */}
      {selectedLottie && (
        <div className="space-y-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">
                {isVi ? 'Tùy Chỉnh Animation Đang Chọn' : 'Selected Animation Controls'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 truncate max-w-[140px]">
                {selectedLottie.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeLottie(selectedLottie.id)}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>{isVi ? 'Xóa' : 'Remove'}</span>
            </button>
          </div>

          {/* Live Preview Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="w-14 h-14 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden p-1 shrink-0">
              <LottieThumbnail item={selectedLottie} />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-semibold text-neutral-200 truncate">{selectedLottie.name}</p>
              <p className="text-[10px] text-neutral-400">
                {selectedLottie.format === 'dotlottie' || isDotLottieSource(selectedLottie.url || '')
                  ? '✨ Định dạng: dotLottie (.lottie)'
                  : '✨ Định dạng: Lottie JSON'}
              </p>
              {selectedLottie.url && (
                <p className="text-[10px] text-indigo-400 font-mono truncate" title={selectedLottie.url}>
                  {selectedLottie.url}
                </p>
              )}
            </div>
          </div>

          {/* A. Move Free (Di chuyển tự do) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                {isVi ? 'Di Chuyển Tự Do (Move Free)' : 'Free Position (X, Y)'}
              </span>
              <span className="text-[10px] text-neutral-400">
                {isVi ? '(Có thể kéo thả chuột trực tiếp trên màn hình)' : '(Or drag directly on preview stage)'}
              </span>
            </div>

            {/* Position X */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{isVi ? 'Tọa độ X (Ngang)' : 'Horizontal X'}</span>
                <span className="text-indigo-400 font-mono">{Math.round(selectedLottie.x)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={selectedLottie.x}
                onChange={(e) => updateLottie(selectedLottie.id, { x: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { x: 15 })}
                  className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  {isVi ? 'Trái (15%)' : 'Left'}
                </button>
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { x: 50 })}
                  className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  {isVi ? 'Giữa (50%)' : 'Center'}
                </button>
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { x: 85 })}
                  className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  {isVi ? 'Phải (85%)' : 'Right'}
                </button>
              </div>
            </div>

            {/* Position Y */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{isVi ? 'Tọa độ Y (Dọc)' : 'Vertical Y'}</span>
                <span className="text-indigo-400 font-mono">{Math.round(selectedLottie.y)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={selectedLottie.y}
                onChange={(e) => updateLottie(selectedLottie.id, { y: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { y: 20 })}
                  className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  {isVi ? 'Trên (20%)' : 'Top'}
                </button>
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { y: 50 })}
                  className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  {isVi ? 'Giữa (50%)' : 'Center'}
                </button>
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { y: 80 })}
                  className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  {isVi ? 'Dưới (80%)' : 'Bottom'}
                </button>
              </div>
            </div>
          </div>

          {/* B. Scale (Phóng to / Thu nhỏ) */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                {isVi ? 'Kích Thước & Phóng To (Scale)' : 'Scale & Dimensions'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-mono font-bold">
                  {selectedLottie.scale.toFixed(2)}x ({Math.round(selectedLottie.scale * 100)}%)
                </span>
                <button
                  type="button"
                  onClick={() => updateLottie(selectedLottie.id, { scale: 1.0 })}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                >
                  1.0x
                </button>
              </div>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.05}
              value={selectedLottie.scale}
              onChange={(e) => updateLottie(selectedLottie.id, { scale: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>0.2x ({isVi ? 'Siêu Nhỏ' : 'Tiny'})</span>
              <span>1.0x ({isVi ? 'Chuẩn' : 'Normal'})</span>
              <span>3.0x ({isVi ? 'Cực Lớn' : 'Huge'})</span>
            </div>
          </div>

          {/* C. Front / Back Layer Order (Thứ tự lớp trước / sau) */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              {isVi ? 'Thứ Tự Lớp Hiển Thị (Front / Back Order)' : 'Layer Stacking Order'}
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'back-all' as LottieLayerOrder,
                  labelVi: '🌌 Phía Sau Cùng',
                  labelEn: '🌌 Back-All',
                  descVi: 'Ngay trên hình nền, dưới sóng âm & text',
                  descEn: 'On top of background, behind all elements',
                },
                {
                  id: 'behind-visualizer' as LottieLayerOrder,
                  labelVi: '🎵 Sau Sóng Âm',
                  labelEn: '🎵 Behind Visualizer',
                  descVi: 'Nằm giữa đĩa nhạc và dải sóng âm',
                  descEn: 'Between track card and visualizer waves',
                },
                {
                  id: 'front-visualizer' as LottieLayerOrder,
                  labelVi: '⚡ Trước Sóng Âm',
                  labelEn: '⚡ Front Visualizer',
                  descVi: 'Nằm trên sóng âm, dưới lời bài hát',
                  descEn: 'Above visualizer waves, under lyrics',
                },
                {
                  id: 'front-all' as LottieLayerOrder,
                  labelVi: '👑 Trước Tất Cả',
                  labelEn: '👑 Front-All',
                  descVi: 'Nổi lên trên cùng toàn màn hình',
                  descEn: 'Topmost layer, above all elements',
                },
              ].map((layer) => {
                const isActive = (selectedLottie.layerOrder || 'front-visualizer') === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => updateLottie(selectedLottie.id, { layerOrder: layer.id })}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                        : 'bg-neutral-800/50 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="text-xs font-semibold">{isVi ? layer.labelVi : layer.labelEn}</div>
                    <div className="text-[9px] text-neutral-400 mt-0.5 leading-snug">
                      {isVi ? layer.descVi : layer.descEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D. Additional FX: Audio Reactive & Opacity & Rotation */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            {/* Audio Reactive Pulse */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-xs font-semibold text-neutral-200">
                    {isVi ? 'Nhún Nhảy Theo Nhịp Nhạc' : 'Audio Reactive Beat Pulse'}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {isVi ? 'Tự động phóng to nhẹ theo tiếng Bass / Kick' : 'Scales dynamically with audio bass kicks'}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLottie.audioReactive ?? false}
                  onChange={(e) => updateLottie(selectedLottie.id, { audioReactive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            {/* Opacity & Rotation Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Độ Trong Suốt' : 'Opacity'}</span>
                  <span className="text-indigo-400 font-mono">{Math.round((selectedLottie.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={selectedLottie.opacity ?? 1.0}
                  onChange={(e) => updateLottie(selectedLottie.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">{isVi ? 'Góc Xoay' : 'Rotation'}</span>
                  <span className="text-indigo-400 font-mono">{Math.round(selectedLottie.rotation ?? 0)}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={selectedLottie.rotation ?? 0}
                  onChange={(e) => updateLottie(selectedLottie.id, { rotation: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">{isVi ? 'Tốc Độ Hoạt Họa' : 'Playback Speed'}</span>
                <span className="text-indigo-400 font-mono">{selectedLottie.speed ?? 1.0}x</span>
              </div>
              <input
                type="range"
                min={0.25}
                max={2.5}
                step={0.25}
                value={selectedLottie.speed ?? 1.0}
                onChange={(e) => updateLottie(selectedLottie.id, { speed: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Free Lottie Presets Modal & Search Drawer */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">
                    {isVi ? 'Kho Animation Lottie Miễn Phí' : 'Free Lottie Animation Library'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {isVi ? 'Chọn animation bạn thích để chèn ngay vào video visualizer' : 'Pick an animation to instantly add to your visualizer'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder={isVi ? 'Tìm kiếm animation (vinyl, heart, wave, cat, dance...)' : 'Search animations...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', labelVi: 'Tất Cả', labelEn: 'All' },
                  { id: 'music', labelVi: '🎵 Âm Nhạc & Đĩa Than', labelEn: '🎵 Music & Vinyl' },
                  { id: 'neon', labelVi: '⚡ Neon & Cyber', labelEn: '⚡ Neon & Cyber' },
                  { id: 'lofi', labelVi: '☕ Lo-Fi & Chill', labelEn: '☕ Lo-Fi & Chill' },
                  { id: 'effects', labelVi: '✨ Hiệu Ứng', labelEn: '✨ Effects' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {isVi ? cat.labelVi : cat.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => addFromLibrary(preset)}
                  className="group p-3 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 hover:border-indigo-500/70 transition flex flex-col justify-between cursor-pointer space-y-2 shadow-sm hover:shadow-indigo-950/40"
                >
                  {/* Visual Animated Preview Box */}
                  <div className="w-full h-24 rounded-lg bg-neutral-950/80 flex items-center justify-center relative overflow-hidden group-hover:scale-102 transition duration-200 border border-neutral-800/80 p-1">
                    <LottieThumbnail item={preset} />
                    <div className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded bg-neutral-900/90 text-neutral-300 border border-neutral-700/60 uppercase pointer-events-none">
                      {preset.category}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-neutral-100 group-hover:text-indigo-300 transition truncate">
                      {isVi ? preset.nameVi : preset.nameEn}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {preset.tags.slice(0, 3).join(', ')}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-1.5 px-2 rounded-lg bg-indigo-600/30 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white text-[11px] font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isVi ? 'Chèn Ngay' : 'Insert'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
