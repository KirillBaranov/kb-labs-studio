import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  KBPageContainer,
  KBPageHeader,
} from '@kb-labs/studio-ui-react';

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
