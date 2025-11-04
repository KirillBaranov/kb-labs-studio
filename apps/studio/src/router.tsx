import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { KBPageLayout, type NavigationItem } from '@kb-labs/ui-react';
import { Home, Brain, Settings } from 'lucide-react';
import { useAuth } from './providers/auth-provider';
import { useRegistry } from './providers/registry-provider';
import { HealthBanner } from './components/health-banner';
import { NotFoundPage } from './pages/not-found-page';
import { PluginPage } from './routes/plugin-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { GalleryPage } from './pages/gallery-page';

// Helper function to get icon for plugin
function getPluginIcon(pluginId: string): React.ReactElement {
  // Map plugin IDs to icons
  const iconMap: Record<string, React.ComponentType<any>> = {
    '@kb-labs/mind': Brain,
    // Add more mappings as needed
  };
  
  // Try to find icon by exact match or by prefix
  let IconComponent = iconMap[pluginId];
  
  if (!IconComponent) {
    // Try to match by prefix (e.g., '@kb-labs/mind' matches 'mind')
    const pluginName = pluginId.split('/').pop() || pluginId;
    if (pluginName === 'mind') {
      IconComponent = Brain;
    }
  }
  
  // Default icon if not found
  if (!IconComponent) {
    IconComponent = Settings; // Use Settings as default icon
  }
  
  return React.createElement(IconComponent, { size: 16 });
}

function LayoutContent() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { registry } = useRegistry();
  
  // Build navigation from plugin registry only (no hardcoded menu)
  // Group plugin menus by plugin.id and add icons
  const allNavigationItems: NavigationItem[] = React.useMemo(() => {
    const items: NavigationItem[] = [];
    
    // Add Dashboard/Gallery as first item
    items.push({
      key: 'dashboard',
      label: 'Dashboard',
      icon: React.createElement(Home, { size: 16 }),
      path: '/',
    });
    
    // Add Settings
    items.push({
      key: 'settings',
      label: 'Settings',
      icon: React.createElement(Settings, { size: 16 }),
      path: '/settings',
    });
    
    // Group plugin menus by plugin.id
    const pluginGroups = new Map<string, typeof registry.menus>();
    for (const menuEntry of registry.menus) {
      const pluginId = menuEntry.plugin.id;
      if (!pluginGroups.has(pluginId)) {
        pluginGroups.set(pluginId, []);
      }
      pluginGroups.get(pluginId)!.push(menuEntry);
    }
    
    // Add grouped plugin menu items
    for (const [pluginId, menuEntries] of pluginGroups.entries()) {
      // Sort menu entries by order
      const sortedEntries = [...menuEntries].sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return a.id.localeCompare(b.id);
      });
      
      // Get plugin display name (first menu entry has plugin info)
      const firstEntry = sortedEntries[0];
      const displayName = (firstEntry?.plugin as any)?.displayName || pluginId;
      
      // Get icon for plugin (map plugin.id to icon)
      const pluginIcon = getPluginIcon(pluginId);
      
      // Create plugin group menu item
      // IMPORTANT: Don't set path on parent item when it has children - let children handle navigation
      const pluginGroupItem: NavigationItem = {
        key: `plugin-${pluginId}`,
        label: displayName,
        icon: pluginIcon,
        // Don't set path on parent - children will have their own paths
        // path is optional for parent items with children
        children: sortedEntries.map((entry) => ({
          key: entry.id,
          label: entry.label,
          path: entry.target, // Each child has its own path
        })),
      };
      
      items.push(pluginGroupItem);
    }
    
    return items;
  }, [registry.menus]);
  
  return (
    <KBPageLayout
      headerProps={{
        LinkComponent: Link as any,
        onLogout: () => {
          // TODO: Implement logout
          console.log('Logout');
        },
        userName: auth.role,
      }}
      sidebarProps={{
        items: allNavigationItems,
        width: 200,
        collapsedWidth: 80,
        currentPath: location.pathname,
        onNavigate: (path) => navigate(path),
      }}
    >
      <HealthBanner />
      <Outlet />
    </KBPageLayout>
  );
}

function Layout() {
  return <LayoutContent />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <GalleryPage />,
      },
      {
        path: '/plugins/*',
        element: <PluginPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

