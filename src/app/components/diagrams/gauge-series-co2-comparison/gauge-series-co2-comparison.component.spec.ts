import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeSeriesCo2ComparisonComponent } from './gauge-series-co2-comparison.component';

describe('GaugeSeriesCo2ComparisonComponent', () => {
  let component: GaugeSeriesCo2ComparisonComponent;
  let fixture: ComponentFixture<GaugeSeriesCo2ComparisonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GaugeSeriesCo2ComparisonComponent]
    });
    fixture = TestBed.createComponent(GaugeSeriesCo2ComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
