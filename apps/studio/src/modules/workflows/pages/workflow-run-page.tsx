import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Descriptions, Table, Typography, Alert, List } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { KBPageContainer, KBPageHeader, KBSection } from '@kb-labs/ui-react'
import { useDataSources } from '@/providers/data-sources-provider'
import {
  useWorkflowRun,
  useWorkflowLogs,
  useWorkflowEvents,
  useCancelWorkflowRun,
} from '@kb-labs/data-client'
import type { WorkflowRun, JobRun, WorkflowPresenterEvent } from '@kb-labs/data-client'
import { WorkflowStatusBadge } from '@/components/workflow-status-badge'

const { Paragraph, Text, Title } = Typography

export function WorkflowRunPage() {
  const params = useParams<{ runId: string }>()
  const runId = params.runId ?? null
  const sources = useDataSources()
  const { data: run, isLoading, error, refetch } = useWorkflowRun(runId, sources.workflow)
  const cancelMutation = useCancelWorkflowRun(sources.workflow)
  const { events, error: logError, isConnected } = useWorkflowLogs(runId, { follow: true })
  const {
    events: presenterEvents,
    error: presenterError,
    isConnected: presenterConnected,
  } = useWorkflowEvents(runId, { follow: true })

  const jobColumns = useMemo<ColumnsType<JobRun>>(
    () => [
      {
        title: 'Job',
        dataIndex: 'jobName',
        key: 'jobName',
      },
      {
        title: 'Runs On',
        dataIndex: 'runsOn',
        key: 'runsOn',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: JobRun['status']) => <WorkflowStatusBadge status={status as WorkflowRun['status']} />,
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

  const isTerminal = run?.status && ['success', 'failed', 'cancelled', 'skipped'].includes(run.status)

  return (
    <KBPageContainer>
      <KBPageHeader
        title={`Workflow Run ${runId ?? ''}`}
        description="Detailed status of the workflow execution"
        extra={
          <Button onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </Button>
        }
      />

      {error && <Alert type="error" message="Failed to load workflow run" description={String(error)} closable />}

      <KBSection>
        {isLoading && <Text>Loading workflow run...</Text>}
        {!isLoading && !run && !error && <Text>Workflow run not found.</Text>}
        {run && (
          <Descriptions bordered column={1} title="Run Metadata" size="small">
            <Descriptions.Item label="Run ID">
              <code>{run.id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Workflow">
              {run.name}@{run.version}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <WorkflowStatusBadge status={run.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Trigger">
              {run.trigger.type} — {run.trigger.actor ?? 'unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Queued At">{run.queuedAt}</Descriptions.Item>
            <Descriptions.Item label="Started At">{run.startedAt ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Finished At">{run.finishedAt ?? '—'}</Descriptions.Item>
            {run.result?.summary && (
              <Descriptions.Item label="Summary">{run.result.summary}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </KBSection>

      {run && (
        <KBSection>
          <Title level={4}>Jobs</Title>
          <Table
            rowKey="id"
            dataSource={run.jobs}
            columns={jobColumns}
            pagination={false}
            size="small"
          />
        </KBSection>
      )}

      {run?.result && (
        <KBSection>
          <Title level={4}>Result Metrics</Title>
          {run.result.metrics ? (
            <List
              bordered
              size="small"
              dataSource={Object.entries(run.result.metrics).map(([key, value]) => ({
                key,
                value,
              }))}
              renderItem={({ key, value }) => (
                <List.Item>
                  <Text strong>{key}</Text>
                  <span style={{ marginLeft: 8 }}>{String(value ?? '—')}</span>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No metrics recorded.</Text>
          )}
          {run.result.error && (
            <Alert
              style={{ marginTop: 16 }}
              type="error"
              message={run.result.error.message}
              description={
                run.result.error.details ? JSON.stringify(run.result.error.details, null, 2) : undefined
              }
              showIcon
            />
          )}
        </KBSection>
      )}

      {run && (
        <KBSection>
          <Title level={4}>Logs</Title>
          {!isConnected && <Alert type="info" message="Connecting to log stream..." showIcon />}
          {logError && <Alert type="error" message="Log stream error" description={logError.message} />}
          <List
            bordered
            size="small"
            dataSource={events}
            renderItem={(item) => (
              <List.Item>
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text code>{item.timestamp ?? ''}</Text>{' '}
                  <Text strong>{item.type}</Text>{' '}
                  {item.jobId && <Text type="secondary">job:{item.jobId}</Text>}{' '}
                  {item.stepId && <Text type="secondary">step:{item.stepId}</Text>}{' '}
                  {item.payload && <Text>{JSON.stringify(item.payload)}</Text>}
                </Paragraph>
              </List.Item>
            )}
          />
        </KBSection>
      )}

      {run && (
        <KBSection>
          <Title level={4}>Presenter Events</Title>
          {!presenterConnected && (
            <Alert type="info" message="Connecting to presenter event stream..." showIcon />
          )}
          {presenterError && (
            <Alert type="error" message="Presenter event stream error" description={presenterError.message} />
          )}
          <List
            bordered
            size="small"
            dataSource={presenterEvents}
            renderItem={(item: WorkflowPresenterEvent) => {
              const meta = (item.meta ?? {}) as Record<string, unknown>
              const stage = meta.stage
              const status = meta.status
              const payload =
                item.payload == null
                  ? null
                  : typeof item.payload === 'string'
                    ? item.payload
                    : JSON.stringify(item.payload)

              return (
                <List.Item>
                  <Paragraph style={{ marginBottom: 0 }}>
                    <Text code>{item.timestamp}</Text>{' '}
                    <Text strong>{item.type}</Text>{' '}
                    {stage !== undefined && <Text type="secondary">stage:{String(stage)}</Text>}{' '}
                    {status !== undefined && <Text type="secondary">status:{String(status)}</Text>}{' '}
                    {payload && <Text>{payload}</Text>}
                  </Paragraph>
                </List.Item>
              )
            }}
          />
        </KBSection>
      )}

      {run && !isTerminal && (
        <KBSection>
          <Button
            danger
            loading={cancelMutation.isPending}
            onClick={() => runId && cancelMutation.mutate(runId)}
          >
            Cancel Run
          </Button>
        </KBSection>
      )}
    </KBPageContainer>
  )
}
