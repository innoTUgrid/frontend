import {Component, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { griArray } from 'src/app/types/gri-entry.model';
import { GriEntry } from 'src/app/types/gri-entry.model';

@Component({
  selector: 'app-gri',
  templateUrl: './gri.component.html',
  styleUrls: ['./gri.component.scss']
})
export class GriComponent {
   
  displayedColumns: string[] =  [
    'gri_modul',
    'description',
    'unit',
    'year_2023',
    'year_2022',
  ];
  dataSource = new MatTableDataSource<GriEntry>(griArray);

  @ViewChild(MatPaginator)  paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  
}

