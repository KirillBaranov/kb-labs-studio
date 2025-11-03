import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus, useReadyStatus } from '@kb-labs/data-client';
import { studioConfig } from '@/config/studio.config';
import { Alert } from 'antd';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

/**
 * Health banner component showing REST API status with fallback to mock mode
 */
export function HealthBanner() {
  const sources = useDataSources();
  const { data: health, isLoading, error, refetch } = useHealthStatus(sources.system);
  const { data: ready } = useReadyStatus(sources.system);
  const [showDetails, setShowDetails] = useState(false);

  // Determine status
  const isDegraded = !health?.ok || ready?.status === 'not ready';
  const isDown = !!error || !health?.ok || (ready?.status !== 'ok' && !isLoading);
  // Check if we're in mock mode by checking if the source has mock methods
  const isMockMode = studioConfig.dataSourceMode === 'mock' || 
                     (studioConfig.dataSourceMode === 'http' && !health && error);

  // Show banner only if there's an issue
  if (!isDegraded && !isDown && !isMockMode) {
    return null;
  }

  const statusMessage = isDown 
    ? 'REST API unavailable' 
    : isDegraded 
    ? 'REST API degraded mode'
    : 'Using mock mode';

  // Get API base URL for error message
  const apiUrl = studioConfig.apiBaseUrl;
  const apiDisplayUrl = apiUrl.startsWith('http') 
    ? apiUrl 
    : `http://localhost:5050${apiUrl}`; // Fallback display URL

  const statusDescription = isDown
    ? `REST API is not responding at ${apiDisplayUrl}. Check if the server is running.`
    : isDegraded
    ? `REST API is in degraded mode. Some services may be unavailable. Status: ${ready?.status || 'unknown'}`
    : 'REST API not available. Using mock data for development.';

  return (
    <Alert
      message={statusMessage}
      description={
        <div>
          <p>{statusDescription}</p>
          {ready?.checks && (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {showDetails ? 'Hide' : 'Show'} details
              </button>
              {showDetails && (
                <ul style={{ marginTop: 8, marginLeft: 20 }}>
                  {Object.entries(ready.checks).map(([check, value]) => (
                    <li key={check}>
                      {check}: {value ? '✓' : '✗'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      }
      type={isDown ? 'error' : isDegraded ? 'warning' : 'info'}
      icon={<AlertTriangle size={16} />}
      showIcon
      action={
        <button
          type="button"
          onClick={() => refetch()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
          title="Retry health check"
        >
          <RefreshCw size={16} />
        </button>
      }
      style={{ marginBottom: 16 }}
    />
  );
}

