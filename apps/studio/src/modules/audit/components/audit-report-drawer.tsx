import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditPackage } from '@kb-labs/data-client';
import {
  KBSheet,
  KBSheetContent,
  KBSheetHeader,
  KBSheetTitle,
  KBSheetDescription,
  KBTabs,
  KBTabsContent,
  KBTabsList,
  KBTabsTrigger,
  KBSkeleton,
  KBBadge,
} from '@kb-labs/ui-react';

interface AuditReportDrawerProps {
  packageName: string | null;
  onClose: () => void;
}

export function AuditReportDrawer({ packageName, onClose }: AuditReportDrawerProps) {
  const sources = useDataSources();
  const { data, isLoading } = useAuditPackage(packageName || '', sources.audit);

  return (
    <KBSheet open={!!packageName} onOpenChange={(open) => !open && onClose()}>
      <KBSheetContent side="right" className="w-full sm:max-w-2xl">
        <KBSheetHeader>
          <KBSheetTitle>{packageName}</KBSheetTitle>
          <KBSheetDescription>Detailed audit report and artifacts</KBSheetDescription>
        </KBSheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <KBSkeleton className="h-8 w-full" />
            <KBSkeleton className="h-40 w-full" />
            <KBSkeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <div className="mt-6">
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-theme bg-theme-secondary p-4">
                <div>
                  <p className="text-sm font-medium">Last Run</p>
                  <p className="text-sm">
                    {new Date(data.lastRun.startedAt).toLocaleString()}
                  </p>
                </div>
                <KBBadge variant={data.lastRun.status === 'ok' ? 'success' : 'error'}>
                  {data.lastRun.status.toUpperCase()}
                </KBBadge>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">Checks</p>
                <div className="space-y-2">
                  {data.checks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between rounded border border-theme bg-theme-primary p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{check.id}</p>
                        {check.errors !== undefined && check.errors > 0 && (
                          <p className="text-xs text-red-600">{check.errors} errors</p>
                        )}
                        {check.warnings !== undefined && check.warnings > 0 && (
                          <p className="text-xs text-yellow-600">{check.warnings} warnings</p>
                        )}
                      </div>
                      <KBBadge variant={check.ok ? 'success' : 'error'}>
                        {check.ok ? 'OK' : 'FAIL'}
                      </KBBadge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <KBTabs defaultValue="markdown" className="w-full">
              <KBTabsList>
                <KBTabsTrigger value="markdown">Markdown</KBTabsTrigger>
                <KBTabsTrigger value="json">JSON</KBTabsTrigger>
                <KBTabsTrigger value="text">Text</KBTabsTrigger>
              </KBTabsList>
              <KBTabsContent value="markdown">
                <pre className="max-h-[400px] overflow-auto rounded-md bg-theme-secondary p-4 text-sm">
                  {data.artifacts.md || 'No markdown artifact available'}
                </pre>
              </KBTabsContent>
              <KBTabsContent value="json">
                <pre className="max-h-[400px] overflow-auto rounded-md bg-theme-secondary p-4 text-sm">
                  {data.artifacts.json || JSON.stringify(data, null, 2)}
                </pre>
              </KBTabsContent>
              <KBTabsContent value="text">
                <pre className="max-h-[400px] overflow-auto rounded-md bg-theme-secondary p-4 text-sm">
                  {data.artifacts.txt || 'No text artifact available'}
                </pre>
              </KBTabsContent>
            </KBTabs>
          </div>
        ) : (
          <div className="mt-6 text-center">No data available</div>
        )}
      </KBSheetContent>
    </KBSheet>
  );
}

