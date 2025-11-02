import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleasePreview, useRunRelease } from '@kb-labs/data-client';
import { PageContainer, PageHeader, Section, KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBButton, KBSkeleton, KBTabs, KBTabsList, KBTabsTrigger, KBTabsContent, Inline, Stack, DataList, ListItem } from '@kb-labs/ui-react';

export function ReleasePage() {
  const sources = useDataSources();
  const { data, isLoading } = useReleasePreview(sources.release);
  const { mutate: runRelease, isPending } = useRunRelease(sources.release);

  const [activeTab, setActiveTab] = useState<'packages' | 'markdown' | 'json'>('packages');

  const handleRun = () => {
    if (window.confirm('Are you sure you want to run the release?')) {
      runRelease(true);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Release"
        description="Package release preview and execution"
        action={
          <KBButton onClick={handleRun} disabled={isPending || isLoading}>
            {isPending ? 'Running...' : 'Run Release'}
          </KBButton>
        }
      />

      <Section>
        <KBCard>
          <KBCardHeader>
            <KBCardTitle>Release Preview</KBCardTitle>
          </KBCardHeader>
          <KBCardContent>
            {isLoading ? (
              <Stack>
                <KBSkeleton className="h-8 w-full" />
                <KBSkeleton className="h-8 w-full" />
                <KBSkeleton className="h-8 w-full" />
              </Stack>
            ) : data ? (
              <KBTabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <KBTabsList>
                  <KBTabsTrigger value="packages">Packages</KBTabsTrigger>
                  <KBTabsTrigger value="markdown">Markdown</KBTabsTrigger>
                  <KBTabsTrigger value="json">JSON</KBTabsTrigger>
                </KBTabsList>
                <KBTabsContent value="packages">
                  <Stack>
                    <p className="typo-body">
                      From: <span className="font-mono">{data.range.from}</span> → To: <span className="font-mono">{data.range.to}</span>
                    </p>
                    <DataList>
                      {data.packages.map((pkg, idx) => (
                        <ListItem
                          key={idx}
                          title={pkg.name}
                          description={`${pkg.prev} → ${pkg.next} (${pkg.bump})`}
                          action={
                            pkg.breaking ? (
                              <span className="rounded-full bg-red-100 dark:bg-red-900 px-2 py-1 text-xs font-semibold text-red-800 dark:text-red-200">
                                {pkg.breaking} breaking
                              </span>
                            ) : undefined
                          }
                        />
                      ))}
                    </DataList>
                  </Stack>
                </KBTabsContent>
                <KBTabsContent value="markdown">
                  <pre className="overflow-x-auto rounded-md bg-theme-secondary" style={{ padding: 'var(--spacing-item)', fontSize: 'var(--typo-description-size)' }}>
                    {data.markdown}
                  </pre>
                </KBTabsContent>
                <KBTabsContent value="json">
                  <pre className="overflow-x-auto rounded-md bg-theme-secondary" style={{ padding: 'var(--spacing-item)', fontSize: 'var(--typo-description-size)' }}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </KBTabsContent>
              </KBTabs>
            ) : (
              <p>No release preview data available</p>
            )}
          </KBCardContent>
        </KBCard>
      </Section>
    </PageContainer>
  );
}

