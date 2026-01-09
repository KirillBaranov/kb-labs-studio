import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  KBPageContainer,
  KBPageHeader,
} from '@kb-labs/studio-ui-react';

const TAB_ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <DashboardOutlined />,
    path: '/',
  },
  {
    key: 'insights',
    label: 'AI Insights',
    icon: <RobotOutlined />,
    path: '/insights',
  },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from path
  const activeTab = location.pathname === '/insights' ? 'insights' : 'overview';

  const handleTabChange = (key: string) => {
    const tab = TAB_ITEMS.find(t => t.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Intelligence Dashboard"
        description="Real-time platform observability and performance analytics"
      />

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={TAB_ITEMS.map(tab => ({
          key: tab.key,
          label: (
            <span>
              {tab.icon}
              <span style={{ marginLeft: 8 }}>{tab.label}</span>
            </span>
          ),
        }))}
        style={{ marginBottom: 24 }}
      />

      <Outlet />
    </KBPageContainer>
  );
}
