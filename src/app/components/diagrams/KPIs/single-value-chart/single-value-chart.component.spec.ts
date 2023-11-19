import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleValueChartComponent } from './single-value-chart.component';

describe('SingleValueChartComponent', () => {
    let component: SingleValueChartComponent;
    let fixture: ComponentFixture<SingleValueChartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ SingleValueChartComponent ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleValueChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Add more tests here
});