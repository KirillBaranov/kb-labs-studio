/**
 * @module @kb-labs/studio-app/modules/quality/components/stale-tab
 * Stale Packages tab - shows packages that need rebuilding
 */

import * as React from 'react';
import { Card, Table, Tag, Spin, Alert, Space, Button, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQualityStale } from '@kb-labs/studio-data-client';
import type { StalePackage, StaleChain } from '@kb-labs/quality-contracts';

const { Text } = Typography;

export function StaleTab() {
  const sources = useDataSources();
  const { data, isLoading, error } = useQualityStale(sources.quality, true);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Failed to load stale packages" type="error" showIcon />;
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'gold';
      case 'low':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getReasonText = (reason: string): string => {
    switch (reason) {
      case 'source-newer':
        return 'Source Modified';
      case 'dependency-rebuilt':
        return 'Dependency Rebuilt';
      case 'missing-dist':
        return 'Missing Build';
      default:
        return reason;
    }
  };

  const getReasonColor = (reason: string): string => {
    switch (reason) {
      case 'source-newer':
        return 'orange';
      case 'dependency-rebuilt':
        return 'blue';
      case 'missing-dist':
        return 'red';
      default:
        return 'default';
    }
  };

  const staleColumns: ColumnsType<StalePackage> = [
    {
      title: 'Package',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <code>{name}</code>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      filters: [
        { text: 'Source Modified', value: 'source-newer' },
        { text: 'Dependency Rebuilt', value: 'dependency-rebuilt' },
        { text: 'Missing Build', value: 'missing-dist' },
      ],
      onFilter: (value, record) => record.reason === value,
      render: (reason: string) => (
        <Tag color={getReasonColor(reason)}>{getReasonText(reason)}</Tag>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      sorter: (a, b) => {
        const order = ['critical', 'high', 'medium', 'low'];
        return order.indexOf(a.severity) - order.indexOf(b.severity);
      },
      filters: [
        { text: 'Critical', value: 'critical' },
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
      ],
      onFilter: (value, record) => record.severity === value,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>{severity.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Affected',
      dataIndex: 'affectedCount',
      key: 'affectedCount',
      sorter: (a, b) => a.affectedCount - b.affectedCount,
      render: (count: number) => (
        <Text type={count > 10 ? 'danger' : count > 5 ? 'warning' : 'secondary'}>
          {count} package{count !== 1 ? 's' : ''}
        </Text>
      ),
    },
    {
      title: 'Modified',
      key: 'modified',
      render: (_, record) => {
        if (record.sourceModified) {
          return (
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Source: {new Date(record.sourceModified).toLocaleString()}
              </Text>
              {record.distModified && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Dist: {new Date(record.distModified).toLocaleString()}
                </Text>
              )}
            </Space>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
  ];

  const chainColumns: ColumnsType<StaleChain> = [
    {
      title: 'Root Package',
      dataIndex: 'root',
      key: 'root',
      render: (root: string) => <code>{root}</code>,
    },
    {
      title: 'Depth',
      dataIndex: 'depth',
      key: 'depth',
      sorter: (a, b) => a.depth - b.depth,
      render: (depth: number) => (
        <Tag color={depth > 5 ? 'red' : depth > 3 ? 'orange' : 'blue'}>{depth} levels</Tag>
      ),
    },
    {
      title: 'Affected Packages',
      dataIndex: 'affected',
      key: 'affected',
      sorter: (a, b) => a.affected.length - b.affected.length,
      render: (affected: string[]) => (
        <Text type={affected.length > 20 ? 'danger' : 'secondary'}>
          {affected.length} package{affected.length !== 1 ? 's' : ''}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Summary Alert */}
      {data && data.totalStale > 0 ? (
        <Alert
          type="error"
          showIcon
          icon={<ClockCircleOutlined />}
          message={
            <Space>
              <strong>
                {data.totalStale} stale package{data.totalStale > 1 ? 's' : ''} detected
              </strong>
              <Text type="secondary">
                affecting {data.totalAffected} downstream package
                {data.totalAffected > 1 ? 's' : ''}
              </Text>
            </Space>
          }
          action={
            <Space>
              <Button type="primary" danger icon={<ThunderboltOutlined />} size="small">
                Rebuild All
              </Button>
              <Button size="small">Export Report</Button>
            </Space>
          }
          style={{ marginBottom: 24 }}
        />
      ) : (
        <Alert
          type="success"
          showIcon
          message="All packages are up to date"
          description="No stale packages detected. Your monorepo build state is healthy."
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Critical Chains */}
      {data?.criticalChains && data.criticalChains.length > 0 && (
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              Critical Rebuild Chains
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Alert
            type="warning"
            showIcon
            message="High-impact stale packages"
            description="These packages affect many downstream packages. Rebuilding them will trigger cascading rebuilds."
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={data.criticalChains}
            columns={chainColumns}
            rowKey="root"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* Stale Packages Table */}
      <Card
        title={
          <Space>
            <FileOutlined />
            Stale Packages
          </Space>
        }
      >
        <Table
          dataSource={data?.stalePackages ?? []}
          columns={staleColumns}
          rowKey="name"
          pagination={{ pageSize: 20 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 16px' }}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div>
                    <Text strong>Path: </Text>
                    <Text type="secondary" code>
                      {record.path}
                    </Text>
                  </div>
                  {record.affectedPackages && record.affectedPackages.length > 0 && (
                    <div>
                      <Text strong>Affected Packages ({record.affectedPackages.length}):</Text>
                      <div style={{ marginTop: 8 }}>
                        {record.affectedPackages.slice(0, 10).map((pkg: string) => (
                          <Tag key={pkg} style={{ marginBottom: 4 }}>
                            {pkg}
                          </Tag>
                        ))}
                        {record.affectedPackages.length > 10 && (
                          <Tag>+{record.affectedPackages.length - 10} more</Tag>
                        )}
                      </div>
                    </div>
                  )}
                </Space>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
