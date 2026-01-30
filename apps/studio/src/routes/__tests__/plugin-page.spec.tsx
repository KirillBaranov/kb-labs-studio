import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

// Mock registry provider
vi.mock('../../providers/registry-provider', () => ({
  useRegistry: vi.fn(),
}));

// Mock widget-renderer to avoid its internal dependencies
vi.mock('../../components/widget-renderer', () => ({
  WidgetRenderer: ({ widgetId, pluginId }: any) => (
    <div data-testid="widget-renderer" data-widget-id={widgetId} data-plugin-id={pluginId}>
      Widget: {widgetId}
    </div>
  ),
}));

// Mock DashboardGrid
vi.mock('../../layouts/DashboardGrid', () => ({
  DashboardGrid: ({ children }: any) => (
    <div data-testid="dashboard-grid">{children}</div>
  ),
}));

// Mock PageHeader
vi.mock('../../components/page-header', () => ({
  PageHeader: ({ title, description }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  ),
}));

import { PluginPage } from '../plugin-page';
import { useParams } from 'react-router-dom';
import { useRegistry } from '../../providers/registry-provider';

const mockUseParams = useParams as ReturnType<typeof vi.fn>;
const mockUseRegistry = useRegistry as ReturnType<typeof vi.fn>;

describe('PluginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading and error states', () => {
    it('shows loading state while registry is loading', () => {
      mockUseParams.mockReturnValue({ pluginId: 'test', widgetName: 'dashboard' });
      mockUseRegistry.mockReturnValue({
        registry: { plugins: [], widgets: [], layouts: [], menus: [] },
        loading: true,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Loading registry');
    });

    it('shows error state when registry fails to load', () => {
      mockUseParams.mockReturnValue({ pluginId: 'test', widgetName: 'dashboard' });
      mockUseRegistry.mockReturnValue({
        registry: { plugins: [], widgets: [], layouts: [], menus: [] },
        loading: false,
        error: new Error('Connection failed'),
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Error loading registry');
      expect(html).toContain('Connection failed');
    });
  });

  describe('missing params', () => {
    it('shows error when pluginId is missing', () => {
      mockUseParams.mockReturnValue({ widgetName: 'dashboard' });
      mockUseRegistry.mockReturnValue({
        registry: { plugins: [], widgets: [], layouts: [], menus: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('No plugin ID or widget name provided');
    });

    it('shows error when widgetName is missing', () => {
      mockUseParams.mockReturnValue({ pluginId: 'test' });
      mockUseRegistry.mockReturnValue({
        registry: { plugins: [], widgets: [], layouts: [], menus: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('No plugin ID or widget name provided');
    });
  });

  describe('layout-first routing', () => {
    it('renders layout when found with matching widgets', () => {
      mockUseParams.mockReturnValue({ pluginId: 'analytics', widgetName: 'dashboard' });

      const mockWidget = {
        id: 'metrics-overview',
        kind: 'metric',
        title: 'Metrics',
        plugin: { id: '@kb-labs/analytics' },
        data: { source: { type: 'mock' } },
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [
            {
              pluginId: '@kb-labs/analytics',
              widgets: [mockWidget],
            },
          ],
          widgets: [],
          layouts: [
            {
              id: 'analytics.dashboard',
              title: 'Analytics Dashboard',
              kind: 'grid',
              widgets: ['metrics-overview'],
            },
          ],
          menus: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Analytics Dashboard');
      expect(html).toContain('dashboard-grid');
      expect(html).toContain('widget-renderer');
      expect(html).toContain('metrics-overview');
    });

    it('shows layout not found when layout does not exist', () => {
      mockUseParams.mockReturnValue({ pluginId: 'analytics', widgetName: 'nonexistent' });

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ pluginId: '@kb-labs/analytics', widgets: [] }],
          widgets: [],
          layouts: [{ id: 'analytics.dashboard', widgets: [] }],
          menus: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Layout analytics.nonexistent not found');
      expect(html).toContain('Available layouts');
    });

    it('shows missing widgets error with suggestions', () => {
      mockUseParams.mockReturnValue({ pluginId: 'analytics', widgetName: 'dashboard' });

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [
            {
              pluginId: '@kb-labs/analytics',
              widgets: [
                { id: 'metrics-chart', kind: 'chart-line', plugin: { id: '@kb-labs/analytics' } },
              ],
            },
          ],
          widgets: [],
          layouts: [
            {
              id: 'analytics.dashboard',
              title: 'Dashboard',
              widgets: ['nonexistent-widget'],
            },
          ],
          menus: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Widgets not found');
      expect(html).toContain('nonexistent-widget');
      expect(html).toContain('Available widgets');
    });
  });

  describe('plugin name extraction', () => {
    it('extracts plugin name from scoped package ID', () => {
      mockUseParams.mockReturnValue({ pluginId: '@kb-labs/mind', widgetName: 'search' });

      const mockWidget = {
        id: 'search-widget',
        kind: 'form',
        plugin: { id: '@kb-labs/mind' },
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ pluginId: '@kb-labs/mind', widgets: [mockWidget] }],
          widgets: [],
          layouts: [
            {
              id: 'mind.search',
              title: 'Mind Search',
              widgets: ['search-widget'],
            },
          ],
          menus: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      // Should find layout 'mind.search' by extracting 'mind' from '@kb-labs/mind'
      expect(html).toContain('Mind Search');
    });

    it('handles unscoped plugin ID', () => {
      mockUseParams.mockReturnValue({ pluginId: 'simple-plugin', widgetName: 'main' });

      const mockWidget = {
        id: 'main-widget',
        kind: 'metric',
        plugin: { id: 'simple-plugin' },
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ pluginId: 'simple-plugin', widgets: [mockWidget] }],
          widgets: [],
          layouts: [
            {
              id: 'simple-plugin.main',
              title: 'Main View',
              widgets: ['main-widget'],
            },
          ],
          menus: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Main View');
    });
  });

  describe('layout configuration', () => {
    it('applies grid configuration from layout', () => {
      mockUseParams.mockReturnValue({ pluginId: 'test', widgetName: 'grid' });

      const mockWidget = {
        id: 'widget-1',
        kind: 'metric',
        plugin: { id: 'test' },
        layoutHint: { w: 6, h: 4 },
      };

      mockUseRegistry.mockReturnValue({
        registry: {
          plugins: [{ pluginId: 'test', widgets: [mockWidget] }],
          widgets: [],
          layouts: [
            {
              id: 'test.grid',
              title: 'Grid Layout',
              kind: 'grid',
              widgets: ['widget-1'],
              config: { cols: { sm: 1, md: 2, lg: 4 }, rowHeight: 100 },
            },
          ],
          menus: [],
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      const html = renderToStaticMarkup(<PluginPage />);

      expect(html).toContain('Grid Layout');
      expect(html).toContain('dashboard-grid');
    });
  });
});
