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
  solarColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-12').trim();
  brownCoalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-7').trim();
  naturalGasColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-8').trim();
  otherConventionalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-9').trim();
  hardCoalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-10').trim();
  pumpStorageColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-11').trim();
  importedEnergyRenewablesColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-19').trim();
  importedEnergyConventionalColor = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-20').trim();
  solarColorLocal = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-6').trim();
  biogasColorLocal = getComputedStyle(document.documentElement).getPropertyValue('--highcharts-color-21').trim();

  colors = [
    this.biogasColor,
    this.biomassColor,
    this.otherRenewablesColor,
    this.windOffshoreColor,
    this.hydroPowerColor,
    this.windOnshoreColor,
    this.solarColor,
    this.brownCoalColor,
    this.naturalGasColor,
    this.otherConventionalColor,
    this.hardCoalColor,
    this.pumpStorageColor,
    this.solarColorLocal,
    this.biogasColorLocal,
  ]

  getColorIndex(type: string) {
    return this.colors.indexOf(this.colorMap.get(type) || '')
  }

  colorMap = new Map<string, string>([
    ['biogas', this.biogasColor],
    ['biomass', this.biomassColor],
    ['other-renewables', this.otherRenewablesColor],
    ['offwind', this.windOffshoreColor],
    ['hydro', this.hydroPowerColor],
    ['onwind', this.windOnshoreColor],
    ['solar', this.solarColor],
    ['brown-coal', this.brownCoalColor],
    ['lignite', this.brownCoalColor],
    ['natural-gas', this.naturalGasColor],
    ['gas', this.naturalGasColor],
    ['other-conventionals', this.otherConventionalColor],
    ['hard-coal', this.hardCoalColor],
    ['coal', this.hardCoalColor],
    ['pump-storage', this.pumpStorageColor],
    ['total-external', this.otherConventionalColor],
    ['total-renewable', this.importedEnergyRenewablesColor],
    ['total-non-renewable', this.importedEnergyConventionalColor],
    ['solar-local', this.solarColorLocal],
    ['biogas-local', this.biogasColorLocal],
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
    ['solar', 'Solar (imported)'],
    ['solar-local', 'Solar (local)'],
    ['brown-coal', 'Brown Coal'],
    ['lignite', 'Brown Coal'],
    ['natural-gas', 'Natural Gas'],
    ['other-conventionals', 'Other Conventionals'],
    ['hard-coal', 'Hard Coal'],
    ['coal', 'Hard Coal'],
    ['pumped-storage', 'Pump Storage'],
    ['gas', 'Gas'],
  ])

  getEnergyTypeName(type: string) {
    return this.energyTypesToName.get(type)
  }

  getEnergyType(type: string, local: boolean = false){
    return type + (local ? '-local' : '')
  }
}
