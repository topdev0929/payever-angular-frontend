import { Component } from '@angular/core';

@Component({
  selector: 'doc-layout-expandable-example',
  templateUrl: 'layout-expandable-example.component.html',
  styleUrls: ['layout-expandable-example.component.scss']
})
export class LayoutExpandableExampleDocComponent {

  isContentOpened: boolean = true;
  isCautionOpened: boolean = true;

  toggleContent(): void {
    this.isContentOpened = !this.isContentOpened;
  }

  toggleCaution(): void {
    this.isCautionOpened = !this.isCautionOpened;
  }
}
