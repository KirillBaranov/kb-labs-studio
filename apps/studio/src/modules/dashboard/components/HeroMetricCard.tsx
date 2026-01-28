import React from 'react';
import { Card } from 'antd';
import './HeroMetricCard.css';

export type MetricStatus = 'healthy' | 'warning' | 'critical' | 'live' | 'default';

export interface HeroMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  sparklineData?: number[];
  trend?: {
    direction: 'up' | 'down';
    value: number;
    isPositive?: boolean;
  };
  status?: MetricStatus;
  pulsing?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const statusColors: Record<MetricStatus, string> = {
  healthy: '#52c41a',
  warning: '#faad14',
  critical: '#ff4d4f',
  live: '#1890ff',
  default: '#595959',
};

// Minimal background - just very subtle tint
const statusBgColors: Record<MetricStatus, string> = {
  healthy: '#ffffff',
  warning: '#ffffff',
  critical: '#ffffff',
  live: '#ffffff',
  default: '#ffffff',
};

export function HeroMetricCard({
  title,
  value,
  subtitle,
  sparklineData,
  trend,
  status = 'default',
  pulsing = false,
  onClick,
  icon,
}: HeroMetricCardProps) {
  const mainColor = statusColors[status];
  const bgColor = statusBgColors[status];

  return (
    <Card
      className={`hero-metric-card ${onClick ? 'clickable' : ''} ${pulsing ? 'pulsing' : ''}`}
      style={{
        backgroundColor: bgColor,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      bodyStyle={{ padding: '20px' }}
    >
      <div className="hero-metric-header">
        {icon && <div className="hero-metric-icon">{icon}</div>}
        <div className="hero-metric-title">{title}</div>
        {pulsing && (
          <div className="hero-metric-pulse" style={{ backgroundColor: mainColor }} />
        )}
      </div>

      <div className="hero-metric-value" style={{ color: mainColor }}>
        {value}
      </div>

      {/* Always render subtitle for consistent height */}
      <div className="hero-metric-subtitle">
        {subtitle || '\u00A0'}
      </div>

      {/* Always show footer for consistent card height */}
      <div className="hero-metric-footer">
        <div className="hero-metric-sparkline">
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline data={sparklineData} color={mainColor} />
          )}
        </div>

        <div className="hero-metric-trend">
          {trend && (
            <TrendIndicator
              direction={trend.direction}
              value={trend.value}
              isPositive={trend.isPositive ?? trend.direction === 'up'}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

// Sparkline Component
interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color, width = 100, height = 30 }: SparklineProps) {
  if (data.length < 2) {return null;}

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// TrendIndicator Component
interface TrendIndicatorProps {
  direction: 'up' | 'down';
  value: number;
  isPositive: boolean;
}

function TrendIndicator({ direction, value, isPositive }: TrendIndicatorProps) {
  const color = isPositive ? '#52c41a' : '#ff4d4f';
  const arrow = direction === 'up' ? '↑' : '↓';

  return (
    <div className="trend-indicator" style={{ color }}>
      <span className="trend-arrow">{arrow}</span>
      <span className="trend-value">{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
}
