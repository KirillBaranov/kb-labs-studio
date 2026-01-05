import { Card, Tag, Space, Typography, Tooltip } from 'antd';
import {
  CodeOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';

const { Text, Paragraph } = Typography;

interface PluginCardProps {
  plugin: PluginManifestEntry;
  onClick: () => void;
}

export function PluginCard({ plugin, onClick }: PluginCardProps) {
  const { manifest } = plugin;
  const display = manifest.display;

  const cliCount = manifest.cli?.commands.length ?? 0;
  const restCount = manifest.rest?.routes.length ?? 0;
  const workflowCount = manifest.workflows?.handlers.length ?? 0;
  const jobCount = manifest.jobs?.length ?? 0;

  const hasPermissions = !!manifest.permissions;
  const requiresPlatform = manifest.platform?.requires && manifest.platform.requires.length > 0;

  return (
    <Card
      hoverable
      onClick={onClick}
      style={{ height: '100%', cursor: 'pointer' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%', flex: 1 }}>
        {/* Header: Icon + Name */}
        <Space align="start" style={{ width: '100%' }}>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {display?.icon || '📦'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 16 }}>
              {display?.name || manifest.id}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              v{manifest.version}
            </Text>
          </div>
        </Space>

        {/* Description */}
        {display?.description && (
          <Paragraph
            type="secondary"
            style={{
              fontSize: 13,
              marginBottom: 8,
              lineHeight: 1.4,
            }}
            ellipsis={{ rows: 2, tooltip: display.description }}
          >
            {display.description}
          </Paragraph>
        )}

        {/* Tags */}
        {display?.tags && display.tags.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {display.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} style={{ fontSize: 11, marginBottom: 4 }}>
                {tag}
              </Tag>
            ))}
            {display.tags.length > 3 && (
              <Tag style={{ fontSize: 11 }}>+{display.tags.length - 3}</Tag>
            )}
          </div>
        )}

        {/* Capabilities */}
        <Space wrap size={4}>
          {cliCount > 0 && (
            <Tooltip title={`${cliCount} CLI command${cliCount > 1 ? 's' : ''}`}>
              <Tag icon={<CodeOutlined />} color="blue">
                {cliCount}
              </Tag>
            </Tooltip>
          )}
          {restCount > 0 && (
            <Tooltip title={`${restCount} REST route${restCount > 1 ? 's' : ''}`}>
              <Tag icon={<ApiOutlined />} color="green">
                {restCount}
              </Tag>
            </Tooltip>
          )}
          {workflowCount > 0 && (
            <Tooltip title={`${workflowCount} workflow${workflowCount > 1 ? 's' : ''}`}>
              <Tag icon={<NodeIndexOutlined />} color="purple">
                {workflowCount}
              </Tag>
            </Tooltip>
          )}
          {jobCount > 0 && (
            <Tooltip title={`${jobCount} scheduled job${jobCount > 1 ? 's' : ''}`}>
              <Tag icon={<ClockCircleOutlined />} color="orange">
                {jobCount}
              </Tag>
            </Tooltip>
          )}
        </Space>

        {/* Indicators */}
        <Space wrap size={4} style={{ marginTop: 'auto' }}>
          {hasPermissions && (
            <Tooltip title="Requires permissions">
              <Tag icon={<WarningOutlined />} color="gold" style={{ fontSize: 11 }}>
                Permissions
              </Tag>
            </Tooltip>
          )}
          {requiresPlatform && (
            <Tooltip title={`Requires: ${manifest.platform!.requires!.join(', ')}`}>
              <Tag icon={<CheckCircleOutlined />} color="cyan" style={{ fontSize: 11 }}>
                Platform
              </Tag>
            </Tooltip>
          )}
        </Space>
      </Space>
    </Card>
  );
}
