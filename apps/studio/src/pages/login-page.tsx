/**
 * @module @kb-labs/studio-app/pages/login-page
 * Login page placeholder - mock authentication
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Select, Divider, message } from 'antd';
import { UserOutlined, RocketOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth, type UserRole } from '@/providers/auth-provider';

const { Title, Text, Paragraph } = Typography;

export function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('operator');

  const handleLogin = () => {
    setRole(selectedRole);
    navigate('/');
  };

  const handleSSOLogin = () => {
    message.info('SSO аутентификация будет реализована позже');
    // TODO: Implement SSO authentication
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}
    >
      <Card
        style={{
          maxWidth: '480px',
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        bodyStyle={{ padding: '3rem' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            <RocketOutlined style={{ color: 'white' }} />
          </div>

          {/* Title */}
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              KB Labs Studio
            </Title>
            <Text type="secondary">Добро пожаловать в платформу</Text>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* Mock Auth Notice */}
          <div
            style={{
              padding: '16px',
              background: '#f0f5ff',
              borderRadius: '8px',
              border: '1px solid #adc6ff',
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LockOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#1890ff' }}>
                  Режим разработки
                </Text>
              </div>
              <Paragraph
                type="secondary"
                style={{ margin: 0, fontSize: '0.875rem', textAlign: 'left' }}
              >
                Это заглушка для входа. Выберите роль и войдите без пароля.
              </Paragraph>
            </Space>
          </div>

          {/* Role Selector */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Выберите роль:
            </Text>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: '100%' }}
              size="large"
              options={[
                {
                  label: (
                    <Space>
                      <UserOutlined />
                      <span>
                        <strong>Viewer</strong> — Просмотр данных
                      </span>
                    </Space>
                  ),
                  value: 'viewer',
                },
                {
                  label: (
                    <Space>
                      <UserOutlined />
                      <span>
                        <strong>Operator</strong> — Управление системой
                      </span>
                    </Space>
                  ),
                  value: 'operator',
                },
                {
                  label: (
                    <Space>
                      <UserOutlined />
                      <span>
                        <strong>Admin</strong> — Полный доступ
                      </span>
                    </Space>
                  ),
                  value: 'admin',
                },
              ]}
            />
          </div>

          {/* Login Buttons */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              icon={<RocketOutlined />}
              onClick={handleLogin}
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Войти в систему
            </Button>

            <Divider style={{ margin: '8px 0' }}>
              <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                или
              </Text>
            </Divider>

            <Button
              size="large"
              block
              icon={<SafetyOutlined />}
              onClick={handleSSOLogin}
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              Войти через SSO
            </Button>
          </Space>

          {/* Footer */}
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '0.75rem' }}>
              © 2025 KB Labs Studio. Development Preview.
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
