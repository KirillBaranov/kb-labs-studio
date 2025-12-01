import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // KB Labs UI Color Kit - CSS variables from theme
        // Backgrounds
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-inverse': 'var(--text-inverse)',
        // Borders
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        // Interactive
        'link': 'var(--link)',
        'link-hover': 'var(--link-hover)',
        'accent-subtle': 'var(--accent-subtle)',
        // Status
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        'info': 'var(--info)',
        // States
        'disabled': 'var(--disabled)',
        // Legacy Tailwind compatibility
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        primary: {
          DEFAULT: 'var(--link)',
          foreground: 'var(--text-inverse)',
        },
        secondary: {
          DEFAULT: 'var(--bg-tertiary)',
          foreground: 'var(--text-primary)',
        },
        muted: {
          DEFAULT: 'var(--bg-tertiary)',
          foreground: 'var(--text-secondary)',
        },
        accent: {
          DEFAULT: 'var(--accent-subtle)',
          foreground: 'var(--text-primary)',
        },
        border: 'var(--border-primary)',
        input: 'var(--border-primary)',
        ring: 'var(--link)',
      },
      backgroundColor: {
        'theme-primary': 'var(--bg-primary)',
        'theme-secondary': 'var(--bg-secondary)',
        'theme-tertiary': 'var(--bg-tertiary)',
      },
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-tertiary': 'var(--text-tertiary)',
      },
      borderColor: {
        'theme': 'var(--border-primary)',
      },
    },
  },
  plugins: [],
};

export default config;

