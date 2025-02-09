import { Injectable } from '@angular/core';
import { map, pluck, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { EnvService } from '@pe/common';

import { AddContact, ContactResponse, OrderQuery } from '../interfaces';
import { PeContactsAuthService } from './abstracts/auth.service';
import { ITEMS_PER_PAGE } from '../constants';
import { ApolloBaseName } from '../graphql/graphql.module';

import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';

@Injectable()
export class ContactsGQLService {
  public page: number = 0;
  protected itemCount: number = ITEMS_PER_PAGE;
  public hasNextPage: boolean = true;

  constructor(
    protected apollo: Apollo,
    protected envService: EnvService,
    protected authService: PeContactsAuthService
  ) {}

  getAllContacts(
    filters: any = {},
    orderBy: OrderQuery[] = []
  ): Observable<{ result: ContactResponse[]; totalCount: number }> {
    const page = this.page;
    this.page = 0;
    const getRequest$ = (contacts: ContactResponse[] = []) =>
      this.getContacts().pipe(
        switchMap((data: any) => {
          const result = [...contacts, ...data.result];
          if (result.length < data.totalCount) {
            this.page = this.page + 1;
            return getRequest$(result);
          }
          return of({ result, totalCount: data.totalCount });
        })
      );
    return getRequest$().pipe(tap(() => (this.page = page)));
  }

  getContacts(filters: any = {}, orderBy: OrderQuery[] = []): Observable<any> {
    const query = graphqlTag`
      query {
        contacts (
          businessId: "${this.envService.businessData._id}"
          )
        {
          _id
          businessId
          totalSpent
          groupsId
          type
          fields {
            _id
            value
            fieldId
            field {
              _id
              name
            }
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(
        pluck('data', 'contacts'),
        tap((data: any) => {}),
        map((data: any) => {
          return {
            result: data.map((node: any) => {
              node.fields.map((cfNode: any) => {
                cfNode.field.defaultValues =
                  cfNode.field?.defaultValues &&
                  typeof cfNode.field.defaultValues === 'string'
                    ? cfNode.field.defaultValues
                    : [];
                cfNode.field.showOn =
                  cfNode.field?.showOn &&
                  typeof cfNode.field.showOn === 'string'
                    ? cfNode.field.showOn
                    : [];
                return cfNode;
              });
              return node;
            }),
            totalCount: data.length,
          };
        })
      );
  }

  getContactById(id: string): Observable<ContactResponse> {
    const query = graphqlTag`
      query {
        contact(id: "${id}", businessId: "${this.envService.businessData._id}") {
          _id
          businessId
          groupsId
          type
          fields {
            _id
            value
            fieldId
            field {
              _id
              name
            }
          }
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(
        pluck('data', 'contact'),
        map((contact: any) => {
          contact.fields.forEach((node: any) => {
            node.field.defaultValues =
              node.field?.defaultValues &&
              typeof node.field.defaultValues === 'string'
                ? node.field.defaultValues
                : [];
            node.field.showOn =
              node.field?.showOn && typeof node.field.showOn === 'string'
                ? node.field.showOn
                : [];
          });
          return contact as ContactResponse;
        })
      );
  }

  addContact(newContact: AddContact): Observable<ContactResponse> {
    const fieldsMutation: any = `${
      newContact.fields && newContact.fields.length
        ? `
        data: {
          type: "${newContact.type}"
          fields: [
            ${newContact.fields.map(
              (f: any) => `
              {
                value: "${f.value}",
                fieldId: "${f.fieldId}",
              }`
            )}
          ]
        }`
        : ''
    }`;

    const mutation = graphqlTag`
    mutation {
      createContact(
        businessId: "${this.envService.businessData._id}"
        ${fieldsMutation}
      )
      {
        _id
        type
        businessId
        fields {
          value
          field {
            _id
            name
          }
        }
      }
    }`;
    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          businessId: this.envService.businessData._id,
          ...newContact,
        },
      })
      .pipe(pluck('data', 'createContact', 'contact'));
  }

  deleteContact(id: string): Observable<boolean> {
    const mutation = graphqlTag`
      mutation deleteContact($id: String!) {
        deleteContact(input: { id: $id })
      }
    `;
    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: { id },
      })
      .pipe(pluck('data', 'deleteContact'));
  }

  updateContact(
    id: string,
    newContact: AddContact
  ): Observable<ContactResponse> {
    const fieldsMutation: any = `${
      newContact.fields && newContact.fields.length
        ? `
        data: {
          type: "${newContact.type}"
          fields: [
            ${newContact.fields.map(
              (f: any) => `
              {
                value: "${f.value}",
                fieldId: "${f.fieldId}",
              }`
            )}
          ]
        }`
        : ''
    }`;
    const mutation = graphqlTag`
      mutation {
        updateContact(
          businessId: "${this.envService.businessData._id}"
          id: "${id}"
          ${fieldsMutation}
        )
        {
          _id
          type
          businessId
          fields {
            value
            field {
              _id
              name
            }
          }
        }
      }`;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          id,
          type: newContact.type,
        },
      })
      .pipe(pluck('data', 'updateContact', 'contact'));
  }
}
