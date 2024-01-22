import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoButtonComponent } from './info-button.component';

describe('InfoButtonComponent', () => {
  let component: InfoButtonComponent;
  let fixture: ComponentFixture<InfoButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoButtonComponent]
    });
    fixture = TestBed.createComponent(InfoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
