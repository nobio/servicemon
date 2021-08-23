import { Configuration, PersistenceConfig } from "../model/Config";
import { ConsoleLogTarget } from "./ConsoleLogTarget";
import { DatabaseTarget } from "./DatabaseTarget";
import { FileTarget } from "./FileTarget";
import { PersistenceTarget } from "./PersistenceTarget";
import { RestfulTarget } from "./RestfulTarget";

export class PersistenceTargetFactory {
  private persistenceTarget: PersistenceTarget;
  private config: PersistenceConfig = Configuration.getInstance().peristenceConfig;

  private static instance: PersistenceTargetFactory;


  constructor() {

    const target = process.env.PERSISTENCE || this.config.persistence;

    switch (target) {
      case 'CONSOLE':
        this.persistenceTarget = ConsoleLogTarget.getInstance();
        break;
      case 'DATABASE':
        this.persistenceTarget = DatabaseTarget.getInstance();
        break;
      case 'RESTFUL':
        this.persistenceTarget = RestfulTarget.getInstance();
        break;
      case 'FILE':
        this.persistenceTarget = FileTarget.getInstance();
        break;

      default:
        this.persistenceTarget = ConsoleLogTarget.getInstance();
        break;
    }
  }

  public static getInstance(): PersistenceTargetFactory {
    if (!PersistenceTargetFactory.instance) {
      PersistenceTargetFactory.instance = new PersistenceTargetFactory();
    }
    return this.instance;
  }

  public getPersistenceTarget(): PersistenceTarget {
    return this.persistenceTarget;
  }

}