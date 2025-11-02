import * as React from 'react';
import { Layout, Dropdown, Avatar, Button } from 'antd';
import type { MenuProps } from 'antd';
import { User } from 'lucide-react';
import { KBThemeToggle } from './kb-theme-toggle';

const { Header: AntHeader } = Layout;

export interface KBHeaderProps {
  logo?: React.ReactNode;
  logoLink?: string;
  LinkComponent?: React.ComponentType<{ to: string; children: React.ReactNode; style?: React.CSSProperties; className?: string }>;
  onLogout?: () => void;
  profileMenuItems?: MenuProps['items'];
  userAvatar?: string;
  userName?: string;
}

export function KBHeader({
  logo = 'KB Labs',
  logoLink = '/',
  LinkComponent,
  onLogout,
  profileMenuItems,
  userAvatar,
  userName = 'User',
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
        <KBThemeToggle />

        <Dropdown menu={{ items: profileItems }} placement="bottomRight">
          <Button
            type="text"
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
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}

