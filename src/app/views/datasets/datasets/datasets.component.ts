import { Component } from '@angular/core';
import { KPI } from '@app/types/kpi.model';
@Component({
  selector: 'app-datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent {

  KPI = KPI

}
