import { Output } from "../model/Output";
import { TIME_UNIT } from "../model/Params";

export interface PersistenceTarget {
  persist(out: Output): Promise<boolean>;
  deleteRecords(hours: number, timeUnit: TIME_UNIT): Promise<number>;
}
