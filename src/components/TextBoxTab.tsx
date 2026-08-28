import React from 'react';
import { TextBoxItem, TextBoxLayerOrder } from '../types';
import { AVAILABLE_FONTS } from '../utils/presets';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sparkles, 
  Bold, 
  Italic, 
  CaseUpper,
  Layers,
  Palette,
  WrapText,
  ArrowUp,
  ArrowDown,
  Disc,
  Activity,
  Music2,
  Image as ImageIcon
} from 'lucide-react';

interface TextBoxTabProps {
  textBoxes: TextBoxItem[];
  onChange: (textBoxes: TextBoxItem[]) => void;
}

const LAYER_OPTIONS: { id: TextBoxLayerOrder; nameVi: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { 
    id: 'front-all', 
    nameVi: 'Trước tất cả (Trên cùng)', 
    desc: 'Hiển thị trên cùng đè lên sóng âm, đĩa nhạc và lời bài hát',
    icon: Sparkles 
  },
  { 
    id: 'behind-lyrics', 
    nameVi: 'Sau Lời bài hát', 
    desc: 'Hiển thị sau Lời bài hát nhưng trước Sóng âm',
    icon: Music2 
  },
  { 
    id: 'behind-visualizer', 
    nameVi: 'Sau Sóng âm (Waveform)', 
    desc: 'Hiển thị sau Sóng âm thanh nhưng trước Đĩa nhạc',
    icon: Activity 
  },
  { 
    id: 'behind-track', 
    nameVi: 'Sau Đĩa nhạc / Thẻ bài hát', 
    desc: 'Hiển thị sau Đĩa xoay Vinyl & Card tiêu đề',
    icon: Disc 
  },
  { 
    id: 'back-all', 
    nameVi: 'Sau cùng (Gần hình nền)', 
    desc: 'Nằm sát nền phía dưới tất cả các hiệu ứng & hạt',
    icon: ImageIcon 
  },
];

export const TextBoxTab: React.FC<TextBoxTabProps> = ({
  textBoxes,
  onChange,
}) => {
  const [selectedId, setSelectedId] = React.useState<string>(
    textBoxes.length > 0 ? textBoxes[0].id : ''
  );

  const activeBox = textBoxes.find((b) => b.id === selectedId) || textBoxes[0];

  const handleAddBox = (presetText?: string) => {
    const newBox: TextBoxItem = {
      id: 'tb-' + Date.now(),
      text: presetText || '🎧 Đeo tai nghe để cảm nhận âm thanh tốt nhất',
      fontFamily: 'Be Vietnam Pro',
      fontSize: 16,
      color: '#ffffff',
      hasBackground: true,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backgroundOpacity: 0.7,
      glowColor: '#ec4899',
      glowIntensity: 8,
      positionX: 50,
      positionY: 88,
      alignment: 'center',
      fontWeight: 'bold',
      fontStyle: 'normal',
      letterSpacing: 0.5,
      isUppercase: false,
      opacity: 0.95,
      wrapText: true,
      maxWidth: 80,
      lineHeight: 1.35,
      layerOrder: 'front-all',
    };
    const updated = [...textBoxes, newBox];
    onChange(updated);
    setSelectedId(newBox.id);
  };

  const handleUpdateBox = (id: string, partial: Partial<TextBoxItem>) => {
    const updated = textBoxes.map((b) => (b.id === id ? { ...b, ...partial } : b));
    onChange(updated);
  };

  const handleDeleteBox = (id: string) => {
    const updated = textBoxes.filter((b) => b.id !== id);
    onChange(updated);
    if (selectedId === id && updated.length > 0) {
      setSelectedId(updated[0].id);
    }
  };

  const handleDuplicateBox = (box: TextBoxItem) => {
    const newBox: TextBoxItem = {
      ...box,
      id: 'tb-' + Date.now(),
      positionY: Math.min(95, box.positionY + 5),
    };
    const updated = [...textBoxes, newBox];
    onChange(updated);
    setSelectedId(newBox.id);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= textBoxes.length) return;
    const items = [...textBoxes];
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    onChange(items);
  };

  return (
    <div className="space-y-6 text-neutral-200">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          Hộp Chữ & Watermark ({textBoxes.length})
        </label>
        <button
          onClick={() => handleAddBox()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/25 hover:bg-rose-600/35 border border-rose-500/50 text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Hộp Chữ</span>
        </button>
      </div>

      {/* Quick Presets for Text */}
      {textBoxes.length === 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center space-y-3">
          <p className="text-xs text-neutral-400">
            Chưa có hộp chữ nào. Thêm watermark, credit nghệ sĩ, thông điệp hoặc tài khoản mạng xã hội của bạn!
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleAddBox('🎧 Đeo tai nghe để trải nghiệm tốt nhất')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            >
              🎧 Gợi ý tai nghe
            </button>
            <button
              onClick={() => handleAddBox('✨ Follow @your_channel on TikTok')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            >
              ✨ Watermark TikTok
            </button>
            <button
              onClick={() => handleAddBox('🔥 Visualizer by SonaWave')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            >
              🔥 Credit Studio
            </button>
          </div>
        </div>
      )}

      {/* Text Box Tabs Selector with Reordering */}
      {textBoxes.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {textBoxes.map((box, idx) => {
            const isSelected = activeBox?.id === box.id;
            const currentLayer = LAYER_OPTIONS.find((l) => l.id === (box.layerOrder || 'front-all'));
            return (
              <div key={box.id} className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => setSelectedId(box.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  <span className="max-w-[90px] truncate text-[11px] font-normal opacity-90">
                    {box.text ? box.text.slice(0, 14) : 'Trống'}
                  </span>
                  {currentLayer && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 text-rose-200 border border-white/10">
                      {currentLayer.nameVi.split(' ')[0]}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Text Box Settings */}
      {activeBox && (
        <div className="space-y-4 pt-2 border-t border-neutral-800/80">
          {/* Text input & Actions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Nội dung chữ</span>
              <div className="flex items-center gap-1">
                {/* Reorder Buttons */}
                {textBoxes.length > 1 && (
                  <>
                    <button
                      onClick={() => handleMoveOrder(textBoxes.findIndex((b) => b.id === activeBox.id), 'up')}
                      disabled={textBoxes.findIndex((b) => b.id === activeBox.id) === 0}
                      title="Di chuyển lên trước"
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(textBoxes.findIndex((b) => b.id === activeBox.id), 'down')}
                      disabled={textBoxes.findIndex((b) => b.id === activeBox.id) === textBoxes.length - 1}
                      title="Di chuyển xuống sau"
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDuplicateBox(activeBox)}
                  title="Nhân bản hộp chữ này"
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBox(activeBox.id)}
                  title="Xóa hộp chữ này"
                  className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={activeBox.text}
              onChange={(e) => handleUpdateBox(activeBox.id, { text: e.target.value })}
              placeholder="Nhập nội dung hiển thị (hỗ trợ nhiều dòng)..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 resize-y font-medium"
            />
          </div>

          {/* Layer Order Management (Thứ tự lớp hiển thị đè trước/sau) */}
          <div className="space-y-2 p-3 rounded-xl bg-neutral-900/70 border border-rose-500/30">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                Thứ Tự Lớp (Layer Order)
              </label>
              <span className="text-[10px] text-rose-400 font-medium">
                Trước / Sau Sóng âm, Lời, Đĩa nhạc
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {LAYER_OPTIONS.map((layer) => {
                const Icon = layer.icon;
                const currentLayer = activeBox.layerOrder || 'front-all';
                const isSelected = currentLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => handleUpdateBox(activeBox.id, { layerOrder: layer.id })}
                    className={`w-full p-2 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-white shadow-sm ring-1 ring-rose-500/40'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-rose-400' : 'text-neutral-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold block ${isSelected ? 'text-rose-200' : 'text-neutral-300'}`}>
                          {layer.nameVi}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 block leading-tight mt-0.5">
                        {layer.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Selector */}
          <div>
            <span className="text-xs text-neutral-400 block mb-1">Phông chữ (Font Family)</span>
            <div className="relative">
              <Type className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={activeBox.fontFamily || 'Be Vietnam Pro'}
                onChange={(e) => handleUpdateBox(activeBox.id, { fontFamily: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs text-neutral-200 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none"
              >
                {AVAILABLE_FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Font Size & Weight & Format */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Cỡ chữ</span>
                <span className="text-rose-400 font-mono">{activeBox.fontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={60}
                value={activeBox.fontSize}
                onChange={(e) => handleUpdateBox(activeBox.id, { fontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Độ trong suốt (Opacity)</span>
                <span className="text-rose-400 font-mono">{Math.round((activeBox.opacity || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.05}
                value={activeBox.opacity !== undefined ? activeBox.opacity : 1.0}
                onChange={(e) => handleUpdateBox(activeBox.id, { opacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          {/* Formatting Buttons: Bold, Italic, Uppercase, Alignment */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-neutral-900/80 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  handleUpdateBox(activeBox.id, {
                    fontWeight: activeBox.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                title="Đậm"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeBox.fontWeight === 'bold' ? 'bg-rose-500/20 text-rose-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  handleUpdateBox(activeBox.id, {
                    fontStyle: activeBox.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                title="Nghiêng"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeBox.fontStyle === 'italic' ? 'bg-rose-500/20 text-rose-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  handleUpdateBox(activeBox.id, {
                    isUppercase: !activeBox.isUppercase,
                  })
                }
                title="Chữ in hoa"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeBox.isUppercase ? 'bg-rose-500/20 text-rose-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CaseUpper className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-[1px] bg-neutral-800" />

            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight },
                ] as const
              ).map((al) => {
                const Icon = al.icon;
                const isSelected = activeBox.alignment === al.id;
                return (
                  <button
                    key={al.id}
                    onClick={() => handleUpdateBox(activeBox.id, { alignment: al.id })}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSelected ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wrap Text & Max Width Settings */}
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <WrapText className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-neutral-300">Tự động xuống dòng (Wrap text)</span>
              </div>
              <input
                type="checkbox"
                checked={activeBox.wrapText !== false}
                onChange={(e) => handleUpdateBox(activeBox.id, { wrapText: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700 cursor-pointer"
              />
            </label>

            {activeBox.wrapText !== false && (
              <div className="space-y-2.5 pt-1 border-t border-neutral-800/60">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Độ rộng tối đa dòng</span>
                    <span className="text-rose-400 font-mono">{activeBox.maxWidth !== undefined ? activeBox.maxWidth : 80}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={95}
                    step={1}
                    value={activeBox.maxWidth !== undefined ? activeBox.maxWidth : 80}
                    onChange={(e) => handleUpdateBox(activeBox.id, { maxWidth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Khoảng cách dòng (Line Height)</span>
                    <span className="text-rose-400 font-mono">{(activeBox.lineHeight !== undefined ? activeBox.lineHeight : 1.35).toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.2}
                    step={0.05}
                    value={activeBox.lineHeight !== undefined ? activeBox.lineHeight : 1.35}
                    onChange={(e) => handleUpdateBox(activeBox.id, { lineHeight: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color & Glow */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Màu chữ</span>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
                <input
                  type="color"
                  value={activeBox.color}
                  onChange={(e) => handleUpdateBox(activeBox.id, { color: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-neutral-300 truncate">{activeBox.color}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 block mb-1">Màu phát sáng (Glow)</span>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-xl">
                <input
                  type="color"
                  value={activeBox.glowColor || '#ec4899'}
                  onChange={(e) => handleUpdateBox(activeBox.id, { glowColor: e.target.value })}
                  className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-[11px] font-mono text-neutral-300 truncate">{activeBox.glowColor}</span>
              </div>
            </div>
          </div>

          {/* Position X & Y */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Vị trí ngang (Position X)</span>
                <span className="text-rose-400 font-mono">{activeBox.positionX}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={95}
                value={activeBox.positionX}
                onChange={(e) => handleUpdateBox(activeBox.id, { positionX: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Vị trí dọc (Position Y)</span>
                <span className="text-rose-400 font-mono">{activeBox.positionY}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={95}
                value={activeBox.positionY}
                onChange={(e) => handleUpdateBox(activeBox.id, { positionY: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          {/* Background Pill */}
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-neutral-300">Khung nền mờ (Pill Backdrop)</span>
              <input
                type="checkbox"
                checked={activeBox.hasBackground}
                onChange={(e) => handleUpdateBox(activeBox.id, { hasBackground: e.target.checked })}
                className="rounded text-rose-500 focus:ring-rose-500 bg-neutral-800 border-neutral-700"
              />
            </label>

            {activeBox.hasBackground && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg flex-1">
                  <input
                    type="color"
                    value={activeBox.backgroundColor || '#000000'}
                    onChange={(e) => handleUpdateBox(activeBox.id, { backgroundColor: e.target.value })}
                    className="w-5 h-5 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-neutral-400">Màu nền khung</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
