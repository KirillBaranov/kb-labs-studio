import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
const initialState = {
    theme: 'light',
    setTheme: () => null,
};
const ThemeProviderContext = React.createContext(initialState);
export function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'vite-ui-theme', ...props }) {
    const [theme, setTheme] = React.useState(() => localStorage.getItem(storageKey) || defaultTheme);
    React.useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem(storageKey, theme);
    }, [theme, storageKey]);
    const value = {
        theme,
        setTheme: (theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };
    return _jsx(ThemeProviderContext.Provider, { ...props, value: value, children: children });
}
export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
//# sourceMappingURL=theme-provider.js.map