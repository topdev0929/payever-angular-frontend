import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { NO_CACHE_POLICY } from '../../shared/gql-queries/queries';
import { ChannelInterface } from '../../shared/interfaces/channel.interface';
import { EnvService } from '../../shared/services/env.service';

import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';

export const GET_PRODUCT_DETAILS: any = gql`
  query getChannelSetByBusiness($businessId: String!) {
    getChannelSetByBusiness(businessId: $businessId) {
      id
      name
      type
      active
      business
      enabledByDefault
      customPolicy
      policyEnabled
      originalId
    }
  }
`;

@Injectable()
export class ChannelsService {
  constructor(private envService: EnvService, private apollo: Apollo) {}

  get channels$(): Observable<ChannelInterface[]> {
    const businessId: string = this.envService.businessUuid;
    return this.apollo
      .use('channelset')
      .query({
        query: GET_PRODUCT_DETAILS,
        variables: {
          businessId,
        },
        fetchPolicy: NO_CACHE_POLICY,
      })
      .pipe(
        switchMap(({ data }: ApolloQueryResult<ChannelInterface | any>) => {
          return of(data.getChannelSetByBusiness);
        }),
        catchError((error: any) => {
          console.error('RESOLVE CHANNELS / ERROR', error);
          return [null];
        }),
      );
  }
}
