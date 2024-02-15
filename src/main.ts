import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import HC_noData from 'highcharts/modules/no-data-to-display'
import SolidGauge from 'highcharts/modules/solid-gauge';
import HC_More from 'highcharts/highcharts-more';
import HC_sankey from 'highcharts/modules/sankey';
import * as Highcharts from 'highcharts/highstock';
import { AppModule } from './app/app.module';
import { injectApiUrl } from './env';

// TODO: this is a workaround to avoid having to rebuild the app when the api url changes
// the apiUrl is fetched from meta.json and injected into the environment, this may slow down the app start - but it should be fine for now
injectApiUrl().then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
});

HC_More(Highcharts);
HC_exporting(Highcharts);
HC_exportData(Highcharts);
HC_noData(Highcharts);
HC_sankey(Highcharts);
SolidGauge(Highcharts);

Highcharts.setOptions({
  chart:{
    style: {
      fontFamily: 'var(--highcharts-font-family)'
    }
  },
  title: {
    style: {
      fontSize: '1em',
      fontFamily: 'var(--highcharts-font-family)'
    }
  },
  lang: {
    thousandsSep: '.',
    decimalPoint: ','
    
  },
  tooltip: {
    valueDecimals: 2
  },
  exporting: {
    enabled: true,
    buttons: {
      contextButton: {
        menuItems: ['viewFullscreen', 'printChart', 'separator', 'downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'separator', 'downloadCSV', 'downloadXLS']
      }
    }
  },
  credits: {
    enabled: false
  },
})