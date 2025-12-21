import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Metric } from '../display/Metric';
import type { MetricData } from '@kb-labs/studio-contracts';

describe('Metric widget', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      const html = renderToStaticMarkup(
        <Metric data={undefined} loading={true} error={null} />
      );

      // Skeleton component should be rendered
      expect(html).toContain('ant-skeleton');
    });
  });

  describe('error state', () => {
    it('renders error state when error present', () => {
      const html = renderToStaticMarkup(
        <Metric data={undefined} loading={false} error="Failed to load" />
      );

      expect(html).toContain('Failed to load');
    });
  });

  describe('empty state', () => {
    it('renders empty state when data is null', () => {
      const html = renderToStaticMarkup(
        <Metric data={null as unknown as MetricData} loading={false} error={null} />
      );

      expect(html).toContain('No data');
      expect(html).toContain('No metric data available');
    });

    it('renders empty state when data is undefined', () => {
      const html = renderToStaticMarkup(
        <Metric data={undefined} loading={false} error={null} />
      );

      expect(html).toContain('No data');
    });
  });

  describe('data rendering', () => {
    it('renders metric label and value', () => {
      const data: MetricData = {
        label: 'Active Users',
        value: 1250,
      };

      const html = renderToStaticMarkup(
        <Metric data={data} loading={false} error={null} />
      );

      expect(html).toContain('Active Users');
      expect(html).toContain('1250');
    });

    it('renders unit when provided', () => {
      const data: MetricData = {
        label: 'Revenue',
        value: 50000,
        unit: 'USD',
      };

      const html = renderToStaticMarkup(
        <Metric data={data} loading={false} error={null} />
      );

      expect(html).toContain('50000');
      expect(html).toContain('USD');
    });

    it('renders delta when provided', () => {
      const data: MetricData = {
        label: 'Users',
        value: 100,
        delta: 15,
      };

      const html = renderToStaticMarkup(
        <Metric data={data} loading={false} error={null} />
      );

      expect(html).toContain('15');
      expect(html).toContain('↑'); // Positive delta shows up arrow
    });

    it('renders negative delta with down arrow', () => {
      const data: MetricData = {
        label: 'Errors',
        value: 50,
        delta: -10,
      };

      const html = renderToStaticMarkup(
        <Metric data={data} loading={false} error={null} />
      );

      expect(html).toContain('10');
      expect(html).toContain('↓'); // Negative delta shows down arrow
    });
  });

  describe('options', () => {
    it('hides delta when showTrend is false', () => {
      const data: MetricData = {
        label: 'Users',
        value: 100,
        delta: 15,
      };

      const html = renderToStaticMarkup(
        <Metric
          data={data}
          loading={false}
          error={null}
          options={{ showTrend: false }}
        />
      );

      expect(html).not.toContain('↑');
      expect(html).not.toContain('↓');
    });

    it('renders compact size when size is small', () => {
      const data: MetricData = {
        label: 'Users',
        value: 100,
      };

      const html = renderToStaticMarkup(
        <Metric
          data={data}
          loading={false}
          error={null}
          options={{ size: 'small' }}
        />
      );

      // Card should have ant-card-small class
      expect(html).toContain('ant-card-small');
    });
  });

  describe('trend styling', () => {
    it('applies success color for upward trend', () => {
      const data: MetricData = {
        label: 'Users',
        value: 100,
        trend: 'up',
      };

      const html = renderToStaticMarkup(
        <Metric data={data} loading={false} error={null} />
      );

      expect(html).toContain('--success');
    });

    it('applies error color for downward trend', () => {
      const data: MetricData = {
        label: 'Errors',
        value: 50,
        trend: 'down',
      };

      const html = renderToStaticMarkup(
        <Metric data={data} loading={false} error={null} />
      );

      expect(html).toContain('--error');
    });
  });
});
