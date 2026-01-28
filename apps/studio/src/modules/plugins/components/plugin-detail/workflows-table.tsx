import { Table, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UICard, UIText } from '@kb-labs/studio-ui-kit';

interface WorkflowsTableProps {
  handlers: any[];
}

export function WorkflowsTable({ handlers }: WorkflowsTableProps) {
  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => {
        const { token } = theme.useToken();
        return <UIText style={{ fontFamily: token.fontFamilyCode }}>{id}</UIText>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'describe',
      key: 'describe',
      render: (desc) => (typeof desc === 'string' ? desc : desc ? JSON.stringify(desc) : '—'),
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

  return (
    <UICard>
      <Table columns={columns} dataSource={handlers} rowKey="id" pagination={false} />
    </UICard>
  );
}
