export type MetaData = {
  unit: string;
  consumption: boolean;
  type: string;
}
export type TimeSeriesDataPoint = {time:Date, value:number, meta:MetaData};
export type TimeSeriesDataDictionary = Map<string, TimeSeriesDataPoint[]>;

export type TimeUnit = 'miliseconds' | 'seconds' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type TimeInterval = {
  start: Date;
  end: Date;
  step: number;
  stepUnit: TimeUnit;
};
