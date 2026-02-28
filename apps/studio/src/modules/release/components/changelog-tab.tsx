/**
 * @module @kb-labs/studio-app/modules/release/components/changelog-tab
 * Changelog Tab - Live markdown editor with preview
 */

import { useState, useEffect } from 'react';
import {
  UIButton,
  UICard,
  UIEmptyState,
  UISpin,
  UISpace,
  UIMessage,
  UIInput,
  UIRow,
  UICol,
  UITitle,
  UIAlert,
  UICheckbox,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseChangelog,
  useGenerateChangelog,
  useSaveChangelog,
} from '@kb-labs/studio-data-client';
import { MarkdownViewer } from '@/components/markdown';

const { TextArea } = UIInput;

interface ChangelogTabProps {
  selectedScope: string;
}

export function ChangelogTab({ selectedScope }: ChangelogTabProps) {
  const sources = useDataSources();
  const [editMode, setEditMode] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [useLLM, setUseLLM] = useState(true);

  // Fetch changelog
  const { data: changelogData, isLoading: changelogLoading } = useReleaseChangelog(
    sources.release,
    selectedScope,
    undefined,
    !!selectedScope
  );

  // Mutations
  const generateMutation = useGenerateChangelog(sources.release);
  const saveMutation = useSaveChangelog(sources.release);

  // Sync fetched changelog with local state
  useEffect(() => {
    if (changelogData?.markdown) {
      setMarkdown(changelogData.markdown);
      setHasUnsavedChanges(false);
    } else {
      // Clear markdown when no changelog exists for this scope
      setMarkdown('');
      setHasUnsavedChanges(false);
    }
  }, [changelogData]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        scope: selectedScope,
        useLLM,
      });
      setMarkdown(result.markdown);
      setHasUnsavedChanges(true);
      const tokensInfo = result.tokensUsed ? ` (${result.tokensUsed} tokens used)` : '';
      const method = useLLM ? 'AI-powered' : 'Simple';
      UIMessage.success(`${method} changelog generated successfully${tokensInfo}`);
    } catch (error) {
      UIMessage.error(`Failed to generate changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        scope: selectedScope,
        markdown,
      });
      setHasUnsavedChanges(false);
      UIMessage.success('Changelog saved successfully');
    } catch (error) {
      UIMessage.error(`Failed to save changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setHasUnsavedChanges(true);
  };

  if (!selectedScope) {
    return <UIEmptyState description="Please select a scope to continue" style={{ marginTop: 48 }} />;
  }

  if (changelogLoading) {
    return <UISpin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No changelog exists
  if (!changelogData?.markdown && !markdown) {
    return (
      <UICard>
        <UIEmptyState
          description="No changelog generated yet"
          image={UIEmptyState.PRESENTED_IMAGE_SIMPLE}
        >
          <UISpace direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <UICheckbox checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)}>
              Use AI-powered generation (requires LLM)
            </UICheckbox>
            <UIButton
              type="primary"
              icon={<UIIcon name="ThunderboltOutlined" />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
              size="large"
            >
              Generate Changelog
            </UIButton>
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git commits and generate a detailed changelog'
                : 'Generate a simple changelog from package versions'}
            </div>
          </UISpace>
        </UIEmptyState>
      </UICard>
    );
  }

  return (
    <UICard
      title={
        <UISpace>
          <UITitle level={4} style={{ margin: 0 }}>
            Changelog
          </UITitle>
          {hasUnsavedChanges && (
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>● Unsaved changes</span>
          )}
        </UISpace>
      }
      extra={
        <UISpace>
          <UICheckbox
            checked={useLLM}
            onChange={(e) => setUseLLM(e.target.checked)}
            style={{ fontSize: 12 }}
          >
            Use AI
          </UICheckbox>
          <UIButton
            icon={<UIIcon name="ThunderboltOutlined" />}
            onClick={handleGenerate}
            loading={generateMutation.isPending}
          >
            Regenerate
          </UIButton>
          <UIButton
            icon={editMode ? <UIIcon name="EyeOutlined" /> : <UIIcon name="EditOutlined" />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Preview' : 'Edit'}
          </UIButton>
          <UIButton
            type="primary"
            icon={<UIIcon name="SaveOutlined" />}
            onClick={handleSave}
            loading={saveMutation.isPending}
            disabled={!hasUnsavedChanges}
          >
            Save
          </UIButton>
        </UISpace>
      }
    >
      {hasUnsavedChanges && (
        <UIAlert
          message="Unsaved changes"
          description="Don't forget to save your changes before closing this tab."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <UIRow gutter={16}>
        <UICol span={editMode ? 12 : 24}>
          {editMode ? (
            <div>
              <UITitle level={5}>Editor</UITitle>
              <TextArea
                value={markdown}
                onChange={handleMarkdownChange}
                rows={20}
                style={{ fontFamily: 'monospace', fontSize: 14 }}
                placeholder="Write your changelog in Markdown..."
              />
            </div>
          ) : (
            <MarkdownViewer>{markdown}</MarkdownViewer>
          )}
        </UICol>
        {editMode && (
          <UICol span={12}>
            <UITitle level={5}>Preview</UITitle>
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                minHeight: 400,
                maxHeight: 600,
                overflow: 'auto',
              }}
            >
              <MarkdownViewer>{markdown}</MarkdownViewer>
            </div>
          </UICol>
        )}
      </UIRow>
    </UICard>
  );
}
