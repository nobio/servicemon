import { Output } from "../model/Output";
import { PersistenceTarget } from "./PersistenceTarget";
import { Log } from "../api/Log";

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
    Log.info(out);
    Log.debug('\\=========================================================/');

    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  deleteRecords(hours: number): Promise<number> {
    // nothing to do...
    return new Promise((resolve, reject) => {
      resolve(0);
    });
  }

}
