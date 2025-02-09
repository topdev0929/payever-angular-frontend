import { Component, Input, Output, EventEmitter } from '@angular/core';

import { TranslateService } from '@pe/i18n';

@Component({
  selector: 'pe-info-box-confirm',
  templateUrl: 'info-box-confirm.component.html',
  styleUrls: ['info-box-confirm.component.scss'],
})
export class InfoBoxConfirmComponent {

  @Input() blurBackdrop = true;
  @Input() cancelButtonTitle: string = this.translateService.translate('ng_kit.dialog.action_buttons.no');
  @Input() confirmButtonTitle: string = this.translateService.translate('ng_kit.dialog.action_buttons.yes');
  @Input() icon = 'icon-alert-24';
  @Input() title: string;
  @Input() subtitle: string;

  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private translateService: TranslateService
  ) {
  }

  onCancelClick(): void {
    this.cancel.emit();
  }

  onConfirmClick(): void {
    this.confirm.emit();
  }
}
