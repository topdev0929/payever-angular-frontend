export interface InformationPackageTypeInterface {
  insuranceConditions: string;
  productInformationSheet: string;
}

export interface InformationPackageInterface {
  merchant: InformationPackageTypeInterface;
  selfService: InformationPackageTypeInterface;
}

export interface DataForwardingRsvInterface {
  merchant: string;
  selfService: string;
}
export interface InsuranceDataInterface {
  insuranceOptions: string[];
  insuranceValue: string;
  dataForwardingRsv: DataForwardingRsvInterface;
  informationPackage: InformationPackageInterface;
}
