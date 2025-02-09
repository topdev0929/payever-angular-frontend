import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { IMockData, MOCK_DATA } from './mock/mock-injection-tokens';
import { FieldGroup } from '../interfaces';
import { ApolloBaseName } from '../graphql/graphql.module';
import { PeContactsAuthService } from './abstracts/auth.service';

import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';

@Injectable()
export class FieldGroupGqlService {

  constructor(
    protected apollo: Apollo,
    protected envService: EnvService,
    protected authService: PeContactsAuthService,
    @Inject(MOCK_DATA) protected mockData: IMockData,
  ) {
  }

  getFieldGroups(businessId?: string): Observable<FieldGroup[]> {
    const query = graphqlTag`query {
      fieldGroups (
        filter: {businessId: ${this.authService.isAdmin() ? `{isNull: true}` : `{equalTo: "${this.envService.businessId}"}`}},
      ) {
        nodes {
          id
          name
        }
      }
    }`;
    return this.apollo.subscribe({
      query,
      variables: {
        businessId: businessId ?? this.envService.businessId,
      }
    }).pipe(
      pluck('data', 'fieldGroups', 'nodes'),
    );
  }

  getFieldGroupById(id: string): Observable<FieldGroup> {
    const query = graphqlTag`query fieldGroups($id: UUID!) {
      fieldGroups (filter: {id: {equalTo: $id}}) {
        nodes {
          id
          name
        }
      }
    }`;
    return this.apollo.subscribe({
      query,
      variables: { id },
    }).pipe(
      pluck('data', 'fieldGroups', 'nodes'),
      map((nodes: any) => nodes?.length ? nodes[0] : null),
    );
  }

  createFieldGroup(group: Partial<FieldGroup>): Observable<FieldGroup> {
    const mutation = graphqlTag`
      mutation (
        $businessId: String!,
        $name: String!,
      ) {
        createFieldGroup(input: {
          fieldGroup: {
            businessId: $businessId,
            name: $name,
          }
        }) {
          id
          businessId
          name
        }
      }`;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        businessId: this.envService.businessId,
        name: group.name,
      },
    }).pipe(
      pluck('data', 'createFieldGroup'),
    );
  }
}
