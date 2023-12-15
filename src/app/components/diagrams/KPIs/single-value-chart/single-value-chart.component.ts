
import { Component, Input, inject } from '@angular/core';
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
  @Input() kpiName: KPI = KPI.AUTARKY;

  constructor() {
    this.kpiService.subscribeSingleValueDiagram(this, this.kpiName, false);
  }
}
