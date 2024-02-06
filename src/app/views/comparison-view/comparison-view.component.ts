import {Component} from '@angular/core';
import * as moment from 'moment';
import { TimeInterval, TimeUnit } from '@app/types/time-series-data.model';

@Component({
  selector: 'app-comparison-view',
  templateUrl: './comparison-view.component.html',
  styleUrls: ['./comparison-view.component.scss'],
})
export class ComparisonViewComponent {
  yearlyTimeIterval: TimeInterval = {
    start: moment.utc(0),
    end: moment.utc().endOf('year'),
    stepUnit: TimeUnit.YEAR,
    step: 1,
  }
}
