import { EmploymentGroupEnum } from '../../../shared/constants';

export const uploadDocsTranslations: { [key in EmploymentGroupEnum]: string } = {
    [EmploymentGroupEnum.GROUP_1_WORKING]: $localize`:@@santander-de.inquiry.additionalSteps.proof.uploadDocuments.docsText.group1Working:`,
    [EmploymentGroupEnum.GROUP_2_RETIRED]: $localize`:@@santander-de.inquiry.additionalSteps.proof.uploadDocuments.docsText.group2Retired:`,
    [EmploymentGroupEnum.GROUP_3_NOT_WORKING]: $localize`:@@santander-de.inquiry.additionalSteps.proof.uploadDocuments.docsText.group3NotWorking:`,
    [EmploymentGroupEnum.GROUP_4_STUDENT]: $localize`:@@santander-de.inquiry.additionalSteps.proof.uploadDocuments.docsText.group4Student:`,
    [EmploymentGroupEnum.UNKNOWN]: '',
};

export const descriptionCardSubtitleTranslations: { [key in EmploymentGroupEnum]: string } = {
    [EmploymentGroupEnum.GROUP_1_WORKING]: $localize`:@@santander-de.inquiry.additionalSteps.proof.descriptionCard.subtitle.group1Working:`,
    [EmploymentGroupEnum.GROUP_2_RETIRED]: $localize`:@@santander-de.inquiry.additionalSteps.proof.descriptionCard.subtitle.group2Retired:`,
    [EmploymentGroupEnum.GROUP_3_NOT_WORKING]: $localize`:@@santander-de.inquiry.additionalSteps.proof.descriptionCard.subtitle.group3NotWorking:`,
    [EmploymentGroupEnum.GROUP_4_STUDENT]: $localize`:@@santander-de.inquiry.additionalSteps.proof.descriptionCard.subtitle.group4Student:`,
    [EmploymentGroupEnum.UNKNOWN]: '',
};