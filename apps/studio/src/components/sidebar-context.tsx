import * as React from 'react';

interface SidebarContextState {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const initialState: SidebarContextState = {
  collapsed: false,
  toggleCollapse: () => null,
};

const SidebarContext = React.createContext<SidebarContextState>(initialState);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(() => {
    return localStorage.getItem('studio-sidebar-collapsed') === 'true';
  });

  const toggleCollapse = React.useCallback(() => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem('studio-sidebar-collapsed', String(newCollapsed));
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

