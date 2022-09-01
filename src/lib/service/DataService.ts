import mongoose from "mongoose";
import { Output } from "../model/Output";
import { TimeseriesParams, TIME_UNIT } from "../model/Params";

export interface DataService {
  saveHttpStatus(out: Output): Promise<boolean>;
  getLastEntry(configId: string): Promise<Output>;
  getTimeSeries(params: TimeseriesParams): Promise<Array<Output>>;
  getTimeSeriesStartEnd(configId: string, tsStart: string, tsEnd: string): Promise<Array<Output>>;
  deleteOldEntries(hours: number, timeUnit: TIME_UNIT): Promise<number>;
  shutdown(): void;
}

export interface IHttpStatusEvent extends mongoose.Document {
  txId?: string;
  configId?: string;
  configName?: string;
  status?: number;
  statusText?: string;
  uri?: string;
  method?: string;
  tsStart?: Date;
  tsEnd?: Date;
  tsExpire?: Date;
  duration?: number;
  source?: string;
}
