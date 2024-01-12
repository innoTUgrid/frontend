import { Moment } from 'moment';
import { BehaviorSubject } from 'rxjs';
import { DatasetKey } from './kpi.model';

// integrate a property that describes for what time range a single data point is representative
export type Series = {
  id:string,
  name:string, 
  type:string, 
  data:number[][]
  unit?: string,
  consumption?: boolean,
  local?: boolean,
  xAxis?: number,
  color?: string,
  pointPlacement?: number,
};

export type Dataset = {
  series: BehaviorSubject<Series[]>,
  timeRange?: TimeInterval[],
}

export class TimeSeriesDataDictionary extends Map<string, Dataset> {
  constructor(iterable?: Iterable<[string, Dataset]>) {
    super(iterable);
  }
}

// this type should be a type that has information about a dataset that is registered by a component such that the data service keeps it up to date 
export type CustomIntervalRegistry = {
  key: string, // this is the key that is used to access the data in the data service
  fixedTimeIntervals: TimeInterval[], // when this is given, then the data service will update the data for this dataset at the given interval
}

export type DatasetRegistry = {
  id: string, // this is the id of the component that registered the dataset
  endpointKey: DatasetKey,

  // when a registry has a customInterval, then it is not updated by the data service
  customInterval?: CustomIntervalRegistry

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
