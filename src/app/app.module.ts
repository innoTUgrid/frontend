import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCommonModule } from '@angular/material/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { KpiWrapperComponent } from './components/diagrams/KPIs/kpi-wrapper/kpi-wrapper/kpi-wrapper.component';
import { ProductionConsumptionDiagramComponent } from './components/diagrams/production-consumption-diagram/production-consumption-diagram/production-consumption-diagram.component';
import { EnergyMixDiagramComponent } from './components/diagrams/energy-mix-diagram/energy-mix-diagram/energy-mix-diagram.component';
import { AutarkyKPIComponent } from './components/diagrams/KPIs/autarky/autarky-kpi/autarky-kpi.component';
import { Co2SavingsKPIComponent } from './components/diagrams/KPIs/co2-savings/co2-savings-kpi/co2-savings-kpi.component';
import { CostSavingsKPIComponent } from './components/diagrams/KPIs/cost-savings/cost-savings-kpi/cost-savings-kpi.component';
import { SelfConsumptionKPIComponent } from './components/diagrams/KPIs/self-consumption/self-consumption-kpi/self-consumption-kpi.component';
import { TilingWraperComponent } from './components/diagrams/tiling-wraper/tiling-wraper.component';
import { NavbarComponent } from './components/navigation/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    KpiWrapperComponent,
    ProductionConsumptionDiagramComponent,
    EnergyMixDiagramComponent,
    AutarkyKPIComponent,
    Co2SavingsKPIComponent,
    CostSavingsKPIComponent,
    SelfConsumptionKPIComponent,
    TilingWraperComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCommonModule,
    MatSidenavModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
