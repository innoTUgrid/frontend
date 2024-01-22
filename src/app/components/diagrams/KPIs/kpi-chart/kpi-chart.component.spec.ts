import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiChartComponent } from './kpi-chart.component';

describe('KpiChartComponent', () => {
  let component: KpiChartComponent;
  let fixture: ComponentFixture<KpiChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KpiChartComponent]
    });
    fixture = TestBed.createComponent(KpiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
