import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiWrapperComponent } from './kpi-wrapper.component';

describe('KpiWrapperComponent', () => {
  let component: KpiWrapperComponent;
  let fixture: ComponentFixture<KpiWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KpiWrapperComponent]
    });
    fixture = TestBed.createComponent(KpiWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
