import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusEnergyComponent } from './campus-energy.component';

describe('CampusEnergyComponent', () => {
  let component: CampusEnergyComponent;
  let fixture: ComponentFixture<CampusEnergyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CampusEnergyComponent]
    });
    fixture = TestBed.createComponent(CampusEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
