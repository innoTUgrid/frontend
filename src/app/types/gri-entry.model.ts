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
    "-", "-", "-")
  ];