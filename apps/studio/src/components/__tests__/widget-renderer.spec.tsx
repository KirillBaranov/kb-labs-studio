import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mock dependencies before importing component
vi.mock('../../providers/registry-provider', () => ({
  useRegistry: vi.fn(),
}));

vi.mock('../../hooks/useWidgetData', () => ({
  useWidgetData: vi.fn(),
}));

vi.mock('../../hooks/useWidgetEvents', () => ({
  useWidgetEvents: () => ({
    subscribe: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  }),
}));

vi.mock('../../utils/analytics', () => ({
  trackWidgetEvent: vi.fn(),
}));

vi.mock('../../config/studio.config', () => ({
  studioConfig: {
    apiBaseUrl: '/api/v1',
    headerNotices: {
      enabled: false,
      collapsible: true,
      defaultExpanded: false,
      showProvided: false,
    },
  },
}));

import { WidgetRenderer } from '../widget-renderer';
import { useRegistry } from '../../providers/registry-provider';
import { useWidgetData } from '../../hooks/useWidgetData';

const mockUseRegistry = vi.mocked(useRegistry);
const mockUseWidgetData = vi.mocked(useWidgetData);

describe('WidgetRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for useWidgetData
    mockUseWidgetData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      headers: undefined,
      refetch: vi.fn(),
    });
  });

  describe('widget lookup', () => {
    it('renders error when widget not found in registry', () => {
      mockUseRegistry.mockReturnValue({
        registry: { plugins: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <WidgetRenderer widgetId="unknown" pluginId="test-plugin" />
      );

      expect(html).toContain('Widget not found');
      expect(html).toContain('unknown');
    });

    it('finds widget in registry plugins array', () => {
      const mockWidget = {
        id: 'my-widget',
        kind: 'metric',
        title: 'Test Metric',
        plugin: { id: 'test-plugin' },
        data: { source: { type: 'mock', fixtureId: 'test' } },
        options: {},
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [
            {
              id: 'test-plugin',
              widgets: [mockWidget],
            },
          ],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      mockUseWidgetData.mockReturnValue({
        data: { value: 42, label: 'Test' },
        loading: false,
        error: null,
        headers: undefined,
        refetch: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <WidgetRenderer widgetId="my-widget" pluginId="test-plugin" />
      );

      // Should render Metric widget, not error
      expect(html).not.toContain('Widget not found');
    });
  });

  describe('widget kind mapping', () => {
    const testCases = [
      { kind: 'metric', expectContains: 'not error' },
      { kind: 'table', expectContains: 'not error' },
      { kind: 'cardlist', expectContains: 'not error' },
      { kind: 'chart-line', expectContains: 'not error' },
      // 'form' requires QueryClient - tested separately
      { kind: 'alert', expectContains: 'not error' },
    ];

    // Filter out 'form' - requires QueryClient
    testCases.filter(({ kind }) => kind !== 'form').forEach(({ kind }) => {
      it(`maps kind "${kind}" to component`, () => {
        const mockWidget = {
          id: 'test-widget',
          kind,
          title: 'Test',
          plugin: { id: 'test-plugin' },
          data: { source: { type: 'mock', fixtureId: 'test' } },
          options: {},
        };

        mockUseRegistry.mockReturnValue({
          registry: {
            plugins: [{ id: 'test-plugin', widgets: [mockWidget] }],
          },
          loading: false,
          error: null,
          refetch: vi.fn(),
        });

        mockUseWidgetData.mockReturnValue({
          data: {},
          loading: false,
          error: null,
          headers: undefined,
          refetch: vi.fn(),
        });

        const html = renderToStaticMarkup(
          <WidgetRenderer widgetId="test-widget" pluginId="test-plugin" />
        );

        // Should not show "Component not found" error
        expect(html).not.toContain('No component found for widget kind');
      });
    });

    it('shows error for unknown widget kind', () => {
      const mockWidget = {
        id: 'test-widget',
        kind: 'unknown-kind-xyz',
        title: 'Test',
        plugin: { id: 'test-plugin' },
        data: { source: { type: 'mock', fixtureId: 'test' } },
        options: {},
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ id: 'test-plugin', widgets: [mockWidget] }],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <WidgetRenderer widgetId="test-widget" pluginId="test-plugin" />
      );

      expect(html).toContain('No component found for widget kind');
      expect(html).toContain('unknown-kind-xyz');
    });
  });

  describe('data configuration', () => {
    it('shows error when widget has no data config', () => {
      const mockWidget = {
        id: 'test-widget',
        kind: 'metric',
        title: 'Test',
        plugin: { id: 'test-plugin' },
        // Missing data config
        options: {},
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ id: 'test-plugin', widgets: [mockWidget] }],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <WidgetRenderer widgetId="test-widget" pluginId="test-plugin" />
      );

      expect(html).toContain('Invalid widget configuration');
      expect(html).toContain('missing data configuration');
    });

    it('shows error when widget has no source in data', () => {
      const mockWidget = {
        id: 'test-widget',
        kind: 'metric',
        title: 'Test',
        plugin: { id: 'test-plugin' },
        data: {}, // Missing source
        options: {},
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ id: 'test-plugin', widgets: [mockWidget] }],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <WidgetRenderer widgetId="test-widget" pluginId="test-plugin" />
      );

      expect(html).toContain('Invalid widget configuration');
    });
  });

  describe('loading states', () => {
    it('passes loading state to widget component', () => {
      const mockWidget = {
        id: 'test-widget',
        kind: 'metric',
        title: 'Test Metric',
        plugin: { id: 'test-plugin' },
        data: { source: { type: 'mock', fixtureId: 'test' } },
        options: {},
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ id: 'test-plugin', widgets: [mockWidget] }],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      mockUseWidgetData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        headers: undefined,
        refetch: vi.fn(),
      });

      const html = renderToStaticMarkup(
        <WidgetRenderer widgetId="test-widget" pluginId="test-plugin" />
      );

      // Metric component should render (possibly in loading state)
      expect(html).not.toContain('Widget not found');
    });
  });
});
