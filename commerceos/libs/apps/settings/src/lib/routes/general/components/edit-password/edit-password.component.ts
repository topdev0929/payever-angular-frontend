import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { InputPasswordValidator } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n';
import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { ApiService, FormTranslationsService } from '../../../../services';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const repeatPassword = control.get('repeatPassword')?.value;

  return newPassword === repeatPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'peb-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditPasswordComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public isOldPasswordIncorrect = false;

  public passwordForm: FormGroup = this.formBuilder.group({
    currentPassword: [''],
    newPassword: [''],
    repeatPassword: [''],
    tfa: [''],
  }, { validators: passwordMatchValidator });

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public formTranslationsService: FormTranslationsService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.password';

    if (this.overlayData.data) {
      this.passwordForm.controls.tfa.setValue(this.overlayData.data.tfa);
    }

    this.passwordForm.get('currentPassword').valueChanges.subscribe(() => {
      this.isOldPasswordIncorrect = false;
    });

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onCheckValidity(): void {
    if (this.isPasswordUpdated) {
      const controls = this.passwordForm.controls;

      controls.currentPassword.setValidators([Validators.required, Validators.minLength(8)]);
      controls.currentPassword.updateValueAndValidity();

      controls.newPassword.setValidators([Validators.required, InputPasswordValidator.default]);
      controls.newPassword.updateValueAndValidity();

      controls.repeatPassword.setValidators([Validators.required]);
      controls.repeatPassword.updateValueAndValidity();

      this.passwordForm.addValidators(passwordMatchValidator)
      this.passwordForm.updateValueAndValidity();

      this.cdr.detectChanges();
    }

    if (this.passwordForm.valid) {
      this.onSave();
    }
  }

  private onSave(): void {
    if (this.isPasswordUpdated) {
      const newData = {
        oldPassword: this.passwordForm.controls.currentPassword.value,
        newPassword: this.passwordForm.controls.newPassword.value,
      };
      this.apiService.updatePassword(newData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => this.closeAndSave(),
          () => {
            this.isOldPasswordIncorrect = true;
            this.cdr.detectChanges();
          });
    } else {
      this.closeAndSave();
    }
  }

  private closeAndSave() {
    this.peOverlayRef.close({ data: { tfa: this.passwordForm.controls.tfa.value } });
    this.passwordForm.reset();
  }

  private get isPasswordUpdated(): boolean {
    const controls = this.passwordForm.controls;

    return controls.currentPassword.value || controls.newPassword.value || controls.repeatPassword.value;
  }

  public get currentPasswordErrorMessage(): string {
    const controlErrors = this.passwordForm.get('currentPassword').errors;

    if (this.isOldPasswordIncorrect) {
      const label = this.translateService.translate('form.create_form.password.current_password.label');
      const error = this.translateService.translate('form.create_form.errors.incorrect_pass');
      return `${label} ${error}`;
    }

    if (controlErrors?.required) {
      return this.translateService.translate('common.forms.validations.required');
    }

    if (controlErrors?.minlength) {
      return this.translateService.translate('forms.error.validator.password.minlength');
    }

    return null;
  }

  public get newPasswordErrorMessage(): string {
    const controlErrors = this.passwordForm.get('newPassword').errors;

    if (controlErrors?.required) {
      return this.translateService.translate('common.forms.validations.required');
    }

    return this.translateService.translate('form.create_form.errors.password');
  }

  public get repeatPasswordErrorMessage(): string {
    const controlErrors = this.passwordForm.get('repeatPassword').errors;

    if (controlErrors?.required) {
      return this.translateService.translate('common.forms.validations.required');
    }

    if (this.passwordForm.errors?.passwordMismatch) {
      return this.translateService.translate('form.create_form.errors.password_mismatch');
    }

    return null;
  }
}
