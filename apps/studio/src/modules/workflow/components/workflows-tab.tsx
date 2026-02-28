/**
 * @module @kb-labs/studio-app/modules/workflow/components/workflows-tab
 * Workflows list view with details
 */

import * as React from 'react';
import {
  UITable,
  UITag,
  UISpace,
  UITypographyText,
  UIButton,
  UIModal, UIModalConfirm,
  UIMessage,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { WorkflowInfo } from '@kb-labs/workflow-contracts';
import { UICard } from '@kb-labs/studio-ui-kit';

export function WorkflowsTab() {
  const sources = useDataSources();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = UIMessage.useMessage();

  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['workflow', 'workflows'],
    queryFn: () => sources.workflow.listWorkflows({ limit: 100 }),
  });

  const runWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) => sources.workflow.runWorkflowById(workflowId),
    onSuccess: (data, workflowId) => {
      messageApi.success(`Workflow "${workflowId}" started successfully! Run ID: ${data.runId}`);
      queryClient.invalidateQueries({ queryKey: ['workflow', 'jobs'] });
    },
    onError: (error: Error, workflowId) => {
      messageApi.error(`Failed to start workflow "${workflowId}": ${error.message}`);
    },
  });

  const handleRunWorkflow = (workflowId: string, workflowName: string) => {
    UIModalConfirm({
      title: 'Run Workflow',
      content: `Are you sure you want to run workflow "${workflowName}" (${workflowId})?`,
      okText: 'Run',
      cancelText: 'Cancel',
      onOk: () => {
        runWorkflowMutation.mutate(workflowId);
      },
    });
  };

  const columns = [
    {
      title: 'Workflow',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: WorkflowInfo) => (
        <UISpace direction="vertical" className="gap-tight">
          <UITypographyText className="typo-body" strong>{name}</UITypographyText>
          {record.description && (
            <UITypographyText className="typo-description text-secondary">{record.description}</UITypographyText>
          )}
        </UISpace>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <UITypographyText className="typo-caption text-tertiary" code>{id}</UITypographyText>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
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
      render: (pluginId?: string) => (
        pluginId ? (
          <UITypographyText className="typo-caption">{pluginId}</UITypographyText>
        ) : (
          <UITypographyText className="typo-caption text-tertiary">—</UITypographyText>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status?: 'active' | 'inactive') => {
        if (!status) {return <UITypographyText className="typo-caption text-tertiary">—</UITypographyText>;}
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
      render: (tags?: string[]) => (
        <UISpace className="gap-tight">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <UITag key={tag} style={{ borderColor: 'var(--border-primary)' }}>
                {tag}
              </UITag>
            ))
          ) : (
            <UITypographyText className="typo-caption text-tertiary">—</UITypographyText>
          )}
        </UISpace>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: WorkflowInfo) => (
        <UISpace className="gap-tight">
          <UIButton
            type="link"
            size="small"
            icon={<UIIcon name="EyeOutlined" />}
            onClick={() => {
              // TODO: Navigate to workflow detail page
              console.log('View workflow:', record.id);
            }}
          >
            View
          </UIButton>
          <UIButton
            type="link"
            size="small"
            icon={<UIIcon name="PlayCircleOutlined" />}
            loading={runWorkflowMutation.isPending}
            onClick={() => handleRunWorkflow(record.id, record.name)}
          >
            Run
          </UIButton>
        </UISpace>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <UICard>
        <UITable
          dataSource={workflowsData?.workflows || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <UITypographyText className="typo-caption">Total {total} workflows</UITypographyText>
            ),
          }}
        />
      </UICard>
    </>
  );
}
