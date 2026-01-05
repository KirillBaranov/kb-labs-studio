/**
 * @module @kb-labs/studio-app/modules/release/components/changelog-tab
 * Changelog Tab - Live markdown editor with preview
 */

import { useState, useEffect } from 'react';
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
  Alert,
  Checkbox,
} from 'antd';
import {
  ThunderboltOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseChangelog,
  useGenerateChangelog,
  useSaveChangelog,
} from '@kb-labs/studio-data-client';
import { MarkdownViewer } from '@/components/markdown';

const { TextArea } = Input;
const { Title } = Typography;

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
      message.success(`${method} changelog generated successfully${tokensInfo}`);
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
      message.success('Changelog saved successfully');
    } catch (error) {
      message.error(`Failed to save changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setHasUnsavedChanges(true);
  };

  if (!selectedScope) {
    return <Empty description="Please select a scope to continue" style={{ marginTop: 48 }} />;
  }

  if (changelogLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No changelog exists
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
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git commits and generate a detailed changelog'
                : 'Generate a simple changelog from package versions'}
            </div>
          </Space>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Changelog
          </Title>
          {hasUnsavedChanges && (
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>● Unsaved changes</span>
          )}
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
          >
            Regenerate
          </Button>
          <Button
            icon={editMode ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Preview' : 'Edit'}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saveMutation.isPending}
            disabled={!hasUnsavedChanges}
          >
            Save
          </Button>
        </Space>
      }
    >
      {hasUnsavedChanges && (
        <Alert
          message="Unsaved changes"
          description="Don't forget to save your changes before closing this tab."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16}>
        <Col span={editMode ? 12 : 24}>
          {editMode ? (
            <div>
              <Title level={5}>Editor</Title>
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
        </Col>
        {editMode && (
          <Col span={12}>
            <Title level={5}>Preview</Title>
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
          </Col>
        )}
      </Row>
    </Card>
  );
}
