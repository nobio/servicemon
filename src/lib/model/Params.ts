export enum TIME_UNIT {
  MONTHS = 'months',
  DAYS = 'days',
  HOURS = 'hours',
  MINUTES = 'minutes',
  SECONDS = 'seconds',
}
export interface TimeseriesParams {
  configId: string;
  timeUnit: TIME_UNIT;
  tsStart: string;
  countTimeUnits: number;
}
export class TimeUnitConverter {
  public static convertString2TimeUnit(val: string): TIME_UNIT {
    if(val === TIME_UNIT.MONTHS) {
      return TIME_UNIT.MONTHS;
    } else if(val === TIME_UNIT.DAYS) {
      return TIME_UNIT.DAYS;
    } else if(val === TIME_UNIT.HOURS) {
      return TIME_UNIT.HOURS;
    } else if(val === TIME_UNIT.MINUTES) {
      return TIME_UNIT.MINUTES;
    } else if(val === TIME_UNIT.SECONDS) {
      return TIME_UNIT.SECONDS;
    } else {
      return TIME_UNIT.MONTHS;
    }
  }
}
