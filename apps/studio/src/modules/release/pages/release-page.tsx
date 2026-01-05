/**
 * @module @kb-labs/studio-app/modules/release/pages/release-page
 * Release Manager main page with scope-based workflow
 */

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Select, Collapse, Descriptions, Tag } from 'antd';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleaseScopes } from '@kb-labs/studio-data-client';
import { PlanTab } from '../components/plan-tab';
import { ChangelogTab } from '../components/changelog-tab';
import { HistoryTab } from '../components/history-tab';
import { ReportTab } from '../components/report-tab';

export function ReleasePage() {
  const params = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const sources = useDataSources();
  const [selectedScope, setSelectedScope] = React.useState<string>('');

  const activeTab = params.tab || 'plan';

  // Fetch available scopes
  const { data: scopesData, isLoading: scopesLoading } = useReleaseScopes(sources.release);

  // Auto-select first scope (prefer root if available)
  React.useEffect(() => {
    if (scopesData?.scopes && scopesData.scopes.length > 0 && !selectedScope) {
      const rootScope = scopesData.scopes.find((s) => s.id === 'root');
      setSelectedScope(rootScope?.id || scopesData.scopes[0].id);
    }
  }, [scopesData, selectedScope]);

  const handleTabChange = (key: string) => {
    navigate(`/release/${key}`);
  };

  const tabItems = [
    {
      key: 'plan',
      label: 'Plan',
      children: <PlanTab selectedScope={selectedScope} />,
    },
    {
      key: 'changelog',
      label: 'Changelog',
      children: <ChangelogTab selectedScope={selectedScope} />,
    },
    {
      key: 'history',
      label: 'History',
      children: <HistoryTab selectedScope={selectedScope} />,
    },
    {
      key: 'report',
      label: 'Latest Report',
      children: <ReportTab />,
    },
  ];

  // Get current scope info
  const currentScope = scopesData?.scopes?.find((s) => s.id === selectedScope);

  // Type badge color
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'monorepo':
        return 'blue';
      case 'package':
        return 'green';
      case 'root':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Release Manager"
        description="Plan, execute, and audit releases across your workspace"
        extra={
          <Select
            style={{ width: 400 }}
            placeholder="Select scope (package or monorepo)"
            value={selectedScope}
            onChange={setSelectedScope}
            loading={scopesLoading}
            showSearch
            optionFilterProp="label"
            options={scopesData?.scopes?.map((s) => ({
              label: `${s.name} (${s.type})`,
              value: s.id,
              title: `${s.path} · v${s.currentVersion || '?'}`,
            }))}
          />
        }
      />

      {/* Scope Info Accordion */}
      {currentScope && (
        <Collapse
          size="small"
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'scope-info',
              label: (
                <span>
                  <strong>{currentScope.name}</strong>
                  {currentScope.currentVersion && (
                    <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                      v{currentScope.currentVersion}
                    </span>
                  )}
                  <Tag color={getTypeColor(currentScope.type)} style={{ marginLeft: 8 }}>
                    {currentScope.type}
                  </Tag>
                </span>
              ),
              children: (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="Package Name">{currentScope.id}</Descriptions.Item>
                  {currentScope.currentVersion && (
                    <Descriptions.Item label="Current Version">
                      {currentScope.currentVersion}
                    </Descriptions.Item>
                  )}
                  {currentScope.description && (
                    <Descriptions.Item label="Description">
                      {currentScope.description}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Path">
                    <code style={{ fontSize: 12 }}>{currentScope.path}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    <Tag color={getTypeColor(currentScope.type)}>{currentScope.type}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
          ]}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
        style={{ marginTop: 16 }}
      />
    </KBPageContainer>
  );
}
