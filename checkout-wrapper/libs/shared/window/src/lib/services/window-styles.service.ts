import { Injectable } from '@angular/core';

import {
  CheckoutStyleInterface,
  LogoAlignmentType,
} from '@pe/checkout/types';

import { ScreenTypeEnum } from './window-enum';
import { WindowSizeInterface } from './window-sizes.service';

type HeaderSuffixType = 'Height'
type LogoSuffixType = 'Alignment'
  | 'Width'
  | 'Height'
  | 'PaddingTop'
  | 'PaddingBottom'
  | 'PaddingRight'
  | 'PaddingLeft'

type StylePrefixType = 'businessLogo' | 'businessHeader'
type StyleSuffixType<T> = [T] extends ['businessLogo'] ? LogoSuffixType : HeaderSuffixType

@Injectable()
export class WindowStylesService {

  public matchStyle<T extends StylePrefixType>(
    stylePrefix: T,
    styleSuffix: StyleSuffixType<T>,
    windowSizeInfo: WindowSizeInterface,
    styles: CheckoutStyleInterface
  ) {
    const screenTypeIxd = Object.values(ScreenTypeEnum)
      .findIndex(screen => screen === windowSizeInfo.matchedScreenType);

    const matched = Object.values(ScreenTypeEnum)
      .slice(screenTypeIxd)
      .map(screen => this.getStyles(stylePrefix, styleSuffix, screen, styles))
      .find(style => !!style || style === 0);

    return typeof matched === 'number'
      ? `${matched}px`
      : matched;
  }

  public businessLogoAlignment(windowSizeInfo: WindowSizeInterface, styles: CheckoutStyleInterface)
    : LogoAlignmentType {
    const matched = this.matchStyle('businessLogo', 'Alignment', windowSizeInfo, styles) as LogoAlignmentType;

    return matched
      || (windowSizeInfo.isMobile ? 'center' : 'left');
  }

  private getStyles<T extends StylePrefixType>(
    stylePrefix: T,
    styleSuffix: StyleSuffixType<T>,
    screenType: ScreenTypeEnum,
    styles: CheckoutStyleInterface
  ) {
    return styles?.[`${stylePrefix}${screenType}${styleSuffix}` as keyof Omit<CheckoutStyleInterface, 'active'>];
  }
}
