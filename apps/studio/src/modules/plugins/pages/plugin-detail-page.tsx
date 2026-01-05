import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Spin,
  Descriptions,
  Tag,
  Space,
  Typography,
  Card,
  Table,
  Collapse,
  Button,
  Alert,
  Tabs,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  CodeOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LockOutlined,
  LinkOutlined,
  UserOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  ConsoleSqlOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import type { PluginManifestEntry } from '@kb-labs/studio-data-client';
import type { ColumnsType } from 'antd/es/table';
import { PluginAIAssistantModal } from '../components/plugin-ai-assistant-modal';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Helper to safely render schema objects
function renderSchema(schema: any): string {
  if (!schema) return '—';
  if (typeof schema === 'string') return schema;
  if (typeof schema === 'object') {
    if ('$ref' in schema) return schema.$ref;
    if ('zod' in schema) return schema.zod;
    return JSON.stringify(schema);
  }
  return String(schema);
}

export function PluginDetailPage() {
  const { pluginId: encodedPluginId } = useParams<{ pluginId: string }>();
  const navigate = useNavigate();
  const { plugins: pluginsSource } = useDataSources();
  const [loading, setLoading] = useState(true);
  const [plugin, setPlugin] = useState<PluginManifestEntry | null>(null);
  const [apiBasePath, setApiBasePath] = useState<string>('');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Decode plugin ID from URL
  const pluginId = encodedPluginId ? decodeURIComponent(encodedPluginId) : '';

  useEffect(() => {
    loadPlugin();
  }, [pluginId, pluginsSource]);

  const loadPlugin = async () => {
    try {
      setLoading(true);
      const result = await pluginsSource.getPlugins();
      const found = result.manifests.find((p) => p.pluginId === pluginId);
      setPlugin(found || null);
      setApiBasePath(result.apiBasePath || '');
    } catch (err) {
      console.error('Failed to load plugin:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <KBPageContainer>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      </KBPageContainer>
    );
  }

  if (!plugin) {
    return (
      <KBPageContainer>
        <KBPageHeader title="Plugin Not Found" />
        <Empty description="Plugin not found in registry" />
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" onClick={() => navigate('/plugins')}>
            Back to Plugins
          </Button>
        </div>
      </KBPageContainer>
    );
  }

  const { manifest } = plugin;
  const display = manifest.display;

  const cliCommands = manifest.cli?.commands || [];
  const restRoutes = manifest.rest?.routes || [];
  const workflowHandlers = manifest.workflows?.handlers || [];
  const jobs = manifest.jobs || [];
  const permissions = manifest.permissions;
  const platformReqs = manifest.platform;

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Plugin Header Card */}
          <Card>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Icon + Name + Version */}
              <Space align="start" size="large">
                <div style={{ fontSize: 64, lineHeight: 1 }}>{display?.icon || '📦'}</div>
                <div style={{ flex: 1 }}>
                  <Title level={2} style={{ marginBottom: 4 }}>
                    {display?.name || manifest.id}
                  </Title>
                  <Space size="middle">
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      v{manifest.version}
                    </Text>
                    <Tag color="blue">
                      {typeof plugin.source === 'string'
                        ? plugin.source
                        : plugin.source?.kind || 'unknown'}
                    </Tag>
                    <Tag>{manifest.schema}</Tag>
                  </Space>
                </div>
              </Space>

              {/* Description */}
              {display?.description && (
                <Paragraph style={{ fontSize: 15, marginBottom: 0, color: 'rgba(0,0,0,0.65)' }}>
                  {display.description}
                </Paragraph>
              )}

              {/* Tags */}
              {display?.tags && display.tags.length > 0 && (
                <Space wrap>
                  {display.tags.map((tag, idx) => (
                    <Tag key={typeof tag === 'string' ? tag : `tag-${idx}`} color="default">
                      {typeof tag === 'string' ? tag : JSON.stringify(tag)}
                    </Tag>
                  ))}
                </Space>
              )}

              {/* Metadata Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginTop: 8,
                }}
              >
                {display?.author && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Author
                    </Text>
                    <Space>
                      <UserOutlined />
                      <Text>{display.author}</Text>
                    </Space>
                  </div>
                )}
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Plugin ID
                  </Text>
                  <Text code copyable>
                    {manifest.id}
                  </Text>
                </div>
              </div>

              {/* Links */}
              {(display?.homepage || display?.repository) && (
                <Space size="large">
                  {display?.homepage && (
                    <a href={display.homepage} target="_blank" rel="noopener noreferrer">
                      <Space>
                        <GlobalOutlined />
                        Homepage
                      </Space>
                    </a>
                  )}
                  {display?.repository && (
                    <a href={display.repository} target="_blank" rel="noopener noreferrer">
                      <Space>
                        <LinkOutlined />
                        Repository
                      </Space>
                    </a>
                  )}
                </Space>
              )}

              {/* Timestamps */}
              {(plugin.discoveredAt || plugin.buildTimestamp) && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                  }}
                >
                  {plugin.discoveredAt && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Discovered At
                      </Text>
                      <Space>
                        <SearchOutlined />
                        <Text>{new Date(plugin.discoveredAt).toLocaleString()}</Text>
                      </Space>
                    </div>
                  )}
                  {plugin.buildTimestamp && (
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        Last Built
                      </Text>
                      <Space>
                        <ClockCircleOutlined />
                        <Text>{new Date(plugin.buildTimestamp).toLocaleString()}</Text>
                      </Space>
                    </div>
                  )}
                </div>
              )}

              {/* Plugin Root (collapsible) */}
              <Collapse
                ghost
                items={[
                  {
                    key: 'root',
                    label: <Text type="secondary">Plugin Root Path</Text>,
                    children: (
                      <Text code copyable style={{ fontSize: 12 }}>
                        {plugin.pluginRoot}
                      </Text>
                    ),
                  },
                ]}
              />
            </Space>
          </Card>

          {/* Capabilities Summary */}
          <Card title="Capabilities">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space wrap size="large">
                {cliCommands.length > 0 && (
                  <div>
                    <Tag icon={<CodeOutlined />} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {cliCommands.length} CLI Command{cliCommands.length > 1 ? 's' : ''}
                    </Tag>
                  </div>
                )}
                {restRoutes.length > 0 && (
                  <div>
                    <Tag icon={<ApiOutlined />} color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {restRoutes.length} REST Route{restRoutes.length > 1 ? 's' : ''}
                    </Tag>
                  </div>
                )}
                {workflowHandlers.length > 0 && (
                  <div>
                    <Tag icon={<NodeIndexOutlined />} color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {workflowHandlers.length} Workflow{workflowHandlers.length > 1 ? 's' : ''}
                    </Tag>
                  </div>
                )}
                {jobs.length > 0 && (
                  <div>
                    <Tag icon={<ClockCircleOutlined />} color="orange" style={{ fontSize: 14, padding: '4px 12px' }}>
                      {jobs.length} Scheduled Job{jobs.length > 1 ? 's' : ''}
                    </Tag>
                  </div>
                )}
              </Space>

              {permissions && (
                <Alert
                  icon={<LockOutlined />}
                  type="warning"
                  message="This plugin requires permissions"
                  description="See Permissions tab for details"
                  showIcon
                />
              )}
              {platformReqs?.requires && platformReqs.requires.length > 0 && (
                <Alert
                  icon={<DatabaseOutlined />}
                  type="info"
                  message="Platform Requirements"
                  description={
                    <Space wrap>
                      {platformReqs.requires.map((req) => (
                        <Tag key={req} color="cyan">
                          {req}
                        </Tag>
                      ))}
                    </Space>
                  }
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Space>
      ),
    },
    cliCommands.length > 0 && {
      key: 'cli',
      label: (
        <span>
          <CodeOutlined /> CLI Commands ({cliCommands.length})
        </span>
      ),
      children: <CLICommandsTable commands={cliCommands} />,
    },
    restRoutes.length > 0 && {
      key: 'rest',
      label: (
        <span>
          <ApiOutlined /> REST API ({restRoutes.length})
        </span>
      ),
      children: <RestRoutesTable routes={restRoutes} basePath={manifest.rest?.basePath} apiBasePath={apiBasePath} />,
    },
    workflowHandlers.length > 0 && {
      key: 'workflows',
      label: (
        <span>
          <NodeIndexOutlined /> Workflows ({workflowHandlers.length})
        </span>
      ),
      children: <WorkflowsTable handlers={workflowHandlers} />,
    },
    jobs.length > 0 && {
      key: 'jobs',
      label: (
        <span>
          <ClockCircleOutlined /> Jobs ({jobs.length})
        </span>
      ),
      children: <JobsTable jobs={jobs} />,
    },
    permissions && {
      key: 'permissions',
      label: (
        <span>
          <LockOutlined /> Permissions
        </span>
      ),
      children: <PermissionsView permissions={permissions} />,
    },
    {
      key: 'manifest',
      label: 'Raw Manifest (JSON)',
      children: (
        <Card>
          <pre style={{ overflow: 'auto', maxHeight: 600 }}>
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </Card>
      ),
    },
  ].filter(Boolean);

  const handleAskAI = async (question: string) => {
    if (!pluginId) {
      throw new Error('Plugin ID is required');
    }
    return pluginsSource.askAboutPlugin(pluginId, { question });
  };

  return (
    <KBPageContainer>
      <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/plugins')}
          type="text"
        >
          Back to Plugins
        </Button>
        <Button
          icon={<QuestionCircleOutlined />}
          onClick={() => setAiModalOpen(true)}
          type="primary"
        >
          AI Assistant
        </Button>
      </Space>

      <Tabs items={tabItems as any} defaultActiveKey="overview" />

      <PluginAIAssistantModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        pluginId={pluginId}
        pluginName={display?.name || manifest.id}
        onAsk={handleAskAI}
      />
    </KBPageContainer>
  );
}

// Sub-components for different sections

function CLICommandsTable({ commands }: { commands: any[] }) {
  const columns: ColumnsType<any> = [
    {
      title: 'Command',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div>
          <Text code strong>
            {record.group ? `${record.group}:${id}` : id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'describe',
      key: 'describe',
      render: (desc) => (typeof desc === 'string' ? desc : desc ? JSON.stringify(desc) : '—'),
    },
    {
      title: 'Flags',
      dataIndex: 'flags',
      key: 'flags',
      render: (flags) =>
        flags?.length > 0 ? (
          <Space wrap>
            {flags.map((flag: any) => (
              <Tag key={flag.name}>
                --{flag.name}
                {flag.required && <Text type="danger">*</Text>}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">None</Text>
        ),
    },
    {
      title: 'Handler',
      dataIndex: 'handler',
      key: 'handler',
      render: (handler) => (
        <Text code style={{ fontSize: 11 }}>
          {handler}
        </Text>
      ),
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={commands}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) =>
            record.flags && record.flags.length > 0 ? (
              <div style={{ margin: 0, paddingLeft: 48 }}>
                <Title level={5}>Flags</Title>
                {record.flags.map((flag: any) => (
                  <div key={flag.name} style={{ marginBottom: 8 }}>
                    <Text code>--{flag.name}</Text>
                    {flag.alias && <Text type="secondary"> (-{flag.alias})</Text>}
                    {flag.required && <Tag color="red">Required</Tag>}
                    <Tag>{flag.type}</Tag>
                    {flag.default !== undefined && (
                      <Tag color="blue">
                        Default: {typeof flag.default === 'object' ? JSON.stringify(flag.default) : String(flag.default)}
                      </Tag>
                    )}
                    {flag.choices && flag.choices.length > 0 && (
                      <Tag color="cyan">
                        Choices: {flag.choices.join(', ')}
                      </Tag>
                    )}
                    <div>
                      <Text type="secondary">{flag.description || '—'}</Text>
                    </div>
                  </div>
                ))}
              </div>
            ) : null,
        }}
      />
    </Card>
  );
}

function RestRoutesTable({ routes, basePath, apiBasePath }: { routes: any[]; basePath?: string; apiBasePath?: string }) {
  // Combine API base path with plugin base path, avoiding duplicate /v1
  const fullBasePath = apiBasePath && basePath
    ? basePath.startsWith('/v1')
      ? apiBasePath + basePath.slice(3) // Remove /v1 from plugin basePath if API already has /api/v1
      : apiBasePath + basePath
    : basePath || '';
  const columns: ColumnsType<any> = [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => {
        const colors: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          PATCH: 'purple',
          DELETE: 'red',
        };
        return <Tag color={colors[method] || 'default'}>{method}</Tag>;
      },
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      render: (path) => (
        <Text code>
          {fullBasePath}{path}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => (typeof desc === 'string' ? desc : desc ? JSON.stringify(desc) : '—'),
    },
    {
      title: 'Timeout',
      dataIndex: 'timeoutMs',
      key: 'timeoutMs',
      render: (timeout) => (timeout ? `${timeout}ms` : '—'),
    },
    {
      title: 'Handler',
      dataIndex: 'handler',
      key: 'handler',
      render: (handler) => (
        <Text code style={{ fontSize: 11 }}>
          {handler}
        </Text>
      ),
    },
  ];

  const formatSchemaRef = (schema: any): string => {
    if (!schema) return '—';
    if (typeof schema === 'string') return schema;
    if ('$ref' in schema) return schema.$ref;
    if ('zod' in schema) return schema.zod;
    return JSON.stringify(schema);
  };

  return (
    <Card>
      {fullBasePath && (
        <Alert
          message={
            <span>
              Base Path: <Text code>{fullBasePath}</Text>
            </span>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}
      <Table
        columns={columns}
        dataSource={routes}
        rowKey={(record) => `${record.method} ${record.path}`}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => {
            const hasInput = record.input;
            const hasOutput = record.output;
            const hasErrors = record.errors && record.errors.length > 0;

            if (!hasInput && !hasOutput && !hasErrors) return null;

            return (
              <div style={{ margin: 0, paddingLeft: 48 }}>
                {hasInput && (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>
                      {record.method === 'GET' ? 'Query Parameters' : 'Request Body'}
                    </Title>
                    <Text code>{formatSchemaRef(record.input)}</Text>
                  </div>
                )}
                {hasOutput && (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Response</Title>
                    <Text code>{formatSchemaRef(record.output)}</Text>
                  </div>
                )}
                {hasErrors && (
                  <div>
                    <Title level={5}>Error Responses</Title>
                    {record.errors.map((error: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <Tag color="red">{error.code}</Tag>
                        <Text>{error.message || '—'}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          },
          rowExpandable: (record) => !!(record.input || record.output || (record.errors && record.errors.length > 0)),
        }}
      />
    </Card>
  );
}

function WorkflowsTable({ handlers }: { handlers: any[] }) {
  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'describe',
      key: 'describe',
      render: (desc) => (typeof desc === 'string' ? desc : desc ? JSON.stringify(desc) : '—'),
    },
    {
      title: 'Handler',
      dataIndex: 'handler',
      key: 'handler',
      render: (handler) => (
        <Text code style={{ fontSize: 11 }}>
          {handler}
        </Text>
      ),
    },
  ];

  return (
    <Card>
      <Table columns={columns} dataSource={handlers} rowKey="id" pagination={false} />
    </Card>
  );
}

function JobsTable({ jobs }: { jobs: any[] }) {
  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'describe',
      key: 'describe',
      render: (desc) => (typeof desc === 'string' ? desc : desc ? JSON.stringify(desc) : '—'),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) => (schedule ? <Tag color="orange">{schedule}</Tag> : <Text type="secondary">Manual</Text>),
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) =>
        enabled !== false ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => priority || 5,
    },
    {
      title: 'Handler',
      dataIndex: 'handler',
      key: 'handler',
      render: (handler) => (
        <Text code style={{ fontSize: 11 }}>
          {handler}
        </Text>
      ),
    },
  ];

  return (
    <Card>
      <Table columns={columns} dataSource={jobs} rowKey="id" pagination={false} />
    </Card>
  );
}

function PermissionsView({ permissions }: { permissions: any }) {
  if (!permissions) {
    return (
      <Card>
        <Empty description="No permissions specified for this plugin" />
      </Card>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Filesystem Permissions */}
      {permissions.fs && (
        <Card
          title={
            <Space>
              <LockOutlined />
              <span>Filesystem Permissions</span>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            File and directory access patterns that this plugin is allowed to use. Read access allows viewing files, write access allows creating or modifying files.
          </Paragraph>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {permissions.fs.read && permissions.fs.read.length > 0 && (
              <div>
                <Text strong>Read Access:</Text>
                <div style={{ marginTop: 8 }}>
                  {permissions.fs.read.map((path: string, idx: number) => (
                    <div key={idx} style={{ marginBottom: 4 }}>
                      <Text code style={{ fontSize: 12 }}>
                        {path}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {permissions.fs.write && permissions.fs.write.length > 0 && (
              <div>
                <Text strong>Write Access:</Text>
                <div style={{ marginTop: 8 }}>
                  {permissions.fs.write.map((path: string, idx: number) => (
                    <div key={idx} style={{ marginBottom: 4 }}>
                      <Text code style={{ fontSize: 12 }}>
                        {path}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* Network Permissions */}
      {permissions.network?.fetch && permissions.network.fetch.length > 0 && (
        <Card
          title={
            <Space>
              <GlobalOutlined />
              <span>Network Permissions</span>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            External hosts and APIs that this plugin can communicate with over the network.
          </Paragraph>
          <div>
            <Text strong>Allowed Hosts:</Text>
            <div style={{ marginTop: 8 }}>
              {permissions.network.fetch.map((host: string, idx: number) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <Text code style={{ fontSize: 12 }}>
                    {host}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Environment Variables */}
      {permissions.env?.read && permissions.env.read.length > 0 && (
        <Card title="Environment Variables">
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            System environment variables that this plugin can access. Used for configuration and secrets management.
          </Paragraph>
          <div>
            <Text strong>Read Access:</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {permissions.env.read.map((env: string, idx: number) => (
                  <Tag key={idx} color="cyan">
                    {env}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        </Card>
      )}

      {/* Shell Permissions */}
      {permissions.shell && (
        <Card
          title={
            <Space>
              <ConsoleSqlOutlined />
              <span>Shell Permissions</span>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Shell commands that this plugin is allowed to execute. Shell access is restricted by default for security.
          </Paragraph>
          {permissions.shell.allow && permissions.shell.allow.length > 0 ? (
            <div>
              <Text strong>Allowed Commands:</Text>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {permissions.shell.allow.map((cmd: string, idx: number) => (
                    <div key={idx} style={{ marginBottom: 4 }}>
                      <Text code style={{ fontSize: 12 }}>
                        {cmd}
                      </Text>
                    </div>
                  ))}
                </Space>
              </div>
            </div>
          ) : (
            <Alert
              type="warning"
              message="Shell access disabled"
              description="This plugin has no shell execution permissions."
              showIcon
            />
          )}
        </Card>
      )}

      {/* Platform Services */}
      {permissions.platform && (
        <Card
          title={
            <Space>
              <DatabaseOutlined />
              <span>Platform Services</span>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Access to KB Labs platform services like LLM, vector store, cache, and analytics.
          </Paragraph>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
              }}
            >
              {/* LLM Service */}
              {permissions.platform.llm !== undefined && (
                <Card size="small">
                  <Space direction="vertical" size="small">
                    <Space>
                      {permissions.platform.llm ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <WarningOutlined style={{ color: '#d9d9d9' }} />
                      )}
                      <Text strong>LLM Service</Text>
                    </Space>
                    {typeof permissions.platform.llm === 'object' && permissions.platform.llm.models && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Models:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Space wrap size="small">
                            {permissions.platform.llm.models.map((model: string, idx: number) => (
                              <Tag key={idx} color="blue" style={{ fontSize: 11 }}>
                                {model}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              )}

              {/* Vector Store */}
              {permissions.platform.vectorStore !== undefined && (
                <Card size="small">
                  <Space direction="vertical" size="small">
                    <Space>
                      {permissions.platform.vectorStore ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <WarningOutlined style={{ color: '#d9d9d9' }} />
                      )}
                      <Text strong>Vector Store</Text>
                    </Space>
                    {typeof permissions.platform.vectorStore === 'object' && permissions.platform.vectorStore.collections && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Collections:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Space wrap size="small">
                            {permissions.platform.vectorStore.collections.map((col: string, idx: number) => (
                              <Tag key={idx} color="purple" style={{ fontSize: 11 }}>
                                {col}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              )}

              {/* Cache */}
              {permissions.platform.cache !== undefined && (
                <Card size="small">
                  <Space direction="vertical" size="small">
                    <Space>
                      {permissions.platform.cache ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <WarningOutlined style={{ color: '#d9d9d9' }} />
                      )}
                      <Text strong>Cache</Text>
                    </Space>
                    {typeof permissions.platform.cache === 'object' && permissions.platform.cache.namespaces && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Namespaces:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Space wrap size="small">
                            {permissions.platform.cache.namespaces.map((ns: string, idx: number) => (
                              <Tag key={idx} color="cyan" style={{ fontSize: 11 }}>
                                {ns}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              )}

              {/* Storage */}
              {permissions.platform.storage !== undefined && (
                <Card size="small">
                  <Space direction="vertical" size="small">
                    <Space>
                      {permissions.platform.storage ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <WarningOutlined style={{ color: '#d9d9d9' }} />
                      )}
                      <Text strong>Storage</Text>
                    </Space>
                    {typeof permissions.platform.storage === 'object' && permissions.platform.storage.paths && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Paths:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Space wrap size="small">
                            {permissions.platform.storage.paths.map((path: string, idx: number) => (
                              <Tag key={idx} color="orange" style={{ fontSize: 11 }}>
                                {path}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              )}

              {/* Analytics */}
              {permissions.platform.analytics !== undefined && (
                <Card size="small">
                  <Space>
                    {permissions.platform.analytics ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <WarningOutlined style={{ color: '#d9d9d9' }} />
                    )}
                    <Text strong>Analytics</Text>
                  </Space>
                </Card>
              )}

              {/* Embeddings */}
              {permissions.platform.embeddings !== undefined && (
                <Card size="small">
                  <Space>
                    {permissions.platform.embeddings ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <WarningOutlined style={{ color: '#d9d9d9' }} />
                    )}
                    <Text strong>Embeddings</Text>
                  </Space>
                </Card>
              )}

              {/* Events */}
              {permissions.platform.events !== undefined && (
                <Card size="small">
                  <Space direction="vertical" size="small">
                    <Space>
                      {permissions.platform.events ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <WarningOutlined style={{ color: '#d9d9d9' }} />
                      )}
                      <Text strong>Event Bus</Text>
                    </Space>
                    {typeof permissions.platform.events === 'object' && (
                      <div>
                        {permissions.platform.events.publish && permissions.platform.events.publish.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Publish:</Text>
                            <div style={{ marginTop: 4 }}>
                              <Space wrap size="small">
                                {permissions.platform.events.publish.map((evt: string, idx: number) => (
                                  <Tag key={idx} color="green" style={{ fontSize: 11 }}>
                                    {evt}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          </div>
                        )}
                        {permissions.platform.events.subscribe && permissions.platform.events.subscribe.length > 0 && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Subscribe:</Text>
                            <div style={{ marginTop: 4 }}>
                              <Space wrap size="small">
                                {permissions.platform.events.subscribe.map((evt: string, idx: number) => (
                                  <Tag key={idx} color="blue" style={{ fontSize: 11 }}>
                                    {evt}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Space>
                </Card>
              )}
            </div>
          </Space>
        </Card>
      )}

      {/* Quotas */}
      {permissions.quotas && (
        <Card title="Resource Quotas">
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Maximum resource limits for this plugin to prevent runaway processes and ensure system stability.
          </Paragraph>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {permissions.quotas.timeoutMs && (
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Timeout
                  </Text>
                  <Text strong style={{ fontSize: 20 }}>
                    {permissions.quotas.timeoutMs}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ms
                  </Text>
                </div>
              </Card>
            )}
            {permissions.quotas.memoryMb && (
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Memory
                  </Text>
                  <Text strong style={{ fontSize: 20 }}>
                    {permissions.quotas.memoryMb}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    MB
                  </Text>
                </div>
              </Card>
            )}
            {permissions.quotas.cpuMs && (
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    CPU Time
                  </Text>
                  <Text strong style={{ fontSize: 20 }}>
                    {permissions.quotas.cpuMs}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ms
                  </Text>
                </div>
              </Card>
            )}
          </div>
        </Card>
      )}
    </Space>
  );
}
