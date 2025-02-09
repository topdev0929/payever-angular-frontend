import { Injectable } from '@angular/core';
import {
  PePlatformHeaderItem
} from '@pe/platform-header';
import { Observable } from 'rxjs';

import { FinexpHeaderAbstractService } from '../../../modules/finexp-editor/src/deprecated/services';
import { PanelType, CheckoutInterface } from '../../../modules/finexp-editor/src/deprecated/interfaces';

@Injectable()
export class HeaderService implements FinexpHeaderAbstractService {

  setHeader(checkout: CheckoutInterface, activeView: PanelType): void {}

  setShortHeader(titleKey: string, onCancel: () => void, extraButtons: PePlatformHeaderItem[] = []): void {}

  setShortHeaderWithDropdownMenu(titleKey: string, menuItems: PePlatformHeaderItem[],
                                 onCancel: () => void, loading$: Observable<boolean> = null): void {}

  hideHeader(): void {}
}
