import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandBarComponent } from './command-bar.component';

describe('CommandBarComponent', () => {
  let component: CommandBarComponent;
  let fixture: ComponentFixture<CommandBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommandBarComponent]
    });
    fixture = TestBed.createComponent(CommandBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
