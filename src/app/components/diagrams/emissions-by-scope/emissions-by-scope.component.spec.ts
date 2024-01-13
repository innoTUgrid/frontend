import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmissionsByScopeComponent } from './emissions-by-scope.component';

describe('EmissionsByScopeComponent', () => {
  let component: EmissionsByScopeComponent;
  let fixture: ComponentFixture<EmissionsByScopeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmissionsByScopeComponent]
    });
    fixture = TestBed.createComponent(EmissionsByScopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
