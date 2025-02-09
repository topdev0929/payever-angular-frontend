import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';

import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PeOverlayConfig, PeOverlayRef } from '@pe/overlay-widget';

import { FormSchemeModalInterface } from '../../interfaces';
import { ScreenTypeStylesService } from '../../services/screen-type.service';
import { StyleModalComponent } from '../style-modal/style-modal.component';

@Component({
  selector: 'pe-style-modal-item',
  templateUrl: './style-modal-item.component.html',
  styleUrls: ['./style-modal-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleModalItemComponent {
  @Input() parentForm: FormGroup;
  @Input() modal: FormSchemeModalInterface;

  dialogRef: PeOverlayRef;

  constructor(
    private overlayService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private screenTypeStylesService: ScreenTypeStylesService,
  ) { }

  openDialog(modal: FormSchemeModalInterface): void {
    const parentForm: FormGroup = cloneDeep(this.parentForm);

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-modal',
      backdropClick: () => {},
      data: {
        parentForm,
        controls: modal.controls,
        screenTypeStylesService: this.screenTypeStylesService,
      },
      headerConfig: {
        title: this.translateService.translate(modal.titleKey),
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.dialogRef.close();
        },
        doneBtnCallback: () => {
          this.parentForm.patchValue(parentForm.value);
          this.dialogRef.close();
        },
        doneBtnTitle: this.translateService.translate('actions.done'),
      },
      component: StyleModalComponent,
    };

    this.dialogRef = this.overlayService.open(config);
  }
}
