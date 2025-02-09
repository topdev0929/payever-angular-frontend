import { CommonModule } from '@angular/common';
import { Inject, NgModule } from '@angular/core';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkHandler, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

@NgModule({
  imports: [CommonModule, ApolloModule, HttpLinkModule],
})
export class ApolloConfigModule {
  constructor(apollo: Apollo, httpLink: HttpLink, @Inject(PE_ENV) private env: EnvironmentConfigInterface) {
    const productsLink: HttpLinkHandler = httpLink.create({
      uri: `${this.env.backend.products}/products`,
    });

    const channelSetsLink: HttpLinkHandler = httpLink.create({
      uri: `${this.env.backend.products}/channelset`,
    });

    const marketingLink: HttpLinkHandler = httpLink.create({
      uri: `${this.env.backend.marketing}/graphql`,
    });

    apollo.create(
      {
        link: productsLink,
        cache: new InMemoryCache({ addTypename: false }),
      },
      'products',
    );

    apollo.create(
      {
        link: channelSetsLink,
        cache: new InMemoryCache({ addTypename: false }),
      },
      'channelset',
    );

    apollo.create(
      {
        link: marketingLink,
        cache: new InMemoryCache(),
      },
      'marketing',
    );
  }
}
