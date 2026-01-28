import { Space, theme } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { UICard, UIText } from '@kb-labs/studio-ui-kit';

const { useToken } = theme;

interface NetworkPermissionsProps {
  permissions: {
    fetch: string[];
  };
}

export function NetworkPermissions({ permissions }: NetworkPermissionsProps) {
  const { token } = useToken();

  return (
    <UICard
      title={
        <Space>
          <GlobalOutlined />
          <span>Network Permissions</span>
        </Space>
      }
    >
      <UIText color="secondary" style={{ marginBottom: 16, display: 'block' }}>
        External hosts and APIs that this plugin can communicate with over the network.
      </UIText>
      <div>
        <UIText weight="semibold">Allowed Hosts:</UIText>
        <div style={{ marginTop: 8 }}>
          {permissions.fetch.map((host: string, idx: number) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              <UIText
                style={{
                  fontSize: token.fontSizeSM,
                  fontFamily: token.fontFamilyCode,
                }}
              >
                {host}
              </UIText>
            </div>
          ))}
        </div>
      </div>
    </UICard>
  );
}
