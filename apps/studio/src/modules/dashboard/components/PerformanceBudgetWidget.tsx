import React, { useMemo } from 'react';
import { Card, Row, Col, Table, Progress, Tag, Typography, Statistic } from 'antd';
import {
  HolderOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDataSources } from '../../../providers/data-sources-provider';
import { usePrometheusMetrics } from '@kb-labs/studio-data-client';

const { Text, Title } = Typography;

const SLO_TARGET = 99.9; // 99.9% uptime target

interface ServiceSLO {
  service: string;
  uptime: number;
  errorBudget: number;
  budgetUsed: number;
  status: 'healthy' | 'warning' | 'critical';
  burnRate: number;
}

export function PerformanceBudgetWidget() {
  const sources = useDataSources();
  const metrics = usePrometheusMetrics(sources.observability);

  // Calculate overall uptime
  const overallUptime = useMemo(() => {
    if (!metrics.data?.requests) {return 100;}

    const total = metrics.data.requests.total ?? 0;
    const success = metrics.data.requests.success ?? 0;

    return total > 0 ? (success / total) * 100 : 100;
  }, [metrics.data]);

  // Calculate error budget
  const errorBudget = useMemo(() => {
    const allowedDowntime = (100 - SLO_TARGET) / 100; // 0.1% = 0.001
    const minutesPerMonth = 30 * 24 * 60; // 43,200 minutes
    const budgetMinutes = allowedDowntime * minutesPerMonth; // 43.2 minutes

    const currentDowntime = 100 - overallUptime;
    const budgetUsedPercent = (currentDowntime / (100 - SLO_TARGET)) * 100;

    return {
      totalMinutes: budgetMinutes,
      usedPercent: Math.min(100, budgetUsedPercent),
      remainingMinutes: Math.max(0, budgetMinutes * (1 - budgetUsedPercent / 100)),
    };
  }, [overallUptime]);

  // Calculate burn rate (how fast we're using error budget)
  const burnRate = useMemo(() => {
    // Simplified: assume current error rate continues
    const errorRate = 100 - overallUptime;
    const targetErrorRate = 100 - SLO_TARGET; // 0.1%

    return errorRate / targetErrorRate; // 1.0 = on target, >1 = burning too fast
  }, [overallUptime]);

  // Per-plugin SLO tracking
  const serviceSLOs = useMemo(() => {
    if (!metrics.data?.perPlugin) {return [];}

    return metrics.data.perPlugin.map((plugin): ServiceSLO => {
      const total = plugin.requests;
      const errors = plugin.errors ?? 0;
      const success = total - errors;
      const uptime = total > 0 ? (success / total) * 100 : 100;

      const allowedDowntime = 100 - SLO_TARGET;
      const currentDowntime = 100 - uptime;
      const budgetUsed = (currentDowntime / allowedDowntime) * 100;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (budgetUsed > 90) {status = 'critical';}
      else if (budgetUsed > 70) {status = 'warning';}

      const serviceBurnRate = currentDowntime / allowedDowntime;

      return {
        service: plugin.pluginId,
        uptime,
        errorBudget: 100 - budgetUsed,
        budgetUsed: Math.min(100, budgetUsed),
        status,
        burnRate: serviceBurnRate,
      };
    }).sort((a, b) => a.budgetUsed - b.budgetUsed); // Worst first
  }, [metrics.data]);

  // Error budget gauge status
  const getGaugeStatus = (usedPercent: number) => {
    if (usedPercent < 70) {return 'success';}
    if (usedPercent < 90) {return 'warning';}
    return 'exception';
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (uptime: number) => {
        const color = uptime >= 99.9 ? '#52c41a' : uptime >= 99 ? '#faad14' : '#ff4d4f';
        return <Text style={{ color }}>{uptime.toFixed(3)}%</Text>;
      },
      sorter: (a: ServiceSLO, b: ServiceSLO) => a.uptime - b.uptime,
    },
    {
      title: 'Error Budget',
      dataIndex: 'budgetUsed',
      key: 'budgetUsed',
      render: (budgetUsed: number, record: ServiceSLO) => (
        <div style={{ width: 150 }}>
          <Progress
            percent={budgetUsed}
            size="small"
            status={record.status === 'critical' ? 'exception' : record.status === 'warning' ? 'normal' : 'success'}
            format={(percent) => `${(100 - (percent ?? 0)).toFixed(0)}% left`}
          />
        </div>
      ),
      sorter: (a: ServiceSLO, b: ServiceSLO) => b.budgetUsed - a.budgetUsed,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'healthy' | 'warning' | 'critical') => {
        const config = {
          healthy: { color: 'green', icon: <CheckCircleOutlined />, text: 'Healthy' },
          warning: { color: 'orange', icon: <WarningOutlined />, text: 'Warning' },
          critical: { color: 'red', icon: <CloseCircleOutlined />, text: 'Critical' },
        };
        const { color, icon, text } = config[status];
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
      filters: [
        { text: 'Healthy', value: 'healthy' },
        { text: 'Warning', value: 'warning' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value: any, record: ServiceSLO) => record.status === value,
    },
    {
      title: 'Burn Rate',
      dataIndex: 'burnRate',
      key: 'burnRate',
      render: (rate: number) => {
        const color = rate <= 1 ? '#52c41a' : rate <= 2 ? '#faad14' : '#ff4d4f';
        return <Text style={{ color }}>{rate.toFixed(2)}x</Text>;
      },
      sorter: (a: ServiceSLO, b: ServiceSLO) => a.burnRate - b.burnRate,
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: '#999' }} />
          <DashboardOutlined />
          <span>Performance Budget (SLO)</span>
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row gutter={[16, 16]}>
        {/* SLO Summary */}
        <Col xs={24} md={8}>
          <div style={{
            padding: '16px',
            background: '#f0f5ff',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <Text type="secondary">SLO Target</Text>
            <Title level={2} style={{ margin: '8px 0' }}>
              {SLO_TARGET}%
            </Title>
            <Text type="secondary">Monthly Uptime</Text>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div style={{
            padding: '16px',
            background: overallUptime >= 99.9 ? '#f6ffed' : '#fff1f0',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <Text type="secondary">Current Uptime</Text>
            <Title
              level={2}
              style={{
                margin: '8px 0',
                color: overallUptime >= 99.9 ? '#52c41a' : '#ff4d4f',
              }}
            >
              {overallUptime.toFixed(3)}%
            </Title>
            <Text type="secondary">
              {overallUptime >= SLO_TARGET ? 'Within SLO' : 'Below SLO'}
            </Text>
          </div>
        </Col>

        <Col xs={24} md={8}>
          <div style={{
            padding: '16px',
            background: '#fffbe6',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <Text type="secondary">Burn Rate</Text>
            <Title
              level={2}
              style={{
                margin: '8px 0',
                color: burnRate <= 1 ? '#52c41a' : burnRate <= 2 ? '#faad14' : '#ff4d4f',
              }}
            >
              {burnRate.toFixed(2)}x
            </Title>
            <Text type="secondary">
              {burnRate <= 1 ? 'On Track' : 'Burning Fast'}
            </Text>
          </div>
        </Col>

        {/* Error Budget Gauge */}
        <Col span={24}>
          <Card
            size="small"
            title="Error Budget Consumption"
            style={{ background: '#fafafa' }}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} md={12}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Progress
                    type="dashboard"
                    percent={errorBudget.usedPercent}
                    status={getGaugeStatus(errorBudget.usedPercent)}
                    format={(percent) => (
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                          {(100 - (percent ?? 0)).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          Remaining
                        </div>
                      </div>
                    )}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Statistic
                      title="Budget Allowed"
                      value={errorBudget.totalMinutes}
                      suffix="min/month"
                      precision={1}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Budget Remaining"
                      value={errorBudget.remainingMinutes}
                      suffix="min"
                      precision={1}
                      valueStyle={{
                        fontSize: 18,
                        color: errorBudget.usedPercent > 90 ? '#ff4d4f' : '#52c41a',
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Per-Service SLO Table */}
        <Col span={24}>
          <Title level={5}>Service-Level SLOs</Title>
          <Table
            dataSource={serviceSLOs}
            columns={columns}
            pagination={{ pageSize: 5 }}
            size="small"
            rowKey="service"
          />
        </Col>
      </Row>
    </Card>
  );
}
