/**
 * @module studio/modules/settings/components/configuration-settings
 * Platform configuration settings component
 */

import * as React from 'react';
import { Space, Typography, Tag, Button, message, Alert, Collapse, Card, Row, Col, Descriptions } from 'antd';
import {
  CopyOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  CloudOutlined,
  FileTextOutlined,
  BulbOutlined,
  ApiOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { usePlatformConfig } from '@kb-labs/studio-data-client';
import { KBSkeleton, KBStack } from '@kb-labs/studio-ui-react';

const { Text, Title, Paragraph } = Typography;

export function ConfigurationSettings() {
  const sources = useDataSources();
  const { data, isLoading, error } = usePlatformConfig(sources.platform);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    message.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <KBStack>
        <KBSkeleton active paragraph={{ rows: 5 }} />
      </KBStack>
    );
  }

  if (error) {
    return (
      <Alert
        message="Failed to load platform configuration"
        description={
          <Space direction="vertical" size="small">
            <Text>{error instanceof Error ? error.message : 'Unknown error'}</Text>
            <Text type="secondary" style={{ fontSize: '0.875rem' }}>
              Make sure the REST API server is running and accessible.
            </Text>
          </Space>
        }
        type="error"
        showIcon
      />
    );
  }

  if (!data) {
    return (
      <div>
        <Paragraph type="secondary">No platform configuration available</Paragraph>
      </div>
    );
  }

  const adaptersArray = Object.entries(data.adapters || {});
  const hasRedacted = data.redacted && data.redacted.length > 0;

  // Helper to count adapters including nested ones
  const countAdapters = (items: Array<[string, unknown]>): number => {
    return items.reduce((count, [, packageName]) => {
      // If it's an object (nested adapters), count its children
      if (typeof packageName === 'object' && packageName !== null && !Array.isArray(packageName)) {
        return count + Object.keys(packageName).length;
      }
      // Otherwise it's a single adapter
      return count + 1;
    }, 0);
  };

  // Count total adapters (including nested)
  const totalAdaptersCount = countAdapters(adaptersArray);

  // Count active adapters (non-null packages, including nested)
  const activeAdaptersCount = adaptersArray.reduce((count, [, packageName]) => {
    if (typeof packageName === 'object' && packageName !== null && !Array.isArray(packageName)) {
      // Count non-null nested adapters
      return count + Object.values(packageName).filter(pkg => pkg !== null).length;
    }
    return count + (packageName !== null ? 1 : 0);
  }, 0);

  // Adapter categories
  const categories = [
    {
      name: 'AI & Intelligence',
      icon: <BulbOutlined />,
      color: 'purple',
      adapters: ['llm', 'embeddings', 'vectorStore'],
    },
    {
      name: 'Database',
      icon: <DatabaseOutlined />,
      color: 'blue',
      adapters: ['database', 'db', 'documentDb'],
    },
    {
      name: 'Infrastructure',
      icon: <CloudOutlined />,
      color: 'green',
      adapters: ['storage', 'cache'],
    },
    {
      name: 'Observability',
      icon: <ThunderboltOutlined />,
      color: 'orange',
      adapters: ['logger', 'analytics', 'logRingBuffer', 'logPersistence'],
    },
  ];

  // Group adapters by category
  const groupedAdapters = categories.map((category) => {
    const items = adaptersArray.filter(([name]) => category.adapters.includes(name));
    return {
      ...category,
      items,
      count: countAdapters(items),
    };
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* System Information */}
      <Card size="small" title="System Information">
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Execution Mode">
            <Tag color="blue" icon={<RocketOutlined />}>
              {data.execution.mode}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Adapters">
            <Space size={4}>
              <Text>{totalAdaptersCount}</Text>
              <Text type="secondary">
                ({activeAdaptersCount} active)
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Platform Adapters by Category */}
      <div>
        <Title level={4}>Platform Adapters</Title>
        <Paragraph type="secondary">
          Adapters are organized by category for better clarity.
        </Paragraph>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {groupedAdapters.map((category) => (
            <Card
              key={category.name}
              size="small"
              title={
                <Space>
                  <span style={{ fontSize: '1.1rem', color: `var(--ant-${category.color}-6)` }}>
                    {category.icon}
                  </span>
                  <Text strong>{category.name}</Text>
                  <Tag color={category.color}>{category.count}</Tag>
                </Space>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {category.items.map(([name, packageName]) => {
                  // Helper to render a single adapter item
                  const renderAdapterItem = (itemName: string, itemPackage: string, itemKey: string) => {
                    const isEnabled = itemPackage !== null;
                    return (
                      <div
                        key={itemKey}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--kb-bg-secondary)',
                          borderRadius: 4,
                          borderLeft: isEnabled ? `3px solid var(--ant-${category.color}-6)` : '3px solid var(--ant-border-color)',
                        }}
                      >
                        <Space style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ minWidth: 100 }}>{itemName}</Text>
                          <Text
                            code
                            style={{
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {itemPackage || 'null'}
                          </Text>
                        </Space>
                        <Space>
                          {isEnabled ? (
                            <>
                              <CheckCircleOutlined style={{ color: 'var(--ant-success-color)' }} />
                              <Button
                                size="small"
                                type="text"
                                icon={copiedKey === itemKey ? <CheckOutlined /> : <CopyOutlined />}
                                onClick={() => handleCopy(itemPackage, itemKey)}
                              >
                                {copiedKey === itemKey ? 'Copied' : 'Copy'}
                              </Button>
                            </>
                          ) : (
                            <CloseCircleOutlined style={{ color: 'var(--ant-text-secondary)' }} />
                          )}
                        </Space>
                      </div>
                    );
                  };

                  // Handle nested adapters (object with sub-adapters)
                  if (typeof packageName === 'object' && packageName !== null && !Array.isArray(packageName)) {
                    return (
                      <Space key={name} direction="vertical" size="small" style={{ width: '100%' }}>
                        {Object.entries(packageName as Record<string, string>).map(([subName, subPackage]) =>
                          renderAdapterItem(subName, subPackage, `${name}.${subName}`)
                        )}
                      </Space>
                    );
                  }

                  // Regular adapter (string package name)
                  return renderAdapterItem(name, packageName as string, name);
                })}
              </Space>
            </Card>
          ))}
        </Space>
      </div>

      {/* Adapter Configuration */}
      {data.adapterOptions && Object.keys(data.adapterOptions).length > 0 && (
        <div>
          <Title level={4}>Adapter Configuration</Title>
          <Paragraph type="secondary">
            Detailed configuration options for each adapter.
            {hasRedacted && (
              <Text type="warning" style={{ marginLeft: 8 }}>
                ⚠️ Some sensitive values have been redacted for security.
              </Text>
            )}
          </Paragraph>

          <Collapse
            accordion
            items={Object.entries(data.adapterOptions).map(([adapterName, options]) => {
              // Find category for this adapter
              const category = categories.find((cat) => cat.adapters.includes(adapterName));
              const categoryColor = category?.color || 'blue';

              return {
                key: adapterName,
                label: (
                  <Space>
                    <Text strong>{adapterName}</Text>
                    {options && (
                      <Tag color={categoryColor}>
                        {Object.keys(options as object).length} option(s)
                      </Tag>
                    )}
                  </Space>
                ),
                children: options ? (
                  <pre
                    style={{
                      background: 'var(--kb-bg-secondary)',
                      padding: 12,
                      borderRadius: 4,
                      fontSize: '0.85rem',
                      overflow: 'auto',
                      margin: 0,
                    }}
                  >
                    {JSON.stringify(options, null, 2)}
                  </pre>
                ) : (
                  <Text type="secondary">No options configured</Text>
                ),
              };
            })}
          />
        </div>
      )}

      {/* Redacted Fields Info */}
      {hasRedacted && (
        <Alert
          type="warning"
          showIcon
          message="Security Notice"
          description={
            <Space direction="vertical" size="small">
              <Text>The following sensitive fields were redacted from the configuration:</Text>
              <Space wrap>
                {data.redacted.map((field) => (
                  <Tag key={field} color="orange">
                    {field}
                  </Tag>
                ))}
              </Space>
            </Space>
          }
        />
      )}
    </Space>
  );
}
