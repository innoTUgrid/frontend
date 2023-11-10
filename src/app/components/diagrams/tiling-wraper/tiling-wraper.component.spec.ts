import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TilingWraperComponent } from './tiling-wraper.component';

describe('TilingWraperComponent', () => {
  let component: TilingWraperComponent;
  let fixture: ComponentFixture<TilingWraperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TilingWraperComponent]
    });
    fixture = TestBed.createComponent(TilingWraperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
