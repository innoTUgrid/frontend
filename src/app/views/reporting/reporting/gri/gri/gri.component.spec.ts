import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GriComponent } from './gri.component';

describe('GriComponent', () => {
  let component: GriComponent;
  let fixture: ComponentFixture<GriComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GriComponent]
    });
    fixture = TestBed.createComponent(GriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
