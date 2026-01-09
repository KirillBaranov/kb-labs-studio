import { useState } from 'react';
import { Collapse, theme } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  DollarOutlined,
  AlertOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  KBPageContainer,
  KBPageHeader,
} from '@kb-labs/studio-ui-react';
import './dashboard-animations.css';
import { HeroMetricsWidget } from '../components/HeroMetricsWidget';
import { ActivityTimelineWidget } from '../components/ActivityTimelineWidget';
import { CostAttributionWidget } from '../components/CostAttributionWidget';
import { PerformanceBudgetWidget } from '../components/PerformanceBudgetWidget';
import { SystemTopologyWidget } from '../components/SystemTopologyWidget';
import { SmartIncidentsWidget } from '../components/SmartIncidentsWidget';
import { PredictiveAnalyticsWidget } from '../components/PredictiveAnalyticsWidget';
import { ComparativeBenchmarkWidget } from '../components/ComparativeBenchmarkWidget';
import { PerformanceHeatmapWidget } from '../components/PerformanceHeatmapWidget';

const { Panel } = Collapse;

export function DashboardPage() {
  const { token } = theme.useToken();
  const [activeKeys, setActiveKeys] = useState<string[]>(['overview', 'topology', 'performance']);

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Intelligence Dashboard"
        description="Real-time platform observability and performance analytics"
      />

      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        bordered={false}
        expandIconPosition="end"
        style={{ background: 'transparent' }}
      >
        {/* Overview Section */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DashboardOutlined style={{ fontSize: 16, color: token.colorPrimary }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Overview</span>
              <span style={{ color: token.colorTextSecondary, fontSize: 13, marginLeft: 4 }}>
                Key health metrics at a glance
              </span>
            </div>
          }
          key="overview"
        >
          <div className="dashboard-section">
            {/* Hero Metrics */}
            <div className="widget-full">
              <HeroMetricsWidget />
            </div>
          </div>
        </Panel>

        {/* System Architecture */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DashboardOutlined style={{ fontSize: 16, color: '#13c2c2' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>System Architecture</span>
              <span style={{ color: token.colorTextSecondary, fontSize: 13, marginLeft: 4 }}>
                Service topology and dependencies
              </span>
            </div>
          }
          key="topology"
        >
          <div className="dashboard-section">
            <div className="widget-full">
              <SystemTopologyWidget />
            </div>
          </div>
        </Panel>

        {/* Performance & Monitoring */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LineChartOutlined style={{ fontSize: 16, color: '#1890ff' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Performance & Monitoring</span>
              <span style={{ color: token.colorTextSecondary, fontSize: 13, marginLeft: 4 }}>
                Real-time metrics and analysis
              </span>
            </div>
          }
          key="performance"
        >
          <div className="dashboard-section">
            {/* Activity Timeline */}
            <div className="widget-full">
              <ActivityTimelineWidget />
            </div>

            {/* Performance Budget */}
            <div className="widget-full">
              <PerformanceBudgetWidget />
            </div>

            {/* Performance Heatmap */}
            <div className="widget-full">
              <PerformanceHeatmapWidget />
            </div>
          </div>
        </Panel>

        {/* Incidents & Alerts */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Incidents & Alerts</span>
              <span style={{ color: token.colorTextSecondary, fontSize: 13, marginLeft: 4 }}>
                Smart incident detection and RCA
              </span>
            </div>
          }
          key="incidents"
        >
          <div className="dashboard-section">
            <div className="widget-full">
              <SmartIncidentsWidget />
            </div>
          </div>
        </Panel>

        {/* Cost & Attribution */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarOutlined style={{ fontSize: 16, color: '#52c41a' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Cost & Attribution</span>
              <span style={{ color: token.colorTextSecondary, fontSize: 13, marginLeft: 4 }}>
                Usage costs and budget tracking
              </span>
            </div>
          }
          key="cost"
        >
          <div className="dashboard-section">
            <div className="widget-full">
              <CostAttributionWidget />
            </div>
          </div>
        </Panel>

        {/* Advanced Analytics */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChartOutlined style={{ fontSize: 16, color: '#722ed1' }} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Advanced Analytics</span>
              <span style={{ color: token.colorTextSecondary, fontSize: 13, marginLeft: 4 }}>
                Predictions and benchmarks
              </span>
            </div>
          }
          key="analytics"
        >
          <div className="dashboard-section">
            {/* Predictive Analytics */}
            <div className="widget-full">
              <PredictiveAnalyticsWidget />
            </div>

            {/* Comparative Benchmark */}
            <div className="widget-full">
              <ComparativeBenchmarkWidget />
            </div>
          </div>
        </Panel>
      </Collapse>

      <style>{`
        /* Dashboard Section Layouts */
        .dashboard-section {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
          padding: 16px 0;
        }

        /* Widget Size Classes */
        .widget-full {
          grid-column: span 12;
          display: flex;
          flex-direction: column;
        }

        .widget-full > * {
          flex: 1;
          min-height: 0;
        }

        /* Hero Metrics - smaller height */
        .dashboard-section > .widget-full:first-child > * {
          min-height: 180px;
        }

        /* SystemTopology - requires fixed height for ReactFlow */
        .widget-full > *:has(.react-flow) {
          min-height: 400px;
        }

        .widget-half {
          grid-column: span 6;
          display: flex;
          flex-direction: column;
        }

        .widget-half > * {
          flex: 1;
          min-height: 0;
        }

        .widget-third {
          grid-column: span 4;
          display: flex;
          flex-direction: column;
        }

        .widget-third > * {
          flex: 1;
          min-height: 0;
        }

        .widget-two-thirds {
          grid-column: span 8;
          display: flex;
          flex-direction: column;
        }

        .widget-two-thirds > * {
          flex: 1;
          min-height: 0;
        }

        /* Collapse Panel Styling */
        .ant-collapse {
          margin: 0 -16px;
        }

        .ant-collapse > .ant-collapse-item {
          border-bottom: 1px solid rgba(5, 5, 5, 0.06);
        }

        .ant-collapse > .ant-collapse-item:last-child {
          border-bottom: none;
        }

        .ant-collapse-header {
          padding: 16px 24px !important;
          background: rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }

        .ant-collapse-header:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .ant-collapse-content-box {
          padding: 0 24px 16px !important;
        }

        /* Responsive: Tablet */
        @media (max-width: 1024px) {
          .widget-half,
          .widget-third,
          .widget-two-thirds {
            grid-column: span 12;
          }

          .dashboard-section {
            gap: 12px;
          }

          .ant-collapse-header {
            padding: 12px 16px !important;
          }

          .ant-collapse-content-box {
            padding: 0 16px 12px !important;
          }
        }

        /* Responsive: Mobile */
        @media (max-width: 768px) {
          .dashboard-section {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 12px 0;
          }

          .widget-full,
          .widget-half,
          .widget-third,
          .widget-two-thirds {
            grid-column: span 1;
            min-height: 300px;
          }

          .ant-collapse {
            margin: 0 -12px;
          }

          .ant-collapse-header {
            padding: 12px !important;
            font-size: 14px;
          }

          .ant-collapse-content-box {
            padding: 0 12px 12px !important;
          }
        }
      `}</style>
    </KBPageContainer>
  );
}

