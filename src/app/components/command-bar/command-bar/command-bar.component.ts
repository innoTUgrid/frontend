import { Component } from '@angular/core';
import {Granularity} from 'src/app/types/granularity.model'

@Component({
  selector: 'app-command-bar',
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.scss']
})
export class CommandBarComponent {
  recentPeriodToDisplay='';
  selectedGranularity: string = '';
  sortedGranularities: Granularity[] = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
  allowedGranularity: Granularity[] = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
  startDate: Date | null = null;
  endDate: Date | null = null;
  singleDate: Date | null = null;



  // today --> granularity: only allowed hour --> current day, disabled
  // last 7 day --> daily, hourly --> last week range, disabled
  // last 31 day --> weeks, daily --> range, disabled
  //last year --> quarter, months --> range, disabled

  applyFilters() {
    console.log('Recent period:', this.recentPeriodToDisplay);
    console.log('Granularity:', this.selectedGranularity);
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);
  }

  resetFilters(){
    this.recentPeriodToDisplay='';
    this.selectedGranularity = '';
    this.sortedGranularities = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
    this.allowedGranularity = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
    this.startDate = null;
    this.endDate = null;
    this.singleDate = null;
  }

  handleRecentPeriodInput(){
    console.log("HERE")
    let today = new Date();
    switch(this.recentPeriodToDisplay){
      case 'today': this.adjustGranularity([Granularity.HOUR]); this.handleDateRange(today); break;
      case 'last7Days': this.adjustGranularity([Granularity.HOUR, Granularity.DAY]); this.handleDateRange(this.calculateStartDate(7), today); break;
      case 'last31Days': this.adjustGranularity([Granularity.DAY, Granularity.WEEK]); this.handleDateRange(this.calculateStartDate(31), today); break;
      case 'lastYear': this.adjustGranularity([Granularity.MONTH, Granularity.QUARTER]); this.handleDateRange(this.calculateStartDate(365), today); break;
      default: this.adjustGranularity([Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR]);
    }
  }

  adjustGranularity(granularityToAllow: Granularity[]){
    this.allowedGranularity = granularityToAllow;
  }

  calculateStartDate(daysAgo: number): Date {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysAgo);
    return startDate;
  }

  handleDateRange(start: Date, end?: Date){
    if(!end) this.singleDate = start;
    else{
      this.startDate = start;
      this.endDate = end;
    }
  }

  isSingleDatepickerDisabled(): boolean {
    return (
      this.recentPeriodToDisplay === 'today'
    );
  }
}