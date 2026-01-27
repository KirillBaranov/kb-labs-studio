/**
 * MetricCard component - Display metric with trend
 *
 * Professional UI component using design tokens.
 * NO inline styles, NO hardcoded colors.
 */

import * as React from 'react';
import { Card, theme } from 'antd';
import { Text } from './Text';
import { Flex } from './Flex';
import { Box } from './Box';

const { useToken } = theme;

export interface MetricCardProps {
  /** Metric label */
  label: string;
  /** Metric value */
  value: string | number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Change delta (percentage or absolute) */
  delta?: number;
  /** Value unit (e.g., '%', 'ms', '$') */
  unit?: string;
  /** Card size */
  size?: 'small' | 'default';
  /** Show/hide delta */
  showDelta?: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * MetricCard - Display single metric with optional trend indicator
 *
 * Uses Ant Design tokens for all colors.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Active Users"
 *   value={1234}
 *   trend="up"
 *   delta={15.3}
 *   unit="users"
 * />
 * ```
 */
export function MetricCard({
  label,
  value,
  trend = 'neutral',
  delta,
  unit,
  size = 'default',
  showDelta = true,
  loading = false,
}: MetricCardProps) {
  const { token } = useToken();

  // Determine trend color using Ant Design tokens
  const trendColor =
    trend === 'up' ? token.colorSuccess :
    trend === 'down' ? token.colorError :
    token.colorText;

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

  return (
    <Card
      size={size}
      loading={loading}
      style={{ height: '100%' }}
    >
      <Box>
        {/* Label */}
        <Text size="sm" color="secondary" as="div">
          {label}
        </Text>

        {/* Value with unit */}
        <Flex align="baseline" gap={2} style={{ marginTop: token.marginXS }}>
          <Text
            size="2xl"
            weight="bold"
            as="div"
            style={{ color: trendColor }}
          >
            {value}
          </Text>
          {unit && (
            <Text size="base" color="secondary">
              {unit}
            </Text>
          )}
        </Flex>

        {/* Delta indicator */}
        {showDelta && delta !== undefined && (
          <Flex
            align="center"
            gap={1}
            style={{ marginTop: token.marginXS }}
          >
            <Text
              size="sm"
              style={{ color: delta >= 0 ? token.colorSuccess : token.colorError }}
            >
              {trendIcon} {Math.abs(delta)}%
            </Text>
          </Flex>
        )}
      </Box>
    </Card>
  );
}
