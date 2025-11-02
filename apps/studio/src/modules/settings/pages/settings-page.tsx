import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { PageContainer, PageHeader, Section, KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBSkeleton, DataList, ListItem, Stack } from '@kb-labs/ui-react';
import { HealthIndicator } from '@/components/health-indicator';

export function SettingsPage() {
  const sources = useDataSources();
  const { data, isLoading } = useHealthStatus(sources.system);

  return (
    <PageContainer>
      <PageHeader 
        title="Settings"
        description="Configure Studio and manage data sources"
      />

      <Section>
        <KBCard>
          <KBCardHeader>
            <KBCardTitle>Data Sources Health</KBCardTitle>
          </KBCardHeader>
          <KBCardContent>
            {isLoading ? (
              <Stack>
                <KBSkeleton className="h-8 w-full" />
                <KBSkeleton className="h-8 w-full" />
                <KBSkeleton className="h-8 w-full" />
              </Stack>
            ) : data ? (
              <DataList>
                {data.sources.map((source) => (
                  <ListItem
                    key={source.name}
                    title={source.name}
                    description={source.latency ? `${source.latency}ms` : undefined}
                    action={<HealthIndicator status={source.ok ? 'ok' : 'down'} />}
                  />
                ))}
              </DataList>
            ) : (
              <p>No health data available</p>
            )}
          </KBCardContent>
        </KBCard>
      </Section>
    </PageContainer>
  );
}

