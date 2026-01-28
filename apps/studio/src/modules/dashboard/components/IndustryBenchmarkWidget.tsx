import React, { useMemo } from 'react';
import { Card, Table, Tag, Typography, Tooltip, Progress, Space } from 'antd';
import {
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDataSources } from '../../../providers/data-sources-provider';
import {
  usePrometheusMetrics,
  useStateBrokerStats,
  useAdaptersLLMUsage,
} from '@kb-labs/studio-data-client';

const { Text, Title } = Typography;

// Industry benchmark data (mock - in production would come from API)
const INDUSTRY_BENCHMARKS = {
  median: {
    errorRate: 1.2,       // %
    p95Latency: 120,      // ms
    cacheHitRate: 75,     // %
    costPer1kReq: 0.45,   // $
    uptime: 99.5,         // %
    avgLatency: 85,       // ms
  },
  top10Percent: {
    errorRate: 0.3,
    p95Latency: 45,
    cacheHitRate: 92,
    costPer1kReq: 0.18,
    uptime: 99.95,
    avgLatency: 35,
  },
};

interface MetricComparison {
  name: string;
  description: string;
  yourValue: number;
  medianValue: number;
  top10Value: number;
  unit: string;
  lowerIsBetter: boolean;
  status: 'excellent' | 'good' | 'average' | 'poor';
  percentile: number;
}

export function IndustryBenchmarkWidget() {
  const sources = useDataSources();
  const metrics = usePrometheusMetrics(sources.observability);
  const stateBroker = useStateBrokerStats(sources.observability);
  const llmUsage = useAdaptersLLMUsage(sources.adapters);

  const comparisons = useMemo((): MetricComparison[] => {
    const totalRequests = metrics.data?.requests?.total ?? 1;
    const totalErrors = (metrics.data?.requests?.clientErrors ?? 0) + (metrics.data?.requests?.serverErrors ?? 0);
    const errorRate = (totalErrors / totalRequests) * 100;

    const avgLatency = metrics.data?.perPlugin?.reduce((sum, p) => sum + (p.latency?.average ?? 0), 0) /
      (metrics.data?.perPlugin?.length || 1) ?? 85;

    const p95Latency = avgLatency * 1.4; // Estimated p95

    const cacheHitRate = (stateBroker.data?.hitRate ?? 0.75) * 100;

    const totalCost = llmUsage.data?.totalCost ?? 0;
    const costPer1kReq = totalRequests > 0 ? (totalCost / totalRequests) * 1000 : 0;

    const uptime = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;

    // Calculate percentile ranking for each metric
    const calculatePercentile = (value: number, median: number, top10: number, lowerIsBetter: boolean): number => {
      if (lowerIsBetter) {
        if (value <= top10) {return 95;}
        if (value <= median) {return 50 + ((median - value) / (median - top10)) * 40;}
        return Math.max(5, 50 - ((value - median) / median) * 40);
      } else {
        if (value >= top10) {return 95;}
        if (value >= median) {return 50 + ((value - median) / (top10 - median)) * 40;}
        return Math.max(5, 50 - ((median - value) / median) * 40);
      }
    };

    const getStatus = (percentile: number): MetricComparison['status'] => {
      if (percentile >= 90) {return 'excellent';}
      if (percentile >= 70) {return 'good';}
      if (percentile >= 40) {return 'average';}
      return 'poor';
    };

    const metricsData: Omit<MetricComparison, 'status' | 'percentile'>[] = [
      {
        name: 'Error Rate',
        description: 'Percentage of failed requests',
        yourValue: errorRate,
        medianValue: INDUSTRY_BENCHMARKS.median.errorRate,
        top10Value: INDUSTRY_BENCHMARKS.top10Percent.errorRate,
        unit: '%',
        lowerIsBetter: true,
      },
      {
        name: 'P95 Latency',
        description: '95th percentile response time',
        yourValue: p95Latency,
        medianValue: INDUSTRY_BENCHMARKS.median.p95Latency,
        top10Value: INDUSTRY_BENCHMARKS.top10Percent.p95Latency,
        unit: 'ms',
        lowerIsBetter: true,
      },
      {
        name: 'Avg Latency',
        description: 'Average response time',
        yourValue: avgLatency,
        medianValue: INDUSTRY_BENCHMARKS.median.avgLatency,
        top10Value: INDUSTRY_BENCHMARKS.top10Percent.avgLatency,
        unit: 'ms',
        lowerIsBetter: true,
      },
      {
        name: 'Cache Hit Rate',
        description: 'Percentage of cached responses',
        yourValue: cacheHitRate,
        medianValue: INDUSTRY_BENCHMARKS.median.cacheHitRate,
        top10Value: INDUSTRY_BENCHMARKS.top10Percent.cacheHitRate,
        unit: '%',
        lowerIsBetter: false,
      },
      {
        name: 'Cost per 1K Req',
        description: 'Average cost per 1000 requests',
        yourValue: costPer1kReq,
        medianValue: INDUSTRY_BENCHMARKS.median.costPer1kReq,
        top10Value: INDUSTRY_BENCHMARKS.top10Percent.costPer1kReq,
        unit: '$',
        lowerIsBetter: true,
      },
      {
        name: 'Uptime',
        description: 'Service availability percentage',
        yourValue: uptime,
        medianValue: INDUSTRY_BENCHMARKS.median.uptime,
        top10Value: INDUSTRY_BENCHMARKS.top10Percent.uptime,
        unit: '%',
        lowerIsBetter: false,
      },
    ];

    return metricsData.map(m => {
      const percentile = calculatePercentile(m.yourValue, m.medianValue, m.top10Value, m.lowerIsBetter);
      return {
        ...m,
        percentile,
        status: getStatus(percentile),
      };
    });
  }, [metrics.data, stateBroker.data, llmUsage.data]);

  // Calculate overall percentile
  const overallPercentile = comparisons.reduce((sum, c) => sum + c.percentile, 0) / comparisons.length;

  const getStatusIcon = (status: MetricComparison['status']) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleOutlined style={{ color: 'var(--success)' }} />;
      case 'good':
        return <CheckCircleOutlined style={{ color: 'var(--info)' }} />;
      case 'average':
        return <WarningOutlined style={{ color: 'var(--warning)' }} />;
      case 'poor':
        return <CloseCircleOutlined style={{ color: 'var(--error)' }} />;
    }
  };

  const getStatusColor = (status: MetricComparison['status']) => {
    switch (status) {
      case 'excellent': return 'var(--success)';
      case 'good': return 'var(--info)';
      case 'average': return 'var(--warning)';
      case 'poor': return 'var(--error)';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {return `$${value.toFixed(2)}`;}
    if (unit === '%') {return `${value.toFixed(2)}%`;}
    if (unit === 'ms') {return `${value.toFixed(0)}ms`;}
    return value.toFixed(2);
  };

  const columns = [
    {
      title: 'Metric',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MetricComparison) => (
        <Tooltip title={record.description}>
          <Space>
            {getStatusIcon(record.status)}
            <Text strong>{name}</Text>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Your Value',
      dataIndex: 'yourValue',
      key: 'yourValue',
      render: (value: number, record: MetricComparison) => (
        <Text strong style={{ color: getStatusColor(record.status) }}>
          {formatValue(value, record.unit)}
        </Text>
      ),
    },
    {
      title: 'Industry Median',
      dataIndex: 'medianValue',
      key: 'medianValue',
      render: (value: number, record: MetricComparison) => {
        const diff = record.yourValue - value;
        const better = record.lowerIsBetter ? diff < 0 : diff > 0;
        return (
          <Space>
            <Text type="secondary">{formatValue(value, record.unit)}</Text>
            {better ? (
              <ArrowUpOutlined style={{ color: 'var(--success)', fontSize: 12 }} />
            ) : (
              <ArrowDownOutlined style={{ color: 'var(--error)', fontSize: 12 }} />
            )}
          </Space>
        );
      },
    },
    {
      title: 'Top 10%',
      dataIndex: 'top10Value',
      key: 'top10Value',
      render: (value: number, record: MetricComparison) => (
        <Text type="secondary">{formatValue(value, record.unit)}</Text>
      ),
    },
    {
      title: 'Percentile',
      dataIndex: 'percentile',
      key: 'percentile',
      width: 150,
      render: (percentile: number, record: MetricComparison) => (
        <div>
          <Progress
            percent={percentile}
            size="small"
            strokeColor={getStatusColor(record.status)}
            format={() => (
              <Tag color={getStatusColor(record.status)} style={{ marginLeft: 8 }}>
                P{Math.round(percentile)}
              </Tag>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChartOutlined />
          <span>Industry Benchmark</span>
        </div>
      }
      extra={
        <Space>
          <Text type="secondary">Overall:</Text>
          <Tag
            color={
              overallPercentile >= 90 ? 'green' :
              overallPercentile >= 70 ? 'blue' :
              overallPercentile >= 40 ? 'orange' : 'red'
            }
            style={{ fontSize: 14 }}
          >
            P{Math.round(overallPercentile)}
          </Tag>
        </Space>
      }
    >
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 16,
        padding: 16,
        background: 'var(--bg-tertiary)',
        borderRadius: 8,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
            {comparisons.filter(c => c.status === 'excellent').length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Excellent</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--info)' }}>
            {comparisons.filter(c => c.status === 'good').length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Good</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>
            {comparisons.filter(c => c.status === 'average').length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Average</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--error)' }}>
            {comparisons.filter(c => c.status === 'poor').length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Needs Work</Text>
        </div>
      </div>

      {/* Comparison Table */}
      <Table
        dataSource={comparisons}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="name"
      />

      {/* Legend */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: 'var(--accent-subtle)',
        borderRadius: 8,
        fontSize: 12,
      }}>
        <Text strong>How to read:</Text>
        <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          • <b>Industry Median</b>: Average performance across similar platforms
          <br />
          • <b>Top 10%</b>: Performance of top-performing platforms
          <br />
          • <b>Percentile</b>: Your ranking (P90 = better than 90% of platforms)
        </div>
      </div>
    </Card>
  );
}
