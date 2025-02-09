import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface, NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { TransactionDataInterface, WeekOfDelivery } from '../../shared';
import { AddressFormValue, GuarantorAddressFields } from '../../shared/common/types/form.interface';
import { DetailsFormService } from '../../shared/sections';

dayjs.extend(weekOfYear);

@Injectable()
export class EditFormService {
  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  get transactionData(): NodePaymentResponseInterface<TransactionDataInterface> {
    return this.editTransactionStorageService.getTransactionData<TransactionDataInterface>(
      this.flow.id, this.paymentMethod
    );
  }

  get transactionDetails(): TransactionDataInterface {
    return this.transactionData?.paymentDetails;
  }

  constructor(
    private editTransactionStorageService: EditTransactionStorageService,
    private detailsFormService: DetailsFormService,
  ) { }

  prepareFormInitData(formGroup: FormGroup): any {
    const initData: any = Object.keys(formGroup.controls).reduce((acc, key) => ({
      ...acc,
      [key]: ['customer', 'guarantor'].includes(key)
        ? this.prepareCustomerGuarantorData(formGroup, key as keyof TransactionDataInterface)
        : this.transactionDetails,
    }), {});

    const protectionForm = {
      _yes: this.transactionDetails?.creditProtectionInsurance === true,
      _no: this.transactionDetails?.creditProtectionInsurance === false,
      creditProtectionInsurance: this.transactionDetails?.creditProtectionInsurance,
      dataForwardingRsv: this.transactionDetails?.creditProtectionInsurance,
    };


    const weekOfDelivery = this.parseDeliveryDateWithFallback(initData.detailsForm?.weekOfDelivery);
    const weekOfDeliveryView = this.parseWeekOfDeliveryView(weekOfDelivery);

    return {
      ...initData,
      ratesForm: {
        ...initData.ratesForm,
        desiredInstalment: this.transactionDetails.desiredInstalment,
        _desiredInstalmentView: this.transactionDetails.desiredInstalment,
      },
      detailsForm: {
        ...initData.detailsForm,
        _condition_view: this.detailsFormService.defaultConditionView(initData.detailsForm?.condition),
        _program_view: initData.detailsForm?.condition,
        _weekOfDelivery_view: weekOfDeliveryView,
        ...weekOfDeliveryView
          ? { _customWeekOfDelivery_view: weekOfDelivery }
          : {},
        dayOfFirstInstalment: initData.detailsForm?.dayOfFirstInstalment
          ?? this.detailsFormService.daysOfInstalment[0].value,
        downPayment: this.transactionData.payment.downPayment,
      },
      termsForm: {
        ...initData.termsForm,
        _borrowerAgreeToBeAdvised: initData.detailsForm?.advertisementConsent,
        forOwnAccount: initData.detailsForm?.forOwnAccount ?? initData.detailsForm?.customerConditionsAccepted,
        dataPrivacy: initData.detailsForm?.dataPrivacy ?? initData.detailsForm?.customerConditionsAccepted,
        _agreeToBeAdvised: initData.termsForm?.advertisementConsent,
      },
      customer: {
        ...initData.customer,
        protectionForm: {
          ...initData.customer.protectionForm,
          ...protectionForm,
        },
        _identifyForm: {
          ...initData.customer?._identifyForm,
          _docsMarkAsUploaded: !!Object.keys((this.transactionData).paymentDetails?.customer ?? {})?.length,
        },
      },
      guarantor: {
        ...initData.guarantor,
        addressForm: this.guarantorAddressMap(initData.guarantor.addressForm),
        detailsForm: this.guarantorAddressMap(initData.guarantor.detailsForm),
        protectionForm: {
          ...initData.guarantor.protectionForm,
          ...protectionForm,

        },
        _identifyForm: {
          ...initData.guarantor?._identifyForm,
          _docsMarkAsUploaded: !!Object.keys((this.transactionData).paymentDetails?.guarantor ?? {})?.length,
        },
      },
    };
  }

  private prepareCustomerGuarantorData(formGroup: FormGroup, keyControl: keyof TransactionDataInterface): any {
    return Object.keys((formGroup.controls[keyControl as 'customer' | 'guarantor'] as FormGroup).controls)
      .reduce((formData, controlKey) => ({
        ...formData,
        [controlKey]: this.transactionDetails[keyControl],
      }), {});
  }


  private parseDeliveryDateWithFallback(weekOfDelivery: string): Date {
    const [week, year] = weekOfDelivery?.split('.') || [];

    const date = dayjs().week(Number(week)).year(Number(year));
    const thisWeek = dayjs().add(1, 'days');
    if (!date.isValid()) { return thisWeek.toDate() }

    return date.isBefore(thisWeek)
      ? thisWeek.toDate()
      : date.endOf('week').toDate();
  }


  private parseWeekOfDeliveryView(weekOfDelivery: Date): WeekOfDelivery {
    const date = dayjs(weekOfDelivery);
    const week = date.week();
    const year = date.year();
    const today = dayjs();
    const weekOfDeliveryMap = {
      [today.week()]: WeekOfDelivery.THIS_WEEK,
      [today.week() + 1]: WeekOfDelivery.NEXT_WEEK,
    };

    return weekOfDeliveryMap[week] && year === date.year()
      ? weekOfDeliveryMap[Number(week)]
      : WeekOfDelivery.OTHER_WEEK;
  }

  private guarantorAddressMap(data: Partial<GuarantorAddressFields>): Partial<AddressFormValue> {
    return {
      city: data.addressCity,
      country: data.addressCountry,
      firstName: data.addressFirstName,
      lastName: data.addressLastName,
      salutation: data.addressSalutation,
      street: [data.addressStreet, data.addressStreetNumber].filter(Boolean).join(' '),
      zipCode: data.addressZip,
      email: data.contactEmail,
    };
  }
}
