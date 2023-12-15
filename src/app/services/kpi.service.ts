import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
// import json
import * as testData from './data/readKPIs.json';
import { HttpClient } from '@angular/common/http';
import { TimeSeriesDataPoint, TimeSeriesDataDictionary, TimeInterval, TimeSeriesData, KPIResult } from '../types/time-series-data.model';
import { HighchartsDiagram, KPI as KPI, SingleValueDiagram } from '../types/kpi.model';

import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})

export class KpiService {

  // time series data dictionary which contains all the data for all kpis
  timeSeriesData:TimeSeriesDataDictionary = new TimeSeriesDataDictionary();
  timeSeriesData$$:BehaviorSubject<TimeSeriesDataDictionary> = new BehaviorSubject<TimeSeriesDataDictionary>(new TimeSeriesDataDictionary());

  timeInterval:TimeInterval = {start:new Date("2019-01-01T00:00:00.000Z"), end:new Date("2019-01-01T02:00:00.000Z"), step:1, stepUnit:"hour"};
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

  constructor(private http: HttpClient) {
    this.timeSeriesData$$.subscribe((data: TimeSeriesDataDictionary) => { 
      for (const [key, value] of data) {
        this.timeSeriesData.set(key, value)
      }
    })

    // read the object from the data/readKPIs.json file and load it into the time series data dictionary
    this.loadTimeSeriesData();
  }

  async fetchKPIData(kpi: string) {
    this.http.get<KPIResult>(`${environment.apiUrl}/v1/kpi/${kpi}/`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      params: {
        start: this.timeInterval.start.toISOString(),
        end: this.timeInterval.end.toISOString(),
      }
    })
    .subscribe((kpiValue) => {
      console.log(kpiValue)
      const newData = new TimeSeriesDataDictionary([
        [kpi, [
          {type:kpi, name:kpiValue.name, data:[
            {
              time:new Date(), value:kpiValue.value, meta:{unit:kpiValue.unit, consumption:true}
            }
          ]}
        ]]
      ]);

      this.timeSeriesData$$.next(newData);
    });
  }


  updateTimeInterval(timeInterval: TimeInterval): void {
    // only update valid values
    const newTimeInterval = {
      start: (timeInterval.start && !isNaN(timeInterval.start.getTime())) ? timeInterval.start : this.timeInterval.start,
      end: (timeInterval.end && !isNaN(timeInterval.end.getTime())) ? timeInterval.end : this.timeInterval.end,
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
        case 'wind-offshore':
            return this.windOffshoreColor;
        case 'hydro-power':
            return this.hydroPowerColor;
        case 'wind-onshore':
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
        case 'pump-storage':
            return this.pumpStorageColor;
        default:
            return '';
    }
  }


  subscribeSeries(diagram: HighchartsDiagram, kpiName: KPI) {
    this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const energy = data.get(kpiName)
      if (!energy) {
        return
      }

      const highchartsSeries: Array<Highcharts.SeriesOptionsType> = []
      for (const series of energy) {
        highchartsSeries.push({
          name: this.splitDiagramTypeIfNeeded(series.type),
          id: series.type, 
          data:series.data.map(entry => ([entry.time.getTime(), entry.value])),
          type: diagram.seriesType,
          color: this.defineColors(series.type),
          marker:{
            lineColor: this.defineColors(series.type),
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
    });

    this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      if (diagram.chart && diagram.chart.axes && diagram.chart.xAxis) {
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.chart.axes[0].setDataGrouping(diagram.dataGrouping, false)
        diagram.chart.xAxis[0].setExtremes(timeInterval.start.getTime(), timeInterval.end.getTime(), true, true);
      } else { // this is only reachable for code that uses highcharts-angular
        diagram.xAxis.min = timeInterval.start.getTime();
        diagram.xAxis.max = timeInterval.end.getTime();
        diagram.dataGrouping.units = [[timeInterval.stepUnit, [timeInterval.step]]]
        diagram.updateFlag = true
      }
    });
  }

  splitDiagramTypeIfNeeded(type: string): string {
    if (type.includes('-')) {
      return type.split('-').join(' ');
    } else {
      return type;
    }
  }

  updateSingleValue(data: TimeSeriesDataPoint[], diagram:SingleValueDiagram, average: boolean = true) {
    let sum = 0
      for (const datapoint of data) {
          sum += datapoint.value
      }
      if (average && data.length > 0) sum /= data.length
      diagram.value = sum
  }

  subscribeSingleValueDiagram(diagram: SingleValueDiagram, kpiName: KPI, average: boolean = true) {
    this.timeSeriesData$$.subscribe((data:TimeSeriesDataDictionary) => {
      const kpiData = data.get(kpiName)
      if (!kpiData) {
        return
      }

      if (kpiData.length > 1) console.error(`SingleValueDiagram can only display one series, but got ${kpiData.length} at ${kpiName}`)
      const series = kpiData.map(entry => entry.data).flat()

      this.updateSingleValue(series, diagram, average)
    });

    this.timeInterval$$.subscribe((timeInterval: TimeInterval) => {
      this.fetchKPIData(kpiName)

      // const kpiData = this.timeSeriesData.get(kpiName)
      // if (!kpiData) {
      //   return
      // }

      // if (kpiData.length > 1) console.error(`SingleValueDiagram can only display one series, but got ${kpiData.length} at ${kpiName}`)
      // const series = kpiData.map(entry => entry.data).flat()

      // // filter out data that is not in the time interval
      // const filteredSeries = series.filter(entry => entry.time >= timeInterval.start && entry.time <= timeInterval.end)
      // this.updateSingleValue(filteredSeries, diagram, average)
    })
  }

  loadTimeSeriesData():void {
    const keys: Array<KPI> = [KPI.ENERGY_CONSUMPTION, KPI.AUTARKY]
    for (const key of keys) {
      const value = testData[key];
      const energyTypes = new Set(value.map(entry => entry.meta.type))
      const series: TimeSeriesData[] = []
      for (const type of energyTypes) {
        const typeData: TimeSeriesData = {
          name:type,
          type: type,
          data: value.filter(entry => entry.meta.type === type).map(entry => ({time: new Date(entry.time), value: entry.value, meta: entry.meta }))
        }
        series.push(typeData)
      }
      this.timeSeriesData.set(key, series);
    }
    this.timeSeriesData$$.next(this.timeSeriesData);
  }

}
