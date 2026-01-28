/**
 * @module @kb-labs/studio-app/pages/login-page
 * Login page placeholder - mock authentication
 *
 * Refactored to use UI Kit components and remove inline styles.
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Select, Divider, message, theme } from 'antd';
import { UserOutlined, RocketOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth, type UserRole } from '@/providers/auth-provider';
import { UIBox, UIText, UITitle } from '@kb-labs/studio-ui-kit';

const { useToken } = theme;

export function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const { token } = useToken();
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
    <UIBox
      p={8}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: token.colorBgLayout,
      }}
    >
      <Card
        style={{
          maxWidth: '480px',
          width: '100%',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
        bodyStyle={{ padding: token.paddingXL }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <UIBox
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: token.borderRadiusLG,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            <RocketOutlined style={{ color: 'white' }} />
          </UIBox>

          {/* Title */}
          <UIBox>
            <UITitle level={2} style={{ marginBottom: token.marginXS }}>
              KB Labs Studio
            </UITitle>
            <UIText color="secondary">Добро пожаловать в платформу</UIText>
          </UIBox>

          <Divider style={{ margin: `${token.marginXS}px 0` }} />

          {/* Mock Auth Notice */}
          <UIBox
            p={4}
            style={{
              backgroundColor: token.colorBgLayout,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorder}`,
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <UIBox style={{ display: 'flex', alignItems: 'center', gap: token.marginXS }}>
                <LockOutlined style={{ color: token.colorPrimary }} />
                <UIText weight="semibold" style={{ color: token.colorPrimary }}>
                  Режим разработки
                </UIText>
              </UIBox>
              <UIText
                color="secondary"
                size="sm"
                style={{ margin: 0, textAlign: 'left' }}
              >
                Это заглушка для входа. Выберите роль и войдите без пароля.
              </UIText>
            </Space>
          </UIBox>

          {/* Role Selector */}
          <UIBox style={{ width: '100%', textAlign: 'left' }}>
            <UIText weight="semibold" style={{ display: 'block', marginBottom: token.marginXS }}>
              Выберите роль:
            </UIText>
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
          </UIBox>

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
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
              }}
            >
              Войти в систему
            </Button>

            <Divider style={{ margin: `${token.marginXS}px 0` }}>
              <UIText color="secondary" size="xs">
                или
              </UIText>
            </Divider>

            <Button
              size="large"
              block
              icon={<SafetyOutlined />}
              onClick={handleSSOLogin}
              style={{
                height: '48px',
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
              }}
            >
              Войти через SSO
            </Button>
          </Space>

          {/* Footer */}
          <UIBox mt={4}>
            <UIText color="secondary" size="xs">
              © 2025 KB Labs Studio. Development Preview.
            </UIText>
          </UIBox>
        </Space>
      </Card>
    </UIBox>
  );
}
