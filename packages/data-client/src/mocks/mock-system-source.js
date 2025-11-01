function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export class MockSystemSource {
    async getHealth() {
        await delay(150);
        return {
            ok: true,
            timestamp: new Date().toISOString(),
            sources: [
                { name: 'audit', ok: true, latency: 100 },
                { name: 'release', ok: true, latency: 120 },
                { name: 'system', ok: true, latency: 50 },
            ],
        };
    }
}
//# sourceMappingURL=mock-system-source.js.map