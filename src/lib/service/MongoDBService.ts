/* eslint @typescript-eslint/no-explicit-any: "off" */
import 'dotenv/config';
import moment from "moment-timezone";
import { Model, Mongoose, Schema } from "mongoose";
import { Log } from "../api/Log";
import { Util } from "../api/Util";
import { Output } from "../model/Output";
import { TimeseriesParams, TIME_UNIT } from "../model/Params";
import { MongoDBConfig } from "../persistence/DatabaseTarget";
import { DataService, IHttpStatusEvent } from "./DataService";

process.on('SIGINT', () => {
  Log.silly("flushing database");
  MongoDBService.getInstance().shutdown();
});

export class MongoDBService implements DataService {
  private static instance: DataService;
  private mongoose = new Mongoose();
  private HttpStatusEvent: Model<IHttpStatusEvent>;
  private cfg: MongoDBConfig;

  private constructor() {
    try {
      this.cfg = Util.loadConfig().persistenceTarget.database;
      if (process.env.MONGODB_PROTOCOL
        && process.env.MONGODB_USER
        && process.env.MONGODB_PASSWORD
        && process.env.MONGODB_URI) {
        this.cfg.protocol = process.env.MONGODB_PROTOCOL;
        this.cfg.user = process.env.MONGODB_USER;
        this.cfg.password = process.env.MONGODB_PASSWORD;
        this.cfg.uri = process.env.MONGODB_URI;
      }

      // connect database...
      Log.silly(`connecting to mongo database ${this.cfg.protocol}://${this.cfg.user}:${this.cfg.password}@${this.cfg.uri}`);
      console.log(`connecting to mongo database ${this.cfg.protocol}://${this.cfg.user}:${this.cfg.password}@${this.cfg.uri}`);
      const mongoConnect = `${this.cfg.protocol}://${this.cfg.user}:${this.cfg.password}@${this.cfg.uri}`;
      Log.silly(mongoConnect);
      console.log(mongoConnect);

      this.mongoose.connect(mongoConnect).then(
        () => {
          Log.info('mongodb is ready to use.');
        },
        (err) => {
          Log.error(`error while connecting mongodb:${err}`);
          process.exit(-1)
        },
      );
    } catch (e) {
      Log.error(e);
      process.exit(-1);
    }


    // setup model
    const HttpStatusEventSchema: Schema = new Schema({
      txId: { type: String, required: true, index: true },
      configId: { type: String, required: true, index: true },
      configName: { type: String, required: true, index: false },
      status: { type: Number, required: true, default: 200, index: false },
      statusText: { type: String, required: false, default: '', index: false },
      uri: { type: String, required: true, index: false },
      method: { type: String, required: true, index: false },
      tsStart: { type: Date, required: true, default: Date.now, index: true },
      tsEnd: { type: Date, required: true, default: Date.now, index: false },
      tsExpire: { type: Date, required: true, default: Date.now, index: false },
      duration: { type: Number, required: true, default: 0, index: false },
      source: { type: String, required: false, index: false },
    });

    this.HttpStatusEvent = this.mongoose.model<IHttpStatusEvent>('HttpStatusEvent', HttpStatusEventSchema);

  }

  /**
   * implementation of a singleton pattern: fetch an instance by this method
  */
  public static getInstance(): DataService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  // *********************************************************************************** //
  public async saveHttpStatus(out: Output): Promise<boolean> {

    try {
      await new this.HttpStatusEvent({
        txId: out.txId,
        configId: out.configId,
        configName: out.configName,
        status: out.status,
        statusText: out.statusText,
        uri: out.uri,
        method: out.method,
        tsStart: moment(out.tsStart).toDate(),
        tsEnd: moment(out.tsEnd).toDate(),
        tsExpire: moment(out.tsExpire).toDate(),
        duration: out.duration,
        source: out.source,
      }).save();
      return true;

    } catch (error) {
      Log.error(error);
      return false;
    }
  }

  public async getLastEntry(configId: string): Promise<Output> {
    return new Promise((resolve, reject) => {
      if (!configId) reject('please provide a configuration id configId');

      this.HttpStatusEvent.findOne({ configId }).sort({ tsStart: 'desc' })
        .then((res: any) => {
          const out: Output = new Output();
          out.txId = res['txId'];
          out.configId = res['configId'];
          out.configName = res['configName'];
          out.status = res['status'];
          out.statusText = res['statusText'];
          out.uri = res['uri'];
          out.method = res['method'];
          out.tsStart = res['tsStart'];
          out.tsEnd = res['tsEnd'];
          //out.tsExpire = res['tsExpire'];
          out.duration = res['duration'];
          out.source = res['source'];

          resolve(out);
        })
        .catch((err) => reject(err))
    });
  }

  /**
   * curl -X GET "http://localhost:28090/api/queue/8d46657c-4f94-4d37-9db5-cb8fcd79a423/timeseries/minutes?start=2020-10-11&count=1"
   * @param params
   */
  public async getTimeSeries(params: TimeseriesParams): Promise<Array<Output>> {
    Log.silly(params);
    const dtEnd = moment(params.tsStart);
    const dtStart = moment(params.tsStart).subtract(params.countTimeUnits, params.timeUnit);
    Log.silly(`von ${dtEnd} bis ${dtStart}`);

    return new Promise<Array<Output>>((resolve, reject) => {
      this.HttpStatusEvent
        .find({
          configId: params.configId,
          $and: [{ tsStart: { $gte: dtStart } }, { tsStart: { $lte: dtEnd } }],
        })
        .select({
          "class": 1,
          "tsStart": 1,
          "duration": 1,
          "status": 1,
          "statusText": 1,
          "_id": 0
        })
        .sort({ tsStart: 1 })
        .then((ts: any) => resolve(ts))
        .catch((err) => reject(err))
    });
  }

  public getTimeSeriesStartEnd(configId: string, tsStart: string, tsEnd: string): Promise<Array<Output>> {
    Log.silly(`configId: ${configId}, tsStart: ${tsStart}, tsEnd: ${tsEnd}`);
    const dtEnd = moment(tsEnd);
    const dtStart = moment(tsStart);
    Log.silly(`von ${dtEnd} bis ${dtStart}`);

    return new Promise<Array<Output>>((resolve, reject) => {
      this.HttpStatusEvent
        .find({
          configId,
          $and: [{ tsStart: { $gte: dtStart } }, { tsStart: { $lte: dtEnd } }],
        })
        .select({
          "class": 1,
          "tsStart": 1,
          "duration": 1,
          "status": 1,
          "statusText": 1,
          "_id": 0
        })
        .sort({ tsStart: 1 })
        .then((ts: any) => resolve(ts))
        .catch((err) => reject(err))
    });
  }

  public deleteOldEntries(hours: number, timeUnit: TIME_UNIT): Promise<number> {
    const timestamp = moment().subtract(hours, timeUnit);

    return new Promise((resolve, reject) => {
      this.HttpStatusEvent.deleteMany({ tsStart: { $lte: timestamp } })
        .then((res) => resolve(res['deletedCount']))
        .catch((err) => reject(err))
    });
  }

  public shutdown(): void {
    Log.info('shutting down MongoDBService');
    this.mongoose.connection.close();
  }
}