import { Table, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UICard, UIText, UITag } from '@kb-labs/studio-ui-kit';

interface JobsTableProps {
  jobs: any[];
}

export function JobsTable({ jobs }: JobsTableProps) {
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
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) =>
        schedule ? (
          <UITag color="orange">{schedule}</UITag>
        ) : (
          <UIText color="secondary">Manual</UIText>
        ),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) =>
        enabled !== false ? <UITag color="green">Yes</UITag> : <UITag color="red">No</UITag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => priority || 5,
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
      <Table columns={columns} dataSource={jobs} rowKey="id" pagination={false} />
    </UICard>
  );
}
