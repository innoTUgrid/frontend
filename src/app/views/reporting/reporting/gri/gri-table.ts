import {Component,ViewChild, ElementRef} from '@angular/core';
import * as XLSX from 'xlsx';


@Component({
  selector: 'gri-table',
  styleUrls: ['./gri-table.scss'],
  templateUrl: 'gri-table.html',
})

export class TableBasicExample {
  @ViewChild('TABLE') table!: ElementRef;
  displayedColumns = ['gri_modul', 'description', 'unit', 'year_2023', 'year_2022'];
  dataSource = ELEMENT_DATA;

// Excel export function
ExportTOExcel()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'GRI_Report');
  
  XLSX.writeFile(wb, 'GRI_Report.xlsx');
  
}}

export interface Element {
    gri_modul: string;
    description: string;
    unit: string;
    year_2023: string;
    year_2022: string;
}

const ELEMENT_DATA: Element[] = [

    // GRI 302-1
    {gri_modul: "GRI 302-1 Energy consumption within the organization", description: "a. Total fuel consumption within the organization from non-renewable sources including fuel types used", unit: "-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "b. Total fuel consumption within the organization from renewable sources including fuel types used", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "c. i. Electricity consumption", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "c. ii. Heating consumption", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "c. iii. Cooling consumption", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "c. iv. Steam consumption", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "d. i. Electricity sold", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "d. ii. Heating sold", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "d. iii. Cooling sold", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "d. iv. Steam sold", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "e. Total energy consumption within the organization", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "f. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "g. Source of the conversion factors used", unit:"-", year_2023:"-", year_2022:"-"},

    // GRI 305-1
    {gri_modul: "GRI 305-1 Direct (Scope 1) GHG emissions", description: "a. Gross direct (Scope 1) GHG emissions", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "c. Biogenic CO2 emissions ", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "d. Base year for the calculation, if applicable", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "e. Source of the emission factors and the global warming potential (GWP) rates used, or a reference to the GWP source", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "f. Consolidation approach for emissions; whether equity share, financial control, or operational control", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "g. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_2023:"-", year_2022:"-"},

    // GRI 305-2
    {gri_modul: "GRI 305-2 Energy indirect (Scope 2) GHG emissions", description: "a. Gross location-based energy indirect (Scope 2) GHG emissions", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "b. If applicable, gross market-based energy indirect (Scope 2) GHG emissions", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "c. Gases included in the calculation", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "d. Base year for the calculation, if applicable", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "e. Source of the emission factors and the global warming potential (GWP) rates used, or a reference to the GWP source", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "f. Consolidation approach for emissions; whether equity share, financial control, or operational control", unit:"-", year_2023:"-", year_2022:"-"},
    {gri_modul: "", description: "g. Standards, methodologies, assumptions, and/or calculation tools used", unit:"-", year_2023:"-", year_2022:"-"},

];

