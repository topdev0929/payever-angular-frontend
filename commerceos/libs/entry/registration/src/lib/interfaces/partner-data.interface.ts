import { FormFieldInterface } from '@pe/shared/business-form';

export interface PartnerDataInterface {
  createdAt: string;
  defaultLoginByEmail: boolean;
  form: FormFieldInterface[];
  logo: string;
  name: string;
  type: string;
  updatedAt: string;
  wallpaperUrl: string;
  _id: string;
}
