/* tslint:disable */

import { ButtonWidgetSettingsInterface } from '../interfaces/index';
import { AbstractWidget } from './abstract-widget';

export class ButtonWidget extends AbstractWidget {

  element:HTMLElement;

  /**
   * @deprecated
   */
  static calcWidth() {
    return super.calcWidth(this.prototype.settings.width);
  }

  /**
   * @deprecated
   */
  static calcBorderRadius() {
    const settings: ButtonWidgetSettingsInterface = this.prototype.settings as ButtonWidgetSettingsInterface;

    let height: number;
    if (typeof settings.height === 'string') {
      height = parseInt((settings.height as string).replace('px', ''));
    } else {
      height = settings.height;
    }

    switch (settings.corners) {
      case 'circle': return height / 2;
      case 'round': return 10;
      case 'square': return 0;
    }
  }

  static dynamicStyleSheet() {
    const settings: ButtonWidgetSettingsInterface = this.prototype.settings as ButtonWidgetSettingsInterface;
    return `
    .payever-finance-express.payever-button{width:${this.calcWidth()}}
    .payever-finance-express.payever-button button{
      background:${settings.buttonColor};
      border-radius:${this.calcBorderRadius()}px;
      color:${settings.textColor};
      font-size:${settings.textSize};
      height:${settings.height}px;
      line-height:${settings.height}px;
      text-align:${settings.alignment}
    }`;
  }

  constructor(element: HTMLElement) {
    super(element);
    this.element = element;
    this.element.innerHTML = `<button data-href="${this.payLink.url()}" data-target="overlay" title="${this.payLink.title()}">
      <svg height="20" width="22">
        <path d="M11.4298851,0 C11.3287356,0.609137056 11.4298851,1.31979695 11.5310345,1.82741117 C11.7333333,2.53807107 12.137931,3.04568528 13.3517241,4.67005076 C14.6666667,6.29441624 15.0712644,6.9035533 15.3747126,7.81725888 C15.5770115,8.52791878 15.6781609,8.93401015 15.4758621,9.54314721 C16.5885057,9.74619289 18.4091954,10.3553299 19.6229885,11.0659898 C20.7356322,11.7766497 21.5448276,12.6903553 21.8482759,13.6040609 C22.0505747,14.1116751 22.0505747,14.9238579 21.8482759,15.4314721 C21.645977,15.9390863 21.4436782,16.3451777 21.0390805,16.751269 C19.5218391,18.3756345 16.6896552,19.4923858 13.1494253,19.8984772 C12.3402299,20 10.4183908,20 9.81149425,20 C5.15862069,19.6954315 1.31494253,18.071066 0.303448276,15.8375635 C-0.101149425,14.9238579 -0.101149425,14.1116751 0.303448276,13.1979695 C0.708045977,12.4873096 1.71954023,11.4720812 3.03448276,10.8629442 C4.24827586,10.2538071 5.36091954,9.84771574 6.57471264,9.54314721 C6.67586207,10.3553299 8.19310345,12.284264 8.69885057,12.893401 C9.81149425,14.3147208 10.216092,15.0253807 10.5195402,15.6345178 C10.7218391,15.9390863 10.8229885,16.142132 10.7218391,16.8527919 C10.7218391,16.8527919 11.1264368,16.4467005 11.3287356,16.142132 C11.5310345,15.7360406 11.6321839,15.3299492 11.5310345,14.7208122 C11.5310345,14.0101523 11.3287356,13.6040609 11.0252874,12.9949239 C10.7218391,12.3857868 10.3172414,11.6751269 9.40689655,10.6598985 C8.3954023,9.03553299 7.9908046,8.22335025 7.78850575,7.20812183 C7.5862069,6.09137056 7.88965517,4.7715736 8.59770115,4.16243655 C8.69885057,4.06091371 9.00229885,3.95939086 9.00229885,3.95939086 L9.00229885,4.56852792 C9.00229885,5.27918782 9.10344828,5.68527919 9.40689655,6.1928934 C9.71034483,6.9035533 10.216092,7.51269036 11.6321839,9.23857868 C12.9471264,10.7614213 13.3517241,11.5736041 13.3517241,12.4873096 L13.3517241,12.9949239 C13.3517241,12.9949239 13.6551724,12.6903553 13.8574713,12.4873096 C14.3632184,11.7766497 14.4643678,10.5583756 14.0597701,9.54314721 C13.7563218,8.83248731 13.3517241,8.22335025 12.137931,6.59898477 C10.8229885,4.97461929 10.3172414,3.75634518 10.3172414,2.63959391 C10.3172414,1.52284264 10.5195402,0.609137056 11.4298851,0 L11.4298851,0 Z" fill="currentColor"></path>
      </svg>
      <span></span>
      </button>
      <div></div>`;
    this.payLink.addEventListener('button');
  }

  update(): void {
    const url: string = this.payLink.url();
    const title: string = this.payLink.title();
    this.element.querySelector('button').setAttribute('data-href', url);
    this.element.querySelector('button').setAttribute('title', title);
    this.element.querySelector('button span').innerHTML = this.content.messages.button.text;
    this.element.querySelector('div').innerHTML = this.content.messages.button.effective_rate;
  }

  initType(): void {
    this.type = 'button';
  }
}
