import * as React from 'react';
import { Line, Column, Area, Pie, Bar } from '@ant-design/charts';
import { theme as antdTheme } from 'antd';

/**
 * Helper to get chart theme from Ant Design tokens
 */
function useChartTheme() {
  const { token } = antdTheme.useToken();

  return React.useMemo(() => ({
    defaultColor: typeof token.colorPrimary === 'string' ? token.colorPrimary : '#2563EB',
    colors10: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'],
    colors20: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb'],
    styleSheet: {
      backgroundColor: typeof token.colorBgContainer === 'string' ? token.colorBgContainer : '#FFFFFF',
      fontFamily: token.fontFamily || 'inherit',
      fontSize: token.fontSize || 14,
      color: typeof token.colorText === 'string' ? token.colorText : '#111827',
    },
  }), [token]);
}

/**
 * KBLineChart - Line chart wrapper with automatic theming
 */
export function KBLineChart(props: any) {
  const chartTheme = useChartTheme();

  // Merge theme with custom colors if provided
  const mergedTheme = props.color
    ? {
        ...chartTheme,
        colors10: Array.isArray(props.color) ? props.color : chartTheme.colors10,
        colors20: Array.isArray(props.color) ? props.color : chartTheme.colors20,
      }
    : chartTheme;

  return <Line {...props} theme={mergedTheme} />;
}

/**
 * KBColumnChart - Column chart wrapper with automatic theming
 */
export function KBColumnChart(props: any) {
  const chartTheme = useChartTheme();
  return <Column {...props} theme={chartTheme} />;
}

/**
 * KBAreaChart - Area chart wrapper with automatic theming
 */
export function KBAreaChart(props: any) {
  const chartTheme = useChartTheme();
  return <Area {...props} theme={chartTheme} />;
}

/**
 * KBPieChart - Pie chart wrapper with automatic theming
 */
export function KBPieChart(props: any) {
  const chartTheme = useChartTheme();
  return <Pie {...props} theme={chartTheme} />;
}

/**
 * KBBarChart - Bar chart wrapper with automatic theming
 */
export function KBBarChart(props: any) {
  const chartTheme = useChartTheme();
  return <Bar {...props} theme={chartTheme} />;
}
