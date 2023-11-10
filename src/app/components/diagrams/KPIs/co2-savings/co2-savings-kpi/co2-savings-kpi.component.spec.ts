import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2SavingsKPIComponent } from './co2-savings-kpi.component';

describe('Co2SavingsKPIComponent', () => {
  let component: Co2SavingsKPIComponent;
  let fixture: ComponentFixture<Co2SavingsKPIComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Co2SavingsKPIComponent]
    });
    fixture = TestBed.createComponent(Co2SavingsKPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
