'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme, ThemeColorKey, THEME_PRESETS } from '@/context/ThemeContext';
import { isValidHex } from '@/lib/color';
import { cn } from '@/lib/utils';

const COLOR_FIELDS: { key: ThemeColorKey; label: string; hint: string }[] = [
  { key: 'primary', label: 'Primary', hint: 'Main brand color — buttons, links, active states' },
  { key: 'secondary', label: 'Secondary', hint: 'Accents — badges, highlights, secondary actions' },
  { key: 'tertiary', label: 'Tertiary', hint: 'Background tone for panels and page surfaces' },
];

export function ThemeSwitcher() {
  const { theme, setColor, applyPreset, resetTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleHexInput = (key: ThemeColorKey, value: string) => {
    const hex = value.startsWith('#') ? value : `#${value}`;
    if (isValidHex(hex)) {
      setColor(key, hex);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Customize theme colors"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/40 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h14a2 2 0 012 2v7a4 4 0 01-4 4H7zm0 0a4 4 0 004-4v0" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="17" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Theme Colors</h3>
            <p className="text-xs text-slate-400 mt-0.5">Changes apply instantly across the whole site.</p>
          </div>

          <div className="space-y-3">
            {COLOR_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="relative shrink-0">
                  <input
                    type="color"
                    value={theme[field.key]}
                    onChange={(e) => setColor(field.key, e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{field.label}</span>
                    <input
                      type="text"
                      value={theme[field.key]}
                      onChange={(e) => handleHexInput(field.key, e.target.value)}
                      className="w-20 text-xs font-mono text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{field.hint}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700">Quick Presets</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.colors)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-semibold text-slate-600 hover:border-primary/40 hover:bg-slate-50 transition-colors',
                    theme.primary === preset.colors.primary && theme.secondary === preset.colors.secondary
                      ? 'border-primary/50 bg-primary-light'
                      : 'border-slate-200'
                  )}
                >
                  <span className="flex -space-x-1 shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                  </span>
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={resetTheme}
            className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors pt-1"
          >
            Reset to default
          </button>
        </div>
      )}
    </div>
  );
}
