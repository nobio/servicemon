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
