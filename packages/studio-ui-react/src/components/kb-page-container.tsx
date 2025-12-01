import * as React from 'react';
import { KBContent, type KBContentProps } from './kb-content';

export interface KBPageContainerProps extends KBContentProps {
  children: React.ReactNode;
}

export function KBPageContainer({ children, ...props }: KBPageContainerProps) {
  return (
    <KBContent {...props}>
      {children}
    </KBContent>
  );
}

