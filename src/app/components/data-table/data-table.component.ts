import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DataService } from '@app/services/data.service';
import { DatasetKey, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Dataset, DatasetRegistry, Series, TimeUnit } from '@app/types/time-series-data.model';
import { MtxGridColumn } from '@ng-matero/extensions/grid';

type TimeSeriesDataPoint = {
  timestamp: number,
  value: number,
}

class DataTableSeries implements Series {
  id:string
  name: string
  type: string
  data: number[][]
  timeUnit: TimeUnit;
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
  
  constructor(data: Series) {
    this.name = data.name
    this.type = data.type
    this.data = data.data
    this.unit = data.unit
    this.consumption = data.consumption
    this.local = data.local
    this.id = data.id
    this.timeUnit = data.timeUnit
  }

  nextPage(e: PageEvent) {
    this.pageIndex = e.pageIndex
    this.pageSize = e.pageSize
    this.updateDataFiltered()
  }
  
  updateDataFiltered() {
    this.dataFiltered = this.data.
    slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize).
    map((entry) => {
      return {
        timestamp: entry[0],
        value: entry[1],
      }
    })
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
  readonly id = "DataTableComponent." + Math.random().toString(36).substring(7);

  _kpiName?: DatasetKey;

  @Input()
  set kpiName(value: DatasetKey | undefined) {
    this._kpiName = value;
    if (value) {
      this.registry.endpointKey = value;
      this.dataService.registerDataset(this.registry)
    }
  }

  get kpiName(): DatasetKey | undefined {
    return this._kpiName;
  }

  registry: DatasetRegistry = {
    id:this.id,
    endpointKey: TimeSeriesEndpointKey.SCOPE_2_EMISSIONS,
  }

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

  updateData(newData: Series[]) {
    this.data = newData.map((data) => new DataTableSeries(data))
  }

  subsciptions: any[] = []
  ngOnInit() {
    if (this.kpiName) {
      this.dataService.getBehaviorSubject(this.kpiName).subscribe((data: Series[]) => {
        this.updateData(data)
      })
    }
  }

  ngOnDestroy() {
    this.subsciptions.forEach((sub) => sub.unsubscribe())
    this.dataService.unregisterDataset(this.registry)
  }

}