import { useState } from 'react';
import { Tabs } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { HeroMetricsWidget } from '../components/HeroMetricsWidget';
import { ActivityTimelineWidget } from '../components/ActivityTimelineWidget';
import { PerformanceBudgetWidget } from '../components/PerformanceBudgetWidget';
import { SystemTopologyWidget } from '../components/SystemTopologyWidget';
import { SmartIncidentsWidget } from '../components/SmartIncidentsWidget';
import { PredictiveAnalyticsWidget } from '../components/PredictiveAnalyticsWidget';
import { PerformanceHeatmapWidget } from '../components/PerformanceHeatmapWidget';
import { CostAttributionWidget } from '../components/CostAttributionWidget';
import { ComparativeBenchmarkWidget } from '../components/ComparativeBenchmarkWidget';
import { ChaosEngineeringWidget } from '../components/ChaosEngineeringWidget';
import { TimeTravelWidget } from '../components/TimeTravelWidget';
import { IndustryBenchmarkWidget } from '../components/IndustryBenchmarkWidget';
import { SystemResourcesWidget } from '../components/SystemResourcesWidget';

/**
 * Dashboard Overview Page
 *
 * Displays all monitoring widgets organized in tabs.
 */
export function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const items = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined style={{ marginRight: 8 }} />
          Overview
        </span>
      ),
      children: (
        <div className="dashboard-content">
          {/* Hero Metrics */}
          <section className="dashboard-section">
            <HeroMetricsWidget />
          </section>

          {/* System Resources */}
          <section className="dashboard-section">
            <SectionHeader title="System Resources" />
            <SystemResourcesWidget />
          </section>

          {/* Activity Timeline */}
          <section className="dashboard-section">
            <SectionHeader title="Activity" />
            <ActivityTimelineWidget />
          </section>

          {/* System Topology */}
          <section className="dashboard-section">
            <SectionHeader title="System Architecture" />
            <SystemTopologyWidget />
          </section>
        </div>
      ),
    },
    {
      key: 'performance',
      label: (
        <span>
          <ThunderboltOutlined style={{ marginRight: 8 }} />
          Performance
        </span>
      ),
      children: (
        <div className="dashboard-content">
          {/* Performance Budget */}
          <section className="dashboard-section">
            <SectionHeader title="Performance" />
            <PerformanceBudgetWidget />
          </section>

          {/* Performance Heatmap */}
          <section className="dashboard-section">
            <SectionHeader title="Latency Heatmap" />
            <PerformanceHeatmapWidget />
          </section>

          {/* Benchmarks */}
          <section className="dashboard-section">
            <SectionHeader title="Benchmarks" />
            <ComparativeBenchmarkWidget />
          </section>

          {/* Industry Comparison */}
          <section className="dashboard-section">
            <SectionHeader title="Industry Comparison" />
            <IndustryBenchmarkWidget />
          </section>
        </div>
      ),
    },
    {
      key: 'incidents',
      label: (
        <span>
          <AlertOutlined style={{ marginRight: 8 }} />
          Incidents
        </span>
      ),
      children: (
        <div className="dashboard-content">
          {/* Smart Incidents */}
          <section className="dashboard-section">
            <SmartIncidentsWidget />
          </section>

          {/* Predictions */}
          <section className="dashboard-section">
            <SectionHeader title="Predictive Analytics" />
            <PredictiveAnalyticsWidget />
          </section>
        </div>
      ),
    },
    {
      key: 'resources',
      label: (
        <span>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Resources
        </span>
      ),
      children: (
        <div className="dashboard-content">
          {/* Cost Attribution */}
          <section className="dashboard-section">
            <SectionHeader title="Cost Attribution" />
            <CostAttributionWidget />
          </section>

          {/* Time Travel */}
          <section className="dashboard-section">
            <SectionHeader title="Time Travel" />
            <TimeTravelWidget />
          </section>
        </div>
      ),
    },
    {
      key: 'experiments',
      label: (
        <span>
          <ExperimentOutlined style={{ marginRight: 8 }} />
          Experiments
        </span>
      ),
      children: (
        <div className="dashboard-content">
          {/* Chaos Engineering */}
          <section className="dashboard-section">
            <SectionHeader title="Chaos Engineering" />
            <ChaosEngineeringWidget />
          </section>
        </div>
      ),
    },
  ];

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
        style={{ marginTop: -16 }}
      />

      <style>{`
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding-top: 16px;
        }

        .dashboard-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          padding: 0;
        }

        .section-header h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #8c8c8c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-header::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f0f0f0;
        }

        /* Clean card styles globally */
        .dashboard-section .ant-card {
          border-radius: 8px;
          border: 1px solid #f0f0f0;
          box-shadow: none;
        }

        .dashboard-section .ant-card-head {
          border-bottom: 1px solid #f5f5f5;
          padding: 12px 16px;
          min-height: auto;
        }

        .dashboard-section .ant-card-head-title {
          font-size: 14px;
          font-weight: 500;
        }

        .dashboard-section .ant-card-body {
          padding: 16px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-content {
            gap: 24px;
          }
        }
      `}</style>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header">
      <h4>{title}</h4>
    </div>
  );
}
