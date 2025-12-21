import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CardList } from '../display/CardList';
import type { CardListData, CardData } from '@kb-labs/rest-api-contracts';

describe('CardList widget', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      const html = renderToStaticMarkup(
        <CardList data={undefined} loading={true} error={null} />
      );

      expect(html).toContain('ant-skeleton');
    });
  });

  describe('error state', () => {
    it('renders error state when error present', () => {
      const html = renderToStaticMarkup(
        <CardList data={undefined} loading={false} error="Failed to load cards" />
      );

      expect(html).toContain('Failed to load cards');
    });
  });

  describe('empty state', () => {
    it('renders empty state when data is null', () => {
      const html = renderToStaticMarkup(
        <CardList data={null as unknown as CardListData} loading={false} error={null} />
      );

      expect(html).toContain('No cards');
    });

    it('renders empty state when cards array is empty', () => {
      const data: CardListData = { cards: [] };

      const html = renderToStaticMarkup(
        <CardList data={data} loading={false} error={null} />
      );

      expect(html).toContain('No cards');
      expect(html).toContain('No card data available');
    });
  });

  describe('data rendering', () => {
    it('renders cards with titles', () => {
      const data: CardListData = {
        cards: [
          { title: 'Card One' },
          { title: 'Card Two' },
          { title: 'Card Three' },
        ],
      };

      const html = renderToStaticMarkup(
        <CardList data={data} loading={false} error={null} />
      );

      expect(html).toContain('Card One');
      expect(html).toContain('Card Two');
      expect(html).toContain('Card Three');
    });

    it('renders card content when provided', () => {
      const data: CardListData = {
        cards: [
          { title: 'Test Card', content: 'This is the card content' },
        ],
      };

      const html = renderToStaticMarkup(
        <CardList data={data} loading={false} error={null} />
      );

      expect(html).toContain('Test Card');
      expect(html).toContain('This is the card content');
    });

    it('renders status border for cards with status', () => {
      const data: CardListData = {
        cards: [
          { title: 'OK Card', status: 'ok' },
          { title: 'Error Card', status: 'error' },
        ],
      };

      const html = renderToStaticMarkup(
        <CardList data={data} loading={false} error={null} />
      );

      expect(html).toContain('--success');
      expect(html).toContain('--error');
    });
  });

  describe('layout options', () => {
    it('renders grid layout by default', () => {
      const data: CardListData = {
        cards: [{ title: 'Card 1' }, { title: 'Card 2' }],
      };

      const html = renderToStaticMarkup(
        <CardList data={data} loading={false} error={null} />
      );

      expect(html).toContain('grid');
    });

    it('renders list layout when specified', () => {
      const data: CardListData = {
        cards: [{ title: 'Card 1' }, { title: 'Card 2' }],
      };

      const html = renderToStaticMarkup(
        <CardList
          data={data}
          loading={false}
          error={null}
          options={{ layout: 'list' }}
        />
      );

      expect(html).toContain('flex-direction:column');
    });

    it('respects columns option in grid layout', () => {
      const data: CardListData = {
        cards: [{ title: 'Card 1' }, { title: 'Card 2' }],
      };

      const html = renderToStaticMarkup(
        <CardList
          data={data}
          loading={false}
          error={null}
          options={{ columns: 4 }}
        />
      );

      expect(html).toContain('repeat(4, 1fr)');
    });

    it('defaults to 3 columns', () => {
      const data: CardListData = {
        cards: [{ title: 'Card 1' }],
      };

      const html = renderToStaticMarkup(
        <CardList data={data} loading={false} error={null} />
      );

      expect(html).toContain('repeat(3, 1fr)');
    });
  });

  describe('compact mode', () => {
    it('renders compact cards when compact option is true', () => {
      const data: CardListData = {
        cards: [{ title: 'Card 1' }],
      };

      const html = renderToStaticMarkup(
        <CardList
          data={data}
          loading={false}
          error={null}
          options={{ compact: true }}
        />
      );

      expect(html).toContain('ant-card-small');
    });
  });

  describe('CardListData format', () => {
    it('only accepts CardListData format with cards array', () => {
      // Valid format - has cards array
      const validData: CardListData = {
        cards: [{ title: 'Card' }],
      };

      const html = renderToStaticMarkup(
        <CardList data={validData} loading={false} error={null} />
      );

      expect(html).toContain('Card');
    });

    it('shows empty state for data without cards property', () => {
      // Invalid format - no cards property
      const invalidData = { items: [{ title: 'Card' }] } as unknown as CardListData;

      const html = renderToStaticMarkup(
        <CardList data={invalidData} loading={false} error={null} />
      );

      expect(html).toContain('No cards');
    });
  });
});
