/**
 * @module @kb-labs/studio-app/modules/release/components/steps/changelog-step
 * Step 2: Generate and edit changelog
 */

import * as React from 'react';
import {
  UIButton,
  UICard,
  UIEmptyState,
  UISpin,
  UISpace,
  UIMessage,
  UIInputTextArea,
  UIRow,
  UICol,
  UITypographyText,
  UICheckbox,
  UITag,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseChangelog,
  useGenerateChangelog,
  useSaveChangelog,
} from '@kb-labs/studio-data-client';
import { MarkdownViewer } from '@/components/markdown';


interface ChangelogStepProps {
  selectedScope: string;
  onChangelogReady: (ready: boolean) => void;
}

export function ChangelogStep({ selectedScope, onChangelogReady }: ChangelogStepProps) {
  const sources = useDataSources();
  // Default to edit mode when changelog exists (split-view: editor left, preview right)
  const [editMode, setEditMode] = React.useState(true);
  const [markdown, setMarkdown] = React.useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [useLLM, setUseLLM] = React.useState(true);

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
  React.useEffect(() => {
    if (changelogData?.markdown) {
      setMarkdown(changelogData.markdown);
      setHasUnsavedChanges(false);
    } else {
      setMarkdown('');
      setHasUnsavedChanges(false);
    }
  }, [changelogData]);

  // Update parent when changelog is ready (saved and has content)
  React.useEffect(() => {
    const hasChangelog = !!(markdown && !hasUnsavedChanges);
    onChangelogReady(hasChangelog);
  }, [markdown, hasUnsavedChanges, onChangelogReady]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        scope: selectedScope,
        useLLM,
      });
      setMarkdown(result.markdown);
      setHasUnsavedChanges(true);
      const tokensInfo = result.tokensUsed ? ` (${result.tokensUsed} tokens)` : '';
      const method = useLLM ? 'AI-powered' : 'Simple';
      UIMessage.success(`${method} changelog generated${tokensInfo}`);
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
      UIMessage.success('Changelog saved');
    } catch (error) {
      UIMessage.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setHasUnsavedChanges(true);
  };

  if (changelogLoading) {
    return <UISpin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No changelog exists - show generate UI
  if (!changelogData?.markdown && !markdown) {
    return (
      <UICard>
        <UIEmptyState
          description="No changelog generated yet"
          image={UIEmptyState.PRESENTED_IMAGE_SIMPLE}
        >
          <UISpace direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <UICheckbox checked={useLLM} onChange={(checked) => setUseLLM(checked)}>
              Use AI-powered generation (requires LLM)
            </UICheckbox>
            <UIButton
              variant="primary"
              icon={<UIIcon name="ThunderboltOutlined" />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
              size="large"
            >
              Generate Changelog
            </UIButton>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git commits and generate a detailed changelog'
                : 'Generate a simple changelog from package versions'}
            </UITypographyText>
          </UISpace>
        </UIEmptyState>
      </UICard>
    );
  }

  return (
    <UICard
      title={
        <UISpace>
          {hasUnsavedChanges ? (
            <UITag color="warning">Unsaved</UITag>
          ) : (
            <>
              <UIIcon name="CheckCircleOutlined" style={{ color: '#52c41a' }} />
              <UITag color="success">Saved</UITag>
            </>
          )}
          <span>Changelog</span>
        </UISpace>
      }
      extra={
        <UISpace>
          <UICheckbox
            checked={useLLM}
            onChange={(checked) => setUseLLM(checked)}
          >
            Use AI
          </UICheckbox>
          <UIButton
            icon={<UIIcon name="ThunderboltOutlined" />}
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            size="small"
          >
            Regenerate
          </UIButton>
          <UIButton
            icon={editMode ? <UIIcon name="EyeOutlined" /> : <UIIcon name="EditOutlined" />}
            onClick={() => setEditMode(!editMode)}
            size="small"
          >
            {editMode ? 'Preview' : 'Edit'}
          </UIButton>
          <UIButton
            variant="primary"
            icon={<UIIcon name="SaveOutlined" />}
            onClick={handleSave}
            loading={saveMutation.isPending}
            disabled={!hasUnsavedChanges}
            size="small"
          >
            Save
          </UIButton>
        </UISpace>
      }
    >
      <UIRow gutter={16}>
        <UICol span={editMode ? 12 : 24}>
          {editMode ? (
            <UIInputTextArea
              value={markdown}
              onChange={handleMarkdownChange}
              rows={20}
              style={{ fontFamily: 'monospace', fontSize: 13, height: 450 }}
              placeholder="Write your changelog in Markdown..."
            />
          ) : (
            <div style={{ maxHeight: 500, overflow: 'auto' }}>
              <MarkdownViewer>{markdown}</MarkdownViewer>
            </div>
          )}
        </UICol>
        {editMode && (
          <UICol span={12}>
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                height: 450,
                overflow: 'auto',
                padding: 12,
                background: '#fafafa',
              }}
            >
              <UITypographyText type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                Preview
              </UITypographyText>
              <MarkdownViewer>{markdown}</MarkdownViewer>
            </div>
          </UICol>
        )}
      </UIRow>

      {hasUnsavedChanges && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <UITypographyText type="warning" style={{ fontSize: 12 }}>
            Save changelog to proceed to the next step
          </UITypographyText>
        </div>
      )}
    </UICard>
  );
}
