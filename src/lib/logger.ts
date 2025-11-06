import pino from 'pino';
import { env } from '@/env';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'HH:MM:ss',
        },
      }
    : undefined,
  redact: {
    paths: [
      'email',
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
});

export function createContextLogger(context: string) {
  return logger.child({ context });
}

// Helper for structured error logging
export function logError(error: unknown, context?: string) {
  const log = context ? logger.child({ context }) : logger;

  if (error instanceof Error) {
    log.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  } else {
    log.error({ error });
  }
}
