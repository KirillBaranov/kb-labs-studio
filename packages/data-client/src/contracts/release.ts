/**
 * @module @kb-labs/data-client/contracts/release
 * Re-export release contracts from api-contracts (single source of truth)
 */

import type { ReleasePreviewResponse } from '@kb-labs/api-contracts';

export type { ReleasePreviewResponse };

export type ReleasePreview = ReleasePreviewResponse['data'];

