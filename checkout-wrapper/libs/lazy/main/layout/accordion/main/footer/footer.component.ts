import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { merge, Observable } from 'rxjs';
import { map, scan, shareReplay } from 'rxjs/operators';

import { ParamsState, SettingsState } from '@pe/checkout/store';
import { CheckoutStateParamsInterface, FlowInterface, CheckoutSettingsInterface } from '@pe/checkout/types';

interface ViewModel {
  cancelButtonText: string;
  isDefault: boolean;
}

@Component({
  selector: 'layout-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionFooterComponent implements OnInit {

  @Select(ParamsState.params) public params$: Observable<CheckoutStateParamsInterface>;

  @Select(SettingsState.settings) private settings$: Observable<CheckoutSettingsInterface>;

  @Input() flow: FlowInterface;

  @Input() embedFinish: boolean;

  @Input() showCancel: boolean;

  @Input() asCustomElement: boolean;

  vm$: Observable<Partial<ViewModel>>;

  translations = {
    payeverHref: $localize `:@@layout.footer.links.payever_href:`,
    copyrightHref: $localize `:@@layout.footer.links.copyright_href:`,
    imprintHref: $localize `:@@layout.footer.links.imprint_href:`,
    agreementHref: $localize `:@@layout.footer.links.agreement_href:`,
    protectionHref: $localize `:@@layout.footer.links.protection_href:`,
    mailtoSupportHref: $localize `:@@layout.footer.links.mailto_support_href:`,
  };

  ngOnInit(): void {
    const cancelText$ = this.settings$.pipe(
      map(settings => ({ cancelButtonText: $localize`:@@layout.footer.action.cancel:${settings?.name}:checkoutName:` })),
    );

    const isDefault$ = this.settings$.pipe(
      map(({ styles }) => ({ isDefault: !styles?.active })),
    );

    this.vm$ = merge(
      cancelText$,
      isDefault$,
    ).pipe(
      scan((acc, curr) => ({ ...acc, ...curr }) as ViewModel),
      shareReplay(1),
    );
  }
}
