import type { ReleaseDataSource } from '../sources/release-source';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';
import releasePreviewFixture from './fixtures/release-preview.json';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockReleaseSource implements ReleaseDataSource {
  async getPreview(range?: { from: string; to: string }): Promise<unknown> {
    await delay(250);
    return releasePreviewFixture;
  }

  async runRelease(confirm?: boolean): Promise<ActionResult> {
    await delay(500);
    return {
      ok: true,
      message: 'Release completed successfully',
      runId: `release-${Date.now()}`,
    };
  }

  async getHealth(): Promise<HealthStatus> {
    await delay(100);
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      sources: [
        { name: 'release', ok: true, latency: 100 },
      ],
    };
  }
}

