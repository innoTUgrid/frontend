import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyMixDiagramComponent } from './energy-mix-diagram.component';

describe('EnergyMixDiagramComponent', () => {
  let component: EnergyMixDiagramComponent;
  let fixture: ComponentFixture<EnergyMixDiagramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnergyMixDiagramComponent]
    });
    fixture = TestBed.createComponent(EnergyMixDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
