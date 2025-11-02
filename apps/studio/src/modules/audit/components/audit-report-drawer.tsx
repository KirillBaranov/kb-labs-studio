import { Tabs } from 'antd';
import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditPackage } from '@kb-labs/data-client';
import {
  KBSheet,
  KBSheetContent,
  KBSheetHeader,
  KBSheetTitle,
  KBSheetDescription,
  KBTabs,
  KBSkeleton,
  KBBadge,
  KBStack,
  KBCard,
} from '@kb-labs/ui-react';

const { TabPane } = Tabs;

interface AuditReportDrawerProps {
  packageName: string | null;
  onClose: () => void;
}

export function AuditReportDrawer({ packageName, onClose }: AuditReportDrawerProps) {
  const sources = useDataSources();
  const { data, isLoading } = useAuditPackage(packageName || '', sources.audit);

  return (
    <KBSheet
      open={!!packageName}
      onOpenChange={(open) => !open && onClose()}
      placement="right"
      width={640}
      title={packageName || ''}
    >
      <KBSheetHeader>
        <KBSheetDescription>Detailed audit report and artifacts</KBSheetDescription>
      </KBSheetHeader>

      {isLoading ? (
        <KBStack>
          <KBSkeleton active paragraph={{ rows: 2 }} />
          <KBSkeleton active paragraph={{ rows: 4 }} />
          <KBSkeleton active paragraph={{ rows: 4 }} />
        </KBStack>
      ) : data ? (
        <div>
          <KBStack style={{ marginBottom: 24 }}>
            <KBCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Last Run</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>
                    {new Date(data.lastRun.startedAt).toLocaleString()}
                  </p>
                </div>
                <KBBadge variant={data.lastRun.status === 'ok' ? 'success' : 'error'}>
                  {data.lastRun.status.toUpperCase()}
                </KBBadge>
              </div>
            </KBCard>

            <div>
              <p style={{ marginBottom: 12, fontSize: 14, fontWeight: 500 }}>Checks</p>
              <KBStack>
                {data.checks.map((check) => (
                  <KBCard key={check.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{check.id}</p>
                        {check.errors !== undefined && check.errors > 0 && (
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>
                            {check.errors} errors
                          </p>
                        )}
                        {check.warnings !== undefined && check.warnings > 0 && (
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#faad14' }}>
                            {check.warnings} warnings
                          </p>
                        )}
                      </div>
                      <KBBadge variant={check.ok ? 'success' : 'error'}>
                        {check.ok ? 'OK' : 'FAIL'}
                      </KBBadge>
                    </div>
                  </KBCard>
                ))}
              </KBStack>
            </div>
          </KBStack>

          <KBTabs defaultActiveKey="markdown">
            <TabPane tab="Markdown" key="markdown">
              <pre
                style={{
                  maxHeight: 400,
                  overflow: 'auto',
                  padding: 16,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {data.artifacts.md || 'No markdown artifact available'}
              </pre>
            </TabPane>
            <TabPane tab="JSON" key="json">
              <pre
                style={{
                  maxHeight: 400,
                  overflow: 'auto',
                  padding: 16,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {data.artifacts.json || JSON.stringify(data, null, 2)}
              </pre>
            </TabPane>
            <TabPane tab="Text" key="text">
              <pre
                style={{
                  maxHeight: 400,
                  overflow: 'auto',
                  padding: 16,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {data.artifacts.txt || 'No text artifact available'}
              </pre>
            </TabPane>
          </KBTabs>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 24 }}>No data available</div>
      )}
    </KBSheet>
  );
}

