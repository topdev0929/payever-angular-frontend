export enum ScenarioEnum {
  IIR = 'NEED_MORE_INFO_IIR',
  DTI = 'NEED_MORE_INFO_DTI',
  SIFO = 'NEED_MORE_INFO_SIFO'
}

export const fieldsIIR: string[] = [
  'employedSince', 'employmentPercent', 'norwegianCitizen', 'professionalStatus', 'residentialStatus', 'maritalStatus',
  'politicalExposedPerson', 'appliedOnBehalfOfOthers', 'paySource', 'payWithMainIncome', 'otherPaySource',
];
export const fieldsDTI: string[] = [
  'employedSince', 'employmentPercent', 'norwegianCitizen', 'professionalStatus', 'residentialStatus', 'maritalStatus',
  'employer', 'netMonthlyIncome', 'totalDebt',
  'politicalExposedPerson', 'appliedOnBehalfOfOthers', 'paySource', 'payWithMainIncome', 'otherPaySource',
];
export const fieldsSIFO: string[] = [
  'employedSince', 'employmentPercent', 'norwegianCitizen', 'professionalStatus', 'residentialStatus', 'maritalStatus',
  'employer', 'netMonthlyIncome',
  '_mortgageLoansCount', '_securedLoansCount', '_studentLoansCount',
  'otherMonthlyExpenses', 'rentIncome', 'numberOfChildren',
  'politicalExposedPerson', 'appliedOnBehalfOfOthers', 'paySource', 'payWithMainIncome', 'otherPaySource',
];

export function getVisibleFieldsByScenario(scenario: ScenarioEnum): string[] {
  let visible: string[] = [];
  switch (scenario) {
    case ScenarioEnum.IIR:
      visible = fieldsIIR;
      break;
    case ScenarioEnum.DTI:
      visible = fieldsDTI;
      break;
    case ScenarioEnum.SIFO:
      visible = fieldsSIFO;
      break;
    default:
  }

  return visible;
}
