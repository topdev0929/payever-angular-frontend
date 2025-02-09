/* tslint:disable */
import { BaseWidgetSettingsInterface, WidgetType } from '../interfaces';
import { addClass, removeClass } from '../helpers';
import { PayLink } from './pay-link';

export abstract class AbstractWidget {

  abstract update(): void;

  static dataTypes = ['demo', 'code', 'name', 'price'];// , 'currency'];

  element: HTMLElement;
  payLink: PayLink;
  dataTypes: string[];
  linkTo: string;
  settings: BaseWidgetSettingsInterface;
  content: any;
  type: WidgetType;

  static calcWidth(width) {
    if (this.prototype.settings.adaptiveDesign) {
      return 'auto';
    } else {
      return `${width}px`;
    }
  }

  constructor(element: HTMLElement) {
    this.element = element;
    this.initType();
    addClass(this.element, 'payever-widget');

    AbstractWidget.dataTypes.forEach((attr: string) => {
      this[attr] = this.element.getAttribute(`data-${attr}`);
    });

    this.payLink = new PayLink(this.settings, this.element, this.type);
    this.payLink.setData(this);
  }

  setLinkTo(linkTo: any) {
    this.linkTo = linkTo;
    return this.payLink.setLinkTo(this.linkTo);
  }

  setContent(content: any) {
    this.content = content;
    return this.update();
  }

  initType(): void {
    this.type = null;
  }

  getType(): any {
    return this.type;
  }

  destroy() {
    this.element.innerHTML = '';
    return removeClass(this.element, 'payever-widget');
  }
}
