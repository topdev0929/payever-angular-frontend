import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { EMAIL_ADDRESS_PATTERN } from "../../../../misc/constants";


@Component({
  selector: 'peb-edit-owner',
  templateUrl: './edit-owner.component.html',
  styles: [`
    .form-error {
      margin-top: 12px;
    }
  `],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditOwnerComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public ownerForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_ADDRESS_PATTERN)]],
  });

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public get errorMessage(): string | null {
    const fieldLabel = this.translateService.translate('form.create_form.email.label');

    if (this.ownerForm.get('email').errors.required) {
      return `${fieldLabel} ${this.translateService.translate('form.create_form.errors.is_require')}`;
    }

    if (this.ownerForm.get('email').errors.pattern) {
      return `${fieldLabel} ${this.translateService.translate('form.create_form.errors.email_pattern')}`;
    }

    return null;
  }

  public onSave(): void {
    if (this.ownerForm.valid) {
      this.peOverlayRef.close({ data: this.ownerForm.value });
    }
  }
}
