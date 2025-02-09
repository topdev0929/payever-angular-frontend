import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebIsSameColorPipe, PebRGBCssPipe } from './color.pipe';
import { PebCurrencyFormatterPipe } from './currency-formatter.pipe';
import { PebCurrencySignPipe } from './currency-sign.pipe';
import { PebPriceWithCurrencyPipe } from './price-with-currency.pipe';
import { PebRendererTranslatePipe } from './renderer-translate.pipe';
import { PebSafeHtmlPipe } from './safe-html.pipe';
import { PebSafeUrlPipe } from './safe-url.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PebRendererTranslatePipe,
    PebCurrencyFormatterPipe,
    PebCurrencySignPipe,
    PebPriceWithCurrencyPipe,
    PebRendererTranslatePipe,
    PebSafeHtmlPipe,
    PebSafeUrlPipe,
    PebIsSameColorPipe,
    PebRGBCssPipe,
  ],
  exports: [
    PebRendererTranslatePipe,
    PebCurrencyFormatterPipe,
    PebCurrencySignPipe,
    PebPriceWithCurrencyPipe,
    PebRendererTranslatePipe,
    PebSafeHtmlPipe,
    PebSafeUrlPipe,
    PebIsSameColorPipe,
    PebRGBCssPipe,
  ],
})
export class PebPipesModule {
}
