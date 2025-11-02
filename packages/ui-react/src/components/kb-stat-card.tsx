import * as React from 'react';
import { KBCard } from './kb-card';

export interface KBStatCardProps {
  label: string;
  value: React.ReactNode;
  variant?: 'positive' | 'negative' | 'warning' | 'default';
}

export function KBStatCard({ label, value, variant = 'default' }: KBStatCardProps) {
  const variantColors: Record<string, { value: string }> = {
    positive: { value: '#52c41a' },
    negative: { value: '#ff4d4f' },
    warning: { value: '#faad14' },
    default: { value: 'inherit' },
  };

  return (
    <KBCard>
      <div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: variantColors[variant]?.value || 'inherit' }}>
          {value}
        </div>
      </div>
    </KBCard>
  );
}

