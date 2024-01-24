import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  biogasColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-0').trim();
  biomassColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-1').trim();
  otherRenewablesColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-2').trim();
  windOffshoreColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-3').trim();
  hydroPowerColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-4').trim();
  windOnshoreColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-5').trim();
  solarColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-6').trim();
  brownCoalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-7').trim();
  naturalGasColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-8').trim();
  otherConventionalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-9').trim();
  hardCoalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-10').trim();
  pumpStorageColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-11').trim();

  colorMap = new Map<string, string>([
    ['biogas', this.biogasColor],
    ['biomass', this.biomassColor],
    ['other-renewables', this.otherRenewablesColor],
    ['offwind', this.windOffshoreColor],
    ['hydro', this.hydroPowerColor],
    ['onwind', this.windOnshoreColor],
    ['solar', this.solarColor],
    ['brown-coal', this.brownCoalColor],
    ['natural-gas', this.naturalGasColor],
    ['gas', this.naturalGasColor],
    ['other-conventionals', this.otherConventionalColor],
    ['hard-coal', this.hardCoalColor],
    ['coal', this.brownCoalColor],
    ['pump-storage', this.pumpStorageColor],
    ['total-external', this.otherConventionalColor],
  ]);

  unitToName = new Map([
    ['kwh', 'kWh'],
    ['kgco2eq', 'kg'],
  ]);

  energyTypesToName = new Map([
    ['biogas-local', 'Biogas (local)'],
    ['biogas', 'Biogas'],
    ['biomass', 'Biomass'],
    ['other-renewables', 'Other Renewables'],
    ['offwind', 'Offshore Wind'],
    ['hydro', 'Hydro Power'],
    ['onwind', 'Onshore Wind'],
    ['solar', 'Solar'],
    ['solar-local', 'Solar (local)'],
    ['brown-coal', 'Brown Coal'],
    ['natural-gas', 'Natural Gas'],
    ['other-conventionals', 'Other Conventionals'],
    ['hard-coal', 'Hard Coal'],
    ['pumped-storage', 'Pump Storage'],
    ['coal', 'Coal'],
    ['gas', 'Gas'],
  ])
}
