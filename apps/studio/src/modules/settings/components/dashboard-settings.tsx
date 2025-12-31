import * as React from 'react';
import { Form, Select, Switch, Space, Typography, Divider } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useSettings } from '@/providers/settings-provider';

const { Text } = Typography;

export function DashboardSettings() {
  const { settings, updateSettings } = useSettings();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Form layout="vertical">
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ThunderboltOutlined style={{ marginRight: 6 }} />
          Customize your dashboard experience
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Form.Item
          label="Page Transitions"
          help="Animations when navigating between pages (requires 'page-transitions' feature flag)"
        >
          <Select
            value={settings.appearance.pageTransition}
            onChange={(value) => updateSettings({
              appearance: { ...settings.appearance, pageTransition: value }
            })}
            style={{ width: '100%' }}
            options={[
              { label: 'None (instant)', value: 'none' },
              { label: 'Fade (subtle)', value: 'fade' },
              { label: 'Slide (dynamic)', value: 'slide' },
            ]}
          />
        </Form.Item>
      </Form>
    </Space>
  );
}
