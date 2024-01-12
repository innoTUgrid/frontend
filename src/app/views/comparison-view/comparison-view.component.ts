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
import { TimeUnit } from '@app/types/time-series-data.model';

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
    return {
      start: year.startOf('year'),
      end: year.endOf('year'),
      step: 1,
      stepUnit: TimeUnit.MONTH
    }
  }

  onDatepickerClosed() {
    this.isDatepickerOpen = false;

    
    this.dataService.updateTimeIntervalComparision(
      (this.firstYear.value) ? this.toTimeInterval(this.firstYear.value) : undefined,
      (this.secondYear.value) ? this.toTimeInterval(this.secondYear.value) : undefined
    )
  }


}
