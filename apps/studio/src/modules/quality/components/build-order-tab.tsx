/**
 * @module @kb-labs/studio-app/modules/quality/components/build-order-tab
 * Build Order tab - shows parallel build layers and sequential order
 */

import * as React from 'react';
import { Card, Table, Tag, Spin, Alert, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQualityBuildOrder, useQualityCycles } from '@kb-labs/studio-data-client';

export function BuildOrderTab() {
  const sources = useDataSources();
  const [selectedPackage, setSelectedPackage] = React.useState<string | undefined>();

  const { data, isLoading, error } = useQualityBuildOrder(sources.quality, selectedPackage);
  const { data: cyclesData } = useQualityCycles(sources.quality);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Failed to load build order" type="error" showIcon />;
  }

  const layersColumns: ColumnsType<{ layer: number; packages: string[] }> = [
    {
      title: 'Layer',
      dataIndex: 'layer',
      key: 'layer',
      width: 100,
      render: (layer: number) => <Tag color="blue">Layer {layer}</Tag>,
    },
    {
      title: 'Packages (can build in parallel)',
      dataIndex: 'packages',
      key: 'packages',
      render: (packages: string[]) => (
        <Space wrap>
          {packages.map((pkg) => (
            <Tag key={pkg}>{pkg}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  const layersData = data?.layers.map((layer, idx) => ({
    layer: idx + 1,
    packages: layer,
    key: idx,
  }));

  return (
    <div>
      {/* Circular Dependencies Warning */}
      {data?.hasCircular && (
        <Alert
          message="Circular Dependencies Detected!"
          description={`Found ${data.circular.length} circular dependency cycles. Build order may not be correct.`}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Package Filter */}
      <Card title="Filter" style={{ marginBottom: 24 }}>
        <Select
          style={{ width: 400 }}
          placeholder="Select package to see its build dependencies"
          value={selectedPackage}
          onChange={setSelectedPackage}
          allowClear
          showSearch
          options={data?.sorted.map((pkg) => ({
            label: pkg,
            value: pkg,
          })) ?? []}
        />
      </Card>

      {/* Build Layers */}
      <Card
        title={`Build Layers (${data?.layerCount ?? 0} layers, ${data?.packageCount ?? 0} packages)`}
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={layersData}
          columns={layersColumns}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 0' }}>
                <strong>Packages in this layer:</strong>
                <div style={{ marginTop: 8 }}>
                  {record.packages.map((pkg) => (
                    <Tag key={pkg} style={{ marginBottom: 4 }}>
                      {pkg}
                    </Tag>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </Card>

      {/* Circular Dependencies */}
      {data?.hasCircular && (
        <Card title={`Circular Dependencies (${data.circular.length})`}>
          {data.circular.map((cycle, idx) => (
            <Alert
              key={idx}
              message={`Cycle ${idx + 1}`}
              description={cycle.join(' → ')}
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
