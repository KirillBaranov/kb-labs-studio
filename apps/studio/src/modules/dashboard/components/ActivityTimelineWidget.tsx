import React, { useState } from 'react';
import { Card, Segmented } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { KBAreaChart } from '@kb-labs/studio-ui-react';
import { useDataSources } from '../../../providers/data-sources-provider';
import { useMetricsHistory } from '@kb-labs/studio-data-client';

type TimeRange = '1m' | '5m' | '10m' | '30m';

const TIME_RANGE_CONFIG = {
  '1m': { label: '1 min' },
  '5m': { label: '5 min' },
  '10m': { label: '10 min' },
  '30m': { label: '30 min' },
};

export function ActivityTimelineWidget() {
  const sources = useDataSources();
  const [timeRange, setTimeRange] = useState<TimeRange>('10m');

  // Fetch requests and errors history
  const requestsQuery = useMetricsHistory(sources.observability, {
    metric: 'requests',
    range: timeRange,
    interval: '5s',
  });

  const errorsQuery = useMetricsHistory(sources.observability, {
    metric: 'errors',
    range: timeRange,
    interval: '5s',
  });

  // Transform data for chart
  const chartData = React.useMemo(() => {
    if (!requestsQuery.data || !errorsQuery.data) return [];

    // Merge requests and errors by timestamp
    const dataMap = new Map<number, { time: string; Requests: number; Errors: number }>();

    for (const point of requestsQuery.data) {
      const time = new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      dataMap.set(point.timestamp, { time, Requests: point.value, Errors: 0 });
    }

    for (const point of errorsQuery.data) {
      const existing = dataMap.get(point.timestamp);
      if (existing) {
        existing.Errors = point.value;
      }
    }

    return Array.from(dataMap.values());
  }, [requestsQuery.data, errorsQuery.data]);

  // Current values for legend
  const currentRequests = requestsQuery.data?.[requestsQuery.data.length - 1]?.value ?? 0;
  const currentErrors = errorsQuery.data?.[errorsQuery.data.length - 1]?.value ?? 0;

  const config = {
    data: chartData,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    height: 250,
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 500,
      },
    },
    areaStyle: {
      fillOpacity: 0.3,
    },
    slider: {
      start: 0,
      end: 1,
    },
    legend: {
      position: 'top-right' as const,
      itemName: {
        formatter: (text: string) => {
          if (text === 'Requests') {
            return `${text} (${currentRequests.toLocaleString()})`;
          }
          if (text === 'Errors') {
            return `${text} (${currentErrors.toLocaleString()})`;
          }
          return text;
        },
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.type,
          value: datum.value?.toLocaleString() ?? 0,
        };
      },
    },
    color: ['#1890ff', '#ff4d4f'],
  };

  // Transform to multi-series format
  const multiSeriesData = chartData.flatMap(point => [
    { time: point.time, type: 'Requests', value: point.Requests },
    { time: point.time, type: 'Errors', value: point.Errors },
  ]);

  const isLoading = requestsQuery.isLoading || errorsQuery.isLoading;
  const hasError = requestsQuery.isError || errorsQuery.isError;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChartOutlined />
            <span>Activity Timeline</span>
          </div>
          <Segmented
            options={Object.entries(TIME_RANGE_CONFIG).map(([key, config]) => ({
              label: config.label,
              value: key,
            }))}
            value={timeRange}
            onChange={(value) => setTimeRange(value as TimeRange)}
            size="small"
          />
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px' }}
    >
      {isLoading ? (
        <div style={{
          height: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}>
          Loading metrics...
        </div>
      ) : hasError ? (
        <div style={{
          height: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4d4f',
        }}>
          Failed to load metrics
        </div>
      ) : chartData.length > 0 ? (
        <KBAreaChart {...config} data={multiSeriesData} />
      ) : (
        <div style={{
          height: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}>
          No data available
        </div>
      )}
    </Card>
  );
}
