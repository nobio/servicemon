import moment from "moment";

const localHostName = require("os").hostname();

export class Output {
  public txId: string = 'na';
  public configId: string = '';
  public configName: string = '';
  public status: number = 0;
  public statusText: string = '';
  public uri: string = '';
  public method: string = '';
  public tsStart: string = moment().format('MM-DD-YY[T]HH:mm[Z]SSS');
  public tsEnd: string = moment().format('MM-DD-YY[T]HH:mm[Z]SSS');
  public tsExpire: number = -1;
  public duration: number = 0;
  public source: string = localHostName;

  /**
   * returns true, when this event has expired
   */
  public hasExpired(): boolean {
    const now = moment().valueOf();
    return this.tsExpire < now;
  }
}
