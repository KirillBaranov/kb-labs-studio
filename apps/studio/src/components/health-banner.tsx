import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { Alert } from 'antd';
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
    <Alert
      message={isDegraded ? 'Degraded Mode' : 'Critical Error'}
      description={`${failedSources.map((s) => s.name).join(', ')} unavailable`}
      type={isDegraded ? 'warning' : 'error'}
      icon={<AlertTriangle size={16} />}
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
}

