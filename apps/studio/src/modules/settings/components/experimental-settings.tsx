/**
 * @module @kb-labs/studio-app/modules/settings/components/experimental-settings
 * Experimental features settings
 */

import * as React from 'react';
import { Switch, Space, Typography, Alert, Tag, Tooltip, Collapse } from 'antd';
import {
  BgColorsOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import {
  FEATURE_FLAGS,
  FEATURE_GROUPS,
  getFeaturesByGroup,
  type FeatureGroup,
  type FeatureStatus,
  type FeatureRisk,
} from '@/config/feature-flags';

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;

const GROUP_ICONS: Record<FeatureGroup, React.ReactNode> = {
  'ui-ux': <BgColorsOutlined />,
  performance: <ThunderboltOutlined />,
  ai: <RobotOutlined />,
  data: <DatabaseOutlined />,
};

const STATUS_COLORS: Record<FeatureStatus, string> = {
  alpha: 'red',
  beta: 'orange',
  stable: 'green',
  deprecated: 'default',
};

const RISK_COLORS: Record<FeatureRisk, string> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

const RISK_ICONS: Record<FeatureRisk, React.ReactNode> = {
  low: <InfoCircleOutlined />,
  medium: <WarningOutlined />,
  high: <WarningOutlined />,
};

function isNewFeature(addedAt?: string): boolean {
  if (!addedAt) return false;
  const added = new Date(addedAt);
  const now = new Date();
  const daysDiff = (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7; // Consider "new" if added within last 7 days
}

export function ExperimentalSettings() {
  const { isEnabled, toggleFeature, enabledFeatures, areDependenciesMet } = useFeatureFlags();
  const groupedFeatures = React.useMemo(() => getFeaturesByGroup(), []);

  const enabledCount = enabledFeatures.length;
  const totalCount = Object.keys(FEATURE_FLAGS).length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div>
        <Title level={4} style={{ marginBottom: 8 }}>
          <ExperimentOutlined style={{ marginRight: 8 }} />
          Experimental Features
        </Title>
        <Paragraph type="secondary">
          Enable experimental features to test new functionality before it's generally available.
          These features are still in development and may have bugs or incomplete functionality.
        </Paragraph>
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          <strong>{enabledCount}</strong> of <strong>{totalCount}</strong> features enabled
        </Paragraph>
      </div>

      {/* Warning Alert */}
      <Alert
        message="Experimental Features Notice"
        description="Features marked as Alpha or Beta are actively being developed and may change or be removed without notice. High-risk features may affect application stability."
        type="warning"
        showIcon
        icon={<WarningOutlined />}
      />

      {/* Feature Groups */}
      <Collapse
        defaultActiveKey={['ui-ux', 'performance', 'ai', 'data']}
        expandIconPosition="end"
        style={{ backgroundColor: 'transparent' }}
      >
        {(Object.keys(groupedFeatures) as FeatureGroup[]).map((groupId) => {
          const group = FEATURE_GROUPS[groupId];
          const features = groupedFeatures[groupId];
          const enabledInGroup = features.filter((f) => isEnabled(f.id)).length;

          return (
            <Panel
              key={groupId}
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{GROUP_ICONS[groupId]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{group.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {group.description}
                    </Text>
                  </div>
                  <Tag color="blue">
                    {enabledInGroup} / {features.length}
                  </Tag>
                </div>
              }
              style={{ marginBottom: 8 }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {features.map((feature) => {
                  const enabled = isEnabled(feature.id);
                  const depsNotMet = !areDependenciesMet(feature.id);
                  const isNew = isNewFeature(feature.addedAt);

                  return (
                    <div
                      key={feature.id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: enabled ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                        borderRadius: 8,
                        border: `1px solid ${enabled ? 'var(--link)' : 'var(--border-secondary)'}`,
                        transition: 'all 200ms ease-in-out',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        {/* Left: Switch */}
                        <div style={{ paddingTop: 2 }}>
                          <Switch
                            checked={enabled}
                            onChange={() => toggleFeature(feature.id)}
                            disabled={depsNotMet && !enabled}
                          />
                        </div>

                        {/* Middle: Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Text strong style={{ fontSize: 14 }}>
                              {feature.name}
                            </Text>
                            {isNew && <Tag color="cyan">New</Tag>}
                            <Tag color={STATUS_COLORS[feature.status]}>{feature.status.toUpperCase()}</Tag>
                          </div>

                          <Paragraph
                            type="secondary"
                            style={{ fontSize: 13, marginBottom: 8, marginTop: 0 }}
                          >
                            {feature.description}
                          </Paragraph>

                          {/* Details Tooltip */}
                          {feature.details && (
                            <Tooltip title={feature.details} placement="bottomLeft">
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: 12,
                                  cursor: 'help',
                                  textDecoration: 'underline',
                                  textDecorationStyle: 'dotted',
                                }}
                              >
                                Learn more
                              </Text>
                            </Tooltip>
                          )}

                          {/* Dependencies warning */}
                          {depsNotMet && !enabled && feature.dependencies && (
                            <div style={{ marginTop: 8 }}>
                              <Alert
                                message={`Requires: ${feature.dependencies.map((d) => FEATURE_FLAGS[d].name).join(', ')}`}
                                type="info"
                                showIcon
                                icon={<InfoCircleOutlined />}
                                style={{ fontSize: 12, padding: '4px 8px' }}
                              />
                            </div>
                          )}

                          {/* Deprecated warning */}
                          {feature.status === 'deprecated' && (
                            <div style={{ marginTop: 8 }}>
                              <Alert
                                message="This feature is deprecated and will be removed soon"
                                type="warning"
                                showIcon
                                style={{ fontSize: 12, padding: '4px 8px' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Right: Risk Badge */}
                        <div style={{ paddingTop: 2 }}>
                          <Tooltip title={`Risk: ${feature.risk}`}>
                            <Tag
                              color={RISK_COLORS[feature.risk]}
                              icon={RISK_ICONS[feature.risk]}
                              style={{ margin: 0 }}
                            >
                              {feature.risk.toUpperCase()}
                            </Tag>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Space>
            </Panel>
          );
        })}
      </Collapse>

      {/* Footer Info */}
      <Alert
        message="Feature Stability Levels"
        description={
          <div>
            <div style={{ marginBottom: 4 }}>
              <Tag color="red">ALPHA</Tag> - Early development, expect breaking changes
            </div>
            <div style={{ marginBottom: 4 }}>
              <Tag color="orange">BETA</Tag> - Feature-complete but needs testing
            </div>
            <div style={{ marginBottom: 4 }}>
              <Tag color="green">STABLE</Tag> - Production-ready, safe to use
            </div>
            <div>
              <Tag color="default">DEPRECATED</Tag> - Will be removed soon
            </div>
          </div>
        }
        type="info"
        showIcon
      />
    </Space>
  );
}
