import * as React from 'react';
import { Form, Select, Switch, Space, Alert } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

export function DashboardSettings() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Coming Soon"
        description="Dashboard customization features will be available in the next release. Stay tuned!"
        type="info"
        showIcon
        icon={<RocketOutlined />}
      />

      <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <Form layout="vertical">
          <Form.Item label="Default Landing Page" help="Choose which page to show on login">
            <Select
              disabled
              defaultValue="dashboard"
              style={{ width: '100%' }}
              options={[
                { label: 'Dashboard', value: 'dashboard' },
                { label: 'Analytics', value: 'analytics' },
                { label: 'Workflows', value: 'workflows' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Auto-refresh Interval" help="How often to refresh dashboard data">
            <Select
              disabled
              defaultValue={30}
              style={{ width: '100%' }}
              options={[
                { label: '10 seconds', value: 10 },
                { label: '30 seconds', value: 30 },
                { label: '1 minute', value: 60 },
                { label: 'Manual only', value: 0 },
              ]}
            />
          </Form.Item>

          <Form.Item label="Show Widget Borders">
            <Switch disabled defaultChecked />
          </Form.Item>

          <Form.Item label="Enable Widget Animations">
            <Switch disabled defaultChecked />
          </Form.Item>
        </Form>
      </div>
    </Space>
  );
}
