export const studioConfig = {
    dataSourceMode: (import.meta.env.VITE_DATA_SOURCE_MODE || 'mock'),
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
    features: {
        enableDevlink: false,
        enableMind: false,
        enableAnalytics: false,
    },
};
//# sourceMappingURL=studio.config.js.map