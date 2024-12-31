// logger.ts
type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private logLevelPriority: Record<LogLevel, number> = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  private currentLogLevel: LogLevel;

  constructor(logLevel: LogLevel = "info") {
    this.currentLogLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevelPriority[level] >= this.logLevelPriority[this.currentLogLevel];
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${meta ? ` | Meta: ${JSON.stringify(meta)}` : ""}`;
  }

  public info(message: string, meta?: unknown): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  public warn(message: string, meta?: unknown): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  public error(message: string, meta?: unknown): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, meta));
    }
  }

  public debug(message: string, meta?: unknown): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }
}

const logger = new Logger("info"); // Default log level is "info"
export default logger;
