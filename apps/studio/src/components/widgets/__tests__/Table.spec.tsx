import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

// Mock studio-ui-react before importing Table
vi.mock('@kb-labs/studio-ui-react', () => ({
  KBDataTable: ({ data, columns, onRowClick }: any) => (
    <table data-testid="kb-data-table">
      <thead>
        <tr>
          {columns.map((col: any) => (
            <th key={col.id}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, idx: number) => (
          <tr key={idx} onClick={() => onRowClick?.(row)}>
            {columns.map((col: any) => (
              <td key={col.id}>
                {col.render ? col.render(row[col.id]) : String(row[col.id] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));

import { Table } from '../display/Table';

describe('Table widget', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      const html = renderToStaticMarkup(
        <Table data={undefined} loading={true} error={null} />
      );

      expect(html).toContain('ant-skeleton');
    });
  });

  describe('error state', () => {
    it('renders error state when error present', () => {
      const html = renderToStaticMarkup(
        <Table data={undefined} loading={false} error="Failed to load table" />
      );

      expect(html).toContain('Failed to load table');
    });
  });

  describe('empty state', () => {
    it('renders empty state when data is null', () => {
      const html = renderToStaticMarkup(
        <Table data={null as unknown as any[]} loading={false} error={null} />
      );

      expect(html).toContain('No data');
    });

    it('renders empty state when data is empty array', () => {
      const html = renderToStaticMarkup(
        <Table data={[]} loading={false} error={null} />
      );

      expect(html).toContain('No data');
      expect(html).toContain('No table data available');
    });
  });

  describe('data rendering', () => {
    it('renders table with data rows', () => {
      const data = [
        { id: 1, name: 'Alice', role: 'Admin' },
        { id: 2, name: 'Bob', role: 'User' },
      ];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      expect(html).toContain('Alice');
      expect(html).toContain('Bob');
      expect(html).toContain('Admin');
      expect(html).toContain('User');
    });

    it('auto-generates columns from data keys', () => {
      const data = [
        { firstName: 'John', lastName: 'Doe' },
      ];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      // Column headers should be generated from keys
      expect(html).toContain('firstName');
      expect(html).toContain('lastName');
      expect(html).toContain('John');
      expect(html).toContain('Doe');
    });

    it('uses provided columns when specified', () => {
      const data = [
        { id: 1, name: 'Test', hidden: 'secret' },
      ];

      const columns = [
        { id: 'id', label: 'ID' },
        { id: 'name', label: 'Name' },
        // hidden column not included
      ];

      const html = renderToStaticMarkup(
        <Table
          data={data}
          loading={false}
          error={null}
          options={{ columns }}
        />
      );

      expect(html).toContain('ID');
      expect(html).toContain('Name');
      // hidden column should not be rendered as header
      expect(html).not.toContain('>hidden<');
    });
  });

  describe('data formats', () => {
    it('accepts array of objects directly', () => {
      const data = [{ value: 'direct' }];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      expect(html).toContain('direct');
    });

    it('accepts object with rows array', () => {
      const data = { rows: [{ value: 'nested' }] } as unknown as any[];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      expect(html).toContain('nested');
    });
  });

  describe('card wrapper', () => {
    it('shows card wrapper by default', () => {
      const data = [{ id: 1 }];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      expect(html).toContain('ant-card');
    });

    it('hides card wrapper when showCard is false', () => {
      const data = [{ id: 1 }];

      const html = renderToStaticMarkup(
        <Table
          data={data}
          loading={false}
          error={null}
          options={{ showCard: false }}
        />
      );

      expect(html).not.toContain('ant-card');
    });
  });

  describe('title and description', () => {
    it('renders title when showTitle is true', () => {
      const data = [{ id: 1 }];

      const html = renderToStaticMarkup(
        <Table
          data={data}
          loading={false}
          error={null}
          title="Test Table"
          showTitle={true}
        />
      );

      expect(html).toContain('Test Table');
    });

    it('renders description when showDescription is true', () => {
      const data = [{ id: 1 }];

      const html = renderToStaticMarkup(
        <Table
          data={data}
          loading={false}
          error={null}
          description="Table description"
          showDescription={true}
        />
      );

      expect(html).toContain('Table description');
    });
  });

  describe('cell value rendering', () => {
    it('renders null values as empty string', () => {
      const data = [{ value: null }];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      // Should not contain "null" text
      expect(html).not.toContain('>null<');
    });

    it('renders object values as JSON', () => {
      const data = [{ config: { nested: 'value' } }];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      expect(html).toContain('nested');
      expect(html).toContain('value');
    });

    it('renders array values as JSON', () => {
      const data = [{ tags: ['a', 'b', 'c'] }];

      const html = renderToStaticMarkup(
        <Table data={data} loading={false} error={null} />
      );

      expect(html).toContain('[');
      // HTML escapes quotes as &quot;
      expect(html).toContain('&quot;a&quot;');
    });
  });
});
