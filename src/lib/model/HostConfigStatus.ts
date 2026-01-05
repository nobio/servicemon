import moment from "moment";
import { HostConfig } from "./HostConfig";
import { Output } from "./Output";

export class HostConfigStatus {
   public enable = false;
   public workspace = "";
   public id = "";
   public name = "";
   public schedule = 0;
   public method = "";
   public protocol = "";
   public baseUrl = "";
   public url = "";
   public uri = "";
   public ignoreSSL = true;
   public headers = '';
   public lastStatus = 0;
   public lastStatusText = '';
   public lastStart: string = moment().format('MM-DD-YY[T]HH:mm[Z]SSS');
   public lastDuration = 0;

   public setHostConfig(cfg: HostConfig): void {
      this.enable = cfg.enable;
      this.id = cfg.id;
      this.workspace = cfg.workspace;
      this.schedule = cfg.schedule;
      this.protocol = cfg.protocol;
      this.baseUrl = cfg.baseUrl;
      this.url = cfg.url;
      this.name = cfg.name;
      this.method = cfg.method;
      this.ignoreSSL = cfg.ignoreSSL;
      this.headers = cfg.headers;
   }

   public setOutput(out: Output): void {
      this.lastStatus = out.status;
      this.lastStatusText = out.statusText;
      this.lastStart = out.tsStart;
      this.lastDuration = out.duration;
      this.uri = out.uri;
   }
}
export const httpStatusSchema = {
   title: 'http status schema',
   version: 1,
   keyCompression: true,
   primaryKey: 'txId',
   type: 'object',
   properties: {
      txId: { type: 'string' },
      configId: { type: 'string' },
      configName: { type: 'string' },
      status: { type: 'string' },
      statusText: { type: 'string' },
      uri: { type: 'string' },
      method: { type: 'string' },
      tsStart: { type: 'string' },
      tsEnd: { type: 'string' },
      t: { type: 'string' },
      duration: { type: 'string' },
      source: { type: 'string' }
   }
}
