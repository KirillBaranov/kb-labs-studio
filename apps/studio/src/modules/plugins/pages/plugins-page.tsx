import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UIRow,
  UICol,
  UIInput, UIInputSearch,
  UISelect,
  UISpin,
  UIEmptyState,
  UIMessage,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';
import { PluginGrid } from '../components/plugin-grid';
import { PluginTable } from '../components/plugin-table';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

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
      UIMessage.error('Failed to load plugins');
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
            return p.manifest.jobs && p.manifest.jobs.handlers.length > 0;
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
          <UISpin size="large" />
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

      <UIRow gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <UICol xs={24} sm={12} md={8}>
          <UIInputSearch
            placeholder="Search plugins by name, ID, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </UICol>
        <UICol xs={24} sm={12} md={8}>
          <UISelect
            style={{ width: '100%' }}
            value={filterType}
            onChange={(v) => setFilterType(v as string)}
            options={[
              { label: 'All Plugins', value: 'all' },
              { label: 'Has CLI Commands', value: 'cli' },
              { label: 'Has REST Routes', value: 'rest' },
              { label: 'Has Workflows', value: 'workflows' },
              { label: 'Has Scheduled Jobs', value: 'jobs' },
            ]}
          />
        </UICol>
        <UICol xs={24} sm={24} md={8} style={{ textAlign: 'right' }}>
          <UISelect
            style={{ width: 140 }}
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            options={[
              { value: 'grid', label: 'Grid View' },
              { value: 'table', label: 'Table View' },
            ]}
          />
        </UICol>
      </UIRow>

      {filteredPlugins.length === 0 ? (
        <UIEmptyState
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
