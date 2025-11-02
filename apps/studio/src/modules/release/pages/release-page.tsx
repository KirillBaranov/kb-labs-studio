import { useState } from 'react';
import { Tabs, List } from 'antd';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleasePreview, useRunRelease } from '@kb-labs/data-client';
import { KBPageContainer, KBPageHeader, KBSection, KBCard, KBButton, KBSkeleton, KBTabs, KBStack, KBListItem } from '@kb-labs/ui-react';

const { TabPane } = Tabs;

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
    <KBPageContainer>
      <KBPageHeader
        title="Release"
        description="Package release preview and execution"
        extra={
          <KBButton onClick={handleRun} disabled={isPending || isLoading}>
            {isPending ? 'Running...' : 'Run Release'}
          </KBButton>
        }
      />

      <KBSection>
        <KBCard title="Release Preview">
          {isLoading ? (
            <KBStack>
              <KBSkeleton active paragraph={{ rows: 3 }} />
            </KBStack>
          ) : data ? (
            <KBTabs activeKey={activeTab} onChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabPane tab="Packages" key="packages">
                <KBStack>
                  <p>
                    From: <code>{data.range.from}</code> → To: <code>{data.range.to}</code>
                  </p>
                    <List
                      dataSource={data.packages}
                      renderItem={(pkg: any, idx: number) => (
                        <KBListItem
                          key={idx}
                          title={pkg.name}
                          description={`${pkg.prev} → ${pkg.next} (${pkg.bump})`}
                          action={
                            pkg.breaking ? (
                              <span style={{ padding: '4px 8px', fontSize: 12, borderRadius: 4, background: '#fee', color: '#c33' }}>
                                {pkg.breaking} breaking
                              </span>
                            ) : undefined
                          }
                        />
                      )}
                    />
                </KBStack>
              </TabPane>
              <TabPane tab="Markdown" key="markdown">
                <pre style={{ overflowX: 'auto', padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                  {data.markdown}
                </pre>
              </TabPane>
              <TabPane tab="JSON" key="json">
                <pre style={{ overflowX: 'auto', padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </TabPane>
            </KBTabs>
          ) : (
            <p>No release preview data available</p>
          )}
        </KBCard>
      </KBSection>
    </KBPageContainer>
  );
}

