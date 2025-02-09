import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { DialogModule as NgKitDialogModule } from '@pe/checkout/dialog';
import { UiModule } from '@pe/checkout/ui';
import { ElementOverlayContainer } from '@pe/checkout/ui/overlay';
import { UtilsModule } from '@pe/checkout/utils';

import {
  DefaultDialogComponent,
  FormOptionsErrorComponent,
  SectionContainerComponent,
  PaymentSectionsComponent,
} from './components';
import {
  FixFileLinksDirective }
from './directives';
import {
  FormOptionsLabelPipe,
  TranslatedFormOptionsLabelPipe,
  MaskLeftPipe,
} from './pipes';
import {
  LinkFixerService,
  GermanPhoneService,
  SectionContainerService, PrepareDataService,
} from './services';


@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    NgKitDialogModule,
    MatButtonModule,
    UtilsModule,
    UiModule,
  ],
  declarations: [
    DefaultDialogComponent,
    FormOptionsErrorComponent,
    SectionContainerComponent,
    PaymentSectionsComponent,
    FormOptionsLabelPipe,
    TranslatedFormOptionsLabelPipe,
    FixFileLinksDirective,
    MaskLeftPipe,
  ],
  exports: [
    DefaultDialogComponent,
    FormOptionsErrorComponent,
    SectionContainerComponent,
    PaymentSectionsComponent,
    FormOptionsLabelPipe,
    TranslatedFormOptionsLabelPipe,
    FixFileLinksDirective,
    MaskLeftPipe,
  ],
  providers: [
    LinkFixerService,
    GermanPhoneService,
    SectionContainerService,
    PrepareDataService,
    {
      provide: OverlayContainer,
      useClass: ElementOverlayContainer,
    },
  ],
})
export class FormUtilsModule {
}
