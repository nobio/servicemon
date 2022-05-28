import moment from "moment";
import { hostname } from "os";

const localHostName = hostname();

export class Output {
  public txId = 'na';
  public configId = '';
  public configName = '';
  public status = 0;
  public statusText = '';
  public uri = '';
  public method = '';
  public tsStart: string = moment().format('MM-DD-YY[T]HH:mm[Z]SSS');
  public tsEnd: string = moment().format('MM-DD-YY[T]HH:mm[Z]SSS');
  public tsExpire = -1;
  public duration = 0;
  public source: string = localHostName;

  /**
   * returns true, when this event has expired
   */
  public hasExpired(): boolean {
    const now = moment().valueOf();
    return this.tsExpire < now;
  }
}
