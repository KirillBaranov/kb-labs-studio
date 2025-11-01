import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBBadge, KBSkeleton } from '@kb-labs/ui-react';
import { HealthIndicator } from '@/components/health-indicator';

export function SettingsPage() {
  const sources = useDataSources();
  const { data, isLoading } = useHealthStatus(sources.system);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Configure Studio and manage data sources</p>
      </div>

      <KBCard>
        <KBCardHeader>
          <KBCardTitle>Data Sources Health</KBCardTitle>
        </KBCardHeader>
        <KBCardContent>
          {isLoading ? (
            <div className="space-y-2">
              <KBSkeleton className="h-8 w-full" />
              <KBSkeleton className="h-8 w-full" />
              <KBSkeleton className="h-8 w-full" />
            </div>
          ) : data ? (
            <div className="space-y-2">
              {data.sources.map((source) => (
                <div key={source.name} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-medium text-gray-900">{source.name}</span>
                  <div className="flex items-center gap-3">
                    {source.latency && (
                      <span className="text-sm text-gray-500">{source.latency}ms</span>
                    )}
                    <HealthIndicator status={source.ok ? 'ok' : 'down'} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No health data available</p>
          )}
        </KBCardContent>
      </KBCard>
    </div>
  );
}

