import { Injectable } from '@angular/core';

import { PePlatformHeaderItem } from '@pe/platform-header';

@Injectable()
export abstract class FinexpHeaderAbstractService {

  abstract setShortHeader(
    titleKey: string,
    onCancel: () => void,
    extraLeftButtons?: PePlatformHeaderItem[],
    extraRightButtons?: PePlatformHeaderItem[]
  ): void;
}
