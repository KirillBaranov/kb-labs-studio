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

/**
 * Dashboard Overview Page
 *
 * Displays all monitoring widgets. AI Insights has its own page at /insights.
 */
export function DashboardPage() {
  return (
    <>
      <div className="dashboard-content">
        {/* Hero Metrics - Overview cards */}
        <section className="dashboard-section">
          <HeroMetricsWidget />
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

        {/* Performance */}
        <section className="dashboard-section">
          <SectionHeader title="Performance" />
          <PerformanceBudgetWidget />
        </section>

        {/* Performance Heatmap */}
        <section className="dashboard-section">
          <SectionHeader title="Latency Heatmap" />
          <PerformanceHeatmapWidget />
        </section>

        {/* Cost Attribution */}
        <section className="dashboard-section">
          <SectionHeader title="Cost Attribution" />
          <CostAttributionWidget />
        </section>

        {/* Comparative Benchmark */}
        <section className="dashboard-section">
          <SectionHeader title="Benchmarks" />
          <ComparativeBenchmarkWidget />
        </section>

        {/* Predictive Analytics */}
        <section className="dashboard-section">
          <SectionHeader title="Predictions" />
          <PredictiveAnalyticsWidget />
        </section>

        {/* Incidents */}
        <section className="dashboard-section">
          <SectionHeader title="Incidents" />
          <SmartIncidentsWidget />
        </section>

        {/* Chaos Engineering */}
        <section className="dashboard-section">
          <SectionHeader title="Chaos Engineering" />
          <ChaosEngineeringWidget />
        </section>

        {/* Industry Benchmark */}
        <section className="dashboard-section">
          <SectionHeader title="Industry Comparison" />
          <IndustryBenchmarkWidget />
        </section>

        {/* Time Travel */}
        <section className="dashboard-section">
          <SectionHeader title="Time Travel" />
          <TimeTravelWidget />
        </section>
      </div>

      <style>{`
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
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
