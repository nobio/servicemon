/* eslint no-cond-assign: "off" */

import { Util } from "./api/Util";
import { Output } from "./model/Output";
import { TxQueue } from "./TxQueue";
import { Log } from "./api/Log";

export interface RollbackHandlerConfig {
  latency: number;
  expire: number;
}

export class RollbackHandler {

  public static rollbackHandlerConfig: RollbackHandlerConfig;
  private queueHandler = TxQueue.getInstance();
  private txMap: Map<string, Output> = this.queueHandler.getTxMap();

  constructor() {
    try {
      RollbackHandler.rollbackHandlerConfig = Util.loadConfig().rollbackhandling;
    } catch (e) {
      Log.error(e);
      process.exit(-1);
    }
    Log.silly(`ìnit RollbackHandler with latency ${RollbackHandler.rollbackHandlerConfig.latency} sec.`);
  }

  /**
   * initializes the timer
   */
  public run() {

    setInterval(() => {

      this.checkRolledBackEvents();

    }, (RollbackHandler.rollbackHandlerConfig.latency * 1000));

  }

  private checkRolledBackEvents(): void {
    let txId: string | undefined;
    let outAny: Output | undefined;
    const eventList: Array<Output> = new Array<Output>();

    Log.debug('***************** ROLLBACK HANDLER ***********************')

    while (txId = this.txMap.keys().next().value) {
      outAny = this.txMap.get(txId);
      this.txMap.delete(txId)
      const out: Output | undefined = outAny;

      if (out && out.hasExpired()) {  // event has expired -> dead letter file
        Log.info(`È X P I R E D !!!\n ${txId}`);
      } else {                    // not yet expired -> put it back to normal queue
        Log.info(`${txId} has not expired yet. Back to queue`);
        if (out) eventList.push(out);
      }

    }

    // push all collected items back to queue
    eventList.forEach(elem => {
      this.queueHandler.push(elem);
    });

  }

}