import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: ["req.headers.authorization", "*.password", "*.token", "*.secret"],
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export function logTransaction(action: string, data: Record<string, unknown>) {
  logger.info({ action, ...data }, `[Fleeper TX] ${action}`);
}
