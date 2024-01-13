import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display'
import SolidGauge from 'highcharts/modules/solid-gauge';
import HC_More from 'highcharts/highcharts-more';
import * as Highcharts from 'highcharts/highstock';
import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

HC_More(Highcharts);
HC_exporting(Highcharts);
HC_exportData(Highcharts);
HC_noData(Highcharts);
SolidGauge(Highcharts);

Highcharts.setOptions({
  lang: {
    thousandsSep: '.'
  }
})