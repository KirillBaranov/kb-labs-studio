import reactPreset from '@kb-labs/devkit/eslint/react.js';

export default [
  ...reactPreset,
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/tsup.config.ts',
      '**/vitest.config.ts'
    ]
  }
];