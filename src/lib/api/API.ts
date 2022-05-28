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

interface Target {
  target: string;
  refId: string;
  hide: boolean;
  type: string;
}

interface TimeseriesResponse {
  target: string,
  datapoints: number[][]
}

export class API {
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
  }

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
  }

  /**
   * load hosts configuration incl. last measurements
   * @param req
   * @param res
   */
  public async getWatchedHostsWithLastStatus(req: Request, res: Response) {
    const hostConfigs: HostConfig[] = Configuration.getInstance().hostsConfigs;

    const hostCfg: HostConfig[] = hostConfigs.map((hsot) => hsot);

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
  }

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
   * implements Grafana "search" endpoint; see https://grafana.com/grafana/plugins/grafana-simple-json-datasource/
   * curl -X POST http://localhost:28090/api/search
   *
   * @param req: /search => { target: '' }
   * @param res: [host1, host2, host3] (Liste der Hostsnamen. Diese können im Query-Dialog ausgewählt werden)
   */
  public grafanaSearch(req: Request, res: Response) {
    const resp: string[] = Configuration.getInstance().hostsConfigs.map(cfg => cfg.name);
    res.status(200).json(resp);
  }

  /**
   *
   * @param req
   * wichtig:
   * - req.body.range.from und req.body.range.to
   * - targets wird leer sein. Wenn es mehre
    {
      app: 'dashboard',
      requestId: 'Q4076',
      timezone: 'browser',
      panelId: 2,
      dashboardId: 6,
      range: {
        from: '2022-05-24T04:11:57.425Z',
        to: '2022-05-24T16:11:57.425Z',
        raw: { from: 'now-12h', to: 'now' }
      },
      timeInfo: '',
      interval: '1m',
      intervalMs: 60000,
      targets: [
        { target: 'upper_25', refId: 'A', type: 'timeserie' },
        { target: 'upper_50', refId: 'B', hide: false, type: 'timeserie' },
        { target: 'upper_75', refId: 'C', hide: false, type: 'timeserie' }
      ],
      maxDataPoints: 676,
      scopedVars: {
        __interval: { text: '1m', value: '1m' },
        __interval_ms: { text: '60000', value: 60000 }
      },
      startTime: 1653408717425,
      rangeRaw: { from: 'now-12h', to: 'now' },
      adhocFilters: []
    }

   * @param res Die Arrays in datapoints sind Tupel, bestehend aus einem Wert und einem Zeitstempel:
    ...[3,1653398974000],[2,1653399024000]...
    [
      {
        target: 'upper_25',
        datapoints: [
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          [Array], [Array],
          ... 105 more items
        ]
      },
      {
        target: 'upper_50',
        datapoints: [
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          ... 105 more items
        ]
      },
      {
        target: 'upper_75',
        datapoints: [
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          [Array], [Array], [Array], [Array], [Array], [Array], [Array],
          [Array], [Array],
          ... 105 more items
        ]
      }
    ]
   */
  public async grafanaQuery(req: Request, res: Response) {
    const from: string = req.body.range.from;
    const to: string = req.body.range.to;
    const targets: Array<Target> = req.body.targets;
    const resp: TimeseriesResponse[] = [];

    try {
      // iterate all targets
      let configId = '';

      for (const target of targets) {
        //Log.silly(target);

        // resolve configId by name
        Configuration.getInstance().hostsConfigs.forEach(configElement => {
          if (target.target === configElement.name) {
            configId = configElement.id;
          }
        });

        if (configId !== '') {
          let datapoint: number[] = [];
          const datapoints: number[][] = [];
          const timeseries = await DataServiceFactory.getInstance().getDatService().getTimeSeriesStartEnd(configId, from, to);
          //Log.silly(timeseries)

          for (const ts of timeseries) {
            datapoint = [];
            datapoint.push(ts.duration);                               // value (y-Achse)
            datapoint.push(parseInt(moment(ts.tsStart).format('x')));  // timestamp in millisec (x-Achse)

            datapoints.push(datapoint);
          }

          resp.push({
            target: target.target,
            datapoints: datapoints,
          })
        }
      }
      Log.silly(resp);
      res.status(200).json(resp);

    } catch (err: any) {
      res.status(500).send(err.message + err.stack);
    }
  }

  public grafanaAnnotations(req: Request, res: Response) {
    res.json(200).end();
  }

  public monitor(req: Request, res: Response): void {
    console.log(req.url)
    console.log(req.method)
    const resp = {
      url: req.url,
      method: req.method,
      headers: {},
      body: {}
    };

    resp.url = req.url;
    resp.method = req.method;
    //  resp.headers = JSON.stringify(req.headers);
    //  resp.body = JSON.stringify(req.body);
    if (Object.keys(req.headers).length) resp.headers = req.headers;
    if (Object.keys(req.body).length) resp.body = req.body;

    Log.info(JSON.stringify(resp));

    res.status(200).json(resp);

  }

}
