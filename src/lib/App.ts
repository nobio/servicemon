import cors from "cors";
import express from 'express';
import http from 'http';
import morgan from "morgan";
import { Util } from "./api/Util";
import { EventListener } from "./EventListener";
import { RollbackHandler } from "./RollbackHandler";
import { Scheduler } from "./Scheduler";
import { DataServiceFactory } from "./service/DataServiceFactory";
import { Log } from "./api/Log";

const app = express();

export class App {
  private util = new Util();

  constructor() {
    app.set('host', process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
    app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || '28090');


    // ---------------- MIDDLEWARE -------------------------------------------
    app.use(cors());
    app.use(express.json());
    app.use('/', express.static(__dirname + '/web/'));
    app.use(morgan('[:date[web]] (:remote-addr, :response-time ms) :method :url - status: :status'));

    // ------------------ API ------------------------------------------------
    // restful services for entries using Promises
    // -----------------------------------------------------------------------
    app.get('/', this.util.handleRoot);
    app.post('/api/httpstatus', this.util.receiveHttpStatus);
    app.get('/api/hosts', this.util.getWatchedHostsWithLastStatus);
    app.get('/api/queue/:configId/status', this.util.getLastStatus);
    app.get('/api/queue/:configId/timeseries/:timeUnit', this.util.getTimeSeries);
    // ------------------ SERVER ---------------------------------------------
    // start the web service with http
    // -----------------------------------------------------------------------
    http.createServer(app).listen(app.get('port'), app.get('host'), () => {
      Log.info(`Service Monitor started`)
      Log.info(`Server listening on http://${app.get('host')}:${app.get('port')}/`);
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
