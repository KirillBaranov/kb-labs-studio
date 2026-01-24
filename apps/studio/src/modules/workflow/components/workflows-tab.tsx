/**
 * @module @kb-labs/studio-app/modules/workflow/components/workflows-tab
 * Workflows list view with details
 */

import * as React from 'react';
import { Table, Tag, Space, Typography, Button, Modal, message } from 'antd';
import { EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import { KBCard } from '@kb-labs/studio-ui-react';
import type { WorkflowInfo } from '@kb-labs/workflow-contracts';

const { Text } = Typography;

export function WorkflowsTab() {
  const sources = useDataSources();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

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
    Modal.confirm({
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
        <Space direction="vertical" className="gap-tight">
          <Text className="typo-body" strong>{name}</Text>
          {record.description && (
            <Text className="typo-description text-secondary">{record.description}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Text className="typo-caption text-tertiary" code>{id}</Text>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source: 'manifest' | 'standalone') => (
        <Tag color={source === 'manifest' ? 'blue' : 'green'}>
          {source === 'manifest' ? 'Plugin' : 'Standalone'}
        </Tag>
      ),
    },
    {
      title: 'Plugin',
      dataIndex: 'pluginId',
      key: 'pluginId',
      render: (pluginId?: string) => (
        pluginId ? (
          <Text className="typo-caption">{pluginId}</Text>
        ) : (
          <Text className="typo-caption text-tertiary">—</Text>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status?: 'active' | 'inactive') => {
        if (!status) return <Text className="typo-caption text-tertiary">—</Text>;
        return (
          <Tag color={status === 'active' ? 'success' : 'default'}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags?: string[]) => (
        <Space className="gap-tight">
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag key={tag} style={{ borderColor: 'var(--border-primary)' }}>
                {tag}
              </Tag>
            ))
          ) : (
            <Text className="typo-caption text-tertiary">—</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: WorkflowInfo) => (
        <Space className="gap-tight">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              // TODO: Navigate to workflow detail page
              console.log('View workflow:', record.id);
            }}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            loading={runWorkflowMutation.isPending}
            onClick={() => handleRunWorkflow(record.id, record.name)}
          >
            Run
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <KBCard>
        <Table
          dataSource={workflowsData?.workflows || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <Text className="typo-caption">Total {total} workflows</Text>
            ),
          }}
        />
      </KBCard>
    </>
  );
}
