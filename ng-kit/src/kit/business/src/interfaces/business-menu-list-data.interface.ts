import { AppInterface } from './app.interface';
import { UserRoleInterface } from './user-role.interface';

export interface BusinessMenuListDataInterface {
  company_name?: string;
  legal_form?: string;
  menu?: AppInterface[];
  access_rights?: UserRoleInterface;
  business_uuid?: string;
  business_profile_id?: string;
  business_slug?: string;
}
