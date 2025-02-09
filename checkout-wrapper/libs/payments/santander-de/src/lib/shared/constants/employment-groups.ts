import { EmploymentChoice } from '../types';

export const EMPLOYMENT_GROUP_1_WORKING: EmploymentChoice[] = [
  EmploymentChoice.EMPLOYEE,
  EmploymentChoice.MANAGING_EMPLOYEE,
  EmploymentChoice.EMPLOYEE_IN_PUB_SERVICES,
  EmploymentChoice.WORKER,
  EmploymentChoice.DOCTOR_IN_PERMANENT,
  EmploymentChoice.OFFICAL,
  EmploymentChoice.SOLDIER_PROFESSIONAL,
  EmploymentChoice.SOLDIER_SHORT_SERVICE,
  EmploymentChoice.FEDERAL_VOLUNTARY_SERVICE,
];

export const EMPLOYMENT_GROUP_2_RETIRED: EmploymentChoice[] = [
  EmploymentChoice.PENSIONER1,
  EmploymentChoice.PENSIONER2,
];

export const EMPLOYMENT_GROUP_3_NOT_WORKING: EmploymentChoice[] = [
  EmploymentChoice.UNEMPLOYED,
  EmploymentChoice.SCHOLAR,
  EmploymentChoice.SOLDIER_FOREIGN_FORCES,
  EmploymentChoice.SELF_EMPLOYED,
  EmploymentChoice.TRAINEE,
  EmploymentChoice.HOUSEWIFE_HOMEMAKER,
];

export const EMPLOYMENT_GROUP_4_STUDENT: EmploymentChoice[] = [
  EmploymentChoice.STUDENT,
];

export enum EmploymentGroupEnum {
  GROUP_1_WORKING = 'working',
  GROUP_2_RETIRED = 'retired',
  GROUP_3_NOT_WORKING = 'not_working',
  GROUP_4_STUDENT = 'student',
  UNKNOWN = 'unknown',
}

export enum ApplicationFlowTypeEnum {
  BasicFlow = 'basic_flow_with_web_id',
  BasicStudent = 'basic_student_flow_with_web_id',
  AdvancedFlow = 'advanced_flow_with_income_check_and_web_id',
  TwoApplicants = 'two_applicants',
  Unknown = 'Unknown',
}