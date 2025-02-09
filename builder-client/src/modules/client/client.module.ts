import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';

import { ViewerModule as PeViewerModule } from '@pe/builder-editor/projects/modules/viewer/src';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AbbreviationPipe } from '@pe/ng-kit/modules/common';
import { FormModule } from '@pe/ng-kit/modules/form';
import { I18nModule, TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { ServerSideRenderingModule } from '@pe/ng-kit/modules/server-side-rendering';
import { SnackBarModule } from '@pe/ng-kit/modules/snack-bar';
import { CheckoutModule } from '../checkout/checkout.module';
import { ClientRoutingModule } from './client-routing.module';
import { ContainerComponent, NotFoundComponent } from './components';
import { CookieBarComponent } from './components/cookie-bar/cookie-bar.component';
import { LockedStoreComponent } from './components/locked-store/locked-store.component';
import { PasswordDialogComponent } from './components/password-dialog/password-dialog.component';
import { AppIdGuard, PasswordGuard } from './guards';
import { ClientStateResolver } from './resolvers';
import { ClientLauncherService } from '../../app/services';
import { PasswordControlService } from './services';

@NgModule({
  imports: [
    CommonModule,
    ClientRoutingModule,
    PeViewerModule,
    I18nModule,
    ServerSideRenderingModule,
    CheckoutModule,
    SnackBarModule,
    MediaModule,
    MatExpansionModule,
    FormsModule,
    FormModule,
    MatInputModule,
  ],
  declarations: [
    ContainerComponent,
    NotFoundComponent,
    CookieBarComponent,
    PasswordDialogComponent,
    LockedStoreComponent,
  ],
  providers: [
    AppIdGuard,
    ClientStateResolver,
    ClientLauncherService,
    PasswordGuard,
    PasswordControlService,
    AuthService,
    AbbreviationPipe,
    TranslateService,
  ],
})
export class BuilderClientModule {
}
