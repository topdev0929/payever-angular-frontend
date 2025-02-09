import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporaryCdkOverlayStyleFixComponent } from './temporary-cdk-overlay-style-fix.component';

describe('TemporaryCdkOverlayStyleFixComponent', () => {

  let component: TemporaryCdkOverlayStyleFixComponent;
  let fixture: ComponentFixture<TemporaryCdkOverlayStyleFixComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TemporaryCdkOverlayStyleFixComponent,
      ],
    });

    fixture = TestBed.createComponent(TemporaryCdkOverlayStyleFixComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should applyStyles on init', () => {
      const applyStyles = jest.spyOn(component as any, 'applyStyles');
      component.ngOnInit();
      expect(applyStyles).toHaveBeenCalled();
    });
  });
  describe('ngOnDestroy', () => {
    it('should removeStyles on destroy', () => {
      const removeStyles = jest.spyOn(component as any, 'removeStyles');
      component.ngOnDestroy();
      expect(removeStyles).toHaveBeenCalled();
    });
  });

  describe('applyStyles', () => {
    it('should apply styles', () => {
      expect(component.dialogStyle).toBeNull();
      component['applyStyles']();

      expect(component.dialogStyle.textContent).toEqual(`
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
    `);
    });
  });
});
