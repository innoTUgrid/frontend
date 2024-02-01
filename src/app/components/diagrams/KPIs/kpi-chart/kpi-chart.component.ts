import { Component, Input } from '@angular/core';
import { DatasetKey, KPIEndpointKey } from '@app/types/kpi.model';
import { MtxPopover } from '@ng-matero/extensions/popover';

@Component({
  selector: 'app-kpi-chart',
  templateUrl: './kpi-chart.component.html',
  styleUrls: ['./kpi-chart.component.scss']
})
export class KpiChartComponent {

  @Input() kpiName?: KPIEndpointKey;

  @Input() popover?: MtxPopover;

  units: Map<string, string> = new Map([
    [KPIEndpointKey.CO2_SAVINGS, 'kg'],
    [KPIEndpointKey.COST_SAVINGS, '€'],
    [KPIEndpointKey.AUTARKY, '%'],
    [KPIEndpointKey.SELF_CONSUMPTION, '%'],
    [KPIEndpointKey.TOTAL_CONSUMPTION, 'kWh'],
    [KPIEndpointKey.TOTAL_PRODUCTION, 'kWh'],
    [KPIEndpointKey.TOTAL_CO2_EMISSIONS_PER_KWH, 'kg'],
    [KPIEndpointKey.TOTAL_COSTS_PER_KWH, '€']
  ])

  icons: Map<string, string> = new Map([
    [KPIEndpointKey.COST_SAVINGS, 'savings'],
    [KPIEndpointKey.CO2_SAVINGS, 'cloud'],
    [KPIEndpointKey.TOTAL_CONSUMPTION, 'power'],
    [KPIEndpointKey.TOTAL_PRODUCTION, 'bolt'],
    [KPIEndpointKey.TOTAL_CO2_EMISSIONS_PER_KWH, 'cloud'],
    [KPIEndpointKey.TOTAL_COSTS_PER_KWH, 'payments'],
  ])

  titles: Map<string, string> = new Map([
    [KPIEndpointKey.COST_SAVINGS, 'COST SAVINGS'],
    [KPIEndpointKey.CO2_SAVINGS, 'CO₂ SAVINGS'],
    [KPIEndpointKey.AUTARKY, 'AUTARKY'],
    [KPIEndpointKey.SELF_CONSUMPTION, 'SELF-CONSUMPTION'],
    [KPIEndpointKey.TOTAL_CONSUMPTION, 'TOTAL CONSUMPTION'],
    [KPIEndpointKey.TOTAL_PRODUCTION, 'TOTAL PRODUCTION'],
    [KPIEndpointKey.TOTAL_CO2_EMISSIONS_PER_KWH, 'TOTAL CO₂ EMISSIONS'],
    [KPIEndpointKey.TOTAL_COSTS_PER_KWH, 'TOTAL COSTS']
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
