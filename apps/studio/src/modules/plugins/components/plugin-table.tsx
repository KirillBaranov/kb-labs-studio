import { Table, Tag, Space, Typography, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CodeOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';

const { Text } = Typography;

interface PluginTableProps {
  plugins: PluginManifestEntry[];
  onPluginClick: (plugin: PluginManifestEntry) => void;
}

export function PluginTable({ plugins, onPluginClick }: PluginTableProps) {
  const columns: ColumnsType<PluginManifestEntry> = [
    {
      title: 'Plugin',
      dataIndex: ['manifest', 'id'],
      key: 'id',
      width: 250,
      fixed: 'left',
      render: (id, record) => {
        const { display } = record.manifest;
        return (
          <Space>
            <span style={{ fontSize: 20 }}>{display?.icon || '📦'}</span>
            <div>
              <Text strong>{display?.name || id}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {id}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Version',
      dataIndex: ['manifest', 'version'],
      key: 'version',
      width: 100,
      render: (version) => <Text code>{version}</Text>,
    },
    {
      title: 'Description',
      dataIndex: ['manifest', 'display', 'description'],
      key: 'description',
      ellipsis: { showTitle: false },
      render: (desc) => (
        <Tooltip title={desc}>
          <Text type="secondary">{desc || '—'}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'CLI',
      key: 'cli',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const count = record.manifest.cli?.commands.length ?? 0;
        return count > 0 ? (
          <Tooltip title={`${count} command${count > 1 ? 's' : ''}`}>
            <Tag icon={<CodeOutlined />} color="blue">
              {count}
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'REST',
      key: 'rest',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const count = record.manifest.rest?.routes.length ?? 0;
        return count > 0 ? (
          <Tooltip title={`${count} route${count > 1 ? 's' : ''}`}>
            <Tag icon={<ApiOutlined />} color="green">
              {count}
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Workflows',
      key: 'workflows',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const count = record.manifest.workflows?.handlers.length ?? 0;
        return count > 0 ? (
          <Tooltip title={`${count} handler${count > 1 ? 's' : ''}`}>
            <Tag icon={<NodeIndexOutlined />} color="purple">
              {count}
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Jobs',
      key: 'jobs',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const count = record.manifest.jobs?.length ?? 0;
        return count > 0 ? (
          <Tooltip title={`${count} job${count > 1 ? 's' : ''}`}>
            <Tag icon={<ClockCircleOutlined />} color="orange">
              {count}
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Flags',
      key: 'flags',
      width: 180,
      render: (_, record) => (
        <Space wrap size={4}>
          {record.manifest.permissions && (
            <Tooltip title="Requires permissions">
              <Tag icon={<WarningOutlined />} color="gold" style={{ fontSize: 11 }}>
                Perms
              </Tag>
            </Tooltip>
          )}
          {record.manifest.platform?.requires && record.manifest.platform.requires.length > 0 && (
            <Tooltip title={`Requires: ${record.manifest.platform.requires.join(', ')}`}>
              <Tag icon={<CheckCircleOutlined />} color="cyan" style={{ fontSize: 11 }}>
                Platform
              </Tag>
            </Tooltip>
          )}
          {record.manifest.display?.tags?.slice(0, 2).map((tag) => (
            <Tag key={tag} style={{ fontSize: 11 }}>
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={plugins}
      rowKey="pluginId"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} plugin${total === 1 ? '' : 's'}`,
      }}
      onRow={(record) => ({
        onClick: () => onPluginClick(record),
        style: { cursor: 'pointer' },
      })}
      scroll={{ x: 1200 }}
    />
  );
}
