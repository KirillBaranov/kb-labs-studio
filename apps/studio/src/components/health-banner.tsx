import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { AlertTriangle } from 'lucide-react';

export function HealthBanner() {
  const sources = useDataSources();
  const { data } = useHealthStatus(sources.system);

  if (!data || data.ok) {
    return null;
  }

  const failedSources = data.sources.filter((s) => !s.ok);
  const isDegraded = failedSources.length < data.sources.length && failedSources.length > 0;

  return (
    <div className="border-b border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {isDegraded ? 'Degraded Mode' : 'Critical Error'}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {failedSources.map((s) => s.name).join(', ')} unavailable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

