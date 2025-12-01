import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';

type MappingAlgorithm = typeof antdTheme.defaultAlgorithm;

/**
 * Maps CSS variables from ui-core to Ant Design tokens
 * Uses CSS variables directly via var() for automatic theme switching
 * This adapter maintains framework-agnostic nature of ui-core
 * All Ant Design tokens are mapped to our CSS variables for consistency
 */
export function getAntDesignTokens(theme: 'light' | 'dark' | 'auto' = 'light'): ThemeConfig['token'] {
  // CSS variables automatically change based on .light/.dark classes
  // We use var() references so they update reactively
  // Map all Ant Design tokens to our CSS variables for complete theme consistency
  
  return {
    // ============ Primary Colors ============
    colorPrimary: 'var(--link, #2563EB)',
    colorPrimaryHover: 'var(--link-hover, #1E40AF)',
    colorPrimaryActive: 'var(--link-hover, #1E40AF)',
    colorPrimaryBg: 'var(--accent-subtle, #DBEAFE)', // Light primary background
    colorPrimaryBgHover: 'var(--accent-subtle, #DBEAFE)',
    colorPrimaryBorder: 'var(--link, #2563EB)',
    colorPrimaryBorderHover: 'var(--link-hover, #1E40AF)',
    colorPrimaryText: 'var(--link, #2563EB)',
    colorPrimaryTextHover: 'var(--link-hover, #1E40AF)',
    colorPrimaryTextActive: 'var(--link-hover, #1E40AF)',

    // ============ Success Colors ============
    colorSuccess: 'var(--success, #16A34A)',
    colorSuccessHover: 'var(--success, #16A34A)', // Use same color
    colorSuccessActive: 'var(--success, #16A34A)',
    colorSuccessBg: 'var(--bg-tertiary, #F3F4F6)', // Light background, could be success-specific
    colorSuccessBgHover: 'var(--bg-tertiary, #F3F4F6)',
    colorSuccessBorder: 'var(--success, #16A34A)',
    colorSuccessBorderHover: 'var(--success, #16A34A)',
    colorSuccessText: 'var(--success, #16A34A)',
    colorSuccessTextHover: 'var(--success, #16A34A)',
    colorSuccessTextActive: 'var(--success, #16A34A)',

    // ============ Warning Colors ============
    colorWarning: 'var(--warning, #F59E0B)',
    colorWarningHover: 'var(--warning, #F59E0B)',
    colorWarningActive: 'var(--warning, #F59E0B)',
    colorWarningBg: 'var(--bg-tertiary, #F3F4F6)',
    colorWarningBgHover: 'var(--bg-tertiary, #F3F4F6)',
    colorWarningBorder: 'var(--warning, #F59E0B)',
    colorWarningBorderHover: 'var(--warning, #F59E0B)',
    colorWarningText: 'var(--warning, #F59E0B)',
    colorWarningTextHover: 'var(--warning, #F59E0B)',
    colorWarningTextActive: 'var(--warning, #F59E0B)',

    // ============ Error Colors ============
    colorError: 'var(--error, #DC2626)',
    colorErrorHover: 'var(--error, #DC2626)',
    colorErrorActive: 'var(--error, #DC2626)',
    colorErrorBg: 'var(--bg-tertiary, #F3F4F6)',
    colorErrorBgHover: 'var(--bg-tertiary, #F3F4F6)',
    colorErrorBorder: 'var(--error, #DC2626)',
    colorErrorBorderHover: 'var(--error, #DC2626)',
    colorErrorText: 'var(--error, #DC2626)',
    colorErrorTextHover: 'var(--error, #DC2626)',
    colorErrorTextActive: 'var(--error, #DC2626)',

    // ============ Info Colors ============
    colorInfo: 'var(--info, #0EA5E9)',
    colorInfoHover: 'var(--info, #0EA5E9)',
    colorInfoActive: 'var(--info, #0EA5E9)',
    colorInfoBg: 'var(--bg-tertiary, #F3F4F6)',
    colorInfoBgHover: 'var(--bg-tertiary, #F3F4F6)',
    colorInfoBorder: 'var(--info, #0EA5E9)',
    colorInfoBorderHover: 'var(--info, #0EA5E9)',
    colorInfoText: 'var(--info, #0EA5E9)',
    colorInfoTextHover: 'var(--info, #0EA5E9)',
    colorInfoTextActive: 'var(--info, #0EA5E9)',

    // ============ Background Colors ============
    colorBgContainer: 'var(--bg-secondary, #FFFFFF)',
    colorBgBase: 'var(--bg-primary, #F9FAFB)',
    colorBgElevated: 'var(--bg-secondary, #FFFFFF)',
    colorBgLayout: 'var(--bg-primary, #F9FAFB)',
    colorBgSpotlight: 'var(--bg-tertiary, #F3F4F6)',
    colorBgMask: 'rgba(0, 0, 0, 0.45)', // Overlay/modal backdrop - use standard dark overlay

    // ============ Text Colors ============
    colorText: 'var(--text-primary, #111827)',
    colorTextSecondary: 'var(--text-secondary, #6B7280)',
    colorTextTertiary: 'var(--text-tertiary, #6B7280)',
    colorTextQuaternary: 'var(--text-tertiary, #6B7280)', // Use tertiary as fallback
    colorTextDisabled: 'var(--disabled, #9CA3AF)',
    colorTextHeading: 'var(--text-primary, #111827)', // Headings use primary text
    colorTextLabel: 'var(--text-secondary, #6B7280)', // Labels use secondary
    colorTextDescription: 'var(--text-secondary, #6B7280)', // Descriptions use secondary
    colorTextPlaceholder: 'var(--text-tertiary, #6B7280)', // Placeholders use tertiary

    // ============ Border Colors ============
    colorBorder: 'var(--border-primary, #E5E7EB)',
    colorBorderSecondary: 'var(--border-secondary, #D4D4D4)',
    colorSplit: 'var(--border-primary, #E5E7EB)', // Splitter/divider uses primary border

    // ============ Fill Colors (for input backgrounds, etc.) ============
    colorFill: 'var(--bg-tertiary, #F3F4F6)', // Fill uses tertiary background
    colorFillSecondary: 'var(--bg-tertiary, #F3F4F6)', // Used for table row hover
    colorFillTertiary: 'var(--bg-primary, #F9FAFB)', // Used for table header backgrounds
    colorFillQuaternary: 'var(--bg-primary, #F9FAFB)',

    // ============ Neutral Colors ============
    colorWhite: '#FFFFFF', // Always white

    // ============ Shadow ============
    boxShadow: 'var(--shadow, rgba(0, 0, 0, 0.05))',
    boxShadowSecondary: 'var(--shadow, rgba(0, 0, 0, 0.05))',
    boxShadowTertiary: 'var(--shadow, rgba(0, 0, 0, 0.05))',

    // ============ Border Radius ============
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    borderRadiusOuter: 4,

    // ============ Control Heights ============
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
    controlHeightXS: 22,

    // ============ Font Sizes ============
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeIcon: 12,

    // ============ Font Weights ============
    fontWeightStrong: 600,
    lineHeight: 1.5714285714285714,
    lineHeightLG: 1.5,
    lineHeightSM: 1.6666666666666667,

    // ============ Padding ============
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    // ============ Margin ============
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // ============ Motion ============
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',

    // ============ Link ============
    colorLink: 'var(--link, #2563EB)',
    colorLinkHover: 'var(--link-hover, #1E40AF)',
    colorLinkActive: 'var(--link-hover, #1E40AF)',

    // ============ Screen Sizes (for responsive) ============
    screenXS: 480,
    screenSM: 576,
    screenMD: 768,
    screenLG: 992,
    screenXL: 1200,
    screenXXL: 1600,
  };
}

/**
 * Gets component-specific theme configurations
 * Uses Ant Design's components API for proper theming without CSS overrides
 */
export function getAntDesignComponents(): ThemeConfig['components'] {
  return {
    Table: {
      headerBg: 'var(--bg-tertiary)',
      headerColor: 'var(--text-primary)',
      rowHoverBg: 'var(--bg-tertiary)',
      borderColor: 'var(--border-primary)',
      colorText: 'var(--text-primary)',
      colorTextHeading: 'var(--text-primary)',
    },
    Tag: {
      defaultBg: 'var(--bg-tertiary)',
      defaultColor: 'var(--text-primary)',
      colorBorder: 'var(--border-primary)',
      // Color variants will use their respective color tokens
      colorSuccess: 'var(--success)',
      colorError: 'var(--error)',
      colorWarning: 'var(--warning)',
      colorInfo: 'var(--info)',
    },
    Badge: {
      colorError: 'var(--error)',
      colorSuccess: 'var(--success)',
      colorWarning: 'var(--warning)',
      colorInfo: 'var(--info)',
      colorText: 'var(--text-primary)',
    },
    Alert: {
      colorSuccess: 'var(--success)',
      colorError: 'var(--error)',
      colorWarning: 'var(--warning)',
      colorInfo: 'var(--info)',
      colorText: 'var(--text-primary)',
      colorTextHeading: 'var(--text-primary)',
      colorBgContainer: 'var(--bg-secondary)',
      colorBorder: 'var(--border-primary)',
    },
    Card: {
      colorText: 'var(--text-primary)',
      colorTextHeading: 'var(--text-primary)',
      colorBorderSecondary: 'var(--border-primary)',
      colorBgContainer: 'var(--bg-secondary)',
    },
    Descriptions: {
      colorText: 'var(--text-primary)',
      colorTextLabel: 'var(--text-secondary)',
      colorBorder: 'var(--border-primary)',
    },
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

