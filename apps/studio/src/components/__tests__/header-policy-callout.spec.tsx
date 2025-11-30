import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeaderPolicyCallout } from '../header-policy-callout';
import type { StudioHeaderHints } from '@kb-labs/plugin-adapter-studio';
import type { HeaderStatus } from '../../hooks/useWidgetData';

const baseHints: StudioHeaderHints = {
  required: ['x-api-key'],
  optional: ['x-scope'],
  autoInjected: ['traceparent'],
  deny: ['authorization'],
  sensitive: [],
  patterns: ['x-org-*'],
};

describe('HeaderPolicyCallout', () => {
  it('renders missing header warning when required headers are absent', () => {
    const status: HeaderStatus = {
      required: baseHints.required,
      optional: baseHints.optional,
      autoInjected: baseHints.autoInjected,
      deny: baseHints.deny,
      provided: [],
      missingRequired: ['X-Api-Key'],
      patterns: baseHints.patterns,
    };

    const html = renderToStaticMarkup(
      <HeaderPolicyCallout hints={baseHints} status={status} defaultExpanded />
    );

    expect(html).toContain('Missing headers detected: X-Api-Key');
    expect(html).toContain('Required headers');
    expect(html).toContain('Blocked');
  });

  it('lists forwarded headers when showProvided is enabled', () => {
    const status: HeaderStatus = {
      required: baseHints.required,
      optional: baseHints.optional,
      autoInjected: baseHints.autoInjected,
      deny: baseHints.deny,
      provided: ['X-Api-Key'],
      missingRequired: [],
      patterns: baseHints.patterns,
    };

    const html = renderToStaticMarkup(
      <HeaderPolicyCallout
        hints={baseHints}
        status={status}
        defaultExpanded
        showProvided
      />
    );

    expect(html).toContain('Forwarded this session');
    expect(html).toContain('X-Api-Key');
    expect(html).not.toContain('Missing headers detected');
  });
});


