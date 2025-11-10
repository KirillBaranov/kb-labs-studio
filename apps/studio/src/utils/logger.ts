type Fields = Record<string, unknown>;

export interface StudioLogger {
  debug(message: string, fields?: Fields): void;
  info(message: string, fields?: Fields): void;
  warn(message: string, fields?: Fields): void;
  error(message: string, fields?: Fields | Error): void;
}

const sessionTraceId = resolveTraceId();
const sessionReqId = resolveReqId();

export function createStudioLogger(scope: string, context: Fields = {}): StudioLogger {
  const baseFields: Fields = {
    scope,
    layer: 'studio',
    ...context,
  };

  return {
    debug(message, fields) {
      emit('debug', scope, message, baseFields, fields);
    },
    info(message, fields) {
      emit('info', scope, message, baseFields, fields);
    },
    warn(message, fields) {
      emit('warn', scope, message, baseFields, fields);
    },
    error(message, fields) {
      if (fields instanceof Error) {
        emit('error', scope, message, baseFields, {
          error: {
            name: fields.name,
            message: fields.message,
            stack: fields.stack,
          },
        });
        return;
      }
      emit('error', scope, message, baseFields, fields);
    },
  };
}

function emit(
  level: 'debug' | 'info' | 'warn' | 'error',
  scope: string,
  message: string,
  base: Fields,
  extra?: Fields
) {
  const combinedFields = { ...base, ...(extra ?? {}) };
  const { traceId: fieldTraceId, reqId: fieldReqId, layer, ...rest } = combinedFields;

  const payload = {
    ts: new Date().toISOString(),
    level,
    traceId: (fieldTraceId as string | undefined) ?? sessionTraceId,
    reqId: (fieldReqId as string | undefined) ?? sessionReqId,
    layer: typeof layer === 'string' ? layer : 'studio',
    msg: `[${scope}] ${message}`,
    ...(Object.keys(rest).length > 0 ? { fields: rest } : {}),
  };

  const serialized = JSON.stringify(payload);

  if (level === 'error') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else if (level === 'info') {
    console.log(serialized);
  } else {
    console.debug(serialized);
  }
}

function resolveTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `studio-trace-${Math.random().toString(36).slice(2)}`;
}

function resolveReqId(): string {
  return `studio-req-${Math.random().toString(36).slice(2)}`;
}

