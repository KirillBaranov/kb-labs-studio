import auditSummaryFixture from './fixtures/audit-summary.json';
import auditPackageFixture from './fixtures/audit-package-report.json';
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export class MockAuditSource {
    async getSummary() {
        await delay(300);
        return auditSummaryFixture;
    }
    async getPackageReport(name) {
        await delay(200);
        if (name === '@kb-labs/cli') {
            return auditPackageFixture;
        }
        return {
            pkg: { name, version: '1.0.0' },
            lastRun: {
                id: `run-${name}`,
                startedAt: '2025-01-01T10:00:00.000Z',
                endedAt: '2025-01-01T10:02:00.000Z',
                status: 'ok',
            },
            checks: [
                { id: 'style', ok: true },
                { id: 'types', ok: true },
                { id: 'tests', ok: true },
                { id: 'build', ok: true },
                { id: 'devlink', ok: true },
                { id: 'mind', ok: true },
            ],
            artifacts: { json: '/tmp/audit.json', md: '/tmp/audit.md' },
        };
    }
    async runAudit(scope) {
        await delay(600);
        return {
            ok: true,
            message: 'Audit completed successfully',
            runId: `run-${Date.now()}`,
        };
    }
    async getHealth() {
        await delay(100);
        return {
            ok: true,
            timestamp: new Date().toISOString(),
            sources: [
                { name: 'audit', ok: true, latency: 100 },
            ],
        };
    }
}
//# sourceMappingURL=mock-audit-source.js.map