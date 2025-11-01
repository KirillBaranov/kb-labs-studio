import { LucideIcon } from 'lucide-react';
import { KBCard, KBCardContent, KBButton } from '@kb-labs/ui-react';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md">
        {Icon && <Icon className="mx-auto h-12 w-12 text-tertiary" />}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm">{description}</p>
        {action && (
          <div className="mt-6">
            <KBButton onClick={action.onClick}>{action.label}</KBButton>
          </div>
        )}
      </div>
    </div>
  );
}

