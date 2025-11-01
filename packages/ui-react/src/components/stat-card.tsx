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
    default: 'text-gray-900 dark:text-white',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className={cn('rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-6 shadow', className)}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      <div className="mt-2 flex items-baseline justify-between">
        <p className={cn('text-2xl font-bold', variantClasses[variant])}>{value}</p>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' && 'text-green-600 dark:text-green-400',
              trend === 'down' && 'text-red-600 dark:text-red-400',
              trend === 'neutral' && 'text-gray-600 dark:text-gray-400'
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

