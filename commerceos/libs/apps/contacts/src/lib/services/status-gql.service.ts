import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import graphqlTag from 'graphql-tag';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { EnvService } from '@pe/common';

import { ApolloBaseName } from '../graphql/graphql.module';
import { AddStatusField, GetStatusesApiResponse, StatusField, UpdateStatusField } from '../interfaces';

@Injectable()
export class StatusGQLService {

  constructor(
    private apollo: Apollo,
    private envService: EnvService,
    private peAuthService: PeAuthService,
  ) { }

  public getAllContactsStatus(businessId: string): Observable<StatusField[]> {
    let query = graphqlTag`
      {
        statuses(businessId: "${businessId}") {
            _id
            name
            color
            businessId
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .subscribe({
        query,
      })
      .pipe(
        pluck('data', 'statuses'),
        map((statuses: GetStatusesApiResponse[]) => statuses?.map(status => ({
            ...status,
            id: status._id,
          })
        )),
      );
  }

  public createContactStatus(field: AddStatusField): Observable<{ _id: string; name: string; }> {
    const mutation = graphqlTag`
      mutation createStatus($name: String!, $color: String!) {
        createStatus(
          businessId: "${this.envService.businessId}"
          data: {
            name: $name
            color: $color
          }
        )
        {
          _id
          businessId
          name
          color
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: {
          ...field,
        },
      })
      .pipe(
        pluck('data', 'createStatus')
      );
  }

  public updateContactStatus(field: UpdateStatusField): Observable<{ _id: string; name: string; }> {
    const mutation = graphqlTag`
      mutation updateStatus($name: String!, $color: String!) {
        updateStatus(
          businessId: "${field.businessId}"
          id: "${field.id}"
          data: {
            name: $name
            color: $color
          }
        ) {
          _id
          name
          color
          businessId
        }
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
        variables: { name: field.name, color: field.color },
      })
      .pipe(
        pluck('data', 'updateStatus')
      );
  }

  public deleteContactStatus(id: string, businessId: string): Observable<boolean> {
    const mutation = graphqlTag`
      mutation {
        deleteStatus(businessId: "${businessId}", id: "${id}")
      }
    `;

    return this.apollo
      .use(ApolloBaseName.contacts)
      .mutate({
        mutation,
      }).pipe(
        pluck('data', 'deleteStatus'),
      );
  }
}
