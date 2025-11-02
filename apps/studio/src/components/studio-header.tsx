import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { KBThemeToggle } from '@kb-labs/ui-react';

export function StudioHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-theme-primary border-b border-theme">
      <div className="flex items-center justify-between h-full px-6">
        <Link
          to="/"
          className="text-xl font-bold hover:opacity-80 transition-opacity"
        >
          KB Labs Studio
        </Link>
        
        <div className="flex items-center gap-4">
          <KBThemeToggle />
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}

