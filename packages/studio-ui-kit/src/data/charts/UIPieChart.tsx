import * as React from 'react';
import { Pie } from '@ant-design/charts';
import { theme } from 'antd';
import type { PieConfig } from '@ant-design/charts';

const { useToken } = theme;

/**
 * Get chart theme from Ant Design tokens
 */
function useChartTheme() {
  const { token } = useToken();

  return React.useMemo(
    () => ({
      defaultColor: token.colorPrimary,
      colors10: [
        token.colorInfo,
        token.colorSuccess,
        token.colorWarning,
        token.colorError,
        token.colorPrimary,
        token.colorInfoBg,
        token.colorSuccessBg,
        token.colorWarningBg,
        token.colorErrorBg,
        token.colorPrimaryBg,
      ],
      colors20: [
        token.colorInfo,
        token.colorSuccess,
        token.colorWarning,
        token.colorError,
        token.colorPrimary,
        token.colorInfoBg,
        token.colorSuccessBg,
        token.colorWarningBg,
        token.colorErrorBg,
        token.colorPrimaryBg,
        token.colorInfoBorder,
        token.colorSuccessBorder,
        token.colorWarningBorder,
        token.colorErrorBorder,
        token.colorPrimaryBorder,
        token.colorInfoText,
        token.colorSuccessText,
        token.colorWarningText,
        token.colorErrorText,
        token.colorPrimaryText,
      ],
      styleSheet: {
        backgroundColor: token.colorBgContainer,
        fontFamily: token.fontFamily,
        fontSize: token.fontSize,
        color: token.colorText,
      },
    }),
    [token],
  );
}

export interface UIPieChartProps extends Omit<PieConfig, 'theme'> {
  /**
   * Custom colors to override theme colors
   */
  colors?: string[];
}

/**
 * UIPieChart - Pie/Donut chart with automatic theming
 *
 * Wrapper around @ant-design/charts Pie component that uses theme tokens
 * for automatic light/dark mode support.
 *
 * @example
 * ```tsx
 * <UIPieChart
 *   data={data}
 *   angleField="value"
 *   colorField="category"
 * />
 * ```
 *
 * @example Donut chart
 * ```tsx
 * <UIPieChart
 *   data={data}
 *   angleField="value"
 *   colorField="category"
 *   innerRadius={0.6}
 * />
 * ```
 */
export function UIPieChart({ colors, ...props }: UIPieChartProps) {
  const chartTheme = useChartTheme();

  // Merge theme with custom colors if provided
  const mergedTheme = colors
    ? {
        ...chartTheme,
        colors10: colors,
        colors20: colors,
      }
    : chartTheme;

  return <Pie {...props} theme={mergedTheme} />;
}
