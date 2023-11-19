export interface HouseBeckerEntry {
    dateTimeStamp: string;
    trafoOut1PowerWatts15MinMean?: number;
    trafoOut2PowerWatts15MinMean?: number;
  }
  
  export class HaouseBeckerEntry implements HouseBeckerEntry {
    dateTimeStamp: string;
    trafoOut1PowerWatts15MinMean?: number;
    trafoOut2PowerWatts15MinMean?: number;
  
    constructor(dateTimeStamp: string, power1?: number, power2?: number) {
      this.dateTimeStamp = dateTimeStamp;
      this.trafoOut1PowerWatts15MinMean = power1;
      this.trafoOut2PowerWatts15MinMean = power2;
    }
  }

  export const houseBeckerArray: HouseBeckerEntry[] = [
    { dateTimeStamp: '2019-01-01 00:00:02.336666' },
    { dateTimeStamp: '2019-01-01 00:00:02.490000', trafoOut1PowerWatts15MinMean: 10000 },
    { dateTimeStamp: '2019-01-01 00:00:02.496666', trafoOut2PowerWatts15MinMean: 11000 },
    { dateTimeStamp: '2019-01-01 00:00:02.500000' },
    { dateTimeStamp: '2019-01-01 00:00:02.503333' },
    { dateTimeStamp: '2019-01-01 00:15:02.343333' },
    { dateTimeStamp: '2019-01-01 00:15:02.496666', trafoOut1PowerWatts15MinMean: 11000 },
    { dateTimeStamp: '2019-01-01 00:15:02.500000', trafoOut2PowerWatts15MinMean: 12000 },
    { dateTimeStamp: '2019-01-01 00:15:02.506666' },
  ];