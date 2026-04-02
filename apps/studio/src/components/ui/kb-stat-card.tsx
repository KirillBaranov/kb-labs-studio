import * as React from 'react';
import { UICard } from '@kb-labs/studio-ui-kit';

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
    <UICard>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', color: variantColors[variant]?.value || 'var(--text-primary)' }}>
          {value}
        </div>
      </div>
    </UICard>
  );
}

