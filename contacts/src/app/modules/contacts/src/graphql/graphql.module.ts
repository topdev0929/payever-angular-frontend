import { Inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';

import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkHandler, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, concat } from 'apollo-link';
import * as Cookie from 'js-cookie';

const ACCESS_TOKEN_COOKIE_NAME: string = 'pe_auth_token';
export enum ApolloBaseName {
  contacts = 'contacts',
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ApolloModule,
    HttpLinkModule,
    HttpClientModule,
  ],
  providers: []
})
export class GraphQLModule {
  get token(): string {
    return Cookie.get(ACCESS_TOKEN_COOKIE_NAME) || '';
  }

  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
    @Inject('PE_CONTACTS_HOST') private peContactsHost: string,
  ) {
    const authMiddleware: ApolloLink = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`)
      });
      return forward(operation);
    });

    const contactsLink: HttpLinkHandler = httpLink.create({
      uri: `${this.peContactsHost}/contacts`,
      // uri: `https://contacts-backend.test.devpayever.com/contacts`,
      withCredentials: true,
    });
    apollo.create(
      {
        link: concat(authMiddleware, contactsLink),
        cache: new InMemoryCache({ addTypename: false }),
      },
      ApolloBaseName.contacts,
    );
  }
}
