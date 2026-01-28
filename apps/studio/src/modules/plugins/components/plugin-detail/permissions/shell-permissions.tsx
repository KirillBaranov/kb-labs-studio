import { Space, Alert, theme } from 'antd';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import { UICard, UIText } from '@kb-labs/studio-ui-kit';

const { useToken } = theme;

interface ShellPermissionsProps {
  permissions: {
    allow?: string[];
  };
}

export function ShellPermissions({ permissions }: ShellPermissionsProps) {
  const { token } = useToken();

  return (
    <UICard
      title={
        <Space>
          <ConsoleSqlOutlined />
          <span>Shell Permissions</span>
        </Space>
      }
    >
      <UIText color="secondary" style={{ marginBottom: 16, display: 'block' }}>
        Shell commands that this plugin is allowed to execute. Shell access is restricted by
        default for security.
      </UIText>
      {permissions.allow && permissions.allow.length > 0 ? (
        <div>
          <UIText weight="semibold">Allowed Commands:</UIText>
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {permissions.allow.map((cmd: string, idx: number) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <UIText
                    style={{
                      fontSize: token.fontSizeSM,
                      fontFamily: token.fontFamilyCode,
                    }}
                  >
                    {cmd}
                  </UIText>
                </div>
              ))}
            </Space>
          </div>
        </div>
      ) : (
        <Alert
          type="warning"
          message="Shell access disabled"
          description="This plugin has no shell execution permissions."
          showIcon
        />
      )}
    </UICard>
  );
}
