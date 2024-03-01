/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint @typescript-eslint/no-explicit-any: "off" */
import moment from 'moment';
import { Configuration } from './model/Config';
import { Output } from './model/Output';
import { PersistenceTargetFactory } from './persistence/PersistenceTargetFactory';
import { TxQueue } from './TxQueue';
import { HostConfig } from './model/HostConfig';
import { HttpStatusCodes } from './model/HttpStatusCodes';
import { Log } from './api/Log';

const https = require('https');
const axios = require('axios');

/**
 * start scheduler to run tasks
 */
export class Scheduler {

    private cfg: Configuration = Configuration.getInstance();
    private httpCodes: HttpStatusCodes = new HttpStatusCodes();

    constructor() {
        Log.silly("init Scheduler")
    }

    /**
     * initializes the timer
     */
    public run() {

        // load configuration and start for each object a task
        this.cfg.hostsConfigs.forEach((cfg: HostConfig) => {
            if (cfg.enable) {
                Log.info(`| >   starting scheduler every ${cfg.schedule} sec for ${cfg.name} with ${cfg.concurrent} threads`);
                // initial call...
                this.invoke(cfg);
                // ... periodical call
                // ... initialize this thread with numbers of concurrent instances
                for (let n = 0; n < cfg.concurrent; n++) {
                    setInterval(() => {
                        this.invoke(cfg);
                    }, (cfg.schedule * 1000 + this.variance(cfg.schedule * 1000)));
                }
            }
        });

        // start delete handler
        setInterval(() => {
            Log.info(`| >   deleting old records...`);
            PersistenceTargetFactory.getInstance().getPersistenceTarget().deleteRecords(
                this.cfg.peristenceConfig.deleteAfter,
                this.cfg.peristenceConfig.deleteAfterTimeUnit)
                .then(res => Log.info(`| >   ${res} records deleted`))
                .catch(err => Log.error(err));
        }, (this.cfg.peristenceConfig.latency * 1000));

    }

    /**
     * calculates a random number of +/- 10% of the given base
     * @param base
     */
    private variance(base: number) {
        const intervalAbs = base * 10 / 100;  // 10%
        const rnd = Math.random() - 0.5;
        return intervalAbs * rnd;
    }

    /**
    * invokes
    * @param cfg configuration
    */
    private invoke(cfg: HostConfig) {
        Log.debug(`| >   Invoking '${cfg.name}' - ${cfg.protocol}://${cfg.baseUrl}${cfg.url}`);

        const start = moment().valueOf();
        const options = {
            url: cfg.url,
            method: cfg.method,
            baseURL: cfg.protocol + '://' + cfg.baseUrl,
            timeout: cfg.timeout,
            httpsAgent: new https.Agent({ rejectUnauthorized: !cfg.ignoreSSL }),
            headers: cfg.headers
        }

        axios(options)
            .then((res: unknown) => this.trace(true, res, cfg.id, cfg.name, start))
            .catch((res: unknown) => this.trace(false, res, cfg.id, cfg.name, start));
    }

    /**
    * Export a trace (now to console, later to database)
    */
    trace(success: boolean, resp: any, id: string, name: string, startTimestamp: number) {
        const output: Output = new Output();
        output.configId = id;
        output.configName = name;
        if (resp.data) Log.silly(resp.data)

        if (success) {
            output.status = resp.status;
            if (resp.data && resp.data['status']) output.statusText = resp.data['status'];
            if (!output.statusText && resp.statusText) output.statusText = resp.statusText;
            if (!output.statusText) output.statusText = this.httpCodes.translateCodeToText('' + output.status);

            output.uri = resp.request.res.responseUrl;
            output.method = resp.config.method;

        } else {
            if (resp.errno) {
                switch (resp.errno) {
                    case 'ETIMEDOUT':
                        output.status = 408;
                        output.statusText = 'Request Timeout';
                        break;
                    case 'ECONNREFUSED':
                        output.status = 500;
                        output.statusText = 'Connection refused';
                        break;
                    case 'ENOTFOUND':
                        output.status = 500;
                        output.statusText = 'Can not resolve hostname';
                        break;
                    case 'EAI_AGAIN':
                        output.status = 500;
                        output.statusText = 'DNS lookup timed out';
                        break;
                    case 'ENETUNREACH':
                        output.status = 500;
                        output.statusText = 'No internet connection';
                        break;
                    default:
                        output.status = 501;
                        output.statusText = resp.code;
                        break;
                }
                output.uri = resp.config.baseURL + resp.config.url;
                output.method = resp.config.method;
            } else if (resp.response) {
                output.status = resp.response.status;
                output.statusText = (resp.response.statusText ? resp.response.statusText : this.httpCodes.translateCodeToText('' + output.status));
                output.uri = resp.request.res.responseUrl;
                output.method = resp.config.method;
            } else if (resp.code) {
                output.status = 500;
                output.statusText = this.httpCodes.translateCodeToText('500');
                output.uri = resp.config.baseURL + resp.config.url;
                output.method = resp.config.method;
            } else {
                output.status = 500;
                output.statusText = 'unknown error';
                output.uri = resp.request.res.responseUrl;
                output.method = resp.config.method;
            }
        }
        output.tsStart = moment(startTimestamp).toISOString();
        output.tsEnd = moment().toISOString();
        output.duration = moment().valueOf() - startTimestamp;

        // add to queue
        TxQueue.getInstance().push(output);
    }

}
