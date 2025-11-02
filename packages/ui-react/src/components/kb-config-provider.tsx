import * as React from 'react';
import { ConfigProvider } from 'antd';
import type { ConfigProviderProps, ThemeConfig } from 'antd';
import { getAntDesignTokens, getThemeAlgorithm } from '../lib/theme-adapter';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface KBConfigProviderProps extends Omit<ConfigProviderProps, 'theme'> {
  defaultTheme?: ThemeMode;
  storageKey?: string;
  children: React.ReactNode;
}

const KBConfigProviderContext = React.createContext<{
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}>({
  theme: 'light',
  setTheme: () => {},
});

export function KBConfigProvider({
  defaultTheme = 'light',
  storageKey = 'studio-ui-theme',
  children,
  ...configProps
}: KBConfigProviderProps) {
  // Get initial theme
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return defaultTheme;
    const stored = localStorage.getItem(storageKey) as ThemeMode;
    return stored || defaultTheme;
  };

  const [theme, setThemeState] = React.useState<ThemeMode>(getInitialTheme);

  // Get actual theme for tokens (auto -> system preference)
  const actualTheme = React.useMemo(() => {
    if (typeof window === 'undefined') return theme === 'auto' ? 'light' : theme;
    return theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
  }, [theme]);

  // Apply theme class SYNCHRONOUSLY on mount and theme change
  // This ensures CSS variables are correct before tokens are computed
  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
    root.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  // Store theme in localStorage (non-blocking)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = React.useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  // Tokens now use CSS variables via var() - no need to recompute
  const tokens = React.useMemo(() => getAntDesignTokens(actualTheme), [actualTheme]);
  // Don't use algorithm - it would invert colors again
  // CSS variables already handle theme switching via .light/.dark classes
  // const algorithm = React.useMemo(() => getThemeAlgorithm(theme), [theme]);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  const themeConfig: ThemeConfig = React.useMemo(
    () => ({
      token: tokens,
      // algorithm: algorithm, // Disabled - CSS variables handle theme
    }),
    [tokens]
  );

  return (
    <KBConfigProviderContext.Provider value={value}>
      <ConfigProvider theme={themeConfig} {...configProps}>
        {children}
      </ConfigProvider>
    </KBConfigProviderContext.Provider>
  );
}

export function useKBTheme() {
  const context = React.useContext(KBConfigProviderContext);
  if (context === undefined) {
    throw new Error('useKBTheme must be used within KBConfigProvider');
  }
  return context;
}

