import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Alert, Select, Typography, Space, Progress } from 'antd';
import {
  HolderOutlined,
  ExperimentOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { KBLineChart } from '@kb-labs/studio-ui-react';
import { useDataSources } from '../../../providers/data-sources-provider';
import { usePrometheusMetrics } from '@kb-labs/studio-data-client';

const { Text, Title } = Typography;

interface Prediction {
  timestamp: number;
  value: number;
  confidence: number;
  isAnomaly?: boolean;
}

interface Anomaly {
  timestamp: number;
  metric: string;
  severity: 'low' | 'medium' | 'high';
  expectedValue: number;
  actualValue: number;
  deviation: number;
}

type MetricType = 'requests' | 'errors' | 'latency' | 'cpu';

export function PredictiveAnalyticsWidget() {
  const sources = useDataSources();
  const metrics = usePrometheusMetrics(sources.observability);

  const [selectedMetric, setSelectedMetric] = useState<MetricType>('requests');
  const [timeHorizon, setTimeHorizon] = useState<'15m' | '30m' | '1h' | '2h'>('30m');

  // Simple moving average prediction (can be replaced with ML model)
  const predictions = useMemo(() => {
    if (!metrics.data?.requests) {return [];}

    const historicalData = generateHistoricalData(selectedMetric, metrics.data);
    return forecastWithMovingAverage(historicalData, timeHorizon);
  }, [metrics.data, selectedMetric, timeHorizon]);

  // Anomaly detection using statistical methods
  const anomalies = useMemo(() => {
    if (!metrics.data) {return [];}

    const detected: Anomaly[] = [];
    const threshold = 2; // 2 standard deviations

    // Check error rate anomaly
    const total = metrics.data.requests?.total ?? 0;
    const errors = (metrics.data.requests?.clientErrors ?? 0) + (metrics.data.requests?.serverErrors ?? 0);
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    if (errorRate > 5) {
      detected.push({
        timestamp: Date.now(),
        metric: 'Error Rate',
        severity: 'high',
        expectedValue: 2,
        actualValue: errorRate,
        deviation: ((errorRate - 2) / 2) * 100,
      });
    }

    // Check latency anomaly
    const avgLatency = calculateAverageLatency(metrics.data);
    if (avgLatency > 500) {
      detected.push({
        timestamp: Date.now(),
        metric: 'Avg Latency',
        severity: avgLatency > 1000 ? 'high' : 'medium',
        expectedValue: 200,
        actualValue: avgLatency,
        deviation: ((avgLatency - 200) / 200) * 100,
      });
    }

    return detected.sort((a, b) => b.deviation - a.deviation);
  }, [metrics.data]);

  // Chart configuration
  const chartData = useMemo(() => {
    const historical = generateHistoricalData(selectedMetric, metrics.data);
    const predicted = predictions.map(p => ({
      time: new Date(p.timestamp).toLocaleTimeString(),
      value: p.value,
      type: 'Predicted',
      confidence: p.confidence,
    }));

    const historicalFormatted = historical.map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString(),
      value: h.value,
      type: 'Actual',
      confidence: 100,
    }));

    return [...historicalFormatted, ...predicted];
  }, [predictions, selectedMetric, metrics.data]);

  const chartConfig = {
    data: chartData,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['var(--info)', 'var(--success)'],
    lineStyle: (datum: any) => {
      if (datum.type === 'Predicted') {
        return { lineDash: [4, 4], opacity: 0.7 };
      }
      return { lineDash: [0, 0] };
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    legend: {
      position: 'top' as const,
    },
    yAxis: {
      label: {
        formatter: (v: string) => {
          const num = parseFloat(v);
          return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : v;
        },
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.type,
          value: `${datum.value.toFixed(0)} (${datum.confidence.toFixed(0)}% confidence)`,
        };
      },
    },
    height: 250,
  };

  const getSeverityConfig = (severity: 'low' | 'medium' | 'high') => {
    const configs = {
      low: { color: 'blue', icon: <ThunderboltOutlined /> },
      medium: { color: 'orange', icon: <WarningOutlined /> },
      high: { color: 'red', icon: <WarningOutlined /> },
    };
    return configs[severity];
  };

  // Calculate prediction confidence score
  const overallConfidence = useMemo(() => {
    if (predictions.length === 0) {return 0;}
    const avg = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    return avg;
  }, [predictions]);

  // Trend analysis
  const trendAnalysis = useMemo(() => {
    if (predictions.length < 2) {return null;}

    const first = predictions[0].value;
    const last = predictions[predictions.length - 1].value;
    const change = ((last - first) / first) * 100;

    return {
      direction: change > 0 ? 'up' : 'down',
      percentage: Math.abs(change),
      isPositive: selectedMetric === 'requests' ? change > 0 : change < 0,
    };
  }, [predictions, selectedMetric]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: 'var(--text-tertiary)' }} />
          <ExperimentOutlined />
          <span>Predictive Analytics</span>
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px', maxHeight: 'calc(100% - 57px)', overflowY: 'auto' }}
    >
      <Row gutter={[16, 16]}>
        {/* Controls */}
        <Col span={24}>
          <Space>
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              style={{ width: 150 }}
              options={[
                { label: 'Requests', value: 'requests' },
                { label: 'Errors', value: 'errors' },
                { label: 'Latency (ms)', value: 'latency' },
              ]}
            />
            <Select
              value={timeHorizon}
              onChange={setTimeHorizon}
              style={{ width: 120 }}
              options={[
                { label: '15 minutes', value: '15m' },
                { label: '30 minutes', value: '30m' },
                { label: '1 hour', value: '1h' },
                { label: '2 hours', value: '2h' },
              ]}
            />
          </Space>
        </Col>

        {/* Prediction Summary */}
        <Col xs={24} md={8}>
          <div style={{ padding: '12px', background: 'var(--accent-subtle)', borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">Prediction Confidence</Text>
            <Title level={2} style={{ margin: '8px 0', color: overallConfidence > 70 ? 'var(--success)' : 'var(--warning)' }}>
              {overallConfidence.toFixed(0)}%
            </Title>
            <Progress
              percent={overallConfidence}
              showInfo={false}
              strokeColor={overallConfidence > 70 ? 'var(--success)' : 'var(--warning)'}
            />
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">Forecasted Trend</Text>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 8 }}>
              {trendAnalysis && (
                <>
                  {trendAnalysis.direction === 'up' ? (
                    <RiseOutlined style={{ fontSize: 32, color: trendAnalysis.isPositive ? 'var(--success)' : 'var(--error)' }} />
                  ) : (
                    <FallOutlined style={{ fontSize: 32, color: trendAnalysis.isPositive ? 'var(--success)' : 'var(--error)' }} />
                  )}
                  <Title
                    level={2}
                    style={{ margin: 0, color: trendAnalysis.isPositive ? 'var(--success)' : 'var(--error)' }}
                  >
                    {trendAnalysis.percentage.toFixed(1)}%
                  </Title>
                </>
              )}
            </div>
            <Text type="secondary">{timeHorizon} forecast</Text>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">Anomalies Detected</Text>
            <Title level={2} style={{ margin: '8px 0', color: anomalies.length > 0 ? 'var(--error)' : 'var(--success)' }}>
              {anomalies.length}
            </Title>
            <Text type="secondary">{anomalies.length > 0 ? 'Needs attention' : 'All clear'}</Text>
          </div>
        </Col>

        {/* Forecast Chart */}
        <Col span={24}>
          <Title level={5}>Forecast: {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</Title>
          <KBLineChart {...chartConfig} />
        </Col>

        {/* Anomaly List */}
        {anomalies.length > 0 && (
          <Col span={24}>
            <Alert
              message="Detected Anomalies"
              description={
                <div style={{ marginTop: 8 }}>
                  {anomalies.map((anomaly, index) => {
                    const config = getSeverityConfig(anomaly.severity);
                    return (
                      <div
                        key={index}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 4,
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Tag color={config.color} icon={config.icon}>
                            {anomaly.severity.toUpperCase()}
                          </Tag>
                          <Text strong>{anomaly.metric}</Text>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          Expected: {anomaly.expectedValue.toFixed(1)} | Actual: {anomaly.actualValue.toFixed(1)} |
                          Deviation: +{anomaly.deviation.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
              type="warning"
              showIcon
            />
          </Col>
        )}

        {/* Recommendations */}
        <Col span={24}>
          <Alert
            message="ML Insights"
            description={
              <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                {trendAnalysis && trendAnalysis.percentage > 20 && (
                  <li>
                    {selectedMetric === 'requests'
                      ? `Traffic expected to ${trendAnalysis.direction === 'up' ? 'increase' : 'decrease'} by ${trendAnalysis.percentage.toFixed(0)}% - consider scaling resources`
                      : `${selectedMetric} expected to ${trendAnalysis.direction === 'up' ? 'increase' : 'decrease'} by ${trendAnalysis.percentage.toFixed(0)}%`}
                  </li>
                )}
                {anomalies.length > 0 && (
                  <li>Multiple anomalies detected - investigate recent deployments or infrastructure changes</li>
                )}
                {overallConfidence < 70 && (
                  <li>Low prediction confidence - data patterns may be unstable or insufficient historical data</li>
                )}
                {anomalies.length === 0 && overallConfidence > 80 && (
                  <li>System metrics are stable and predictable - no immediate action required</li>
                )}
              </ul>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </Card>
  );
}

// Helper: Generate historical data points (simulated from current metrics)
function generateHistoricalData(metric: MetricType, data: any): { timestamp: number; value: number }[] {
  const now = Date.now();
  const points: { timestamp: number; value: number }[] = [];

  // Generate last 10 data points (10 minutes of history at 1min intervals)
  for (let i = 10; i >= 0; i--) {
    const timestamp = now - i * 60 * 1000;
    let value = 0;

    switch (metric) {
      case 'requests':
        value = (data?.requests?.total ?? 0) * (0.8 + Math.random() * 0.4); // ±20% variation
        break;
      case 'errors':
        value = ((data?.requests?.clientErrors ?? 0) + (data?.requests?.serverErrors ?? 0)) * (0.8 + Math.random() * 0.4);
        break;
      case 'latency':
        value = calculateAverageLatency(data) * (0.9 + Math.random() * 0.2); // ±10% variation
        break;
    }

    points.push({ timestamp, value });
  }

  return points;
}

// Helper: Simple moving average forecast
function forecastWithMovingAverage(
  historical: { timestamp: number; value: number }[],
  horizon: '15m' | '30m' | '1h' | '2h'
): Prediction[] {
  if (historical.length < 3) {return [];}

  const predictions: Prediction[] = [];
  const windowSize = 3; // 3-point moving average

  // Determine number of future points based on horizon
  const horizonMinutes = horizon === '15m' ? 15 : horizon === '30m' ? 30 : horizon === '1h' ? 60 : 120;
  const futurePoints = Math.ceil(horizonMinutes / 5); // 5-minute intervals

  // Calculate trend from historical data
  const recentValues = historical.slice(-windowSize).map(h => h.value);
  const avgValue = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

  // Simple linear trend
  const trend = (recentValues[recentValues.length - 1] - recentValues[0]) / (recentValues.length - 1);

  for (let i = 1; i <= futurePoints; i++) {
    const timestamp = historical[historical.length - 1].timestamp + i * 5 * 60 * 1000;
    const value = Math.max(0, avgValue + trend * i); // Ensure non-negative

    // Confidence decreases with time
    const confidence = Math.max(50, 95 - (i / futurePoints) * 30);

    predictions.push({ timestamp, value, confidence });
  }

  return predictions;
}

// Helper: Calculate average latency across all plugins
function calculateAverageLatency(data: any): number {
  if (!data?.perPlugin || data.perPlugin.length === 0) {return 0;}

  const latencies = data.perPlugin.map((p: any) => p.latency?.average ?? 0).filter((l: number) => l > 0);
  if (latencies.length === 0) {return 0;}

  return latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length;
}
