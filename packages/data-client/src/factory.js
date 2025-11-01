import { MockAuditSource } from './mocks/mock-audit-source';
import { MockReleaseSource } from './mocks/mock-release-source';
import { MockSystemSource } from './mocks/mock-system-source';
export function createDataSources(config) {
    if (config.mode === 'mock') {
        return {
            audit: new MockAuditSource(),
            release: new MockReleaseSource(),
            system: new MockSystemSource(),
        };
    }
    // HTTP sources will be implemented later
    throw new Error('HTTP data sources not yet implemented');
}
//# sourceMappingURL=factory.js.map