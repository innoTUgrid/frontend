import { Component, OnInit,Input,OnChanges, ViewChild, inject } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { MathJaxService } from '@app/services/math-jax.service';

@Component({
  selector: 'mathjax',
  inputs:['content'],
  templateUrl: './mathjax.component.html',
})
export class MathjaxComponent {
  @ViewChild('mathParagraph') paragraphElement: any;
  @Input({ required: true }) mathString!: string;

  mathJaxService: MathJaxService = inject(MathJaxService);

  ngOnInit() {
    this.mathJaxService.getMathJaxLoadedPromise().then(() => {
      this.paragraphElement.nativeElement.innerHTML = this.mathString;
      this.mathJaxService.render(this.paragraphElement.nativeElement);
    });
  }

}