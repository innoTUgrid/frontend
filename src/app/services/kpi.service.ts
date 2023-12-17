import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
// import json
import * as testData from './data/readKPIs.json';
import { HttpClient } from '@angular/common/http';
import { TimeSeriesDataPoint, TimeSeriesDataDictionary, TimeInterval, TimeSeriesData, KPIResult, TimeSeriesResult } from '../types/time-series-data.model';
import { HighchartsDiagram, KPI as KPI, SingleValueDiagram } from '../types/kpi.model';
import moment from 'moment';

import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})

export class KpiService {

  // time series data dictionary which contains all the data for all kpis
  timeSeriesData:TimeSeriesDataDictionary = new TimeSeriesDataDictionary();
  timeSeriesData$$:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(new TimeSeriesDataDictionary());

  timeInterval:TimeInterval = {start: moment("2019-01-01T00:00:00.000Z"), end: moment("2019-02-01T02:00:00.000Z"), step:1, stepUnit:"day"};
  timeInterval$$:BehaviorSubject<TimeInterval> = new BehaviorSubject<TimeInterval>(this.timeInterval);

  biogasColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-0').trim();
  biomassColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-1').trim();
  otherRenewablesColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-2').trim();
  windOffshoreColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-3').trim();
  hydroPowerColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-4').trim();
  windOnshoreColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-5').trim();
  solarColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-6').trim();
  brownCoalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-7').trim();
  naturalGasColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-8').trim();
  otherConventionalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-9').trim();
  hardCoalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-10').trim();
  pumpStorageColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-11').trim();

  energyTypesToName = new Map([
    ['biogas', 'Biogas'],
    ['biomass', 'Biomass'],
    ['other-renewables', 'Other Renewables'],
    ['offwind', 'Offshore Wind'],
    ['hydro', 'Hydro Power'],
    ['onwind', 'Onshore Wind'],
    ['solar', 'Solar'],
    ['brown-coal', 'Brown Coal'],
    ['natural-gas', 'Natural Gas'],
    ['other-conventionals', 'Other Conventionals'],
    ['hard-coal', 'Hard Coal'],
    ['pump-storage', 'Pump Storage'],
    ['coal', 'Coal'],
    ['gas', 'Gas'],
  ])

  constructor(private http: HttpClient) {
    this.timeSeriesData$$.subscribe((data: TimeSeriesDataDictionary) => { 
      for (const [key, value] of data) {
        this.timeSeriesData.set(key, value)
      }
    })

    this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      this.timeInterval = timeInterval
    })

    // read the object from the data/readKPIs.json file and load it into the time series data dictionary
    // this.loadTimeSeriesData();
  }

  async fetchKPIData(kpi: string, timeInterval: TimeInterval) {
    const url = `${environment.apiUrl}/v1/kpi/${kpi}/`;
    this.http.get<KPIResult>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
      }
    })
    .subscribe((kpiValue) => {
      const newData = new TimeSeriesDataDictionary([
        [kpi, [
          {type:kpi, name:kpiValue.name, data:[
            {
              time:new Date(), 
              value:kpiValue.value, 
              timeRange: {start: moment(kpiValue.from_timestamp), end: moment(kpiValue.to_timestamp), step:timeInterval.step, stepUnit:timeInterval.stepUnit}
            }
          ],
          unit:kpiValue.unit? kpiValue.unit : undefined, 
          consumption:true,
        },
        ]]
      ]);

      this.timeSeriesData$$.next(newData);
    });
  }

  async fetchTimeSeriesData(key: string, timeInterval: TimeInterval) {
    const url = `${environment.apiUrl}/v1/kpi/${key}/`;
    this.http.get<TimeSeriesResult[]>(url, {
      params: {
        from: timeInterval.start.toISOString(),
        to: timeInterval.end.toISOString(),
        interval: '1hour'
      }
    })
    .subscribe((timeSeriesResult: TimeSeriesResult[]) => {
      const newData = new TimeSeriesDataDictionary();
      const series: Map<string, TimeSeriesData> = new Map();

      for (const entry of timeSeriesResult) {
        let data: TimeSeriesDataPoint[];
        const carrierName = entry.carrier_name
        const seriesKey = carrierName + (entry.local ? '' : ' (external)')
        if (!series.has(seriesKey)) {
          data = []
          let name = this.energyTypesToName.get(carrierName)
          if (!name) name = carrierName
          series.set(seriesKey, {
            name: name,
            type: carrierName,
            data: data,
            unit: entry.unit,
            consumption: (key === 'consumption') ? true : false,
            local: entry.local,
          })
        } else {
          data = series.get(seriesKey)?.data as TimeSeriesDataPoint[];
        }

        data.push({
          time: new Date(entry.bucket),
          value: entry.value,
        })
      }

      newData.set(key, Array.from(series.values()))
      this.timeSeriesData$$.next(newData);
    });
  }


  updateTimeInterval(timeInterval: Partial<TimeInterval>): void {
    // only update valid values
    const newTimeInterval = {
      start: (timeInterval.start?.isValid()) ? timeInterval.start : this.timeInterval.start,
      end: (timeInterval.end?.isValid()) ? timeInterval.end : this.timeInterval.end,
      step: (timeInterval.step) ? timeInterval.step : this.timeInterval.step,
      stepUnit: (timeInterval.stepUnit) ? timeInterval.stepUnit : this.timeInterval.stepUnit,
    }

    if (newTimeInterval != this.timeInterval) {
      this.timeInterval = newTimeInterval
      this.timeInterval$$.next(newTimeInterval)
    }
  }

  defineColors(type: string): string {
    switch (type) {
        case 'biogas':
            return this.biogasColor;
        case 'biomass':
            return this.biomassColor;
        case 'other-renewables':
            return this.otherRenewablesColor;
        case 'offwind':
            return this.windOffshoreColor;
        case 'hydro':
            return this.hydroPowerColor;
        case 'onwind':
            return this.windOnshoreColor;
        case 'solar':
            return this.solarColor;
        case 'brown-coal':
            return this.brownCoalColor;
        case 'natural-gas':
            return this.naturalGasColor;
        case 'other-conventionals':
            return this.otherConventionalColor;
        case 'hard-coal':
            return this.hardCoalColor;
        case 'coal':
            return this.brownCoalColor;
        case 'pump-storage':
            return this.pumpStorageColor;
        case 'external':
            return this.otherConventionalColor;
        default:
            return '';
    }
  }


  subscribeSeries(diagram: HighchartsDiagram, aggregateExternal: boolean = false) {
    const s1 = this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      let energy = diagram.kpiName? data.get(diagram.kpiName) : undefined
      if (!energy) {
        return
      }

      if (aggregateExternal) {
        const data = energy.filter(entry => !entry.local).map(entry => entry.data).flat()
        console.log(data)
        energy = [{
          name: 'Imported Energy',
          type: 'external',
          data: data,
        }, ...energy.filter(entry => entry.local)]
      }

      const highchartsSeries: Array<Highcharts.SeriesOptionsType> = []
      for (const series of energy) {
        const color = this.defineColors(series.type)

        const data = series.data.map(entry => ([entry.time.getTime(), entry.value]))
        data.sort((a, b) => a[0] - b[0])
        highchartsSeries.push({
          name: series.name,
          id: series.type, 
          data:data,
          type: diagram.seriesType,
          color: color,
          marker:{
            lineColor: color,
          },
        })
      }
      if (diagram.chart) {
        diagram.chart.update({
          series: highchartsSeries
        }, true, true, true)
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.chartProperties.series = highchartsSeries
        diagram.updateFlag = true
      }
      if (diagram.onSeriesUpdate) {
        diagram.onSeriesUpdate()
      }
    });

    const s2 = this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      if (diagram.kpiName) {
        this.fetchTimeSeriesData(diagram.kpiName, timeInterval)
      }

      const minuteFormat = '%H:%M'
      const dayFormat = '%e. %b'
      diagram.xAxis.dateTimeLabelFormats = {
        minute: minuteFormat,
        day: timeInterval.stepUnit === 'day' ? dayFormat : minuteFormat,
      }
      diagram.updateFlag = true

      if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.chart.axes[0].setDataGrouping(diagram.dataGrouping, false)
        diagram.chart.xAxis[0].setExtremes(timeInterval.start.toDate().getTime(), timeInterval.end.toDate().getTime(), true, true);
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.xAxis.min = timeInterval.start.toDate().getTime();
        diagram.xAxis.max = timeInterval.end.toDate().getTime();
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.updateFlag = true
      }
    });

    return [s1, s2]
  }

  updateSingleValue(data: TimeSeriesDataPoint[], diagram:SingleValueDiagram, average: boolean = true) {
    let sum = 0
      for (const datapoint of data) {
          sum += datapoint.value
      }
      if (average && data.length > 0) sum /= data.length
      diagram.value = sum
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, average: boolean = true) {
    const s1 = this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const kpiData = (diagram.kpiName) ? data.get(diagram.kpiName) : undefined
      if (!kpiData) {
        return
      }

      if (kpiData.length > 1) console.error(`SingleValueDiagram can only display one series, but got ${kpiData.length} at ${diagram.kpiName}`)
      const series = kpiData.map(entry => entry.data).flat()

      this.updateSingleValue(series, diagram, average)
    });

    const s2 = this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      if (diagram.kpiName) this.fetchKPIData(diagram.kpiName, timeInterval)
    })

    return [s1, s2]
  }

  loadTimeSeriesData():void {
    const keys: Array<KPI> = [KPI.ENERGY_CONSUMPTION, KPI.AUTARKY]
    const data = testData as any
    for (const key of keys) {
      const value = data[key];
      const energyTypes: Set<string> = new Set(value.map((entry: any) => entry.meta.type))
      const series: TimeSeriesData[] = []
      for (const type of energyTypes) {
        const typeData: TimeSeriesData = {
          name: type,
          type: type,
          data: value.filter((entry: any) => entry.meta.type === type).map((entry: any) => ({time: new Date(entry.time), value: entry.value, meta: entry.meta }))
        }
        series.push(typeData)
      }
      this.timeSeriesData.set(key, series);
    }
    this.timeSeriesData$$.next(this.timeSeriesData);
  }

}
