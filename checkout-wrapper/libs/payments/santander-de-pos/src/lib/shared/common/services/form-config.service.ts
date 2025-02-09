import { Injectable } from '@angular/core';

import { SectionDataInterface, SectionSchemeInterface } from '@pe/checkout/form-utils';

import { FormValue, GuarantorRelation, InquireSectionConfig } from '../types';

@Injectable()
export class FormConfigService {

  initialData: Partial<FormValue>;

  sectionsConfig(
    initialData: Partial<FormValue>,
    forceHideOcrPanel: boolean
  ): SectionSchemeInterface<InquireSectionConfig>[] {
    this.initialData = initialData;

    return [
      ...forceHideOcrPanel ? [] : [{
        name: InquireSectionConfig.IdentifyBorrower,
        title: this.wrapPersonTitle($localize`:@@payment-santander-de-pos.inquiry.steps.customerIdentify.title:`, 1),
        isButtonHidden: true,
      }],
      {
        name: InquireSectionConfig.AddressBorrower,
        title: this.wrapPersonTitle($localize`:@@payment-santander-de-pos.inquiry.steps.customerAddress.title:`, 1),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.PersonalInfoBorrower,
        title: this.wrapPersonTitle($localize`:@@payment-santander-de-pos.inquiry.steps.customerPersonalAndBank.title:`, 1),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.IncomeBorrower,
        title: this.wrapPersonTitle(
          $localize`:@@payment-santander-de-pos.inquiry.steps.customerIncomeAndEmploymentOrStudy.title:`,
          1,
        ),
        isButtonHidden: true,
      },
      // Guarantor
      {
        name: InquireSectionConfig.IdentifyGuarantor,
        title: this.wrapPersonTitle($localize`:@@payment-santander-de-pos.inquiry.steps.customerIdentify.title:`, 2),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.AddressGuarantor,
        title: this.wrapPersonTitle($localize`:@@payment-santander-de-pos.inquiry.steps.customerAddress.title:`, 2),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.PersonalInfoGuarantor,
        title: this.wrapPersonTitle($localize`:@@payment-santander-de-pos.inquiry.steps.customerPersonalAndBank.title:`, 2),
        isButtonHidden: true,
      },
      {
        name: InquireSectionConfig.IncomeGuarantor,
        title: this.wrapPersonTitle(
          $localize`:@@payment-santander-de-pos.inquiry.steps.customerIncomeAndEmploymentOrStudy.title:`,
          2,
        ),
        isButtonHidden: true,
      },
    ];
  }

  wrapPersonTitle(title: string, index: number): string {
    return `${title}${this.getPersonTitlePostfix(index)}`;
  }

  getPersonTitlePostfix(index: number): string {
    const guarantorRelation: GuarantorRelation = this.initialData?.detailsForm?.typeOfGuarantorRelation;
    if (guarantorRelation && guarantorRelation !== GuarantorRelation.NONE) {
      const borrower = $localize`:@@payment-santander-de-pos.inquiry.steps.borrowerShort:${index}:personNumber:`;

      return ` - ${borrower}`;
    }

    return '';
  }

  public checkStepsLogic(
    guarantorRelation: GuarantorRelation,
    formSectionsData: SectionDataInterface[],
    forceHideAddressPanel = true,
    forceHideOcrPanel = true,
  ): SectionDataInterface[] {
    if (!formSectionsData?.length) {
      return [];
    }

    const isGuarantor: boolean = guarantorRelation && guarantorRelation !== GuarantorRelation.NONE;
    const disabledSettings = this.disabledSettings(
      isGuarantor,
      guarantorRelation,
      forceHideAddressPanel,
      forceHideOcrPanel
    );

    return formSectionsData.map((section: SectionDataInterface<InquireSectionConfig>) => {
      if ( disabledSettings[section.name] !== undefined) {
        section.isDisabled = disabledSettings[section.name] && !section.isActive;
      }

      return section;
    });
  }

  private disabledSettings(
    isGuarantor: boolean,
    guarantorRelation: GuarantorRelation,
    forceHideAddressPanel: boolean,
    forceHideOcrPanel: boolean,
  ): { [key in InquireSectionConfig]?: boolean } {
    return {
      [InquireSectionConfig.IdentifyBorrower]: forceHideOcrPanel,
      [InquireSectionConfig.AddressBorrower]: !forceHideAddressPanel,
      [InquireSectionConfig.IdentifyGuarantor]: !isGuarantor || forceHideOcrPanel,
      [InquireSectionConfig.AddressGuarantor]:
        !isGuarantor || guarantorRelation === GuarantorRelation.EQUIVALENT_HOUSEHOLD,
      [InquireSectionConfig.PersonalInfoGuarantor]: !isGuarantor,
      [InquireSectionConfig.IncomeGuarantor]: !isGuarantor,
    };
  }
}
