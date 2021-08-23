import moment from "moment";
import { HostConfig } from "./HostConfig";
import { Output } from "./Output";

export class HostConfigStatus {
   public enable: boolean = false;
   public workspace: string = "";
   public id: string = "";
   public name: string = "";
   public schedule: number = 0;
   public method: string = "";
   public protocol: string = "";
   public baseUrl: string = "";
   public url: string = "";
   public uri: string = "";
   public ignoreSSL: boolean = true;
   public headers: string = '';
   public lastStatus: number = 0;
   public lastStatusText: string = '';
   public lastStart: string = moment().format('MM-DD-YY[T]HH:mm[Z]SSS');
   public lastDuration: number = 0;

   constructor() { }

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
