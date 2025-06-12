import moment from "moment";
import { Output } from "../model/Output";
import { PersistenceTarget } from "./PersistenceTarget";
import { Util } from "../api/Util";
import { Log } from "../api/Log";
import { Agent } from 'https';
/* eslint @typescript-eslint/no-var-requires: "off" */
import { default as axios } from 'axios';

export interface RestEndpointConfig {
  protocol: string;
  method: string;
  baseUrl: string;
  url: string;
  ignoreSSL: boolean;
}

export class RestfulTarget implements PersistenceTarget {

  private static instance: RestfulTarget;
  private config: RestEndpointConfig;

  private constructor() {
    try {
      this.config = Util.loadConfig().restendpoint;
    } catch (e) {
      Log.error(e);
      process.exit(-1);
    }
  }


  /**
   * implementation of a singleton pattern: fetch an instance by this method
   */
  public static getInstance(): RestfulTarget {
    Log.silly('persistence target is RestfulTarget');

    if (!RestfulTarget.instance) {
      RestfulTarget.instance = new RestfulTarget();
    }
    return RestfulTarget.instance;
  }

  persist(out: Output): Promise<boolean> {
    Log.debug('/===================RESTFUL================================\\');
    Log.info(`"${out.configName}" (${out.configId}) -> ${out.status} (${out.statusText}) ${out.txId}`);
    Log.debug('\\=========================================================/');

    return new Promise((resolve) => {
      this.invoke(out)
        .then(b => resolve(b))
        .catch(() => resolve(false))
    });
  }

  /* eslint @typescript-eslint/no-unused-vars: "off" */
  deleteRecords(hours: number): Promise<number> {
    // nothing to do...
    return new Promise((resolve) => {
      resolve(0);
    });
  }

  private async invoke(out: Output): Promise<boolean> {
    Log.debug(` ${moment().format()} ìnvoking ${this.config.method}: ${this.config.protocol}://${this.config.baseUrl}${this.config.url}`);

    const start = moment().valueOf();
    const options = {
      url: this.config.url,
      method: this.config.method,
      baseURL: this.config.protocol + '://' + this.config.baseUrl,
      data: out,
      timeout: 2000,
      httpsAgent: new Agent({ rejectUnauthorized: !this.config.ignoreSSL })
    }

    try {
      const resp = await axios(options);
      return this.evaluateResponse(resp);
    } catch (error) {
      Log.error(error);
      return false;
    }
  }
  /**
   * Export a trace (now to console, later to database)
   */
  /* eslint @typescript-eslint/no-explicit-any: "off" */
  private evaluateResponse(resp: any): boolean {
    Log.info(`${resp.status}, ${resp.errno}`)
    if (resp.status) return resp.status >= 200 && resp.status < 300;
    if (resp.errno) return false;
    return false;
  }

}