import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { KBPageContainer, KBPageHeader, KBSection } from '@kb-labs/ui-react'
import { useDataSources } from '@/providers/data-sources-provider'
import { useWorkflowRuns } from '@kb-labs/data-client'
import type { WorkflowRun } from '@kb-labs/data-client'
import { WorkflowStatusBadge } from '@/components/workflow-status-badge'

export function WorkflowsListPage() {
  const sources = useDataSources()
  const navigate = useNavigate()
  const filters = useMemo(() => ({ limit: 50 }), [])
  const { data, isLoading, refetch } = useWorkflowRuns(sources.workflow, filters)

  const columns = useMemo<ColumnsType<WorkflowRun>>(
    () => [
      {
        title: 'Run ID',
        dataIndex: 'id',
        key: 'id',
        render: (value: string) => <code>{value}</code>,
      },
      {
        title: 'Workflow',
        dataIndex: 'name',
        key: 'name',
        render: (_value, record) => `${record.name}@${record.version}`,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: WorkflowRun['status']) => <WorkflowStatusBadge status={status} />,
      },
      {
        title: 'Triggered By',
        dataIndex: ['trigger', 'actor'],
        key: 'actor',
        render: (_value, record) => record.trigger.actor ?? 'unknown',
      },
      {
        title: 'Queued At',
        dataIndex: 'queuedAt',
        key: 'queuedAt',
      },
      {
        title: 'Started At',
        dataIndex: 'startedAt',
        key: 'startedAt',
      },
      {
        title: 'Finished At',
        dataIndex: 'finishedAt',
        key: 'finishedAt',
      },
    ],
    [],
  )

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Workflow Runs"
        description="Latest executions handled by the workflow engine"
        extra={
          <Button onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </Button>
        }
      />
      <KBSection>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.runs ?? []}
          loading={isLoading}
          pagination={{ pageSize: 20 }}
          onRow={(record) => ({
            onClick: () => navigate(`/workflows/${record.id}`),
          })}
        />
      </KBSection>
    </KBPageContainer>
  )
}
