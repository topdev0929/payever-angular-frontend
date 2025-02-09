import { Field } from './custom-field';
import { ContactResponse } from './contact';

export interface Group {
  id: string;
  name: string;
  businessId?: string;
  isDefault?: boolean;
  contacts?: ContactResponse[];
}

export interface GroupContact {
  id: string;
  groupId: string;
  contactId: string;
}

export interface FieldGroup {
  id: string;
  name: string;
  businessId?: string;
  fields?: Field[];
}
