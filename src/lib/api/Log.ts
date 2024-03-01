import { appendFile } from "fs";
import { Logger, ILogObj } from "tslog";
import { LOGLEVEL, LogLevelConverter } from "../model/Params";

export class Log {
  private static logger: Logger<ILogObj>;

  /**
   * initialze my Logger instance and configure it properly
   */
  private static init() {
    const minLogLevel = (process.env.LOGLEVEL ? LogLevelConverter.convertStringToNumLogLevel(process.env.LOGLEVEL) : LOGLEVEL.DEBUG);

    // ------------------- configure logger -------------------
    this.logger = new Logger();
    this.logger.settings.minLevel = minLogLevel;
    this.logger.settings.prettyLogTimeZone = 'local';
    this.logger.settings.type = 'pretty';
    this.logger.settings.hideLogPositionForProduction = true;
    // --------------------------------------------------------
  }

  /**
   * Transporter writes data to file
   * @param logObject
   */
  private static logToTransport(logObject: ILogObj) {
    let file = './upstreammon.log';
    if (process.env.LOGPATH && process.env.LOGFILE) file = `${process.env.LOGPATH}/${process.env.LOGFILE}`;

    const msg = {
      loglevel: logObject.logLevel,
      message: String(logObject),
    };

    appendFile(file, JSON.stringify(msg) + "\n", (err) => { if (err) Log.error(err) });
  }

  /* ------------------------------------------------------------------ */
  /* Log-Methods for each log level */
  /* ------------------------------------------------------------------ */

  public static silly(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.silly(msg);
  }
  public static debug(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.debug(msg);
  }
  public static trace(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.trace(msg);
  }
  public static info(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.info(msg);
  }
  public static warn(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.warn(msg);
  }
  public static error(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.error(msg);
  }
  public static fatal(msg: unknown) {
    if (!this.logger) this.init();
    this.logger.fatal(msg);
  }

}
