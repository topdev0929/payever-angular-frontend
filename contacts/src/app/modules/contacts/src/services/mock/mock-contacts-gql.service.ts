import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { ContactsGQLService } from '../contacts-gql.service';
import { AddContact, AddContactField, ContactField, ContactResponse, OrderQuery } from '../../interfaces';
import { PeContactsAuthService } from '..';
import { IMockData, MOCK_DATA } from './mock-injection-tokens';
import { deleteContactFromStore, getMockContacts } from './mock-data.helpers';

import { v4 as uuidv4 } from 'uuid';
import { Apollo } from 'apollo-angular';

@Injectable()
export class MockContactsGqlService extends ContactsGQLService {

  constructor(
    apollo: Apollo,
    envService: EnvService,
    authService: PeContactsAuthService,
    @Inject(MOCK_DATA) private mockData: IMockData,
  ) {
    super(apollo, envService, authService);
  }

  getContacts(
    filters: any = {},
    orderBy: OrderQuery[] = [],
  ): Observable<{ result: ContactResponse[], totalCount: number }> {
    return this.getAllContacts(filters, orderBy);
  }

  getAllContacts(
    filters: any = {},
    orderBy: OrderQuery[] = [],
  ): Observable<{ result: ContactResponse[], totalCount: number }> {
    const offset = this.page * this.itemCount;
    const getDataValue = (contact, key): any => {
      let dataValue: any;
      if (contact[key]) {
        dataValue = contact[key];
      } else {
        const field = contact.contactFields.nodes.find(f => f.field.name === key);
        if (field) {
          dataValue = field.value;
        }
      }
      return dataValue;
    };

    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        const data = getMockContacts().filter(contact => {
          return Object.keys(filters).every(key => {
            if (key === 'name') {
              const firstName = contact.contactFields.nodes.find(field => field.field.name === 'firstName');
              const lastName = contact.contactFields.nodes.find(field => field.field.name === 'lastName');
              return filterValue(filters, firstName?.value, key) || filterValue(filters, lastName?.value, key);
            } else {
              const dataValue = getDataValue(contact, key);
              return filterValue(filters, dataValue, key);
            }
          });
        });

        if (orderBy?.length) {
          data.sort((a, b) => {
            const order = orderBy[0];
            const key = order.name;
            const aValue: any = getDataValue(a, key);
            const bValue: any = getDataValue(b, key);
            const sort = order.order === 'DESC' ? aValue < bValue : bValue < aValue;
            return sort ? 1 : -1;
          });
        }

        const result = data.slice(offset, this.itemCount);

        return {
          result,
          totalCount: data.length,
        };
      })
    );
  }

  getContactById(id: string): Observable<ContactResponse> {
    const contact = getMockContacts().find(c => c.id === id);
    return of(contact).pipe(
      delay(Math.random() * 1000),
    );
  }

  addContact(newContact: AddContact, fields: Partial<AddContactField>[] = []): Observable<ContactResponse> {
    const mockFields = this.mockData.fields.reduce((acc, f) => ({...acc, [f.id]: f}), {});
    const contact: ContactResponse = {
      id: uuidv4(),
      type: newContact.type,
      businessId: this.envService.businessId,
      contactFields: {
        nodes: fields.map(f => ({
          fieldId: f.fieldId,
          value: f.value,
          field: mockFields[f.fieldId],
        } as ContactField)),
      }
    };
    return of(contact).pipe(
      delay(Math.random() * 1000),
      tap(() => this.mockData.contacts.push(contact)),
    );
  }

  deleteContact(id: string): Observable<any> {
    return of(true).pipe(
      delay(Math.random() * 1000),
      tap(() => {
        deleteContactFromStore(id);
      }),
    );
  }

  updateContact(id: string, newContact: AddContact): Observable<ContactResponse> {
    return of(null).pipe(
      delay(Math.random() * 1000),
      map(() => {
        const contact = this.mockData.contacts.find(c => c.id === id);
        const mockFields = this.mockData.fields.reduce((acc, f) => ({...acc, [f.id]: f}), {});
        contact.contactFields = {
          nodes: newContact.fields.map(f => ({
            fieldId: f.fieldId,
            value: f.value,
            field: mockFields[f.fieldId],
          } as ContactField)),
        };
        contact.type = newContact.type;
        return contact;
      }),
    );
  }

}

function filterValue(filters, dataValue, key): boolean {
  if (dataValue && filters[key].length) {
    return filters[key].every(filter => {
      switch (filter.type) {
        case '==':
          return filter.values.includes(dataValue);
        case '!=':
          return filter.values[0] !== dataValue;
        case '>':
          return filter.values[0] < dataValue;
        case '<':
          return filter.values[0] > dataValue;
        case '><':
          return filter.values[0] < dataValue && filter.values[1] > dataValue;
        case '^':
          return new RegExp(`^${filter.values[0]}`, 'i').test(dataValue);
        case '$':
          return new RegExp(`${filter.values[0]}$`, 'i').test(dataValue);
        case '%':
          return new RegExp(filter.values[0], 'i').test(dataValue);
        case '!%':
          return !new RegExp(filter.values[0], 'i').test(dataValue);
        default:
          return false;
      }
    });
  } else {
    return false;
  }
}
