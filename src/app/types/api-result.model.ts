
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

  export type EmissionFactorsResult = {
    id: number,
    carrier: string,
    factor: number,
    unit: string,
    source: string,
    source_url: string,
  }