import React from 'react';
import { Outlet } from 'react-router-dom';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

export function DashboardLayout() {
  return (
    <KBPageContainer>
      <KBPageHeader
        title="Intelligence Dashboard"
        description="Real-time platform observability and performance analytics"
      />

      <Outlet />
    </KBPageContainer>
  );
}
