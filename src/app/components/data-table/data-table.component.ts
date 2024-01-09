import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DataService } from '@app/services/data.service';
import { DatasetKey } from '@app/types/kpi.model';
import { TimeSeriesData, TimeSeriesDataPoint } from '@app/types/time-series-data.model';
import { MtxGridColumn } from '@ng-matero/extensions/grid';

class DataTableSeries implements TimeSeriesData {
  name: string
  type: string
  data: TimeSeriesDataPoint[]
  unit?: string | undefined
  consumption?: boolean | undefined
  local?: boolean | undefined

  pageIndex: number = 0
  pageSize: number = 10
  pageSizeOptions: number[] = [5, 10, 25]
  expanded: boolean = false

  updateExpansion(value: boolean) {
    this.expanded = value
    if (value) {
      this.updateDataFiltered()
    }
  }

  dataFiltered: TimeSeriesDataPoint[] = []
  
  constructor(data: TimeSeriesData) {
    this.name = data.name
    this.type = data.type
    this.data = data.data
    this.unit = data.unit
    this.consumption = data.consumption
    this.local = data.local
  }

  nextPage(e: PageEvent) {
    this.pageIndex = e.pageIndex
    this.pageSize = e.pageSize
  }
  
  updateDataFiltered() {
    this.dataFiltered = this.data.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize)
  }

}

type MtxExpansionEvent = { column: MtxGridColumn ; data: DataTableSeries; index: number; expanded: boolean }

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  dataService: DataService = inject(DataService);

  @Input() kpiName?: DatasetKey;
  @Input() title?: string;

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

  onExpansionChange(e: MtxExpansionEvent) {
    e.data.updateExpansion(e.expanded)
  }

  updateData() {
    const newData = (this.kpiName) ? this.dataService.timeSeriesData.getValue().get(this.kpiName) : undefined

    if (newData) {
      this.data = newData.map((data) => new DataTableSeries(data))
    }
    else {
      this.data = []
    }

  }

  subsciptions: any[] = []
  ngOnInit() {
    this.dataService.timeSeriesData.subscribe(() => {
      this.updateData()
    })
  }

  ngOnDestroy() {
    this.subsciptions.forEach((sub) => sub.unsubscribe())
  }

}