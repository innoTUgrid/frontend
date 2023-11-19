export interface SMARDEntry {
    time: string;
    brownCoalMWh: number;
    hardCoalMWh: number;
    otherConventionalFuelMWh: number;
    naturalGasMWh: number;
    biomassMWh: number;
    hydropowerMWh: number;
    windOffshoreMWh: number;
    windOnshoreMWh: number;
    photovoltaicMWh: number;
    otherRenewablesMWh: number;
    pumpedStorageMWh: number;
  }
  
  export class SMARDEntryClass implements SMARDEntry {
    time: string;
    brownCoalMWh: number;
    hardCoalMWh: number;
    otherConventionalFuelMWh: number;
    naturalGasMWh: number;
    biomassMWh: number;
    hydropowerMWh: number;
    windOffshoreMWh: number;
    windOnshoreMWh: number;
    photovoltaicMWh: number;
    otherRenewablesMWh: number;
    pumpedStorageMWh: number;
  
    constructor(
      time: string,
      brownCoalMWh: number,
      hardCoalMWh: number,
      otherConventionalFuelMWh: number,
      naturalGasMWh: number,
      biomassMWh: number,
      hydropowerMWh: number,
      windOffshoreMWh: number,
      windOnshoreMWh: number,
      photovoltaicMWh: number,
      otherRenewablesMWh: number,
      pumpedStorageMWh: number
    ) {
      this.time = time;
      this.brownCoalMWh = brownCoalMWh;
      this.hardCoalMWh = hardCoalMWh;
      this.otherConventionalFuelMWh = otherConventionalFuelMWh;
      this.naturalGasMWh = naturalGasMWh;
      this.biomassMWh = biomassMWh;
      this.hydropowerMWh = hydropowerMWh;
      this.windOffshoreMWh = windOffshoreMWh;
      this.windOnshoreMWh = windOnshoreMWh;
      this.photovoltaicMWh = photovoltaicMWh;
      this.otherRenewablesMWh = otherRenewablesMWh;
      this.pumpedStorageMWh = pumpedStorageMWh;
    }
  }
  