import type { ThemeConfig } from 'antd';
import type { MappingAlgorithm } from 'antd/es/config-provider/context';
import { theme as antdTheme } from 'antd';

/**
 * Maps CSS variables from ui-core to Ant Design tokens
 * Uses CSS variables directly via var() for automatic theme switching
 * This adapter maintains framework-agnostic nature of ui-core
 */
export function getAntDesignTokens(theme: 'light' | 'dark' | 'auto' = 'light'): ThemeConfig['token'] {
  // CSS variables automatically change based on .light/.dark classes
  // We use var() references so they update reactively
  return {
    // Primary colors
    colorPrimary: 'var(--link, #2563EB)',
    colorPrimaryHover: 'var(--link-hover, #1E40AF)',
    colorPrimaryActive: 'var(--link-hover, #1E40AF)',

    // Background colors
    colorBgContainer: 'var(--bg-secondary, #FFFFFF)',
    colorBgBase: 'var(--bg-primary, #F9FAFB)',
    colorBgElevated: 'var(--bg-secondary, #FFFFFF)',
    colorBgLayout: 'var(--bg-primary, #F9FAFB)',
    colorBgSpotlight: 'var(--bg-tertiary, #F3F4F6)',

    // Text colors
    colorText: 'var(--text-primary, #111827)',
    colorTextSecondary: 'var(--text-secondary, #6B7280)',
    colorTextTertiary: 'var(--text-tertiary, #6B7280)',
    colorTextDisabled: 'var(--disabled, #9CA3AF)',

    // Border colors
    colorBorder: 'var(--border-primary, #E5E7EB)',
    colorBorderSecondary: 'var(--border-secondary, #D4D4D4)',

    // Status colors
    colorSuccess: 'var(--success, #16A34A)',
    colorWarning: 'var(--warning, #F59E0B)',
    colorError: 'var(--error, #DC2626)',
    colorInfo: 'var(--info, #0EA5E9)',

    // Spacing - read numeric values from CSS variables if available
    borderRadius: 6, // Default, can be overridden via CSS
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // Control heights
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,

    // Font sizes
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
  };
}

/**
 * Gets algorithm for Ant Design theme (for dark/light mode)
 */
export function getThemeAlgorithm(theme: 'light' | 'dark' | 'auto' = 'light'): MappingAlgorithm {
  const actualTheme = theme === 'auto' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return actualTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
}

