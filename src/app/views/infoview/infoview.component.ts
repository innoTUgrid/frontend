import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-infoview',
    templateUrl: './infoview.component.html',
    styleUrls: ['./infoview.component.scss']
})
export class InfoviewComponent implements OnInit {

    pdfSrc = "assets/infoview.pdf";

    constructor() { }

    ngOnInit(): void {
        // Initialization logic goes here
    }
}
