import { Configuration, PersistenceConfig } from "../model/Config";
import { DataService } from "./DataService";
//import { LokijsDBService } from "./LokijsDBService";
import { MongoDBService } from "./MongoDBService";

export class DataServiceFactory {
  private dataService: DataService;
  private config: PersistenceConfig = Configuration.getInstance().peristenceConfig;

  private static instance: DataServiceFactory;


  constructor() {

    const target = process.env.DATASERVICE || this.config.databaseType;

    switch (target) {
      case 'MONGODB':
        this.dataService = MongoDBService.getInstance();
        break;
      /*
            case 'LOKIJS':
              this.dataService = LokijsDBService.getInstance();
              break;

      */
      default:
        this.dataService = MongoDBService.getInstance();
        break;
    }
  }

  public static getInstance(): DataServiceFactory {
    if (!DataServiceFactory.instance) {
      DataServiceFactory.instance = new DataServiceFactory();
    }
    return this.instance;
  }

  public getDatService(): DataService {
    return this.dataService;
  }

}