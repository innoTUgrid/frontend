import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableConsumptionHouseBeckerComponent } from './data-table-consumption-house-becker.component';

describe('DataTableConsumptionHouseBeckerComponent', () => {
  let component: DataTableConsumptionHouseBeckerComponent;
  let fixture: ComponentFixture<DataTableConsumptionHouseBeckerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTableConsumptionHouseBeckerComponent]
    });
    fixture = TestBed.createComponent(DataTableConsumptionHouseBeckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
