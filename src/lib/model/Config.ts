import { TIME_UNIT } from "./Params";
import { HostConfig } from "./HostConfig";
import { Util } from "../api/Util";
import { Log } from "../api/Log";

const yml = require('yml');

export interface PersistenceConfig {
  persistence: string;
  databaseType: string;
  deleteAfterTimeUnit: TIME_UNIT;
  deleteAfter: number;
  latency: number;
}

export class Configuration {
  public hostsConfigs: Array<HostConfig> = new Array();
  public peristenceConfig: PersistenceConfig;
  private static instance: Configuration;

  private constructor() {
    try {      
      this.hostsConfigs = Util.loadHostConfig().hosts;
      this.peristenceConfig = Util.loadConfig().persistenceTarget;
    } catch (e) {
      Log.error(e);
      process.exit(-1);
    }
  }

  public static getInstance(): Configuration {
    //Log.info('get instance of Configuration');
    if (!Configuration.instance) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }
}
