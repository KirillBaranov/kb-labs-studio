import { Link, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, Rocket, Link2, Brain, BarChart3, Settings } from 'lucide-react';
import { cn, ThemeToggle } from '@kb-labs/ui-react';

const navigation = [
  { name: 'Dashboard', to: '/', icon: Home },
  { name: 'Audit', to: '/audit', icon: ShieldCheck },
  { name: 'Release', to: '/release', icon: Rocket },
  { name: 'DevLink', to: '/devlink', icon: Link2 },
  { name: 'Mind', to: '/mind', icon: Brain },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export function StudioNav() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">KB Labs Studio</h1>
          </div>
          <div className="flex space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 border-b-2 border-transparent dark:text-gray-400 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

