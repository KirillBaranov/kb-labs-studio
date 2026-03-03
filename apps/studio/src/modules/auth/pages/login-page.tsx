/**
 * @module @kb-labs/studio-app/pages/login-page
 * Login page placeholder - mock authentication
 *
 * Refactored to use UI Kit components and remove inline styles.
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/providers/auth-provider';
import {
  UIBox, UIText, UITitle, UICard, UIButton, UISpace, UISelect, UIDivider,
  UIMessage, UIIcon, useUITheme,
} from '@kb-labs/studio-ui-kit';

export function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const { token } = useUITheme();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('operator');

  const handleLogin = () => {
    setRole(selectedRole);
    navigate('/');
  };

  const handleSSOLogin = () => {
    UIMessage.info('SSO аутентификация будет реализована позже');
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
      <UICard
        style={{
          maxWidth: '480px',
          width: '100%',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
        }}
        bodyStyle={{ padding: token.paddingXL }}
      >
        <UISpace direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
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
            <UIIcon name="RocketOutlined" style={{ color: 'white' }} />
          </UIBox>

          {/* Title */}
          <UIBox>
            <UITitle level={2} style={{ marginBottom: token.marginXS }}>
              KB Labs Studio
            </UITitle>
            <UIText color="secondary">Добро пожаловать в платформу</UIText>
          </UIBox>

          <UIDivider style={{ margin: `${token.marginXS}px 0` }} />

          {/* Mock Auth Notice */}
          <UIBox
            p={4}
            style={{
              backgroundColor: token.colorBgLayout,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorder}`,
            }}
          >
            <UISpace direction="vertical" size="small" style={{ width: '100%' }}>
              <UIBox style={{ display: 'flex', alignItems: 'center', gap: token.marginXS }}>
                <UIIcon name="LockOutlined" style={{ color: token.colorPrimary }} />
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
            </UISpace>
          </UIBox>

          {/* Role Selector */}
          <UIBox style={{ width: '100%', textAlign: 'left' }}>
            <UIText weight="semibold" style={{ display: 'block', marginBottom: token.marginXS }}>
              Выберите роль:
            </UIText>
            <UISelect
              value={selectedRole}
              onChange={(v) => setSelectedRole(v as UserRole)}
              style={{ width: '100%' }}
              size="large"
              options={[
                {
                  label: 'Viewer — Просмотр данных',
                  value: 'viewer',
                },
                {
                  label: 'Operator — Управление системой',
                  value: 'operator',
                },
                {
                  label: 'Admin — Полный доступ',
                  value: 'admin',
                },
              ]}
            />
          </UIBox>

          {/* Login Buttons */}
          <UISpace direction="vertical" size="middle" style={{ width: '100%' }}>
            <UIButton
              variant="primary"
              size="large"
              block
              icon={<UIIcon name="RocketOutlined" />}
              onClick={handleLogin}
              style={{
                height: '48px',
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
              }}
            >
              Войти в систему
            </UIButton>

            <UIDivider style={{ margin: `${token.marginXS}px 0` }}>
              <UIText color="secondary" size="xs">
                или
              </UIText>
            </UIDivider>

            <UIButton
              size="large"
              block
              icon={<UIIcon name="SafetyOutlined" />}
              onClick={handleSSOLogin}
              style={{
                height: '48px',
                fontSize: token.fontSizeLG,
                fontWeight: token.fontWeightStrong,
              }}
            >
              Войти через SSO
            </UIButton>
          </UISpace>

          {/* Footer */}
          <UIBox mt={4}>
            <UIText color="secondary" size="xs">
              © 2025 KB Labs Studio. Development Preview.
            </UIText>
          </UIBox>
        </UISpace>
      </UICard>
    </UIBox>
  );
}
