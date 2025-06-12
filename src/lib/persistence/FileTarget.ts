import { Util } from "../api/Util";
import { Output } from "../model/Output";
import { PersistenceTarget } from "./PersistenceTarget";
import { Log } from "../api/Log";
import { default as fs } from 'fs';

/* eslint @typescript-eslint/no-var-requires: "off" */
const rollingFile = require('rolling-file');

export interface FileEndpointConfig {
  filename: string;
  filedir: string;
  maxSize: string;
}

export class FileTarget implements PersistenceTarget {

  private static instance: FileTarget;
  private fileOutput;  // no types for RollingFile available...

  private constructor() {
    try {
      const cfg: FileEndpointConfig = Util.loadConfig().fileendpoint;
      if (!fs.existsSync(cfg.filedir)) {
        fs.mkdirSync(cfg.filedir);
      }

      Log.silly(`init FileTarget ${cfg.filedir}/${cfg.filename}`);
      Log.silly(process.cwd());
      Log.silly(cfg)
      this.fileOutput = rollingFile(cfg.filedir, {
        fileName: cfg.filename,
        interval: '1 day',
        byteLimit: cfg.maxSize,
      });

    } catch (e) {
      Log.error(e);
      process.exit(-1);
    }

  }


  /**
   * implementation of a singleton pattern: fetch an instance by this method
   */
  public static getInstance(): FileTarget {
    Log.silly('persistence target is FileTarget');

    if (!FileTarget.instance) {
      FileTarget.instance = new FileTarget();
    }
    return FileTarget.instance;
  }

  persist(out: Output): Promise<boolean> {
    Log.debug('/====================FILE==================================\\');
    Log.info(`"${out.configName}" (${out.configId}) -> ${out.status} (${out.statusText}) ${out.txId}`);
    Log.debug('\\=========================================================/');

    return new Promise((resolve) => {
      this.fileOutput.write(JSON.stringify(out));
      resolve(true);
    });
  }

  /* eslint @typescript-eslint/no-unused-vars: "off" */
  deleteRecords(hours: number): Promise<number> {
    // nothing to do...
    return new Promise((resolve) => {
      resolve(0);
    });
  }

}