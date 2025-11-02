import { List } from 'antd';
import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { KBPageContainer, KBPageHeader, KBSection, KBCard, KBSkeleton, KBListItem, KBStack } from '@kb-labs/ui-react';
import { HealthIndicator } from '@/components/health-indicator';

export function SettingsPage() {
  const sources = useDataSources();
  const { data, isLoading } = useHealthStatus(sources.system);

  return (
    <KBPageContainer>
      <KBPageHeader 
        title="Settings"
        description="Configure Studio and manage data sources"
      />

      <KBSection>
        <KBCard title="Data Sources Health">
            {isLoading ? (
              <KBStack>
                <KBSkeleton active paragraph={{ rows: 3 }} />
              </KBStack>
            ) : data ? (
              <List
                dataSource={data.sources}
                renderItem={(source) => (
                  <KBListItem
                    key={source.name}
                    title={source.name}
                    description={source.latency ? `${source.latency}ms` : undefined}
                    action={<HealthIndicator status={source.ok ? 'ok' : 'down'} />}
                  />
                )}
              />
            ) : (
              <p>No health data available</p>
            )}
        </KBCard>
      </KBSection>
    </KBPageContainer>
  );
}

