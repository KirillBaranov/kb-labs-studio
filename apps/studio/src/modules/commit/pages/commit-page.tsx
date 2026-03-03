/**
 * @module @kb-labs/studio-app/modules/commit/pages/commit-page
 * Commit plugin main page
 */

import * as React from 'react';
import { UITabs, UISelect } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useScopes } from '@kb-labs/studio-data-client';
import { CommitsTab } from '../components/commits-tab';
import { FilesTabNew } from '../components/files-tab-new';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

export function CommitPage() {
  const sources = useDataSources();
  const [selectedScope, setSelectedScope] = React.useState<string>('');

  const { data: scopesData, isLoading: scopesLoading } = useScopes(sources.commit);

  // Auto-select first scope
  React.useEffect(() => {
    if (scopesData?.scopes && scopesData.scopes.length > 0 && !selectedScope) {
      setSelectedScope(scopesData.scopes[0]!.id);
    }
  }, [scopesData, selectedScope]);

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
        description="AI-powered commit generation"
        extra={
          <UISelect
            style={{ width: 300 }}
            placeholder="Select scope"
            value={selectedScope}
            onChange={(v) => setSelectedScope(v as string)}
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

      <UITabs
        items={tabItems}
        syncUrl={{ mode: 'path', basePath: '/commit' }}
        size="large"
        style={{ marginTop: 24 }}
      />
    </KBPageContainer>
  );
}
