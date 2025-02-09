export enum AccountTypeEnum {
  Employee = 'employee',
  Integration = 'integration',
}

export enum AuthTokenType {
  default = 0,
  permanent2fa = 1,
  temporary2fa = 2,
}

export enum AuthHeadersEnum {
  anonym = 'pe_anonym',
  refresh = 'pe_refresh',
  allow403 = 'pe_allow403',
}
