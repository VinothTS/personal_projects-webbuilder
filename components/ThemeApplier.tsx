'use client';

import { useEffect } from 'react';

// RGB channel values for each theme style
const THEME_PALETTES: Record<string, { primary: string; secondary: string; accent: string }> = {
  modern:  { primary: '45 80 22',    secondary: '143 188 90',  accent: '244 164 96'  }, // green
  elegant: { primary: '30 58 95',    secondary: '74 144 217',  accent: '232 197 106' }, // blue
  vibrant: { primary: '192 57 43',   secondary: '230 126 34',  accent: '243 156 18'  }, // red/orange
  minimal: { primary: '26 26 26',    secondary: '85 85 85',    accent: '136 136 136' }, // black/gray
  classic: { primary: '27 42 74',    secondary: '61 90 138',   accent: '201 168 76'  }, // navy
};

export default function ThemeApplier() {
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        const style: string = data?.theme?.style ?? 'modern';
        const palette = THEME_PALETTES[style] ?? THEME_PALETTES.modern;

        const root = document.documentElement;
        root.style.setProperty('--primary-rgb', palette.primary);
        root.style.setProperty('--secondary-rgb', palette.secondary);
        root.style.setProperty('--accent-rgb', palette.accent);
      } catch {
        // keep CSS defaults on error
      }
    };

    applyTheme();
  }, []);

  return null;
}
