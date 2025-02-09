import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { GroupContact } from '../interfaces';
import { ApolloBaseName } from '../graphql/graphql.module';
import { getGQLFilters } from '../utils/contacts';

import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';

@Injectable()
export class GroupContactsGQLService {

  constructor(
    protected apollo: Apollo,
    protected envService: EnvService,
  ) {
  }

  getGroupContacts(filters: any = {}): Observable<{ result: GroupContact[], totalCount: number }> {
    const query = graphqlTag`query {
      groupContacts(filter: ${getGQLFilters(filters)}) {
        nodes {
          contactId
          groupId
          id
        }
        totalCount
        pageInfo {
          hasNextPage
        }
      }
    }`;
    return this.apollo.subscribe({
      query,
      variables: {},
    }).pipe(
      pluck('data', 'groupContacts'),
      map((data: any) => ({ result: data.nodes, totalCount: data.totalCount })),
    );
  }

  createGroupContact(groupContact: GroupContact): Observable<GroupContact> {
    const mutation = graphqlTag`
      mutation (
        $contactId: String!,
        $groupId: String!,
      ) {
        addContactsToGroup(
          input: {
            contactIds: [$contactId],
            groupId: $groupId,
          }
        ) {
          id
          contacts {
            id
          }
        }
      }
    `;
    return this.apollo.use(ApolloBaseName.contacts).mutate({
      mutation,
      variables: {
        ...groupContact,
      },
    }).pipe(
      pluck('data', 'createGroupContact'),
    );
  }

  deleteGroupContact(id: string): Observable<any> {
    return null;
  }
}
