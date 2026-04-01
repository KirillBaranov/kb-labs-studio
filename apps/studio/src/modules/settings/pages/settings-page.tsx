import * as React from 'react';
import {
  UITabs,
  UIList,
  UIButton,
  UISpace,
  UITypographyText,
  UITypographyParagraph,
  UITitle,
  UIMessage,
  UIDivider,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/studio-data-client';
import { HealthIndicator } from '@/components/health-indicator';
import { useRegistryV2 } from '@/providers/registry-v2-provider';
import { formatTimestamp } from '@/utils/format-date';
import { AppearanceSettings } from '../components/appearance-settings';
import { DataPrivacySettings } from '../components/data-privacy-settings';
import { NotificationsSettings } from '../components/notifications-settings';
import { ExperimentalSettings } from '../components/experimental-settings';
import { ConfigurationSettings } from '../components/configuration-settings';
import { RoleSwitcher } from '@/components/role-switcher';
import { ApiRoutesViewer } from '../components/api-routes-viewer';
import { NavigationSettings } from '../components/navigation-settings';
import { UICard, UISkeleton, UIStack } from '@kb-labs/studio-ui-kit';
import { KBListItem, KBPageContainer, KBPageHeader, KBSection } from '@/components/ui';

export function SettingsPage() {
  const sources = useDataSources();
  const { data, isLoading } = useHealthStatus(sources.system);
  const { registry } = useRegistryV2();
  const registryMeta = { generatedAt: registry.generatedAt, rev: null, partial: false, stale: false };
  const refresh = async () => {}; // TODO: queryClient.invalidateQueries
  const [invalidating, setInvalidating] = React.useState(false);

  const handleInvalidateCache = async () => {
    setInvalidating(true);
    try {
      const result = await sources.cache.invalidateCache();
      UIMessage.success(
        `Cache invalidated! Rev: ${result.previousRev ?? 'N/A'} → ${result.newRev}. ` +
        `Discovered ${result.pluginsDiscovered} plugins.`
      );
      await refresh();
    } catch (error) {
      UIMessage.error(`Error invalidating cache: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setInvalidating(false);
    }
  };

  const handleRefreshRegistry = async () => {
    try {
      await refresh();
      UIMessage.success('Registry refreshed successfully');
    } catch (error) {
      UIMessage.error(`Failed to refresh registry: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const tabItems = [
    {
      key: 'appearance',
      label: 'Appearance',
      icon: <UIIcon name="BgColorsOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <AppearanceSettings />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'navigation',
      label: 'Navigation',
      icon: <UIIcon name="MenuOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <NavigationSettings />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: <UIIcon name="BellOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <NotificationsSettings />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'privacy',
      label: 'Data & Privacy',
      icon: <UIIcon name="LockOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <DataPrivacySettings />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'system',
      label: 'System Info',
      icon: <UIIcon name="DatabaseOutlined" />,
      children: (
        <>
          <KBSection>
            <UICard title="Data Sources Health">
              {isLoading ? (
                <UIStack>
                  <UISkeleton active lines={3} />
                </UIStack>
              ) : data ? (
                <UIList
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
            </UICard>
          </KBSection>

          <KBSection>
            <UICard title="Registry Status">
              <UISpace direction="vertical" style={{ width: '100%' }}>
                <div>
                  <UITypographyText strong>Revision:</UITypographyText> <UITypographyText>{registryMeta.rev ?? 'N/A'}</UITypographyText>
                </div>
                <div>
                  <UITypographyText strong>Generated At:</UITypographyText> <UITypographyText>{formatTimestamp(registryMeta.generatedAt)}</UITypographyText>
                </div>
                <div>
                  <UITypographyText strong>Expires At:</UITypographyText> <UITypographyText>{formatTimestamp(registryMeta.expiresAt)}</UITypographyText>
                </div>
                <div>
                  <UITypographyText strong>TTL:</UITypographyText> <UITypographyText>{registryMeta.ttlMs ? `${registryMeta.ttlMs / 1000}s` : 'N/A'}</UITypographyText>
                </div>
                <div>
                  <UITypographyText strong>Partial:</UITypographyText> <UITypographyText type={registryMeta.partial ? 'warning' : 'success'}>
                    {registryMeta.partial ? 'Yes' : 'No'}
                  </UITypographyText>
                </div>
                <div>
                  <UITypographyText strong>Stale:</UITypographyText> <UITypographyText type={registryMeta.stale ? 'danger' : 'success'}>
                    {registryMeta.stale ? 'Yes' : 'No'}
                  </UITypographyText>
                </div>
                {registryMeta.checksum && (
                  <div>
                    <UITypographyText strong>Checksum:</UITypographyText> <UITypographyText code style={{ fontSize: '0.85rem' }}>
                      {registryMeta.checksum.substring(0, 8)}...
                    </UITypographyText>
                  </div>
                )}
              </UISpace>
            </UICard>
          </KBSection>
        </>
      ),
    },
    {
      key: 'configuration',
      label: 'Configuration',
      icon: <UIIcon name="SettingOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <ConfigurationSettings />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'experimental',
      label: 'Experimental',
      icon: <UIIcon name="ExperimentOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <ExperimentalSettings />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'authentication',
      label: 'Authentication',
      icon: <UIIcon name="UserOutlined" />,
      children: (
        <KBSection>
          <UICard>
            <RoleSwitcher />
          </UICard>
        </KBSection>
      ),
    },
    {
      key: 'developer',
      label: 'Developer',
      icon: <UIIcon name="ToolOutlined" />,
      children: (
        <>
          <KBSection>
            <UICard title="Development Tools">
              <UISpace direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <UITitle level={5}>Refresh Registry</UITitle>
                  <UITypographyParagraph type="secondary">
                    Fetch fresh registry data from the REST API without clearing the cache.
                    Use this to get the latest changes without forcing re-discovery.
                  </UITypographyParagraph>
                  <UIButton
                    icon={<UIIcon name="ReloadOutlined" />}
                    onClick={handleRefreshRegistry}
                  >
                    Refresh Registry
                  </UIButton>
                </div>

                <UIDivider />

                <div>
                  <UITitle level={5}>Invalidate Cache (Force Discovery)</UITitle>
                  <UITypographyParagraph type="secondary">
                    Force cache invalidation and trigger full plugin re-discovery on the REST API.
                    This clears the snapshot cache and rescans all plugin directories.
                    Useful when testing plugin changes or troubleshooting registry issues.
                  </UITypographyParagraph>
                  <UIButton
                    icon={<UIIcon name="DeleteOutlined" />}
                    onClick={handleInvalidateCache}
                    loading={invalidating}
                    variant="primary"
                    danger
                  >
                    Invalidate Cache & Re-discover
                  </UIButton>
                </div>
              </UISpace>
            </UICard>
          </KBSection>

          <KBSection>
            <UICard>
              <ApiRoutesViewer />
            </UICard>
          </KBSection>
        </>
      ),
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Settings"
        description="Configure your preferences, manage data, and customize your experience"
      />

      <UITabs
        items={tabItems}
        syncUrl={{ mode: 'path', basePath: '/settings' }}
        size="large"
        style={{ marginTop: 24 }}
      />
    </KBPageContainer>
  );
}
