import { Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { KPIEndpointKey } from '@app/types/kpi.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  dataService: DataService = inject(DataService);

  KPI = KPIEndpointKey;

  ngOnInit(): void {
  }
}

