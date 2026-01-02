import React, { useState } from 'react';
import { Card, Input, Button, Alert, Tag, Divider, Typography } from 'antd';
import { Send, FileText } from 'lucide-react';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';

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
  timestamp: Date;
}

// Mock messages for UI preview
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'How do I create a new plugin?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '2',
    role: 'assistant',
    content: `To create a new plugin in KB Labs, you can use the plugin template system. Here's how:

1. Run the plugin creation command:
   \`\`\`bash
   pnpm kb plugins:create --name my-plugin
   \`\`\`

2. This will scaffold a new plugin with:
   - Plugin manifest (manifest.json)
   - CLI commands structure
   - Widget templates
   - Build configuration

3. Implement your plugin logic in \`src/commands/\`

4. Register commands and widgets in the manifest

The plugin system uses the adapter pattern to integrate with the KB Labs platform.`,
    sources: [
      {
        file: 'kb-labs-plugin/packages/plugin-core/README.md',
        lines: [42, 68],
        snippet: '## Creating a Plugin\n\nPlugins are created using the plugin template...',
      },
      {
        file: 'kb-labs-plugin/packages/plugin-manifest/src/types.ts',
        lines: [12, 34],
        snippet: 'export interface PluginManifest {\n  pluginId: string;\n  displayName: string;...',
      },
    ],
    timestamp: new Date(Date.now() - 55000),
  },
];

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) {return;}

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate assistant response (will be replaced with real API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a UI mockup. Backend integration coming soon!',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <KBPageContainer>
      <KBPageHeader
        title="AI Platform Assistant"
        description="Ask questions about KB Labs platform"
      />

      {/* Development Alert */}
      <Alert
        message="🚧 Feature in Development"
        description="This is a UI preview. Backend integration with Mind RAG and LLM streaming is coming soon."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        closable
      />

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
            onClick={() => setInput('What is Mind RAG?')}
          >
            Mind RAG
          </Tag>
          <Tag
            color="green"
            style={{ cursor: 'pointer' }}
            onClick={() => setInput('How to use DevKit?')}
          >
            DevKit usage
          </Tag>
          <Tag
            color="orange"
            style={{ cursor: 'pointer' }}
            onClick={() => setInput('Setup analytics adapter')}
          >
            Analytics setup
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
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--ant-color-primary)',
                  animation: 'pulse 1.4s infinite',
                }}
              />
              <Text type="secondary">Thinking...</Text>
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
            disabled={isLoading}
            enterButton={
              <Button
                type="primary"
                icon={<Send size={16} />}
                loading={isLoading}
              >
                Send
              </Button>
            }
          />
        </div>
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </KBPageContainer>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 12,
        marginBottom: 16,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: isUser ? '#1890ff' : '#52c41a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: isUser ? 12 : 18,
          flexShrink: 0,
        }}
      >
        {isUser ? 'You' : '🤖'}
      </div>

      {/* Message Content */}
      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Bubble */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 16,
            backgroundColor: isUser ? '#e6f4ff' : '#f5f5f5',
            border: '1px solid',
            borderColor: isUser ? '#91caff' : '#d9d9d9',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <Paragraph
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              color: '#262626',
              fontSize: 14,
              lineHeight: '1.6',
            }}
          >
            {message.content}
          </Paragraph>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <Card
            size="small"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <FileText size={14} />
              <Text strong style={{ fontSize: 12 }}>
                Sources ({message.sources.length})
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {message.sources.map((source, i) => (
                <div key={i}>
                  <Text
                    code
                    style={{
                      fontSize: 11,
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    {source.file}:{source.lines[0]}-{source.lines[1]}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      display: 'block',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {source.snippet.slice(0, 150)}...
                  </Text>
                  {i < message.sources!.length - 1 && (
                    <Divider style={{ margin: '8px 0' }} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Timestamp */}
        <Text
          type="secondary"
          style={{
            fontSize: 11,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {message.timestamp.toLocaleTimeString()}
        </Text>
      </div>
    </div>
  );
}
