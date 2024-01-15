import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisionBarComponent } from './comparision-bar.component';

describe('ComparisionBarComponent', () => {
  let component: ComparisionBarComponent;
  let fixture: ComponentFixture<ComparisionBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComparisionBarComponent]
    });
    fixture = TestBed.createComponent(ComparisionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
