import * as React from 'react';

export interface KBSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function KBSection({ children, ...props }: KBSectionProps) {
  return (
    <div style={{ marginBottom: 24 }} {...props}>
      {children}
    </div>
  );
}

