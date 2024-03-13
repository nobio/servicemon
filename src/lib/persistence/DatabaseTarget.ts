import { Configuration, PersistenceConfig } from "../model/Config";
import { Output } from "../model/Output";
import { DataServiceFactory } from "../service/DataServiceFactory";
import { PersistenceTarget } from "./PersistenceTarget";
import { Log } from "../api/Log";

export interface MongoDBConfig {
  protocol: string | undefined;
  user: string | undefined;
  password: string | undefined;
  uri: string | undefined;
}

export class DatabaseTarget implements PersistenceTarget {

  private static instance: DatabaseTarget;
  private persistCfg: PersistenceConfig;

  /**
   * implementation of a singleton pattern: fetch an instance by this method
   */
  private constructor() {
    this.persistCfg = Configuration.getInstance().peristenceConfig;
  }

  public static getInstance(): PersistenceTarget {
    Log.info('persistence target is DatabaseTarget');
    if (!DatabaseTarget.instance) {
      DatabaseTarget.instance = new DatabaseTarget();
    }
    return DatabaseTarget.instance;
  }

  persist(out: Output): Promise<boolean> {
    Log.debug('/=================DATABASE============================================================\\');
    Log.info(`"${out.configName}" - ${out.configId} (${out.duration}) -> ${out.status} (${out.statusText}) ${out.txId}`);
    Log.debug('\\=====================================================================================/');

    return DataServiceFactory.getInstance().getDatService().saveHttpStatus(out);
  }

  /* eslint @typescript-eslint/no-unused-vars: "off" */
  deleteRecords(hours: number): Promise<number> {
    Log.debug('/==================DELETE-RECORDS=====================================================\\');
    Log.debug(`     delete ${hours} hours`);
    Log.debug('\\=====================================================================================/');
    return DataServiceFactory.getInstance().getDatService().deleteOldEntries(
      this.persistCfg.deleteAfter,
      this.persistCfg.deleteAfterTimeUnit
    )
  }

}