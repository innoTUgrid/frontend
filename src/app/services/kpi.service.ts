import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KpiService {

  private productionData = [1,2,3,4,5,6]
  private consumptionData = [4,3,2,1,0]

  constructor() { }

  computeProductionKpi() {
    return [...this.productionData]
  }

  computeConsumptionKpi() {
    return [...this.consumptionData]
  }

  computeEnergyMixKpi() {
    return [...this.productionData]
  }

  computeAutarkyKpi() {
    return 0
  }

  computeCO2SavingsKpi() {
    return 20
  }

  computeSelfConsumptionKpi() {
    return 233
  }

  computeCostSavingsKpi() {
    return 123
  }
}
