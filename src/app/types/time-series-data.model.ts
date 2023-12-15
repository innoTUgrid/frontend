export type MetaData = {
  unit?: string;
  consumption?: boolean;
}
// integrate a property that describes for what time range a single data point is representative
export type TimeSeriesDataPoint = {time:Date, value:number, meta?:MetaData, timeRange?: TimeInterval};
export type TimeSeriesData = {name:string, type:string, data:TimeSeriesDataPoint[]};

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

export type TimeUnit = 'miliseconds' | 'seconds' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type TimeInterval = {
  start: Date;
  end: Date;
  step: number;
  stepUnit: TimeUnit;
};
