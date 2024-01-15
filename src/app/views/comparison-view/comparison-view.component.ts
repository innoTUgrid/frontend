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
  yearlyTimeIterval: TimeInterval = {
    start: moment('2018').startOf('year'),
    end: moment('2020').endOf('year'),
    stepUnit: TimeUnit.YEAR,
    step: 1,
  }
}
