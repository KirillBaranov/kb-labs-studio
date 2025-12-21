import type { FetchOptions, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './types';
import { KBError } from '../errors/kb-error';
import { mapFetchError } from './error-mapper';
import { createEnvelopeInterceptor } from './envelope-interceptor';
import { ulid } from 'ulid';

export class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(private baseUrl: string = '') {
    // Add default envelope interceptor
    this.addResponseInterceptor(createEnvelopeInterceptor());
    
    // Add default request interceptor for X-Request-Id
    this.addRequestInterceptor((config) => {
      const headers = new Headers(config.headers);
      if (!headers.has('X-Request-Id')) {
        headers.set('X-Request-Id', ulid());
      }
      return {
        ...config,
        headers,
      };
    });
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  async fetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    try {
      let config: FetchOptions = options;

      // Apply request interceptors
      for (const interceptor of this.requestInterceptors) {
        config = await interceptor(config);
      }

      // Normalize path: ensure no duplicate /v1
      // If baseUrl is '/api' and path starts with '/v1', construct full path correctly
      let normalizedPath = path;

      const url = normalizedPath.startsWith('http') ? normalizedPath : `${this.baseUrl}${normalizedPath}`;
      const response = await fetch(url, config);

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      if (!processedResponse.ok) {
        let parsedBody: unknown = null;
        try {
          const cloned = processedResponse.clone();
          const contentType = cloned.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            parsedBody = await cloned.json();
          }
        } catch {
          // Ignore parse errors; fallback to default handling
        }

        const error = mapFetchError(parsedBody, processedResponse);
        throw await this.processError(error);
      }

      // Parse response data
      const contentType = processedResponse.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        // Non-JSON response - return as is
        return processedResponse as unknown as T;
      }

      const data = await processedResponse.json();
      
      // Check if response is still an envelope (interceptor might not have processed it)
      if (data && typeof data === 'object' && 'ok' in data) {
        if (data.ok === true && 'data' in data) {
          // Success envelope: return unwrapped data
          return data.data as T;
        } else if (data.ok === false && 'error' in data) {
          // Error envelope: throw error
          const error = mapFetchError(undefined, processedResponse);
          throw await this.processError(error);
        }
      }

      // Not an envelope or already unwrapped
      return data as T;
    } catch (error) {
      const kbError = error instanceof KBError ? error : mapFetchError(error);
      throw await this.processError(kbError);
    }
  }

  private async processError(error: KBError): Promise<never> {
    let processedError = error;
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError);
    }
    throw processedError;
  }
}

