import { Component, Input } from '@angular/core';
import { DatasetKey, KPIEndpointKey } from '@app/types/kpi.model';

@Component({
  selector: 'app-kpi-chart',
  templateUrl: './kpi-chart.component.html',
  styleUrls: ['./kpi-chart.component.scss']
})
export class KpiChartComponent {

  @Input() kpiName?: KPIEndpointKey;

  units: Map<string, string> = new Map([
    [KPIEndpointKey.CO2_SAVINGS, 'kg'],
    [KPIEndpointKey.COST_SAVINGS, '€'],
    [KPIEndpointKey.AUTARKY, '%'],
    [KPIEndpointKey.SELF_CONSUMPTION, '%'],
  ])

  icons: Map<string, string> = new Map([
    [KPIEndpointKey.COST_SAVINGS, 'payments'],
    [KPIEndpointKey.CO2_SAVINGS, 'energy_savings_leaf'],
  ])

  titles: Map<string, string> = new Map([
    [KPIEndpointKey.COST_SAVINGS, 'Cost Savings'],
    [KPIEndpointKey.CO2_SAVINGS, 'CO₂ Savings'],
    [KPIEndpointKey.AUTARKY, 'AUTARKY'],
    [KPIEndpointKey.SELF_CONSUMPTION, 'SELF-CONSUMPTION'],
  ])

  get unit(): string {
    return this.units.get(this.kpiName || '') || '';
  }

  get icon(): string {
    return this.icons.get(this.kpiName || '') || '';
  }

  get title(): string {
    return this.titles.get(this.kpiName || '') || '';
  }

  get percent_chart(): boolean {
    return this.kpiName == KPIEndpointKey.AUTARKY || this.kpiName == KPIEndpointKey.SELF_CONSUMPTION;
  }

}
