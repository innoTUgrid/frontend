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

  defineColors(type: string): string {
    switch (type) {
        case 'biogas':
            return this.biogasColor;
        case 'biomass':
            return this.biomassColor;
        case 'other-renewables':
            return this.otherRenewablesColor;
        case 'offwind':
            return this.windOffshoreColor;
        case 'hydro':
            return this.hydroPowerColor;
        case 'onwind':
            return this.windOnshoreColor;
        case 'solar':
            return this.solarColor;
        case 'brown-coal':
            return this.brownCoalColor;
        case 'natural-gas':
            return this.naturalGasColor;
        case 'other-conventionals':
            return this.otherConventionalColor;
        case 'hard-coal':
            return this.hardCoalColor;
        case 'coal':
            return this.brownCoalColor;
        case 'pump-storage':
            return this.pumpStorageColor;
        case 'external':
            return this.otherConventionalColor;
        default:
            return '';
    }
  }

  energyTypesToName = new Map([
    ['biogas', 'Biogas'],
    ['biomass', 'Biomass'],
    ['other-renewables', 'Other Renewables'],
    ['offwind', 'Offshore Wind'],
    ['hydro', 'Hydro Power'],
    ['onwind', 'Onshore Wind'],
    ['solar', 'Solar'],
    ['brown-coal', 'Brown Coal'],
    ['natural-gas', 'Natural Gas'],
    ['other-conventionals', 'Other Conventionals'],
    ['hard-coal', 'Hard Coal'],
    ['pump-storage', 'Pump Storage'],
    ['coal', 'Coal'],
    ['gas', 'Gas'],
  ])
}
