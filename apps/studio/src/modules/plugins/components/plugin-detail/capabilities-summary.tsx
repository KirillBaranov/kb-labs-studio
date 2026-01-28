import { Space, Alert } from 'antd';
import {
  CodeOutlined,
  ApiOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
  LockOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { UICard, UITag } from '@kb-labs/studio-ui-kit';

interface CapabilitiesSummaryProps {
  cliCommands: any[];
  restRoutes: any[];
  workflowHandlers: any[];
  jobs: any[];
  permissions?: any;
  platformReqs?: {
    requires?: string[];
  };
}

export function CapabilitiesSummary({
  cliCommands,
  restRoutes,
  workflowHandlers,
  jobs,
  permissions,
  platformReqs,
}: CapabilitiesSummaryProps) {
  return (
    <UICard title="Capabilities">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap size="large">
          {cliCommands.length > 0 && (
            <div>
              <UITag
                icon={<CodeOutlined />}
                color="blue"
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {cliCommands.length} CLI Command{cliCommands.length > 1 ? 's' : ''}
              </UITag>
            </div>
          )}
          {restRoutes.length > 0 && (
            <div>
              <UITag
                icon={<ApiOutlined />}
                color="green"
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {restRoutes.length} REST Route{restRoutes.length > 1 ? 's' : ''}
              </UITag>
            </div>
          )}
          {workflowHandlers.length > 0 && (
            <div>
              <UITag
                icon={<NodeIndexOutlined />}
                color="purple"
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {workflowHandlers.length} Workflow{workflowHandlers.length > 1 ? 's' : ''}
              </UITag>
            </div>
          )}
          {jobs.length > 0 && (
            <div>
              <UITag
                icon={<ClockCircleOutlined />}
                color="orange"
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {jobs.length} Scheduled Job{jobs.length > 1 ? 's' : ''}
              </UITag>
            </div>
          )}
        </Space>

        {permissions && (
          <Alert
            icon={<LockOutlined />}
            type="warning"
            message="This plugin requires permissions"
            description="See Permissions tab for details"
            showIcon
          />
        )}
        {platformReqs?.requires && platformReqs.requires.length > 0 && (
          <Alert
            icon={<DatabaseOutlined />}
            type="info"
            message="Platform Requirements"
            description={
              <Space wrap>
                {platformReqs.requires.map((req) => (
                  <UITag key={req} color="cyan">
                    {req}
                  </UITag>
                ))}
              </Space>
            }
            showIcon
          />
        )}
      </Space>
    </UICard>
  );
}
