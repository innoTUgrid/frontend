import {Component, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { campusEnergyArray } from 'src/app/types/campus-energy-entry.model';
import { CampusEnergyEntry } from 'src/app/types/campus-energy-entry.model';

@Component({
  selector: 'app-campus-energy',
  templateUrl: './campus-energy.component.html',
  styleUrls: ['./campus-energy.component.scss']
})
export class CampusEnergyComponent {
   
  displayedColumns: string[] =  [
    'time',
    'productionOfCHP_kW',
    'totalLoad_kW',
    'gridReferenceSMARD_kW',
    'productionOfPV_kW',
  ];
  dataSource = new MatTableDataSource<CampusEnergyEntry>(campusEnergyArray);

  @ViewChild(MatPaginator)  paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  
}

