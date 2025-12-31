/**
 * @module @kb-labs/studio-ui-react/components/kb-status-bar
 * Status bar component - compact footer with system info
 */

import * as React from 'react';
import { Space, Tooltip, Badge } from 'antd';
import {
  ApiOutlined,
  CloudOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

export interface StatusBarItemProps {
  /** Item icon */
  icon?: React.ReactNode;
  /** Item label text */
  label: string;
  /** Item tooltip */
  tooltip?: string;
  /** Item status (shows badge) */
  status?: 'success' | 'error' | 'warning' | 'processing' | 'default';
  /** Click handler */
  onClick?: () => void;
  /** Whether item is clickable (cursor pointer) */
  clickable?: boolean;
}

export function StatusBarItem({
  icon,
  label,
  tooltip,
  status,
  onClick,
  clickable = !!onClick,
}: StatusBarItemProps) {
  const content = (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 12px',
        height: 28,
        fontSize: '12px',
        cursor: clickable ? 'pointer' : 'default',
        color: 'var(--text-secondary)',
        transition: 'all 150ms ease-in-out',
        borderRadius: 4,
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {status && <Badge status={status} />}
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{content}</Tooltip>;
  }

  return content;
}

export interface KBStatusBarProps {
  /** Left-aligned items */
  leftItems?: React.ReactNode;
  /** Right-aligned items */
  rightItems?: React.ReactNode;
  /** Custom children (overrides leftItems/rightItems) */
  children?: React.ReactNode;
}

export function KBStatusBar({ leftItems, rightItems, children }: KBStatusBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 28,
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        zIndex: 1000,
        fontSize: '12px',
        transition: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out',
      }}
    >
      {children ? (
        children
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size={0}>{leftItems}</Space>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space size={0}>{rightItems}</Space>
          </div>
        </>
      )}
    </div>
  );
}

// Pre-built status bar items for common use cases
export const StatusBarPresets = {
  ApiConnection: ({ connected, onClick }: { connected: boolean; onClick?: () => void }) => (
    <StatusBarItem
      icon={<ApiOutlined />}
      label={connected ? 'Connected' : 'Disconnected'}
      status={connected ? 'success' : 'error'}
      tooltip={connected ? 'API connection active' : 'API connection lost'}
      onClick={onClick}
      clickable={!!onClick}
    />
  ),

  CloudStatus: ({ synced, onClick }: { synced: boolean; onClick?: () => void }) => (
    <StatusBarItem
      icon={<CloudOutlined />}
      label={synced ? 'Synced' : 'Syncing...'}
      status={synced ? 'success' : 'processing'}
      tooltip={synced ? 'All changes synced' : 'Syncing changes...'}
      onClick={onClick}
      clickable={!!onClick}
    />
  ),

  User: ({ email, onClick }: { email: string; onClick?: () => void }) => (
    <StatusBarItem
      icon={<UserOutlined />}
      label={email}
      tooltip="Current user"
      onClick={onClick}
      clickable={!!onClick}
    />
  ),

  Version: ({ version, onClick }: { version: string; onClick?: () => void }) => (
    <StatusBarItem
      label={`v${version}`}
      tooltip={`Platform version ${version}`}
      onClick={onClick}
      clickable={!!onClick}
    />
  ),

  Settings: ({ onClick }: { onClick: () => void }) => (
    <StatusBarItem
      icon={<SettingOutlined />}
      label="Settings"
      tooltip="Open settings"
      onClick={onClick}
      clickable
    />
  ),

  Help: ({ onClick }: { onClick: () => void }) => (
    <StatusBarItem
      icon={<QuestionCircleOutlined />}
      label="Help"
      tooltip="Get help"
      onClick={onClick}
      clickable
    />
  ),

  BackgroundJobs: ({ count, onClick }: { count: number; onClick?: () => void }) => (
    <StatusBarItem
      icon={<ThunderboltOutlined />}
      label={count === 1 ? '1 job running' : `${count} jobs running`}
      status="processing"
      tooltip="View background jobs"
      onClick={onClick}
      clickable={!!onClick}
    />
  ),
};
