import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { DeviceUUID } from 'device-uuid';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { ApiService, ChannelSetDeviceSettingsInterface, NodeApiService, VerificationTypeEnum } from '@pe/checkout/api';
import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { fixDate, prepareData, replaceUmlaut } from '@pe/checkout/utils/prepare-data';
import { PE_ENV } from '@pe/common';

import {
  AddressFormValue,
  FormValue,
  GuarantorFormValue,
  NodePaymentDetailsGuarantorInterface,
  NodePaymentDetailsInterface,
  NodePaymentDetailsResponseInterface,
  PersonFormValue,
  TransactionDataInterface,
} from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private apiService = this.injector.get(ApiService);
  private nodeApiService = this.injector.get(NodeApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private editTransactionStorageService = this.injector.get(EditTransactionStorageService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);
  private apmService = this.injector.get(ApmService);

  private isEdit = this.store.selectSnapshot(ParamsState.params).editMode;

  postPayment() {
    return this.isEdit ? this.editPayment() : this.submitPayment();
  }

  private preparePayment(): Observable<void> {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    if (!formData) {
      const payments = this.store.selectSnapshot(PaymentState);
      const flow = this.store.selectSnapshot(FlowState);
      this.apmService.apm.setCustomContext({
        payments,
        flow,
      });
      this.apmService.apm.captureError('POS DE formData error');
    }
    const incomeInfo = replaceUmlaut(formData.customer.incomeForm?.incomeInfo);
    const gIncomeInfo = replaceUmlaut(formData.guarantor?.incomeForm?.incomeInfo);

    const paymentDetails: NodePaymentDetailsInterface = {
      creditDurationInMonths: formData.ratesForm.creditDurationInMonths,
      desiredInstalment: formData.ratesForm.desiredInstalment,
      dayOfFirstInstalment: formData.detailsForm.dayOfFirstInstalment,
      downPayment: formData.detailsForm.downPayment ?? 0,
      advertisementConsent: formData.termsForm.advertisementConsent,
      customerConditionsAccepted: formData.termsForm.customerConditionsAccepted,
      customer: {
        addressMobilePhoneNumber: formData.customer.personalForm.addressMobilePhoneNumber,
        addressPhoneNumber: formData.customer.personalForm.addressPhoneNumber,
        addressResidentSince: formData.customer.personalForm.addressResidentSince,
        bankIBAN: formData.customer.bankForm.bankIBAN,
        ...formData.customer.bankForm.bankIBAN.toUpperCase().startsWith('DE')
          ? {}
          : { bankBIC: formData.customer.bankForm.bankBIC },
        employer: formData.customer.employmentForm?.employer,
        employedSince: formData.customer.employmentForm?.employedSince,
        housingCosts: formData.customer.incomeForm.housingCosts,
        identificationDateOfExpiry: formData.customer.personalForm.identificationDateOfExpiry,
        identificationDateOfIssue: formData.customer.personalForm.identificationDateOfIssue,
        identificationIssuingAuthority: formData.customer.personalForm.identificationIssuingAuthority,
        identificationNumber: formData.customer.personalForm.identificationNumber,
        identificationPlaceOfIssue: formData.customer.personalForm.identificationPlaceOfIssue,
        incomeFromRent: formData.customer.incomeForm.incomeFromRent,
        netIncome: formData.customer.incomeForm.netIncome,
        numberOfChildren: formData.customer.personalForm.numberOfChildren,
        otherIncomeFromHousehold: formData.customer.incomeForm.otherIncomeFromHousehold,
        ...incomeInfo ? { incomeInfo } : {},
        partnerIncomeNet: formData.customer.incomeForm.partnerIncomeNet,
        personalMaritalStatus: formData.customer.personalForm.personalMaritalStatus,
        personalNationality: formData.customer.personalForm.personalNationality,
        personalPlaceOfBirth: formData.customer.personalForm.personalPlaceOfBirth,
        ...formData.customer.personalForm?.personalBirthName?.trim() ?
          { personalBirthName: formData.customer.personalForm.personalBirthName }
          : {},
        profession: formData.customer.personalForm.profession || formData.detailsForm.customer.profession,
        supportPayment: formData.customer.incomeForm.supportPayment,
        temporaryEmployedUntil: formData.customer.employmentForm?.temporaryEmployedUntil,
        typeOfResident: formData.customer.incomeForm.typeOfResident?.toString(),
        personalDateOfBirth: formData.detailsForm.customer?.personalDateOfBirth
          ?? formData.customer.personalForm?.personalDateOfBirth,
        typeOfIdentification: formData.customer.personalForm.typeOfIdentification || 'PASSPORT',
        ...formData?.customer?.prevAddressForm
          ? {
            ...formData.customer.prevAddressForm,
            prevAddressZip: this.convertForeignZips(formData.customer.prevAddressForm.prevAddressZip),
          }
          : {},
      },
      creditProtectionInsurance: formData.customer.protectionForm.creditProtectionInsurance ?? false,
      dataForwardingRsv: formData.customer.protectionForm?.dataForwardingRsv
        ?? formData?.guarantor?.protectionForm?.dataForwardingRsv,

      commodityGroup: formData.detailsForm.commodityGroup,
      condition: formData.detailsForm.condition,
      dataPrivacy: formData.termsForm.dataPrivacy,
      forOwnAccount: formData.termsForm.forOwnAccount,
      typeOfGuarantorRelation: formData.detailsForm.typeOfGuarantorRelation,
      webIdConditionsAccepted: formData.termsForm.webIdConditionsAccepted,
      weekOfDelivery: formData.detailsForm.weekOfDelivery,
      ...formData?.guarantor && {
        guarantor: {
          contactEmail: formData.guarantor.addressForm.email,
          addressCity: formData.guarantor.addressForm.city,
          addressCountry: formData.guarantor.addressForm.country,
          addressFirstName: formData.guarantor.addressForm.firstName,
          addressLastName: formData.guarantor.addressForm.lastName,
          addressSalutation: formData.guarantor.addressForm.salutation,
          addressStreet: formData.guarantor.addressForm.street,
          addressStreetNumber: formData.guarantor.addressForm.streetNumber,
          addressZip: formData.guarantor.addressForm.zipCode,
          addressMobilePhoneNumber: formData.guarantor.personalForm.addressMobilePhoneNumber,
          addressPhoneNumber: formData.guarantor.personalForm.addressPhoneNumber,
          addressResidentSince: formData.guarantor.personalForm.addressResidentSince,
          employer: formData.guarantor.employmentForm?.employer,
          employedSince: formData.guarantor.employmentForm?.employedSince,
          housingCosts: formData.guarantor.incomeForm.housingCosts,
          identificationDateOfExpiry: formData.guarantor.personalForm.identificationDateOfExpiry,
          identificationDateOfIssue: formData.guarantor.personalForm.identificationDateOfIssue,
          identificationIssuingAuthority: formData.guarantor.personalForm.identificationIssuingAuthority,
          identificationNumber: formData.guarantor.personalForm.identificationNumber,
          identificationPlaceOfIssue: formData.guarantor.personalForm.identificationPlaceOfIssue,
          ...formData.guarantor.personalForm?.personalBirthName?.trim()
            ? { personalBirthName: formData.guarantor.personalForm.personalBirthName }
            : {},
          incomeFromRent: formData.guarantor.incomeForm.incomeFromRent,
          netIncome: formData.guarantor.incomeForm.netIncome,
          numberOfChildren: formData.guarantor.personalForm.numberOfChildren,
          otherIncomeFromHousehold: formData.guarantor.incomeForm.otherIncomeFromHousehold,
          ...gIncomeInfo ? { incomeInfo: gIncomeInfo } : {},
          partnerIncomeNet: formData.guarantor.incomeForm.partnerIncomeNet,
          personalMaritalStatus: formData.guarantor.personalForm.personalMaritalStatus,
          personalNationality: formData.guarantor.personalForm.personalNationality,
          personalPlaceOfBirth: formData.guarantor.personalForm.personalPlaceOfBirth,
          profession: formData.guarantor.personalForm.profession,
          supportPayment: formData.guarantor.incomeForm.supportPayment,
          typeOfResident: formData.guarantor.incomeForm.typeOfResident?.toString(),
          personalDateOfBirth: formData.guarantor.personalForm.personalDateOfBirth,
          typeOfIdentification: formData.guarantor.personalForm.typeOfIdentification || 'PASSPORT',
          ...formData?.guarantor?.prevAddressForm
            ? {
              ...formData.guarantor.prevAddressForm,
              prevAddressZip: this.convertForeignZips(formData.guarantor.prevAddressForm.prevAddressZip),
            }
            : {},
          temporaryEmployedUntil: formData.guarantor.employmentForm?.temporaryEmployedUntil,
        },
      },
    };

    return this.nodeFlowService.assignPaymentDetails(paymentDetails);
  }

  protected prepareEditPayment(): Observable<void> {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    const {
      bankForm,
      addressForm: gAddressForm,
      detailsForm: gDetailsForm,
      ...guarantor
    } = formData?.guarantor || {} as GuarantorFormValue;
    const guarantorData = prepareData<NodePaymentDetailsGuarantorInterface>({
      _identifyForm: { ...guarantor._identifyForm },
      employmentForm: { ...guarantor.employmentForm },
      incomeForm: {
        ...guarantor.incomeForm,
        ...guarantor.incomeForm?.incomeInfo
          ? { incomeInfo: replaceUmlaut(guarantor.incomeForm.incomeInfo) }
          : {},
      },
      protectionForm: { ...guarantor.protectionForm },
      personalForm: { ...guarantor.personalForm },
      prevAddressForm: { ...guarantor.prevAddressForm },
    });


    const paymentDetails: NodePaymentDetailsInterface = {
      desiredInstalment: formData.ratesForm.desiredInstalment,
      creditDurationInMonths: this.cpiCreditDurationInMonths(formData)
        || formData.ratesForm.creditDurationInMonths,
      condition: formData.detailsForm.condition,
      commodityGroup: formData.detailsForm.commodityGroup,
      dayOfFirstInstalment: formData.detailsForm.dayOfFirstInstalment,
      downPayment: formData.detailsForm.downPayment,
      typeOfGuarantorRelation: formData.detailsForm.typeOfGuarantorRelation,
      weekOfDelivery: formData.detailsForm.weekOfDelivery,

      forOwnAccount: formData.termsForm.forOwnAccount,
      dataPrivacy: formData.termsForm.dataPrivacy,
      advertisementConsent: formData.termsForm.advertisementConsent,
      customerConditionsAccepted: formData.termsForm.customerConditionsAccepted,
      webIdConditionsAccepted: formData.termsForm.webIdConditionsAccepted,
      creditProtectionInsurance: formData.customer?.protectionForm?.creditProtectionInsurance
        ?? formData.guarantor?.protectionForm?.creditProtectionInsurance ?? false,
      dataForwardingRsv: formData.customer.protectionForm?.dataForwardingRsv
        ?? formData?.guarantor?.protectionForm?.dataForwardingRsv,

      customer: {
        ...prepareData({
          _identifyForm: { ...formData.customer._identifyForm },
          addressForm: { ...formData.customer.addressForm },
          bankForm: { ...formData.customer.bankForm },
          employmentForm: { ...formData.customer.employmentForm },
          incomeForm: {
            ...formData.customer.incomeForm,
            ...formData.customer.incomeForm?.incomeInfo
              ? { incomeInfo: replaceUmlaut(formData.customer.incomeForm.incomeInfo) }
              : {},
          },
          personalForm: { ...formData.customer.personalForm },
          prevAddressForm: { ...formData.customer.prevAddressForm },
          protectionForm: { ...formData.customer.protectionForm },
        } satisfies PersonFormValue),
        ...formData?.customer?.prevAddressForm
          ? {
            ...formData.customer.prevAddressForm,
            prevAddressZip: this.convertForeignZips(formData.customer.prevAddressForm.prevAddressZip),
          }
          : {},
        profession: formData.customer.personalForm.profession || formData.detailsForm.customer.profession,
        personalDateOfBirth: fixDate(formData.detailsForm.customer.personalDateOfBirth),
        bankBIC: formData.customer.bankForm.bankBIC || null,
      },
      ...formData?.guarantor && {
        guarantor: {
          ...guarantorData,
          ...gAddressForm ? this.prepareGuarantorAddress(gAddressForm)
            : {
              ...this.prepareGuarantorAddress({ ...formData.billingAddress }),
              ...this.prepareGuarantorAddress({ ...gDetailsForm }),
            },
          temporaryEmployedUntil: formData.guarantor.employmentForm?.temporaryEmployedUntil,
        },
      },
    };

    return this.nodeFlowService.assignPaymentDetails(paymentDetails);
  }

  private prepareGuarantorAddress(addressForm: Partial<AddressFormValue>)
    : Partial<NodePaymentDetailsGuarantorInterface> {

    return Object.fromEntries(Object.entries({
      addressCity: addressForm?.city,
      addressCountry: addressForm?.country,
      addressFirstName: addressForm?.firstName,
      addressLastName: addressForm?.lastName,
      addressStreet: addressForm?.street,
      addressStreetNumber: addressForm?.streetNumber,
      addressSalutation: addressForm?.salutation,
      addressZip: addressForm?.zipCode,
      contactEmail: addressForm?.email,
    }).filter(([_, value]) => Boolean(value)));
  }

  private submitPayment() {
    const merchantMode$ = this.store.select(ParamsState.params).pipe(
      map(({ merchantMode }) => merchantMode),
    );

    const channelSetDeviceSettings$: Observable<ChannelSetDeviceSettingsInterface> =
      this.apiService.getChannelSetDeviceSettings(this.flow.channelSetId).pipe(catchError(() => of(null)));

    return this.preparePayment().pipe(
      switchMap(() => channelSetDeviceSettings$.pipe(
        withLatestFrom(merchantMode$),
        switchMap(([paymentCodeSettings, merchantMode]) =>
          this.nodeApiService.getShopUrls(this.flow).pipe(
            switchMap((shopUrls) => {
              const deviceUUID = new DeviceUUID();

              const checkoutWrapper: string = this.env.frontend.checkoutWrapper;
              const locale = this.localeConstantsService.getLang();

              return this.nodeFlowService.assignPaymentDetails({
                posVerifyType: paymentCodeSettings?.enabled
                  ? paymentCodeSettings.verificationType
                  : VerificationTypeEnum.VERIFY_BY_PAYMENT,
                posMerchantMode: this.flow.pos_merchant_mode || Boolean(merchantMode),
                // frontendSuccessUrl must be static page (even that it doesn't have transaction details) because
                // it might be opened much later from email (when browser already lost token and flow state)
                frontendSuccessUrl: shopUrls.successUrl
                  || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/redirect-to-payment?deviceUUID=${deviceUUID.get()}&staticPage=success`,
                frontendFailureUrl: shopUrls.failureUrl
                  || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/static-finish/fail`,
                frontendCancelUrl: shopUrls.cancelUrl
                  || `${checkoutWrapper}/${locale}/pay/${this.flow.id}/redirect-to-choose-payment?deviceUUID=${deviceUUID.get()}&staticPage=fail`,
              }).pipe(
                switchMap(() => this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>()),
              );
            })),
        )
      )),
    );
  }

  protected editPayment() {
    const transactionDetails = this.editTransactionStorageService.getTransactionData<TransactionDataInterface>(
      this.flow.id,
      this.paymentMethod,
    )?.paymentDetails;

    this.nodeFlowService.assignPaymentDetails({
      posVerifyType: transactionDetails?.posVerifyType,
      posMerchantMode: transactionDetails?.posMerchantMode,
      frontendSuccessUrl: transactionDetails?.frontendSuccessUrl,
      frontendFailureUrl: transactionDetails?.frontendFailureUrl,
      frontendCancelUrl: transactionDetails?.frontendCancelUrl,
    });


    return this.prepareEditPayment().pipe(
      switchMap(() => this.nodeFlowService.editTransaction<NodePaymentDetailsResponseInterface>(
        this.editTransactionStorageService.getTransactionId(this.flow.id, this.paymentMethod),
      )),
    );
  }

  private cpiCreditDurationInMonths(formData: FormValue): number {
    return formData.customer?.protectionForm?._cpiCreditDurationInMonths
      ?? formData?.guarantor?.protectionForm?._cpiCreditDurationInMonths;
  }

  private convertForeignZips(zipCode: string, length = 5): string {
    return zipCode?.replace(/\D/g, '').padEnd(length, '0').substring(0, length) ?? '';
  }
}
