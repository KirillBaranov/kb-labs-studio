import { Space, theme } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { UICard, UIText, UITag } from '@kb-labs/studio-ui-kit';

const { useToken } = theme;

interface PlatformServicesProps {
  permissions: any;
}

export function PlatformServices({ permissions }: PlatformServicesProps) {
  const { token } = useToken();

  return (
    <UICard
      title={
        <Space>
          <DatabaseOutlined />
          <span>Platform Services</span>
        </Space>
      }
    >
      <UIText color="secondary" style={{ marginBottom: 16, display: 'block' }}>
        Access to KB Labs platform services like LLM, vector store, cache, and analytics.
      </UIText>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {/* LLM Service */}
          {permissions.llm !== undefined && (
            <UICard size="small">
              <Space direction="vertical" size="small">
                <Space>
                  {permissions.llm ? (
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  ) : (
                    <WarningOutlined style={{ color: token.colorTextDisabled }} />
                  )}
                  <UIText weight="semibold">LLM Service</UIText>
                </Space>
                {typeof permissions.llm === 'object' && permissions.llm.models && (
                  <div>
                    <UIText color="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Models:
                    </UIText>
                    <div style={{ marginTop: 4 }}>
                      <Space wrap size="small">
                        {permissions.llm.models.map((model: string, idx: number) => (
                          <UITag key={idx} color="blue" style={{ fontSize: 11 }}>
                            {model}
                          </UITag>
                        ))}
                      </Space>
                    </div>
                  </div>
                )}
              </Space>
            </UICard>
          )}

          {/* Vector Store */}
          {permissions.vectorStore !== undefined && (
            <UICard size="small">
              <Space direction="vertical" size="small">
                <Space>
                  {permissions.vectorStore ? (
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  ) : (
                    <WarningOutlined style={{ color: token.colorTextDisabled }} />
                  )}
                  <UIText weight="semibold">Vector Store</UIText>
                </Space>
                {typeof permissions.vectorStore === 'object' &&
                  permissions.vectorStore.collections && (
                    <div>
                      <UIText color="secondary" style={{ fontSize: token.fontSizeSM }}>
                        Collections:
                      </UIText>
                      <div style={{ marginTop: 4 }}>
                        <Space wrap size="small">
                          {permissions.vectorStore.collections.map((col: string, idx: number) => (
                            <UITag key={idx} color="purple" style={{ fontSize: 11 }}>
                              {col}
                            </UITag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  )}
              </Space>
            </UICard>
          )}

          {/* Cache */}
          {permissions.cache !== undefined && (
            <UICard size="small">
              <Space direction="vertical" size="small">
                <Space>
                  {permissions.cache ? (
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  ) : (
                    <WarningOutlined style={{ color: token.colorTextDisabled }} />
                  )}
                  <UIText weight="semibold">Cache</UIText>
                </Space>
                {typeof permissions.cache === 'object' && permissions.cache.namespaces && (
                  <div>
                    <UIText color="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Namespaces:
                    </UIText>
                    <div style={{ marginTop: 4 }}>
                      <Space wrap size="small">
                        {permissions.cache.namespaces.map((ns: string, idx: number) => (
                          <UITag key={idx} color="cyan" style={{ fontSize: 11 }}>
                            {ns}
                          </UITag>
                        ))}
                      </Space>
                    </div>
                  </div>
                )}
              </Space>
            </UICard>
          )}

          {/* Storage */}
          {permissions.storage !== undefined && (
            <UICard size="small">
              <Space direction="vertical" size="small">
                <Space>
                  {permissions.storage ? (
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  ) : (
                    <WarningOutlined style={{ color: token.colorTextDisabled }} />
                  )}
                  <UIText weight="semibold">Storage</UIText>
                </Space>
                {typeof permissions.storage === 'object' && permissions.storage.paths && (
                  <div>
                    <UIText color="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Paths:
                    </UIText>
                    <div style={{ marginTop: 4 }}>
                      <Space wrap size="small">
                        {permissions.storage.paths.map((path: string, idx: number) => (
                          <UITag key={idx} color="orange" style={{ fontSize: 11 }}>
                            {path}
                          </UITag>
                        ))}
                      </Space>
                    </div>
                  </div>
                )}
              </Space>
            </UICard>
          )}

          {/* Analytics */}
          {permissions.analytics !== undefined && (
            <UICard size="small">
              <Space>
                {permissions.analytics ? (
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <WarningOutlined style={{ color: token.colorTextDisabled }} />
                )}
                <UIText weight="semibold">Analytics</UIText>
              </Space>
            </UICard>
          )}

          {/* Embeddings */}
          {permissions.embeddings !== undefined && (
            <UICard size="small">
              <Space>
                {permissions.embeddings ? (
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <WarningOutlined style={{ color: token.colorTextDisabled }} />
                )}
                <UIText weight="semibold">Embeddings</UIText>
              </Space>
            </UICard>
          )}

          {/* Events */}
          {permissions.events !== undefined && (
            <UICard size="small">
              <Space direction="vertical" size="small">
                <Space>
                  {permissions.events ? (
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  ) : (
                    <WarningOutlined style={{ color: token.colorTextDisabled }} />
                  )}
                  <UIText weight="semibold">Event Bus</UIText>
                </Space>
                {typeof permissions.events === 'object' && (
                  <div>
                    {permissions.events.publish && permissions.events.publish.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <UIText color="secondary" style={{ fontSize: token.fontSizeSM }}>
                          Publish:
                        </UIText>
                        <div style={{ marginTop: 4 }}>
                          <Space wrap size="small">
                            {permissions.events.publish.map((evt: string, idx: number) => (
                              <UITag key={idx} color="green" style={{ fontSize: 11 }}>
                                {evt}
                              </UITag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                    {permissions.events.subscribe && permissions.events.subscribe.length > 0 && (
                      <div>
                        <UIText color="secondary" style={{ fontSize: token.fontSizeSM }}>
                          Subscribe:
                        </UIText>
                        <div style={{ marginTop: 4 }}>
                          <Space wrap size="small">
                            {permissions.events.subscribe.map((evt: string, idx: number) => (
                              <UITag key={idx} color="blue" style={{ fontSize: 11 }}>
                                {evt}
                              </UITag>
                            ))}
                          </Space>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Space>
            </UICard>
          )}
        </div>
      </Space>
    </UICard>
  );
}
