import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { filter } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

@NgModule({
  imports: [
    CommonModule,
    ApolloModule,
    HttpLinkModule,
  ],
})
export class CoreApolloModule {

  constructor(apollo: Apollo, httpLink: HttpLink, envConfig: EnvironmentConfigService) {
    envConfig.getConfig$().pipe(filter((item: EnvironmentConfigInterface) => !!item)).subscribe(() => {
      if (!apollo.use('products')) {
        // Create an products link:
        const productsLink = httpLink.create({
          uri: `${envConfig.getBackendConfig().products}/products`,
        });

        apollo.create({
          link: productsLink,
          cache: new InMemoryCache({ addTypename: false }),
        }, 'products');
      }

      if (!apollo.use('marketing')) {
        // Create a marketing link:
        const marketingLink = httpLink.create({
          uri: `${envConfig.getNodeJsBackendConfig().marketing}/graphql`,
        });

        apollo.create({
          link: marketingLink,
          cache: new InMemoryCache({ addTypename: false }),
        }, 'marketing');
      }
    });
  }
}
