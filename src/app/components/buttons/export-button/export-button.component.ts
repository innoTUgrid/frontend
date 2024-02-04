import { Component, Input } from '@angular/core';
import { saveAs } from "file-saver";

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss']
})
export class ExportButtonComponent {
  @Input() dataLoader: () => string[][] = () => [];
  @Input() csvDelimitier: string = ';';
  @Input() fileName: string = 'export.csv';
  @Input() label: string = 'Export as CSV';

  export() {
    const csvArray = this.dataLoader();
    const csvString = csvArray.map((row) => row.join(this.csvDelimitier)).join('\r\n')
    var blob = new Blob([csvString], {type: 'text/csv' })
    saveAs(blob, this.fileName);
  }

}
