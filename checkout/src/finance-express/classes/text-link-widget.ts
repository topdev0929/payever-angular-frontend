/* tslint:disable */
import { TextLinkWidgetSettingsInterface } from '../interfaces';
import { AbstractWidget } from './abstract-widget';

export class TextLinkWidget extends AbstractWidget {

  /**
   * @deprecated try not to use static
   */
  static calcWidth() {
    return super.calcWidth(this.prototype.settings.width);
  }

  /**
   * @deprecatedtry not to use static
   */
  static dynamicStyleSheet(): string {
    const settings: TextLinkWidgetSettingsInterface = this.prototype.settings;

    return `
    .payever-finance-express.payever-text-link{width:${this.calcWidth()};text-align:${settings.alignment}}
    .payever-finance-express.payever-text-link .payever-outer{height:${settings.height}px;line-height:${settings.height}px;}
    .payever-finance-express.payever-text-link .payever-text{color:${settings.linkColor};font-size:${settings.textSize}}`;
  }

  constructor(element: HTMLElement) {
    // {
    //   // Hack: trick Babel/TypeScript into allowing this before super.
    //   if (false) { super(); }
    //   let thisFn = (() => { return this; }).toString();
    //   let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
    //   eval(`${thisName} = this;`);
    // }

    super(element);
    this.element = element;

    this.element.innerHTML = `<div class="payever-outer">${this.payLink.getHTML('payever-text')}</div><div class="payever-description"></div>`;
    this.payLink.addEventListener('a');
  }

  update(): void {
    const url: string = this.payLink.url();
    const title: string = this.payLink.title();
    this.element.querySelector('.payever-text').setAttribute('href', url);
    this.element.querySelector('.payever-text').setAttribute('title', title);
    this.element.querySelector('.payever-text').innerHTML = this.content.messages.link.text;
    this.element.querySelector('.payever-description').innerHTML = this.content.messages.link.effective_rate;
  }

  initType(): void {
    this.type = 'text-link';
  }
}
