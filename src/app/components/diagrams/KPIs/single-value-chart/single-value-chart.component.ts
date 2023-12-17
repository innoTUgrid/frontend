
import { Component, Input, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { KpiService } from 'src/app/services/kpi.service';
import { KPI, SingleValueDiagram } from 'src/app/types/kpi.model';

@Component({
  selector: 'app-single-value-chart',
  templateUrl: './single-value-chart.component.html',
  styleUrls: ['./single-value-chart.component.scss']
})
export class SingleValueChartComponent implements SingleValueDiagram {
  kpiService: KpiService = inject(KpiService);
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
  
  _kpiName?: KPI;

  @Input() set kpiName(value: KPI | undefined) {
    this._kpiName = value;
    if (value) {
      this.kpiService.fetchKPIData(value, this.kpiService.timeInterval)
    }
  }

  get kpiName(): KPI | undefined {  
    return this._kpiName;
  }

  subscriptions: Subscription[] = [];

  ngOnInit() {
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
  constructor() {
    this.subscriptions = this.kpiService.subscribeSingleValueDiagram(this, false);
  }
}
