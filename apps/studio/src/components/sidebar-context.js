import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
const initialState = {
    collapsed: false,
    toggleCollapse: () => null,
};
const SidebarContext = React.createContext(initialState);
export function SidebarProvider({ children }) {
    const [collapsed, setCollapsed] = React.useState(() => {
        return localStorage.getItem('studio-sidebar-collapsed') === 'true';
    });
    const toggleCollapse = React.useCallback(() => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);
        localStorage.setItem('studio-sidebar-collapsed', String(newCollapsed));
    }, [collapsed]);
    return (_jsx(SidebarContext.Provider, { value: { collapsed, toggleCollapse }, children: children }));
}
export const useSidebar = () => {
    const context = React.useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
//# sourceMappingURL=sidebar-context.js.map