/**
 * @module @kb-labs/studio-app/modules/quality/components/dependencies-tab
 * Dependencies tab - shows duplicates, unused, and missing dependencies
 */

import * as React from 'react';
import { Card, Table, Tag, Spin, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQualityDependencies } from '@kb-labs/studio-data-client';
import type {
  DuplicateDependency,
  VersionInfo,
  UnusedDependency,
  MissingDependency,
} from '@kb-labs/quality-contracts';

export function DependenciesTab() {
  const sources = useDataSources();
  const { data, isLoading, error } = useQualityDependencies(sources.quality);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Failed to load dependencies" type="error" showIcon />;
  }

  const duplicatesColumns: ColumnsType<DuplicateDependency> = [
    {
      title: 'Dependency',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Versions',
      dataIndex: 'versions',
      key: 'versions',
      render: (versions: VersionInfo[]) => (
        <>
          {versions.map((v) => (
            <Tag key={v.version} color="orange">
              {v.version} ({v.count})
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Total Packages',
      dataIndex: 'totalPackages',
      key: 'totalPackages',
      sorter: (a, b) => a.totalPackages - b.totalPackages,
    },
  ];

  const unusedColumns: ColumnsType<UnusedDependency> = [
    {
      title: 'Dependency',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Packages',
      dataIndex: 'packages',
      key: 'packages',
      render: (packages: string[]) => packages.join(', '),
    },
  ];

  const missingColumns: ColumnsType<MissingDependency> = [
    {
      title: 'Dependency',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Packages',
      dataIndex: 'packages',
      key: 'packages',
      render: (packages: string[]) => packages.join(', '),
    },
    {
      title: 'Imported In',
      dataIndex: 'importedIn',
      key: 'importedIn',
      render: (files: string[]) => files.join(', '),
    },
  ];

  return (
    <div>
      {data && data.totalIssues === 0 && (
        <Alert
          message="No dependency issues found!"
          description="Your monorepo has no duplicate, unused, or missing dependencies."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Duplicates */}
      <Card
        title={`Duplicate Dependencies (${data?.duplicates?.length ?? 0})`}
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={data?.duplicates ?? []}
          columns={duplicatesColumns}
          rowKey="name"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Unused */}
      <Card
        title={`Unused Dependencies (${data?.unused?.length ?? 0})`}
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={data?.unused ?? []}
          columns={unusedColumns}
          rowKey="name"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Missing */}
      <Card title={`Missing Dependencies (${data?.missing?.length ?? 0})`}>
        <Table
          dataSource={data?.missing ?? []}
          columns={missingColumns}
          rowKey="name"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
