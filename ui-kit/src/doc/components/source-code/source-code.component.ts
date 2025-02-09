import { Component, ElementRef } from '@angular/core';
@Component({
  selector: 'source-code',
  templateUrl: 'source-code.component.html'
})
export class SourceCodeComponent {

  constructor(
    private elementRef: ElementRef<HTMLInputElement>
  ) {
  }

  // ngAfterViewInit() {
    // console.log('here');
    // this.elementRef.nativeElement.innerHTML = "";
  // }

  // ngAfterViewInit() {
    // this.content = Prism.highlight(this.rawContent.nativeElement.innerHTML, Prism.languages[this.language]);
  // }

}
