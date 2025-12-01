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
  return <Line {...props} theme={chartTheme} />;
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
