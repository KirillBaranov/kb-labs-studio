import { Space, theme } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { UICard, UIText } from '@kb-labs/studio-ui-kit';

const { useToken } = theme;

interface FilesystemPermissionsProps {
  permissions: {
    read?: string[];
    write?: string[];
  };
}

export function FilesystemPermissions({ permissions }: FilesystemPermissionsProps) {
  const { token } = useToken();

  return (
    <UICard
      title={
        <Space>
          <LockOutlined />
          <span>Filesystem Permissions</span>
        </Space>
      }
    >
      <UIText color="secondary" style={{ marginBottom: 16, display: 'block' }}>
        File and directory access patterns that this plugin is allowed to use. Read access allows
        viewing files, write access allows creating or modifying files.
      </UIText>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {permissions.read && permissions.read.length > 0 && (
          <div>
            <UIText weight="semibold">Read Access:</UIText>
            <div style={{ marginTop: 8 }}>
              {permissions.read.map((path: string, idx: number) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <UIText
                    style={{
                      fontSize: token.fontSizeSM,
                      fontFamily: token.fontFamilyCode,
                    }}
                  >
                    {path}
                  </UIText>
                </div>
              ))}
            </div>
          </div>
        )}
        {permissions.write && permissions.write.length > 0 && (
          <div>
            <UIText weight="semibold">Write Access:</UIText>
            <div style={{ marginTop: 8 }}>
              {permissions.write.map((path: string, idx: number) => (
                <div key={idx} style={{ marginBottom: 4 }}>
                  <UIText
                    style={{
                      fontSize: token.fontSizeSM,
                      fontFamily: token.fontFamilyCode,
                    }}
                  >
                    {path}
                  </UIText>
                </div>
              ))}
            </div>
          </div>
        )}
      </Space>
    </UICard>
  );
}
