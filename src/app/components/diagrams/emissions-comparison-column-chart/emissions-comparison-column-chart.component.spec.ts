import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmissionsComparisonColumnChartComponent } from './emissions-comparison-column-chart.component';

describe('EmissionsComparisonColumnChartComponent', () => {
  let component: EmissionsComparisonColumnChartComponent;
  let fixture: ComponentFixture<EmissionsComparisonColumnChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmissionsComparisonColumnChartComponent]
    });
    fixture = TestBed.createComponent(EmissionsComparisonColumnChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
