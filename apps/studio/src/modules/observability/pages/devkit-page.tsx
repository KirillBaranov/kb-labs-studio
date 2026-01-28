import { Row, Col, Table, Card, Statistic, Tag, Alert, Progress } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDevKitHealth } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';

/**
 * Get color for health grade
 */
function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'success';
    case 'B':
      return 'processing';
    case 'C':
      return 'warning';
    case 'D':
    case 'F':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get icon for health grade
 */
function getGradeIcon(grade: string) {
  switch (grade) {
    case 'A':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'B':
      return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
    case 'C':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'D':
      return <ExclamationCircleOutlined style={{ color: '#ff7a45' }} />;
    case 'F':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <ExclamationCircleOutlined />;
  }
}

/**
 * Get status for health score progress bar
 */
function getScoreStatus(score: number): 'success' | 'normal' | 'exception' {
  if (score >= 80) {return 'success';}
  if (score >= 60) {return 'normal';}
  return 'exception';
}

/**
 * Format issue key to human-readable label
 */
function formatIssueLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * DevKit Health Observability Page
 *
 * Shows monorepo health metrics from DevKit:
 * - Health score and grade
 * - Issues breakdown (duplicate deps, type errors, etc.)
 * - Package count and type coverage
 */
export function DevKitPage() {
  const sources = useDataSources();
  const { data, isLoading, error, isError } = useDevKitHealth(sources.observability);

  if (isError) {
    return (
      <KBPageContainer>
        <KBPageHeader
          title="DevKit Health"
          description="Monorepo health and quality metrics"
        />
        <Alert
          message="Failed to load DevKit health"
          description={error instanceof Error ? error.message : 'Unknown error. Make sure DevKit is installed and executable.'}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      </KBPageContainer>
    );
  }

  if (isLoading || !data) {
    return (
      <KBPageContainer>
        <KBPageHeader
          title="DevKit Health"
          description="Monorepo health and quality metrics"
        />
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          Loading DevKit health check... (this may take up to 30 seconds)
        </div>
      </KBPageContainer>
    );
  }

  const totalIssues = Object.values(data.issues).reduce((sum: number, count) => sum + count, 0);

  return (
    <KBPageContainer>
      <KBPageHeader
        title="DevKit Health"
        description="Monorepo health and quality metrics - Cached for 1 minute"
      />

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Health Score"
              value={data.healthScore}
              suffix="/ 100"
              prefix={getGradeIcon(data.grade)}
              valueStyle={{
                color: data.healthScore >= 80 ? '#52c41a' :
                       data.healthScore >= 60 ? '#1890ff' :
                       '#ff4d4f'
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color={getGradeColor(data.grade)} style={{ fontSize: 14 }}>
                Grade {data.grade}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Packages"
              value={data.packages}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Issues"
              value={totalIssues}
              prefix={<WarningOutlined />}
              valueStyle={{ color: totalIssues > 100 ? '#ff4d4f' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Health Score Progress */}
      <Card title="Health Score Breakdown" style={{ marginBottom: 24 }}>
        <Progress
          percent={data.healthScore}
          status={getScoreStatus(data.healthScore)}
          strokeColor={
            data.healthScore >= 80 ? '#52c41a' :
            data.healthScore >= 60 ? '#1890ff' :
            '#ff4d4f'
          }
        />
        <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
          {data.healthScore >= 90 ? '🎉 Excellent monorepo health!' :
           data.healthScore >= 80 ? '✅ Good health - minor improvements needed' :
           data.healthScore >= 70 ? '⚠️  Moderate health - some issues to address' :
           data.healthScore >= 60 ? '⚠️  Fair health - significant issues present' :
           '❌ Poor health - urgent attention required'}
        </div>
      </Card>

      {/* Type Coverage (if available) */}
      {data.avgTypeCoverage !== undefined && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="TypeScript Type Coverage">
              <Progress
                percent={Math.round(data.avgTypeCoverage)}
                status={data.avgTypeCoverage >= 90 ? 'success' : data.avgTypeCoverage >= 70 ? 'normal' : 'exception'}
                strokeColor={data.avgTypeCoverage >= 90 ? '#52c41a' : data.avgTypeCoverage >= 70 ? '#1890ff' : '#faad14'}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                Average type coverage across all packages
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Issues Breakdown Table */}
      <Card title="Issues Breakdown">
        <Table
          dataSource={Object.entries(data.issues)
            .map(([key, count]) => ({
              key,
              issue: formatIssueLabel(key),
              count,
              severity: count > 100 ? 'high' : count > 10 ? 'medium' : 'low',
            }))
            .sort((a, b) => b.count - a.count)} // Sort by count descending
          columns={[
            {
              title: 'Issue Type',
              dataIndex: 'issue',
              key: 'issue',
              render: (issue: string) => <strong>{issue}</strong>,
            },
            {
              title: 'Count',
              dataIndex: 'count',
              key: 'count',
              align: 'right' as const,
              render: (count: number) => (
                <span style={{
                  color: count > 100 ? '#ff4d4f' :
                         count > 10 ? '#faad14' :
                         '#52c41a'
                }}>
                  {count.toLocaleString()}
                </span>
              ),
            },
            {
              title: 'Severity',
              dataIndex: 'severity',
              key: 'severity',
              align: 'center' as const,
              render: (severity: string) => {
                const config = {
                  high: { color: 'error', label: 'High' },
                  medium: { color: 'warning', label: 'Medium' },
                  low: { color: 'success', label: 'Low' },
                }[severity] || { color: 'default', label: 'Unknown' };

                return <Tag color={config.color}>{config.label}</Tag>;
              },
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </KBPageContainer>
  );
}
