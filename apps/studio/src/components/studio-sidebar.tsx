import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, Rocket, Link2, Brain, BarChart3, Settings, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { cn, KBBadge } from '@kb-labs/ui-react';
import { useSidebar } from './sidebar-context';

const navigation = [
  {
    name: 'Dashboard',
    to: '/',
    icon: Home,
    subItems: [
      { name: 'Overview', to: '/dashboard/overview' },
      { name: 'Metrics', to: '/dashboard/metrics' },
      { name: 'Recent Activity', to: '/dashboard/activity' },
    ],
  },
  {
    name: 'Audit',
    to: '/audit',
    icon: ShieldCheck,
    subItems: [
      { name: 'Summary', to: '/audit/summary' },
      { name: 'Packages', to: '/audit/packages' },
      { name: 'Reports', to: '/audit/reports' },
    ],
  },
  {
    name: 'Release',
    to: '/release',
    icon: Rocket,
    subItems: [
      { name: 'Preview', to: '/release/preview' },
      { name: 'History', to: '/release/history' },
      { name: 'Settings', to: '/release/settings' },
    ],
  },
  {
    name: 'DevLink',
    to: '/devlink',
    icon: Link2,
    subItems: [
      { name: 'Graph', to: '/devlink/graph' },
      { name: 'Cycles', to: '/devlink/cycles' },
      { name: 'Dependencies', to: '/devlink/dependencies' },
    ],
  },
  {
    name: 'Mind',
    to: '/mind',
    icon: Brain,
    subItems: [
      { name: 'Verification', to: '/mind/verification' },
      { name: 'Freshness', to: '/mind/freshness' },
      { name: 'Reports', to: '/mind/reports' },
    ],
  },
  {
    name: 'Analytics',
    to: '/analytics',
    icon: BarChart3,
    subItems: [
      { name: 'Events', to: '/analytics/events' },
      { name: 'Performance', to: '/analytics/performance' },
      { name: 'Usage', to: '/analytics/usage' },
    ],
  },
  {
    name: 'Settings',
    to: '/settings',
    icon: Settings,
    subItems: [
      { name: 'General', to: '/settings/general' },
      { name: 'Data Sources', to: '/settings/data-sources' },
      { name: 'Preferences', to: '/settings/preferences' },
    ],
  },
];

export function StudioSidebar() {
  const location = useLocation();
  const { collapsed, toggleCollapse } = useSidebar();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-theme-primary border-r border-theme transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <nav className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.to;
              const isExpanded = expandedItems[item.name] ?? false;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <div className="flex items-center">
                    <Link
                      to={item.to}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-1',
                        isActive
                          ? 'border-l-2 menu-item-active'
                          : 'hover:bg-theme-secondary'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                    
                    {!collapsed && item.subItems.length > 0 && (
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className="p-1 hover:bg-theme-secondary rounded transition-colors"
                      >
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                  
                  {!collapsed && isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.to}>
                          <Link
                            to={subItem.to}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-theme-secondary rounded-md transition-colors"
                          >
                            <span className="flex-1">{subItem.name}</span>
                            <KBBadge variant="default" className="text-[10px]">
                              Soon
                            </KBBadge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="border-t border-theme p-2">
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium hover:bg-theme-secondary rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}

