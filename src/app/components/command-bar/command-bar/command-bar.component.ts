import { Component } from '@angular/core';

@Component({
  selector: 'app-command-bar',
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.scss']
})
export class CommandBarComponent {
  selectedGranularity: string = 'year';
  startDate: string = '';
  endDate: string = '';

  applyFilters() {
    // Add logic here to handle the selected granularity and time interval
    console.log('Granularity:', this.selectedGranularity);
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);
  }
}
