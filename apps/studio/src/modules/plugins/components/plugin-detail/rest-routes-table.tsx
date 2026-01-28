import { Table, Alert, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UICard, UIText, UITag, UITitle } from '@kb-labs/studio-ui-kit';

interface RestRoutesTableProps {
  routes: any[];
  basePath?: string;
  apiBasePath?: string;
}

export function RestRoutesTable({ routes, basePath, apiBasePath }: RestRoutesTableProps) {
  // Combine API base path with plugin base path, avoiding duplicate /v1
  const fullBasePath =
    apiBasePath && basePath
      ? basePath.startsWith('/v1')
        ? apiBasePath + basePath.slice(3) // Remove /v1 from plugin basePath if API already has /api/v1
        : apiBasePath + basePath
      : basePath || '';

  const columns: ColumnsType<any> = [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          PATCH: 'purple',
          DELETE: 'red',
        };
        return <UITag color={colors[method] || 'default'}>{method}</UITag>;
      },
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      render: (path) => {
        const { token } = theme.useToken();
        return (
          <UIText style={{ fontFamily: token.fontFamilyCode }}>
            {fullBasePath}
            {path}
          </UIText>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => (typeof desc === 'string' ? desc : desc ? JSON.stringify(desc) : '—'),
    },
    {
      title: 'Timeout',
      dataIndex: 'timeoutMs',
      key: 'timeoutMs',
      render: (timeout) => (timeout ? `${timeout}ms` : '—'),
    },
    {
      title: 'Handler',
      dataIndex: 'handler',
      key: 'handler',
      render: (handler) => {
        const { token } = theme.useToken();
        return (
          <UIText style={{ fontSize: 11, fontFamily: token.fontFamilyCode }}>
            {handler}
          </UIText>
        );
      },
    },
  ];

  const formatSchemaRef = (schema: any): string => {
    if (!schema) {
      return '—';
    }
    if (typeof schema === 'string') {
      return schema;
    }
    if ('$ref' in schema) {
      return schema.$ref;
    }
    if ('zod' in schema) {
      return schema.zod;
    }
    return JSON.stringify(schema);
  };

  return (
    <UICard>
      {fullBasePath && (
        <Alert
          message={
            <span>
              Base Path:{' '}
              <UIText style={{ fontFamily: theme.useToken().token.fontFamilyCode }}>
                {fullBasePath}
              </UIText>
            </span>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}
      <Table
        columns={columns}
        dataSource={routes}
        rowKey={(record) => `${record.method} ${record.path}`}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => {
            const hasInput = record.input;
            const hasOutput = record.output;
            const hasErrors = record.errors && record.errors.length > 0;

            if (!hasInput && !hasOutput && !hasErrors) {
              return null;
            }

            return (
              <div style={{ margin: 0, paddingLeft: 48 }}>
                {hasInput && (
                  <div style={{ marginBottom: 16 }}>
                    <UITitle level={5}>
                      {record.method === 'GET' ? 'Query Parameters' : 'Request Body'}
                    </UITitle>
                    <UIText style={{ fontFamily: theme.useToken().token.fontFamilyCode }}>
                      {formatSchemaRef(record.input)}
                    </UIText>
                  </div>
                )}
                {hasOutput && (
                  <div style={{ marginBottom: 16 }}>
                    <UITitle level={5}>Response</UITitle>
                    <UIText style={{ fontFamily: theme.useToken().token.fontFamilyCode }}>
                      {formatSchemaRef(record.output)}
                    </UIText>
                  </div>
                )}
                {hasErrors && (
                  <div>
                    <UITitle level={5}>Error Responses</UITitle>
                    {record.errors.map((error: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <UITag color="red">{error.code}</UITag>
                        <UIText>{error.message || '—'}</UIText>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          },
          rowExpandable: (record) =>
            !!(record.input || record.output || (record.errors && record.errors.length > 0)),
        }}
      />
    </UICard>
  );
}
