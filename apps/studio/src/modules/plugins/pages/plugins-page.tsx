import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Input, Select, Spin, Empty, message } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';
import { PluginGrid } from '../components/plugin-grid';
import { PluginTable } from '../components/plugin-table';

const { Search } = Input;

type ViewMode = 'grid' | 'table';

export function PluginsPage() {
  const navigate = useNavigate();
  const { plugins: pluginsSource } = useDataSources();
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState<PluginManifestEntry[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginManifestEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    loadPlugins();
  }, [pluginsSource]);

  useEffect(() => {
    applyFilters();
  }, [plugins, searchQuery, filterType]);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      const result = await pluginsSource.getPlugins();
      setPlugins(result.manifests);
      setFilteredPlugins(result.manifests);
    } catch (err) {
      message.error('Failed to load plugins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plugins];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const id = p.manifest.id.toLowerCase();
        const name = p.manifest.display?.name?.toLowerCase() || '';
        const desc = p.manifest.display?.description?.toLowerCase() || '';
        const tags = p.manifest.display?.tags?.join(' ').toLowerCase() || '';
        return id.includes(query) || name.includes(query) || desc.includes(query) || tags.includes(query);
      });
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((p) => {
        switch (filterType) {
          case 'cli':
            return p.manifest.cli && p.manifest.cli.commands.length > 0;
          case 'rest':
            return p.manifest.rest && p.manifest.rest.routes.length > 0;
          case 'workflows':
            return p.manifest.workflows && p.manifest.workflows.handlers.length > 0;
          case 'jobs':
            return p.manifest.jobs && p.manifest.jobs.length > 0;
          default:
            return true;
        }
      });
    }

    setFilteredPlugins(filtered);
  };

  const handlePluginClick = (plugin: PluginManifestEntry) => {
    // Encode plugin ID for URL (replace @ and / with safe characters)
    const encodedId = encodeURIComponent(plugin.pluginId);
    navigate(`/plugins/${encodedId}`);
  };

  if (loading) {
    return (
      <KBPageContainer>
        <KBPageHeader
          title="Plugins"
          description="Discovered plugins and their capabilities"
        />
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      </KBPageContainer>
    );
  }

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Plugins"
        description={`${plugins.length} plugin${plugins.length === 1 ? '' : 's'} discovered via auto-discovery`}
      />

      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search plugins by name, ID, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Select
            style={{ width: '100%' }}
            value={filterType}
            onChange={setFilterType}
            options={[
              { label: 'All Plugins', value: 'all' },
              { label: 'Has CLI Commands', value: 'cli' },
              { label: 'Has REST Routes', value: 'rest' },
              { label: 'Has Workflows', value: 'workflows' },
              { label: 'Has Scheduled Jobs', value: 'jobs' },
            ]}
          />
        </Col>
        <Col xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
          <Select
            style={{ width: 140 }}
            value={viewMode}
            onChange={setViewMode}
          >
            <Select.Option value="grid">
              <AppstoreOutlined /> Grid View
            </Select.Option>
            <Select.Option value="table">
              <UnorderedListOutlined /> Table View
            </Select.Option>
          </Select>
        </Col>
      </Row>

      {filteredPlugins.length === 0 ? (
        <Empty
          description={
            searchQuery || filterType !== 'all'
              ? 'No plugins match your filters'
              : 'No plugins discovered'
          }
          style={{ marginTop: 48 }}
        />
      ) : viewMode === 'grid' ? (
        <PluginGrid plugins={filteredPlugins} onPluginClick={handlePluginClick} />
      ) : (
        <PluginTable plugins={filteredPlugins} onPluginClick={handlePluginClick} />
      )}
    </KBPageContainer>
  );
}
