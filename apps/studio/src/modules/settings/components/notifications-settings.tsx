import * as React from 'react';
import { Form, Switch, Space, Alert } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export function NotificationsSettings() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        message="Feature in Development"
        description="Notification preferences will be configurable soon. We're working on bringing you more control over alerts and notifications."
        type="warning"
        showIcon
        icon={<BellOutlined />}
      />

      <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <Form layout="vertical">
          <Form.Item label="Toast Notifications" help="Show temporary notification popups">
            <Switch disabled defaultChecked />
          </Form.Item>

          <Form.Item label="Sound Alerts" help="Play sounds for important events">
            <Switch disabled />
          </Form.Item>

          <Form.Item label="Desktop Notifications" help="Enable browser notifications (requires permission)">
            <Switch disabled />
          </Form.Item>

          <Form.Item label="Email Digest" help="Receive daily summary emails">
            <Switch disabled />
          </Form.Item>

          <Form.Item label="Error Notifications" help="Get notified when errors occur">
            <Switch disabled defaultChecked />
          </Form.Item>
        </Form>
      </div>
    </Space>
  );
}
