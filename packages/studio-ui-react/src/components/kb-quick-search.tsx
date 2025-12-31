import * as React from 'react';
import { Modal, Input, List, Empty, Badge } from 'antd';
import { Search, Command, FileText, Box, Settings, BarChart, Activity } from 'lucide-react';

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  category: 'page' | 'plugin' | 'widget' | 'workflow' | 'setting';
  path: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface KBQuickSearchProps {
  open: boolean;
  onClose: () => void;
  items: SearchableItem[];
  onNavigate: (path: string) => void;
  placeholder?: string;
}

const CATEGORY_CONFIG = {
  page: {
    icon: FileText,
    color: '#1890ff',
    label: 'Page',
  },
  plugin: {
    icon: Box,
    color: '#52c41a',
    label: 'Plugin',
  },
  widget: {
    icon: Activity,
    color: '#722ed1',
    label: 'Widget',
  },
  workflow: {
    icon: BarChart,
    color: '#faad14',
    label: 'Workflow',
  },
  setting: {
    icon: Settings,
    color: '#8c8c8c',
    label: 'Setting',
  },
} as const;

export function KBQuickSearch({
  open,
  onClose,
  items,
  onNavigate,
  placeholder = 'Search pages, plugins, widgets...',
}: KBQuickSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<any>(null);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return items.slice(0, 10); // Show top 10 by default
    }

    const query = searchQuery.toLowerCase();
    return items
      .filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(query) ?? false;
        const descMatch = item.description?.toLowerCase().includes(query) ?? false;
        const pathMatch = item.path?.toLowerCase().includes(query) ?? false;
        return titleMatch || descMatch || pathMatch;
      })
      .slice(0, 10);
  }, [items, searchQuery]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Focus input when modal opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          onNavigate(item.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filteredItems, selectedIndex, onNavigate, onClose]
  );

  const handleItemClick = (item: SearchableItem) => {
    onNavigate(item.path);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closable={false}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div style={{ padding: '16px 16px 0 16px' }}>
        <Input
          ref={inputRef}
          size="large"
          placeholder={placeholder}
          prefix={<Search size={18} style={{ color: '#8c8c8c' }} />}
          suffix={
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8c8c8c' }}>
              <kbd
                style={{
                  padding: '2px 6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 4,
                }}
              >
                ESC
              </kbd>
            </div>
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ marginBottom: 12 }}
        />
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {filteredItems.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No results found"
            style={{ padding: '40px 16px' }}
          />
        ) : (
          <List
            dataSource={filteredItems}
            renderItem={(item, index) => {
              const config = CATEGORY_CONFIG[item.category];
              const Icon = config.icon;
              const isSelected = index === selectedIndex;

              return (
                <List.Item
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--primary-color)' : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: `${config.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon || <Icon size={16} color={config.color} />}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            count={item.badge}
                            style={{
                              backgroundColor: config.color,
                              fontSize: 11,
                              height: 18,
                              lineHeight: '18px',
                            }}
                          />
                        )}
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: config.color }}>
                          {config.label}
                        </span>
                        {item.description && (
                          <>
                            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                            <span style={{ fontSize: 12 }}>{item.description}</span>
                          </>
                        )}
                      </div>
                    }
                  />
                  {isSelected && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <kbd
                        style={{
                          padding: '2px 4px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 2,
                        }}
                      >
                        ↵
                      </kbd>
                    </div>
                  )}
                </List.Item>
              );
            }}
          />
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-tertiary)',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <kbd
              style={{
                padding: '2px 4px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 2,
              }}
            >
              ↑↓
            </kbd>
            Navigate
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <kbd
              style={{
                padding: '2px 4px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 2,
              }}
            >
              ↵
            </kbd>
            Select
          </div>
        </div>
        <div>
          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Modal>
  );
}
