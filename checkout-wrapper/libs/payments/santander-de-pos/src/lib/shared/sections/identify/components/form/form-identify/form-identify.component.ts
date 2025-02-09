import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { SelectSnapshot, ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, ReplaySubject, defer, merge, of } from 'rxjs';
import { catchError, map, startWith, take, takeUntil, tap } from 'rxjs/operators';

import {
  ANALYTICS_FORM_SETTINGS,
  AnalyticActionEnum,
  AnalyticFormStatusEnum,
  AnalyticsFormService,
} from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { COUNTRY_CODE, EXCLUDE_ANALYZE_DOCUMENTS } from '@pe/checkout/santander-de-pos/settings';
import {
  DocsManagerService,
  SantanderDePosFlowService,
  FormOptionsInterface,
  PERSON_TYPE,
  PersonalFormValue,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, ParamsState, PatchFormState, PaymentState, StepsState } from '@pe/checkout/store';
import {
  AddressInterface,
  AnalyzedDocumentsData,
  AnalyzeDocument,
  FormOptionInterface,
  SalutationEnum,
  SectionType,
} from '@pe/checkout/types';
import { extractStreetNameAndNumber } from '@pe/checkout/utils/address';
import { PeDestroyService } from '@pe/destroy';

import { BILLING_ADDRESS_SETTINGS } from '../../../../../../settings';

const ANALYTICS_FORM_NAME = 'FORM_PAYMENT_IDENTIFICATION';

enum Gender {
  Male = 'male',
  Female = 'female',
}

const MASK_NATIONALITIES = ['DE', 'NL'];

@Component({
  selector: 'santander-de-pos-form-identify',
  templateUrl: './form-identify.component.html',
  styleUrls: ['./form-identify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: ANALYTICS_FORM_NAME,
      },
    },
  ],
})
export class FormIdentifyComponent extends CompositeForm<PersonalFormValue> implements OnInit {
  @ViewSelectSnapshot(ParamsState.editMode) protected editMode: boolean;

  @SelectSnapshot(ParamsState.merchantMode) protected merchantMode: boolean;
  @SelectSnapshot(FlowState.address) protected address: AddressInterface;
  @SelectSnapshot(FlowState.flowId) protected flowId: string;

  private store = this.injector.get(Store);
  private personType = this.injector.get(PERSON_TYPE);
  private cdr = this.injector.get(ChangeDetectorRef);
  private santanderDePosFlowService = this.injector.get(SantanderDePosFlowService);
  private docsManagerService = this.injector.get(DocsManagerService);
  private analyticsFormService = this.injector.get(AnalyticsFormService);

  @Input() businessId: string;

  @Input() options: FormOptionsInterface;

  @Input() isSubmitted = false;

  @Input() isExpandAll = false;

  @Input() set isStepEditVisible(visible: boolean) {
    this.analyticsFormService.emitEventFormItself(
      ANALYTICS_FORM_NAME,
      visible ? AnalyticFormStatusEnum.OPEN : AnalyticFormStatusEnum.CLOSED
    );
  }

  @Output() continue = new EventEmitter<void>();

  @Output() onSaveFormDataToStorage = new EventEmitter<string[]>();

  private readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  public readonly paymentForm: FormValue = this.store
    .selectSnapshot(PaymentState.form);

  get addressFormData() {
    return this.paymentForm?.[this.personType]?.addressForm;
  }

  public readonly addressForm = this.fb.group({
    salutation: [this.addressFormData?.salutation ?? null],
    firstName: [this.addressFormData?.firstName ?? null],
    lastName: [this.addressFormData?.lastName ?? null],
    country: [this.addressFormData?.country ?? null],
    city: [this.addressFormData?.city ?? null],
    zipCode: [this.addressFormData?.zipCode ?? null],
    street: [this.addressFormData?.street ?? null],
    streetName: [this.addressFormData?.streetName ?? null],
    streetNumber: [this.addressFormData?.streetNumber ?? null],
  });

  public readonly formGroup = this.fb.group({
    typeOfIdentification: [null],
    identificationNumber: [null],
    identificationPlaceOfIssue: [null],
    identificationDateOfIssue: [null],
    identificationDateOfExpiry: [null],
    identificationIssuingAuthority: [null],
    personalDateOfBirth: [null],
    personalNationality: [null],
    personalPlaceOfBirth: [null],
    personalBirthName: [null],
    _idPassed: this.fb.control<boolean>(
      this.store.selectSnapshot(ParamsState)?.editMode,
      Validators.requiredTrue
    ),
    _docsMarkAsUploaded: [null],
    _docsOtherType: [null],
  });

  protected readonly translates = {
    pleaseProvideDocsMerchant: $localize`:@@payment-santander-de-pos.inquiry.identify.pleaseProvideDocsMerchant:`,
    pleaseProvideDocs: $localize`:@@payment-santander-de-pos.inquiry.identify.pleaseProvideDocs:`,
  };


  public filesReady = false;
  public isUploadingFiles$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private checkIfPickedFiles$ = new ReplaySubject();
  private readonly stepOptions = this.store.selectSnapshot(StepsState.getStepOptions)(SectionType.Ocr);

  public readonly isSkipButton$ = this.checkIfPickedFiles$.pipe(
    map(() => {
      const docs = this.docsManagerService.getDocuments(this.flowId, this.personType, 'IDENTIFICATION') ?? [];
      const isPickedFiles = !!docs.length;

      return !this.filesReady && !this.editMode && !isPickedFiles
        && (this.stepOptions?.skipButton);
    }),
    catchError(() => of(false)),
  );

  public get isShowSavedSign(): boolean {
    return this.isExpandAll && this.formGroup.get('_idPassed').value && this.filesReady;
  }

  public get idPassed(): boolean {
    return this.formGroup.get('_idPassed').value;
  }

  public get docsMarkAsUploadedControl(): FormControl<boolean> {
    return this.formGroup.get('_docsMarkAsUploaded') as FormControl<boolean>;
  }

  public readonly idType$ = defer(() => this.formGroup.get('typeOfIdentification').valueChanges.pipe(
    startWith(this.formGroup.get('typeOfIdentification').value),
  ));

  public readonly docsOtherType$ = defer(() => this.formGroup.get('_docsOtherType').valueChanges.pipe(
    startWith(this.formGroup.get('_docsOtherType').value),
  ));

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      'profile-badge',
      'profile-badge2',
      'shield-checked',
    ], null, this.customElementService.shadowRoot);

    if (this.formGroup.get('_docsOtherType')) {
      this.formGroup.get('_idPassed').setValue(false);
    }

    const addressChanges$ = this.addressForm.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState({
          [this.personType]: {
            ...this.paymentForm?.[this.personType],
            addressForm: value,
          },
        }));
      }),
    );

    const identifyFormChanges$ = this.formGroup.valueChanges.pipe(
      tap((value) => {
        this.store.dispatch(new PatchFormState({
          [this.personType]: {
            ...this.paymentForm?.[this.personType],
            personalForm: value,
          },
        }));
      }),
    );

    merge(
      addressChanges$,
      identifyFormChanges$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  skip() {
    this.formGroup.get('_idPassed').setValue(true);
    this.continue.emit();
  }

  public onContinue(): void {
    if (this.formGroup.get('_idPassed').value) {
      this.continue.emit();

      return;
    }

    const pickedDocs: AnalyzeDocument[] =
      this.docsManagerService.getDocuments(this.flowId, this.personType, 'IDENTIFICATION')
        .reduce((acc, doc) => [
          ...acc,
          ...(!EXCLUDE_ANALYZE_DOCUMENTS.includes(doc.type) ? [{ content: doc.base64, type: doc.type }] : []),
        ], []);

    this.isUploadingFiles$.next(true);

    /*
    this is required if you have selected all pdf files in edit mode;
    pdf files are just a stub, we don't send them;
    */

    if (!pickedDocs.length) {
      if (this.editMode) {
        this.formGroup.get('_idPassed').setValue(true);
        this.isUploadingFiles$.next(false);

        return;
      }

      this.continue.emit();

      return;
    }

    this.santanderDePosFlowService.analyzeDocuments(pickedDocs).pipe(
      take(1),
      tap((data) => {
        this.formGroup.patchValue({
          _idPassed: true,
          personalBirthName: data.person.nameAtBirth,
          identificationDateOfExpiry: data.idDocument.identificationDateOfExpiry,
          identificationDateOfIssue: data.idDocument.identificationDateOfIssue,
          identificationIssuingAuthority: data.idDocument.identificationIssuingAuthority,
          identificationNumber: this.documentIdMask(
            data.idDocument.identificationNumber,
            data.person.nationality,
          ),
          identificationPlaceOfIssue: data.idDocument.identificationIssuingAuthority,
          personalNationality: this.clearFormValue(
            data.person.nationality, this.options.nationalities
          ),
          personalDateOfBirth: data.person.dateOfBirth,
          personalPlaceOfBirth: data.person.placeOfBirth,
        });


        this.addressForm.patchValue(this.mapOCRAddress(data));

        this.isUploadingFiles$.next(false);

        this.continue.emit();
      }),
      catchError(() => {
        this.isUploadingFiles$.next(false);
        this.continue.emit();

        return EMPTY;
      }),
    ).subscribe();
  }

  public onFilesReady(filesReady: boolean): void {
    this.filesReady = filesReady;
    this.checkIfPickedFiles$.next();
  }

  public onSendDocsRequired(sendDocsRequired: boolean): void {
    sendDocsRequired && this.formGroup.get('_idPassed').setValue(!sendDocsRequired);
    this.cdr.markForCheck();
  }

  public changeIdType(type: string): void {
    this.analyticsFormService.emitEventForm(ANALYTICS_FORM_NAME, {
      field: 'Type of identification',
      action: AnalyticActionEnum.CHANGE,
    });

    this.formGroup.get('typeOfIdentification').setValue(type);
  }

  public changeOtherType(type: string): void {
    this.analyticsFormService.emitEventForm(ANALYTICS_FORM_NAME, {
      field: 'Type of other documents',
      action: AnalyticActionEnum.CHANGE,
    });

    this.formGroup.get('_docsOtherType').setValue(type);
  }

  private mapOCRAddress(data: AnalyzedDocumentsData): typeof this.addressForm.value {
    const country = data.person.nationality?.toUpperCase() === COUNTRY_CODE
      ? this.clearFormValue(data.person.nationality, this.options.nationalities) as string
      : '';
    const postalCodePattern = new RegExp(BILLING_ADDRESS_SETTINGS.postalCodePattern);

    return {
      salutation: this.getSalutation(data.person.sex),
      firstName: data.person.firstName,
      lastName: data.person.lastName,
      country,
      city: data.person.city,
      ...postalCodePattern.test(data.person.zip)
        ? { zipCode: data.person.zip }
        : {},
      street: data.person.street,
      streetName: this.extractStreetNameAndNumber(data)[0],
      streetNumber: this.extractStreetNameAndNumber(data)[1],
    };
  }

  private extractStreetNameAndNumber(analyzeData: AnalyzedDocumentsData): string[] {
    if (analyzeData.person.streetNo) {
      return [analyzeData.person.street, analyzeData.person.streetNo];
    }

    // Sometimes it's retuned as:
    //  street: "Heidestrasse 17"
    //  streetNo: null
    return extractStreetNameAndNumber(analyzeData.person.street);
  }

  private documentIdMask = (documentId: string, country: string) => {
    if (!documentId) {
      return documentId;
    }

    const nationality = country ? String(country).toUpperCase() : null;
    if (MASK_NATIONALITIES.includes(nationality)) {
      return String(documentId).replace(/O/gi, '0');
    }

    return documentId;
  };

  private clearFormValue(value: string, options: FormOptionInterface[]): string | number | boolean {
    const upper = value ? String(value).toUpperCase() : null;
    const found = options.find(a => String(a?.value).toUpperCase() === upper);

    return found?.value;
  }

  private getSalutation(sex: string): string {
    if (sex === Gender.Male) {
      return SalutationEnum.SALUTATION_MR;
    }

    if (sex === Gender.Female) {
      return SalutationEnum.SALUTATION_MRS;
    }

    return '';
  }
}
