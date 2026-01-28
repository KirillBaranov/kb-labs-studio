/**
 * @module @kb-labs/studio-app/modules/quality/components/overview-tab
 * Overview tab - shows health score, stats, and key metrics
 */

import * as React from 'react';
import { Row, Col, Card, Statistic, Progress, Tag, Alert, Spin, Button, Space } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useQualityHealth,
  useQualityStats,
  useQualityStale,
} from '@kb-labs/studio-data-client';

export function OverviewTab() {
  const sources = useDataSources();

  const { data: statsData, isLoading: statsLoading } = useQualityStats(sources.quality, true);
  const { data: healthData, isLoading: healthLoading } = useQualityHealth(
    sources.quality,
    true
  );
  const { data: staleData, isLoading: staleLoading } = useQualityStale(sources.quality, true);

  const isLoading = statsLoading || healthLoading;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getGradeColor = (grade?: string): string => {
    switch (grade) {
      case 'A':
        return 'green';
      case 'B':
        return 'blue';
      case 'C':
        return 'orange';
      case 'D':
        return 'red';
      case 'F':
        return 'volcano';
      default:
        return 'default';
    }
  };

  const getHealthStatus = (score?: number): 'success' | 'exception' | 'normal' => {
    if (!score) {return 'normal';}
    if (score >= 80) {return 'success';}
    if (score < 60) {return 'exception';}
    return 'normal';
  };

  const getSeverityType = (severity: string): 'error' | 'warning' | 'info' => {
    if (severity === 'high') {return 'error';}
    if (severity === 'medium') {return 'warning';}
    return 'info';
  };

  return (
    <div>
      {/* Stale Packages Alert */}
      {!staleLoading && staleData && staleData.totalStale > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<ClockCircleOutlined />}
          message={`${staleData.totalStale} stale package${staleData.totalStale > 1 ? 's' : ''} detected`}
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                Some packages need rebuilding. This affects {staleData.totalAffected} downstream
                package{staleData.totalAffected > 1 ? 's' : ''}.
              </p>
              {staleData.criticalChains && staleData.criticalChains.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <strong>Critical chains:</strong>
                  <ul style={{ marginTop: 4, marginBottom: 0 }}>
                    {staleData.criticalChains.slice(0, 3).map((chain, idx) => (
                      <li key={idx}>
                        <code>{chain.root}</code> affects {chain.affected.length} packages
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Space>
                <Button type="primary" danger icon={<ThunderboltOutlined />} size="small">
                  Rebuild All Stale
                </Button>
                <Button size="small">View Details</Button>
              </Space>
            </div>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Health Score Card */}
      <Card title="Health Score" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={healthData?.score ?? 0}
                size={180}
                status={getHealthStatus(healthData?.score)}
                strokeColor={{
                  '0%': healthData?.score && healthData.score >= 80 ? '#52c41a' : '#ff4d4f',
                  '100%': healthData?.score && healthData.score >= 80 ? '#73d13d' : '#ff7a45',
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Tag color={getGradeColor(healthData?.grade)} style={{ fontSize: 16 }}>
                  Grade {healthData?.grade}
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <Statistic
              title="Packages"
              value={statsData?.packages ?? 0}
              prefix={<DatabaseOutlined />}
            />
            <Statistic
              title="Lines of Code"
              value={statsData?.loc ?? 0}
              prefix={<CodeOutlined />}
              style={{ marginTop: 16 }}
            />
            <Statistic
              title="Total Size"
              value={statsData?.size ?? 'N/A'}
              prefix={<FileTextOutlined />}
              style={{ marginTop: 16 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Issues Breakdown */}
      {healthData?.issues && healthData.issues.length > 0 && (
        <Card title="Health Issues" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            {healthData.issues.map((issue, idx) => (
              <Col span={24} key={idx} style={{ marginBottom: 12 }}>
                <Alert
                  message={
                    <Space>
                      <span>{issue.message}</span>
                      <Tag color={getSeverityType(issue.severity) === 'error' ? 'red' : 'orange'}>
                        {issue.severity}
                      </Tag>
                      <Tag>{issue.count} affected</Tag>
                      <Tag color="red">-{issue.penalty} points</Tag>
                    </Space>
                  }
                  type={getSeverityType(issue.severity)}
                  showIcon
                  icon={
                    getSeverityType(issue.severity) === 'error' ? (
                      <WarningOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                />
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Quick Stats */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Packages"
              value={statsData?.packages ?? 0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Lines of Code"
              value={statsData?.loc ?? 0}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Size"
              value={statsData?.size ?? 'N/A'}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
