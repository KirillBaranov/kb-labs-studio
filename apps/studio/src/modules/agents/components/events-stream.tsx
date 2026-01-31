/**
 * @module @kb-labs/studio-app/modules/agents/components/events-stream
 * Real-time event stream display
 */

import React, { useEffect, useRef } from 'react';
import { Empty, Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import type { AgentEvent } from '@kb-labs/agent-contracts';
import { EventCard } from './event-card';

const { Text } = Typography;

interface EventsStreamProps {
  events: AgentEvent[];
  isLoading?: boolean;
  isConnected?: boolean;
  autoScroll?: boolean;
}

export function EventsStream({
  events,
  isLoading = false,
  isConnected = false,
  autoScroll = true,
}: EventsStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  if (events.length === 0 && !isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          minHeight: 200,
        }}
      >
        <Empty
          description={
            <Text type="secondary">
              {isConnected
                ? 'Waiting for events...'
                : 'Start a task to see agent events'}
            </Text>
          }
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        minHeight: 0,
      }}
    >
      {events.map((event, index) => (
        <EventCard key={`${event.timestamp}-${index}`} event={event} />
      ))}

      {isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            color: 'var(--ant-color-text-secondary)',
          }}
        >
          <Spin indicator={<LoadingOutlined spin />} size="small" />
          <Text type="secondary">Processing...</Text>
        </div>
      )}
    </div>
  );
}
