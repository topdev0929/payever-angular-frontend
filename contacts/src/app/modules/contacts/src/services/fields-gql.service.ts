import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, pluck } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { AddContactField, ContactField, Field, StatusField, UpdateContactField } from '../interfaces';
import { ApolloBaseName } from '../graphql/graphql.module';
import { IMockData, MOCK_DATA } from './mock/mock-injection-tokens';
import { getGQLFilters, parseJSON } from '../utils/contacts';

import { v4 as uuidv4 } from 'uuid';
import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';

@Injectable()
export class FieldsGQLService {

  constructor(
    protected apollo: Apollo,
    protected envService: EnvService,
    @Inject(MOCK_DATA) protected mockData: IMockData,
  ) {
  }

  getStatusesFields(): Observable<StatusField[]> {
    return of([...this.mockData.statuses.filter(s => s.businessId === this.envService.businessId)]).pipe(
      delay(300),
    );
  }

  getStatusFieldById(id: string): Observable<StatusField> {
    return of(this.mockData.statuses.find(field => field.id === id)).pipe(
      delay(300),
      map((statusField: StatusField) => {
        if (!statusField) {
          throw new Error('no status field');
        }
        return { ...statusField };
      })
    );
  }

  createStatusField(status: Partial<StatusField>): Observable<StatusField> {
    const element = {
      ...status,
      id: uuidv4(),
      businessId: this.envService.businessId,
    } as StatusField;
    this.mockData.statuses.push(element);
    return of({ ...element }).pipe(
      delay(300),
    );
  }

  updateStatusField(status: StatusField): Observable<StatusField> {
    this.mockData.statuses.forEach((s, i) => {
      if (s.id === status.id) {
        this.mockData.statuses[i] = {
          ...this.mockData.statuses[i],
          ...status,
        };
      }
    });
    return of({ ...status }).pipe(
      delay(300),
    );
  }

  deleteStatusField(id: string): Observable<boolean> {
    this.mockData.statuses = this.mockData.statuses.filter(statusField => statusField.id !== id);
    return of(true).pipe(
      delay(300),
    );
  }

  getFieldGroupFields(id: string): Observable<Field[]> {
    return of(this.mockData.fields.filter(f => f.groupId === id)).pipe(
      delay(300),
    );
  }

  getAllFields(): Observable<Field[]> {
    return this.apollo.subscribe({
      query: graphqlTag`
        query ($businessId: UUID!) {
          fields(filter: {
            or: [
              {businessId: { equalTo: $businessId }},
              {businessId: { isNull: true }},
            ],
          }) {
            nodes {
              id
              businessId
              name
              type
              groupId
              defaultValues
            }
          }
        }
      `,
      variables: {
        businessId: this.envService.businessId,
      },
    }).pipe(
      pluck('data', 'fields', 'nodes'),
    );
  }

  getDefaultField(): Observable<Field[]> {
    return this.apollo.query({
      query: graphqlTag`
        query {
          fields(filter: {or: [{businessId: {isNull: true}}]}) {
            nodes {
              id
              businessId
              name
              type
            }
          }
        }
      `,
      variables: {
        businessId: this.envService.businessId
      }
    }).pipe(
      pluck('data', 'fields', 'nodes')
    );
  }

  getFields(): Observable<Field[]> {
    return this.apollo.subscribe({
      fetchPolicy: 'network-only',
      query: graphqlTag`
        query ($businessId: UUID!) {
          fields(filter: {
            businessId: { equalTo: $businessId },
          }) {
            nodes {
              id
              type
              name
              groupId
              filterable
              editableByAdmin
              defaultValues
              showOn
            }
          }
        }
      `,
      variables: {
        businessId: this.envService.businessId
      }
    }).pipe(
      pluck('data', 'fields', 'nodes'),
      map((nodes: any[]) => nodes.map((node: any) => {
        node.defaultValues = node.defaultValues && typeof node.defaultValues === 'string' ?
          parseJSON(node.defaultValues) : node.defaultValues;
        return node;
      }))
    );
  }

  getContactFields(filters: any = {}): Observable<ContactField[]> {
    const query = graphqlTag`query ($businessId: UUID!) {
      contactFields(
        orderBy: [VALUE_ASC],
        filter: {and: [
          {businessId: {equalTo: $businessId}},
          ${getGQLFilters(filters)}
        ]},
      ) {
        nodes {
          contactId
          fieldId
          value
        }
      }
    }`;
    return this.apollo.subscribe({
      query,
      variables: {
        businessId: this.envService.businessId,
      },
    }).pipe(
      pluck('data', 'contactFields', 'nodes'),
    );
  }

  createContactField(field: AddContactField): Observable<{ id: string; value: string; }> {
    const mutation = graphqlTag`
      mutation createContactField(
        $id: UUID!,
        $businessId: UUID!,
        $contactId: UUID!,
        $fieldId: UUID!,
        $value: String!,
      ) {
        createContactField(input: {
          contactField: {
            id: $id,
            businessId: $businessId,
            contactId: $contactId,
            fieldId: $fieldId,
            value: $value,
          }
        }) {
          contactField {
            id
            value
          }
        }
      }`;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        id: uuidv4(),
        businessId: this.envService.businessId,
        ...field,
      }
    })
      .pipe(pluck('data', 'createContactField', 'contactField'));
  }

  updateContactField(field: UpdateContactField): Observable<{ id: string; value: string; }> {
    const mutation = graphqlTag`
      mutation updateContactField(
        $id: UUID!,
        $value: String!,
      ) {
        updateContactField(
          input: {
            id: $id,
            patch: {
              value: $value,
            }
          }) {
          contactField {
            id
            value
          }
        }
      }`;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: field
    })
      .pipe(pluck('data', 'updateContactField', 'contactField'));
  }

  createCustomField(field: Partial<Field>): Observable<Field> {
    const mutation = graphqlTag`
      mutation (
          $businessId: String!,
          $groupId: String!,
          $filterable: Boolean!,
          $editableByAdmin: Boolean!,
          $type: String!,
          $name: String!,
      ) {
        createField(input: {
          field: {
            businessId: $businessId,
            name: $name,
            type: $type,
            groupId: $groupId,
            filterable: $filterable,
            editableByAdmin: $editableByAdmin,
            showOn: [${field.showOn?.map(showOn => `"${showOn}"`)}],
            defaultValues: [${field.defaultValues?.map(value => `"${value}"`)}],
          }
        }) {
          id
          type
          name
          groupId
          businessId
          filterable
          editableByAdmin
          showOn
          defaultValues
        }
      }`;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        ...field,
        // id: uuidv4(),
        businessId: this.envService.businessId,
      }
    })
      .pipe(
        pluck('data', 'createField'),
        map((f: any) => ({
          ...f,
          editable: f['editableByAdmin'],
        })),
      );
  }

  updateCustomField(field: Field): Observable<Field> {
    const mutation = graphqlTag`
      mutation (
#        $groupId: String!,
        $filterable: Boolean!,
        $editableByAdmin: Boolean!,
        $type: String!,
        $name: String!,
      ) {
        updateField(input: {
          id: "${field.id}",
          patch: {
            name: $name,
            type: $type,
#            groupId: $groupId,
            filterable: $filterable,
            editableByAdmin: $editableByAdmin,
            showOn: [${field.showOn?.map(showOn => `"${showOn}"`)}],
            defaultValues: [${field.defaultValues?.map(value => `"${value}"`)}],
          }
        }) {
          id
          type
          name
          groupId
          businessId
          groupId
          showOn
          defaultValues
        }
      }`;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        ...field,
        // id: uuidv4(),
        businessId: this.envService.businessId,
      }
    }).pipe(
      pluck('data', 'updateField', 'field'),
    );
  }

  deleteField(id: string): Observable<boolean> {
    const mutation = graphqlTag`
      mutation ($id: UUID!) {
        deleteContactField(input: { id: $id })
      }`;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: { id }
    }).pipe(
      pluck('data', 'deleteContactField'),
    );
  }
}
