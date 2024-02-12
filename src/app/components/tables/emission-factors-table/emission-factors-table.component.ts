import { Component, Input, inject } from '@angular/core';
import { ChartService } from '@app/services/chart.service';
import { DataService } from '@app/services/data.service';
import { ThemeService } from '@app/services/theme.service';
import { EmissionFactorsResult } from '@app/types/api-result.model';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { MtxPopover } from '@ng-matero/extensions/popover';

@Component({
  selector: 'app-emission-factors-table',
  templateUrl: './emission-factors-table.component.html',
  styleUrls: ['./emission-factors-table.component.scss']
})
export class EmissionFactorsTableComponent {
  dataService: DataService = inject(DataService);
  chartService: ChartService = inject(ChartService);
  themeService: ThemeService = inject(ThemeService);
  readonly id = "EmisionFactorsTable." + Math.random().toString(36).substring(7);

  @Input({required: true}) popover?: MtxPopover;

  @Input() title?: string;

  columns: MtxGridColumn[] = [
      { header: 'Carrier', field: 'carrier' },
      { header: 'Factor', field: 'factor', type: 'number' },
      { header: 'Unit', field: 'unit' },
      { header: 'Source', field: 'source' },
      { header: 'Source URL', field: 'source_url' }
    ];

  data: EmissionFactorsResult[] = []

  toCSVArray() {
    const columns = [...this.columns]
    const csvArray = []

    // if header is typeof string
    const header: string[] = columns.map((column) => (column.header) ? column.header.toString() : '')
    csvArray.push(header)

    const data = this.data.map((emissionFactor: EmissionFactorsResult) => {
      return [emissionFactor.carrier, emissionFactor.factor.toString(), emissionFactor.unit, emissionFactor.source, emissionFactor.source_url]
    })
    csvArray.push(...data)

    return csvArray
  }

  subsciptions: any[] = []
  ngOnInit() {
    const s = this.dataService.emissionFactors.subscribe((data) => {
      this.data = data
    })

    this.subsciptions.push(s)
  }

  ngOnDestroy() {
    this.subsciptions.forEach((sub) => sub.unsubscribe())
  }
}
