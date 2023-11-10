import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutarkyKPIComponent } from './autarky-kpi.component';

describe('AutarkyKPIComponent', () => {
  let component: AutarkyKPIComponent;
  let fixture: ComponentFixture<AutarkyKPIComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AutarkyKPIComponent]
    });
    fixture = TestBed.createComponent(AutarkyKPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
