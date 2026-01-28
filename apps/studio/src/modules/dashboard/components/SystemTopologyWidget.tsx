import React, { useMemo, useState, useCallback } from 'react';
import { Card, Drawer, Descriptions, Badge, Tag, Statistic, Row, Col } from 'antd';
import { HolderOutlined, ApartmentOutlined, CloseOutlined } from '@ant-design/icons';
import type {
  Node,
  Edge} from 'reactflow';
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDataSources } from '../../../providers/data-sources-provider';
import { usePrometheusMetrics } from '@kb-labs/studio-data-client';

interface NodeData {
  label: string;
  type: 'user' | 'api' | 'plugin' | 'adapter';
  requests?: number;
  errors?: number;
  latency?: number;
  status: 'healthy' | 'warning' | 'error';
}

interface SelectedNode {
  id: string;
  data: NodeData;
}

export function SystemTopologyWidget() {
  const sources = useDataSources();
  const metrics = usePrometheusMetrics(sources.observability);

  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);

  // Build nodes and edges from metrics data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // User node (entry point)
    nodes.push({
      id: 'user',
      type: 'input',
      data: { label: '👤 User', type: 'user', status: 'healthy' },
      position: { x: 400, y: 0 },
      style: {
        background: '#e6f7ff',
        border: '2px solid #1890ff',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        fontWeight: 600,
      },
    });

    // REST API node
    const totalRequests = metrics.data?.requests?.total ?? 0;
    const totalErrors = (metrics.data?.requests?.clientErrors ?? 0) + (metrics.data?.requests?.serverErrors ?? 0);
    const apiStatus = totalErrors > totalRequests * 0.05 ? 'error' : totalErrors > 0 ? 'warning' : 'healthy';

    nodes.push({
      id: 'api',
      data: {
        label: 'REST API',
        type: 'api',
        requests: totalRequests,
        errors: totalErrors,
        status: apiStatus,
      } as NodeData,
      position: { x: 400, y: 100 },
      style: {
        background: apiStatus === 'healthy' ? '#f6ffed' : apiStatus === 'warning' ? '#fffbe6' : '#fff1f0',
        border: `2px solid ${apiStatus === 'healthy' ? '#52c41a' : apiStatus === 'warning' ? '#faad14' : '#ff4d4f'}`,
        borderRadius: 8,
        padding: 12,
        fontSize: 13,
        minWidth: 120,
      },
    });

    edges.push({
      id: 'user-api',
      source: 'user',
      target: 'api',
      animated: true,
      style: { stroke: '#1890ff', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff' },
    });

    // Plugin nodes
    const pluginData = metrics.data?.perPlugin ?? [];
    const pluginsPerRow = 4;
    const pluginSpacing = 200;
    const startX = 100;

    pluginData.forEach((plugin, index) => {
      const row = Math.floor(index / pluginsPerRow);
      const col = index % pluginsPerRow;
      const x = startX + col * pluginSpacing;
      const y = 250 + row * 120;

      const pluginErrors = plugin.errors ?? 0;
      const pluginRequests = plugin.requests ?? 0;
      const errorRate = pluginRequests > 0 ? (pluginErrors / pluginRequests) * 100 : 0;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (errorRate > 5) {status = 'error';}
      else if (errorRate > 1) {status = 'warning';}

      nodes.push({
        id: plugin.pluginId,
        data: {
          label: plugin.pluginId,
          type: 'plugin',
          requests: pluginRequests,
          errors: pluginErrors,
          latency: plugin.latency?.average ?? 0,
          status,
        } as NodeData,
        position: { x, y },
        style: {
          background: status === 'healthy' ? '#f6ffed' : status === 'warning' ? '#fffbe6' : '#fff1f0',
          border: `2px solid ${status === 'healthy' ? '#52c41a' : status === 'warning' ? '#faad14' : '#ff4d4f'}`,
          borderRadius: 8,
          padding: 10,
          fontSize: 12,
          minWidth: 100,
        },
      });

      // Edge from API to plugin
      edges.push({
        id: `api-${plugin.pluginId}`,
        source: 'api',
        target: plugin.pluginId,
        animated: pluginRequests > 100, // Animate high-traffic routes
        style: {
          stroke: status === 'error' ? '#ff4d4f' : status === 'warning' ? '#faad14' : '#52c41a',
          strokeWidth: Math.min(3, 1 + pluginRequests / 1000), // Width based on traffic
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: status === 'error' ? '#ff4d4f' : status === 'warning' ? '#faad14' : '#52c41a',
        },
        label: pluginRequests > 100 ? `${pluginRequests}` : undefined,
        labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
        labelStyle: { fontSize: 10 },
      });
    });

    return { nodes, edges };
  }, [metrics.data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when metrics change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode({
      id: node.id,
      data: node.data as NodeData,
    });
  }, []);

  // Close drawer
  const closeDrawer = () => {
    setSelectedNode(null);
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ApartmentOutlined />
          <span>System Topology</span>
        </div>
      }
      style={{ minHeight: 400 }}
      styles={{ body: { padding: 0, height: 343 } }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as NodeData;
              if (data.status === 'error') {return '#ff4d4f';}
              if (data.status === 'warning') {return '#faad14';}
              return '#52c41a';
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {/* Node Details Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApartmentOutlined />
            <span>{selectedNode?.data.label}</span>
            <Badge
              status={
                selectedNode?.data.status === 'error' ? 'error' :
                selectedNode?.data.status === 'warning' ? 'warning' :
                'success'
              }
            />
          </div>
        }
        placement="right"
        onClose={closeDrawer}
        open={!!selectedNode}
        width={400}
        closeIcon={<CloseOutlined />}
      >
        {selectedNode && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Statistic
                  title="Requests"
                  value={selectedNode.data.requests ?? 0}
                  valueStyle={{ fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Errors"
                  value={selectedNode.data.errors ?? 0}
                  valueStyle={{
                    fontSize: 24,
                    color: (selectedNode.data.errors ?? 0) > 0 ? '#ff4d4f' : '#52c41a',
                  }}
                />
              </Col>
              {selectedNode.data.latency !== undefined && (
                <Col span={12}>
                  <Statistic
                    title="Avg Latency"
                    value={selectedNode.data.latency.toFixed(0)}
                    suffix="ms"
                    valueStyle={{ fontSize: 24 }}
                  />
                </Col>
              )}
            </Row>

            <Descriptions title="Details" bordered size="small" column={1}>
              <Descriptions.Item label="Node ID">
                <code>{selectedNode.id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">{selectedNode.data.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedNode.data.status === 'error' ? 'red' :
                    selectedNode.data.status === 'warning' ? 'orange' :
                    'green'
                  }
                >
                  {selectedNode.data.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {selectedNode.data.requests && (
                <Descriptions.Item label="Error Rate">
                  {selectedNode.data.requests > 0
                    ? `${((selectedNode.data.errors ?? 0) / selectedNode.data.requests * 100).toFixed(2)}%`
                    : 'N/A'}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </Card>
  );
}
