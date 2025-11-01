import type { FetchOptions, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './types';
import { KBError, errorCodes } from '../errors/kb-error';
import { mapFetchError } from './error-mapper';

export class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(private baseUrl: string = '') {}

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

