import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { KBButton } from '@kb-labs/ui-react';
export function EmptyState({ icon: Icon, title, description, action }) {
    return (_jsx("div", { className: "flex items-center justify-center py-16", children: _jsxs("div", { className: "text-center max-w-md", children: [Icon && _jsx(Icon, { className: "mx-auto h-12 w-12 text-tertiary" }), _jsx("h3", { className: "mt-4 text-lg font-semibold", children: title }), _jsx("p", { className: "mt-2 text-sm", children: description }), action && (_jsx("div", { className: "mt-6", children: _jsx(KBButton, { onClick: action.onClick, children: action.label }) }))] }) }));
}
//# sourceMappingURL=empty-state.js.map