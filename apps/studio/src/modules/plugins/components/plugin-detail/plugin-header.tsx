import { Space, Collapse, theme } from 'antd';
import {
  UserOutlined,
  GlobalOutlined,
  LinkOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { UICard, UIText, UITitle, UITag } from '@kb-labs/studio-ui-kit';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';

const { useToken } = theme;

interface PluginHeaderProps {
  plugin: PluginManifestEntry;
}

export function PluginHeader({ plugin }: PluginHeaderProps) {
  const { token } = useToken();
  const { manifest } = plugin;
  const display = manifest.display;

  return (
    <UICard>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Icon + Name + Version */}
        <Space align="start" size="large">
          <div style={{ fontSize: 64, lineHeight: 1 }}>{display?.icon || '📦'}</div>
          <div style={{ flex: 1 }}>
            <UITitle level={2} style={{ marginBottom: 4 }}>
              {display?.name || manifest.id}
            </UITitle>
            <Space size="middle">
              <UIText color="secondary" style={{ fontSize: 16 }}>
                v{manifest.version}
              </UIText>
              <UITag color="blue">
                {typeof plugin.source === 'string'
                  ? plugin.source
                  : plugin.source?.kind || 'unknown'}
              </UITag>
              <UITag>{manifest.schema}</UITag>
            </Space>
          </div>
        </Space>

        {/* Description */}
        {display?.description && (
          <UIText style={{ fontSize: 15, marginBottom: 0, color: token.colorTextSecondary }}>
            {display.description}
          </UIText>
        )}

        {/* Tags */}
        {display?.tags && display.tags.length > 0 && (
          <Space wrap>
            {display.tags.map((tag, idx) => (
              <UITag key={typeof tag === 'string' ? tag : `tag-${idx}`} color="default">
                {typeof tag === 'string' ? tag : JSON.stringify(tag)}
              </UITag>
            ))}
          </Space>
        )}

        {/* Metadata Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 8,
          }}
        >
          {display?.author && (
            <div>
              <UIText
                color="secondary"
                style={{ fontSize: token.fontSizeSM, display: 'block', marginBottom: 4 }}
              >
                Author
              </UIText>
              <Space>
                <UserOutlined />
                <UIText>{display.author}</UIText>
              </Space>
            </div>
          )}
          <div>
            <UIText
              color="secondary"
              style={{ fontSize: token.fontSizeSM, display: 'block', marginBottom: 4 }}
            >
              Plugin ID
            </UIText>
            <UIText style={{ fontFamily: token.fontFamilyCode }}>{manifest.id}</UIText>
          </div>
        </div>

        {/* Links */}
        {(display?.homepage || display?.repository) && (
          <Space size="large">
            {display?.homepage && (
              <a href={display.homepage} target="_blank" rel="noopener noreferrer">
                <Space>
                  <GlobalOutlined />
                  Homepage
                </Space>
              </a>
            )}
            {display?.repository && (
              <a href={display.repository} target="_blank" rel="noopener noreferrer">
                <Space>
                  <LinkOutlined />
                  Repository
                </Space>
              </a>
            )}
          </Space>
        )}

        {/* Timestamps */}
        {(plugin.discoveredAt || plugin.buildTimestamp) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {plugin.discoveredAt && (
              <div>
                <UIText
                  color="secondary"
                  style={{ fontSize: token.fontSizeSM, display: 'block', marginBottom: 4 }}
                >
                  Discovered At
                </UIText>
                <Space>
                  <SearchOutlined />
                  <UIText>{new Date(plugin.discoveredAt).toLocaleString()}</UIText>
                </Space>
              </div>
            )}
            {plugin.buildTimestamp && (
              <div>
                <UIText
                  color="secondary"
                  style={{ fontSize: token.fontSizeSM, display: 'block', marginBottom: 4 }}
                >
                  Last Built
                </UIText>
                <Space>
                  <ClockCircleOutlined />
                  <UIText>{new Date(plugin.buildTimestamp).toLocaleString()}</UIText>
                </Space>
              </div>
            )}
          </div>
        )}

        {/* Plugin Root (collapsible) */}
        <Collapse
          ghost
          items={[
            {
              key: 'root',
              label: <UIText color="secondary">Plugin Root Path</UIText>,
              children: (
                <UIText style={{ fontSize: token.fontSizeSM, fontFamily: token.fontFamilyCode }}>
                  {plugin.pluginRoot}
                </UIText>
              ),
            },
          ]}
        />
      </Space>
    </UICard>
  );
}
