import { KBCard, KBLineChart } from '@kb-labs/studio-ui-react';

// Пример данных для графика
const chartData = [
  { date: '2025-01-01', value: 120 },
  { date: '2025-01-02', value: 132 },
  { date: '2025-01-03', value: 101 },
  { date: '2025-01-04', value: 134 },
  { date: '2025-01-05', value: 90 },
  { date: '2025-01-06', value: 230 },
  { date: '2025-01-07', value: 210 },
];

export function DashboardChart() {
  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    height: 300,
    autoFit: true,
    point: {
      size: 5,
      shape: 'circle',
    },
    tooltip: {
      showCrosshairs: true,
      shared: true,
    },
    interactions: [
      { type: 'element-active' },
      { type: 'brush' }, // Поддержка выделения области для drill-down
    ],
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <KBCard title="Activity Overview" style={{ marginTop: 16 }}>
      <KBLineChart {...config} />
    </KBCard>
  );
}

