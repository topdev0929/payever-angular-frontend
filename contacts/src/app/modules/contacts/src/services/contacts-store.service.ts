import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Contact, FieldGroup, Group } from '../interfaces';

@Injectable()
export class ContactsStoreService {
  public contactId: string;
  public field: FieldGroup;
  public customFormFieldGroup: FormGroup;
  public backUrl: string;
  public group: Group;
  public grid: 'contact' | 'group';

  private contactData: Contact;

  constructor() { }

  saveContactData(data: Contact): void {
    this.contactData = data;
    if (!this.contactData.fieldGroups) {
      this.contactData.fieldGroups = [];
    }
  }

  getContactData(): Contact {
    return this.contactData;
  }

  clear(): void {
    this.contactId = null;
    this.field = null;
    this.customFormFieldGroup = null;
    this.contactData = null;
    this.backUrl = null;
    this.group = null;
  }
}
