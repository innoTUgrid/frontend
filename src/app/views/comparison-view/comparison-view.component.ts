import {Component, inject} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import * as moment from 'moment';
import * as _moment from 'moment';
import { Moment } from 'moment';
import { DataService } from '@app/services/data.service';
import { TimeInterval, TimeUnit } from '@app/types/time-series-data.model';
import { Subscription } from 'rxjs';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',

  },
};

@Component({
  selector: 'app-comparison-view',
  templateUrl: './comparison-view.component.html',
  styleUrls: ['./comparison-view.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class ComparisonViewComponent {
  dataService: DataService = inject(DataService);

  firstYear = new FormControl(moment('2019'));
  secondYear = new FormControl(moment('2019'));
  isDatepickerOpen = false;



  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>, year: string) {
    if(year == 'first'){
      const ctrlValue = this.firstYear.value;
      if(ctrlValue) {
        ctrlValue.year(normalizedYear.year());
        this.firstYear.setValue(ctrlValue);
      }
    }else{
      const ctrlValue = this.secondYear.value;
      if(ctrlValue) {
        ctrlValue.year(normalizedYear.year());
        this.secondYear.setValue(ctrlValue);
      }
    }
    datepicker.close();
  }

  onDatepickerOpened() {
    this.isDatepickerOpen = true;
  }

  toTimeInterval(year:Moment) {
    const newIntervals = {
      start: moment(year.startOf('year')),
      end: moment(year.endOf('year')),
      step: 1,
      stepUnit: TimeUnit.MONTH
    }
    return newIntervals
  }

  yearlyTimeIterval: TimeInterval = {
    start: moment('2018').endOf('year'),
    end: moment('2020').startOf('year'),
    stepUnit: TimeUnit.YEAR,
    step: 1,
  }

  subscriptions: Subscription[] = [];

  ngOnInit() {
    this.onDatepickerClosed()
  }

  onDatepickerClosed() {
    this.isDatepickerOpen = false;

    const currentTimeIntervals = this.dataService.timeInterval.getValue()
    if (this.secondYear.value && currentTimeIntervals.length < 3) {
      this.dataService.timeInterval.next([
        (currentTimeIntervals.length >= 1) ? this.toTimeInterval(currentTimeIntervals[0].start) : this.toTimeInterval(this.secondYear.value),
        this.toTimeInterval(this.secondYear.value),
        this.yearlyTimeIterval
      ])
    }

    this.subscriptions.push(this.dataService.timeInterval.subscribe((timeIntervals: TimeInterval[]) => {
      if (timeIntervals.length > 0) this.firstYear.setValue(timeIntervals[0].start)
      if (timeIntervals.length > 1) this.secondYear.setValue(timeIntervals[1].start)
    }))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


}
