import moment from 'moment';
import { Component, Input, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Granularity} from 'src/app/types/granularity.model'
import { TimeInterval, TimeUnit } from 'src/app/types/time-series-data.model';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-command-bar',
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.scss']
})
export class CommandBarComponent {
  dataService: DataService = inject(DataService)

  granularities = Object.values(Granularity);
  granularityInHours: {[k: string]: number} = { 'hour': 1, 'day': 24, 'week': 24 * 7, 'month': 24 * 30, 'quarter': 24 * 30 * 3, 'year': 24 * 365};
  
  selectedGranularity: string = '';

  timeInterval!: TimeInterval;
  selectedView?: string | null;

  recentPeriods: {[k: string]: number} = { 'today': 0, 'last 7 days': 7, 'last 31 days': 31, 'last year': 365};
  recentPeriodNames: string[] = Object.entries(this.recentPeriods).sort((a, b) => a[1] - b[1]).map(([key, value]) => key);
  recentPeriodToDisplay = '';
  granularityType: 'select' | 'button' = 'button';

  @Input() enableGranularitySelection: boolean = true;

  applyFilters(singleDate?: boolean) {
    if (!(this.timeInterval.start && this.timeInterval.end)) return;

    const diff = this.timeInterval.end.diff(this.timeInterval.start, 'days');
    // make sure granularity is sane
    const granularity = Object.entries(this.granularityInHours).find(([key, entry]) => {
      return (diff * 24 / entry) < 50;
    })?.[0] || Granularity.HOUR;

    this.selectedGranularity = granularity;
    // set recent period
    this.recentPeriodToDisplay = '';
    if (this.timeInterval.end.isSame(moment().endOf('day'))) {
      this.recentPeriodToDisplay = Object.entries(this.recentPeriods).find(([key, value]) => value == diff)?.[0] || '';
    }
    this.setTimeInterval(singleDate);
  }


  setTimeInterval(singleDate?: boolean) {
    this.timeInterval = {
      start: this.timeInterval.start.clone().startOf('day'), 
      end: singleDate ? this.timeInterval.start.clone().endOf('day') : this.timeInterval.end.clone().endOf('day'),
      step: (this.selectedGranularity == Granularity.QUARTER) ? 3 : 1,
      stepUnit: (this.selectedGranularity == Granularity.QUARTER) ? TimeUnit.MONTH : this.selectedGranularity as TimeUnit
    }
    this.dataService.updateTimeInterval(this.timeInterval);
  }

  resetFilters(){
    this.selectedGranularity = '';

    // currently set as initial date in KPI service
    let timeInterval: TimeInterval = {
      start: moment("2019-01-01T00:00:00.000Z"),
      end: moment("2019-02-01T00:00:00.000Z"),
      step: 1,
      stepUnit: TimeUnit.DAY
    }
    this.dataService.updateTimeInterval(timeInterval)
  }

  handleRecentPeriodInput() {
    let today = moment().endOf('day');
    let start = moment().startOf('day').subtract(this.recentPeriods[this.recentPeriodToDisplay], 'days');
    this.timeInterval.start = start;
    this.timeInterval.end = today;
    this.applyFilters();
    this.dataService.updateTimeInterval(this.timeInterval);
  }

  isSingleDatepickerDisabled(): boolean {
    return (
      this.recentPeriodToDisplay === 'today'
    );
  }

  subscriptions: any[] = [];

  constructor(private activatedRoute: ActivatedRoute, public observer: BreakpointObserver) {
  }

  ngOnInit(): void {
    const currentRoute = this.activatedRoute.snapshot.url;
    this.selectedView = currentRoute[currentRoute.length - 1].path;

    const s0 = this.observer.observe(['(max-width: 1600px)']).subscribe((res) => {
      this.granularityType = res.matches ? 'select' : 'button';
    });

    const s1 = this.activatedRoute.queryParams.subscribe(params => {
      const timeInterval: Partial<TimeInterval> = {
        start: params['start'] ? moment(params['start']) : undefined,
        end: params['start'] ? moment(params['end']) : undefined,
        step: +params['step'], // convert to number
        stepUnit: params['stepunit'] as TimeUnit
      };

      this.dataService.updateTimeInterval(timeInterval);
    });

    const s2 = this.dataService.timeInterval.subscribe(timeInterval => {
      if (timeInterval[0] != this.timeInterval) {
        this.timeInterval = timeInterval[0];
        this.selectedGranularity = (timeInterval[0].stepUnit == 'month' && timeInterval[0].step == 3) ? Granularity.QUARTER : timeInterval[0].stepUnit;
      }
    });
    this.subscriptions.push(s0, s1, s2);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}