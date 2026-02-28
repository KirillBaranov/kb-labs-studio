import { KBPageContainer, KBPageHeader, KBSection } from '@/components/ui';
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  UIButton, UIDescriptions, UITable, UITypographyText, UITypographyParagraph,
  UITitle, UIAlert, UIList,
} from '@kb-labs/studio-ui-kit'
import type { ColumnsType } from 'antd/es/table'
import { useDataSources } from '@/providers/data-sources-provider'
import {
  useWorkflowRun,
  useWorkflowLogs,
  useWorkflowEvents,
  useCancelWorkflowRun,
} from '@kb-labs/studio-data-client'
import type { WorkflowRun, JobRun, WorkflowPresenterEvent } from '@kb-labs/studio-data-client'
import { WorkflowStatusBadge } from '@/components/workflow-status-badge'

const Text = UITypographyText
const Paragraph = UITypographyParagraph
const Title = UITitle

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
          <UIButton onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </UIButton>
        }
      />

      {error && <UIAlert type="error" message="Failed to load workflow run" description={String(error)} closable />}

      <KBSection>
        {isLoading && <Text>Loading workflow run...</Text>}
        {!isLoading && !run && !error && <Text>Workflow run not found.</Text>}
        {run && (
          <UIDescriptions bordered column={1} title="Run Metadata" size="small">
            <UIDescriptions.Item label="Run ID">
              <code>{run.id}</code>
            </UIDescriptions.Item>
            <UIDescriptions.Item label="Workflow">
              {run.name}@{run.version}
            </UIDescriptions.Item>
            <UIDescriptions.Item label="Status">
              <WorkflowStatusBadge status={run.status} />
            </UIDescriptions.Item>
            <UIDescriptions.Item label="Trigger">
              {run.trigger.type} — {run.trigger.actor ?? 'unknown'}
            </UIDescriptions.Item>
            <UIDescriptions.Item label="Queued At">{run.queuedAt}</UIDescriptions.Item>
            <UIDescriptions.Item label="Started At">{run.startedAt ?? '—'}</UIDescriptions.Item>
            <UIDescriptions.Item label="Finished At">{run.finishedAt ?? '—'}</UIDescriptions.Item>
            {run.result?.summary && (
              <UIDescriptions.Item label="Summary">{run.result.summary}</UIDescriptions.Item>
            )}
          </UIDescriptions>
        )}
      </KBSection>

      {run && (
        <KBSection>
          <Title level={4}>Jobs</Title>
          <UITable
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
            <UIList
              bordered
              size="small"
              dataSource={Object.entries(run.result.metrics).map(([key, value]) => ({
                key,
                value,
              }))}
              renderItem={({ key, value }) => (
                <UIList.Item>
                  <Text strong>{key}</Text>
                  <span style={{ marginLeft: 8 }}>{String(value ?? '—')}</span>
                </UIList.Item>
              )}
            />
          ) : (
            <Text type="secondary">No metrics recorded.</Text>
          )}
          {run.result.error && (
            <UIAlert
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
          {!isConnected && <UIAlert type="info" message="Connecting to log stream..." showIcon />}
          {logError && <UIAlert type="error" message="Log stream error" description={logError.message} />}
          <UIList
            bordered
            size="small"
            dataSource={events}
            renderItem={(item) => (
              <UIList.Item>
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text code>{item.timestamp ?? ''}</Text>{' '}
                  <Text strong>{item.type}</Text>{' '}
                  {item.jobId && <Text type="secondary">job:{item.jobId}</Text>}{' '}
                  {item.stepId && <Text type="secondary">step:{item.stepId}</Text>}{' '}
                  {item.payload && <Text>{JSON.stringify(item.payload)}</Text>}
                </Paragraph>
              </UIList.Item>
            )}
          />
        </KBSection>
      )}

      {run && (
        <KBSection>
          <Title level={4}>Presenter Events</Title>
          {!presenterConnected && (
            <UIAlert type="info" message="Connecting to presenter event stream..." showIcon />
          )}
          {presenterError && (
            <UIAlert type="error" message="Presenter event stream error" description={presenterError.message} />
          )}
          <UIList
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
                <UIList.Item>
                  <Paragraph style={{ marginBottom: 0 }}>
                    <Text code>{item.timestamp}</Text>{' '}
                    <Text strong>{item.type}</Text>{' '}
                    {stage !== undefined && <Text type="secondary">stage:{String(stage)}</Text>}{' '}
                    {status !== undefined && <Text type="secondary">status:{String(status)}</Text>}{' '}
                    {payload && <Text>{payload}</Text>}
                  </Paragraph>
                </UIList.Item>
              )
            }}
          />
        </KBSection>
      )}

      {run && !isTerminal && (
        <KBSection>
          <UIButton
            danger
            loading={cancelMutation.isPending}
            onClick={() => runId && cancelMutation.mutate(runId)}
          >
            Cancel Run
          </UIButton>
        </KBSection>
      )}
    </KBPageContainer>
  )
}
