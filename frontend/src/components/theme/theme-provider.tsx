'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

type ThemeMode = 'day' | 'night';

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (value: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'war-memory:theme';
const DAY_CLASS = 'theme-day';
const NIGHT_CLASS = 'theme-night';

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove(mode === 'day' ? NIGHT_CLASS : DAY_CLASS);
  root.classList.add(mode === 'day' ? DAY_CLASS : NIGHT_CLASS);
  root.dataset.theme = mode;
  root.style.colorScheme = mode === 'day' ? 'light' : 'dark';
}

function resolveInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'day';

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'day' || stored === 'night') {
    return stored;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'night' : 'day';
}

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialTheme());

  useLayoutEffect(() => {
    applyThemeClass(mode);
  }, [mode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      setMode(event.matches ? 'night' : 'day');
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((current) => (current === 'day' ? 'night' : 'day')),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
