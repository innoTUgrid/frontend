import { Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { KPIKey, TimeSeriesKey } from '@app/types/kpi.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  dataService: DataService = inject(DataService);

  ngOnInit(): void {
    this.dataService.updateDatasets([TimeSeriesKey.ENERGY_CONSUMPTION, TimeSeriesKey.SCOPE_2_EMISSIONS, KPIKey.CO2_SAVINGS, KPIKey.COST_SAVINGS, KPIKey.AUTARKY, KPIKey.SELF_CONSUMPTION]);
  }
}

