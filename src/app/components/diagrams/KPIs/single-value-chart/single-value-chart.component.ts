
import { Component, Input, inject } from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { Subscription } from 'rxjs';
import { DatasetKey, SingleValueDiagram } from 'src/app/types/kpi.model';

@Component({
  selector: 'app-single-value-chart',
  templateUrl: './single-value-chart.component.html',
  styleUrls: ['./single-value-chart.component.scss']
})
export class SingleValueChartComponent implements SingleValueDiagram {
  chartService: ChartService = inject(ChartService);
  dataService: DataService = inject(DataService);
  _value: number = 0;
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
  
  _kpiName?: DatasetKey;

  @Input() set kpiName(value: DatasetKey | undefined) {
    this._kpiName = value;
    if (value) {
      this.chartService.updateSingleValue(this, false)
    }
  }

  get kpiName(): DatasetKey | undefined {
    return this._kpiName;
  }

  subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscribe();
  }
  
  ngOnDestroy() {
    this.unsubscribeAll()
  }

  subscribe() {
    this.subscriptions = this.chartService.subscribeSingleValueDiagram(this, false);
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
  
  constructor() {
  }
}
