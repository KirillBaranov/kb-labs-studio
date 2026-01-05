import { Row, Col } from 'antd';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';
import { PluginCard } from './plugin-card';

interface PluginGridProps {
  plugins: PluginManifestEntry[];
  onPluginClick: (plugin: PluginManifestEntry) => void;
}

export function PluginGrid({ plugins, onPluginClick }: PluginGridProps) {
  return (
    <Row gutter={[16, 16]}>
      {plugins.map((plugin) => (
        <Col key={plugin.pluginId} xs={24} sm={12} lg={8} xl={6}>
          <PluginCard plugin={plugin} onClick={() => onPluginClick(plugin)} />
        </Col>
      ))}
    </Row>
  );
}
