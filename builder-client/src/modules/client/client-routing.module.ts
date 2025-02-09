import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';
import { TranslationGuard } from '@pe/ng-kit/modules/i18n';

import { PasswordGuard } from '../../modules/client/guards/password.guard';
import { ContainerComponent, NotFoundComponent } from './components';
import { ClientStateResolver } from './resolvers';

const routes: Routes = [
  {
    path: '404',
    canActivate: [ TranslationGuard, EnvironmentConfigGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit'],
      mode: 'not-found'
    },
    component: NotFoundComponent
  },
  {
    path: 'not-available',
    canActivate: [ TranslationGuard, EnvironmentConfigGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit'],
      mode: 'not-available'
    },
    component: NotFoundComponent
  },
  {
    path: 'no-domain',
    canActivate: [ TranslationGuard, EnvironmentConfigGuard ],
    resolve: {
      domainData: ClientStateResolver
    },
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store']
    },
    component: ContainerComponent
  },

  // Routes for new themes
  // TODO find a way to have it with more perfect route config
  {
    path: ':page1/:page2/:page3/:page4/:page5/:page6',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard, PasswordGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    },
  },
  {
    path: ':page1/:page2/:page3/:page4/:page5',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard, PasswordGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    },
  },
  {
    path: ':page1/:page2/:page3/:page4',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard, PasswordGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    },
  },
  {
    path: ':page1/:page2/:page3',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard, PasswordGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    },
  },
  {
    path: ':page1/:page2',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard, PasswordGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    },
  },
  {
    path: ':page1',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard, PasswordGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    },
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    resolve: {
      domainData: ClientStateResolver
    },
    component: ContainerComponent,
    canActivate: [ EnvironmentConfigGuard, TranslationGuard ],
    data: {
      i18nDomains: ['builder-app', 'ng-kit-ng-kit', 'store'],
      reuse: true
    }
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ClientRoutingModule {
}
