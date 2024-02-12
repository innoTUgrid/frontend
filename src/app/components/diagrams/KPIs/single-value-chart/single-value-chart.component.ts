
import { Component, Input, inject } from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { DatasetRegistry } from '@app/types/time-series-data.model';
import { MtxPopover } from '@ng-matero/extensions/popover';
import { Subscription } from 'rxjs';
import { DatasetKey, KPIEndpointKey, SingleValueDiagram } from 'src/app/types/kpi.model';

@Component({
  selector: 'app-single-value-chart',
  templateUrl: './single-value-chart.component.html',
  styleUrls: ['./single-value-chart.component.scss']
})
export class SingleValueChartComponent implements SingleValueDiagram {
  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);
  _value: number = 0;
 

  @Input() popover?: MtxPopover;

  @Input() set value (value: number) {
    this._value = value;
  }
  get value(): number {
    const factor = Math.pow(1000, this.unitIndex);
    return this._value / factor;
  }

  get valueFormatted(): string {
    // only 2 digits after comma
    return ChartService.addThousandsSeparator(this.value.toFixed(2).replace('.', ','));
  }

  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() units: string[] = [];
  @Input() outlined: boolean = true;
  @Input() small: boolean = false;

  get unit(): string {
    if (this.units.length === 0) return '';
    return this.units[this.unitIndex];
  }

  get unitIndex(): number {
    let i
    let value = this._value
    for (i = 0; i < this.units.length; i++) {
      value /= 1000
      if (value < 1) {
        return i
      }
    }
    return i-1
  }
  
  _kpiName?: DatasetKey;
  readonly id = "SingleValueChartComponent." + Math.random().toString(36).substring(7);

  @Input() set kpiName(value: DatasetKey | undefined) {
    this._kpiName = value;
    if (value) {
      this.registry.endpointKey = value;
      this.dataService.registerDataset(this.registry)
      this.subscriptions = this.chartService.subscribeSingleValueDiagram(this, value, false);
    }
  }

  get kpiName(): DatasetKey | undefined {
    return this._kpiName;
  }

  registry: DatasetRegistry = {
    id:this.id,
    endpointKey: KPIEndpointKey.CO2_SAVINGS,
  }

  subscriptions: Subscription[] = [];

  ngOnInit() {
  }
  
  ngOnDestroy() {
    this.unsubscribeAll()
    this.dataService.unregisterDataset(this.registry)
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
  
  constructor() {
  }
}
