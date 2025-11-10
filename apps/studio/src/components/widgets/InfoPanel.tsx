/**
 * @module @kb-labs/studio-app/components/widgets/InfoPanel
 * InfoPanel widget - renders sections with different formats (JSON, text, key-value)
 */

import * as React from 'react';
import { Card, Collapse, Tabs, Typography } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';
import type { InfoPanelData, KeyValueData } from '@kb-labs/plugin-manifest';
import { JsonViewer } from './JsonViewer.js';
import { KeyValue } from './KeyValue.js';

const { Panel } = Collapse;
const { Paragraph, Text } = Typography;

export interface InfoPanelOptions {
  layout?: 'sections' | 'tabs';
  defaultCollapsed?: boolean;
}

export interface InfoPanelProps extends BaseWidgetProps<InfoPanelData, InfoPanelOptions> {}

export function InfoPanel({ data, loading, error, options }: InfoPanelProps) {
  if (loading) {
    return <Skeleton variant="text" rows={5} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Extract sections from response (handle both direct format and wrapped format)
  let sections: InfoPanelData['sections'] = [];
  
  if (!data) {
    return <EmptyState title="No data" description="No sections available" />;
  }

  // If data has 'sections' field, use it directly
  if (typeof data === 'object' && 'sections' in data && Array.isArray((data as any).sections)) {
    sections = (data as InfoPanelData).sections;
  } else if (typeof data === 'object' && 'ok' in data && 'sections' in data && Array.isArray((data as any).sections)) {
    // Wrapped format: { ok: true, sections: [...] }
    sections = (data as any).sections;
  } else {
    return <EmptyState title="Invalid data format" description="InfoPanel data must have a sections array" />;
  }

  if (sections.length === 0) {
    return <EmptyState title="No data" description="No sections available" />;
  }

  const layout = options?.layout || 'sections';
  const defaultCollapsed = options?.defaultCollapsed === true;

  const renderSectionContent = (section: InfoPanelData['sections'][0]) => {
    const { data: sectionData, format } = section;

    if (sectionData === null || sectionData === undefined) {
      return (
        <Paragraph style={{ margin: 0, color: '#666' }}>
          No data provided.
        </Paragraph>
      );
    }

    if (format === 'json') {
      return (
        <JsonViewer
          data={sectionData}
          loading={false}
          error={null}
          options={{ collapsed: defaultCollapsed }}
        />
      );
    }

    if (format === 'keyvalue') {
      // Convert object to KeyValue format
      if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
        const items: KeyValueData['items'] = Object.entries(sectionData).map(([key, value]) => ({
          key,
          value: String(value ?? ''),
          type:
            typeof value === 'number'
              ? 'number'
              : typeof value === 'boolean'
              ? 'boolean'
              : 'string',
        }));
        return <KeyValue data={{ items }} loading={false} error={null} />;
      }
      // If already in KeyValue format
      if (typeof sectionData === 'object' && 'items' in sectionData) {
        return (
          <KeyValue
            data={sectionData as KeyValueData}
            loading={false}
            error={null}
          />
        );
      }
    }

    if (format === 'text') {
      return (
        <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
          {String(sectionData ?? '')}
        </Paragraph>
      );
    }

    // Default: try to render as JSON
    return (
      <JsonViewer
        data={sectionData}
        loading={false}
        error={null}
        options={{ collapsed: defaultCollapsed }}
      />
    );
  };

  if (layout === 'tabs') {
    return (
      <Tabs
        items={sections.map((section, index) => ({
          key: `section-${index}`,
          label: section.title,
          children: (
            <div style={{ padding: '1rem 0' }}>
              {renderSectionContent(section)}
            </div>
          ),
        }))}
      />
    );
  }

  // Default: sections with collapsible panels
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {sections.map((section, index) => {
        const isCollapsible = section.collapsible !== false;

        if (isCollapsible) {
          return (
            <Collapse
              key={`section-${index}`}
              defaultActiveKey={defaultCollapsed ? [] : [`section-${index}`]}
              items={[
                {
                  key: `section-${index}`,
                  label: section.title,
                  children: renderSectionContent(section),
                },
              ]}
            />
          );
        }

        return (
          <Card key={`section-${index}`} title={section.title} size="small">
            {renderSectionContent(section)}
          </Card>
        );
      })}
    </div>
  );
}

