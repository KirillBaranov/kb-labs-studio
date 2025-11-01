import { KBError, errorCodes } from '../errors/kb-error';
import type { ResponseError } from './types';

export function mapFetchError(error: unknown, response?: Response): KBError {
  if (error instanceof KBError) {
    return error;
  }

  if (response) {
    const httpError: ResponseError = {
      status: response.status,
      statusText: response.statusText,
    };

    if (response.status === 404) {
      return new KBError(errorCodes.NOT_FOUND, 'Resource not found', 404, httpError);
    }
    if (response.status === 401 || response.status === 403) {
      return new KBError(errorCodes.AUTH_ERROR, 'Authentication failed', response.status, httpError);
    }
    if (response.status >= 500) {
      return new KBError(errorCodes.SERVER_ERROR, 'Server error', response.status, httpError);
    }
    return new KBError(errorCodes.NETWORK_ERROR, httpError.statusText || 'Request failed', response.status, httpError);
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new KBError(errorCodes.NETWORK_ERROR, 'Network request failed', undefined, error);
  }

  return new KBError(errorCodes.NETWORK_ERROR, 'Unknown error occurred', undefined, error);
}

