import { Component, Input, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { DataService } from '@app/services/data.service';
import { TimeInterval, TimeUnit } from '@app/types/time-series-data.model';
import moment, { Moment } from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comparision-bar',
  templateUrl: './comparision-bar.component.html',
  styleUrls: ['./comparision-bar.component.scss']
})
export class ComparisionBarComponent {
  dataService: DataService = inject(DataService);

  @Input()
  additionalTimeIntervals: TimeInterval[] = [];

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

  subscriptions: Subscription[] = [];

  ngOnInit() {
    const currentTimeIntervals = this.dataService.timeInterval.value;
    if (this.secondYear.value && currentTimeIntervals.length < 3) {
      this.dataService.timeInterval.next([
        (currentTimeIntervals.length >= 1) ? this.toTimeInterval(currentTimeIntervals[0].start) : this.toTimeInterval(this.secondYear.value),
        this.toTimeInterval(this.secondYear.value),
        ...this.additionalTimeIntervals
      ])
    }

    this.subscriptions.push(this.dataService.timeInterval.subscribe((timeIntervals: TimeInterval[]) => {
      if (timeIntervals.length > 0) this.firstYear.setValue(timeIntervals[0].start)
      if (timeIntervals.length > 1) this.secondYear.setValue(timeIntervals[1].start)
    }))
  }

  onDatepickerClosed() {
    this.isDatepickerOpen = false;

    if (this.firstYear.value && this.secondYear.value) {
      this.dataService.timeInterval.next([
        this.toTimeInterval(this.firstYear.value),
        this.toTimeInterval(this.secondYear.value),
        ...this.additionalTimeIntervals
      ])
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
