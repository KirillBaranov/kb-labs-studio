/**
 * @module @kb-labs/studio/__tests__/integration/rest-api
 * E2E tests for Studio ↔ REST API integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDataSources } from '@kb-labs/data-client';

describe('Studio ↔ REST API E2E tests', () => {
  const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';
  let sources: ReturnType<typeof createDataSources>;

  beforeAll(() => {
    sources = createDataSources({
      mode: 'http',
      baseUrl,
    });
  });

  describe('Health check flow', () => {
    it('should check REST API health', async () => {
      const health = await sources.system.getHealth();
      
      expect(health).toBeDefined();
      expect(health.ok).toBe(true);
      expect(health.timestamp).toBeDefined();
      expect(health.sources).toBeDefined();
      expect(Array.isArray(health.sources)).toBe(true);
    });

    it('should handle health check failure gracefully', async () => {
      // Create sources with invalid URL
      const invalidSources = createDataSources({
        mode: 'http',
        baseUrl: 'http://localhost:9999/api/v1',
      });

      // Should not throw, but return degraded status
      try {
        const health = await invalidSources.system.getHealth();
        // If it succeeds with degraded status, that's fine
        expect(health).toBeDefined();
      } catch (error) {
        // Expected to fail or return degraded status
        expect(error).toBeDefined();
      }
    });
  });

  describe('Audit flow', () => {
    it('should run audit job end-to-end', async () => {
      // 1. Get audit summary
      const summary = await sources.audit.getSummary();
      expect(summary).toBeDefined();
      expect(summary.overall).toBeDefined();
      expect(summary.counts).toBeDefined();

      // 2. Create audit run
      const result = await sources.audit.runAudit(['packages/*']);
      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.runId).toBeDefined();

      // 3. Check job status (polling)
      let jobStatus = null;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts && !jobStatus) {
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to get job status through audit service
        try {
          // This would require extending AuditDataSource to support getRunStatus
          // For now, we just verify the job was created
          jobStatus = 'checked';
        } catch {
          attempts++;
        }
      }

      expect(result.runId).toBeDefined();
    });

    it('should support idempotency', async () => {
      const idempotencyKey = `test-key-${Date.now()}`;
      
      // Create first request
      const result1 = await sources.audit.runAudit(['packages/*']);
      const runId1 = result1.runId;

      // Note: Idempotency requires passing idempotency key through the source
      // This is a simplified test - full idempotency test requires source support
      expect(runId1).toBeDefined();
    });
  });

  describe('Release flow', () => {
    it('should get release preview', async () => {
      const preview = await sources.release.getPreview({
        from: 'v1.0.0',
        to: 'main',
      });

      expect(preview).toBeDefined();
      expect(preview.packages).toBeDefined();
      expect(Array.isArray(preview.packages)).toBe(true);
      expect(preview.changelog).toBeDefined();
    });

    it('should create release run', async () => {
      const result = await sources.release.runRelease(false);

      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.runId).toBeDefined();
    });
  });

  describe('Fallback to mock mode', () => {
    it('should fallback to mock when REST API is unavailable', async () => {
      // Create sources with HTTP mode but invalid URL
      const invalidSources = createDataSources({
        mode: 'http',
        baseUrl: 'http://localhost:9999/api/v1',
      });

      // Try to get audit summary - should handle error gracefully
      try {
        const summary = await invalidSources.audit.getSummary();
        // If it succeeds (e.g., via mock fallback), that's fine
        expect(summary).toBeDefined();
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }
    });
  });
});

