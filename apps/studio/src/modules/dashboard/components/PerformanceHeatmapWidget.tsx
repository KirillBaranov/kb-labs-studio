import React, { useMemo, useState } from 'react';
import { Card, Select, Space, Typography, Tooltip } from 'antd';
import { FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDataSources } from '../../../providers/data-sources-provider';
import { useMetricsHeatmap } from '@kb-labs/studio-data-client';

const { Text } = Typography;

interface HeatmapCell {
  hour: number;
  day: string;
  value: number;
  label: string;
  color: string;
}

type MetricType = 'latency' | 'errors' | 'requests';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function PerformanceHeatmapWidget() {
  const sources = useDataSources();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('latency');

  // Fetch heatmap data from backend
  const heatmapQuery = useMetricsHeatmap(sources.observability, {
    metric: selectedMetric,
    days: 7,
  });

  // Transform backend data to include colors and labels
  const heatmapData = useMemo(() => {
    if (!heatmapQuery.data) {return [];}

    return heatmapQuery.data.map((cell) => ({
      hour: cell.hour,
      day: cell.day,
      value: cell.value,
      color: getColorForValue(cell.value, selectedMetric),
      label: formatValue(cell.value, selectedMetric),
    }));
  }, [heatmapQuery.data, selectedMetric]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (heatmapData.length === 0) {return { min: 0, max: 0, avg: 0, peak: { hour: 0, day: '' } };}

    const values = heatmapData.map((c) => c.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const peakCell = heatmapData.reduce((prev, curr) => (curr.value > prev.value ? curr : prev));

    return {
      min,
      max,
      avg,
      peak: { hour: peakCell.hour, day: peakCell.day },
    };
  }, [heatmapData]);

  const isLoading = heatmapQuery.isLoading;
  const hasError = heatmapQuery.isError;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FireOutlined />
          <span>Performance Heatmap</span>
        </div>
      }
      extra={
        <Select
          value={selectedMetric}
          onChange={setSelectedMetric}
          style={{ width: 120 }}
          options={[
            { label: 'Latency', value: 'latency' },
            { label: 'Errors', value: 'errors' },
            { label: 'Requests', value: 'requests' },
          ]}
          loading={isLoading}
        />
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px', maxHeight: 'calc(100% - 57px)', overflowY: 'auto' }}
    >
      {isLoading ? (
        <div style={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}>
          Loading heatmap...
        </div>
      ) : hasError ? (
        <div style={{
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4d4f',
        }}>
          Failed to load heatmap
        </div>
      ) : (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Stats Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            padding: 12,
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Min
            </Text>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>
              {formatValue(stats.min, selectedMetric)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Average
            </Text>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>
              {formatValue(stats.avg, selectedMetric)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Max
            </Text>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#ff4d4f' }}>
              {formatValue(stats.max, selectedMetric)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Peak Time
            </Text>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {stats.peak.day} {stats.peak.hour}:00
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, paddingLeft: 40 }}>
            {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
              <div key={h} style={{ flex: 1, fontSize: 11, color: '#999', textAlign: 'center' }}>
                {h}:00
              </div>
            ))}
          </div>

          {DAYS.map((day) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <div style={{ width: 35, fontSize: 12, color: '#666', fontWeight: 500 }}>{day}</div>
              <div style={{ display: 'flex', gap: 2, flex: 1 }}>
                {HOURS.map((hour) => {
                  const cell = heatmapData.find((c) => c.day === day && c.hour === hour);
                  if (!cell) {return null;}

                  return (
                    <Tooltip
                      key={`${day}-${hour}`}
                      title={
                        <div>
                          <div>
                            {day} {hour}:00
                          </div>
                          <div style={{ fontWeight: 600 }}>{cell.label}</div>
                        </div>
                      }
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 24,
                          backgroundColor: cell.color,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.15)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = '1';
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> Data represents typical weekly patterns
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Low
            </Text>
            <div style={{ display: 'flex', gap: 2 }}>
              {['#f0f9ff', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'].map((color, i) => (
                <div key={i} style={{ width: 16, height: 16, backgroundColor: color, borderRadius: 2 }} />
              ))}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              High
            </Text>
          </div>
        </div>

        {/* Insights */}
        <div
          style={{
            padding: 12,
            background: '#f0f5ff',
            borderRadius: 8,
            borderLeft: '3px solid #1890ff',
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            💡 Insights:
          </Text>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            {selectedMetric === 'latency' && (
              <>
                • Peak latency occurs during business hours (9-17:00)
                <br />• Weekend performance is ~40% better due to lower traffic
                <br />• Consider scaling resources before 9am on weekdays
              </>
            )}
            {selectedMetric === 'errors' && (
              <>
                • Error rates fluctuate throughout the week
                <br />• Monitor error spikes during high-traffic periods
                <br />• Weekend error rates are typically lower
              </>
            )}
            {selectedMetric === 'requests' && (
              <>
                • Request volume peaks during business hours
                <br />• Night-time traffic is ~50% of peak hours
                <br />• Plan maintenance during low-traffic windows (2-6am)
              </>
            )}
          </div>
        </div>
      </Space>
      )}
    </Card>
  );
}

// Helper: Calculate average latency across all plugins
function calculateAverageLatency(data: any): number {
  if (!data?.perPlugin || data.perPlugin.length === 0) {return 100;}

  const latencies = data.perPlugin.map((p: any) => p.latency?.average ?? 0).filter((l: number) => l > 0);
  if (latencies.length === 0) {return 100;}

  return latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length;
}

// Helper: Get color based on value and metric type
function getColorForValue(value: number, metric: MetricType): string {
  let percentage = 0;

  switch (metric) {
    case 'latency':
      // 0-100ms = green, 100-300ms = yellow/orange, 300+ = red
      percentage = Math.min(value / 400, 1);
      break;
    case 'errors':
      // 0-5 errors = green, 5-20 = yellow, 20+ = red
      percentage = Math.min(value / 25, 1);
      break;
    case 'requests':
      // Scale based on max
      percentage = Math.min(value / 100, 1);
      break;
  }

  // Color gradient from light blue to dark blue (for most metrics)
  const colors = ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'];

  // For errors, use red gradient
  if (metric === 'errors') {
    const redColors = ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626'];
    const index = Math.floor(percentage * (redColors.length - 1));
    return redColors[index];
  }

  // For latency, use yellow-red gradient for high values
  if (metric === 'latency' && percentage > 0.5) {
    const warmColors = ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#f97316', '#ef4444'];
    const warmPercentage = (percentage - 0.5) * 2;
    const index = Math.floor(warmPercentage * (warmColors.length - 1));
    return warmColors[index];
  }

  const index = Math.floor(percentage * (colors.length - 1));
  return colors[index];
}

// Helper: Format value based on metric type
function formatValue(value: number, metric: MetricType): string {
  switch (metric) {
    case 'latency':
      return `${value.toFixed(0)}ms`;
    case 'errors':
      return `${value.toFixed(0)} errors`;
    case 'requests':
      return `${value.toFixed(0)} req`;
    default:
      return value.toFixed(0);
  }
}
