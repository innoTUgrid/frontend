import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './views/overview/overview.component';
import { DatasetsComponent } from './views/datasets/datasets.component';
import { InfoviewComponent } from './views/infoview/infoview.component';
import { EnergyFlowViewComponent } from './views/energy-flow-view/energy-flow-view.component';
import { ReportingComponent } from './views/reporting/reporting/reporting.component'
import { ComparisonViewComponent } from './views/comparison-view/comparison-view.component';

const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'datasets', component: DatasetsComponent },
  { path: 'info', component:InfoviewComponent },
  { path: 'energyflow', component: EnergyFlowViewComponent },
  { path : 'reporting', component: ReportingComponent },
  { path: 'comparison', component: ComparisonViewComponent},
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
