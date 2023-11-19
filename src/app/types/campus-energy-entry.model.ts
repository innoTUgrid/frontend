export interface CampusEnergyEntry {
    time: string;
    productionOfCHP_kW: number;
    totalLoad_kW: number;
    gridReferenceSMARD_kW: number;
    productionOfPV_kW: number;
  }

export class CampusEnergy implements CampusEnergyEntry {
    time: string;
    productionOfCHP_kW: number;
    totalLoad_kW: number;
    gridReferenceSMARD_kW: number;
    productionOfPV_kW: number;
  
    constructor(
      time: string,
      productionOfCHP_kW: number,
      totalLoad_kW: number,
      gridReferenceSMARD_kW: number,
      productionOfPV_kW: number
    ) {
      this.time = time;
      this.productionOfCHP_kW = productionOfCHP_kW;
      this.totalLoad_kW = totalLoad_kW;
      this.gridReferenceSMARD_kW = gridReferenceSMARD_kW;
      this.productionOfPV_kW = productionOfPV_kW;
    }
  }
  
  export const campusEnergyArray: CampusEnergy[] = [
    new CampusEnergy("2019-01-01 00:00:00", 0, 243, 243, -14),
    new CampusEnergy("2019-01-01 00:15:00", 0, 239, 239, -0.12),
    new CampusEnergy("2019-01-01 00:30:00", 0, 236, 236, -0.12),
    new CampusEnergy("2019-01-01 00:45:00", 0, 239, 239, -0.11),
    new CampusEnergy("2019-01-01 01:00:00", 0, 243, 243, -0.10),
    new CampusEnergy("2019-01-01 01:14:59", 0, 235, 235, 100),
    new CampusEnergy("2019-01-01 01:29:59", 0, 236, 236, -75),
    new CampusEnergy("2019-01-01 01:44:59", 0, 238, 239, -82),
    new CampusEnergy("2019-01-01 01:59:59", 0, 237, 237, -14),
  ];
  