import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  Input,
  Tag,
  Space,
  Button,
  Typography,
  Alert,
  Spin,
  Empty,
  Tooltip,
  Select,
  Tree,
  Segmented,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
  ReloadOutlined,
  SearchOutlined,
  CopyOutlined,
  CheckOutlined,
  ApiOutlined,
  FolderOutlined,
  FileOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import type { RoutesResponse, RouteInfo } from '@kb-labs/studio-data-client';

const { Text, Title, Paragraph } = Typography;

const METHOD_COLORS: Record<string, string> = {
  GET: 'green',
  POST: 'blue',
  PUT: 'orange',
  PATCH: 'purple',
  DELETE: 'red',
  HEAD: 'cyan',
  OPTIONS: 'default',
};

type ViewMode = 'tree' | 'list';

interface RouteTreeNode {
  segment: string;
  fullPath: string;
  routes: RouteInfo[];
  children: Map<string, RouteTreeNode>;
}

function buildRouteTree(routes: RouteInfo[]): RouteTreeNode {
  const root: RouteTreeNode = {
    segment: '',
    fullPath: '',
    routes: [],
    children: new Map(),
  };

  for (const route of routes) {
    // Split URL into segments, e.g., /api/v1/plugins/:id -> ['api', 'v1', 'plugins', ':id']
    const segments = route.url.split('/').filter(Boolean);
    let current = root;
    let pathSoFar = '';

    for (const segment of segments) {
      pathSoFar += '/' + segment;

      if (!current.children.has(segment)) {
        current.children.set(segment, {
          segment,
          fullPath: pathSoFar,
          routes: [],
          children: new Map(),
        });
      }
      current = current.children.get(segment)!;
    }

    // Add route to the leaf node
    current.routes.push(route);
  }

  return root;
}

function treeNodeToAntdNode(
  node: RouteTreeNode,
  baseUrl: string,
  copiedUrl: string | null,
  onCopy: (url: string) => void
): DataNode[] {
  const results: DataNode[] = [];

  // Sort children alphabetically
  const sortedChildren = Array.from(node.children.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  for (const [segment, child] of sortedChildren) {
    const hasChildren = child.children.size > 0;
    const hasRoutes = child.routes.length > 0;

    // Determine if this is a parameter segment
    const isParam = segment.startsWith(':') || segment.startsWith('*');

    const childNodes = treeNodeToAntdNode(child, baseUrl, copiedUrl, onCopy);

    // Create route entries for this node
    const routeNodes: DataNode[] = child.routes.map((route) => {
      const fullUrl = route.url.startsWith('/api')
        ? `http://localhost:5050${route.url}`
        : `${baseUrl}${route.url}`;

      return {
        key: `${route.method}-${route.url}`,
        title: (
          <Space size="small">
            {route.method.split(',').map((m) => (
              <Tag key={m} color={METHOD_COLORS[m.trim()] || 'default'} style={{ margin: 0 }}>
                {m.trim()}
              </Tag>
            ))}
            <Text code style={{ fontSize: 12 }}>
              {route.url}
            </Text>
            <Tooltip title={copiedUrl === fullUrl ? 'Copied!' : 'Copy full URL'}>
              <Button
                type="text"
                size="small"
                icon={
                  copiedUrl === fullUrl ? (
                    <CheckOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <CopyOutlined />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(fullUrl);
                }}
              />
            </Tooltip>
          </Space>
        ),
        isLeaf: true,
        icon: <FileOutlined />,
      };
    });

    if (hasChildren || hasRoutes) {
      results.push({
        key: child.fullPath,
        title: (
          <Space size="small">
            <Text strong={hasChildren} type={isParam ? 'warning' : undefined}>
              {segment}
            </Text>
            {hasRoutes && !hasChildren && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                ({child.routes.length})
              </Text>
            )}
          </Space>
        ),
        icon: hasChildren ? <FolderOutlined /> : undefined,
        children: [...routeNodes, ...childNodes],
        isLeaf: !hasChildren && routeNodes.length === 0,
      });
    }
  }

  return results;
}

export function ApiRoutesViewer() {
  const { system } = useDataSources();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RoutesResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const baseUrl = system.getBaseUrl();

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await system.getRoutes();
      setData(result);

      // Auto-expand first two levels
      if (result.routes.length > 0) {
        const tree = buildRouteTree(result.routes);
        const keysToExpand: string[] = [];
        for (const [, child] of tree.children) {
          keysToExpand.push(child.fullPath);
          for (const [, grandChild] of child.children) {
            keysToExpand.push(grandChild.fullPath);
          }
        }
        setExpandedKeys(keysToExpand);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Get unique methods for filter
  const availableMethods = useMemo(() => {
    if (!data?.routes) {return [];}
    const methods = new Set<string>();
    data.routes.forEach((route) => {
      route.method.split(',').forEach((m) => methods.add(m.trim()));
    });
    return Array.from(methods).sort();
  }, [data]);

  // Filter routes
  const filteredRoutes = useMemo(() => {
    if (!data?.routes) {return [];}
    return data.routes.filter((route) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        route.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.method.toLowerCase().includes(searchQuery.toLowerCase());

      // Method filter
      const matchesMethod = !methodFilter || route.method.includes(methodFilter);

      return matchesSearch && matchesMethod;
    });
  }, [data, searchQuery, methodFilter]);

  // Build tree structure
  const treeData = useMemo(() => {
    if (filteredRoutes.length === 0) {return [];}
    const tree = buildRouteTree(filteredRoutes);
    return treeNodeToAntdNode(tree, baseUrl, copiedUrl, handleCopyUrl);
  }, [filteredRoutes, baseUrl, copiedUrl]);

  // Flat list for list view
  const sortedRoutes = useMemo(() => {
    return [...filteredRoutes].sort((a, b) => {
      const urlCompare = a.url.localeCompare(b.url);
      if (urlCompare !== 0) {return urlCompare;}
      return a.method.localeCompare(b.method);
    });
  }, [filteredRoutes]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <Title level={5}>
          <ApiOutlined /> API Routes Explorer
        </Title>
        <Paragraph type="secondary">
          Browse all available REST API endpoints from the backend. Use search and filters to find
          specific routes.
        </Paragraph>
      </div>

      {/* Controls */}
      <Space wrap>
        <Input
          placeholder="Search routes..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Filter by method"
          allowClear
          style={{ width: 150 }}
          value={methodFilter}
          onChange={setMethodFilter}
          options={availableMethods.map((m) => ({ label: m, value: m }))}
        />
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
          options={[
            { label: 'Tree', value: 'tree', icon: <ApartmentOutlined /> },
            { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
          ]}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchRoutes} loading={loading}>
          Refresh
        </Button>
      </Space>

      {/* Stats */}
      {data && (
        <Alert
          type="info"
          showIcon={false}
          message={
            <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
              <span>
                <Text strong>{data.count}</Text> total routes
              </span>
              <span>
                <Text strong>{filteredRoutes.length}</Text> shown
              </span>
              <span>
                <Text type="secondary">
                  Last fetched: {new Date(data.ts).toLocaleTimeString()}
                </Text>
              </span>
              <span>
                <Text type="secondary">Base: {baseUrl}</Text>
              </span>
            </Space>
          }
        />
      )}

      {/* Error */}
      {error && (
        <Alert type="error" message="Failed to load routes" description={error} showIcon />
      )}

      {/* Loading */}
      {loading && !data && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {/* Tree View */}
      {data && viewMode === 'tree' && treeData.length > 0 && (
        <Tree
          treeData={treeData}
          showIcon
          showLine={{ showLeafIcon: false }}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          style={{
            background: 'transparent',
            padding: '8px 0',
          }}
        />
      )}

      {/* List View */}
      {data && viewMode === 'list' && (
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {sortedRoutes.map((route) => {
              const fullUrl = route.url.startsWith('/api')
                ? `http://localhost:5050${route.url}`
                : `${baseUrl}${route.url}`;

              return (
                <div
                  key={`${route.method}-${route.url}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Space size={4}>
                    {route.method.split(',').map((m) => (
                      <Tag
                        key={m}
                        color={METHOD_COLORS[m.trim()] || 'default'}
                        style={{ margin: 0, minWidth: 50, textAlign: 'center' }}
                      >
                        {m.trim()}
                      </Tag>
                    ))}
                  </Space>
                  <Text code style={{ fontSize: 12, flex: 1 }}>
                    {route.url}
                  </Text>
                  <Tooltip title={copiedUrl === fullUrl ? 'Copied!' : 'Copy full URL'}>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        copiedUrl === fullUrl ? (
                          <CheckOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <CopyOutlined />
                        )
                      }
                      onClick={() => handleCopyUrl(fullUrl)}
                    />
                  </Tooltip>
                </div>
              );
            })}
          </Space>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredRoutes.length === 0 && data && (
        <Empty description="No routes match your search" />
      )}
    </Space>
  );
}
