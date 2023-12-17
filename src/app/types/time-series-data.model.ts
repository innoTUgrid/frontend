import { Moment } from 'moment';

// integrate a property that describes for what time range a single data point is representative
export type TimeSeriesDataPoint = {
  time:Date, 
  value:number, 
  timeRange?: TimeInterval,
};
export type TimeSeriesData = {
  name:string, 
  type:string, 
  data:TimeSeriesDataPoint[]
  unit?: string,
  consumption?: boolean,
  local?: boolean,
};

export class TimeSeriesDataDictionary extends Map<string, TimeSeriesData[]> {
  constructor(iterable?: Iterable<[string, TimeSeriesData[]]>) {
    super(iterable);
  }
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

export type TimeUnit = 'miliseconds' | 'seconds' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type TimeInterval = {
  start: Moment;
  end: Moment;
  step: number;
  stepUnit: TimeUnit;
};
