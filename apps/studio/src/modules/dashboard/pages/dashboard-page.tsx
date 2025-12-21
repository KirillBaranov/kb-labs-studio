import { useState } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  KBPageContainer,
  KBPageHeader,
  KBGridLayout,
  type Layout,
} from '@kb-labs/studio-ui-react';
import { DashboardEmpty } from '../components/dashboard-empty';
import { DashboardKpisWidget } from '../components/dashboard-kpis-widget';
import { DashboardMetricsWidget } from '../components/dashboard-metrics-widget';
import { DashboardRequestsWidget } from '../components/dashboard-requests-widget';
import { DashboardPluginsWidget } from '../components/dashboard-plugins-widget';
import { DashboardLatencyPercentilesWidget } from '../components/dashboard-latency-percentiles-widget';

const STORAGE_KEY = 'kb-dashboard-layout';

// Default layout configuration
const DEFAULT_LAYOUT: Layout = [
  { i: 'kpis', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
  { i: 'metrics', x: 0, y: 2, w: 12, h: 3, minW: 6, minH: 2 },
  { i: 'latency', x: 0, y: 5, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'requests', x: 6, y: 5, w: 6, h: 4, minW: 4, minH: 3 },
  { i: 'plugins', x: 0, y: 9, w: 12, h: 4, minW: 4, minH: 3 },
];

export function DashboardPage() {
  const [layout, setLayout] = useState<Layout>(() => {
    // Load layout from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_LAYOUT;
      }
    }
    return DEFAULT_LAYOUT;
  });

  const [widgets, setWidgets] = useState<string[]>(['kpis', 'metrics', 'latency', 'requests', 'plugins']);

  // Save layout to localStorage when it changes
  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
  };

  const handleAddWidget = () => {
    // TODO: Open widget gallery modal
    console.log('Add widget clicked');
  };

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Dashboard"
        description="Customizable widget dashboard"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddWidget}
          >
            Add Widget
          </Button>
        }
      />

      {widgets.length === 0 ? (
        <DashboardEmpty onAddWidget={handleAddWidget} />
      ) : (
        <div style={{ margin: '-8px -16px' }}>
          <KBGridLayout
            layout={layout}
            onLayoutChange={handleLayoutChange}
            rowHeight={80}
          >
            {widgets.includes('kpis') && (
              <div key="kpis" style={{ padding: '8px', height: '100%' }}>
                <DashboardKpisWidget />
              </div>
            )}
            {widgets.includes('metrics') && (
              <div key="metrics" style={{ padding: '8px', height: '100%' }}>
                <DashboardMetricsWidget />
              </div>
            )}
            {widgets.includes('latency') && (
              <div key="latency" style={{ padding: '8px', height: '100%' }}>
                <DashboardLatencyPercentilesWidget />
              </div>
            )}
            {widgets.includes('requests') && (
              <div key="requests" style={{ padding: '8px', height: '100%' }}>
                <DashboardRequestsWidget />
              </div>
            )}
            {widgets.includes('plugins') && (
              <div key="plugins" style={{ padding: '8px', height: '100%' }}>
                <DashboardPluginsWidget />
              </div>
            )}
          </KBGridLayout>
        </div>
      )}
    </KBPageContainer>
  );
}

