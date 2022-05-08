import { Request, Response } from "express";
import moment from "moment";
import { Configuration } from "../model/Config";
import { HostConfig } from "../model/HostConfig";
import { HostConfigStatus } from "../model/HostConfigStatus";
import { Output } from "../model/Output";
import { TimeseriesParams, TimeUnitConverter } from "../model/Params";
import { DatabaseTarget } from "../persistence/DatabaseTarget";
import { PersistenceTargetFactory } from "../persistence/PersistenceTargetFactory";
import { DataServiceFactory } from "../service/DataServiceFactory";
import { Log } from "./Log";

const yml = require('yml');

export class Util {

  /**
   *
   * @param req
   * @param res
   */
  public handleRoot(req: Request, res: Response) {
    res.status(200).json([
      {
        'method': 'get',
        'url': '/',
        'description': 'this document :-)',
        'example': 'curl -X GET http://<host>:<port>/',
      },
      {
        'method': 'post',
        'url': '/api/httpstatus',
        'description': 'receive and store a status measurement',
        'example': 'curl -X POST http://<host>:<port>/',
      },
      {
        'method': 'get',
        'url': '/api/hosts',
        'description': 'return metadata of configured hosts',
        'example': 'curl -X GET http://<host>:<port>/api/hosts',
      },
      {
        'method': 'get',
        'url': '/api/queue/:configId/status',
        'description': 'return the last stored status for the given configuration',
        'example': 'curl -X GET http://<host>:<port>/api/queue/2ae3e900-4cb3-43d7-aa52-1d4c0a066ea2/status',
      },
      {
        'method': 'get',
        'url': '/api/queue/:configId/timeseries/:timeUnit',
        'description': 'return time series for a given configuration, start time, time unit',
        'exampple': 'curl -X GET "http://<host>:<port>/api/queue/2ae3e900-4cb3-43d7-aa52-1d4c0a066ea2/timeseries/days?start=2020-09-01&count=100"',
      },
    ]);
  };

  /**
   *
   * @param req
   * @param res
   */
  public receiveHttpStatus(req: Request, res: Response): void {
    const o = new Output();

    o.configId = req.body.configId;
    o.configName = req.body.configName;
    o.status = req.body.status;
    o.statusText = req.body.statusText;
    o.uri = req.body.uri;
    o.method = req.body.method;
    o.tsStart = req.body.tsStart;
    o.tsEnd = req.body.tsEnd;
    o.duration = req.body.duration;
    o.source = req.body.source;

    Log.debug(o);

    const dbTarget = DatabaseTarget.getInstance();
    dbTarget.persist(o)
      .then(result => res.status(200).send(result))
      .catch(result => res.status(500).send(result))
  };

  /**
   * load hosts configuration incl. last measurements
   * @param req
   * @param res
   */
  public async getWatchedHostsWithLastStatus(req: Request, res: Response) {
    const hostConfigs: HostConfig[] = Configuration.getInstance().hostsConfigs;

    let hostCfg: HostConfig[] = hostConfigs.map((hsot) => hsot);

    // ger actual data from database
    new Promise((resolve, reject) => {

      // return empty result if no hosts were found
      if (hostCfg.length === 0) resolve([]);

      const hostConfigWithStatuses: HostConfigStatus[] = new Array<HostConfigStatus>();
      hostCfg.forEach((host, idx, array) => {
        DataServiceFactory.getInstance().getDatService().getLastEntry(host.id)
          .then((output: Output) => {
            const hostConfigWithStatus: HostConfigStatus = new HostConfigStatus();

            hostConfigWithStatus.setHostConfig(host);
            hostConfigWithStatus.setOutput(output);
            hostConfigWithStatuses.push(hostConfigWithStatus);

            if (idx === array.length - 1) resolve(hostConfigWithStatuses);
          })
          .catch(err => reject(err));
      });

    }).then(h => res.status(200).json(h))

  }

  /**
   * curl -X GET http://localhost:28090/api/hosts
   * @param req
   * @param res
   */
  public async getWatchedHosts(req: Request, res: Response) {
    const hostConfigs = Configuration.getInstance().hostsConfigs;
    res.status(200).json(hostConfigs);
  };

  /**
   * curl -X GET http://localhost:28090/api/queue/xxxxxxxx-4533-43d7-aa52-1d4c0a066ea2/status
   * @param req
   * @param res
   */
  public getLastStatus(req: Request, res: Response) {
    if (!(PersistenceTargetFactory.getInstance().getPersistenceTarget() instanceof DatabaseTarget)) { res.status(500).json({ 'error': 'last status can only be read for persistence target = DATABASE; please check your config' }); return; }

    DataServiceFactory.getInstance().getDatService().getLastEntry(req.params['configId'])
      .then((ts: Output) => res.status(200).json(ts))
      .catch((err: Error) => res.status(500).send(err.message + err.stack));

  }

  /**
   * curl -X GET "http://localhost:28090/api/queue/8d46657c-4f94-4d37-9db5-cb8fcd79a423/timeseries/month?start=2020-10-11&count=1"
   * curl -X GET http://localhost:28090/api/queue/8d46657c-4f94-4d37-9db5-cb8fcd79a423/timeseries/month?count=1
   * @param req
   * @param res
   */
  public getTimeSeries(req: Request, res: Response) {
    if (!(PersistenceTargetFactory.getInstance().getPersistenceTarget() instanceof DatabaseTarget)) { res.status(500).json({ 'error': 'last status can only be read for persistence target = DATABASE; please check your config' }); return; }
    if (!req.params['timeUnit']) { res.status(500).json({ 'error': 'please provide timeUnit' }); return; }
    if (!req.params['configId']) { res.status(500).json({ 'error': 'please provide configId' }); return; }
    if (!req.query['count']) { res.status(500).json({ 'error': 'please provide count' }); return; }
    //    if (!req.query['start']) { res.status(500).json({ 'error': 'please provide start' }); return; }
    if (!req.query['start']) {
      req.query.start = moment().toISOString();
    }

    const params: TimeseriesParams = {
      timeUnit: TimeUnitConverter.convertString2TimeUnit(req.params['timeUnit']),
      configId: req.params['configId'],
      tsStart: `${req.query['start']}`,
      countTimeUnits: Number(req.query['count']),
    }

    DataServiceFactory.getInstance().getDatService().getTimeSeries(params)
      .then((ts: any) => res.status(200).json(ts))
      .catch((err: Error) => res.status(500).send(err.message + err.stack));
  }

  /**
   * Laden einer Configdatei. Dabei wird auch ein Umgebungsvariable berücksichtigt, die den Pfad auf die Datei angibt
   * Please mind: In OSCP the filename (part of configmap) is named "upstreammon-config.yaml" instead of the local "config.yaml"
   */
  public static loadConfig() {
    let target: string;

    if (process.env.CONFIGPATH) {
      target = process.env.CONFIGPATH + '/upstreammon-config.yaml';
    } else {
      target = `${__dirname}/../../config/config.yaml`;
    }

    Log.debug(`loading config ${target}`);
    return yml.load(target, 'utf8');
  }

  public static loadHostConfig() {
    let target: string;

    if (process.env.CONFIGPATH) {
      target = process.env.CONFIGPATH + '/upstreammon-hosts-config.yaml';
    } else {
      target = `${__dirname}/../../config/config-hosts.yaml`;
    }

    Log.debug(`loading config ${target}`);
    const config = yml.load(target, 'utf8');

    return config
  }
}