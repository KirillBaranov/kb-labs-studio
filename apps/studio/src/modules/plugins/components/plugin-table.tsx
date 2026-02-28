import {
  UITable,
  UITag,
  UISpace,
  UITypographyText,
  UITooltip,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import type { ColumnsType } from 'antd/es/table';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';

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
          <UISpace>
            <span style={{ fontSize: 20 }}>{display?.icon || ''}</span>
            <div>
              <UITypographyText strong>{display?.name || id}</UITypographyText>
              <br />
              <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                {id}
              </UITypographyText>
            </div>
          </UISpace>
        );
      },
    },
    {
      title: 'Version',
      dataIndex: ['manifest', 'version'],
      key: 'version',
      width: 100,
      render: (version) => <UITypographyText code>{version}</UITypographyText>,
    },
    {
      title: 'Description',
      dataIndex: ['manifest', 'display', 'description'],
      key: 'description',
      ellipsis: { showTitle: false },
      render: (desc) => (
        <UITooltip title={desc}>
          <UITypographyText type="secondary">{desc || '--'}</UITypographyText>
        </UITooltip>
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
          <UITooltip title={`${count} command${count > 1 ? 's' : ''}`}>
            <UITag icon={<UIIcon name="CodeOutlined" />} color="blue">
              {count}
            </UITag>
          </UITooltip>
        ) : (
          <UITypographyText type="secondary">--</UITypographyText>
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
          <UITooltip title={`${count} route${count > 1 ? 's' : ''}`}>
            <UITag icon={<UIIcon name="ApiOutlined" />} color="green">
              {count}
            </UITag>
          </UITooltip>
        ) : (
          <UITypographyText type="secondary">--</UITypographyText>
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
          <UITooltip title={`${count} handler${count > 1 ? 's' : ''}`}>
            <UITag icon={<UIIcon name="NodeIndexOutlined" />} color="purple">
              {count}
            </UITag>
          </UITooltip>
        ) : (
          <UITypographyText type="secondary">--</UITypographyText>
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
          <UITooltip title={`${count} job${count > 1 ? 's' : ''}`}>
            <UITag icon={<UIIcon name="ClockCircleOutlined" />} color="orange">
              {count}
            </UITag>
          </UITooltip>
        ) : (
          <UITypographyText type="secondary">--</UITypographyText>
        );
      },
    },
    {
      title: 'Flags',
      key: 'flags',
      width: 180,
      render: (_, record) => (
        <UISpace wrap size={4}>
          {record.manifest.permissions && (
            <UITooltip title="Requires permissions">
              <UITag icon={<UIIcon name="WarningOutlined" />} color="gold" style={{ fontSize: 11 }}>
                Perms
              </UITag>
            </UITooltip>
          )}
          {record.manifest.platform?.requires && record.manifest.platform.requires.length > 0 && (
            <UITooltip title={`Requires: ${record.manifest.platform.requires.join(', ')}`}>
              <UITag icon={<UIIcon name="CheckCircleOutlined" />} color="cyan" style={{ fontSize: 11 }}>
                Platform
              </UITag>
            </UITooltip>
          )}
          {record.manifest.display?.tags?.slice(0, 2).map((tag) => (
            <UITag key={tag} style={{ fontSize: 11 }}>
              {tag}
            </UITag>
          ))}
        </UISpace>
      ),
    },
  ];

  return (
    <UITable
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
