
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
    return this._value;
  }

  get valueFormatted(): string {
    // only 2 digits after comma
    return this.value.toFixed(2);
  }

  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() unit: string = '';
  @Input() outlined: boolean = true;
  
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
