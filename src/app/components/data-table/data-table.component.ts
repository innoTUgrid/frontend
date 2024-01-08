import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '@app/services/api.service';
import { DataService } from '@app/services/data.service';
import { KPI } from '@app/types/kpi.model';
import { TimeSeriesData, TimeSeriesDataPoint } from '@app/types/time-series-data.model';
import { MtxGridColumn } from '@ng-matero/extensions/grid';

class DataTableSeries implements TimeSeriesData {
  name: string
  type: string
  data: TimeSeriesDataPoint[]
  unit?: string | undefined
  consumption?: boolean | undefined
  local?: boolean | undefined
  expanded: boolean = false
  pageIndex: number = 0
  pageSize: number = 10
  pageSizeOptions: number[] = [5, 10, 25]
  dataFiltered: TimeSeriesDataPoint[] = []

  constructor(data: TimeSeriesData) {
    this.name = data.name
    this.type = data.type
    this.data = data.data
    this.unit = data.unit
    this.consumption = data.consumption
    this.local = data.local

    this.nextPage(this)
  }

  nextPage(e: PageEvent|DataTableSeries) {
    this.pageIndex = e.pageIndex
    this.pageSize = e.pageSize
    this.dataFiltered = this.data.slice(e.pageIndex * e.pageSize, (e.pageIndex + 1) * e.pageSize)
  }

}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  dataService: DataService = inject(DataService);
  apiService: ApiService = inject(ApiService);
  @Input() kpiName?: KPI = KPI.ENERGY_CONSUMPTION;

  columns: MtxGridColumn[] = [
      { header: 'Name', field: 'name', showExpand: true },
      { header: 'Type', field: 'type' },
      { header: 'Unit', field: 'unit' },
      { header: 'Consumption', field: 'consumption' },
      { header: 'Local', field: 'local' },
    ];

  subColumns: MtxGridColumn[] = [
      { header: 'Time', field: 'timestamp', type: 'date', formatter(data: TimeSeriesDataPoint) { return new Date(data.timestamp).toISOString() }},
      { header: 'Value', field: 'value' },
  ]

  data: DataTableSeries[] = []

  updateData() {
    const newData = (this.kpiName) ? this.dataService.timeSeriesData.get(this.kpiName) : undefined
    console.log(newData)

    if (newData) {
      this.data = newData.map((data) => new DataTableSeries(data))
    }
    else {
      this.data = []
    }

  }

  ngOnInit() {
    this.dataService.timeSeriesData$$.subscribe(() => {
      this.updateData()
    })

    if (this.kpiName) {
      this.apiService.fetchTimeSeriesData(this.kpiName, this.dataService.timeInterval)
    }
  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`,
  },
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`,
  },
];
