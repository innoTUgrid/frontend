import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyConsumptionDiagramComponent } from './energy-consumption-diagram.component';

describe('ProductionConsumptionDiagramComponent', () => {
  let component: EnergyConsumptionDiagramComponent;
  let fixture: ComponentFixture<EnergyConsumptionDiagramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnergyConsumptionDiagramComponent]
    });
    fixture = TestBed.createComponent(EnergyConsumptionDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
