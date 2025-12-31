/**
 * @module @kb-labs/studio-app/components/role-switcher
 * Mock authentication role switcher for demo purposes
 */

import * as React from 'react';
import { Card, Radio, Space, Typography, Alert, Divider } from 'antd';
import { UserOutlined, EyeOutlined, ToolOutlined, CrownOutlined } from '@ant-design/icons';
import type { UserRole } from '@/providers/auth-provider';
import { useAuth } from '@/providers/auth-provider';

const { Title, Paragraph, Text } = Typography;

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    icon: React.ReactElement;
    color: string;
    permissions: string[];
  }
> = {
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to dashboards and reports',
    icon: <EyeOutlined />,
    color: '#52c41a',
    permissions: ['View dashboards', 'View analytics', 'View workflows (read-only)'],
  },
  operator: {
    label: 'Operator',
    description: 'Standard user with execution permissions',
    icon: <ToolOutlined />,
    color: '#1890ff',
    permissions: [
      'All Viewer permissions',
      'Execute workflows',
      'Manage widgets',
      'Configure settings',
    ],
  },
  admin: {
    label: 'Administrator',
    description: 'Full access to all features and settings',
    icon: <CrownOutlined />,
    color: '#ff4d4f',
    permissions: [
      'All Operator permissions',
      'Manage plugins',
      'System configuration',
      'Advanced developer tools',
    ],
  },
};

export function RoleSwitcher() {
  const { role, setRole } = useAuth();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  return (
    <div>
      <Title level={4}>
        <UserOutlined style={{ marginRight: 8 }} />
        Mock Authentication
      </Title>
      <Paragraph type="secondary">
        This is a demo authentication system for testing different user roles. In production, this
        would be replaced with real authentication (OAuth, JWT, etc.).
      </Paragraph>

      <Alert
        message="Demo Mode"
        description="No real authentication is performed. Role changes take effect immediately and persist in localStorage."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Radio.Group
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {(Object.entries(ROLE_CONFIG) as [UserRole, (typeof ROLE_CONFIG)[UserRole]][]).map(
              ([roleId, config]) => (
                <Card
                  key={roleId}
                  hoverable
                  style={{
                    borderColor: role === roleId ? config.color : undefined,
                    borderWidth: role === roleId ? 2 : 1,
                  }}
                  onClick={() => handleRoleChange(roleId)}
                >
                  <Radio value={roleId} style={{ marginBottom: 8 }}>
                    <Space>
                      <span style={{ color: config.color, fontSize: 18 }}>{config.icon}</span>
                      <Text strong style={{ fontSize: 16 }}>
                        {config.label}
                      </Text>
                      {role === roleId && (
                        <Text type="success" style={{ fontSize: 12 }}>
                          (Current)
                        </Text>
                      )}
                    </Space>
                  </Radio>
                  <Paragraph type="secondary" style={{ marginLeft: 24, marginBottom: 8 }}>
                    {config.description}
                  </Paragraph>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ marginLeft: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Permissions:
                    </Text>
                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                      {config.permissions.map((permission, idx) => (
                        <li key={idx}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {permission}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )
            )}
          </Space>
        </Radio.Group>
      </Card>

      <Alert
        message="Try it out!"
        description="Switch between roles and navigate through the app to see how different permissions affect the UI and available features."
        type="success"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
}
