import {Component,ViewChild, ElementRef, Input, inject} from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { DatasetKey, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { DatasetRegistry, TimeInterval } from '@app/types/time-series-data.model';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { Subscription, combineLatest } from 'rxjs';
import {saveAs} from "file-saver";
import { ThemeService } from '@app/services/theme.service';
import { sumAllDataTypes } from '@app/services/data-utils';

enum DataTypes {
  BIOGAS = 'biogas',
}

export interface Element {
  gri_modul: string;
  description: string;
  unit: string;
  year_first: string;
  year_second: string;
  data_loader?: (interval:TimeInterval) => string;
  unit_loader?: () => string;
}

@Component({
  selector: 'gri-table',
  styleUrls: ['./gri-table.component.scss'],
  templateUrl: 'gri-table.component.html',
})

export class TableBasicExample {
  @ViewChild('TABLE') table!: ElementRef;
  dataService: DataService = inject(DataService);
  chartService: ChartService = inject(ChartService);
  themeService: ThemeService = inject(ThemeService);

  @Input() csvDelimitier: string = ';';

  @Input() title: string = '';

  id = "GRI." + Math.random().toString(36).substring(7);

  registries: DatasetRegistry[] = [
    {id:this.id, endpointKey: TimeSeriesEndpointKey.ENERGY_CONSUMPTION},
    {id:this.id, endpointKey: TimeSeriesEndpointKey.SCOPE_2_EMISSIONS},
  ]

  subscriptions: Subscription[] = [];

  ngOnInit() {
    this.registries.forEach((registry) => {
      this.dataService.registerDataset(registry)
    })

    const s = combineLatest([this.dataService.timeInterval.getValue(), ...this.registries.map((registry) => this.dataService.getDataset(registry.endpointKey))])
    .subscribe((datasets) => {
      const timeIntervals = this.dataService.timeInterval.getValue()
      this.updateData(timeIntervals)
    })
    this.subscriptions.push(s)
  }

  ngOnDestroy() {
    this.registries.forEach((registry) => {
      this.dataService.unregisterDataset(registry)
    })

    this.subscriptions.forEach((subscription) => {subscription.unsubscribe()})
  }

  export() {
    // setting header
    const csvArray = [this.columns.map((element) => {
      return `"${element.header}"`
    })]

    // loading data
    csvArray.push(...this.list.map((element) => {
      return [`"${element.gri_modul}"`, `"${element.description}"`, `"${element.unit}"`, `"${element.year_first}"`, `"${element.year_second}"`]
    }))

    const csvString = csvArray.map((row) => row.join(this.csvDelimitier)).join('\r\n')
    var blob = new Blob([csvString], {type: 'text/csv' })
    saveAs(blob, "GRI_Report.csv");
  }


  columns: MtxGridColumn[] = [
    { header: 'GRI Modul', field: 'gri_modul', width: '30%' },
    { header: 'Description', field: 'description', width: '40%' },
    { header: 'Unit', field: 'unit', width: '10%' },
    { header: '2023', field: 'year_first', width: '10%' },
    { header: '2022', field: 'year_second', width: '10%' },
  ]

  
  updateData(timeIntervals: TimeInterval[]) {
    if (timeIntervals.length < 2) {
      console.error("GRI table needs two time intervals, but got only " + timeIntervals.length + ".")
      return;
    }
    this.columns[3].header = timeIntervals[0].start.format('YYYY')
    this.columns[4].header = timeIntervals[1].start.format('YYYY')
    this.columns = [...this.columns]
    
    for (const element of this.list) {
      if (element.data_loader) {
        element.year_first = element.data_loader(timeIntervals[0])
        element.year_second = element.data_loader(timeIntervals[1])
      }
      if (element.unit_loader) {
        element.unit = element.unit_loader()
      }
    }
    this.list = [...this.list]
  }

  calculateTotal(datasetKey: DatasetKey, types?: string[]): (interval: TimeInterval) => string {
    return (timeInterval: TimeInterval) => {
      const dataset = this.dataService.getDataset(datasetKey).getValue()
      const series = dataset.series.filter((s) => types ? types.includes(s.type) : true)
      const dataSummed = sumAllDataTypes(series, timeInterval)
      const total = this.chartService.calculateSingleValue(dataSummed, false)
      return ChartService.addThousandsSeparator(total?.toFixed(2).replace('.', ',')) ?? '-'
    }
  }

  unitLoader(datasetKey: DatasetKey): () => string {
    return () => {
      const dataset = this.dataService.getDataset(datasetKey).getValue()
      let unit = '-'
      if (dataset.series.length > 0) {
        const series = dataset.series[0]
        if (series && series.unit) {
          const newName = this.themeService.unitToName.get(series.unit)
          if (newName) {
            unit = newName
          }
        }
      }
      return unit
    }
  }

  list: Element[] = [

    // GRI 302-1
    {gri_modul: "GRI 302-1 Energy consumption within the organization", description: "a. Total fuel consumption within the organization from non-renewable sources including fuel types used", unit: "-", year_first:"-", year_second:"-"}, // no data for this
    {gri_modul: "", description: "b. Total fuel consumption within the organization from renewable sources including fuel types used", unit:"-", year_first:"-", year_second:"-", data_loader: this.calculateTotal(TimeSeriesEndpointKey.ENERGY_CONSUMPTION, [DataTypes.BIOGAS]), unit_loader:this.unitLoader(TimeSeriesEndpointKey.ENERGY_CONSUMPTION)}, // Biogas kwh (consumption endpoint)
    {gri_modul: "", description: "c. i. Electricity consumption", unit:"-", year_first:"-", year_second:"-", data_loader: this.calculateTotal(TimeSeriesEndpointKey.ENERGY_CONSUMPTION), unit_loader:this.unitLoader(TimeSeriesEndpointKey.ENERGY_CONSUMPTION)}, // total consumption (consumption endpoint)
    {gri_modul: "", description: "c. ii. Heating consumption", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "c. iii. Cooling consumption", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "c. iv. Steam consumption", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. i. Electricity sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. ii. Heating sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. iii. Cooling sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. iv. Steam sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "e. Total energy consumption within the organization", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "f. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_first:"-", year_second:"-"}, // fulltext TODO
    {gri_modul: "", description: "g. Source of the conversion factors used", unit:"-", year_first:"-", year_second:"-"}, // leer

    // GRI 305-1
    {gri_modul: "GRI 305-1 Direct (Scope 1) GHG emissions", description: "a. Gross direct (Scope 1) GHG emissions", unit:"-", year_first:"-", year_second:"-"}, // total scope 1 emissions 
    {gri_modul: "", description: "b. Gases included in the calculation", unit:"-", year_first:"-", year_second:"-"}, // fixed value 
    {gri_modul: "", description: "c. Biogenic CO2 emissions ", unit:"-", year_first:"-", year_second:"-", data_loader:this.calculateTotal(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS, [DataTypes.BIOGAS]), unit_loader:this.unitLoader(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS)}, // emissions of biogas
    {gri_modul: "", description: "d. Base year for the calculation, if applicable", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "e. Source of the emission factors and the global warming potential (GWP) rates used, or a reference to the GWP source", unit:"-", year_first:"-", year_second:"-"}, // source of emission factors, not yet implemented
    {gri_modul: "", description: "f. Consolidation approach for emissions; whether equity share, financial control, or operational control", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "g. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_first:"-", year_second:"-"}, // fulltext TODO

    // GRI 305-2
    {gri_modul: "GRI 305-2 Energy indirect (Scope 2) GHG emissions", description: "a. Gross location-based energy indirect (Scope 2) GHG emissions", unit:"-", year_first:"-", year_second:"-", data_loader:this.calculateTotal(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS), unit_loader:this.unitLoader(TimeSeriesEndpointKey.SCOPE_2_EMISSIONS)}, // total scope 2 emissions
    {gri_modul: "", description: "b. If applicable, gross market-based energy indirect (Scope 2) GHG emissions", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "c. Gases included in the calculation", unit:"-", year_first:"-", year_second:"-"}, // fixed value co2
    {gri_modul: "", description: "d. Base year for the calculation, if applicable", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "e. Source of the emission factors and the global warming potential (GWP) rates used, or a reference to the GWP source", unit:"-", year_first:"-", year_second:"-"}, // source of emission factors, not yet implemented
    {gri_modul: "", description: "f. Consolidation approach for emissions; whether equity share, financial control, or operational control", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "g. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_first:"-", year_second:"-"}, // fulltext TODO

];
}


