import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { PeCustomValidators } from '@pe/shared/custom-validators';

import { FormTranslationsService } from '../../../../services';
import { DIGIT_FORBIDDEN_PATTERN, SPECIAL_CHAR_FORBIDDEN_PATTERN } from "../../../../misc/constants";
import { ibanMaskFn, ibanUnmaskFn } from '../../utils';

@Component({
  selector: 'peb-edit-bank',
  templateUrl: './edit-bank.component.html',
  styleUrls: ['./edit-bank.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditBankComponent implements OnInit {
  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public bankForm: FormGroup = this.formBuilder.group({
    owner: ['', [Validators.required, Validators.pattern(DIGIT_FORBIDDEN_PATTERN)]],
    country: ['DE', [Validators.required]],
    city: ['', [Validators.required, Validators.pattern(DIGIT_FORBIDDEN_PATTERN)]],
    bankName: ['', [Validators.pattern(DIGIT_FORBIDDEN_PATTERN)]],
    bic: ['', [Validators.pattern(SPECIAL_CHAR_FORBIDDEN_PATTERN)]],
    iban: ['', [Validators.required, PeCustomValidators.ibanValidator]],
  });
  public countries: { value: string, label: string }[];
  private data: any;

  public readonly ibanMask = ibanMaskFn;
  public readonly ibanUnmask = ibanUnmaskFn;

  constructor(
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private localConstantsService: LocaleConstantsService,
    protected translateService: TranslateService,
    public formTranslationsService: FormTranslationsService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
    }
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
    this.getCountries();
    this.setOriginForm();
    this.formTranslationsService.formTranslationNamespace = 'form.create_form.bank.bankAccount';
  }

  public onSave() {
    if (this.bankForm.valid) {
      this.data['businessDetail'] = { bankAccount: this.bankForm.value };
      this.peOverlayRef.close({ data: this.data });
    }
  }

  public fieldErrorMessage(formControlName: string): string {
    const control = this.bankForm.get(formControlName);

    if (control.errors?.required) {
      return this.translateService.translate('common.forms.validations.required');
    }
    if (control.errors?.pattern) {
      return this.translateService.translate('form.create_form.errors.pattern');
    }
    if (control.errors?.incorrectIban) {
      return this.translateService.translate('form.create_form.errors.invalid_iban');
    }

    return null;
  }

  private setOriginForm() {
    const formData = this.overlayData.data.details?.bankAccount || {};
    this.bankForm.patchValue(formData);
  }

  private getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).forEach((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }
}
