import { appendFile } from "fs";
import { Logger, ILogObj } from "tslog";
import { LOGLEVEL, LogLevelConverter } from "../model/Params";

export class Log {
  private static logger: Logger<ILogObj>;

  /**
   * Initializes the Logger instance and configures it properly.
   */
  private static init() {
    const minLogLevel = process.env.LOGLEVEL ? LogLevelConverter.convertStringToNumLogLevel(process.env.LOGLEVEL) : LOGLEVEL.DEBUG;

    this.logger = new Logger({
      minLevel: minLogLevel,
      prettyLogTimeZone: 'local',
      type: 'pretty',
      hideLogPositionForProduction: true
    });
  }

  /**
   * Writes log data to a file.
   * @param logObject - The log object to be written.
   */
  private static logToTransport(logObject: ILogObj) {
    let file = './upstreammon.log';
    if (process.env.LOGPATH && process.env.LOGFILE) file = `${process.env.LOGPATH}/${process.env.LOGFILE}`;

    const msg = {
      loglevel: logObject.logLevel,
      message: JSON.stringify(logObject),
    };

    appendFile(file, JSON.stringify(msg) + "\n", (err) => { if (err) Log.error(err) });
  }

  /* ------------------------------------------------------------------ */
  /* Log-Methods for each log level */
  /* ------------------------------------------------------------------ */

  /**
   * Logs a message at the 'silly' level.
   * @param msg - The message to log.
   */
  public static silly(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.silly(msg);
  }

  /**
   * Logs a message at the 'debug' level.
   * @param msg - The message to log.
   */
  public static debug(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.debug(msg);
  }

  /**
   * Logs a message at the 'trace' level.
   * @param msg - The message to log.
   */
  public static trace(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.trace(msg);
  }

  /**
   * Logs a message at the 'info' level.
   * @param msg - The message to log.
   */
  public static info(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.info(msg);
  }

  /**
   * Logs a message at the 'warn' level.
   * @param msg - The message to log.
   */
  public static warn(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.warn(msg);
  }

  /**
   * Logs a message at the 'error' level.
   * @param msg - The message to log.
   */
  public static error(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.error(msg);
  }

  /**
   * Logs a message at the 'fatal' level.
   * @param msg - The message to log.
   */
  public static fatal(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.fatal(msg);
  }

  /**
   * Logs a message at the 'fatal' level.
   * @param msg - The message to log.
   */
  public static generic(loglevel:LOGLEVEL, msg: unknown) {
    if (!this.logger) this.init();
    switch (loglevel) {
      case LOGLEVEL.SILLY:
        this.logger.silly(msg);
        break;
      case LOGLEVEL.DEBUG:
        this.logger.debug(msg);
        break;
      case LOGLEVEL.TRACE:
        this.logger.trace(msg);
        break;
      case LOGLEVEL.INFO:
        this.logger.info(msg);
        break;
      case LOGLEVEL.WARN:
        this.logger.warn(msg);
        break;
      case LOGLEVEL.ERROR:
        this.logger.error(msg);
        break;
      case LOGLEVEL.FATAL:   
        this.logger.fatal(msg);
        break;
    }
  }
}
