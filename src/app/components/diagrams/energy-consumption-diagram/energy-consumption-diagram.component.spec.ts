import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionConsumptionDiagramComponent } from './energy-consumption-diagram.component';

describe('ProductionConsumptionDiagramComponent', () => {
  let component: ProductionConsumptionDiagramComponent;
  let fixture: ComponentFixture<ProductionConsumptionDiagramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductionConsumptionDiagramComponent]
    });
    fixture = TestBed.createComponent(ProductionConsumptionDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
