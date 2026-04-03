/**
 * @module @kb-labs/studio-app/modules/workflows/pages/workflows-definitions-page
 * Workflow definitions list - standalone page
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UITable,
  UITag,
  UISpace,
  UITypographyText,
  UIButton,
  UIIcon,
  useUIMessage,
} from '@kb-labs/studio-ui-kit';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { WorkflowInfo } from '@kb-labs/studio-data-client';
import { UICard } from '@kb-labs/studio-ui-kit';
import { RunWorkflowModal } from '../components/run-workflow-modal';
import { UIPage, UIPageHeader } from '@kb-labs/studio-ui-kit';

export function WorkflowsDefinitionsPage() {
  const sources = useDataSources();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = useUIMessage();
  const [runModalWorkflow, setRunModalWorkflow] = React.useState<WorkflowInfo | null>(null);

  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['workflow', 'workflows'],
    queryFn: () => sources.workflow.listWorkflows({ limit: 100 }),
  });

  const runWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, input }: { workflowId: string; input: Record<string, unknown> }) =>
      sources.workflow.runWorkflowById(workflowId, input),
    onSuccess: (data) => {
      setRunModalWorkflow(null);
      navigate(`/workflows/runs/${data.runId}`);
    },
    onError: (error: Error, { workflowId }) => {
      messageApi.error(`Failed to start workflow "${workflowId}": ${error.message}`);
    },
  });

  const columns = [
    {
      title: 'Workflow',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name: string, record: WorkflowInfo) => (
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <UITypographyText className="typo-body" strong style={{ display: 'block' }}>{name}</UITypographyText>
          {record.description && (
            <UITypographyText
              className="typo-description text-secondary"
              ellipsis={{ tooltip: record.description }}
              style={{ display: 'block' }}
            >
              {record.description}
            </UITypographyText>
          )}
        </div>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 220,
      render: (id: string) => (
        <UITypographyText className="typo-caption text-tertiary" code ellipsis={{ tooltip: id }}>{id}</UITypographyText>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: 'manifest' | 'standalone') => (
        <UITag color={source === 'manifest' ? 'blue' : 'green'}>
          {source === 'manifest' ? 'Plugin' : 'Standalone'}
        </UITag>
      ),
    },
    {
      title: 'Plugin',
      dataIndex: 'pluginId',
      key: 'pluginId',
      width: 200,
      render: (pluginId?: string) => (
        pluginId ? (
          <UITypographyText className="typo-caption">{pluginId}</UITypographyText>
        ) : (
          <UITypographyText className="typo-caption text-tertiary">-</UITypographyText>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status?: 'active' | 'inactive') => {
        if (!status) {return <UITypographyText className="typo-caption text-tertiary">-</UITypographyText>;}
        return (
          <UITag color={status === 'active' ? 'success' : 'default'}>
            {status.toUpperCase()}
          </UITag>
        );
      },
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags?: string[]) => (
        <UISpace className="gap-tight">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <UITag key={tag} style={{ borderColor: 'var(--border-primary)' }}>
                {tag}
              </UITag>
            ))
          ) : (
            <UITypographyText className="typo-caption text-tertiary">-</UITypographyText>
          )}
        </UISpace>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: WorkflowInfo) => (
        <UISpace className="gap-tight">
          <UIButton
            variant="link"
            size="small"
            icon={<UIIcon name="EyeOutlined" />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/workflows/definitions/${encodeURIComponent(record.id)}`);
            }}
          >
            View
          </UIButton>
          <UIButton
            variant="link"
            size="small"
            icon={<UIIcon name="PlayCircleOutlined" />}
            onClick={(e) => {
              e.stopPropagation();
              setRunModalWorkflow(record);
            }}
          >
            Run
          </UIButton>
        </UISpace>
      ),
    },
  ];

  return (
    <UIPage width="full">
      {contextHolder}
      <UIPageHeader
        title="Workflow Definitions"
        description="All registered workflow definitions"
        icon={<UIIcon name="AppstoreOutlined" />}
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Workflows', href: '/workflows' },
          { title: 'Definitions' },
        ]}
      />

      <UICard>
        <UITable
          dataSource={workflowsData?.workflows || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1270 }}
          pagination={{ pageSize: 20 }}
          onRow={(record: WorkflowInfo) => ({
            style: { cursor: 'pointer' },
            onClick: () => navigate(`/workflows/definitions/${encodeURIComponent(record.id)}`),
          })}
        />
      </UICard>

      <RunWorkflowModal
        open={!!runModalWorkflow}
        workflow={runModalWorkflow}
        loading={runWorkflowMutation.isPending}
        onClose={() => setRunModalWorkflow(null)}
        onRun={(workflowId, input) => {
          runWorkflowMutation.mutate({ workflowId, input });
        }}
      />
    </UIPage>
  );
}
