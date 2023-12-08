import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoviewComponent } from './infoview.component';

describe('InfoviewComponent', () => {
    let component: InfoviewComponent;
    let fixture: ComponentFixture<InfoviewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoviewComponent]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
