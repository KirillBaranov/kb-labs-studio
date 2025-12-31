import * as React from 'react';
import { Tabs, List, Button, Space, Typography, message, Divider } from 'antd';
import {
  BgColorsOutlined,
  DatabaseOutlined,
  LockOutlined,
  DashboardOutlined,
  BellOutlined,
  ToolOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/studio-data-client';
import { KBPageContainer, KBPageHeader, KBSection, KBCard, KBSkeleton, KBListItem, KBStack } from '@kb-labs/studio-ui-react';
import { HealthIndicator } from '@/components/health-indicator';
import { useRegistry } from '@/providers/registry-provider';
import { formatTimestamp } from '@/utils/format-date';
import { AppearanceSettings } from '../components/appearance-settings';
import { DataPrivacySettings } from '../components/data-privacy-settings';
import { DashboardSettings } from '../components/dashboard-settings';
import { NotificationsSettings } from '../components/notifications-settings';
import { ExperimentalSettings } from '../components/experimental-settings';

const { Text, Paragraph, Title } = Typography;

export function SettingsPage() {
  const sources = useDataSources();
  const { data, isLoading } = useHealthStatus(sources.system);
  const { registryMeta, refresh } = useRegistry();
  const [invalidating, setInvalidating] = React.useState(false);

  const handleInvalidateCache = async () => {
    setInvalidating(true);
    try {
      const result = await sources.cache.invalidateCache();
      message.success(
        `Cache invalidated! Rev: ${result.previousRev ?? 'N/A'} → ${result.newRev}. ` +
        `Discovered ${result.pluginsDiscovered} plugins.`
      );
      await refresh();
    } catch (error) {
      message.error(`Error invalidating cache: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setInvalidating(false);
    }
  };

  const handleRefreshRegistry = async () => {
    try {
      await refresh();
      message.success('Registry refreshed successfully');
    } catch (error) {
      message.error(`Failed to refresh registry: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const tabItems = [
    {
      key: 'appearance',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BgColorsOutlined />
          Appearance
        </span>
      ),
      children: (
        <KBSection>
          <KBCard>
            <AppearanceSettings />
          </KBCard>
        </KBSection>
      ),
    },
    {
      key: 'dashboard',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>
          <DashboardOutlined />
          Dashboard 🚧
        </span>
      ),
      children: (
        <KBSection>
          <KBCard>
            <DashboardSettings />
          </KBCard>
        </KBSection>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6 }}>
          <BellOutlined />
          Notifications 🚧
        </span>
      ),
      children: (
        <KBSection>
          <KBCard>
            <NotificationsSettings />
          </KBCard>
        </KBSection>
      ),
    },
    {
      key: 'privacy',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LockOutlined />
          Data & Privacy
        </span>
      ),
      children: (
        <KBSection>
          <KBCard>
            <DataPrivacySettings />
          </KBCard>
        </KBSection>
      ),
    },
    {
      key: 'system',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <DatabaseOutlined />
          System Info
        </span>
      ),
      children: (
        <>
          <KBSection>
            <KBCard title="Data Sources Health">
              {isLoading ? (
                <KBStack>
                  <KBSkeleton active paragraph={{ rows: 3 }} />
                </KBStack>
              ) : data ? (
                <List
                  dataSource={data.sources}
                  renderItem={(source) => {
                    const status = source.ok
                      ? 'ok'
                      : source.error === 'system_degraded'
                      ? 'degraded'
                      : 'down';
                    return (
                      <KBListItem
                        key={source.name}
                        title={source.name}
                        description={source.latency ? `${source.latency}ms` : undefined}
                        action={<HealthIndicator status={status} />}
                      />
                    );
                  }}
                />
              ) : (
                <p>No health data available</p>
              )}
            </KBCard>
          </KBSection>

          <KBSection>
            <KBCard title="Registry Status">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Revision:</Text> <Text>{registryMeta.rev ?? 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Generated At:</Text> <Text>{formatTimestamp(registryMeta.generatedAt)}</Text>
                </div>
                <div>
                  <Text strong>Expires At:</Text> <Text>{formatTimestamp(registryMeta.expiresAt)}</Text>
                </div>
                <div>
                  <Text strong>TTL:</Text> <Text>{registryMeta.ttlMs ? `${registryMeta.ttlMs / 1000}s` : 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Partial:</Text> <Text type={registryMeta.partial ? 'warning' : 'success'}>
                    {registryMeta.partial ? 'Yes' : 'No'}
                  </Text>
                </div>
                <div>
                  <Text strong>Stale:</Text> <Text type={registryMeta.stale ? 'danger' : 'success'}>
                    {registryMeta.stale ? 'Yes' : 'No'}
                  </Text>
                </div>
                {registryMeta.checksum && (
                  <div>
                    <Text strong>Checksum:</Text> <Text code style={{ fontSize: '0.85rem' }}>
                      {registryMeta.checksum.substring(0, 8)}...
                    </Text>
                  </div>
                )}
              </Space>
            </KBCard>
          </KBSection>
        </>
      ),
    },
    {
      key: 'experimental',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ExperimentOutlined />
          Experimental
        </span>
      ),
      children: (
        <KBSection>
          <KBCard>
            <ExperimentalSettings />
          </KBCard>
        </KBSection>
      ),
    },
    {
      key: 'developer',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ToolOutlined />
          Developer
        </span>
      ),
      children: (
        <KBSection>
          <KBCard title="Development Tools">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={5}>Refresh Registry</Title>
                <Paragraph type="secondary">
                  Fetch fresh registry data from the REST API without clearing the cache.
                  Use this to get the latest changes without forcing re-discovery.
                </Paragraph>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshRegistry}
                  type="default"
                >
                  Refresh Registry
                </Button>
              </div>

              <Divider />

              <div>
                <Title level={5}>Invalidate Cache (Force Discovery)</Title>
                <Paragraph type="secondary">
                  Force cache invalidation and trigger full plugin re-discovery on the REST API.
                  This clears the snapshot cache and rescans all plugin directories.
                  Useful when testing plugin changes or troubleshooting registry issues.
                </Paragraph>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleInvalidateCache}
                  loading={invalidating}
                  type="primary"
                  danger
                >
                  Invalidate Cache & Re-discover
                </Button>
              </div>
            </Space>
          </KBCard>
        </KBSection>
      ),
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Settings"
        description="Configure your preferences, manage data, and customize your experience"
      />

      <Tabs
        defaultActiveKey="appearance"
        items={tabItems}
        size="large"
        style={{ marginTop: 24 }}
      />
    </KBPageContainer>
  );
}
