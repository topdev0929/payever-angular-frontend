import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { ITEMS_PER_PAGE } from '../constants';
import { Group, OrderQuery } from '../interfaces';
import { ApolloBaseName } from '../graphql/graphql.module';
import { camelToSnakeCase, getGQLFilters } from '../utils/contacts';
import { PeContactsAuthService } from './abstracts/auth.service';

import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';

@Injectable()
export class GroupsGQLService {

  public page: number = 0;
  protected itemCount: number = ITEMS_PER_PAGE;
  public hasNextPage: boolean = true;

  constructor(
    protected apollo: Apollo,
    protected envService: EnvService,
    protected authService: PeContactsAuthService,
  ) {
  }

  getGroups(
    filters: any  = {},
    orderBy: OrderQuery[] = [],
  ): Observable<{result: Group[], totalCount: number}> {
    const order = orderBy.reduce(
      (acc, o) => {
        if (o.order) {
          acc.push(`${camelToSnakeCase(o.name).toUpperCase()}_${o.order}`);
        }
        return acc;
      },
      [],
    );
    const query = graphqlTag`query {
      groups (
        filter: {and: [
          {businessId: ${this.authService.isAdmin() ? `{isNull: true}` : `{equalTo: "${this.envService.businessId}"}`}},
          ${(filters && Object.keys(filters).length) ? getGQLFilters(filters) : ''}
        ]},
#        first: $itemCount,
#        offset: $offset,
        orderBy: [${order}],
      ) {
        nodes {
          id
          name
        }
        totalCount
        pageInfo {
          hasNextPage
        }
      }
    }`;
    return this.apollo.subscribe({
      query,
      variables: {
        businessId: this.envService.businessId,
        offset: this.page * this.itemCount,
        itemCount: this.itemCount,
      },
    }).pipe(
      pluck('data', 'groups'),
      map((data: any) => ({
        result: data.nodes,
        totalCount: data.totalCount,
      })),
    );
  }

  getGroupById(id: string): Observable<Group> {
    const query = graphqlTag`query (
      $id: UUID!,
    ) {
      group (id: $id) {
        id
        name
      }
    }`;
    return this.apollo.subscribe({
      query,
      variables: { id },
    }).pipe(
      pluck('data', 'group'),
    );
  }

  createGroup(group: Partial<Group>): Observable<Group> {
    const mutation = graphqlTag`
      mutation (
        $businessId: String!,
        $name: String!,
      ) {
        createGroup(input: {
          group: {
            businessId: $businessId,
            name: $name,
          }
        }) {
          id
          businessId
          name
        }
      }
    `;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        businessId: this.envService.businessId,
        name: group.name,
      },
    }).pipe(
      pluck('data', 'createGroup'),
    );
  }

  updateGroup(group: Group): Observable<Group> {
    const mutation = graphqlTag`
      mutation (
        $id: String!,
        $name: String!,
      ) {
        updateGroup(input: {
          id: $id,
          patch: {
            name: $name,
          }
        }) {
          id
          businessId
          name
        }
      }
    `;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        ...group,
        businessId: this.envService.businessId,
      },
    }).pipe(
      pluck('data', 'createGroup'),
    );
  }

  deleteGroup(id: string): Observable<any> {
    const mutation = graphqlTag`
      mutation deleteGroup($id: String!) {
        deleteGroup(input: { id: $id })
      }
    `;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: { id }
    });
  }
}
