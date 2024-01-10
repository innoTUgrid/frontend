import { Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  dataService: DataService = inject(DataService);

  ngOnInit(): void {
  }
}

