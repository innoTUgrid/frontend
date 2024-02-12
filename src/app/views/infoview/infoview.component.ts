import { Component, OnInit, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { EmissionFactorsResult } from '@app/types/api-result.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-infoview',
    templateUrl: './infoview.component.html',
    styleUrls: ['./infoview.component.scss']
})
export class InfoviewComponent implements OnInit {

    dataService: DataService = inject(DataService);
    emissionFactors: EmissionFactorsResult[] = [];

    constructor() {}

    get emissionFactorNames(): string {
        return [...new Set(this.emissionFactors.map(emissionFactor => emissionFactor.source))].join(', ');
    }

    subscriptions: Subscription[] = [];
    ngOnInit(): void {
        this.subscriptions.push(this.dataService.emissionFactors.subscribe(
            (emissionFactors: EmissionFactorsResult[]|undefined) => {
                if (emissionFactors) {
                    this.emissionFactors = emissionFactors;
                }
            }
        ))
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
        this.subscriptions = [];
    }
}
