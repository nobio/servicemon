import { appendFile } from "fs";
import { ILogObject, Logger } from "tslog";

export class Log {
  private static logger: Logger;

  /**
   * initialze my Logger instance and configure it properly
   */
  private static init() {
    const debugLevel = (process.env.DEBUGLEVEL ? process.env.DEBUGLEVEL : 'debug');

    // ------------------- configure logger -------------------
    this.logger = new Logger();
    this.logger.setSettings({
      dateTimeTimezone: 'Europe/Berlin',
      displayLogLevel: true,
      displayLoggerName: false,
      displayFunctionName: false,
      displayFilePath: 'hidden',
      minLevel: 'debug',
    });
    // change debug level
    switch (debugLevel) {
      case 'silly': this.logger.setSettings({ minLevel: 'silly' }); break;
      case 'debug': this.logger.setSettings({ minLevel: 'debug' }); break;
      case 'trace': this.logger.setSettings({ minLevel: 'trace' }); break;
      case 'info': this.logger.setSettings({ minLevel: 'info' }); break;
      case 'warn': this.logger.setSettings({ minLevel: 'warn' }); break;
      case 'error': this.logger.setSettings({ minLevel: 'error' }); break;
      case 'fatal': this.logger.setSettings({ minLevel: 'fatal' }); break;
      default: this.logger.setSettings({ minLevel: 'debug' }); break;
    }
  
    if (process.env.LOGPATH && process.env.LOGFILE) {
      console.log(`logging to ${process.env.LOGPATH}/${process.env.LOGFILE}`);
      this.logger.setSettings({ suppressStdOutput: true });

      // ------------------- append file logging to logger -------------------
      this.logger.attachTransport(
        {
          silly: this.logToTransport,
          debug: this.logToTransport,
          trace: this.logToTransport,
          info: this.logToTransport,
          warn: this.logToTransport,
          error: this.logToTransport,
          fatal: this.logToTransport,
        },
        this.logger.settings.minLevel
      );
    } else {
      console.log(`logging to stdout`);
    }

  };

  /**
   * Transporter writes data to file
   * @param logObject 
   */
  private static logToTransport(logObject: ILogObject) {
    let file = './upstreammon.log';
    if (process.env.LOGPATH && process.env.LOGFILE) file = `${process.env.LOGPATH}/${process.env.LOGFILE}`;

    const msg = {
      loglevel: logObject.logLevel,
      message: String(logObject.argumentsArray[0]),
    };

    appendFile(file, JSON.stringify(msg) + "\n", function () { });
  }

  /* ------------------------------------------------------------------ */
  /* Log-Methods for each log level */
  /* ------------------------------------------------------------------ */

  public static silly(msg: any) {
    if (!this.logger) this.init();
    this.logger.silly(msg);
  }
  public static debug(msg: any) {
    if (!this.logger) this.init();
    this.logger.debug(msg);
  }
  public static trace(msg: any) {
    if (!this.logger) this.init();
    this.logger.trace(msg);
  }
  public static info(msg: any) {
    if (!this.logger) this.init();
    this.logger.info(msg);
  }
  public static warn(msg: any) {
    if (!this.logger) this.init();
    this.logger.warn(msg);
  }
  public static error(msg: any) {
    if (!this.logger) this.init();
    this.logger.error(msg);
  }
  public static fatal(msg: any) {
    if (!this.logger) this.init();
    this.logger.fatal(msg);
  }
}
