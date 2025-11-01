import type { ISODate } from './common';

export interface ReleasePreview {
  range: {
    from: string;
    to: string;
  };
  packages: Array<{
    name: string;
    prev: string;
    next: string;
    bump: 'major' | 'minor' | 'patch' | 'none';
    breaking?: number;
  }>;
  manifestJson?: string;
  markdown?: string;
}

