import React, { useState } from 'react';
import { Card, Table, Tag, Button, Progress, Space, Typography, Modal, Form, Select, InputNumber, Descriptions, Alert } from 'antd';
import {
  ExperimentOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  WarningOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface ChaosExperiment {
  id: string;
  name: string;
  target: string;
  type: 'latency' | 'error' | 'network' | 'resource';
  config: {
    latencyMs?: number;
    errorRate?: number;
    duration?: number;
    blastRadius?: number;
  };
  hypothesis: string;
  lastRun?: {
    timestamp: number;
    status: 'success' | 'failed' | 'aborted';
    duration: number;
  };
}

interface ExperimentResult {
  experimentId: string;
  status: 'running' | 'success' | 'failed' | 'aborted';
  progress: number;
  metrics: {
    requestsProcessed: number;
    errorsDetected: number;
    latencyImpact: number;
    sloViolations: number;
  };
}

// Mock experiment library
const EXPERIMENT_LIBRARY: ChaosExperiment[] = [
  {
    id: 'latency-llm',
    name: 'LLM Latency Injection',
    target: 'llm-adapter',
    type: 'latency',
    config: { latencyMs: 500, blastRadius: 10, duration: 60000 },
    hypothesis: 'System handles 500ms additional latency gracefully',
    lastRun: { timestamp: Date.now() - 86400000, status: 'success', duration: 60000 },
  },
  {
    id: 'error-embeddings',
    name: 'Embeddings Error Injection',
    target: 'embeddings-adapter',
    type: 'error',
    config: { errorRate: 5, blastRadius: 20, duration: 30000 },
    hypothesis: 'System retries failed embedding requests',
    lastRun: { timestamp: Date.now() - 172800000, status: 'success', duration: 30000 },
  },
  {
    id: 'network-redis',
    name: 'Redis Network Partition',
    target: 'redis',
    type: 'network',
    config: { duration: 60000, blastRadius: 100 },
    hypothesis: 'System falls back to direct DB on Redis failure',
  },
  {
    id: 'resource-memory',
    name: 'Memory Pressure Test',
    target: 'system',
    type: 'resource',
    config: { duration: 120000, blastRadius: 50 },
    hypothesis: 'System handles memory pressure without OOM',
  },
  {
    id: 'latency-vectorstore',
    name: 'VectorStore Slow Queries',
    target: 'vectorstore-adapter',
    type: 'latency',
    config: { latencyMs: 1000, blastRadius: 30, duration: 45000 },
    hypothesis: 'Search results still return within SLO',
  },
];

// Calculate resilience score based on experiment results
const calculateResilienceScore = (experiments: ChaosExperiment[]): number => {
  const completed = experiments.filter(e => e.lastRun);
  if (completed.length === 0) {return 0;}

  const successRate = completed.filter(e => e.lastRun?.status === 'success').length / completed.length;
  const coverage = completed.length / experiments.length;

  return Math.round((successRate * 0.7 + coverage * 0.3) * 100);
};

export function ChaosEngineeringWidget() {
  const [experiments] = useState<ChaosExperiment[]>(EXPERIMENT_LIBRARY);
  const [runningExperiment, setRunningExperiment] = useState<ExperimentResult | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ChaosExperiment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resilienceScore = calculateResilienceScore(experiments);

  // Simulate running an experiment
  const runExperiment = (experiment: ChaosExperiment) => {
    setRunningExperiment({
      experimentId: experiment.id,
      status: 'running',
      progress: 0,
      metrics: {
        requestsProcessed: 0,
        errorsDetected: 0,
        latencyImpact: 0,
        sloViolations: 0,
      },
    });

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setRunningExperiment(prev => prev ? {
          ...prev,
          status: 'success',
          progress: 100,
          metrics: {
            requestsProcessed: 1247,
            errorsDetected: 12,
            latencyImpact: experiment.config.latencyMs ?? 0,
            sloViolations: 0,
          },
        } : null);
      } else {
        setRunningExperiment(prev => prev ? {
          ...prev,
          progress,
          metrics: {
            requestsProcessed: Math.floor(progress * 12.47),
            errorsDetected: Math.floor(progress * 0.12),
            latencyImpact: experiment.config.latencyMs ?? 0,
            sloViolations: 0,
          },
        } : null);
      }
    }, 500);
  };

  const stopExperiment = () => {
    setRunningExperiment(prev => prev ? { ...prev, status: 'aborted' } : null);
    setTimeout(() => setRunningExperiment(null), 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'latency': return 'orange';
      case 'error': return 'red';
      case 'network': return 'purple';
      case 'resource': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'aborted': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Experiment',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ChaosExperiment) => (
        <div>
          <Text strong>{name}</Text>
          <div style={{ fontSize: 12, color: '#666' }}>{record.target}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      width: 120,
      render: (lastRun?: ChaosExperiment['lastRun']) => {
        if (!lastRun) {return <Text type="secondary">Never</Text>;}
        const daysAgo = Math.floor((Date.now() - lastRun.timestamp) / 86400000);
        return (
          <div>
            <Tag color={getStatusColor(lastRun.status)}>{lastRun.status}</Tag>
            <div style={{ fontSize: 11, color: '#999' }}>{daysAgo}d ago</div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: ChaosExperiment) => (
        <Button
          type="primary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => {
            setSelectedExperiment(record);
            setIsModalOpen(true);
          }}
          disabled={runningExperiment !== null}
        >
          Run
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExperimentOutlined />
          <span>Chaos Engineering</span>
        </div>
      }
      extra={
        <Space>
          <SafetyOutlined style={{ color: resilienceScore >= 70 ? '#52c41a' : '#faad14' }} />
          <Text strong>Resilience: {resilienceScore}%</Text>
        </Space>
      }
    >
      {/* Mock Mode Banner */}
      <Alert
        type="info"
        message={
          <Space>
            <span>Mock Mode</span>
            <Text type="secondary">—</Text>
            <Text type="secondary">
              Experiments are simulated. Real fault injection planned in Phase 2.
            </Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              See: docs/CHAOS-ENGINEERING-ROADMAP.md
            </Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
        showIcon={false}
      />

      {/* Resilience Score Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 16,
        padding: 16,
        background: '#fafafa',
        borderRadius: 8,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: resilienceScore >= 70 ? '#52c41a' : '#faad14' }}>
            {resilienceScore}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Resilience Score</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}>
            {experiments.filter(e => e.lastRun?.status === 'success').length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Passed Tests</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>
            {experiments.filter(e => e.lastRun?.status === 'failed').length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Failed Tests</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#595959' }}>
            {experiments.filter(e => !e.lastRun).length}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>Not Tested</Text>
        </div>
      </div>

      {/* Running Experiment Status */}
      {runningExperiment && (
        <Alert
          type={runningExperiment.status === 'running' ? 'info' : runningExperiment.status === 'success' ? 'success' : 'warning'}
          message={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <ThunderboltOutlined />
                <Text strong>
                  {runningExperiment.status === 'running' ? 'Experiment Running...' :
                   runningExperiment.status === 'success' ? 'Experiment Complete' : 'Experiment Aborted'}
                </Text>
              </Space>
              {runningExperiment.status === 'running' && (
                <Button size="small" danger icon={<PauseCircleOutlined />} onClick={stopExperiment}>
                  Stop
                </Button>
              )}
            </div>
          }
          description={
            <div style={{ marginTop: 8 }}>
              <Progress percent={runningExperiment.progress} status={runningExperiment.status === 'running' ? 'active' : undefined} />
              <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                <Text type="secondary">Requests: {runningExperiment.metrics.requestsProcessed}</Text>
                <Text type="secondary">Errors: {runningExperiment.metrics.errorsDetected}</Text>
                <Text type="secondary">SLO Violations: {runningExperiment.metrics.sloViolations}</Text>
              </div>
            </div>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Experiment Library Table */}
      <Table
        dataSource={experiments}
        columns={columns}
        pagination={false}
        size="small"
        rowKey="id"
      />

      {/* Run Experiment Modal */}
      <Modal
        title={
          <Space>
            <ExperimentOutlined />
            <span>Run Experiment: {selectedExperiment?.name}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          if (selectedExperiment) {
            runExperiment(selectedExperiment);
          }
          setIsModalOpen(false);
        }}
        okText="Start Experiment"
        okButtonProps={{ danger: true }}
      >
        {selectedExperiment && (
          <div>
            <Alert
              type="warning"
              message="This will inject faults into your system"
              description="Make sure you're running in a safe environment. The experiment will auto-abort if SLO violations exceed threshold."
              style={{ marginBottom: 16 }}
              icon={<WarningOutlined />}
            />

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Target">{selectedExperiment.target}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={getTypeColor(selectedExperiment.type)}>{selectedExperiment.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Hypothesis">{selectedExperiment.hypothesis}</Descriptions.Item>
              {selectedExperiment.config.latencyMs && (
                <Descriptions.Item label="Latency">{selectedExperiment.config.latencyMs}ms</Descriptions.Item>
              )}
              {selectedExperiment.config.errorRate && (
                <Descriptions.Item label="Error Rate">{selectedExperiment.config.errorRate}%</Descriptions.Item>
              )}
              <Descriptions.Item label="Duration">{(selectedExperiment.config.duration ?? 60000) / 1000}s</Descriptions.Item>
              <Descriptions.Item label="Blast Radius">{selectedExperiment.config.blastRadius ?? 100}%</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </Card>
  );
}
