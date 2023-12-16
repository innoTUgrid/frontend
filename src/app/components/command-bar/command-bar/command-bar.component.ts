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

  timeInterval!: TimeInterval;
  selectedView?: string | null;


  // today --> granularity: only allowed hour --> current day, disabled
  // last 7 day --> daily, hourly --> last week range, disabled
  // last 31 day --> weeks, daily --> range, disabled
  //last year --> quarter, months --> range, disabled

  applyFilters(singleDate?: boolean) {
    console.log('Recent period:', this.recentPeriodToDisplay);
    console.log('Granularity:', this.selectedGranularity);

    this.timeInterval = {
      start: this.timeInterval.start.clone().startOf('day'), 
      end: singleDate ? this.timeInterval.start.clone().endOf('day') : this.timeInterval.end.clone().endOf('day'),
      step: (this.selectedGranularity == Granularity.QUARTER) ? 3 : 1,
      stepUnit: (this.selectedGranularity == Granularity.QUARTER) ? Granularity.MONTH : this.selectedGranularity as TimeUnit
    }
    this.kpiService.timeInterval$$.next(this.timeInterval)
  }

  resetFilters(){
    this.recentPeriodToDisplay='';
    this.selectedGranularity = '';

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
    let today = moment().endOf('day');
    let start = moment().startOf('day').subtract({ 'today': 0, 'last7Days': 7, 'last31Days': 31, 'lastYear': 365}[this.recentPeriodToDisplay], 'days');
    this.timeInterval.start = start;
    this.timeInterval.end = today;
    this.kpiService.timeInterval$$.next(this.timeInterval);
  }

  isSingleDatepickerDisabled(): boolean {
    return (
      this.recentPeriodToDisplay === 'today'
    );
  }

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe(params => {
      const timeInterval: Partial<TimeInterval> = {
        start: params['start'] ? moment(params['start']) : undefined,
        end: params['start'] ? moment(params['end']) : undefined,
        step: +params['step'], // convert to number
        stepUnit: params['stepunit'] as TimeUnit
      };

      this.kpiService.updateTimeInterval(timeInterval);
    });

    this.kpiService.timeInterval$$.subscribe(timeInterval => {
      if (timeInterval != this.timeInterval) {
        this.timeInterval = timeInterval;
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