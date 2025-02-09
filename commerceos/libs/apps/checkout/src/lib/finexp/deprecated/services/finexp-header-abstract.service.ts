import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PePlatformHeaderItem } from '@pe/platform-header';

import { PanelType, CheckoutInterface } from '../interfaces';

@Injectable()
export abstract class FinexpHeaderAbstractService {

  abstract setHeader(checkout: CheckoutInterface, activeView: PanelType): void;

  abstract setShortHeader(titleKey: string, onCancel: () => void, extraButtons?: PePlatformHeaderItem[]): void;

  abstract setShortHeaderWithDropdownMenu(
    titleKey: string,
    menuItems: PePlatformHeaderItem[],
    onCancel: () => void, loading$?: Observable<boolean>
  ): void;

  abstract hideHeader(): void;
}
