export const queryKeys = {
  audit: {
    all: ['audit'] as const,
    summary: () => [...queryKeys.audit.all, 'summary'] as const,
    pkg: (name: string) => [...queryKeys.audit.all, 'pkg', name] as const,
    runs: () => [...queryKeys.audit.all, 'runs'] as const,
  },
  release: {
    all: ['release'] as const,
    preview: () => [...queryKeys.release.all, 'preview'] as const,
    runs: () => [...queryKeys.release.all, 'runs'] as const,
  },
  system: {
    all: ['system'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },
} as const;

