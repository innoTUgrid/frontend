import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfConsumptionKPIComponent } from './self-consumption-kpi.component';

describe('SelfConsumptionKPIComponent', () => {
  let component: SelfConsumptionKPIComponent;
  let fixture: ComponentFixture<SelfConsumptionKPIComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelfConsumptionKPIComponent]
    });
    fixture = TestBed.createComponent(SelfConsumptionKPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
