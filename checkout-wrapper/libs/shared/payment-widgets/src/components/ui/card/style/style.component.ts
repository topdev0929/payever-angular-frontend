import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'finexp-ui-card-style',
  template: '',
  styles: [`
    .pe-widget-card-modal {
      max-width: 540px !important;
      width: 100%;
    }
    .pe-widget-card-modal .mat-dialog-container {
      padding: 12px 12px 6px !important;
      background: #ffffff !important;
      position: relative !important;
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class UICardStyleComponent {
}
