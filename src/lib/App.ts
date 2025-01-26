import cors from 'cors';
import express from 'express';
import fs from 'fs';
import figlet from 'figlet';
import http from 'http';
import https from 'https';
import morgan from 'morgan';
import { API } from "./api/API";
import { Log } from "./api/Log";
import { EventListener } from "./EventListener";
import { RollbackHandler } from "./RollbackHandler";
import { Scheduler } from "./Scheduler";
import { DataServiceFactory } from "./service/DataServiceFactory";

const app = express();

export class App {
  private api = new API();

  constructor() {
    app.set('host', process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
    app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || '28090');
    app.set('ssl-port', process.env.SSL_PORT || '28093');


    // ---------------- MIDDLEWARE -------------------------------------------
    app.use(cors());
    app.use(express.json());
    app.use('/', express.static(__dirname + '/web/'));
    app.use(morgan('[:date[web]] (:remote-addr, :response-time ms) :method :url - status: :status'));

    // ------------------ API ------------------------------------------------
    // restful services for entries using Promises
    // -----------------------------------------------------------------------
    app.get('/', this.api.handleRoot);
    app.post('/api/httpstatus', this.api.receiveHttpStatus);
    app.get('/api/hosts', this.api.getWatchedHostsWithLastStatus);
    app.get('/api/queue/:configId/status', this.api.getLastStatus);
    app.get('/api/queue/:configId/timeseries/:timeUnit', this.api.getTimeSeries);

    app.get('/api', this.api.monitor);
    app.all('/api/search', this.api.grafanaSearch);
    app.all('/api/query', this.api.grafanaQuery);
    //app.all('/api/annotations', this.api.monitor);

    // ------------------ SERVER ---------------------------------------------
    // start the web service with http
    // -----------------------------------------------------------------------
    console.log(figlet.textSync('-- servicemon --'));

    http.createServer(app).listen(app.get('port'), app.get('host'), () => {
      Log.info(`Service Monitor started`)
      Log.info(`Server listening on http://${app.get('host')}:${app.get('port')}/`);
    });

    const sslOptions = {
      key: fs.readFileSync('keys/key.pem'),
      cert: fs.readFileSync('keys/cert.pem'),
    };
    https.createServer(sslOptions, app).listen(app.get('ssl-port'), app.get('host'), () => {
      Log.info(`ssl server listening on https://${app.get('host')}:${app.get('ssl-port')}`);
    });


    // ------------------ QUEUE-RECEIVER & SCHEDULER -------------------------
    // start the queue-receiver and scheduler to regularily start tasks
    // -----------------------------------------------------------------------
    DataServiceFactory.getInstance();
    new EventListener().reveice();
    new RollbackHandler().run();
    new Scheduler().run();
  }
}
