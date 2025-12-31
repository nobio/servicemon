import { Output } from "../model/Output";
import { PersistenceTarget } from "./PersistenceTarget";
import { Log } from "../api/Log";
import { LOGLEVEL } from "../model/Params";

export class ConsoleLogTarget implements PersistenceTarget {
  private static instance: ConsoleLogTarget;

  /**
   * implementation of a singleton pattern: fetch an instance by this method
   */
  public static getInstance(): PersistenceTarget {
    Log.silly('persistence target is ConsoleLogTarget');

    if (!ConsoleLogTarget.instance) {
      ConsoleLogTarget.instance = new ConsoleLogTarget();
    }
    return ConsoleLogTarget.instance;
  }

  persist(out: Output): Promise<boolean> {
    Log.debug('/=================CONSOLE=================================\\');
    Log.generic(out.status < 300 ? LOGLEVEL.INFO : out.status < 400 ? LOGLEVEL.WARN : LOGLEVEL.ERROR, `${out.configName} - ${out.configId} (${out.duration}) -> ${out.status} (${out.statusText}) ${out.txId}`);
    Log.debug('\\=========================================================/');

    return new Promise((resolve) => {
      resolve(true);
    });
  }
  /* eslint @typescript-eslint/no-unused-vars: "off" */
  deleteRecords(hours: number): Promise<number> {
    // nothing to do...
    return new Promise((resolve, reject) => {
      resolve(0);
    });
  }

}
