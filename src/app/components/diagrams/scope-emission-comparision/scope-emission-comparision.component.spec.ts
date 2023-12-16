import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopeEmissionComparisionComponent } from './scope-emission-comparision.component';

describe('ScopeEmissionComparisionComponent', () => {
  let component: ScopeEmissionComparisionComponent;
  let fixture: ComponentFixture<ScopeEmissionComparisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScopeEmissionComparisionComponent]
    });
    fixture = TestBed.createComponent(ScopeEmissionComparisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
