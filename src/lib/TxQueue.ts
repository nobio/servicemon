/* eslint no-cond-assign: "off" */

import EventEmitter from 'events';
import moment from 'moment';
import { Queue } from 'queue-typescript';
import { v4 as uuid } from 'uuid';
import { Output } from './model/Output';
import { RollbackHandler } from './RollbackHandler';
import { Log } from './api/Log';


export class TxQueue extends EventEmitter.EventEmitter {

  private queue: Queue<Output> = new Queue<Output>();
  private txMap: Map<string, Output> = new Map<string, Output>();
  private static instance: TxQueue;

  private constructor() {
    super();
    Log.silly(`ìnit txQueue`)
  }

  /**
   * implementation of a singleton pattern: fetch an instance by this method
   */
  public static getInstance(): TxQueue {
    if (!TxQueue.instance) {
      TxQueue.instance = new TxQueue();
    }

    return TxQueue.instance;
  }

  public getQueue(): Queue<Output> {
    return this.queue;
  }

  public getTxMap(): Map<string, Output> {
    return this.txMap;
  }

  /**
   * fills the queue with an Output object
   * @param output an Output object to be put to the queue
   */
  public push(output: Output) {
    if (output) {
      this.queue.enqueue(output);
      Log.debug(`after push: queue ${this.queue.length}, tx-queue ${this.txMap.size}`)
      this.emit("push", output);
    }
  }

  /**
   * Read an Output object from the queue (FIFO)
   * @param useTx true: This object is put to the transactions map; now one has to call commit or rollback
   */
  public pop(useTx?: boolean): Output {
    if (!useTx) {
      Log.debug(`after pop: queue ${this.queue.length - 1}, tx-queue ${this.txMap.size}`)
      return this.queue.dequeue();
    } else {
      const txId = uuid();
      const queueItem = this.queue.dequeue();
      queueItem.txId = txId;

      this.txMap.set(txId, queueItem);

      Log.debug(`after pop: queue ${this.queue.length}, tx-queue ${this.txMap.size}`)
      return queueItem;
    }
  }

  /**
   * removes an Output object from the transaction list; by this the life cycle ends
   * @param txId transaction id
   */
  public commit(txId: string): boolean {
    const isCommitted = this.txMap.delete(txId);
    Log.debug(`after commit: queue ${this.queue.length}, tx-queue ${this.txMap.size}`)

    this.emit("commit", txId);

    return isCommitted
  }
  /**
   * committs all transactions
   */
  public commitAll(): void {
    let key: string | undefined;
    while (key = this.txMap.keys().next().value) {
      this.commit(key);
    }
    Log.debug(`after commit all: queue ${this.queue.length}, tx-queue ${this.txMap.size}`)
    this.emit("commit-all");
  }

  /**
   * rolls back the transaction i.e. moves this object from the transaction list back to the normal queue
   * @param txId transaction id
   */
  public rollback(txId: string): boolean {
    const outAny = this.txMap.get(txId);
    if (!outAny) return false;

    const out: Output = outAny;
    Log.debug(`after rollback: queue ${this.queue.length}, tx-queue ${this.txMap.size}`)

    if (out.tsExpire === -1) {
      out.tsExpire = moment().valueOf() + RollbackHandler.rollbackHandlerConfig.expire * 1000;  // value in seconds; needs to be multiplied by 1000
    }
    this.emit("rollback", out);
    return true;
  }

  public rollbackAll() {
    let txId: string | undefined;
    while (txId = this.txMap.keys().next().value) {
      this.rollback(txId);
    }
    Log.warn(`after rollback all: queue ${this.queue.length}, tx-queue ${this.txMap.size}`)
    this.emit("rollback-all");
  }

  /**
   * returns true if the queue still has items left; can be used to iterate
   */
  public hasItems(): boolean {
    return this.queue.length > 0;
  }

  /**
   * returns the number if items in the queue
   */
  public length(): number {
    return this.queue.length;
  }
}