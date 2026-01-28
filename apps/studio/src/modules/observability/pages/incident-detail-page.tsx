import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Alert,
  Badge,
  Tag,
  Button,
  Space,
  Descriptions,
  Timeline,
  Progress,
  Modal,
  Input,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Statistic,
  Empty,
  Table,
  Tooltip,
} from 'antd';
import {
  FireOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import type {
  Incident,
  IncidentDetailResponse,
  IncidentAnalysisResponse,
  IncidentSeverity,
  IncidentType,
  RootCauseItem,
} from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Format timestamp to human-readable string
 */
function formatTime(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Get severity icon and color
 */
function getSeverityConfig(severity: IncidentSeverity): { icon: React.ReactElement; color: string } {
  switch (severity) {
    case 'critical':
      return { icon: <FireOutlined />, color: '#ff4d4f' };
    case 'warning':
      return { icon: <WarningOutlined />, color: '#faad14' };
    case 'info':
      return { icon: <InfoCircleOutlined />, color: '#1890ff' };
  }
}

/**
 * Get incident type label
 */
function getTypeLabel(type: IncidentType): string {
  switch (type) {
    case 'error_rate':
      return 'Error Rate';
    case 'latency_spike':
      return 'Latency Spike';
    case 'plugin_failure':
      return 'Plugin Failure';
    case 'adapter_failure':
      return 'Adapter Failure';
    case 'system_health':
      return 'System Health';
    case 'custom':
      return 'Custom';
  }
}

/**
 * Incident Detail Page
 *
 * Shows detailed information about an incident including AI analysis
 */
export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sources = useDataSources();
  const queryClient = useQueryClient();

  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch incident details
  const {
    data: incidentData,
    isLoading: incidentLoading,
    error: incidentError,
  } = useQuery<IncidentDetailResponse>({
    queryKey: ['incidents', 'detail', id],
    queryFn: async () => {
      if (!id) {throw new Error('Incident ID is required');}
      return sources.observability.getIncident(id);
    },
    enabled: !!id,
  });

  const incident = incidentData?.data;

  // Fetch or trigger AI analysis
  const {
    data: analysisData,
    isLoading: analysisLoading,
    error: analysisError,
    refetch: triggerAnalysis,
  } = useQuery<IncidentAnalysisResponse>({
    queryKey: ['incidents', 'analysis', id],
    queryFn: async () => {
      if (!id) {throw new Error('Incident ID is required');}
      return sources.observability.analyzeIncident(id);
    },
    enabled: false, // Manual trigger
  });

  const analysis = analysisData?.data;

  // Resolve incident mutation
  const resolveMutation = useMutation({
    mutationFn: async () => {
      if (!id) {throw new Error('Incident ID is required');}
      return sources.observability.resolveIncident(id, resolutionNotes);
    },
    onSuccess: () => {
      message.success('Incident resolved successfully');
      setResolveModalVisible(false);
      setResolutionNotes('');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: (error: Error) => {
      message.error(`Failed to resolve incident: ${error.message}`);
    },
  });

  const handleResolve = () => {
    resolveMutation.mutate();
  };

  const handleAnalyze = () => {
    triggerAnalysis();
  };

  const handleGoBack = () => {
    navigate('/observability/incidents');
  };

  if (incidentLoading) {
    return (
      <KBPageContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </KBPageContainer>
    );
  }

  if (incidentError || !incident) {
    return (
      <KBPageContainer>
        <Alert
          message="Failed to load incident"
          description={(incidentError as Error)?.message ?? 'Incident not found'}
          type="error"
          showIcon
        />
      </KBPageContainer>
    );
  }

  const severityConfig = getSeverityConfig(incident.severity);

  return (
    <KBPageContainer>
      <KBPageHeader
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack} />
            {incident.title}
          </Space>
        }
        description={`Incident ID: ${incident.id}`}
        extra={[
          !incident.resolvedAt && (
            <Button
              key="resolve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => setResolveModalVisible(true)}
            >
              Resolve
            </Button>
          ),
          <Button
            key="analyze"
            icon={<ThunderboltOutlined />}
            onClick={handleAnalyze}
            loading={analysisLoading}
            disabled={!!analysis && !analysisData?.data.cached}
          >
            {analysis ? 'Re-analyze' : 'Analyze with AI'}
          </Button>,
        ].filter(Boolean)}
      />

      {/* Overview */}
      <Card title="Overview" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Severity">
            <Tag color={severityConfig.color} icon={severityConfig.icon}>
              {incident.severity.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag>{getTypeLabel(incident.type)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Time">
            {formatTime(incident.timestamp)}
            <span style={{ marginLeft: 8, color: '#888' }}>
              ({dayjs(incident.timestamp).fromNow()})
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {incident.resolvedAt ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                RESOLVED
              </Tag>
            ) : (
              <Tag color="error" icon={<ClockCircleOutlined />}>
                ACTIVE
              </Tag>
            )}
          </Descriptions.Item>
          {incident.resolvedAt && (
            <Descriptions.Item label="Resolved At">
              {formatTime(incident.resolvedAt)}
              <span style={{ marginLeft: 8, color: '#888' }}>
                (Duration: {Math.floor((incident.resolvedAt - incident.timestamp) / 60000)}m)
              </span>
            </Descriptions.Item>
          )}
          {incident.affectedServices && incident.affectedServices.length > 0 && (
            <Descriptions.Item label="Affected Services" span={2}>
              <Space wrap>
                {incident.affectedServices.map((service) => (
                  <Tag key={service}>{service}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Details" span={2}>
            {incident.details}
          </Descriptions.Item>
          {incident.resolutionNotes && (
            <Descriptions.Item label="Resolution Notes" span={2}>
              {incident.resolutionNotes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Related Data - Slow Requests (for latency incidents) */}
      {incident.type === 'latency_spike' && incident.relatedData?.metrics?.topSlowest && incident.relatedData.metrics.topSlowest.length > 0 && (
        <Card title="Slowest Requests" style={{ marginBottom: 16 }}>
          <Table
            dataSource={incident.relatedData.metrics.topSlowest}
            columns={[
              {
                title: 'Method',
                dataIndex: 'method',
                key: 'method',
                width: 80,
                render: (method: string) => <Tag color="blue">{method}</Tag>,
              },
              {
                title: 'Endpoint',
                dataIndex: 'endpoint',
                key: 'endpoint',
                render: (endpoint: string) => <code>{endpoint}</code>,
              },
              {
                title: 'Duration',
                dataIndex: 'durationMs',
                key: 'durationMs',
                width: 120,
                sorter: (a: any, b: any) => b.durationMs - a.durationMs,
                render: (ms: number) => (
                  <span style={{ color: ms > 1000 ? '#ff4d4f' : ms > 500 ? '#faad14' : undefined }}>
                    {ms.toLocaleString()}ms
                  </span>
                ),
              },
              {
                title: 'Status',
                dataIndex: 'statusCode',
                key: 'statusCode',
                width: 80,
                render: (code?: number) => (
                  code ? (
                    <Tag color={code >= 500 ? 'error' : code >= 400 ? 'warning' : 'success'}>
                      {code}
                    </Tag>
                  ) : '-'
                ),
              },
            ]}
            pagination={false}
            size="small"
            rowKey={(record, index) => `${record.endpoint}-${index}`}
          />
        </Card>
      )}

      {/* Related Data - Metrics Comparison */}
      {incident.relatedData?.metrics && (
        <Card title={<><LineChartOutlined /> Metrics Comparison</>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {incident.relatedData.metrics.before && (
              <Col span={12}>
                <Card type="inner" title="Before Incident">
                  {Object.entries(incident.relatedData.metrics.before).map(([key, value]) => (
                    <Statistic
                      key={key}
                      title={key}
                      value={typeof value === 'number' ? value.toFixed(2) : value}
                      style={{ marginBottom: 8 }}
                    />
                  ))}
                </Card>
              </Col>
            )}
            {incident.relatedData.metrics.during && (
              <Col span={12}>
                <Card type="inner" title="During Incident">
                  {Object.entries(incident.relatedData.metrics.during).map(([key, value]) => (
                    <Statistic
                      key={key}
                      title={key}
                      value={typeof value === 'number' ? value.toFixed(2) : value}
                      valueStyle={{
                        color:
                          incident.relatedData?.metrics?.before?.[key] &&
                          typeof value === 'number' &&
                          value > incident.relatedData.metrics.before[key]
                            ? '#ff4d4f'
                            : undefined,
                      }}
                      style={{ marginBottom: 8 }}
                    />
                  ))}
                </Card>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Related Data - Timeline */}
      {incident.relatedData?.timeline && incident.relatedData.timeline.length > 0 && (
        <Card title="Event Timeline" style={{ marginBottom: 16 }}>
          <Timeline mode="left">
            {incident.relatedData.timeline.map((event, idx) => (
              <Timeline.Item
                key={idx}
                color={event.source === 'detector' ? 'red' : event.source === 'logs' ? 'orange' : 'blue'}
                label={formatTime(event.timestamp)}
              >
                <Badge
                  status={event.source === 'detector' ? 'error' : 'processing'}
                  text={event.source.toUpperCase()}
                />
                <div style={{ marginTop: 4 }}>{event.event}</div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Related Data - Error Breakdown (top endpoints with errors) */}
      {incident.relatedData?.logs?.topEndpoints && incident.relatedData.logs.topEndpoints.length > 0 && (
        <Card title="Error Breakdown by Endpoint" style={{ marginBottom: 16 }}>
          <Table
            dataSource={incident.relatedData.logs.topEndpoints}
            columns={[
              {
                title: 'Endpoint',
                dataIndex: 'endpoint',
                key: 'endpoint',
                render: (endpoint: string) => <code>{endpoint}</code>,
              },
              {
                title: 'Error Count',
                dataIndex: 'count',
                key: 'count',
                width: 120,
                sorter: (a: any, b: any) => b.count - a.count,
                render: (count: number) => (
                  <Badge count={count} style={{ backgroundColor: '#ff4d4f' }} />
                ),
              },
              {
                title: 'Sample Error',
                dataIndex: 'sample',
                key: 'sample',
                ellipsis: true,
                render: (sample: string) => (
                  <Tooltip title={sample}>
                    <span style={{ color: '#666' }}>{sample}</span>
                  </Tooltip>
                ),
              },
            ]}
            pagination={false}
            size="small"
            rowKey={(record, index) => `${record.endpoint}-${index}`}
          />
        </Card>
      )}

      {/* Related Data - Error Logs */}
      {incident.relatedData?.logs && incident.relatedData.logs.sampleErrors.length > 0 && (
        <Card title={`Error Logs (${incident.relatedData.logs.errorCount} total)`} style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {incident.relatedData.logs.sampleErrors.map((error, idx) => (
              <Alert
                key={idx}
                message={`Error ${idx + 1}`}
                description={<pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{error}</pre>}
                type="error"
                showIcon
              />
            ))}
          </Space>
        </Card>
      )}

      {/* AI Analysis */}
      {analysisLoading && (
        <Card title={<><ThunderboltOutlined /> AI Analysis</>} style={{ marginBottom: 16 }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Analyzing incident with AI..." />
          </div>
        </Card>
      )}

      {analysisError && (
        <Card title={<><ThunderboltOutlined /> AI Analysis</>} style={{ marginBottom: 16 }}>
          <Alert
            message="Analysis Failed"
            description={(analysisError as Error).message}
            type="error"
            showIcon
          />
        </Card>
      )}

      {analysis && !analysisLoading && (
        <Card
          title={<><ThunderboltOutlined /> AI Analysis</>}
          style={{ marginBottom: 16 }}
          extra={
            analysisData?.data.cached && (
              <Badge status="success" text="Cached" />
            )
          }
        >
          {/* Summary */}
          <Alert
            message="Summary"
            description={analysis.summary}
            type="info"
            showIcon
            icon={<BulbOutlined />}
            style={{ marginBottom: 16 }}
          />

          {/* Root Causes */}
          {analysis.rootCauses && analysis.rootCauses.length > 0 && (
            <>
              <Divider orientation="left">Root Causes</Divider>
              <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                {analysis.rootCauses.map((cause: RootCauseItem, idx: number) => (
                  <Card key={idx} type="inner" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <strong>{cause.factor}</strong>
                        <Progress
                          percent={Math.round(cause.confidence * 100)}
                          size="small"
                          style={{ marginTop: 4 }}
                          strokeColor={
                            cause.confidence >= 0.8
                              ? '#52c41a'
                              : cause.confidence >= 0.5
                              ? '#faad14'
                              : '#ff4d4f'
                          }
                        />
                      </div>
                      <div style={{ color: '#666', fontSize: 13 }}>{cause.evidence}</div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </>
          )}

          {/* Patterns */}
          {analysis.patterns && analysis.patterns.length > 0 && (
            <>
              <Divider orientation="left">Detected Patterns</Divider>
              <ul style={{ marginBottom: 16 }}>
                {analysis.patterns.map((pattern: string, idx: number) => (
                  <li key={idx}>{pattern}</li>
                ))}
              </ul>
            </>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <>
              <Divider orientation="left">Recommendations</Divider>
              <Space direction="vertical" style={{ width: '100%' }}>
                {analysis.recommendations.map((rec: string, idx: number) => (
                  <Alert
                    key={idx}
                    message={`Recommendation ${idx + 1}`}
                    description={rec}
                    type="success"
                    showIcon
                  />
                ))}
              </Space>
            </>
          )}

          {analysis.rootCauses.length === 0 && analysis.patterns.length === 0 && analysis.recommendations.length === 0 && (
            <Empty description="No detailed analysis available" />
          )}
        </Card>
      )}

      {/* Resolve Modal */}
      <Modal
        title="Resolve Incident"
        open={resolveModalVisible}
        onOk={handleResolve}
        onCancel={() => setResolveModalVisible(false)}
        confirmLoading={resolveMutation.isPending}
        okText="Resolve"
        okButtonProps={{ danger: false, type: 'primary' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <p>Are you sure you want to mark this incident as resolved?</p>
          <Input.TextArea
            rows={4}
            placeholder="Resolution notes (optional)"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </Space>
      </Modal>
    </KBPageContainer>
  );
}
