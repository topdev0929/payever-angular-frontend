import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CompositeForm } from '@pe/checkout/forms';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils/src';

import { flowWithPaymentOptionsFixture, paymentFormFixture, ratesFixture } from '../../../../../../test/fixtures';
import { RatesDataInterface } from '../../../../../common';
import { IncomeModule } from '../../../income.module';

import {
  InsuranceDataInterface,
} from './interfaces';
import { ProtectionFormComponent } from './protection-form.component';
import { SantanderDePosProtectionService } from './protection-form.service';

describe('ProtectionFormComponent', () => {

  let component: ProtectionFormComponent;
  let fixture: ComponentFixture<ProtectionFormComponent>;

  let formGroup: InstanceType<typeof ProtectionFormComponent>['formGroup'];
  let store: Store;

  const insuranceData: InsuranceDataInterface = {
    insuranceOptions: [],
    insuranceValue: 'insuranceValue',
    dataForwardingRsv: {
      merchant: 'merchant',
      selfService: 'selfService',
    },
    informationPackage: {
      merchant: {
        insuranceConditions: 'insuranceConditions',
        productInformationSheet: 'productInformationSheet',
      },
      selfService: {
        insuranceConditions: 'insuranceConditions',
        productInformationSheet: 'productInformationSheet',
      },
    },
  };
  const mockRates: RatesDataInterface = {
    rates: [ratesFixture()[0]],
    cpiRates: [ratesFixture()[0]],
  };

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IncomeModule),
        { provide: NgControl, useValue: formControl },
        SantanderDePosProtectionService,
        PaymentHelperService,
      ],
      declarations: [
        ProtectionFormComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(ProtectionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    formGroup = component.formGroup;

    jest.spyOn(component['santanderDePosProtectionService'], 'initRatesData')
      .mockReturnValue(null);
    jest.spyOn(component['santanderDePosProtectionService'], 'insuranceData', 'get')
      .mockReturnValue(insuranceData);
    jest.spyOn(component['santanderDePosProtectionService'], 'cpiRate', 'get')
      .mockReturnValue(mockRates.cpiRates[0]);
    jest.spyOn(component['santanderDePosProtectionService'], 'rate', 'get')
      .mockReturnValue(mockRates.rates[0]);

  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('_yes')).toBeTruthy();
    expect(formGroup.get('_yes').value).toBeNull();
    expect(formGroup.get('_yes').validator).toBeFalsy();

    expect(formGroup.get('_no')).toBeTruthy();
    expect(formGroup.get('_no').value).toBeNull();
    expect(formGroup.get('_no').validator).toBeFalsy();

    expect(formGroup.get('creditProtectionInsurance')).toBeTruthy();
    expect(formGroup.get('creditProtectionInsurance').value).toBeNull();
    expect(formGroup.get('creditProtectionInsurance').validator).toBeTruthy();

    expect(formGroup.get('_cpiCreditDurationInMonths')).toBeTruthy();
    expect(formGroup.get('_cpiCreditDurationInMonths').value).toBeNull();
    expect(formGroup.get('_cpiCreditDurationInMonths').validator).toBeFalsy();

    expect(formGroup.get('dataForwardingRsv')).toBeTruthy();
    expect(formGroup.get('dataForwardingRsv').value).toBeNull();
    expect(formGroup.get('dataForwardingRsv').disabled).toBeTruthy();
    expect(formGroup.get('dataForwardingRsv').validator).toBeTruthy();

  });

  it('should creditProtectionInsurance validator work correctly', () => {

    const creditProtectionInsurance = formGroup.get('creditProtectionInsurance');

    creditProtectionInsurance.setValue(true);
    expect(creditProtectionInsurance.valid).toBeTruthy();

    creditProtectionInsurance.setValue(null);
    expect(creditProtectionInsurance.invalid).toBeTruthy();

  });

  it('should dataForwardingRsv validator work correctly', () => {

    const dataForwardingRsv = formGroup.get('dataForwardingRsv');
    dataForwardingRsv.enable();

    dataForwardingRsv.setValue(true);
    expect(dataForwardingRsv.valid).toBeTruthy();

    dataForwardingRsv.setValue(false);
    expect(dataForwardingRsv.invalid).toBeTruthy();

    dataForwardingRsv.setValue(null);
    expect(dataForwardingRsv.invalid).toBeTruthy();

  });

  it('should insuranceData get data from santanderDePosProtectionService', () => {

    expect(component.insuranceData).toEqual(insuranceData);

  });

  it('should input ratesData initRates data', () => {

    const initRatesData = jest.spyOn(component['santanderDePosProtectionService'], 'initRatesData');

    component.ratesData = mockRates;

    expect(initRatesData).toHaveBeenCalledWith(mockRates, paymentFormFixture());

  });

  it('should input rates update _cpiCreditDurationInMonths', () => {

    formGroup.get('creditProtectionInsurance').setValue(120);

    component.ratesData = mockRates;

    expect(formGroup.get('creditProtectionInsurance').value).not.toBeNull();
    expect(formGroup.get('_cpiCreditDurationInMonths').value).toEqual(mockRates.cpiRates[0].duration);

  });

  it('should input rates trigger updateTranslations$', () => {

    const updateTranslations = jest.spyOn(component['updateTranslations$'], 'next');

    component.ratesData = mockRates;

    expect(updateTranslations).toHaveBeenCalled();

  });

  it('should get translations', (done) => {
    jest.spyOn(component['sanitizer'], 'bypassSecurityTrustHtml').mockImplementation(value => value);
    component['updateTranslations$'].next();
    component.translations$.subscribe((translations) => {
      expect(translations).toMatchObject({
        _yes: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.yes:`,
        _no: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.no:`,
        dataForwardingRsv: insuranceData.dataForwardingRsv.selfService,
        subhead: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.subhead:${insuranceData.insuranceValue}:customString:`,
        optionsTitle: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options_title:`,
      });
      done();
    });
  });

  it('should get correct translations if merchantMode true and insuranceValue null', (done) => {
    jest.spyOn(component['sanitizer'], 'bypassSecurityTrustHtml').mockImplementation(value => value);
    jest.spyOn(component['santanderDePosProtectionService'], 'insuranceData', 'get')
      .mockReturnValue({
        ...insuranceData,
        insuranceValue: null,
      });
    jest.spyOn(component as any, 'merchantMode', 'get').mockReturnValue(true);

    component['updateTranslations$'].next();
    component.translations$.subscribe((translations) => {
      expect(translations).toMatchObject({
        _yes: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.yes:`,
        _no: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.no:`,
        dataForwardingRsv: insuranceData.dataForwardingRsv.merchant,
        subhead: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.subhead:${''}:customString:`,
        optionsTitle: $localize`:@@payment-santander-de-pos.inquiry.sections.protection.options_title:`,
      });
      done();
    });
  });

  it('should toggleYes work correctly', () => {
    const totalAmountNext = jest.spyOn(component['paymentHelperService'].totalAmount$, 'next');

    component.ngOnInit();

    formGroup.get('_yes').setValue(false);
    expect(formGroup.get('creditProtectionInsurance').value).toEqual(null);
    expect(formGroup.get('_no').value).toEqual(null);
    expect(formGroup.get('_cpiCreditDurationInMonths').value).toEqual(null);

    formGroup.get('_yes').setValue(true);
    expect(formGroup.get('creditProtectionInsurance').value).toEqual(true);
    expect(formGroup.get('_no').value).toEqual(false);
    expect(formGroup.get('_cpiCreditDurationInMonths').value).toEqual(mockRates.cpiRates[0].duration);

    expect(totalAmountNext).toHaveBeenCalledWith(mockRates.rates[0].totalCreditCost);
  });

  it('should toggleNo$ work correctly', () => {
    const totalAmountNext = jest.spyOn(component['paymentHelperService'].totalAmount$, 'next');

    component.ngOnInit();

    formGroup.get('_no').setValue(false);
    expect(formGroup.get('creditProtectionInsurance').value).toEqual(null);
    expect(formGroup.get('_yes').value).toEqual(null);
    expect(formGroup.get('_cpiCreditDurationInMonths').value).toEqual(null);

    formGroup.get('_no').setValue(true);
    expect(formGroup.get('creditProtectionInsurance').value).toEqual(false);
    expect(formGroup.get('_yes').value).toEqual(false);
    expect(formGroup.get('_cpiCreditDurationInMonths').value).toEqual(null);

    expect(totalAmountNext).toHaveBeenCalledWith(mockRates.rates[0].totalCreditCost);

  });

  it('should creditProtectionInsurance$ work correctly', () => {

    component.ngOnInit();

    formGroup.get('creditProtectionInsurance').setValue(false);
    expect(formGroup.get('dataForwardingRsv').disabled).toBeTruthy();

    formGroup.get('creditProtectionInsurance').setValue(true);
    expect(formGroup.get('dataForwardingRsv').enabled).toBeTruthy();

  });

  it('should onClickSubhead perform correctly', () => {
    const open = jest.spyOn(component['dialogService'], 'open');
    const preventDefault = jest.fn();
    const event = {
      preventDefault,
      composedPath: () => [{ nodeName: 'A' }],
    } as unknown as Event;
    component.onClickSubhead(event);
    expect(preventDefault).toHaveBeenCalled();
    expect(open).toHaveBeenCalled();
  });

});
