import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { ThemeService } from '@app/services/theme.service';
import { DatasetKey, TimeSeriesEndpointKey } from '@app/types/kpi.model';
import { Dataset, DatasetRegistry, Series, TimeInterval, TimeUnit } from '@app/types/time-series-data.model';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { MtxPopover } from '@ng-matero/extensions/popover';
import moment from 'moment';

type TimeSeriesDataPoint = {
  timestamp: number,
  value: number,
}

class DataTableSeries implements Series {
  id:string
  name: string
  type: string
  timeUnit: TimeUnit;
  sourceDataset: DatasetKey;
  unit?: string | undefined
  consumption?: boolean | undefined
  local?: boolean | undefined

  pageIndex: number = 0
  pageSize: number = 10
  pageSizeOptions: number[] = [5, 10, 25]
  expanded: boolean = false
  
  data: number[][]
  dataFiltered: number[][] // by time Interval
  dataPaginated: TimeSeriesDataPoint[] = [] // due to efficiency reasons

  updateExpansion(value: boolean) {
    this.expanded = value
    if (value) {
      this.updateDataPaginated()
    }
  }

  
  constructor(data: Series) {
    this.name = data.name
    this.type = data.type
    this.data = data.data
    this.unit = data.unit
    this.consumption = data.consumption
    this.local = data.local
    this.id = data.id
    this.timeUnit = data.timeUnit
    this.dataFiltered = data.data
    this.sourceDataset = data.sourceDataset
  }

  toCSVArray() {
    const seriesData: string[] = [
      this.name, this.type, (this.unit) ? this.unit : '', 
      (this.consumption) ? this.consumption.toString() : '', (this.local) ? this.local.toString() : '']

    return this.data.map((entry) => {
      return [...seriesData, moment(entry[0]).toISOString(), entry[1].toString()]
    })
  }

  get length() {
    return this.dataFiltered.length
  }

  nextPage(e: PageEvent) {
    this.pageIndex = e.pageIndex
    this.pageSize = e.pageSize
    this.updateDataPaginated()
  }

  filterDataOutsideInterval(timeInterval: TimeInterval) {
    this.dataFiltered = this.data.filter((entry) => {
      return entry[0] >= timeInterval.start.valueOf() && entry[0] <= timeInterval.end.valueOf()
    })
  }
  
  updateDataPaginated() {
    this.dataPaginated = this.dataFiltered.
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
  chartService: ChartService = inject(ChartService);
  themeService: ThemeService = inject(ThemeService);
  readonly id = "DataTableComponent." + Math.random().toString(36).substring(7);
  loading: boolean = false

  @Input({required: true}) popover?: MtxPopover;

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
      { header: 'Unit', field: 'unit', formatter: (data: DataTableSeries) => { 
        const unitName = this.themeService.unitToName.get(data.unit || '')
        return (unitName) ? unitName : data
      }
      },
      { header: 'Local', field: 'local', type: 'boolean'},
    ];

  subColumns: MtxGridColumn[] = [
      { header: 'Time', field: 'timestamp', type: 'date', formatter(data: TimeSeriesDataPoint) { return moment(data.timestamp).format('DD/MM/YYYY [at] hh:mm') }},
      { header: 'Value', field: 'value', type: 'number', formatter(data: TimeSeriesDataPoint) { return data.value.toFixed(2) }},
  ]

  data: DataTableSeries[] = []

  toCSVArray() {
    const columns = [...this.columns, ...this.subColumns]
    const csvArray = []

    // if header is typeof string
    const header: string[] = columns.map((column) => (column.header) ? column.header.toString() : '')
    csvArray.push(header)

    const data = this.data.map((series) => {
      return series.toCSVArray()
    }).flat()
    csvArray.push(...data)

    return csvArray
  }

  onExpansionChange(e: MtxExpansionEvent) {
    e.data.updateExpansion(e.expanded)
  }

  updateData(newData: Series[]) {
    this.data = newData.map((data) => {
      const newData = new DataTableSeries(data)
      newData.filterDataOutsideInterval(this.dataService.getCurrentTimeInterval())
      return newData
    })
  }

  subsciptions: any[] = []
  ngOnInit() {
    if (this.kpiName) {
      const s0 = this.dataService.getDataset(this.kpiName).subscribe((dataset: Dataset) => {
        this.updateData(this.chartService.filterOtherStepUnits(dataset.series))
      })
      const s1 = this.dataService.timeInterval.subscribe((timeInterval: TimeInterval[]) => {
        this.data.forEach((series) => {
          series.filterDataOutsideInterval(this.dataService.getCurrentTimeInterval())
          series.updateDataPaginated()
        })
      })

      const s2 = this.dataService.loadingDatasets.subscribe((loading) => {
        this.loading = this.dataService.isLoading(this.registry.endpointKey)
      })

      this.subsciptions.push(s0, s1, s2)
    }
  }

  ngOnDestroy() {
    this.subsciptions.forEach((sub) => sub.unsubscribe())
    this.subsciptions = []
    this.dataService.unregisterDataset(this.registry)
  }

}