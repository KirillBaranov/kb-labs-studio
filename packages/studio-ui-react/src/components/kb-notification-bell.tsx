import * as React from 'react';
import { Badge, Dropdown, Button, List, Typography, Tag, Empty, Divider, Space, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { Bell, AlertTriangle, XCircle, X, CheckCheck } from 'lucide-react';
import type { LogNotification } from '@kb-labs/studio-data-client';

const { Text, Paragraph } = Typography;

export interface KBNotificationBellProps {
  notifications: LogNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onClearNotification: (id: string) => void;
}

/**
 * Notification Bell component for displaying critical log notifications
 *
 * Shows a bell icon with badge count. Clicking opens a dropdown with:
 * - List of warn/error notifications
 * - Mark as read/unread
 * - Clear individual or all notifications
 */
export function KBNotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onClearNotification,
}: KBNotificationBellProps) {
  const [open, setOpen] = React.useState(false);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getLevelIcon = (level: 'warn' | 'error') => {
    if (level === 'error') {
      return <XCircle size={16} style={{ color: '#ff4d4f' }} />;
    }
    return <AlertTriangle size={16} style={{ color: '#faad14' }} />;
  };

  const getLevelColor = (level: 'warn' | 'error') => {
    return level === 'error' ? 'red' : 'orange';
  };

  const notificationContent = (
    <div
      style={{
        width: 400,
        maxHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <Badge
              count={unreadCount}
              style={{ backgroundColor: '#ff4d4f' }}
            />
          )}
        </Space>
        <Space size="small">
          {notifications.length > 0 && (
            <>
              <Tooltip title="Mark all as read">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCheck size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAllAsRead();
                  }}
                />
              </Tooltip>
              <Tooltip title="Clear all">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<X size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearAll();
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      </div>

      {/* Notifications List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '48px 16px' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No critical logs"
            />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-primary)',
                  backgroundColor: notification.read
                    ? 'transparent'
                    : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read
                    ? 'transparent'
                    : 'var(--bg-secondary)';
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Level Icon */}
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>
                    {getLevelIcon(notification.level)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag color={getLevelColor(notification.level)} style={{ margin: 0 }}>
                        {notification.level.toUpperCase()}
                      </Tag>
                      {notification.plugin && (
                        <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                          {notification.plugin}
                        </Tag>
                      )}
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </div>

                    <Paragraph
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        wordBreak: 'break-word',
                      }}
                      ellipsis={{ rows: 2 }}
                    >
                      {notification.error
                        ? `${notification.error.name}: ${notification.error.message}`
                        : notification.message}
                    </Paragraph>

                    {notification.executionId && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          fontFamily: 'monospace',
                          display: 'block',
                          marginTop: 4,
                        }}
                      >
                        exec: {notification.executionId.slice(0, 8)}
                      </Text>
                    )}
                  </div>

                  {/* Clear Button */}
                  <div style={{ flexShrink: 0 }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<X size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearNotification(notification.id);
                      }}
                      style={{ color: 'var(--text-secondary)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-primary)',
            textAlign: 'center',
          }}
        >
          <Button
            type="link"
            size="small"
            onClick={() => {
              setOpen(false);
              // Navigate to logs page
              window.location.href = '/observability/logs';
            }}
          >
            View all logs →
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => notificationContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-2, 2]} size="small">
        <Button
          type="text"
          icon={<Bell size={18} />}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: unreadCount > 0 ? '#ff4d4f' : undefined,
          }}
        />
      </Badge>
    </Dropdown>
  );
}
