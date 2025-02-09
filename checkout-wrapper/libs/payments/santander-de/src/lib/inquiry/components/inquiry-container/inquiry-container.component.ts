import {
  Component,
  Output,
  EventEmitter,
  OnInit, ChangeDetectionStrategy,
} from '@angular/core';
import { Subject } from 'rxjs';

import { SectionDataInterface, SectionSchemeInterface } from '@pe/checkout/form-utils';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { AuthSelectors, ChangeFailedPayment, PaymentState } from '@pe/checkout/store';
import { ChangePaymentDataInterface, TimestampEvent } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';
import { PeDestroyService } from '@pe/destroy';

import {
  FormConfigService,
  FormValue,
  GuarantorRelation,
  InquireSectionConfig,
  NodePaymentDetailsInterface,
  PaymentDataCustomerInterface,
  RedirectUrls,
} from '../../../shared';

export const SECTIONS_CONFIG: SectionSchemeInterface[] = [
  {
    name: 'firstStep',
    title: $localize`:@@santander-de.inquiry.step.main.title:`,
    isButtonHidden: true,
  },
  {
    name: 'secondStep',
    title: $localize`:@@santander_installment.header.finances:`,
    isButtonHidden: true,
  },
];

@Component({
  selector: 'santander-de-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styleUrls: ['./inquiry-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends AbstractPaymentContainerComponent implements OnInit {
  public doSubmit$ = new Subject<void>();


  @Output() requestFlowData: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() continue = new EventEmitter();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() finishModalShown: EventEmitter<boolean> = new EventEmitter<boolean>();

  public sectionsConfig: SectionSchemeInterface<InquireSectionConfig>[];
  public formSectionsData: SectionDataInterface[] = [];
  private formConfigService = this.injector.get(FormConfigService);
  private env = this.injector.get(PE_ENV);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  ngOnInit(): void {
    super.ngOnInit();
    this.loadStepperConfig();
  }

  protected loadStepperConfig() {
    this.sectionsConfig = this.formConfigService.sectionsConfig();
    this.cdr.detectChanges();
  }

  public checkStepsLogic(formSectionsData: SectionDataInterface[]) {
    this.formSectionsData = this.formConfigService.checkStepsLogic(formSectionsData);
  }

  loadedLazyModule(formSectionsData: SectionDataInterface[]) {
    this.formSectionsData = this.formConfigService.checkStepsLogic(formSectionsData);
  }


  public onSend(): void {
    this.sendPaymentData();
  }

  public changePayment(data: ChangePaymentDataInterface): void {
    this.store.dispatch(new ChangeFailedPayment(data));
  }

  protected sendPaymentData(): void {
    const formData: FormValue = this.store.selectSnapshot(PaymentState.form);
    const billingAddress = this.flow.billingAddress;

    const nodePaymentDetails: NodePaymentDetailsInterface = {
      duration: formData.hiddenForm?.credit_duration_in_months ?? 0,
      advertisementConsent: formData.termsForm?.credit_accepts_requests_to_credit_agencies,
      creditProtectionInsurance: formData.customer.protectionForm?.creditProtectionInsurance,
      dataForwardingRsv: formData.customer.protectionForm?.dataForwardingRsv,
      dayOfFirstInstalment: Number(formData.ratesForm?.credit_due_date),
      commodityGroup: formData.ratesForm?.commodity_group,
      downPayment: formData.ratesForm?.down_payment,
      typeOfGuarantorRelation: formData.customer.personalForm.typeOfGuarantorRelation,
      ...formData?.customer.personalForm.typeOfGuarantorRelation !== GuarantorRelation.NONE && {
        guarantor: {
          ...formData.guarantor.personalForm,
          ...formData.guarantor.incomeForm,
          typeOfResident: formData.guarantor.incomeForm.incomeResidence?.toString(),
          otherIncomeFromHousehold: formData.guarantor.incomeForm.otherIncome,
          incomeInfo: formData.guarantor.incomeForm.sortOfIncome,
          supportPayment: formData.guarantor.incomeForm.monthlyMaintenancePayments,
          partnerIncomeNet: formData.guarantor.incomeForm.netIncomePartner,
          incomeFromRent: formData.guarantor.incomeForm.rentalIncome,
          freelancer: formData.guarantor.personalForm.freelancer,
          personalDateOfBirth: formData.guarantor.personalForm.personalDateOfBirth,
          profession: formData.guarantor.personalForm.employment,
          addressCity: formData.guarantor.addressForm.city ?? billingAddress.city,
          addressCountry: formData.guarantor.addressForm.country ?? billingAddress.country,
          contactEmail: formData.guarantor.addressForm.email,
          addressFirstName: formData.guarantor.addressForm.firstName,
          addressLastName: formData.guarantor.addressForm.lastName,
          addressSalutation: formData.guarantor.addressForm.salutation,
          addressStreet: formData.guarantor.addressForm.street ?? billingAddress.street,
          addressStreetNumber: formData.guarantor.addressForm.streetNumber ?? billingAddress.streetNumber,
          addressZip: formData.guarantor.addressForm.zipCode ?? billingAddress.zipCode,
          addressMobilePhoneNumber: formData.guarantor.personalForm.addressCellPhone,
          addressPhoneNumber: formData.guarantor.personalForm.addressLandlinePhone,
          addressResidentSince: formData.guarantor.personalForm.addressResidentSince,
          ...formData.guarantor.personalForm.prevAddress && {
            ...formData.guarantor.personalForm.prevAddress,
            prevAddressStreet: formData.guarantor.personalForm.prevAddress.prevAddressStreet,
            prevAddressStreetNumber: formData.guarantor.personalForm.prevAddress.prevAddressStreetNumber,
            prevAddressPostalCode: formData.guarantor.personalForm.prevAddress.prevAddressZip,
          },

          ...formData.guarantor.employmentForm
            ? {
              employedSince: formData.guarantor.employmentForm.freelancer?.freelancerEmployedSince
                ?? formData.guarantor.employmentForm.employedSince,
              ...formData.guarantor.employmentForm.freelancer
                ? {
                  freelancerCompanyName: formData.guarantor.employmentForm.freelancer.freelancerCompanyName,
                  freelancerEmployedSince: new Date(
                    formData.guarantor.employmentForm.freelancer.freelancerEmployedSince
                  ).toUTCString(),
                }
                : {},
              temporaryEmployedUntil: formData.guarantor.employmentForm?.employedUntil,
              employer: formData.guarantor.employmentForm.employer,
              prevEmployer: formData.guarantor.employmentForm.prevEmployer,
              prevEmployedSince: formData.guarantor.employmentForm.prevEmployedSince,
            }
            : {},
        },
      },
      customer: {
        employment: formData.customer.personalForm.employment,
        freelancer: formData.customer.personalForm.freelancer,
        personalDateOfBirth: formData.customer.personalForm.personalDateOfBirth,
        profession: formData.customer.personalForm.employment,

        bankIBAN: formData.customer.bankForm.bank_i_b_a_n,
        bankBIC: formData.customer.bankForm.bank_b_i_c,
        bankName: formData.customer.bankForm.bank_account_bank_name,

        ...formData.customer.employmentForm
          ? {
            employedSince: formData.customer.employmentForm.freelancer?.freelancerEmployedSince
              ?? formData.customer.employmentForm.employedSince,
            ...formData.customer.employmentForm.freelancer
              ? {
                freelancerCompanyName: formData.customer.employmentForm.freelancer.freelancerCompanyName,
                freelancerEmployedSince: new Date(
                  formData.customer.employmentForm.freelancer.freelancerEmployedSince
                ).toUTCString(),
              }
              : {},
            temporaryEmployedUntil: formData.customer.employmentForm.employedUntil,
            employer: formData.customer.employmentForm.employer,
            prevEmployer: formData.customer.employmentForm.prevEmployer,
            prevEmployedSince: formData.customer.employmentForm.prevEmployedSince,
          }
          : {},
        addressMobilePhoneNumber: formData.customer.personalForm.addressCellPhone,
        addressPhoneNumber: formData.customer.personalForm.addressLandlinePhone,
        ...formData.customer.personalForm,

        ...formData.customer.personalForm.prevAddress && {
          ...formData.customer.personalForm.prevAddress,
          prevAddressStreet: formData.customer.personalForm.prevAddress.prevAddressStreet,
          prevAddressStreetNumber: formData.customer.personalForm.prevAddress.prevAddressStreetNumber,
          prevAddressPostalCode: formData.customer.personalForm.prevAddress.prevAddressZip,
        },

        ...formData.customer.incomeForm,
        typeOfResident: formData.customer.incomeForm.incomeResidence?.toString(),
        otherIncomeFromHousehold: formData.customer.incomeForm.otherIncome,
        incomeInfo: formData.customer.incomeForm.sortOfIncome,
        supportPayment: formData.customer.incomeForm.monthlyMaintenancePayments,
        partnerIncomeNet: formData.customer.incomeForm.netIncomePartner,
        incomeFromRent: formData.customer.incomeForm.rentalIncome,
      },
      ...this.getRedirectUrls(),
    };

    Object.keys(nodePaymentDetails.customer).forEach((k) => {
      const key = k as keyof PaymentDataCustomerInterface;

      return (nodePaymentDetails.customer[key] === undefined)
        && delete nodePaymentDetails.customer[key];
    });
    nodePaymentDetails.guarantor
      && Object.keys(nodePaymentDetails.guarantor).forEach((k) => {
        const key = k as keyof PaymentDataCustomerInterface;

        return (nodePaymentDetails.guarantor[key] === undefined)
          && delete nodePaymentDetails.guarantor[key];
      });

    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);

    this.continue.emit();
  }


  private getRedirectUrls(): RedirectUrls {
    const lang = this.localeConstantsService.getLang();
    const checkoutWrapperUrl = this.env.frontend.checkoutWrapper;
    const urls: RedirectUrls = {
      frontendSuccessUrl: `${checkoutWrapperUrl}/${lang}/pay/${this.flow.id}/redirect-to-payment`,
      frontendFailureUrl: `${checkoutWrapperUrl}/${lang}/pay/${this.flow.id}/redirect-to-payment?identification-failed=true`,
      frontendCancelUrl: `${checkoutWrapperUrl}/${lang}/pay/${this.flow.id}/redirect-to-choose-payment`,
    };

    if (!window.origin.includes(this.env.frontend.checkoutWrapper)) {
      const accessToken = this.store.selectSnapshot(AuthSelectors.accessToken);

      return Object.entries(urls).reduce((acc, [k, v]) => {
        const url = new URL(v);
        url.searchParams.append('guest_token', accessToken);
        acc[k as keyof RedirectUrls] = url.toString();

        return acc;
      }, urls);
    }

    return urls;
  }
}
