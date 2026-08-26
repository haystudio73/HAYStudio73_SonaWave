import React from 'react';
import { TextBoxItem } from '../types';
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
  WrapText
} from 'lucide-react';

interface TextBoxTabProps {
  textBoxes: TextBoxItem[];
  onChange: (textBoxes: TextBoxItem[]) => void;
}

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

      {/* Text Box Tabs Selector */}
      {textBoxes.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {textBoxes.map((box, idx) => (
            <button
              key={box.id}
              onClick={() => setSelectedId(box.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeBox?.id === box.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>Văn bản #{idx + 1}</span>
            </button>
          ))}
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
