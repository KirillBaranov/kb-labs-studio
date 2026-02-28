import reactPreset from '@kb-labs/devkit/eslint/react.js';
import noDirectAntdImport from './eslint-rules/no-direct-antd-import.js';

export default [
  ...reactPreset,
  {
    ignores: ['dist/**', 'coverage/**']
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'studio-rules': {
        rules: { 'no-direct-antd-import': noDirectAntdImport },
      },
    },
    rules: {
      'studio-rules/no-direct-antd-import': 'error',
    },
  },
];
