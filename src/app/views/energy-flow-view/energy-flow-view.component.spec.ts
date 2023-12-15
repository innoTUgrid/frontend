import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnergyFlowViewComponent } from './energy-flow-view.component';

describe('EnergyFlowViewComponent', () => {
    let component: EnergyFlowViewComponent;
    let fixture: ComponentFixture<EnergyFlowViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EnergyFlowViewComponent]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EnergyFlowViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
