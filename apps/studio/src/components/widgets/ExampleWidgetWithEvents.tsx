/**
 * @module @kb-labs/studio-app/components/widgets/ExampleWidgetWithEvents
 * Example widget showing how to use event bus for custom events
 */

import * as React from 'react';
import { Button, Card } from 'antd';
import { useWidgetEvents } from '../../hooks/useWidgetEvents.js';
import type { BaseWidgetProps } from './types.js';

export interface ExampleWidgetWithEventsProps extends BaseWidgetProps<{ count: number }, Record<string, unknown>> {}

/**
 * Example widget demonstrating event bus usage
 */
export function ExampleWidgetWithEvents({
  data,
  loading,
  error,
}: ExampleWidgetWithEventsProps): React.ReactElement {
  const { subscribe, emit } = useWidgetEvents();
  const [eventCount, setEventCount] = React.useState(0);
  const [lastEventPayload, setLastEventPayload] = React.useState<unknown>(null);

  // Subscribe to custom events
  React.useEffect(() => {
    // Subscribe to a custom event
    const unsubscribe = subscribe('my-custom-event', (payload) => {
      console.log('Received custom event:', payload);
      setEventCount((prev) => prev + 1);
      setLastEventPayload(payload);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [subscribe]);

  // Subscribe to widget refresh event
  React.useEffect(() => {
    const unsubscribe = subscribe('widget:refresh', () => {
      console.log('Widget refresh requested');
      // Trigger data refresh here
    });

    return unsubscribe;
  }, [subscribe]);

  // Function to emit custom event
  const handleEmitEvent = React.useCallback(() => {
    emit('my-custom-event', {
      timestamp: new Date().toISOString(),
      widgetId: 'example-widget',
      data: data,
    });
  }, [emit, data]);

  // Function to emit event to refresh other widgets
  const handleRefreshOthers = React.useCallback(() => {
    emit('widget:refresh', {
      source: 'example-widget',
    });
  }, [emit]);

  if (loading) {
    return <Card>Loading...</Card>;
  }

  if (error) {
    return <Card>Error: {error}</Card>;
  }

  return (
    <Card>
      <h3>Event Bus Example Widget</h3>
      <p>Count: {data?.count || 0}</p>
      
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <div>
          <p>Events received: {eventCount}</p>
          {lastEventPayload && (
            <pre style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px' }}>
              {JSON.stringify(lastEventPayload, null, 2)}
            </pre>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleEmitEvent} type="primary">
            Emit Custom Event
          </Button>
          <Button onClick={handleRefreshOthers}>
            Refresh Other Widgets
          </Button>
        </div>
      </div>
    </Card>
  );
}

