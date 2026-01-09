/**
 * @module @kb-labs/studio-app/modules/release/components/steps/changelog-step
 * Step 2: Generate and edit changelog
 */

import * as React from 'react';
import {
  Button,
  Card,
  Empty,
  Spin,
  Space,
  message,
  Input,
  Row,
  Col,
  Typography,
  Checkbox,
  Tag,
} from 'antd';
import {
  ThunderboltOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseChangelog,
  useGenerateChangelog,
  useSaveChangelog,
} from '@kb-labs/studio-data-client';
import { MarkdownViewer } from '@/components/markdown';

const { TextArea } = Input;
const { Text } = Typography;

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
      message.success(`${method} changelog generated${tokensInfo}`);
    } catch (error) {
      message.error(`Failed to generate changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        scope: selectedScope,
        markdown,
      });
      setHasUnsavedChanges(false);
      message.success('Changelog saved');
    } catch (error) {
      message.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setHasUnsavedChanges(true);
  };

  if (changelogLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No changelog exists - show generate UI
  if (!changelogData?.markdown && !markdown) {
    return (
      <Card>
        <Empty
          description="No changelog generated yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)}>
              Use AI-powered generation (requires LLM)
            </Checkbox>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
              size="large"
            >
              Generate Changelog
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git commits and generate a detailed changelog'
                : 'Generate a simple changelog from package versions'}
            </Text>
          </Space>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          {hasUnsavedChanges ? (
            <Tag color="warning">Unsaved</Tag>
          ) : (
            <>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Tag color="success">Saved</Tag>
            </>
          )}
          <span>Changelog</span>
        </Space>
      }
      extra={
        <Space>
          <Checkbox
            checked={useLLM}
            onChange={(e) => setUseLLM(e.target.checked)}
            style={{ fontSize: 12 }}
          >
            Use AI
          </Checkbox>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            size="small"
          >
            Regenerate
          </Button>
          <Button
            icon={editMode ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => setEditMode(!editMode)}
            size="small"
          >
            {editMode ? 'Preview' : 'Edit'}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saveMutation.isPending}
            disabled={!hasUnsavedChanges}
            size="small"
          >
            Save
          </Button>
        </Space>
      }
    >
      <Row gutter={16}>
        <Col span={editMode ? 12 : 24}>
          {editMode ? (
            <TextArea
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
        </Col>
        {editMode && (
          <Col span={12}>
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
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
                Preview
              </Text>
              <MarkdownViewer>{markdown}</MarkdownViewer>
            </div>
          </Col>
        )}
      </Row>

      {hasUnsavedChanges && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="warning" style={{ fontSize: 12 }}>
            Save changelog to proceed to the next step
          </Text>
        </div>
      )}
    </Card>
  );
}
