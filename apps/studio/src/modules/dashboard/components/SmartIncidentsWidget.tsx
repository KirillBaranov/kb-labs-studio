import React, { useMemo, useState } from 'react';
import { Card, List, Tag, Badge, Collapse, Alert, Timeline, Typography, Empty, Progress, Segmented } from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { useDataSources } from '../../../providers/data-sources-provider';
import { useIncidents, type Incident, type IncidentSeverity } from '@kb-labs/studio-data-client';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface RootCause {
  factor: string;
  correlation: number;
  evidence: string;
}

interface RCAResult {
  causalChain: string[];
  evidence: RootCause[];
  recommendations: string[];
}

export function SmartIncidentsWidget() {
  const sources = useDataSources();
  const [severityFilter, setSeverityFilter] = useState<'all' | IncidentSeverity>('all');
  const [expandedIncidents, setExpandedIncidents] = useState<string[]>([]);

  // Fetch incidents from backend
  const incidentsQuery = useIncidents(sources.observability, {
    severity: severityFilter === 'all' ? undefined : severityFilter,
    status: 'all',
  });

  // Filter and sort incidents
  const incidents = useMemo(() => {
    if (!incidentsQuery.data) return [];
    return incidentsQuery.data.sort((a, b) => b.timestamp - a.timestamp);
  }, [incidentsQuery.data]);

  // Analyze root cause for an incident
  const analyzeRootCause = (incident: Incident): RCAResult => {
    // Use rootCause from backend if available
    if (incident.rootCause && incident.rootCause.length > 0) {
      const evidence = incident.rootCause.map(cause => ({
        factor: cause.factor,
        correlation: cause.confidence,
        evidence: cause.evidence,
      }));

      const causalChain = evidence
        .sort((a, b) => b.correlation - a.correlation)
        .map(e => e.factor);

      // Generate recommendations based on root causes
      const recommendations: string[] = [];
      for (const cause of incident.rootCause) {
        if (cause.factor.toLowerCase().includes('redis')) {
          recommendations.push('Restart Redis service or check network connectivity');
          recommendations.push('Enable Redis connection pooling');
        }
        if (cause.factor.toLowerCase().includes('latency')) {
          recommendations.push('Profile slow endpoints and optimize database queries');
          recommendations.push('Add caching layer for frequently accessed data');
        }
        if (cause.factor.toLowerCase().includes('plugin')) {
          recommendations.push('Review plugin logs for detailed error messages');
          recommendations.push('Check plugin dependencies and configurations');
        }
        if (cause.factor.toLowerCase().includes('load')) {
          recommendations.push('Scale horizontally by adding more instances');
          recommendations.push('Implement rate limiting to protect system');
        }
      }

      if (recommendations.length === 0) {
        recommendations.push('Monitor system metrics for patterns');
        recommendations.push('Check application logs for errors');
      }

      return { causalChain, evidence, recommendations };
    }

    // Fallback: basic analysis if no root cause provided
    return {
      causalChain: [incident.type],
      evidence: [{
        factor: incident.type,
        correlation: 0.5,
        evidence: incident.details,
      }],
      recommendations: [
        'Monitor system metrics for patterns',
        'Check application logs for errors',
      ],
    };
  };

  const getSeverityConfig = (severity: IncidentSeverity) => {
    const configs = {
      critical: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        badgeStatus: 'error' as const,
      },
      warning: {
        color: 'orange',
        icon: <WarningOutlined />,
        badgeStatus: 'warning' as const,
      },
      info: {
        color: 'blue',
        icon: <CheckCircleOutlined />,
        badgeStatus: 'processing' as const,
      },
    };
    return configs[severity];
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      error_rate: <BugOutlined />,
      latency_spike: <LineChartOutlined />,
      plugin_failure: <ThunderboltOutlined />,
      cache_failure: <AlertOutlined />,
      resource_exhaustion: <WarningOutlined />,
    };
    return icons[type] || <AlertOutlined />;
  };

  const isLoading = incidentsQuery.isLoading;
  const hasError = incidentsQuery.isError;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOutlined />
            <span>Smart Incidents</span>
            {incidents.length > 0 && (
              <Badge
                count={incidents.length}
                style={{ backgroundColor: incidents.some(i => i.severity === 'critical') ? '#ff4d4f' : '#faad14' }}
              />
            )}
          </div>
          <Segmented
            options={[
              { label: 'All', value: 'all' },
              { label: 'Critical', value: 'critical' },
              { label: 'Warning', value: 'warning' },
              { label: 'Info', value: 'info' },
            ]}
            value={severityFilter}
            onChange={(value) => setSeverityFilter(value as 'all' | IncidentSeverity)}
            size="small"
          />
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px', maxHeight: 'calc(100% - 57px)', overflowY: 'auto' }}
    >
      {isLoading ? (
        <div style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}>
          Loading incidents...
        </div>
      ) : hasError ? (
        <div style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff4d4f',
        }}>
          Failed to load incidents
        </div>
      ) : incidents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No incidents detected"
          style={{ marginTop: 40 }}
        />
      ) : (
        <List
          dataSource={incidents}
          renderItem={(incident) => {
            const config = getSeverityConfig(incident.severity);
            const rca = analyzeRootCause(incident);

            return (
              <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 20, color: config.color }}>
                      {getTypeIcon(incident.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 14 }}>{incident.title}</Text>
                        <Tag color={config.color} icon={config.icon}>
                          {incident.severity.toUpperCase()}
                        </Tag>
                      </div>
                      <Paragraph style={{ marginBottom: 8, color: '#666' }}>
                        {incident.details}
                      </Paragraph>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        {incident.affectedServices && incident.affectedServices.length > 0 && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Affected: {incident.affectedServices.join(', ')}
                          </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          • {new Date(incident.timestamp).toLocaleTimeString()}
                        </Text>
                        {incident.resolvedAt && (
                          <Text type="success" style={{ fontSize: 12 }}>
                            • Resolved: {new Date(incident.resolvedAt).toLocaleTimeString()}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Root Cause Analysis */}
                  <Collapse
                    ghost
                    activeKey={expandedIncidents}
                    onChange={(keys) => setExpandedIncidents(keys as string[])}
                  >
                    <Panel
                      header={
                        <Text strong style={{ fontSize: 13 }}>
                          🔍 Root Cause Analysis
                        </Text>
                      }
                      key={incident.id}
                    >
                      {/* Causal Chain */}
                      {rca.causalChain.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>Causal Chain:</Text>
                          <Timeline
                            style={{ marginTop: 8 }}
                            items={rca.causalChain.map((factor, index) => ({
                              children: factor,
                              color: index === 0 ? 'red' : 'blue',
                            }))}
                          />
                        </div>
                      )}

                      {/* Evidence */}
                      {rca.evidence.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>Evidence:</Text>
                          {rca.evidence.map((ev, index) => (
                            <div key={index} style={{ marginTop: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Progress
                                  type="line"
                                  percent={ev.correlation * 100}
                                  size="small"
                                  style={{ width: 100 }}
                                  format={(percent) => `${percent?.toFixed(0)}%`}
                                />
                                <Text>{ev.factor}</Text>
                              </div>
                              <Text type="secondary" style={{ fontSize: 12, marginLeft: 108 }}>
                                {ev.evidence}
                              </Text>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommendations */}
                      {rca.recommendations.length > 0 && (
                        <Alert
                          message="Recommended Actions"
                          description={
                            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                              {rca.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          }
                          type="info"
                          showIcon
                        />
                      )}
                    </Panel>
                  </Collapse>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
}
