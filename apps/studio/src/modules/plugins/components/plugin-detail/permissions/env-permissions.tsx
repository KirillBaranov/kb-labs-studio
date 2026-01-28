import { Space } from 'antd';
import { UICard, UIText, UITag } from '@kb-labs/studio-ui-kit';

interface EnvPermissionsProps {
  permissions: {
    read: string[];
  };
}

export function EnvPermissions({ permissions }: EnvPermissionsProps) {
  return (
    <UICard title="Environment Variables">
      <UIText color="secondary" style={{ marginBottom: 16, display: 'block' }}>
        System environment variables that this plugin can access. Used for configuration and
        secrets management.
      </UIText>
      <div>
        <UIText strong>Read Access:</UIText>
        <div style={{ marginTop: 8 }}>
          <Space wrap>
            {permissions.read.map((env: string, idx: number) => (
              <UITag key={idx} color="cyan">
                {env}
              </UITag>
            ))}
          </Space>
        </div>
      </div>
    </UICard>
  );
}
