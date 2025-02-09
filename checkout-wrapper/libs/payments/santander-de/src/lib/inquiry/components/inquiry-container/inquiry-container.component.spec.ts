import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { LAZY_PAYMENT_SECTIONS, PaymentSectionsComponent } from '@pe/checkout/form-utils';
import { AddressAutocompleteService } from '@pe/checkout/forms/address-autocomplete';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  ChangeFailedPayment,
  PaymentState,
  SetFlow,
  SetFormState,
  SetPayments,
  PatchFormState,
  SetPaymentOptions,
  AuthSelectors,
} from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
  StoreHelper,
} from '@pe/checkout/testing';
import { ChangePaymentDataInterface } from '@pe/checkout/types';
import { ContinueButtonComponent } from '@pe/checkout/ui/continue-button';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import {
  FormConfigService,
  FormValue,
  InquireSectionConfig,
  RedirectUrls,
} from '../../../shared';
import {
  flowWithPaymentOptionsFixture,
  paymentFormFixture,
  paymentFormWithGuarantorFixture,
} from '../../../test';
import { LAZY_PAYMENT_SECTIONS_DE } from '../../constants';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {
  const storeHelper = new StoreHelper();
  const formData = paymentFormFixture();
  const gFormData = paymentFormWithGuarantorFixture();
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;
  let store: Store;
  let env: EnvironmentConfigInterface;
  let localeConstantsService: LocaleConstantsService;
  const flowId = flowWithPaymentOptionsFixture().id;
  let checkoutWrapperUrl: string;
  let lang: string;
  let redirectUrls: RedirectUrls;
  let redirectUrlsInitiatedOnCWF: RedirectUrls;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressAutocompleteService,
        PaymentInquiryStorage,
        AddressStorageService,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useValue: {},
        },
        {
          provide: LAZY_PAYMENT_SECTIONS,
          useValue: LAZY_PAYMENT_SECTIONS_DE,
        },
        NgControl,
      ],
      declarations: [
        ContinueButtonComponent,
        ProgressButtonContentComponent,
        InquiryContainerComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      santander_installment: {
        ...store.selectSnapshot(PaymentState),
      },
    }));
    store.dispatch(new SetFormState(formData));
    store.dispatch(new SetPaymentOptions({}));

    fixture = TestBed.createComponent(InquiryContainerComponent);

    component = fixture.componentInstance;
    env = TestBed.inject(PE_ENV);
    localeConstantsService = TestBed.inject(LocaleConstantsService);
    const accessToken = store.selectSnapshot(AuthSelectors.accessToken);
    checkoutWrapperUrl = env.frontend.checkoutWrapper;
    lang = localeConstantsService.getLang();

    redirectUrls = {
      frontendSuccessUrl: `${checkoutWrapperUrl}/${lang}/pay/${flowId}/redirect-to-payment?guest_token=${accessToken}`,
      frontendFailureUrl: `${checkoutWrapperUrl}/${lang}/pay/${flowId}/redirect-to-payment?identification-failed=true&guest_token=${accessToken}`,
      frontendCancelUrl: `${checkoutWrapperUrl}/${lang}/pay/${flowId}/redirect-to-choose-payment?guest_token=${accessToken}`,
    };

    redirectUrlsInitiatedOnCWF = {
      frontendSuccessUrl: `${checkoutWrapperUrl}/${lang}/pay/${flowId}/redirect-to-payment`,
      frontendFailureUrl: `${checkoutWrapperUrl}/${lang}/pay/${flowId}/redirect-to-payment?identification-failed=true`,
      frontendCancelUrl: `${checkoutWrapperUrl}/${lang}/pay/${flowId}/redirect-to-choose-payment`,
    };

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('onSend', () => {
    it('should call sendPaymentData method on onSend', () => {
      jest.spyOn(component as any, 'sendPaymentData');

      component.onSend();

      expect(component['sendPaymentData']).toHaveBeenCalled();
    });
  });

  describe('sendPaymentData', () => {
    let setPaymentDetails: jest.SpyInstance;
    let continueEmit: jest.SpyInstance;

    beforeEach(() => {
      setPaymentDetails = jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');
      continueEmit = jest.spyOn(component.continue, 'emit');
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should sendPaymentData', () => {
      const expectedNodePaymentDetails = {
        typeOfGuarantorRelation: formData.customer.personalForm.typeOfGuarantorRelation,
        duration: formData.hiddenForm?.credit_duration_in_months,
        advertisementConsent: formData.termsForm?.credit_accepts_requests_to_credit_agencies,
        creditProtectionInsurance: formData.customer.protectionForm?.creditProtectionInsurance,
        dataForwardingRsv: formData.customer.protectionForm?.dataForwardingRsv,
        dayOfFirstInstalment: Number(formData.ratesForm?.credit_due_date),
        commodityGroup: formData.ratesForm?.commodity_group,
        downPayment: formData.ratesForm?.down_payment,
        customer: {
          ...formData.customer.personalForm,
          profession: formData.customer.personalForm.employment,
          bankIBAN: formData.customer.bankForm.bank_i_b_a_n,
          bankBIC: formData.customer.bankForm.bank_b_i_c,
          bankName: formData.customer.bankForm.bank_account_bank_name,
          employedSince: formData.customer.employmentForm.freelancer?.freelancerEmployedSince,
          freelancerCompanyName: formData.customer.employmentForm.freelancer.freelancerCompanyName,
          freelancerEmployedSince: new Date(
            formData.customer.employmentForm.freelancer.freelancerEmployedSince,
          ).toUTCString(),
          employer: formData.customer.employmentForm.employer,
          temporaryEmployedUntil: formData.customer.employmentForm.employedUntil,
          prevEmployer: formData.customer.employmentForm.prevEmployer,
          prevEmployedSince: formData.customer.employmentForm.prevEmployedSince,
          addressMobilePhoneNumber: formData.customer.personalForm?.addressCellPhone,
          addressPhoneNumber: formData.customer.personalForm?.addressLandlinePhone,
          ...formData.customer.personalForm.prevAddress,
          prevAddressStreet: formData.customer.personalForm.prevAddress.prevAddressStreet,
          prevAddressStreetNumber: formData.customer.personalForm.prevAddress.prevAddressStreetNumber,
          prevAddressPostalCode: formData.customer.personalForm.prevAddress.prevAddressZip,
          ...formData.customer.incomeForm,
          incomeInfo: formData.customer.incomeForm.sortOfIncome,
          supportPayment: formData.customer.incomeForm.monthlyMaintenancePayments,
          otherIncomeFromHousehold: formData.customer.incomeForm.otherIncome,
          typeOfResident: formData.customer.incomeForm.incomeResidence?.toString(),
          partnerIncomeNet: formData.customer.incomeForm.netIncomePartner,
          incomeFromRent: formData.customer.incomeForm.rentalIncome,
          personalDateOfBirth: formData.customer.personalForm.personalDateOfBirth,
        },
        ...redirectUrls,
      };

      component['sendPaymentData']();

      expect(setPaymentDetails).toHaveBeenCalledWith(expectedNodePaymentDetails);
      expect(continueEmit).toHaveBeenCalled();
    });

    it('should sendPaymentData handle branch', () => {
      const branchFormData: FormValue = {
        ...formData,
        customer: {
          ...formData.customer,
          personalForm: {
            ...formData.customer.personalForm,
            addressLandlinePhone: null,
            prevAddress: null,
          },
          employmentForm: null,
        },
        termsForm: null,
        ratesForm: null,
      };
      store.dispatch(new PatchFormState(branchFormData));
      const expectedNodePaymentDetails: any = {
        typeOfGuarantorRelation: branchFormData.customer.personalForm.typeOfGuarantorRelation,
        duration: branchFormData.hiddenForm?.credit_duration_in_months,
        advertisementConsent: branchFormData.termsForm?.credit_accepts_requests_to_credit_agencies,
        creditProtectionInsurance: branchFormData.customer.protectionForm?.creditProtectionInsurance,
        dataForwardingRsv: branchFormData.customer.protectionForm?.dataForwardingRsv,
        dayOfFirstInstalment: Number(branchFormData.ratesForm?.credit_due_date),
        commodityGroup: branchFormData.ratesForm?.commodity_group,
        downPayment: branchFormData.ratesForm?.down_payment,
        customer: {
          employment: branchFormData.customer.personalForm.employment,
          temporaryEmployedUntil: branchFormData.customer.employmentForm?.employedUntil,
          freelancer: branchFormData.customer.personalForm.freelancer,
          personalDateOfBirth: branchFormData.customer.personalForm.personalDateOfBirth,
          profession: branchFormData.customer.personalForm.employment,
          bankIBAN: branchFormData.customer.bankForm.bank_i_b_a_n,
          bankBIC: branchFormData.customer.bankForm.bank_b_i_c,
          bankName: branchFormData.customer.bankForm.bank_account_bank_name,
          addressMobilePhoneNumber: branchFormData.customer.personalForm?.addressCellPhone,
          addressPhoneNumber: branchFormData.customer.personalForm?.addressLandlinePhone,
          ...branchFormData.customer.personalForm,
          prevAddress: null,
          ...branchFormData.customer.incomeForm,
          incomeInfo: branchFormData.customer.incomeForm.sortOfIncome,
          supportPayment: branchFormData.customer.incomeForm.monthlyMaintenancePayments,
          otherIncomeFromHousehold: branchFormData.customer.incomeForm.otherIncome,
          typeOfResident: branchFormData.customer.incomeForm.incomeResidence?.toString(),
          partnerIncomeNet: branchFormData.customer.incomeForm.netIncomePartner,
          incomeFromRent: branchFormData.customer.incomeForm.rentalIncome,
        },
        ...redirectUrls,
      };

      component['sendPaymentData']();

      expect(setPaymentDetails).toHaveBeenCalledWith(expectedNodePaymentDetails);
      expect(continueEmit).toHaveBeenCalled();
    });

    it('should sendPaymentData handle guarantor branch', () => {
      const branchFormData: FormValue = {
        ...gFormData,
      };
      const billingAddress = flowWithPaymentOptionsFixture().billingAddress;
      store.dispatch(new PatchFormState(branchFormData));
      const expectedNodePaymentDetails = {
        typeOfGuarantorRelation: branchFormData.customer.personalForm.typeOfGuarantorRelation,
        duration: branchFormData.hiddenForm?.credit_duration_in_months,
        advertisementConsent: branchFormData.termsForm?.credit_accepts_requests_to_credit_agencies,
        creditProtectionInsurance: branchFormData.customer.protectionForm?.creditProtectionInsurance,
        dataForwardingRsv: branchFormData.customer.protectionForm?.dataForwardingRsv,
        dayOfFirstInstalment: Number(branchFormData.ratesForm?.credit_due_date),
        commodityGroup: branchFormData.ratesForm?.commodity_group,
        downPayment: branchFormData.ratesForm?.down_payment,
        customer: {
          ...branchFormData.customer.personalForm,
          profession: branchFormData.customer.personalForm.employment,
          bankIBAN: branchFormData.customer.bankForm.bank_i_b_a_n,
          bankBIC: branchFormData.customer.bankForm.bank_b_i_c,
          bankName: branchFormData.customer.bankForm.bank_account_bank_name,
          employedSince: branchFormData.customer.employmentForm.freelancer?.freelancerEmployedSince,
          freelancerCompanyName: branchFormData.customer.employmentForm.freelancer.freelancerCompanyName,
          freelancerEmployedSince: new Date(
            branchFormData.customer.employmentForm.freelancer.freelancerEmployedSince,
          ).toUTCString(),
          temporaryEmployedUntil: branchFormData.customer.employmentForm.employedUntil,
          employer: branchFormData.customer.employmentForm.employer,
          prevEmployer: branchFormData.customer.employmentForm.prevEmployer,
          prevEmployedSince: branchFormData.customer.employmentForm.prevEmployedSince,
          addressMobilePhoneNumber: branchFormData.customer.personalForm?.addressCellPhone,
          addressPhoneNumber: branchFormData.customer.personalForm?.addressLandlinePhone,
          ...branchFormData.customer.personalForm.prevAddress,
          prevAddressStreet: branchFormData.customer.personalForm.prevAddress.prevAddressStreet,
          prevAddressStreetNumber: branchFormData.customer.personalForm.prevAddress.prevAddressStreetNumber,
          prevAddressPostalCode: branchFormData.customer.personalForm.prevAddress.prevAddressZip,
          ...branchFormData.customer.incomeForm,
          incomeInfo: branchFormData.customer.incomeForm.sortOfIncome,
          supportPayment: branchFormData.customer.incomeForm.monthlyMaintenancePayments,
          otherIncomeFromHousehold: branchFormData.customer.incomeForm.otherIncome,
          typeOfResident: branchFormData.customer.incomeForm.incomeResidence?.toString(),
          partnerIncomeNet: branchFormData.customer.incomeForm.netIncomePartner,
          incomeFromRent: branchFormData.customer.incomeForm.rentalIncome,
          personalDateOfBirth: branchFormData.customer.personalForm.personalDateOfBirth,
        },
        guarantor: {
          ...branchFormData.guarantor.personalForm,
          ...branchFormData.guarantor.incomeForm,
          typeOfResident: branchFormData.guarantor.incomeForm.incomeResidence?.toString(),
          otherIncomeFromHousehold: branchFormData.guarantor.incomeForm.otherIncome,
          incomeInfo: branchFormData.guarantor.incomeForm.sortOfIncome,
          supportPayment: branchFormData.guarantor.incomeForm.monthlyMaintenancePayments,
          partnerIncomeNet: branchFormData.guarantor.incomeForm.netIncomePartner,
          incomeFromRent: branchFormData.guarantor.incomeForm.rentalIncome,
          employer: branchFormData.guarantor.employmentForm.employer,
          prevEmployer: branchFormData.guarantor.employmentForm.prevEmployer,
          prevEmployedSince: branchFormData.guarantor.employmentForm.prevEmployedSince,
          freelancer: branchFormData.guarantor.personalForm.freelancer,
          personalDateOfBirth: branchFormData.guarantor.personalForm.personalDateOfBirth,
          profession: branchFormData.guarantor.personalForm.employment,
          addressCity: billingAddress.city,
          addressCountry: billingAddress.country,
          contactEmail: branchFormData.guarantor.addressForm.email,
          addressFirstName: branchFormData.guarantor.addressForm.firstName,
          addressLastName: branchFormData.guarantor.addressForm.lastName,
          addressSalutation: branchFormData.guarantor.addressForm.salutation,
          addressStreet: billingAddress.street,
          addressStreetNumber: billingAddress.streetNumber,
          employedSince: branchFormData.guarantor.employmentForm.employedSince,
          temporaryEmployedUntil: branchFormData.guarantor.employmentForm.employedUntil,
          addressZip: billingAddress.zipCode,
          addressMobilePhoneNumber: branchFormData.guarantor.personalForm?.addressCellPhone,
          addressPhoneNumber: branchFormData.guarantor.personalForm.addressLandlinePhone,
          addressResidentSince: branchFormData.guarantor.personalForm.addressResidentSince,
        },
        ...redirectUrls,
      };

      component['sendPaymentData']();

      expect(setPaymentDetails).toHaveBeenCalledWith(expectedNodePaymentDetails);
      expect(continueEmit).toHaveBeenCalled();
    });
    it('redirect urls when payment is imitated on CWF', () => {
      jest.spyOn(window, 'origin', 'get').mockReturnValue(checkoutWrapperUrl);
      setPaymentDetails.mockImplementation((data) => {
        expect(data).toMatchObject(redirectUrlsInitiatedOnCWF);
      });

      component['sendPaymentData']();
      expect(setPaymentDetails).toHaveBeenCalled();
    });

    it('should sendPaymentData handle freelancer branch', () => {
      const freelancerBranchFormData: FormValue = {
        ...formData,
        hiddenForm: null,
        customer: {
          ...formData.customer,
          employmentForm: {
            ...formData.customer.employmentForm,
            freelancer: null,
          },
          personalForm: {
            ...formData.customer.personalForm,
            addressLandlinePhone: null,
            prevAddress: null,
          },
        },
      };
      store.dispatch(new PatchFormState(freelancerBranchFormData));
      const expectedNodePaymentDetails: any = {
        duration: 0,
        typeOfGuarantorRelation: freelancerBranchFormData.customer.personalForm.typeOfGuarantorRelation,
        advertisementConsent: freelancerBranchFormData.termsForm?.credit_accepts_requests_to_credit_agencies,
        creditProtectionInsurance: freelancerBranchFormData.customer.protectionForm?.creditProtectionInsurance,
        dataForwardingRsv: freelancerBranchFormData.customer.protectionForm?.dataForwardingRsv,
        dayOfFirstInstalment: Number(freelancerBranchFormData.ratesForm?.credit_due_date),
        commodityGroup: freelancerBranchFormData.ratesForm.commodity_group,
        downPayment: freelancerBranchFormData.ratesForm?.down_payment,
        customer: {
          ...freelancerBranchFormData.customer.personalForm,
          ...freelancerBranchFormData.customer.incomeForm,
          bankIBAN: freelancerBranchFormData.customer.bankForm.bank_i_b_a_n,
          bankBIC: freelancerBranchFormData.customer.bankForm.bank_b_i_c,
          bankName: freelancerBranchFormData.customer.bankForm.bank_account_bank_name,
          employedSince: freelancerBranchFormData.customer.employmentForm.employedSince,
          temporaryEmployedUntil: freelancerBranchFormData.customer.employmentForm.employedUntil,
          employer: freelancerBranchFormData.customer.employmentForm.employer,
          prevEmployer: freelancerBranchFormData.customer.employmentForm.prevEmployer,
          prevEmployedSince: freelancerBranchFormData.customer.employmentForm.prevEmployedSince,
          addressMobilePhoneNumber: freelancerBranchFormData.customer.personalForm?.addressCellPhone,
          addressPhoneNumber: freelancerBranchFormData.customer.personalForm?.addressLandlinePhone,
          profession: freelancerBranchFormData.customer.personalForm.employment,
          prevAddress: null,
          typeOfResident: freelancerBranchFormData.customer.incomeForm.incomeResidence?.toString(),
          partnerIncomeNet: freelancerBranchFormData.customer.incomeForm.netIncomePartner,
          incomeFromRent: freelancerBranchFormData.customer.incomeForm.rentalIncome,
          incomeInfo: freelancerBranchFormData.customer.incomeForm.sortOfIncome,
          supportPayment: freelancerBranchFormData.customer.incomeForm.monthlyMaintenancePayments,
          otherIncomeFromHousehold: freelancerBranchFormData.customer.incomeForm.otherIncome,
        },
        ...redirectUrls,
      };

      component['sendPaymentData']();

      expect(setPaymentDetails).toHaveBeenCalledWith(expectedNodePaymentDetails);
      expect(continueEmit).toHaveBeenCalled();
    });
  });

  describe('changePayment', () => {
    it('should dispatch ChangeFailedPayment action on changePayment', () => {
      const testData: ChangePaymentDataInterface = {};
      const dispatchSpy = jest.spyOn(store, 'dispatch').mockImplementation(() => of());

      component.changePayment(testData);

      expect(dispatchSpy).toHaveBeenCalledWith(new ChangeFailedPayment(testData));
    });
  });

  describe('component', () => {
    it('checkStepsLogic', () => {
      const { child } = QueryChildByDirective(fixture, PaymentSectionsComponent);
      const checkStepsLogic = jest.spyOn(FormConfigService.prototype, 'checkStepsLogic');
      const sections = [
        { name: InquireSectionConfig.FirstStepBorrower },
      ];
      child.checkStepsLogic.emit(sections);
      expect(checkStepsLogic).toBeCalledWith(sections);
    });
    it('checkStepsLogic', () => {
      const { child } = QueryChildByDirective(fixture, PaymentSectionsComponent);
      const checkStepsLogic = jest.spyOn(FormConfigService.prototype, 'checkStepsLogic');
      const sections = [
        { name: InquireSectionConfig.FirstStepBorrower },
      ];
      child.loadedLazyModule.emit(sections);
      expect(checkStepsLogic).toBeCalledWith(sections);
    });
  });
});
