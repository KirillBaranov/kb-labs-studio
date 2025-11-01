export class KBError extends Error {
    code;
    message;
    status;
    cause;
    constructor(code, message, status, cause) {
        super(message);
        this.code = code;
        this.message = message;
        this.status = status;
        this.cause = cause;
        this.name = 'KBError';
    }
}
export const errorCodes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
};
//# sourceMappingURL=kb-error.js.map