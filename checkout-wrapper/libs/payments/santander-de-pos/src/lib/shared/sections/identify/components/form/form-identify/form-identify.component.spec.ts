import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { Store } from '@ngxs/store';
import { MockComponent } from 'ng-mocks';
import { from, of } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

import { AnalyticFormStatusEnum } from '@pe/checkout/analytics';
import {
  FlowState,
  PatchFormState,
  PatchPaymentResponse,
  SetFlow,
  SetSteps,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { AnalyzedDocumentsData, PaymentStatusEnum, SalutationEnum } from '@pe/checkout/types';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';

import {
  PaymentResponseWithStatus,
  flowWithPaymentOptionsFixture,
  paymentFormFixture,
} from '../../../../../../test/fixtures';
import {
  DocsManagerService,
  FormOptionsInterface,
  PERSON_TYPE,
  PersonTypeEnum,
  SantanderDePosFlowService,
} from '../../../../../common';
import { IdentifyModule } from '../../../identify.module';
import { FilePickerComponent } from '../files-picker';

import { FormIdentifyComponent } from './form-identify.component';

describe('santander-de-pos-form-identify', () => {
  const analyzedDocumentsData: AnalyzedDocumentsData = {
    idDocument: {
      identificationDateOfExpiry: 'identification-date-of-expiry',
      identificationDateOfIssue: 'identification-date-of-issue',
      identificationIssuingAuthority: 'identification-issuing-authority',
      identificationNumber: 'DE123456',
      mrzRaw: 'mrz-raw',
      name: 'name',
      typeOfIdentification: 'type-of-identification',
    },
    idDocumentValidity: {
      dateOfBirthValid: false,
      dateOfExpiryValid: false,
      mrzValid: false,
      valid: false,
    },
    person: {
      address: 'address',
      city: 'city',
      dateOfBirth: 'date-of-birth',
      firstName: 'first-name',
      lastName: 'last-name',
      nameAtBirth: 'name-at-birth',
      nationality: 'DE',
      placeOfBirth: 'place-of-birth',
      sex: 'male',
      street: 'street',
      streetNo: 'rtreet-no',
      title: 'title',
      zip: '12345',
    },
  };
  const options: FormOptionsInterface = {
    commodityGroups: [],
    conditions: [],
    professions: [],
    isDownPaymentAllowed: true,
    defaultCondition: '',
    nationalities: [
      {
        label: 'Germany',
        value: 'DE',
      },
    ],
    maritalStatuses: [],
    guarantorRelations: [],
    residentialTypes: [],
    identifications: [
      {
        label: 'name',
        value: 'name',
      },
      {
        label: 'passport',
        value: 'PASSPORT',
      },
    ],
  };
  let store: Store;

  let component: FormIdentifyComponent;
  let fixture: ComponentFixture<FormIdentifyComponent>;
  let loader: HarnessLoader;
  let formGroup: InstanceType<typeof FormIdentifyComponent>['formGroup'];
  let addressForm: InstanceType<typeof FormIdentifyComponent>['addressForm'];
  const PersonType = PersonTypeEnum.Customer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        IdentifyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ProgressButtonContentComponent,
        SantanderDePosFlowService,
        {
          provide: PERSON_TYPE,
          useValue: PersonType,
        },
        { provide: NgControl, useValue: new FormControl() },
      ],
      declarations: [
        FormIdentifyComponent,
        ProgressButtonContentComponent,
        MockComponent(FilePickerComponent),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetSteps([]));
    const paymentResponse = PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_ACCEPTED, null,
    );
    store.dispatch(new PatchPaymentResponse(paymentResponse));
    fixture = TestBed.createComponent(FormIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    formGroup = component.formGroup;
    addressForm = component.addressForm;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });


  describe('component', () => {
    const checkFilesPickerInput = ({ options, identificationType }: {
      options?: FormOptionsInterface
      businessId?: string,
      identificationType?: string,
    }) => {
      fixture.detectChanges();
      const { child: filePicker } = QueryChildByDirective(fixture, FilePickerComponent);
      options && expect(filePicker.nodeFormOptions).toEqual(options);
      identificationType && expect(filePicker.identificationType).toEqual(identificationType);
    };

    it('should load icons on create', () => {
      const mockLoadIcons = jest.fn();
      (window as any).PayeverStatic = {
        SvgIconsLoader: {
          loadIcons: mockLoadIcons,
        },
      };
      fixture.destroy();
      fixture = TestBed.createComponent(FormIdentifyComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(mockLoadIcons).toHaveBeenCalledWith(
        [
          'profile-badge',
          'profile-badge2',
          'shield-checked',
        ],
        null,
        component['customElementService'].shadowRoot,
      );
    });

    it('should set default values to addressForm if addressFormData null', () => {
      jest.spyOn(component, 'addressFormData', 'get').mockReturnValue(null);
      component.ngOnInit();
      expect(addressForm.value).toMatchObject({
        salutation: null,
        firstName: null,
        lastName: null,
        country: null,
        city: null,
        zipCode: null,
        street: null,
        streetName: null,
        streetNumber: null,
      });
    });

    it('should grab addressFormData values from store ', () => {
      store.dispatch(new PatchFormState(paymentFormFixture()));
      fixture.destroy();
      fixture = TestBed.createComponent(FormIdentifyComponent);
      component = fixture.componentInstance;

      const addressFormData = paymentFormFixture()[PersonType].addressForm;
      expect(component.addressForm.value).toMatchObject({
        salutation: addressFormData.salutation,
        firstName: addressFormData.firstName,
        lastName: addressFormData.lastName,
        country: addressFormData.country,
        city: addressFormData.city,
        zipCode: addressFormData.zipCode,
        street: addressFormData.street,
        streetName: addressFormData.streetName,
        streetNumber: addressFormData.streetNumber,
      });
    });

    it('should initiate filesPicker', () => {
      const businessId = 'business-id';
      fixture.componentRef.setInput('options', options);
      fixture.componentRef.setInput('businessId', businessId);
      checkFilesPickerInput({ options, businessId });
    });

    it('should initiate filesPicker with identificationType', () => {
      const changeIdType = jest.spyOn(component, 'changeIdType');
      const { childEl } = QueryChildByDirective(fixture, FilePickerComponent);
      childEl.triggerEventHandler('changeIdentificationType', 'PASSPORT');
      expect(changeIdType).toHaveBeenCalledWith('PASSPORT');
      checkFilesPickerInput({ identificationType: 'PASSPORT' });
    });

    it('should set filesReady', () => {
      const { childEl } = QueryChildByDirective(fixture, FilePickerComponent);
      expect(component.filesReady).toBe(false);
      childEl.triggerEventHandler('filesReady', true);
      expect(component.filesReady).toBe(true);
    });

    it('should set idPassed', (done) => {
      const flowId = store.selectSnapshot(FlowState.flowId);
      const onContinue = jest.spyOn(component, 'onContinue');
      const { childEl } = QueryChildByDirective(fixture, FilePickerComponent);
      childEl.triggerEventHandler('filesReady', true);
      fixture.componentRef.setInput('options', options);

      expect(component.idPassed).toBeFalsy();
      childEl.triggerEventHandler('sendDocsRequired', true);
      expect(component.idPassed).toBe(false);

      const getDocuments = jest.spyOn(DocsManagerService.prototype, 'getDocuments').mockReturnValue([
        {
          type: 'png',
          filename: 'file.png',
          base64: 'base64',
          documentType: 'IDENTIFICATION',
        },
      ]);
      const analyzeDocuments = jest.spyOn(SantanderDePosFlowService.prototype, 'analyzeDocuments')
        .mockReturnValue(of(analyzedDocumentsData));

      from(loader.getHarness(MatButtonHarness)).pipe(
        delayWhen(b => from(b.isDisabled()).pipe(
          tap(disabled => expect(disabled).toBeFalsy()),
        )),
        tap(b => expect(b).toBeTruthy()),
        switchMap(b => b.click()),
        tap(() => {
          expect(onContinue).toHaveBeenCalled();
          expect(getDocuments).toHaveBeenCalledWith(flowId, PersonType, 'IDENTIFICATION');
          expect(analyzeDocuments).toHaveBeenCalledWith([
            {
              type: 'png',
              content: 'base64',
            },
          ]);
          expect(component.idPassed).toBe(true);
          done();
        }),
      ).subscribe();
    });

    it('onContinue', (done) => {
      const flowId = store.selectSnapshot(FlowState.flowId);
      const onContinue = jest.spyOn(component, 'onContinue');
      const emitContinue = jest.spyOn(component.continue, 'emit');
      const { childEl } = QueryChildByDirective(fixture, FilePickerComponent);
      childEl.triggerEventHandler('filesReady', true);
      fixture.componentRef.setInput('options', options);

      const getDocuments = jest.spyOn(DocsManagerService.prototype, 'getDocuments').mockReturnValue([
        {
          type: 'png',
          filename: 'file.png',
          base64: 'base64',
          documentType: 'IDENTIFICATION',
        },
      ]);
      const analyzeDocuments = jest.spyOn(SantanderDePosFlowService.prototype, 'analyzeDocuments')
        .mockReturnValue(of(analyzedDocumentsData));

      from(loader.getHarness(MatButtonHarness)).pipe(
        tap(b => expect(b).toBeTruthy()),
        delayWhen(b => from(b.isDisabled()).pipe(
          tap(disabled => expect(disabled).toBeFalsy()),
        )),
        switchMap(b => b.click()),
        tap(() => {
          expect(onContinue).toHaveBeenCalled();
          expect(getDocuments).toHaveBeenCalledWith(flowId, PersonType, 'IDENTIFICATION');
          expect(analyzeDocuments).toHaveBeenCalledWith([
            {
              type: 'png',
              content: 'base64',
            },
          ]);

          expect(formGroup.value).toMatchObject({
            personalBirthName: analyzedDocumentsData.person.nameAtBirth,
            identificationDateOfExpiry: analyzedDocumentsData.idDocument.identificationDateOfExpiry,
            identificationDateOfIssue: analyzedDocumentsData.idDocument.identificationDateOfIssue,
            identificationIssuingAuthority: analyzedDocumentsData.idDocument.identificationIssuingAuthority,
            identificationNumber: analyzedDocumentsData.idDocument.identificationNumber,
            identificationPlaceOfIssue: analyzedDocumentsData.idDocument.identificationIssuingAuthority,
            personalNationality: analyzedDocumentsData.person.nationality,
            personalDateOfBirth: analyzedDocumentsData.person.dateOfBirth,
            personalPlaceOfBirth: analyzedDocumentsData.person.placeOfBirth,
          });

          expect(addressForm.value).toMatchObject({
            salutation: SalutationEnum.SALUTATION_MR,
            firstName: analyzedDocumentsData.person.firstName,
            lastName: analyzedDocumentsData.person.lastName,
            country: analyzedDocumentsData.person.nationality,
            city: analyzedDocumentsData.person.city,
            zipCode: analyzedDocumentsData.person.zip,
            street: analyzedDocumentsData.person.street,
            streetName: analyzedDocumentsData.person.street,
            streetNumber: analyzedDocumentsData.person.streetNo,
          });

          expect(emitContinue).toBeCalled();

          done();
        }),
      ).subscribe();
    });

    it('should validate OCR data', () => {
      const { childEl } = QueryChildByDirective(fixture, FilePickerComponent);
      childEl.triggerEventHandler('filesReady', true);
      fixture.componentRef.setInput('options', options);
      const zip = addressForm.get('zipCode').value;

      jest.spyOn(SantanderDePosFlowService.prototype, 'analyzeDocuments')
        .mockReturnValue(of({
          ...analyzedDocumentsData,
          person: {
            ...analyzedDocumentsData.person,
            zip: '1234', // invalid
          },
        }));


      return from(loader.getHarness(MatButtonHarness)).pipe(
        tap(b => expect(b).toBeTruthy()),
        delayWhen(b => from(b.isDisabled()).pipe(
          tap(disabled => expect(disabled).toBeFalsy()),
        )),
        switchMap(b => b.click()),
        tap(() => {
          expect(addressForm.value).toMatchObject({
            salutation: SalutationEnum.SALUTATION_MR,
            firstName: analyzedDocumentsData.person.firstName,
            lastName: analyzedDocumentsData.person.lastName,
            country: analyzedDocumentsData.person.nationality,
            city: analyzedDocumentsData.person.city,
            zipCode: zip,
            street: analyzedDocumentsData.person.street,
            streetName: analyzedDocumentsData.person.street,
            streetNumber: analyzedDocumentsData.person.streetNo,
          });

        })
      ).toPromise();
    });

    it('should onContinue emit continue if _idPassed true', () => {
      const emit = jest.spyOn(component.continue, 'emit');
      component.formGroup.get('_idPassed').setValue(true);
      component.onContinue();
      expect(emit).toHaveBeenCalled();
    });

    describe('isStepEditVisible', () => {
      let emitEventFormItself: jest.SpyInstance;
      beforeEach(() => {
        emitEventFormItself = jest.spyOn(component['analyticsFormService'], 'emitEventFormItself');
      });
      it('should isStepEditVisible handle true', () => {
        component.isStepEditVisible = true;
        fixture.detectChanges();
        expect(emitEventFormItself).toHaveBeenCalledWith('FORM_PAYMENT_IDENTIFICATION', AnalyticFormStatusEnum.OPEN);
      });

      it('should isStepEditVisible handle false', () => {
        component.isStepEditVisible = false;
        fixture.detectChanges();
        expect(emitEventFormItself).toHaveBeenCalledWith('FORM_PAYMENT_IDENTIFICATION', AnalyticFormStatusEnum.CLOSED);
      });
    });

    it('should isShowSavedSign return true', () => {
      component.isExpandAll = true;
      component.formGroup.get('_idPassed').setValue(true);
      component.filesReady = true;
      fixture.detectChanges();
      expect(component.isShowSavedSign).toBeTruthy();
    });

    it('should extractStreenNameAndNumber perform correctly', () => {
      const analyzeDataWithStreetNo = {
        person: {
          street: 'Test Street',
          streetNo: '12456',
        },
      } as any;
      expect(component['extractStreetNameAndNumber'](analyzeDataWithStreetNo))
        .toEqual([analyzeDataWithStreetNo.person.street, analyzeDataWithStreetNo.person.streetNo]);

      const analyzeDataWithoutNo = {
        person: {
          street: 'Test Street 12',
        },
      } as any;
      expect(component['extractStreetNameAndNumber'](analyzeDataWithoutNo)).toEqual(['Test Street', '12']);
    });

    it('should clearFormValue perform correctly', () => {
      const value = 'test';
      const options = [
        {
          value: 'TEST',
          label: 'test',
        },
        {
          value: 'TEST-2',
          label: 'test-2',
        },
      ];
      expect(component['clearFormValue'](value, options)).toEqual('TEST');
      expect(component['clearFormValue'](null, options)).toBeUndefined();
    });

  });

  describe('documentIdMask', () => {
    const mockDocumentId = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const expectedResult = 'abcdefghijklmn0pqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZ1234567890';
    it('should documentIdMask handle null', () => {
      expect(component['documentIdMask'](null, 'DE')).toEqual(null);
      expect(component['documentIdMask'](mockDocumentId, 'null')).toEqual(mockDocumentId);
      expect(component['documentIdMask'](null, 'null')).toEqual(null);
    });
    it('should documentIdMask replace value if nationality match', () => {
      expect(component['documentIdMask'](mockDocumentId, 'DE')).toEqual(expectedResult);
      expect(component['documentIdMask'](mockDocumentId, 'de')).toEqual(expectedResult);
      expect(component['documentIdMask'](mockDocumentId, 'NL')).toEqual(expectedResult);
      expect(component['documentIdMask'](mockDocumentId, 'nl')).toEqual(expectedResult);
    });
    it('should documentIdMask dont replace value if nationality dont match', () => {
      expect(component['documentIdMask'](mockDocumentId, 'ES')).toEqual(mockDocumentId);
      expect(component['documentIdMask'](mockDocumentId, 'es')).toEqual(mockDocumentId);
      expect(component['documentIdMask'](mockDocumentId, 'FR')).toEqual(mockDocumentId);
      expect(component['documentIdMask'](mockDocumentId, 'fr')).toEqual(mockDocumentId);
    });
  });
});

