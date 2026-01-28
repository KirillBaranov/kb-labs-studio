/**
 * UIIcon component - Icon wrapper
 *
 * Provides consistent icon sizing and coloring using design tokens.
 * Supports both icon components and icon names (from AVAILABLE_ICONS).
 * NO hardcoded colors, uses Ant Design theme.
 */

import * as React from 'react';
import { theme } from 'antd';

const { useToken } = theme;

export type UIIconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type UIIconColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'inherit';

export interface UIIconProps {
  /** Icon component or icon name (e.g., 'HomeOutlined') */
  icon?: React.ReactNode | string;
  /** Icon name (alternative to icon prop) */
  name?: string;
  /** Icon size */
  size?: UIIconSize;
  /** Icon color */
  color?: UIIconColor;
  /** Spin animation */
  spin?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * UIIcon - Icon wrapper
 *
 * @example
 * ```tsx
 * import { CheckCircleOutlined } from '@ant-design/icons';
 *
 * // Using icon component
 * <UIIcon icon={<CheckCircleOutlined />} color="success" />
 *
 * // Using icon name (from AVAILABLE_ICONS)
 * <UIIcon name="HomeOutlined" size="lg" />
 * <UIIcon icon="SettingOutlined" color="primary" />
 *
 * <UIIcon icon={<LoadingOutlined />} spin />
 *
 * <UIIcon
 *   name="SettingOutlined"
 *   size="lg"
 *   onClick={handleSettings}
 * />
 * ```
 */
export function UIIcon({
  icon,
  name,
  size = 'base',
  color = 'inherit',
  spin = false,
  onClick,
  className,
  style: customStyle,
}: UIIconProps) {
  const { token } = useToken();

  const sizeMap: Record<UIIconSize, string> = {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
  };

  const colorMap: Record<UIIconColor, string> = {
    primary: token.colorPrimary,
    secondary: token.colorTextSecondary,
    success: token.colorSuccess,
    warning: token.colorWarning,
    error: token.colorError,
    info: token.colorInfo,
    inherit: 'inherit',
  };

  const style: React.CSSProperties = {
    fontSize: sizeMap[size],
    color: colorMap[color],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : undefined,
    ...(spin && {
      animation: 'spin 1s linear infinite',
    }),
    ...customStyle,
  };

  // Resolve icon: name prop > string icon > React element icon
  let iconElement: React.ReactNode = null;

  const iconName = name || (typeof icon === 'string' ? icon : null);
  if (iconName) {
    // Try to load icon from AVAILABLE_ICONS (lazy import to avoid circular deps)
    try {
      // This will be resolved at runtime when studio-ui-react is available
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { renderIcon } = require('@kb-labs/studio-ui-react/lib/icons');
      iconElement = renderIcon(iconName);
    } catch (_error) {
      console.warn(`Icon "${iconName}" could not be loaded. Make sure @kb-labs/studio-ui-react is installed.`);
      iconElement = null;
    }
  } else if (React.isValidElement(icon)) {
    iconElement = icon;
  }

  if (!iconElement) {
    return null;
  }

  return (
    <span
      className={className}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {iconElement}
      {spin && (
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      )}
    </span>
  );
}

/**
 * Icon helper for common use cases
 */
export const UIIconButton = ({
  icon,
  name,
  onClick,
  size = 'base',
  color = 'primary',
  ...props
}: UIIconProps) => (
  <UIIcon
    icon={icon}
    name={name}
    size={size}
    color={color}
    onClick={onClick}
    style={{ cursor: 'pointer', transition: 'opacity 0.2s', ...props.style }}
    {...props}
  />
);
