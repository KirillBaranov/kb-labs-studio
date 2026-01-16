import React, { useState } from 'react';
import { Card, Input, Button, Tag, Divider, Typography, Select, Spin } from 'antd';
import { Send, FileText, Bot, Zap } from 'lucide-react';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useAgentsList, useAgentRun } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { RunAgentResponse } from '@kb-labs/agent-contracts';
import { MarkdownViewer } from '../../../components/markdown/markdown-viewer';
import './assistant-page.css';

const { Text, Paragraph } = Typography;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    file: string;
    lines: [number, number];
    snippet: string;
  }>;
  stats?: {
    steps: number;
    totalTokens: number;
    durationMs: number;
    toolsUsed?: string[];
  };
  timestamp: Date;
}

export function AssistantPage() {
  const dataSources = useDataSources();
  console.log('[AssistantPage] dataSources:', dataSources);
  console.log('[AssistantPage] agentSource:', dataSources.agent);

  const { data: agentsData, isLoading: agentsLoading } = useAgentsList(dataSources.agent);
  const agentMutation = useAgentRun(dataSources.agent);

  const [selectedAgentId, setSelectedAgentId] = useState<string>('mind-assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId) {return;}

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // Execute agent
    try {
      console.log('[AssistantPage] Executing agent:', { agentId: selectedAgentId, task: userInput });
      const result = await agentMutation.mutateAsync({
        agentId: selectedAgentId,
        task: userInput,
      });
      console.log('[AssistantPage] Agent result:', result);

      // Add assistant response
      if (result.success) {
        const successResult = result as RunAgentResponse;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: successResult.result,
          stats: successResult.stats,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Error response
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${result.error.message}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Failed to execute agent: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const selectedAgent = agentsData?.agents.find((a) => a.id === selectedAgentId);

  return (
    <KBPageContainer>
      <KBPageHeader
        title="AI Platform Assistant"
        description="Ask questions about KB Labs platform using autonomous agents"
      />

      {/* Agent Selector */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={16} />
            <Text strong>Agent:</Text>
          </div>
          <Select
            value={selectedAgentId}
            onChange={setSelectedAgentId}
            loading={agentsLoading}
            style={{ minWidth: 200 }}
            disabled={agentMutation.isPending}
          >
            {agentsData?.agents.map((agent) => (
              <Select.Option key={agent.id} value={agent.id}>
                {agent.name}
              </Select.Option>
            ))}
          </Select>
          {selectedAgent && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selectedAgent.description}
            </Text>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Text type="secondary" style={{ marginRight: 8 }}>💡 Quick questions:</Text>
          <Tag
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => setInput('How do I create a workflow?')}
          >
            Create workflow
          </Tag>
          <Tag
            color="purple"
            style={{ cursor: 'pointer' }}
            onClick={() => setInput('What is Mind RAG and how does it work?')}
          >
            Mind RAG
          </Tag>
          <Tag
            color="green"
            style={{ cursor: 'pointer' }}
            onClick={() => setInput('How to use DevKit tools?')}
          >
            DevKit usage
          </Tag>
          <Tag
            color="orange"
            style={{ cursor: 'pointer' }}
            onClick={() => setInput('Show me the plugin architecture')}
          >
            Plugin architecture
          </Tag>
        </div>
      </Card>

      {/* Chat Container */}
      <Card
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
        bodyStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          minHeight: 0,
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Bot size={48} style={{ color: 'var(--ant-color-text-secondary)', marginBottom: 16 }} />
              <Text type="secondary">
                Select an agent and ask a question to get started
              </Text>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {agentMutation.isPending && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0' }}>
              <Spin size="small" />
              <Text type="secondary">Agent is thinking...</Text>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-primary)',
          }}
        >
          <Input.Search
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSearch={handleSend}
            placeholder="Ask about KB Labs platform..."
            size="large"
            disabled={agentMutation.isPending}
            enterButton={
              <Button
                type="primary"
                icon={<Send size={16} />}
                loading={agentMutation.isPending}
              >
                Send
              </Button>
            }
          />
        </div>
      </Card>
    </KBPageContainer>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="user-message">
        <div className="user-message-bubble">
          <Paragraph className="user-message-text">
            {message.content}
          </Paragraph>
        </div>
      </div>
    );
  }

  // Agent message
  return (
    <div className="agent-message">
      <div className="agent-message-dot">
        <div className="agent-message-dot-circle" />
      </div>

      <div className="agent-message-content">
        <div className="agent-message-text">
          <MarkdownViewer>{message.content}</MarkdownViewer>
        </div>

        {message.stats && (
          <div className="agent-message-stats">
            <Text type="secondary" className="agent-message-stats-text">
              {message.stats.steps} steps
            </Text>
            <span className="agent-message-stats-dot">●</span>
            <Text type="secondary" className="agent-message-stats-text">
              {message.stats.totalTokens.toLocaleString()} tokens
            </Text>
            <span className="agent-message-stats-dot">●</span>
            <Text type="secondary" className="agent-message-stats-text">
              {(message.stats.durationMs / 1000).toFixed(1)}s
            </Text>
            {message.stats.toolsUsed && message.stats.toolsUsed.length > 0 && (
              <>
                <span className="agent-message-stats-dot">●</span>
                <Text type="secondary" className="agent-message-stats-text">
                  {message.stats.toolsUsed.join(', ')}
                </Text>
              </>
            )}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="agent-message-sources">
            <div className="agent-message-sources-header">
              <FileText size={11} color="#888" />
              <Text className="agent-message-sources-title">
                {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
              </Text>
            </div>
            <div className="agent-message-sources-list">
              {message.sources.map((source, i) => (
                <div key={i}>
                  <Text className="agent-message-source-file">
                    {source.file}:{source.lines[0]}-{source.lines[1]}
                  </Text>
                  <Text type="secondary" className="agent-message-source-snippet">
                    {source.snippet.slice(0, 100)}...
                  </Text>
                  {i < message.sources!.length - 1 && (
                    <Divider className="agent-message-source-divider" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
