/**
 * @module @kb-labs/studio-app/modules/commit/pages/commit-page
 * Commit plugin main page - GitHub/GitLab style
 *
 * TODO: TEMPORARY - Remove after commit plugin UI is polished and re-enabled in manifest
 * This is a temporary solution to provide custom commit page while widget UI is being improved
 */

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Select } from 'antd';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQuery } from '@tanstack/react-query';
import { CommitsTab } from '../components/commits-tab';
import { FilesTabNew } from '../components/files-tab-new';

export function CommitPage() {
  const params = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const sources = useDataSources();
  const [selectedScope, setSelectedScope] = React.useState<string>('');

  const activeTab = params.tab || 'commits';

  // Fetch scopes
  const { data: scopesData, isLoading: scopesLoading } = useQuery({
    queryKey: ['commit', 'scopes'],
    queryFn: () => sources.commit.getScopes(),
  });

  // Auto-select first scope
  React.useEffect(() => {
    if (scopesData?.scopes && scopesData.scopes.length > 0 && !selectedScope) {
      setSelectedScope(scopesData.scopes[0].id);
    }
  }, [scopesData, selectedScope]);

  const handleTabChange = (key: string) => {
    navigate(`/commit/${key}`);
  };

  const tabItems = [
    {
      key: 'commits',
      label: 'Commits',
      children: <CommitsTab selectedScope={selectedScope} />,
    },
    {
      key: 'files',
      label: 'Files',
      children: <FilesTabNew selectedScope={selectedScope} />,
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Commit"
        description="AI-powered commit generation with conventional commit support"
        extra={
          <Select
            style={{ width: 300 }}
            placeholder="Select scope"
            value={selectedScope}
            onChange={setSelectedScope}
            loading={scopesLoading}
            showSearch
            options={scopesData?.scopes?.map((s) => ({
              label: s.name,
              value: s.id,
              title: s.path,
            })) || []}
          />
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
        style={{ marginTop: 24 }}
      />
    </KBPageContainer>
  );
}
