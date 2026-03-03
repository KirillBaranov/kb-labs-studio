import { KBPageContainer, KBPageHeader, KBSection } from '@/components/ui';
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UITable, UIButton, UIModal, UIForm, UIFormItem, useUIForm, UIInput, UIInputTextArea, UIMessage } from '@kb-labs/studio-ui-kit'
import type { UITableColumn } from '@kb-labs/studio-ui-kit'
import { useDataSources } from '@/providers/data-sources-provider'
import { useWorkflowRuns, useRunWorkflow } from '@kb-labs/studio-data-client'
import type { WorkflowRun, WorkflowSpec } from '@kb-labs/studio-data-client'
import { WorkflowStatusBadge } from '@/components/workflow-status-badge'

export function WorkflowsListPage() {
  const sources = useDataSources()
  const navigate = useNavigate()
  const filters = useMemo(() => ({ limit: 50 }), [])
  const { data, isLoading, refetch } = useWorkflowRuns(sources.workflow, filters)
  const runWorkflowMutation = useRunWorkflow(sources.workflow)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = useUIForm()

  const handleRunWorkflow = async () => {
    try {
      const values = await form.validateFields()
      let spec: WorkflowSpec

      try {
        spec = typeof values.spec === 'string' ? JSON.parse(values.spec) : values.spec
      } catch (error) {
        UIMessage.error('Invalid JSON in workflow spec')
        return
      }

      const run = await runWorkflowMutation.mutateAsync({
        spec,
        metadata: values.metadata ? (typeof values.metadata === 'string' ? JSON.parse(values.metadata) : values.metadata) : undefined,
      })

      UIMessage.success(`Workflow run started: ${run.id}`)
      setIsModalOpen(false)
      form.resetFields()
      void refetch()
      navigate(`/workflows/${run.id}`)
    } catch (error) {
      UIMessage.error(`Failed to run workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const columns = useMemo<UITableColumn<WorkflowRun>[]>(
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
          <>
            <UIButton onClick={() => setIsModalOpen(true)} variant="primary" style={{ marginRight: 8 }}>
              Run Workflow
            </UIButton>
            <UIButton onClick={() => refetch()} disabled={isLoading}>
              Refresh
            </UIButton>
          </>
        }
      />
      <KBSection>
        <UITable
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

      <UIModal
        title="Run Workflow"
        open={isModalOpen}
        onOk={handleRunWorkflow}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        confirmLoading={runWorkflowMutation.isPending}
        width={800}
      >
        <UIForm form={form} layout="vertical">
          <UIFormItem
            name="spec"
            label="Workflow Spec (JSON)"
            rules={[{ required: true, message: 'Please provide workflow spec' }]}
            tooltip="Workflow specification in JSON format. Example: { 'name': 'my-workflow', 'version': '1.0.0', 'jobs': {...} }"
          >
            <UIInputTextArea
              rows={12}
              placeholder={`{
  "name": "my-workflow",
  "version": "1.0.0",
  "jobs": {
    "job1": {
      "steps": [
        {
          "name": "step1",
          "command": "echo hello"
        }
      ]
    }
  }
}`}
            />
          </UIFormItem>
          <UIFormItem
            name="metadata"
            label="Metadata (JSON, optional)"
            tooltip="Optional metadata to attach to the workflow run"
          >
            <UIInputTextArea
              rows={4}
              placeholder={`{
  "source": "studio",
  "description": "Manual run from Studio"
}`}
            />
          </UIFormItem>
        </UIForm>
      </UIModal>
    </KBPageContainer>
  )
}
