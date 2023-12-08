import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnergyFlowDiagramComponent } from './energy-flow-diagram.component';

describe('EnergyFlowDiagramComponent', () => {
    let component: EnergyFlowDiagramComponent;
    let fixture: ComponentFixture<EnergyFlowDiagramComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EnergyFlowDiagramComponent]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EnergyFlowDiagramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
