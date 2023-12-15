import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyCo2EmissionsChartComponent } from './yearly-co2-emissions-chart.component';

describe('YearlyCo2EmissionsChartComponent', () => {
  let component: YearlyCo2EmissionsChartComponent;
  let fixture: ComponentFixture<YearlyCo2EmissionsChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YearlyCo2EmissionsChartComponent]
    });
    fixture = TestBed.createComponent(YearlyCo2EmissionsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
