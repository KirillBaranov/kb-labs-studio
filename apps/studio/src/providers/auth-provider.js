import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [role, setRoleState] = useState(() => localStorage.getItem('studio-user-role') || 'operator');
    useEffect(() => {
        localStorage.setItem('studio-user-role', role);
    }, [role]);
    const setRole = (newRole) => {
        setRoleState(newRole);
    };
    return _jsx(AuthContext.Provider, { value: { role, setRole }, children: children });
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
export function useRole() {
    const { role } = useAuth();
    return role;
}
//# sourceMappingURL=auth-provider.js.map