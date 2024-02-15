import { Component, Input, inject } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { DataService } from '@app/services/data.service';
import { TimeInterval, TimeUnit } from '@app/types/time-series-data.model';
import moment, { Moment } from 'moment';
import { Subscription } from 'rxjs';

function middleDate(timeInterval: TimeInterval) {
  return moment.utc((timeInterval.start.valueOf() + timeInterval.end.valueOf()) / 2)
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',

  },
};

@Component({
  selector: 'app-comparision-bar',
  templateUrl: './comparision-bar.component.html',
  styleUrls: ['./comparision-bar.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ComparisionBarComponent {
  dataService: DataService = inject(DataService);

  @Input()
  additionalTimeIntervals: TimeInterval[] = [];
  @Input() showArrow = false

  firstYear = new FormControl(moment.utc(moment().year().toString()));
  secondYear = new FormControl(moment.utc(moment().year().toString()));
  isDatepickerOpen = false;

  get maxTimeInterval() {
    return this.dataService.getMaximumDatasetTimeInterval();
  }

  get minDate() {
    return this.maxTimeInterval.start;
  }

  get maxDate() {
    return this.maxTimeInterval.end;
  }

  setYear(normalizedYear: Moment, year: string) {
    if (year === 'first') {
      const ctrlValue = this.firstYear.value;
      if (ctrlValue) {
        ctrlValue.year(normalizedYear.year());
        this.firstYear.setValue(ctrlValue);
      }
    } else {
      const ctrlValue = this.secondYear.value;
      if (ctrlValue) {
        ctrlValue.year(normalizedYear.year());
        this.secondYear.setValue(ctrlValue);
      }
    }
  }

  updateTimeInterval() {
    if (this.firstYear.value && this.secondYear.value) {
      this.dataService.timeInterval.next([
        this.toTimeInterval(this.firstYear.value),
        this.toTimeInterval(this.secondYear.value),
        ...this.additionalTimeIntervals,
      ]);
    }
  }

  chosenYearHandler(normalizedYear: Moment, year: string, datepicker?: MatDatepicker<Moment>) {
    this.setYear(normalizedYear, year)
  
    const firstYearValue = this.firstYear.value?.year() || 0;
    const secondYearValue = this.secondYear.value?.year() || 0;
  
    if (firstYearValue > secondYearValue) {
      const temp = this.firstYear.value;
      this.firstYear.setValue(this.secondYear.value);
      this.secondYear.setValue(temp);
    }
  
    if (datepicker) datepicker.close();
  
    this.updateTimeInterval()
  }
  

  onDatepickerOpened() {
    this.isDatepickerOpen = true;
  }

  toTimeInterval(year: Moment) {
    const newIntervals = {
      start: moment.utc(year.startOf('year')),
      end: moment.utc(year.endOf('year')),
      step: 1,
      stepUnit: TimeUnit.MONTH
    }
    return newIntervals
  }

  subscriptions: Subscription[] = [];

  ngOnInit() {
    this.subscriptions.push(this.dataService.timeInterval.subscribe((timeIntervals: TimeInterval[]) => {
      if (timeIntervals.length > 0) this.firstYear.setValue(middleDate(timeIntervals[0]))
      if (timeIntervals.length > 1) this.secondYear.setValue(middleDate(timeIntervals[1]))

      const currentTimeIntervals = this.dataService.timeInterval.getValue();
      if (this.secondYear.value && currentTimeIntervals.length < 2 + this.additionalTimeIntervals.length) {
        this.dataService.timeInterval.next([
          (currentTimeIntervals.length >= 1) ? this.toTimeInterval(currentTimeIntervals[0].start) : this.toTimeInterval(this.secondYear.value),
          this.toTimeInterval(this.secondYear.value),
          ...this.additionalTimeIntervals
        ])
      }
    }))
  }

  onDatepickerClosed() {
    this.isDatepickerOpen = false;

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = []
  }
}
