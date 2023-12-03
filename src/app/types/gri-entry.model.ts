export interface GriEntry {
    gri_modul: string;
    description: string;
    unit: string;
    year_2023: string;
    year_2022: string;
  }

export class Gri implements GriEntry {
    gri_modul: string;
    description: string;
    unit: string;
    year_2023: string;
    year_2022: string;
  
    constructor(
      gri_modul: string,
      description: string,
      unit: string,
      year_2023: string,
      year_2022: string
    ) {
      this.gri_modul = gri_modul;
      this.description = description;
      this.unit = unit;
      this.year_2023 = year_2023;
      this.year_2022 = year_2022;
    }
  }
  
  export const griArray: Gri[] = [
    new Gri("GRI 302-1 Energy consumption within the organization", 
    "a. Total fuel consumption within the organization from non-renewable sources including fuel types used.", 
    "-", "-", "-"),
    new Gri("", 
    "b. Total fuel consumption within the organization from renewable sources including fuel types used.", 
    "-", "-", "-"),
    new Gri("", 
    "c. i. Electricity consumption", 
    "kWh", "x", "x"),
    new Gri("", 
    "c. ii. Cooling consumption", 
    "-", "-", "-"),
    new Gri("", 
    "c. iii. Steam consumption", 
    "-", "-", "-"),
    new Gri("...", "", "", "", ""),
    new Gri("GRI 305-1 Direct (Scope 1) GHG emissions", 
    "a. Gross direct (Scope 1) GHG emissions", 
    "CO2 equivalent.", "x", "x"),
    new Gri("", 
    "b. Gases included in the calculation", 
    "/", "CO2", "CO2"),
    new Gri("", 
    "c. Biogenic CO2 emissions ", 
    "CO2 equivalent.", "x", "x"),
    new Gri("...", "", "", "", ""),
  ];
  