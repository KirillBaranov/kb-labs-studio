/**
 * AI Assistant Modal for Plugin Inspector
 *
 * Allows users to ask questions about a plugin and get AI-generated answers
 * based on the plugin's manifest.
 */

import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Space,
  Typography,
  Card,
  Spin,
  Alert,
  Tag,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  QuestionCircleOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { PluginAskResponse } from '@kb-labs/studio-data-client';
import { MarkdownViewer } from '../../../components/markdown/markdown-viewer';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface PluginAIAssistantModalProps {
  open: boolean;
  onClose: () => void;
  pluginId: string;
  pluginName: string;
  onAsk: (question: string) => Promise<PluginAskResponse>;
}

interface QAItem {
  question: string;
  answer: string;
  timestamp: Date;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

const QUESTION_TEMPLATES = [
  { label: 'What permissions?', value: 'What permissions does this plugin need and why?' },
  { label: 'Show CLI commands', value: 'What CLI commands does this plugin provide? List them with their flags and usage.' },
  { label: 'Show REST APIs', value: 'What REST API endpoints does this plugin expose? Describe their paths, methods, and purpose.' },
  { label: 'What does it do?', value: 'What does this plugin do? Explain its main features and use cases.' },
  { label: 'How to configure?', value: 'How do I configure this plugin? What options are available?' },
  { label: 'What files created?', value: 'What files or directories does this plugin create or modify?' },
];

export function PluginAIAssistantModal({
  open,
  onClose,
  pluginId,
  pluginName,
  onAsk,
}: PluginAIAssistantModalProps) {
  const [customQuestion, setCustomQuestion] = useState('');
  const [history, setHistory] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await onAsk(question);

      setHistory((prev) => [
        {
          question,
          answer: response.answer,
          timestamp: new Date(),
          usage: response.usage,
        },
        ...prev,
      ]);
      setCustomQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (question: string) => {
    setCustomQuestion(question);
  };

  const handleSubmit = () => {
    handleAsk(customQuestion);
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined />
          <span>AI Assistant</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="ask"
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={loading}
          onClick={handleSubmit}
          disabled={!customQuestion.trim()}
        >
          Ask Question
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Plugin Preview */}
        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text type="secondary">Plugin:</Text>
              <div>
                <Text strong>{pluginName}</Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Plugin ID:</Text>
              <div>
                <Text code style={{ fontSize: 12 }}>{pluginId}</Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Quick Templates */}
        <div>
          <Text strong>Quick Questions:</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              {QUESTION_TEMPLATES.map((template) => (
                <Button
                  key={template.label}
                  size="small"
                  onClick={() => handleTemplateClick(template.value)}
                >
                  {template.label}
                </Button>
              ))}
            </Space>
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {/* Custom Question */}
        <div>
          <Text strong>Your Question:</Text>
          <TextArea
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask anything about this plugin... (e.g., 'How do I use this plugin?')"
            rows={3}
            style={{ marginTop: 8 }}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleSubmit();
              }
            }}
          />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            Press Ctrl/Cmd + Enter to ask
          </Text>
        </div>

        {/* Error Display */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            onClose={() => setError(null)}
            showIcon
          />
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin tip="AI is thinking..." size="large" />
          </div>
        )}

        {/* Q&A History */}
        {history.length > 0 && !loading && (
          <div>
            <Divider orientation="left" style={{ margin: '16px 0 8px 0' }}>
              <Text strong>Conversation History</Text>
            </Divider>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {history.map((item, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{
                    backgroundColor: '#fafafa',
                  }}
                >
                  {/* Question */}
                  <div style={{ marginBottom: 12 }}>
                    <Space style={{ marginBottom: 4 }}>
                      <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                      <Text strong>{item.question}</Text>
                    </Space>
                  </div>

                  {/* Answer */}
                  <div
                    style={{
                      background: '#fff',
                      padding: 12,
                      borderRadius: 4,
                      border: '1px solid #e8e8e8',
                      marginBottom: 8,
                    }}
                  >
                    <MarkdownViewer className="plugin-assistant-markdown">
                      {item.answer}
                    </MarkdownViewer>
                  </div>

                  {/* Metadata */}
                  <div style={{ textAlign: 'right' }}>
                    <Space size="small">
                      <Tag icon={<ClockCircleOutlined />} color="blue">
                        {item.timestamp.toLocaleTimeString()}
                      </Tag>
                      <Tag color="green">
                        {item.usage.promptTokens + item.usage.completionTokens} tokens
                      </Tag>
                    </Space>
                  </div>
                </Card>
              ))}
            </Space>
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 && !loading && (
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              backgroundColor: '#fafafa',
              borderRadius: 4,
              border: '1px dashed #d9d9d9',
            }}
          >
            <RobotOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div style={{ fontSize: 14, color: '#999' }}>
              Select a quick question or type your own to get started
            </div>
          </div>
        )}
      </Space>

      {/* Custom styles for markdown in modal context */}
      <style>{`
        .plugin-assistant-markdown {
          padding: 0;
          background: transparent;
          border-radius: 0;
        }
        .plugin-assistant-markdown p {
          margin: 0 0 8px 0;
        }
        .plugin-assistant-markdown p:last-child {
          margin-bottom: 0;
        }
        .plugin-assistant-markdown h1,
        .plugin-assistant-markdown h2,
        .plugin-assistant-markdown h3,
        .plugin-assistant-markdown h4 {
          margin-top: 12px;
          margin-bottom: 8px;
          font-size: 1em;
          font-weight: 600;
          border: none;
          padding: 0;
        }
        .plugin-assistant-markdown h1 {
          font-size: 1.15em;
        }
        .plugin-assistant-markdown h2 {
          font-size: 1.1em;
        }
        .plugin-assistant-markdown h3 {
          font-size: 1.05em;
        }
        .plugin-assistant-markdown ul,
        .plugin-assistant-markdown ol {
          margin: 8px 0;
          padding-left: 20px;
        }
        .plugin-assistant-markdown li {
          margin: 4px 0;
        }
        .plugin-assistant-markdown code {
          background: rgba(0, 0, 0, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
        }
        .plugin-assistant-markdown pre {
          background: #f5f5f5;
          padding: 12px 16px;
          border-radius: 6px;
          margin: 12px 0;
          overflow-x: auto;
        }
        .plugin-assistant-markdown pre code {
          background: none;
          padding: 0;
          font-size: 0.85em;
        }
        .plugin-assistant-markdown table {
          margin: 12px 0;
          font-size: 0.9em;
          width: 100%;
          border-collapse: collapse;
        }
        .plugin-assistant-markdown th,
        .plugin-assistant-markdown td {
          padding: 8px 12px;
          border: 1px solid #e8e8e8;
          text-align: left;
        }
        .plugin-assistant-markdown th {
          background: #fafafa;
          font-weight: 600;
        }
        .plugin-assistant-markdown blockquote {
          margin: 12px 0;
          padding: 8px 16px;
          border-left: 4px solid #1890ff;
          background: #f6f8fa;
          border-radius: 0 4px 4px 0;
        }
        .plugin-assistant-markdown strong {
          font-weight: 600;
        }
        .plugin-assistant-markdown a {
          color: #1890ff;
        }
        .plugin-assistant-markdown hr {
          margin: 16px 0;
          border: none;
          border-top: 1px solid #e8e8e8;
        }
      `}</style>
    </Modal>
  );
}
