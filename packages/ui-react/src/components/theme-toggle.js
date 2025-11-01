import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { KBButton } from './kb-button';
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    return (_jsxs(KBButton, { variant: "ghost", size: "icon", onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'), "aria-label": "Toggle theme", children: [_jsx(Sun, { className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" }), _jsx(Moon, { className: "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" }), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }));
}
//# sourceMappingURL=theme-toggle.js.map