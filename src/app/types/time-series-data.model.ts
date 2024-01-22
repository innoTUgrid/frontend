import { Moment } from 'moment';
import { BehaviorSubject } from 'rxjs';
import { DatasetKey, EndpointKey } from './kpi.model';

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
  timeIntervals: TimeInterval[],
}

export class TimeSeriesDataDictionary extends Map<string, BehaviorSubject<Dataset>> {
  constructor(iterable?: Iterable<[string, BehaviorSubject<Dataset>]>) {
    super(iterable);
  }
}

export type DatasetRegistry = {
  id: string, // this is the id of the component that registered the dataset
  endpointKey: DatasetKey,
}

export enum DataEvents {
  BeforeUpdate = 'beforeUpdate',
}

export interface EndpointUpdateEvent {
  endpointKey: EndpointKey,
  timeIntervals: TimeInterval[],
}

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

export type MetaInfo = {
  id: number,
  identifier: string,
  unit: string,
  carrier: string,
  min_timestamp: string,
  max_timestamp: string
}

export type MetaValues = {
  values: MetaInfo[],
}

export type TSRawResult = {
  datapoints: {
    bucket: string,
    mean_value: number,
  }[]

  meta: {
    id: number,
    identifier: string,
    unit: string,
    carrier?: string,
    consumption?: boolean,
    aggregate?: boolean,
    local?: boolean,
  }
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
  step: number; // this property is only for highcharts used. It is not used for the API calls
  stepUnit: TimeUnit;
};
