import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DATE_LOCALE, MatCommonModule, MatOptionModule } from '@angular/material/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { OverviewComponent } from './views/overview/overview.component';
import { EnergyConsumptionDiagramComponent } from './components/diagrams/energy-consumption-diagram/energy-consumption-diagram.component';
import { EnergyMixDiagramComponent } from './components/diagrams/energy-mix-diagram/energy-mix-diagram/energy-mix-diagram.component';
import { AutarkyKPIComponent } from './components/diagrams/KPIs/autarky/autarky-kpi/autarky-kpi.component';
import { Co2SavingsKPIComponent } from './components/diagrams/KPIs/co2-savings/co2-savings-kpi/co2-savings-kpi.component';
import { CostSavingsKPIComponent } from './components/diagrams/KPIs/cost-savings/cost-savings-kpi/cost-savings-kpi.component';
import { SelfConsumptionKPIComponent } from './components/diagrams/KPIs/self-consumption/self-consumption-kpi/self-consumption-kpi.component';
import { HighchartsChartModule } from 'highcharts-angular';
import {MatCardModule} from '@angular/material/card'; 
import {MatButtonModule} from '@angular/material/button'; 
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MtxPopoverModule } from '@ng-matero/extensions/popover';
import { NavbarComponent } from './components/navigation/navbar.component';

import { DatasetsComponent } from './views/datasets/datasets.component';
import { MatTableModule } from '@angular/material/table';

import { PercentChartComponent } from './components/diagrams/KPIs/percent-chart/percent-chart.component';
import { SingleValueChartComponent } from './components/diagrams/KPIs/single-value-chart/single-value-chart.component';
import { ReportingComponent } from './views/reporting/reporting/reporting.component';
import { HttpClientModule } from '@angular/common/http';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { EnergyFlowViewComponent } from './views/energy-flow-view/energy-flow-view.component';
import { EnergyFlowDiagramComponent } from './components/diagrams/energy-flow-diagram/energy-flow-diagram.component';

import {MatGridListModule} from '@angular/material/grid-list';
import {TableBasicExample} from './views/reporting/reporting/gri/gri-table.component';


import { InfoviewComponent } from './views/infoview/infoview.component';
import { CommandBarComponent } from './components/command-bar/command-bar/command-bar.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import {MatDatepickerModule} from '@angular/material/datepicker';
 import {MatInputModule} from '@angular/material/input';
 import {MatFormFieldModule} from '@angular/material/form-field';
 import {MatNativeDateModule} from '@angular/material/core';
 import { MatSelectModule } from '@angular/material/select';
import { MtxGridModule } from '@ng-matero/extensions/grid';

import { FormsModule } from '@angular/forms';
import { ComparisonViewComponent } from './views/comparison-view/comparison-view.component';

import { ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { EmissionsComparisonColumnChartComponent } from './components/diagrams/emissions-comparison-column-chart/emissions-comparison-column-chart.component';
import { YearlyCo2EmissionsChartComponent } from './components/diagrams/yearly-co2-emissions-chart/yearly-co2-emissions-chart.component';
import { GaugeSeriesCo2ComparisonComponent } from './components/diagrams/gauge-series-co2-comparison/gauge-series-co2-comparison.component';
import { LayoutModule } from '@angular/cdk/layout';
import { DataTableComponent } from './components/data-table/data-table.component';
import { EmissionsByScopeComponent } from './components/diagrams/emissions-by-scope/emissions-by-scope.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    OverviewComponent,
    EnergyConsumptionDiagramComponent,
    EnergyMixDiagramComponent,
    AutarkyKPIComponent,
    Co2SavingsKPIComponent,
    CostSavingsKPIComponent,
    SelfConsumptionKPIComponent,

    DatasetsComponent,
    PercentChartComponent,
    SingleValueChartComponent,

    InfoviewComponent,
    EnergyFlowDiagramComponent,
    EnergyFlowViewComponent,
    CommandBarComponent,

    ReportingComponent,
    TableBasicExample,
    ComparisonViewComponent,
    EmissionsComparisonColumnChartComponent,
    YearlyCo2EmissionsChartComponent,
    GaugeSeriesCo2ComparisonComponent,
    DataTableComponent,
    EmissionsByScopeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCommonModule,
    MatSidenavModule,
    MatOptionModule,
    MatInputModule,
    HighchartsChartModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonToggleModule, 
    MtxPopoverModule,
    MatGridListModule,
    HttpClientModule,
    FormsModule,
    PdfViewerModule,
    LayoutModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MtxGridModule
  ],
  providers: [
     {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
