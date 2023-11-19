import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { HouseBeckerEntry } from 'src/app/types/house-becker-entry.model';
import { houseBeckerArray } from 'src/app/types/house-becker-entry.model';

@Component({
  selector: 'app-data-table-consumption-house-becker',
  templateUrl: './data-table-consumption-house-becker.component.html',
  styleUrls: ['./data-table-consumption-house-becker.component.scss']
})
export class DataTableConsumptionHouseBeckerComponent implements AfterViewInit{
   
  displayedColumns: string[] =  [
    'dateTimeStamp',
    'trafoOut1PowerWatts15MinMean',
    'trafoOut2PowerWatts15MinMean',
  ];
  dataSource = new MatTableDataSource<HouseBeckerEntry>(houseBeckerArray);

  @ViewChild(MatPaginator)  paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}

