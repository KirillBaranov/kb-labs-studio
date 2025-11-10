/**
 * @module @kb-labs/studio-app/components/header-policy-callout
 * Visual callout summarising manifest-defined header requirements for a widget.
 */

import * as React from 'react';
import type { StudioHeaderHints } from '@kb-labs/plugin-adapter-studio';
import type { HeaderStatus } from '../hooks/useWidgetData.js';

export interface HeaderPolicyCalloutProps {
  hints: StudioHeaderHints;
  status: HeaderStatus | null;
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showProvided?: boolean;
}

const toneStyles = {
  info: {
    background: 'var(--kb-color-info-muted, rgba(32, 129, 226, 0.08))',
    border: 'var(--kb-color-info-border, rgba(32, 129, 226, 0.35))',
  },
  danger: {
    background: 'var(--kb-color-danger-muted, rgba(224, 36, 94, 0.08))',
    border: 'var(--kb-color-danger-border, rgba(224, 36, 94, 0.35))',
  },
} as const;

function Pill({
  label,
  tone,
}: {
  label: string;
  tone?: 'info' | 'danger' | 'muted';
}): React.ReactElement {
  const palette =
    tone === 'danger'
      ? {
          background: 'rgba(224, 36, 94, 0.12)',
          color: 'var(--kb-color-danger, #e0245e)',
        }
      : tone === 'info'
      ? {
          background: 'rgba(32, 129, 226, 0.12)',
          color: 'var(--kb-color-info, #2081e2)',
        }
      : {
          background: 'rgba(110, 118, 129, 0.12)',
          color: 'var(--kb-color-text-muted, #6e7681)',
        };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: palette.background,
        color: palette.color,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
      }}
    >
      {label}
    </span>
  );
}

function ListRow({
  title,
  items,
  emptyFallback,
}: {
  title: string;
  items: readonly string[] | undefined;
  emptyFallback?: string;
}): React.ReactElement | null {
  if (!items || items.length === 0) {
    if (!emptyFallback) {
      return null;
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{title}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--kb-color-text-muted)' }}>{emptyFallback}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{title}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map((item) => (
          <Pill key={item} label={item} tone="muted" />
        ))}
      </div>
    </div>
  );
}

export function HeaderPolicyCallout({
  hints,
  status,
  title = 'Header requirements',
  description,
  collapsible = true,
  defaultExpanded = false,
  showProvided = false,
}: HeaderPolicyCalloutProps): React.ReactElement {
  const missingRequired = status?.missingRequired ?? [];
  const providedHeaders = status?.provided ?? [];
  const tone = missingRequired.length > 0 ? 'danger' : 'info';
  const [expanded, setExpanded] = React.useState(defaultExpanded || missingRequired.length > 0);

  React.useEffect(() => {
    if (missingRequired.length > 0) {
      setExpanded(true);
    }
  }, [missingRequired]);

  const toggleLabel = expanded ? 'Hide details' : 'Show details';

  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '14px 16px',
        borderRadius: 'var(--kb-radius-md, 10px)',
        border: `1px solid ${toneStyles[tone].border}`,
        background: toneStyles[tone].background,
        color: 'var(--kb-color-text, #1f2328)',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</div>
          {description ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--kb-color-text-muted)' }}>{description}</div>
          ) : null}
          {missingRequired.length > 0 ? (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--kb-color-danger, #d9304c)',
                fontWeight: 600,
              }}
            >
              Missing headers detected: {missingRequired.join(', ')}
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--kb-color-text-muted)',
              }}
            >
              Studio enforces the manifest policy before issuing this request.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Pill label={`Required ${hints.required?.length ?? 0}`} tone={missingRequired.length > 0 ? 'danger' : 'info'} />
          <Pill label={`Optional ${hints.optional?.length ?? 0}`} />
          <Pill label={`Auto ${hints.autoInjected?.length ?? 0}`} />
          {hints.deny && hints.deny.length > 0 ? <Pill label={`Blocked ${hints.deny.length}`} tone="danger" /> : null}
          {collapsible ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                border: '1px solid rgba(31, 35, 40, 0.2)',
                borderRadius: '6px',
                padding: '4px 10px',
                background: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {toggleLabel}
            </button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div
          style={{
            marginTop: '12px',
            display: 'grid',
            gap: '14px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <ListRow
            title="Required headers"
            items={hints.required}
            emptyFallback="None declared in manifest."
          />
          <ListRow title="Optional headers" items={hints.optional} emptyFallback="No optional headers." />
          <ListRow title="Auto-injected" items={hints.autoInjected} emptyFallback="Studio injects tracing/system headers." />
          <ListRow title="Blocked" items={hints.deny} emptyFallback="No additional denies." />
          {hints.patterns && hints.patterns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Allowed patterns</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                {hints.patterns.map((pattern) => (
                  <code key={pattern} style={{ background: 'rgba(15, 23, 42, 0.06)', padding: '2px 4px', borderRadius: '4px' }}>
                    {pattern}
                  </code>
                ))}
              </div>
            </div>
          ) : null}
          {showProvided ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Forwarded this session</span>
              {providedHeaders.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {providedHeaders.map((header) => (
                    <Pill key={header} label={header} tone="info" />
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--kb-color-text-muted)' }}>
                  No custom headers forwarded yet.
                </span>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {missingRequired.length > 0 ? (
        <div
          style={{
            marginTop: '12px',
            fontSize: '0.78rem',
            color: 'var(--kb-color-danger, #d9304c)',
            fontWeight: 600,
          }}
        >
          Update the widget manifest or Studio override to provide the missing headers before retrying.
        </div>
      ) : null}
    </div>
  );
}


