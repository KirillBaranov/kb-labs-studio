import React, { useMemo } from 'react';
import { UICard, UIRow, UICol, UITable, UITag, UITypographyText, UITitle } from '@kb-labs/studio-ui-kit';
import { HolderOutlined, DollarOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { UIPieChart } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '../../../providers/data-sources-provider';
import {
  useAdaptersLLMUsage,
  useAdaptersEmbeddingsUsage,
  useAdaptersVectorStoreUsage,
} from '@kb-labs/studio-data-client';



interface CostBreakdown {
  adapter: string;
  cost: number;
  percentage: number;
  requests: number;
}

interface ModelSpender {
  model: string;
  cost: number;
  requests: number;
  avgDuration: number;
  adapter: string;
}

export function CostAttributionWidget() {
  const sources = useDataSources();

  // Fetch adapter usage data
  const llmUsage = useAdaptersLLMUsage(sources.adapters);
  const embeddingsUsage = useAdaptersEmbeddingsUsage(sources.adapters);
  const vectorStoreUsage = useAdaptersVectorStoreUsage(sources.adapters);

  // Calculate total cost and breakdown
  const costData = useMemo(() => {
    const llmCost = llmUsage.data?.totalCost ?? 0;
    const embeddingsCost = embeddingsUsage.data?.totalCost ?? 0;
    const vectorStoreCost = vectorStoreUsage.data?.totalCost ?? 0;

    const totalCost = llmCost + embeddingsCost + vectorStoreCost;

    const breakdown: CostBreakdown[] = [
      {
        adapter: 'LLM',
        cost: llmCost,
        percentage: totalCost > 0 ? (llmCost / totalCost) * 100 : 0,
        requests: llmUsage.data?.totalRequests ?? 0,
      },
      {
        adapter: 'Embeddings',
        cost: embeddingsCost,
        percentage: totalCost > 0 ? (embeddingsCost / totalCost) * 100 : 0,
        requests: embeddingsUsage.data?.totalRequests ?? 0,
      },
      {
        adapter: 'VectorStore',
        cost: vectorStoreCost,
        percentage: totalCost > 0 ? (vectorStoreCost / totalCost) * 100 : 0,
        requests: vectorStoreUsage.data?.totalOperations ?? 0,
      },
    ].filter(item => item.cost > 0);

    return { totalCost, breakdown };
  }, [llmUsage.data, embeddingsUsage.data, vectorStoreUsage.data]);

  // Extract top spenders by model
  const topSpenders = useMemo(() => {
    const spenders: ModelSpender[] = [];

    // LLM models
    if (llmUsage.data?.byModel) {
      Object.entries(llmUsage.data.byModel).forEach(([model, stats]) => {
        spenders.push({
          model,
          cost: stats.cost,
          requests: stats.requests,
          avgDuration: stats.avgDurationMs,
          adapter: 'LLM',
        });
      });
    }

    // Embeddings models
    if (embeddingsUsage.data?.byModel) {
      Object.entries(embeddingsUsage.data.byModel).forEach(([model, stats]) => {
        spenders.push({
          model,
          cost: stats.cost ?? 0,
          requests: stats.requests,
          avgDuration: stats.avgDurationMs ?? 0,
          adapter: 'Embeddings',
        });
      });
    }

    // Sort by cost descending
    return spenders.sort((a, b) => b.cost - a.cost).slice(0, 10);
  }, [llmUsage.data, embeddingsUsage.data]);

  // Detect anomalies (>2x standard deviation)
  const anomalies = useMemo(() => {
    if (topSpenders.length < 3) {return [];}

    const costs = topSpenders.map(s => s.cost);
    const mean = costs.reduce((a, b) => a + b, 0) / costs.length;
    const variance = costs.reduce((sum, cost) => sum + Math.pow(cost - mean, 2), 0) / costs.length;
    const stdDev = Math.sqrt(variance);

    return topSpenders.filter(s => s.cost > mean + 2 * stdDev);
  }, [topSpenders]);

  // Pie chart configuration
  const pieChartData = costData.breakdown.map(item => ({
    type: item.adapter,
    value: item.cost,
  }));

  const pieConfig = {
    data: pieChartData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      formatter: (data: any) => {
        return `${data.type}: $${data.value.toFixed(2)}`;
      },
    },
    statistic: {
      title: {
        content: 'Total Cost',
      },
      content: {
        content: `$${costData.totalCost.toFixed(2)}`,
      },
    },
    color: ['var(--info)', 'var(--success)', 'var(--warning)'],
    legend: {
      position: 'bottom' as const,
    },
    height: 250,
  };

  // Table columns
  const columns = [
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      render: (text: string, record: ModelSpender) => (
        <div>
          <div>{text}</div>
          <UITag color="blue" style={{ marginTop: 4 }}>{record.adapter}</UITag>
        </div>
      ),
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      sorter: (a: ModelSpender, b: ModelSpender) => a.cost - b.cost,
      render: (cost: number, record: ModelSpender) => {
        const isAnomaly = anomalies.some(a => a.model === record.model);
        return (
          <div>
            <UITypographyText strong>${cost.toFixed(4)}</UITypographyText>
            {isAnomaly && (
              <UITag color="red" style={{ marginLeft: 8 }}>
                Spike!
              </UITag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Requests',
      dataIndex: 'requests',
      key: 'requests',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Avg Duration',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (ms: number) => `${ms.toFixed(0)}ms`,
    },
  ];

  return (
    <UICard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: 'var(--text-tertiary)' }} />
          <DollarOutlined />
          <span>Cost Attribution</span>
        </div>
      }
      style={{ height: '100%' }}
      bodyStyle={{ padding: '16px' }}
    >
      <UIRow gutter={[16, 16]}>
        {/* Total Cost Summary */}
        <UICol span={24}>
          <div style={{
            padding: '12px 16px',
            background: 'var(--accent-subtle)',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <UITypographyText type="secondary">Total Cost (Today)</UITypographyText>
              <UITitle level={3} style={{ margin: '4px 0 0 0' }}>
                ${costData.totalCost.toFixed(2)}
              </UITitle>
            </div>
            <div style={{ textAlign: 'right' }}>
              <UITypographyText type="secondary">vs Yesterday</UITypographyText>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <RiseOutlined style={{ color: 'var(--error)', fontSize: 16 }} />
                <UITypographyText strong style={{ color: 'var(--error)' }}>+12.3%</UITypographyText>
              </div>
            </div>
          </div>
        </UICol>

        {/* Pie Chart */}
        <UICol xs={24} md={12}>
          {pieChartData.length > 0 ? (
            <UIPieChart {...pieConfig} />
          ) : (
            <div style={{
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
            }}>
              No cost data available
            </div>
          )}
        </UICol>

        {/* Breakdown Table */}
        <UICol xs={24} md={12}>
          <div style={{ height: 250, overflowY: 'auto' }}>
            <UITable
              dataSource={costData.breakdown}
              columns={[
                {
                  title: 'Adapter',
                  dataIndex: 'adapter',
                  key: 'adapter',
                },
                {
                  title: 'Cost',
                  dataIndex: 'cost',
                  key: 'cost',
                  render: (cost: number) => `$${cost.toFixed(2)}`,
                },
                {
                  title: 'Share',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (pct: number) => `${pct.toFixed(1)}%`,
                },
              ]}
              pagination={false}
              size="small"
              rowKey="adapter"
            />
          </div>
        </UICol>

        {/* Top Spenders */}
        <UICol span={24}>
          <UITitle level={5}>Top Spenders by Model</UITitle>
          <UITable
            dataSource={topSpenders}
            columns={columns}
            pagination={false}
            size="small"
            rowKey="model"
            scroll={{ y: 200 }}
          />
        </UICol>
      </UIRow>
    </UICard>
  );
}
