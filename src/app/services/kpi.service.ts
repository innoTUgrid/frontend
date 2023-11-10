import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class KpiService {

  // Production data
  private productionData:number[] = [1,2,3,4,5,6,7];
  private productionData$$:BehaviorSubject<number[]> = new BehaviorSubject<number[]>(this.productionData);
  public readonly productionData$:Observable<number[]> = this.productionData$$.asObservable();

  // Consumption data
  private consumptionData:number[] = [4,3,2,1,0,5,6];
  private consumptionData$$:BehaviorSubject<number[]>  = new BehaviorSubject<number[]>(this.consumptionData);
  public readonly consumptionData$:Observable<number[]> = this.consumptionData$$.asObservable();

  // autarky KPI
  private autarkyKPI:number = 0;
  private autarkyKPI$$:BehaviorSubject<number> = new BehaviorSubject<number>(this.autarkyKPI)
  public readonly autarkyKPI$:Observable<number> = this.autarkyKPI$$.asObservable();

  // CO2 savings KPI
  private co2SavingsKPI:number = 0;
  private co2SavingsKPI$$:BehaviorSubject<number>  = new BehaviorSubject<number>(this.co2SavingsKPI)
  public readonly co2SavingsKPI$:Observable<number> = this.co2SavingsKPI$$.asObservable();

  // Self-consumption KPI
  private selfConsumptionKPI:number = 0;
  private selfConsumptionKPI$$:BehaviorSubject<number>  = new BehaviorSubject<number>(this.selfConsumptionKPI)
  public readonly selfConsumptionKPI$:Observable<number> = this.selfConsumptionKPI$$.asObservable();

  // Cost savings KPI
  private costSavingsKPI:number = 0;
  private costSavingsKPI$$:BehaviorSubject<number>  = new BehaviorSubject<number>(this.costSavingsKPI)
  public readonly costSavingsKPI$:Observable<number> = this.costSavingsKPI$$.asObservable();

  constructor() { }

  computeProductionData():void {
    // TODO: some formulas applied on production data
    this.productionData$$.next(this.productionData);
  }

  computeConsumptionData():void {
    // TODO: some formulas applied on consumption data
    this.consumptionData$$.next(this.consumptionData)
  }

  computeEnergyMixKpi() {
    return [...this.productionData]
  }

  computeAutarkyKpi(): void {
      // TODO: some formulas applied on autarky data
      this.autarkyKPI$$.next(this.autarkyKPI)
  }

  computeCO2SavingsKpi():void {
      // TODO: some formulas applied on CO2 savings data
      this.co2SavingsKPI$$.next(this.co2SavingsKPI)
  }

  computeSelfConsumptionKpi() {
      // TODO: some formulas applied on self consumption data
      this.selfConsumptionKPI$$.next(this.selfConsumptionKPI)
  }

  computeCostSavingsKpi() {
      // TODO: some formulas applied on cost savings
      this.costSavingsKPI$$.next(this.costSavingsKPI)
  }
}
