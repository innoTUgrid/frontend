import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { SMARDEntry } from 'src/app/types/smard-entry.model';

@Component({
  selector: 'app-data-table-smard',
  templateUrl: './data-table-smard.component.html',
  styleUrls: ['./data-table-smard.component.scss'],
})
export class DataTableSmardComponent implements AfterViewInit{

  isFullScreen = false;
  
  SMARD_TABLE_DATA: SMARDEntry[] = [{time: '2019-01-01 00:00:00', brownCoalMWh: 1533, hardCoalMWh: 48.8, otherConventionalFuelMWh: 157, naturalGasMWh: 148, biomassMWh: 298, hydropowerMWh: 35, windOffshoreMWh: 256, windOnshoreMWh: 1607, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 21},

  {time: '2019-01-01 00:15:00', brownCoalMWh: 1498, hardCoalMWh: 48.5, otherConventionalFuelMWh: 157, naturalGasMWh: 147, biomassMWh: 302, hydropowerMWh: 35.3, windOffshoreMWh: 256, windOnshoreMWh: 1680, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 20.3},
  
  {time: '2019-01-01 00:30:00', brownCoalMWh: 1439, hardCoalMWh: 48.8, otherConventionalFuelMWh: 157, naturalGasMWh: 146, biomassMWh: 300, hydropowerMWh: 35, windOffshoreMWh: 256, windOnshoreMWh: 1757, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 21.5},
  
  {time: '2019-01-01 00:45:00', brownCoalMWh: 1274, hardCoalMWh: 48.8, otherConventionalFuelMWh: 157, naturalGasMWh: 148, biomassMWh: 301, hydropowerMWh: 35.3, windOffshoreMWh: 256, windOnshoreMWh: 1770, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 20.5},
  
  {time: '2019-01-01 01:00:00', brownCoalMWh: 1152, hardCoalMWh: 48.5, otherConventionalFuelMWh: 157, naturalGasMWh: 147, biomassMWh: 301, hydropowerMWh: 35.3, windOffshoreMWh: 256, windOnshoreMWh: 1847, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 29.5},
  
  {time: '2019-01-01 01:15:00', brownCoalMWh: 1052, hardCoalMWh: 48.8, otherConventionalFuelMWh: 155, naturalGasMWh: 146, biomassMWh: 304, hydropowerMWh: 35.5, windOffshoreMWh: 256, windOnshoreMWh: 1921, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 29},
  
  {time: '2019-01-01 01:30:00', brownCoalMWh: 1043, hardCoalMWh: 48.8, otherConventionalFuelMWh: 157, naturalGasMWh: 146, biomassMWh: 301, hydropowerMWh: 35.3, windOffshoreMWh: 254, windOnshoreMWh: 2006, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 29},
  
  {time: '2019-01-01 01:45:00', brownCoalMWh: 953, hardCoalMWh: 48.8, otherConventionalFuelMWh: 157, naturalGasMWh: 145, biomassMWh: 305, hydropowerMWh: 35.8, windOffshoreMWh: 254, windOnshoreMWh: 2054, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 29.3},
  
  {time: '2019-01-01 02:00:00', brownCoalMWh: 854, hardCoalMWh: 48.8, otherConventionalFuelMWh: 154, naturalGasMWh: 142, biomassMWh: 301, hydropowerMWh: 35.3, windOffshoreMWh: 254, windOnshoreMWh: 2080, photovoltaicMWh: 0, otherRenewablesMWh: 0, pumpedStorageMWh: 29},];
  
  displayedColumns: string[] =  ['time', 'brownCoalMWh', 'hardCoalMWh', 'otherConventionalFuelMWh', 'naturalGasMWh', 'biomassMWh', 'hydropowerMWh', 'windOffshoreMWh', 'windOnshoreMWh', 'photovoltaicMWh', 'otherRenewablesMWh', 'pumpedStorageMWh'];
  dataSource = new MatTableDataSource<SMARDEntry>(this.SMARD_TABLE_DATA);

  @ViewChild(MatPaginator)  paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  

}
