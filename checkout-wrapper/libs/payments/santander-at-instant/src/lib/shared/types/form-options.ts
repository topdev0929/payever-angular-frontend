export interface BanksInterface {
  id: string;
  name: string;
  logoUri: string;
}

export interface FormOptionsInterface {
  banks: BanksInterface[];
}
