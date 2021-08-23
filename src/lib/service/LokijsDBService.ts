import moment from "moment";
import { Output } from "../model/Output";
import { TimeseriesParams, TIME_UNIT } from "../model/Params";
import { DataService } from "./DataService";
import { Log } from "../api/Log";
const loki = require('lokijs');
const lfsa = require('lokijs/src/loki-fs-structured-adapter');

// Since autosave timer keeps program from exiting, we exit this program by ctrl-c.
// (optionally) For best practice, lets use the standard exit events to force a db flush to disk 
//    if autosave timer has not had a fired yet (if exiting before 4 seconds).
process.on('SIGINT', () => {
    Log.silly("flushing database");
    LokijsDBService.getInstance().shutdown();
    process.exit(0);
});

export class LokijsDBService implements DataService {
    private static instance: DataService;
    private db: any;
    private httpStatusEvents: any;

    private constructor() {
        this.db = new loki('monitor.db', {
            adapter: new lfsa(),
            autosave: true,
            autosaveInterval: 5000
        });
        this.httpStatusEvents = this.db.addCollection("HttpStatusEvents");
    }


    public static getInstance(): DataService {
        //Log.info('get instance of SQLite-DataService');
        if (!LokijsDBService.instance) {
            LokijsDBService.instance = new LokijsDBService();
        }
        return LokijsDBService.instance;
    }

    public async saveHttpStatus(out: Output): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.httpStatusEvents.insert({
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
                source: out.source
            });
            Log.silly(' --> ' + this.httpStatusEvents.count());
            resolve(true);
        })
    }

    public async getLastEntry(configId: string): Promise<Output> {
        return new Promise((resolve, reject) => {
            const res: any = this.httpStatusEvents.chain().find({ configId: +configId }).simplesort('tsStart', true).limit(1).data();
            const out: Output = new Output();

            if (res[0]) {
                out.txId = res[0]['txId'];
                out.configId = res[0]['configId'];
                out.configName = res[0]['configName'];
                out.status = res[0]['status'];
                out.statusText = res[0]['statusText'];
                out.uri = res[0]['uri'];
                out.method = res[0]['method'];
                out.tsStart = res[0]['tsStart'];
                out.tsEnd = res[0]['tsEnd'];
                //out.tsExpire = res[0]['tsExpire'];
                out.duration = res[0]['duration'];
                out.source = res[0]['source'];
            }
            resolve(out);

        })
    }
    public async getTimeSeries(params: TimeseriesParams): Promise<Array<Output>> {
        let response: Output[] = new Array<Output>();
        //Log.info(params);
        const dtEnd = moment(params.tsStart).add(1, TIME_UNIT.DAYS).subtract(1, TIME_UNIT.SECONDS);
        const dtStart = moment(params.tsStart).subtract(params.countTimeUnits, params.timeUnit);
        Log.silly(`von ${dtStart} bis ${dtEnd}`);

        return new Promise((resolve, reject) => {
            const res: any[] = this.httpStatusEvents.chain().find({
                configId: +params.configId,
                tsStart: { $gt: dtStart },
                tsEnd: { $lte: dtEnd },
            }).simplesort('tsStart', true).data();

            res.forEach(itm => {
                const out = new Output();
                out.txId = itm['txId'];
                out.configId = itm['configId'];
                out.configName = itm['configName'];
                out.status = itm['status'];
                out.statusText = itm['statusText'];
                out.uri = itm['uri'];
                out.method = itm['method'];
                out.tsStart = itm['tsStart'];
                out.tsEnd = itm['tsEnd'];
                out.duration = itm['duration'];
                out.source = itm['source'];

                response.push(out);
            });

            resolve(response);
        })
    }

    public deleteOldEntries(hours: number, timeUnit: TIME_UNIT): Promise<number> {
        const timestamp = moment().subtract(hours, timeUnit);
        Log.silly(timestamp)

        return new Promise((resolve, reject) => {
            const res = this.httpStatusEvents.chain().find({ tsStart: { $lte: timestamp } }).remove();
            this.db.saveDatabase(() => {
                //Log.info(res.collection.data)
                resolve(res.collection.data.length);    
            })
        });
    }

    public shutdown(): void {
        this.db.close()
    }

}