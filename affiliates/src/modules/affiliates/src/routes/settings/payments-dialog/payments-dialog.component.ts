import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { PE_OVERLAY_DATA, PE_OVERLAY_CONFIG, PeOverlayWidgetService } from '@pe/overlay-widget';
import { AbstractComponentDirective } from '../../../misc/abstract.component';

@Component({
  selector: 'peb-payments-dialog',
  templateUrl: './payments-dialog.component.html',
  styleUrls: ['./payments-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPaymentsSettingComponent extends AbstractComponentDirective implements OnInit {
  dialogConfig = {
  };

  pickerData = [
    { label: 'ACH', value: { name: 'ACH', value: 'ACH' } },
    { label: 'Bank (Australia)', value: { name: 'Bank (Australia)', value: 'Bank (Australia)' } },
    { label: 'Bank (IBAN)', value: { name: 'Bank (IBAN)', value: 'Bank (IBAN)' } },
    { label: 'Bank (India)', value: { name: 'Bank (India)', value: 'Bank (India)' } },
  ];

  constructor(
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
    this.config.doneBtnCallback = () => {
      this.overlay.close();
    };
  }
  ngOnInit() {
  }
}
