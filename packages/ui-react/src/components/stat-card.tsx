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
    <div 
      className={cn('rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 shadow', className)}
      style={{ padding: 'var(--spacing-section)' }}
    >
      <h3 className="typo-label">{label}</h3>
      <div className="flex items-baseline justify-between" style={{ marginTop: 'var(--spacing-tight)' }}>
        <p className={cn('typo-section-title', variantClasses[variant])}>{value}</p>
        {trend && (
          <span
            className={cn(
              'typo-caption',
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

