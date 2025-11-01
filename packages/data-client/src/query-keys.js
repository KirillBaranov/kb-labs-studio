export const queryKeys = {
    audit: {
        all: ['audit'],
        summary: () => [...queryKeys.audit.all, 'summary'],
        pkg: (name) => [...queryKeys.audit.all, 'pkg', name],
        runs: () => [...queryKeys.audit.all, 'runs'],
    },
    release: {
        all: ['release'],
        preview: () => [...queryKeys.release.all, 'preview'],
        runs: () => [...queryKeys.release.all, 'runs'],
    },
    system: {
        all: ['system'],
        health: () => [...queryKeys.system.all, 'health'],
    },
};
//# sourceMappingURL=query-keys.js.map