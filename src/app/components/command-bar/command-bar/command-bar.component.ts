import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KpiService } from 'src/app/services/kpi.service';
import {Granularity} from 'src/app/types/granularity.model'
import { TimeInterval, TimeUnit } from 'src/app/types/time-series-data.model';

@Component({
  selector: 'app-command-bar',
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.scss']
})
export class CommandBarComponent {
  kpiService: KpiService = inject(KpiService)
  recentPeriodToDisplay='';
  selectedGranularity: string = '';
  sortedGranularities: Granularity[] = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
  allowedGranularity: Granularity[] = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
  startDate: Date | null = null;
  endDate: Date | null = null;
  singleDate: Date | null = null;

  timeInterval?: TimeInterval;
  selectedView?: string | null;

  // today --> granularity: only allowed hour --> current day, disabled
  // last 7 day --> daily, hourly --> last week range, disabled
  // last 31 day --> weeks, daily --> range, disabled
  //last year --> quarter, months --> range, disabled

  applyFilters() {
    console.log('Recent period:', this.recentPeriodToDisplay);
    console.log('Granularity:', this.selectedGranularity);
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);

    if (this.startDate && this.endDate) {
      this.timeInterval = {
        start:this.startDate,
        end:this.endDate,
        step: (this.selectedGranularity == Granularity.QUARTER) ? 3 : 1,
        stepUnit: (this.selectedGranularity == Granularity.QUARTER) ? Granularity.MONTH : this.selectedGranularity as TimeUnit
      }
      this.kpiService.timeInterval$$.next(this.timeInterval)
    }
  }

  resetFilters(){
    this.recentPeriodToDisplay='';
    this.selectedGranularity = '';
    this.sortedGranularities = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
    this.allowedGranularity = [Granularity.HOUR, Granularity.DAY, Granularity.WEEK, Granularity.MONTH, Granularity.QUARTER, Granularity.YEAR];
    this.startDate = null;
    this.endDate = null;
    this.singleDate = null;

    // currently set as initial date in KPI service
    let timeInterval = {
      start:new Date("2019-01-01T00:00:00.000Z"),
      end:new Date("2019-01-01T02:00:00.000Z"),
      step: 1,
      stepUnit: "hour" as TimeUnit
    }
    this.kpiService.timeInterval$$.next(timeInterval)
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

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe(params => {
      const timeInterval = {
        start: new Date(params['start']),
        end: new Date(params['end']),
        step: +params['step'], // convert to number
        stepUnit: params['stepUnit'] as TimeUnit
      };

      this.kpiService.updateTimeInterval(timeInterval);
    });

    this.kpiService.timeInterval$$.subscribe(timeInterval => {
      if (timeInterval != this.timeInterval) {
        this.timeInterval = timeInterval;
        this.startDate = timeInterval.start;
        this.endDate = timeInterval.end;
        this.selectedGranularity = (timeInterval.stepUnit == 'month' && timeInterval.step == 3) ? Granularity.QUARTER : timeInterval.stepUnit;
      }
    });
  }

  ngOnInit(): void {
    const currentRoute = this.activatedRoute.snapshot.url;
    this.selectedView = currentRoute[currentRoute.length - 1].path;

    console.log(this.selectedView);
  }
}