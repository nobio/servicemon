import { Output } from "./model/Output";
import { PersistenceTarget } from "./persistence/PersistenceTarget";
import { PersistenceTargetFactory } from './persistence/PersistenceTargetFactory';
import { TxQueue } from "./TxQueue";
import { Log } from "./api/Log";

/**
 * Receiver class that listens to the queue-handlers 'push' event
 */
export class EventListener {

  private queueHandler = TxQueue.getInstance();
  private persistenceTarget: PersistenceTarget;

  constructor() {
    this.persistenceTarget = PersistenceTargetFactory.getInstance().getPersistenceTarget();
  }

  /**
   * this method is called once
   */
  reveice() {
    Log.debug('init EventListener');

    // this callback code runs every time, an event has been emitted
    this.queueHandler.on('push', output => {

      //Log.info(`here it comes: ${output.txId}`)
      while (this.queueHandler.hasItems()) {

        const out: Output = this.queueHandler.pop(true);
        this.persistenceTarget.persist(out)
          .then(success => {
            if (success) {
              this.queueHandler.commit(out.txId);
            } else {
              this.queueHandler.rollback(out.txId);
            }
          })
          .catch(fail => this.queueHandler.rollback(out.txId))
      }

    });

    // event handler for commit
    this.queueHandler.on('commit', txId => {
      Log.debug(`commit ${txId}`);
    });
    // event handler for commit-all
    this.queueHandler.on('commit-all', out => {
      Log.debug(`commit-all`);
    });

    // event handler for rollback
    this.queueHandler.on('rollback', out => {
      Log.info(`rollback ${out['txId']}`);
    });

    // event handler for rollback-all
    this.queueHandler.on('rollback-all', out => {
      Log.info(`rollback-all`)
    });
  }
}