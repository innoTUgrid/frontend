import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableSmardComponent } from './data-table-smard.component';

describe('DataTableSmardComponent', () => {
  let component: DataTableSmardComponent;
  let fixture: ComponentFixture<DataTableSmardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTableSmardComponent]
    });
    fixture = TestBed.createComponent(DataTableSmardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
