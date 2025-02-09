import { Component, ChangeDetectionStrategy, Renderer2, OnInit, OnDestroy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-temporary-cdk-overlay-style-fix',
  template: '',
})
export class TemporaryCdkOverlayStyleFixComponent implements OnInit, OnDestroy {

  readonly sheetId: string = `pe-cdk-overlay-sheet-${Math.floor(Math.random() * 1000000)}`;
  dialogStyle: any = null;

  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.applyStyles();
  }

  ngOnDestroy(): void {
    this.removeStyles();
  }

  private removeStyles(): void {
    if (this.dialogStyle) {
      this.renderer.removeChild(document.head, this.dialogStyle);
    }
  }

  private applyStyles(): void {

    // As datepicker is attached to body as cdk-overlay-container - we can't wrap it into some root class.
    // So while wrapper is on page - we use that hack to force apply white theme without pe css color variables

    this.dialogStyle = this.renderer.createElement('style');
    this.renderer.setAttribute(this.dialogStyle, 'id', this.sheetId);
    // Must be 'pe-bootstrap' ! Not 'pe-bootstrap'
    this.dialogStyle.textContent = `
      .pe-bootstrap .checkout-cdk-overlay-container .mat-primary .mat-option {
        color: rgba(58,58,58,.85) !important;
        font-size: 12px;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-select-panel {
        background-color: #fff !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-dialog-container {
        color: rgba(0,0,0,.87) !important;
        background-color: #fff !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar {
        background-color: #fff !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-header {
        color: rgba(17,17,17,.85) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-period-button {
        color: rgba(17,17,17,.45) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-next-button,
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-previous-button {
        color: rgba(17,17,17,.85) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-next-button[disabled],
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-previous-button[disabled] {
        color: rgba(17,17,17,.2) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-table-header {
        color: rgba(17,17,17,.85) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-table-header .mat-calendar-table-header-divider:after {
        background-color: rgba(17,17,17,.2) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .pe-bootstrap .mat-calendar-body {
        color: rgba(17,17,17,.2) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-body-cell-content {
        color: rgba(17,17,17,.85) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar-body-selected {
        background: rgba(17,17,17,.1) !important;
      }
      .pe-bootstrap .checkout-cdk-overlay-container .mat-calendar .mat-calendar-body-disabled .mat-calendar-body-cell-content:not(.mat-calendar-body-selected) {
        color: rgba(17,17,17,.2) !important;
      }

      .pac-container{
        z-index: 110000 !important;
      }
    `;
    this.renderer.appendChild(document.head, this.dialogStyle);
  }
}
