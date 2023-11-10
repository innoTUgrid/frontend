import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostSavingsKPIComponent } from './cost-savings-kpi.component';

describe('CostSavingsKPIComponent', () => {
  let component: CostSavingsKPIComponent;
  let fixture: ComponentFixture<CostSavingsKPIComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CostSavingsKPIComponent]
    });
    fixture = TestBed.createComponent(CostSavingsKPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
