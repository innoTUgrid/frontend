import { Moment } from 'moment';
import { BehaviorSubject } from 'rxjs';
import { DatasetKey } from './kpi.model';

// integrate a property that describes for what time range a single data point is representative
export type Series = {
  id:string,
  name:string, 
  type:string, 
  data:number[][]
  timeUnit: TimeUnit,
  unit?: string,
  consumption?: boolean,
  local?: boolean,
  xAxis?: number,
  color?: string,
  pointPlacement?: number,
};

export type APICallInfo = {
  timeIntervals: TimeInterval[],
  updatedSeries: Series[],
}

export type Dataset = {
  series: Series[],
  lastCall: APICallInfo,
}

export class TimeSeriesDataDictionary extends Map<string, BehaviorSubject<Dataset>> {
  constructor(iterable?: Iterable<[string, BehaviorSubject<Dataset>]>) {
    super(iterable);
  }
}

export type DatasetRegistry = {
  id: string, // this is the id of the component that registered the dataset
  endpointKey: DatasetKey,

  // events
  beforeUpdate?: () => void,
}

// export type TimeSeriesDataDictionary = Map<string, TimeSeriesData[]>;

export type KPIResult = {
  value:number;
  name:string;
  unit:string|null;
  from_timestamp:string;
  to_timestamp:string;
}

export type TimeSeriesResult = {
  bucket: string;
  carrier_name: string;
  local: boolean;
  value: number;
  unit: string;
}

export enum TimeUnit {
  MILLISECONDS = 'miliseconds',
  SECONDS = 'seconds',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}
export type TimeInterval = {
  start: Moment;
  end: Moment;
  step: number;
  stepUnit: TimeUnit;
};
