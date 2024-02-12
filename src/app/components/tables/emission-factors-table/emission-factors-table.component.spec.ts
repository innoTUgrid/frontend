import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmissionFactorsTableComponent } from './emission-factors-table.component';

describe('EmissionFactorsTableComponent', () => {
  let component: EmissionFactorsTableComponent;
  let fixture: ComponentFixture<EmissionFactorsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmissionFactorsTableComponent]
    });
    fixture = TestBed.createComponent(EmissionFactorsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
