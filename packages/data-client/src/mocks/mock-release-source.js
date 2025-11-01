import releasePreviewFixture from './fixtures/release-preview.json';
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export class MockReleaseSource {
    async getPreview(range) {
        await delay(250);
        return releasePreviewFixture;
    }
    async runRelease(confirm) {
        await delay(500);
        return {
            ok: true,
            message: 'Release completed successfully',
            runId: `release-${Date.now()}`,
        };
    }
    async getHealth() {
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
//# sourceMappingURL=mock-release-source.js.map