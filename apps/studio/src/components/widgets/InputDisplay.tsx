/**
 * @module @kb-labs/studio-app/components/widgets/InputDisplay
 * InputDisplay widget - input field with submit button and result display
 */

import * as React from 'react';
import { Input, Button, message } from 'antd';
import type { BaseWidgetProps, InputDisplayWidgetOptions } from './types';
import { useWidgetMutation } from '../../hooks/useWidgetMutation';
import { studioConfig } from '../../config/studio.config';
import type { DataSource } from '@kb-labs/plugin-manifest';
import type { StudioHeaderHints } from '@kb-labs/plugin-adapter-studio';
import { InfoPanel } from './InfoPanel';
import { WidgetCard } from './WidgetCard';

const { TextArea } = Input;

export interface InputDisplayProps extends BaseWidgetProps<unknown, InputDisplayWidgetOptions> {
  pluginId?: string;
  source?: DataSource;
  headerHints?: StudioHeaderHints;
}

export function InputDisplay({
  pluginId = '',
  source,
  options,
  headerHints,
  subscribeToEvent,
  title,
  description,
  showTitle = false,
  showDescription = false,
}: InputDisplayProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [resultData, setResultData] = React.useState<unknown>(null);

  // Extract route configuration from source
  const routeId = source?.type === 'rest' ? source.routeId : '';
  const method = source?.type === 'rest' ? (source.method || 'POST') : 'POST';
  const basePath = studioConfig.apiBaseUrl || '/api/v1';

  const mutation = useWidgetMutation({
    pluginId,
    routeId,
    method: method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    basePath,
    headerHints,
    headers: source?.type === 'rest' ? source.headers : undefined,
    onSuccess: (data) => {
      message.success('Query executed successfully');
      setResultData(data);
    },
    onError: (error) => {
      message.error(`Failed to execute query: ${error.message}`);
      setResultData(null);
    },
    emitEventOnSuccess: options?.display?.subscribeTo,
  });

  // Subscribe to events if configured
  React.useEffect(() => {
    if (!subscribeToEvent || !options?.display?.subscribeTo) {
      return;
    }

    const unsubscribe = subscribeToEvent(options.display.subscribeTo, (payload: any) => {
      // Update result data from event payload
      if (payload?.data) {
        setResultData(payload.data);
      } else if (payload) {
        setResultData(payload);
      }
    });

    return unsubscribe;
  }, [subscribeToEvent, options?.display?.subscribeTo]);

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      message.warning('Please enter a value');
      return;
    }

    // Send input value as object - no business logic in Studio
    // Plugin's REST handler will handle the format and transformation
    await mutation.mutateAsync({ query: inputValue } as any);
  };

  const inputType = options?.input?.type || 'textarea';
  const placeholder = options?.input?.placeholder || 'Enter your query...';
  const submitLabel = options?.input?.submitLabel || 'Submit';
  const rows = options?.input?.rows || 4;

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      {/* Input section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {inputType === 'textarea' ? (
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={mutation.isPending}
            onPressEnter={(e) => {
              if (e.shiftKey) {
                // Allow new line with Shift+Enter
                return;
              }
              e.preventDefault();
              handleSubmit();
            }}
          />
        ) : (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={mutation.isPending}
            onPressEnter={handleSubmit}
          />
        )}
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={mutation.isPending}
          block
        >
          {submitLabel}
        </Button>
        {mutation.error && (
          <div style={{ color: 'var(--error-color)', fontSize: '0.875rem' }}>
            {mutation.error.message}
          </div>
        )}
      </div>

      {/* Display section */}
      {resultData !== null && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {options?.display?.kind === 'infopanel' ? (
            <InfoPanel
              data={resultData as any}
              loading={false}
              error={null}
              options={{}}
            />
          ) : (
            <pre style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '0.5rem',
              overflow: 'auto',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {typeof resultData === 'string' 
                ? resultData 
                : JSON.stringify(resultData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );

  return (
    <WidgetCard 
      title={title} 
      description={description} 
      showTitle={showTitle} 
      showDescription={showDescription}
    >
      {content}
    </WidgetCard>
  );
}

