import { useState, useEffect, type ComponentType } from 'react';
import { Spin, Result, Button } from 'antd';
import { loadPageComponent, PageLoadError } from './widget-loader.js';
import { PageErrorBoundary } from './page-error-boundary.js';
import { PageContextProvider, type PageContext } from '@kb-labs/studio-hooks';
import { EventBusProvider } from '@kb-labs/studio-event-bus';

export interface PageContainerProps {
  remoteName: string;
  entry: string;
  pageId: string;
  pluginId: string;
  config?: Record<string, unknown>;
  permissions?: string[];
}

/**
 * Loads an MF remote page component and wraps it with providers.
 *
 * Lifecycle:
 * 1. Shows loading spinner
 * 2. Loads remote via Module Federation
 * 3. Wraps in ErrorBoundary → PageContext → EventBus scope
 * 4. On load failure → shows "unavailable" fallback with retry
 * 5. On crash → ErrorBoundary catches, shows retry button
 */
export function PageContainer({
  remoteName,
  entry,
  pageId,
  pluginId,
  config = {},
  permissions = [],
}: PageContainerProps) {
  const [PageComponent, setPageComponent] = useState<ComponentType<unknown> | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    loadPageComponent(remoteName, entry)
      .then((mod) => {
        if (!cancelled) {
          setPageComponent(() => mod.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [remoteName, entry]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" tip={`Loading ${pageId}...`} />
      </div>
    );
  }

  if (loadError) {
    return (
      <Result
        status="error"
        title="Page Unavailable"
        subTitle={`Could not load "${pageId}" from plugin "${pluginId}". The plugin may not be built or the service may be down.`}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        }
      />
    );
  }

  if (!PageComponent) return null;

  const pageContext: PageContext = { pageId, pluginId, config, permissions };

  return (
    <PageErrorBoundary pageId={pageId} pluginId={pluginId}>
      <EventBusProvider>
        <PageContextProvider value={pageContext}>
          <PageComponent />
        </PageContextProvider>
      </EventBusProvider>
    </PageErrorBoundary>
  );
}
