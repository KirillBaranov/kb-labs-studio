import * as React from 'react';
import { cn } from '../lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'positive' | 'negative' | 'warning';
  className?: string;
}

export function StatCard({ label, value, trend, variant = 'default', className }: StatCardProps) {
  const variantClasses = {
    default: 'text-gray-900',
    positive: 'text-green-600',
    negative: 'text-red-600',
    warning: 'text-yellow-600',
  };

  return (
    <div className={cn('rounded-lg border bg-white p-6 shadow', className)}>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <div className="mt-2 flex items-baseline justify-between">
        <p className={cn('text-2xl font-bold', variantClasses[variant])}>{value}</p>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-green-600',
              trend === 'down' && 'text-red-600',
              trend === 'neutral' && 'text-gray-600'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
          </span>
        )}
      </div>
    </div>
  );
}

