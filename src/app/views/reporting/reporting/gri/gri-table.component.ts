import {Component,ViewChild, ElementRef, Input} from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import * as XLSX from 'xlsx';

class GRIElement {
  gri_modul: string;
  description: string;
  unit: string;
  year_first: string;
  year_second: string;

  // a function that takes a year and returns the value for that year
  data_loader?: (year: number) => number;

  constructor(gri_modul: string, description: string, unit: string, year_2023: string, year_2022: string, data_loader?: (year: number) => number) {
    this.gri_modul = gri_modul;
    this.description = description;
    this.unit = unit;
    this.year_first = year_2023;
    this.year_second = year_2022;
    this.data_loader = data_loader;
  }
}

@Component({
  selector: 'gri-table',
  styleUrls: ['./gri-table.component.scss'],
  templateUrl: 'gri-table.component.html',
})

export class TableBasicExample {
  @ViewChild('TABLE') table!: ElementRef;

  @Input() title: string = '';

  // Excel export function
  ExportTOExcel()
  {
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GRI_Report');
    
    XLSX.writeFile(wb, 'GRI_Report.xlsx');
    
  }

  columns: MtxGridColumn[] = [
    { header: 'GRI Modul', field: 'gri_modul', width: '30%' },
    { header: 'Description', field: 'description', width: '40%' },
    { header: 'Unit', field: 'unit', width: '10%' },
    { header: '2023', field: 'year_first', width: '10%' },
    { header: '2022', field: 'year_second', width: '10%' },
  ]

  list = ELEMENT_DATA
}



const ELEMENT_DATA: GRIElement[] = [

    // GRI 302-1
    {gri_modul: "GRI 302-1 Energy consumption within the organization", description: "a. Total fuel consumption within the organization from non-renewable sources including fuel types used", unit: "-", year_first:"-", year_second:"-"}, // no data for this
    {gri_modul: "", description: "b. Total fuel consumption within the organization from renewable sources including fuel types used", unit:"-", year_first:"-", year_second:"-"}, // Biogas kwh (consumption endpoint)
    {gri_modul: "", description: "c. i. Electricity consumption", unit:"-", year_first:"-", year_second:"-"}, // total consumption (consumption endpoint)
    {gri_modul: "", description: "c. ii. Heating consumption", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "c. iii. Cooling consumption", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "c. iv. Steam consumption", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. i. Electricity sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. ii. Heating sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. iii. Cooling sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "d. iv. Steam sold", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "e. Total energy consumption within the organization", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "f. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_first:"-", year_second:"-"}, // fulltext TODO
    {gri_modul: "", description: "g. Source of the conversion factors used", unit:"-", year_first:"-", year_second:"-"}, // leer

    // GRI 305-1
    {gri_modul: "GRI 305-1 Direct (Scope 1) GHG emissions", description: "a. Gross direct (Scope 1) GHG emissions", unit:"-", year_first:"-", year_second:"-"}, // total scope 1 emissions 
    {gri_modul: "", description: "b. Gases included in the calculation", unit:"-", year_first:"-", year_second:"-"}, // fixed value 
    {gri_modul: "", description: "c. Biogenic CO2 emissions ", unit:"-", year_first:"-", year_second:"-"}, // emissions of biogas
    {gri_modul: "", description: "d. Base year for the calculation, if applicable", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "e. Source of the emission factors and the global warming potential (GWP) rates used, or a reference to the GWP source", unit:"-", year_first:"-", year_second:"-"}, // source of emission factors, not yet implemented
    {gri_modul: "", description: "f. Consolidation approach for emissions; whether equity share, financial control, or operational control", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "g. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_first:"-", year_second:"-"}, // fulltext TODO

    // GRI 305-2
    {gri_modul: "GRI 305-2 Energy indirect (Scope 2) GHG emissions", description: "a. Gross location-based energy indirect (Scope 2) GHG emissions", unit:"-", year_first:"-", year_second:"-"}, // total scope 2 emissions
    {gri_modul: "", description: "b. If applicable, gross market-based energy indirect (Scope 2) GHG emissions", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "c. Gases included in the calculation", unit:"-", year_first:"-", year_second:"-"}, // fixed value co2
    {gri_modul: "", description: "d. Base year for the calculation, if applicable", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "e. Source of the emission factors and the global warming potential (GWP) rates used, or a reference to the GWP source", unit:"-", year_first:"-", year_second:"-"}, // source of emission factors, not yet implemented
    {gri_modul: "", description: "f. Consolidation approach for emissions; whether equity share, financial control, or operational control", unit:"-", year_first:"-", year_second:"-"}, // leer
    {gri_modul: "", description: "g. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_first:"-", year_second:"-"}, // fulltext TODO

];

