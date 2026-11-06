import React from 'react';
import { AppThemeId, THEME_PRESETS } from '../types.ts';
import { Palette, Check, X, Sparkles, ShieldCheck } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  activeTheme: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  activeTheme,
  onSelectTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text-main)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: 'var(--theme-tag-bg)',
                color: 'var(--theme-accent)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Theme Gallery & Green Palettes</span>
                <Sparkles className="w-4 h-4 text-[var(--theme-accent)]" />
              </h2>
              <p className="text-xs text-[var(--theme-text-muted)]">
                ClassWatch single green aesthetic & high-fidelity variations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer hover:bg-[var(--theme-card-hover)] text-[var(--theme-text-muted)] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Theme Banner */}
        <div
          className="my-4 p-3.5 rounded-2xl border flex items-center justify-between text-xs"
          style={{
            backgroundColor: 'var(--theme-card-elevated)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
            <div>
              <div className="font-semibold text-[var(--theme-text-main)]">
                Active Theme: {THEME_PRESETS.find((t) => t.id === activeTheme)?.name}
              </div>
              <div className="text-[11px] text-[var(--theme-text-muted)]">
                UI is completely unified in dark green design
              </div>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--theme-tag-bg)',
              color: 'var(--theme-accent)',
              border: '1px solid var(--theme-border)',
            }}
          >
            Active
          </span>
        </div>

        {/* Theme Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activeTheme === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectTheme(preset.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'ring-2 shadow-lg scale-[1.01]'
                    : 'hover:bg-[var(--theme-card-hover)] opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: preset.cardHex,
                  borderColor: isSelected ? preset.accentHex : preset.borderHex,
                }}
              >
                {/* Left: Info & Tag */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border"
                    style={{
                      backgroundColor: preset.bgHex,
                      borderColor: preset.borderHex,
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: preset.accentHex }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{preset.name}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                        style={{
                          backgroundColor: `${preset.accentHex}1a`,
                          color: preset.accentHex,
                          borderColor: `${preset.accentHex}40`,
                        }}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{preset.subtitle}</p>

                    {/* Color Swatches Pill */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.bgHex }} title={`BG: ${preset.bgHex}`} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.cardHex }} title={`Card: ${preset.cardHex}`} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.accentHex }} title={`Accent: ${preset.accentHex}`} />
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.borderHex }} title={`Border: ${preset.borderHex}`} />
                        <span className="font-mono text-[9px] text-slate-500 ml-1">
                          {preset.accentHex}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Select Action or Active Badge */}
                <div className="flex items-center justify-end sm:justify-center">
                  {isSelected ? (
                    <div
                      className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      style={{
                        backgroundColor: preset.accentHex,
                        color: preset.bgHex,
                      }}
                    >
                      <Check className="w-4 h-4" />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(preset.id);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border text-slate-300 hover:text-white transition-colors cursor-pointer"
                      style={{
                        borderColor: preset.borderHex,
                        backgroundColor: `${preset.bgHex}80`,
                      }}
                    >
                      Select Theme
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="mt-4 pt-3 border-t border-[var(--theme-border)] flex items-center justify-between text-xs text-[var(--theme-text-muted)]">
          <span>Theme applies across all Teacher, Student, Parent, & Principal screens</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-bg-main)',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
