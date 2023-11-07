import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './components/navigation/navbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCommonModule } from '@angular/material/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { TilingWrapperComponent } from './components/tiling-wrapper.component';
import { AutarykComponent } from './components/diagrams/KPIs/autarky.component';
import { CO2SavingsComponent } from './components/diagrams/KPIs/co2-savings.component';
import { CostSavingsComponent } from './components/diagrams/KPIs/cost-savings.component';
import { SelfConsumptionComponent } from './components/diagrams/KPIs/self-consumption.component';
import { DashboardComponent } from './views/dashboard.component';
import { KpiWrapperComponent } from './components/diagrams/KPIs/kpi-wrapper.component';
import { ProductionConsumptionDiagramComponent } from './components/diagrams/production-consumption-diagram.component';
import { EnergyMixDiagramComponent } from './components/diagrams/energy-mix-diagram.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    TilingWrapperComponent,
    AutarykComponent,
    CO2SavingsComponent,
    CostSavingsComponent,
    SelfConsumptionComponent,
    DashboardComponent,
    KpiWrapperComponent,
    ProductionConsumptionDiagramComponent,
    EnergyMixDiagramComponent
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
