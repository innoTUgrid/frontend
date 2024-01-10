import { Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { TimeSeriesEndpointKey } from '@app/types/kpi.model';
@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent {
  dataService: DataService = inject(DataService);

  TimeSeriesKey = TimeSeriesEndpointKey

  ngOnInit(): void {
  }

}
