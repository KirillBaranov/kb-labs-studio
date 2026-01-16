/**
 * @module @kb-labs/studio-app/modules/quality/components/graph-tab
 * Dependency Graph tab - visualizes package dependencies
 */

import * as React from 'react';
import { Card, Select, Spin, Alert, Tree, Row, Col, Statistic } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQualityGraph, useQualityBuildOrder } from '@kb-labs/studio-data-client';
import type { GraphMode, GraphNode } from '@kb-labs/quality-contracts';

export function GraphTab() {
  const sources = useDataSources();
  const [mode, setMode] = React.useState<GraphMode>('stats');
  const [selectedPackage, setSelectedPackage] = React.useState<string | undefined>();

  const { data: buildOrderData } = useQualityBuildOrder(sources.quality);

  // Auto-select first package when switching to modes that require packageName
  React.useEffect(() => {
    if ((mode === 'reverse' || mode === 'impact') && !selectedPackage && buildOrderData?.sorted?.[0]) {
      setSelectedPackage(buildOrderData.sorted[0]);
    }
  }, [mode, selectedPackage, buildOrderData]);

  const { data, isLoading, error } = useQualityGraph(sources.quality, mode, selectedPackage);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Failed to load graph" type="error" showIcon />;
  }

  const convertToTreeData = (node: GraphNode, path: string = ''): DataNode => {
    const key = path ? `${path}/${node.name}` : node.name;
    return {
      title: node.name,
      key,
      children: node.children?.map((child) => convertToTreeData(child, key)),
    };
  };

  const renderTreeMode = () => {
    if (!data?.tree) {
      return <Alert message="No tree data available" type="info" />;
    }

    return (
      <Tree
        treeData={[convertToTreeData(data.tree)]}
        showLine
        defaultExpandedKeys={[data.tree.name]}
      />
    );
  };

  const renderPackagesMode = () => {
    if (!data?.packages || data.packages.length === 0) {
      return <Alert message="No packages found" type="info" />;
    }

    return (
      <ul>
        {data.packages.map((pkg) => (
          <li key={pkg}>{pkg}</li>
        ))}
      </ul>
    );
  };

  const renderStatsMode = () => {
    if (!data?.stats) {
      return <Alert message="No stats available" type="info" />;
    }

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic title="Total Packages" value={data.stats.totalPackages} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Max Depth" value={data.stats.maxDepth} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Avg Dependencies"
                value={data.stats.avgDependencies}
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {data.stats.mostDepended && data.stats.mostDepended.length > 0 && (
          <Card title="Most Depended On">
            <ul>
              {data.stats.mostDepended.map((item) => (
                <li key={item.name}>
                  <strong>{item.name}</strong> - {item.count} packages depend on it
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Controls */}
      <Card title="Visualization Options" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <label>Mode:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={mode}
              onChange={setMode}
              options={[
                { label: 'Dependency Tree', value: 'tree' },
                { label: 'Reverse Dependencies', value: 'reverse' },
                { label: 'Impact Analysis', value: 'impact' },
                { label: 'Statistics', value: 'stats' },
              ]}
            />
          </Col>
          {mode !== 'stats' && (
            <Col span={12}>
              <label>Package{mode === 'tree' ? ' (optional)' : ''}:</label>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder={mode === 'tree' ? 'All packages' : 'Select a package'}
                value={selectedPackage}
                onChange={setSelectedPackage}
                allowClear
                showSearch
                options={
                  buildOrderData?.sorted?.map((pkg) => ({
                    label: pkg,
                    value: pkg,
                  })) ?? []
                }
              />
            </Col>
          )}
        </Row>
      </Card>

      {/* Visualization */}
      <Card title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}>
        {mode === 'tree' && renderTreeMode()}
        {(mode === 'reverse' || mode === 'impact') && renderPackagesMode()}
        {mode === 'stats' && renderStatsMode()}
      </Card>
    </div>
  );
}
