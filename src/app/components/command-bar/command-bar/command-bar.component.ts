import moment, { Moment } from 'moment';
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

  granularities = Object.values(Granularity);
  recentPeriodToDisplay='';
  
  selectedGranularity: string = '';

  startDate: Moment | null = null;
  endDate: Moment | null = null;
  singleDate: Moment | null = null;

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
    this.startDate = null;
    this.endDate = null;
    this.singleDate = null;

    // currently set as initial date in KPI service
    let timeInterval: TimeInterval = {
      start: moment("2019-01-01T00:00:00.000Z"),
      end: moment("2019-01-01T02:00:00.000Z"),
      step: 1,
      stepUnit: "hour"
    }
    this.kpiService.timeInterval$$.next(timeInterval)
  }

  handleRecentPeriodInput() {
    let today = moment();
    switch(this.recentPeriodToDisplay) {
      case 'today': this.setDateRange(today); break;
      case 'last7Days': this.setDateRange(this.calculateStartDate(7), today); break;
      case 'last31Days': this.setDateRange(this.calculateStartDate(31), today); break;
      case 'lastYear': this.setDateRange(this.calculateStartDate(365), today); break;
    }
  }

  calculateStartDate(daysAgo: number): Moment {
    return moment().startOf('day').add(-daysAgo, 'days');
  }

  setDateRange(start: Moment, end?: Moment){
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
        start: moment(params['start']),
        end: moment(params['end']),
        step: +params['step'], // convert to number
        stepUnit: params['stepunit'] as TimeUnit
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