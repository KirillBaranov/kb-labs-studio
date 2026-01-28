import * as React from 'react';
import { Layout, Dropdown, Avatar, Tooltip, type MenuProps } from 'antd';
import { User, Search } from 'lucide-react';
import { UIButton } from '@kb-labs/studio-ui-kit';
import { KBThemeToggle } from './kb-theme-toggle';
import { KBSystemHealthIndicator, type SystemHealthData } from './kb-system-health-indicator';
import { KBNotificationBell, type LogNotification } from './kb-notification-bell';

const { Header: AntHeader } = Layout;

export interface KBHeaderProps {
  logo?: React.ReactNode;
  logoLink?: string;
  LinkComponent?: React.ComponentType<{ to: string; children: React.ReactNode; style?: React.CSSProperties; className?: string }>;
  onLogout?: () => void;
  profileMenuItems?: MenuProps['items'];
  userAvatar?: string;
  userName?: string;
  systemHealth?: SystemHealthData;
  systemHealthLoading?: boolean;
  onSearchClick?: () => void;
  // Notifications
  notifications?: LogNotification[];
  unreadNotificationsCount?: number;
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearAllNotifications?: () => void;
  onClearNotification?: (id: string) => void;
  onNotificationClick?: (notification: LogNotification) => void;
}

export function KBHeader({
  logo = 'KB Labs',
  logoLink = '/',
  LinkComponent,
  onLogout,
  profileMenuItems,
  userAvatar,
  userName = 'User',
  systemHealth,
  systemHealthLoading = false,
  onSearchClick,
  notifications = [],
  unreadNotificationsCount = 0,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onClearAllNotifications,
  onClearNotification,
  onNotificationClick,
}: KBHeaderProps) {
  const profileItems: MenuProps['items'] = profileMenuItems || [
    ...(onLogout
      ? [
          {
            key: 'logout',
            label: 'Logout',
            danger: true,
            onClick: onLogout,
          },
        ]
      : []),
  ];

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    textDecoration: 'none',
  };

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 64,
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      {LinkComponent ? (
        <LinkComponent to={logoLink} style={logoStyle}>
          {logo}
        </LinkComponent>
      ) : (
        <a href={logoLink} style={logoStyle}>
          {logo}
        </a>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {onSearchClick && (
          <UIButton
            variant="text"
            icon={<Search size={18} />}
            onClick={onSearchClick}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          />
        )}

        {/* Notification Bell */}
        {onMarkNotificationAsRead &&
          onMarkAllNotificationsAsRead &&
          onClearAllNotifications &&
          onClearNotification && (
            <KBNotificationBell
              notifications={notifications}
              unreadCount={unreadNotificationsCount}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
              onClearAll={onClearAllNotifications}
              onClearNotification={onClearNotification}
              onNotificationClick={onNotificationClick}
            />
          )}

        <KBThemeToggle />

        <Dropdown menu={{ items: profileItems }} placement="bottomRight">
          <UIButton
            variant="text"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
            }}
          >
            <Avatar
              size="small"
              icon={!userAvatar && <User size={14} />}
              src={userAvatar}
              style={{ flexShrink: 0 }}
            />
            {userName && <span>{userName}</span>}
          </UIButton>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

