import { KBError } from '../errors/kb-error';
import { mapFetchError } from './error-mapper';
export class HttpClient {
    baseUrl;
    requestInterceptors = [];
    responseInterceptors = [];
    errorInterceptors = [];
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }
    addErrorInterceptor(interceptor) {
        this.errorInterceptors.push(interceptor);
    }
    async fetch(path, options = {}) {
        try {
            let config = options;
            // Apply request interceptors
            for (const interceptor of this.requestInterceptors) {
                config = await interceptor(config);
            }
            const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
            const response = await fetch(url, config);
            // Apply response interceptors
            let processedResponse = response;
            for (const interceptor of this.responseInterceptors) {
                processedResponse = await interceptor(processedResponse);
            }
            if (!processedResponse.ok) {
                const error = mapFetchError(undefined, processedResponse);
                throw await this.processError(error);
            }
            const data = await processedResponse.json();
            return data;
        }
        catch (error) {
            const kbError = error instanceof KBError ? error : mapFetchError(error);
            throw await this.processError(kbError);
        }
    }
    async processError(error) {
        let processedError = error;
        for (const interceptor of this.errorInterceptors) {
            processedError = await interceptor(processedError);
        }
        throw processedError;
    }
}
//# sourceMappingURL=http-client.js.map